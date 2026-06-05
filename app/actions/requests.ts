'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// Action: Submit Multi-step Family Update Request
export async function submitCorrectionRequest(
  familyId: string,
  requesterId: string,
  wizardData: {
    familyInfo?: { address?: string; nativeVillage?: string; mobile?: string };
    addMembers?: Array<{
      name: string;
      relation: string;
      age: number;
      occupation: string;
      education: string;
      bloodGroup: string;
      mobile?: string;
      email?: string;
      gender: 'MALE' | 'FEMALE' | 'OTHER';
      maritalStatus?: string;
    }>;
    removeMembers?: Array<{
      memberId: string;
      memberName: string;
      reason: string;
    }>;
    transferMembers?: Array<{
      memberId: string;
      memberName: string;
      targetFamilyId: string;
      reason: string;
    }>;
    otherCorrections?: string;
    documents?: Array<{ name: string; fileUrl: string }>;
  }
) {
  try {
    // 1. Fetch current family details to compare fields
    const family = await prisma.family.findUnique({
      where: { id: familyId },
    });

    if (!family) {
      return { error: 'Family not found' };
    }

    // Determine primary request type based on the content of the request
    let requestType: 'ADD_MEMBER' | 'REMOVE_MEMBER' | 'TRANSFER_MEMBER' | 'EDIT_INFO' | 'OTHER' = 'EDIT_INFO';
    if (wizardData.addMembers && wizardData.addMembers.length > 0) {
      requestType = 'ADD_MEMBER';
    } else if (wizardData.removeMembers && wizardData.removeMembers.length > 0) {
      requestType = 'REMOVE_MEMBER';
    } else if (wizardData.transferMembers && wizardData.transferMembers.length > 0) {
      requestType = 'TRANSFER_MEMBER';
    } else if (wizardData.otherCorrections) {
      requestType = 'OTHER';
    }

    // 2. Create the UpdateRequest record
    const request = await prisma.updateRequest.create({
      data: {
        familyId,
        requesterId,
        type: requestType,
        status: 'PENDING',
        comments: wizardData.otherCorrections || null,
      },
    });

    const changesToCreate = [];

    // Step 1: Family Info updates
    if (wizardData.familyInfo) {
      const info = wizardData.familyInfo;
      if (info.address && info.address !== family.address) {
        changesToCreate.push({
          requestId: request.id,
          action: 'UPDATE_FIELD',
          tableName: 'Family',
          recordId: family.id,
          fieldName: 'address',
          oldValue: family.address || '',
          newValue: info.address,
        });
      }
      if (info.nativeVillage && info.nativeVillage !== family.nativeVillage) {
        changesToCreate.push({
          requestId: request.id,
          action: 'UPDATE_FIELD',
          tableName: 'Family',
          recordId: family.id,
          fieldName: 'nativeVillage',
          oldValue: family.nativeVillage || '',
          newValue: info.nativeVillage,
        });
      }
      if (info.mobile && info.mobile !== family.mobile) {
        changesToCreate.push({
          requestId: request.id,
          action: 'UPDATE_FIELD',
          tableName: 'Family',
          recordId: family.id,
          fieldName: 'mobile',
          oldValue: family.mobile,
          newValue: info.mobile,
        });
      }
    }

    // Step 2: Add Members
    if (wizardData.addMembers && wizardData.addMembers.length > 0) {
      for (const m of wizardData.addMembers) {
        changesToCreate.push({
          requestId: request.id,
          action: 'ADD_MEMBER',
          tableName: 'Member',
          newValue: JSON.stringify(m),
        });
      }
    }

    // Step 3: Remove Members
    if (wizardData.removeMembers && wizardData.removeMembers.length > 0) {
      for (const m of wizardData.removeMembers) {
        changesToCreate.push({
          requestId: request.id,
          action: 'REMOVE_MEMBER',
          tableName: 'Member',
          recordId: m.memberId,
          newValue: JSON.stringify({ reason: m.reason, name: m.memberName }),
        });
      }
    }

    // Step 4: Transfer Members
    if (wizardData.transferMembers && wizardData.transferMembers.length > 0) {
      for (const m of wizardData.transferMembers) {
        changesToCreate.push({
          requestId: request.id,
          action: 'TRANSFER_MEMBER',
          tableName: 'Member',
          recordId: m.memberId,
          newValue: JSON.stringify({ targetFamilyId: m.targetFamilyId, reason: m.reason, name: m.memberName }),
        });
      }
    }

    // Step 5: Documents
    if (wizardData.documents && wizardData.documents.length > 0) {
      for (const doc of wizardData.documents) {
        await prisma.document.create({
          data: {
            requestId: request.id,
            name: doc.name,
            fileUrl: doc.fileUrl,
          },
        });
      }
    }

    // Create all change logs in the DB
    if (changesToCreate.length > 0) {
      await prisma.requestChange.createMany({
        data: changesToCreate,
      });
    }

    // Create notification for Ghatak Admins
    const admins = await prisma.user.findMany({
      where: {
        role: 'GHATAK_ADMIN',
        ghatakId: family.ghatakId,
      },
    });

    for (const admin of admins) {
      await prisma.notification.create({
        data: {
          userId: admin.id,
          title: 'New Update Request',
          message: `Family ${family.familyId} (${family.headName}) has submitted an update request.`,
        },
      });
    }

    // Audit log
    await prisma.auditLog.create({
      data: {
        action: 'SUBMIT_REQUEST',
        description: `Submitted update request of type ${requestType} for Family ${family.familyId}.`,
        userId: requesterId,
      },
    });

    revalidatePath('/dashboard/requests');
    revalidatePath('/dashboard');
    return { success: true, requestId: request.id };
  } catch (error: any) {
    console.error('Submit request error:', error);
    return { error: 'Failed to submit update request. Please try again.' };
  }
}

// Action: Approve, Reject, or Request Correction
export async function processCorrectionRequest(
  requestId: string,
  status: 'APPROVED' | 'REJECTED' | 'CORRECTION_REQUIRED',
  comments: string | null,
  verifierId: string
) {
  try {
    const request = await prisma.updateRequest.findUnique({
      where: { id: requestId },
      include: { changes: true, family: true },
    });

    if (!request) {
      return { error: 'Request not found' };
    }

    const verifier = await prisma.user.findUnique({
      where: { id: verifierId },
    });

    if (!verifier || verifier.role === 'USER') {
      return { error: 'Unauthorized to process requests' };
    }

    // Update Request Status
    await prisma.updateRequest.update({
      where: { id: requestId },
      data: {
        status,
        comments: comments || undefined,
      },
    });

    // If APPROVED, apply all changes to Families / Members
    if (status === 'APPROVED') {
      for (const change of request.changes) {
        if (change.action === 'UPDATE_FIELD') {
          if (change.tableName === 'Family' && change.recordId && change.fieldName) {
            await prisma.family.update({
              where: { id: change.recordId },
              data: {
                [change.fieldName]: change.newValue,
              },
            });

            // Write change audit log
            await prisma.auditLog.create({
              data: {
                action: 'UPDATE_FIELD',
                description: `Changed ${change.fieldName} of Family ${request.family.familyId}: "${change.oldValue}" → "${change.newValue}"`,
                userId: verifierId,
              },
            });
          }
        } else if (change.action === 'ADD_MEMBER') {
          const memberData = JSON.parse(change.newValue!);
          const newMember = await prisma.member.create({
            data: {
              familyId: request.familyId,
              name: memberData.name,
              relation: memberData.relation,
              age: Number(memberData.age),
              occupation: memberData.occupation,
              education: memberData.education,
              bloodGroup: memberData.bloodGroup,
              mobile: memberData.mobile || null,
              email: memberData.email || null,
              gender: memberData.gender,
              maritalStatus: memberData.maritalStatus || null,
            },
          });

          await prisma.auditLog.create({
            data: {
              action: 'ADD_MEMBER',
              description: `Added Member: ${newMember.name} (${newMember.relation}) to Family ${request.family.familyId}`,
              userId: verifierId,
            },
          });
        } else if (change.action === 'REMOVE_MEMBER' && change.recordId) {
          const details = JSON.parse(change.newValue!);
          // Respectfully soft delete by setting isAlive = false
          await prisma.member.update({
            where: { id: change.recordId },
            data: {
              isAlive: false,
            },
          });

          await prisma.auditLog.create({
            data: {
              action: 'REMOVE_MEMBER',
              description: `Removed Member: ${details.name} from Family ${request.family.familyId} (Reason: ${details.reason})`,
              userId: verifierId,
            },
          });
        } else if (change.action === 'TRANSFER_MEMBER' && change.recordId) {
          const details = JSON.parse(change.newValue!);
          // Find target family record
          const targetFamily = await prisma.family.findUnique({
            where: { familyId: details.targetFamilyId },
          });

          if (targetFamily) {
            await prisma.member.update({
              where: { id: change.recordId },
              data: {
                familyId: targetFamily.id,
              },
            });

            await prisma.auditLog.create({
              data: {
                action: 'TRANSFER_MEMBER',
                description: `Transferred Member: ${details.name} from Family ${request.family.familyId} to ${details.targetFamilyId}`,
                userId: verifierId,
              },
            });
          }
        }
      }
    }

    // Send notification to the requester
    await prisma.notification.create({
      data: {
        userId: request.requesterId,
        title: `Request ${status}`,
        message: `Your census record update request has been ${status.toLowerCase().replace('_', ' ')}.${
          comments ? ` Comment: "${comments}"` : ''
        }`,
      },
    });

    // Create Audit Log of request decision
    await prisma.auditLog.create({
      data: {
        action: `PROCESS_REQUEST_${status}`,
        description: `Processed request ${request.id} for Family ${request.family.familyId} with status ${status}.`,
        userId: verifierId,
      },
    });

    revalidatePath('/dashboard/requests');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    console.error('Process request error:', error);
    return { error: 'Failed to process request. Please try again.' };
  }
}
