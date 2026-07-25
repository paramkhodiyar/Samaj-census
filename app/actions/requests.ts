'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { getAuthSession } from '@/lib/auth';
import { normalizeMobile } from '@/lib/utils';

// Action: Submit Multi-step Family Update Request
export async function submitCorrectionRequest(
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
    memberCorrections?: Array<{
      memberId: string;
      fieldName: string;
      oldValue: string;
      newValue: string;
    }>;
    otherCorrections?: string;
  }
) {
  try {
    const session = await getAuthSession();
    if (!session) {
      return { error: 'UNAUTHENTICATED' };
    }
    const requesterId = session.userId;

    const user = await prisma.user.findUnique({
      where: { id: requesterId },
    });

    if (!user || !user.familyId) {
      return { error: 'No linked family record found.' };
    }
    const familyId = user.familyId;

    const family = await prisma.family.findUnique({
      where: { id: familyId },
    });

    if (!family) {
      return { error: 'Family not found' };
    }

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

    const request = await prisma.updateRequest.create({
      data: {
        familyId,
        requesterId,
        type: requestType,
        status: 'PENDING',
        comments: wizardData.otherCorrections || null,
      },
    });

    const changesToCreate: any[] = [];

    if (wizardData.familyInfo) {
      const info = wizardData.familyInfo;
      const compareFields: Array<'address' | 'nativeVillage' | 'mobile'> = ['address', 'nativeVillage', 'mobile'];
      
      for (const field of compareFields) {
        if (info[field] !== undefined && info[field] !== family[field]) {
          changesToCreate.push({
            requestId: request.id,
            action: 'UPDATE_FIELD',
            tableName: 'Family',
            recordId: family.id,
            fieldName: field,
            oldValue: family[field] || '',
            newValue: info[field] || '',
          });
        }
      }
    }

    if (wizardData.addMembers && wizardData.addMembers.length > 0) {
      for (const m of wizardData.addMembers) {
        if (Number(m.age) < 18 && (m.mobile || m.email)) {
          return { error: 'Children under 18 years of age cannot have independent mobile numbers or email addresses.' };
        }
        changesToCreate.push({
          requestId: request.id,
          action: 'ADD_MEMBER',
          tableName: 'Member',
          newValue: JSON.stringify(m),
        });
      }
    }

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

    if (wizardData.memberCorrections && wizardData.memberCorrections.length > 0) {
      for (const mc of wizardData.memberCorrections) {
        changesToCreate.push({
          requestId: request.id,
          action: 'UPDATE_FIELD',
          tableName: 'Member',
          recordId: mc.memberId,
          fieldName: mc.fieldName,
          oldValue: mc.oldValue || '',
          newValue: mc.newValue || '',
        });
      }
    }

    if (changesToCreate.length > 0) {
      await prisma.requestChange.createMany({
        data: changesToCreate,
      });
    }

    let targetAdmins: any[] = [];
    if (family.ghatakId) {
      targetAdmins = await prisma.user.findMany({
        where: { role: 'GHATAK_ADMIN', ghatakId: family.ghatakId },
      });
    }
    if (targetAdmins.length === 0 && family.pradeshikId) {
      targetAdmins = await prisma.user.findMany({
        where: { role: 'PRADESHIK_ADMIN', pradeshikId: family.pradeshikId },
      });
    }
    if (targetAdmins.length === 0) {
      targetAdmins = await prisma.user.findMany({
        where: { role: 'SUPER_ADMIN' },
      });
    }

    for (const admin of targetAdmins) {
      await prisma.notification.create({
        data: {
          userId: admin.id,
          title: 'New Update Request',
          message: `Family ${family.familyId} (${family.headName}) has submitted an update request.`,
        },
      });
    }

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

export async function processCorrectionRequest(
  requestId: string,
  status: 'APPROVED' | 'REJECTED' | 'CORRECTION_REQUIRED',
  comments: string | null
) {
  try {
    const session = await getAuthSession();
    if (!session) {
      return { error: 'UNAUTHENTICATED' };
    }
    const verifierId = session.userId;

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

    if (verifier.role === 'GHATAK_ADMIN') {
      if (!request.family.ghatakId || verifier.ghatakId !== request.family.ghatakId) {
        return { error: 'OUT_OF_JURISDICTION' };
      }
    } else if (verifier.role === 'PRADESHIK_ADMIN') {
      if (!request.family.pradeshikId || verifier.pradeshikId !== request.family.pradeshikId) {
        return { error: 'OUT_OF_JURISDICTION' };
      }
    } else if (verifier.role === 'NRI_ADMIN') {
      if (!request.family.familyId.startsWith('KG-NRI-')) {
        return { error: 'OUT_OF_JURISDICTION' };
      }
    }

    if (status === 'APPROVED') {
      const familyMembers = await prisma.member.findMany({
        where: { familyId: request.familyId, isAlive: true },
      });

      let headBeingRemoved = false;
      let newHeadDesignated = false;

      for (const change of request.changes) {
        if ((change.action === 'REMOVE_MEMBER' || change.action === 'TRANSFER_MEMBER') && change.recordId) {
          const targetMember = familyMembers.find(m => m.id === change.recordId);
          if (targetMember && targetMember.relation === 'Head') {
            headBeingRemoved = true;
          }
        }
        if (change.action === 'UPDATE_FIELD' && change.fieldName === 'relation' && change.newValue === 'Head') {
          newHeadDesignated = true;
        }
      }

      if (headBeingRemoved && !newHeadDesignated) {
        const remainingCount = familyMembers.filter(m => m.isAlive).length;
        let removedCount = 0;
        for (const change of request.changes) {
          if ((change.action === 'REMOVE_MEMBER' || change.action === 'TRANSFER_MEMBER') && change.recordId) {
            removedCount++;
          }
        }
        if (remainingCount > removedCount) {
          return { error: 'HEAD_REASSIGNMENT_REQUIRED' };
        }
      }
    }

    await prisma.updateRequest.update({
      where: { id: requestId },
      data: {
        status,
        comments: comments || undefined,
      },
    });

    if (status === 'APPROVED') {
      for (const change of request.changes) {
        if (change.action === 'UPDATE_FIELD') {
          if (change.tableName === 'Family' && change.recordId && change.fieldName) {
            const ALLOWED_FAMILY_FIELDS = ['address', 'nativeVillage', 'mobile', 'city', 'country', 'kutchVillage', 'indiaHometown'];
            if (!ALLOWED_FAMILY_FIELDS.includes(change.fieldName)) {
              console.warn(`[SECURITY ALERT] Rejected mass-assignment on Family field: ${change.fieldName}`);
              continue;
            }

            await prisma.family.update({
              where: { id: change.recordId },
              data: {
                [change.fieldName]: change.newValue,
              },
            });

            await prisma.auditLog.create({
              data: {
                action: 'UPDATE_FIELD',
                description: `Changed ${change.fieldName} of Family ${request.family.familyId}: "${change.oldValue}" → "${change.newValue}"`,
                userId: verifierId,
              },
            });
          } else if (change.tableName === 'Member' && change.recordId && change.fieldName) {
            const ALLOWED_MEMBER_FIELDS = ['name', 'occupation', 'education', 'bloodGroup', 'mobile', 'email', 'gender', 'maritalStatus', 'age'];
            if (!ALLOWED_MEMBER_FIELDS.includes(change.fieldName)) {
              console.warn(`[SECURITY ALERT] Rejected mass-assignment on Member field: ${change.fieldName}`);
              continue;
            }

            let updateVal: any = change.newValue;
            if (change.fieldName === 'age') {
              updateVal = parseInt(change.newValue || '0', 10);
            }
            if (change.fieldName === 'mobile' && change.newValue) {
              updateVal = normalizeMobile(change.newValue);
            }

            await prisma.member.update({
              where: { id: change.recordId },
              data: {
                [change.fieldName]: updateVal,
              },
            });

            await prisma.auditLog.create({
              data: {
                action: 'UPDATE_FIELD',
                description: `Changed ${change.fieldName} of Member ${change.recordId}: "${change.oldValue}" → "${change.newValue}"`,
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
          await prisma.member.update({
            where: { id: change.recordId },
            data: {
              isAlive: false,
              removalReason: details.reason || 'Requested by family head',
              removedAt: new Date(),
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

    await prisma.notification.create({
      data: {
        userId: request.requesterId,
        title: `Request ${status}`,
        message: `Your census record update request has been ${status.toLowerCase().replace('_', ' ')}.${
          comments ? ` Comment: "${comments}"` : ''
        }`,
      },
    });

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

// Action: Export My Family Data (DPDP Act Data Portability)
export async function exportFamilyDataAction() {
  try {
    const session = await getAuthSession();
    if (!session) {
      return { error: 'UNAUTHENTICATED' };
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      include: {
        family: {
          include: {
            members: {
              where: { isAlive: true }
            }
          }
        }
      }
    });

    if (!user || !user.family) {
      return { error: 'No linked family record found.' };
    }

    // Write audit log
    await prisma.auditLog.create({
      data: {
        action: 'EXPORT_FAMILY_DATA',
        description: `Exported personal census data card under DPDP Act 2023.`,
        userId: session.userId,
      }
    });

    return { success: true, data: user.family };
  } catch (error) {
    console.error('Export family data error:', error);
    return { error: 'Failed to export family data.' };
  }
}

// Action: Request Account Deactivation (DPDP Act Erasure)
export async function requestDeactivationAction() {
  try {
    const session = await getAuthSession();
    if (!session) {
      return { error: 'UNAUTHENTICATED' };
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      include: { family: true }
    });

    if (!user || !user.family) {
      return { error: 'No linked family record found.' };
    }

    // Create deactivation update request
    const request = await prisma.updateRequest.create({
      data: {
        familyId: user.familyId!,
        requesterId: session.userId,
        type: 'OTHER',
        status: 'PENDING',
        comments: `Account Deactivation Request: The family head has requested account deactivation & census data erasure under DPDP Act 2023.`,
      }
    });

    // Notify Super Admins
    const superAdmins = await prisma.user.findMany({
      where: { role: 'SUPER_ADMIN' }
    });

    for (const admin of superAdmins) {
      await prisma.notification.create({
        data: {
          userId: admin.id,
          title: 'Account Deactivation Request',
          message: `Family ${user.family.familyId} (${user.family.headName}) requested account deactivation.`,
        }
      });
    }

    // Audit log
    await prisma.auditLog.create({
      data: {
        action: 'REQUEST_DEACTIVATION',
        description: `Requested account deactivation & census record erasure. Request ID: ${request.id}`,
        userId: session.userId,
      }
    });

    return { success: true };
  } catch (error) {
    console.error('Deactivation request error:', error);
    return { error: 'Failed to submit deactivation request.' };
  }
}

/**
 * Submits a quick single-member inline edit request.
 */
export async function submitSingleMemberQuickEditAction(params: {
  memberId: string;
  occupation: string;
  education: string;
  bloodGroup: string;
  mobile?: string;
  email?: string;
  isAlive: boolean;
}) {
  try {
    const session = await getAuthSession();
    if (!session) {
      return { error: 'UNAUTHENTICATED' };
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { familyId: true },
    });

    if (!user || !user.familyId) {
      return { error: 'No linked family record found.' };
    }

    const member = await prisma.member.findUnique({
      where: { id: params.memberId },
    });

    if (!member || member.familyId !== user.familyId) {
      return { error: 'Member not found or unauthorized.' };
    }

    const request = await prisma.updateRequest.create({
      data: {
        familyId: user.familyId,
        requesterId: session.userId,
        type: 'EDIT_INFO',
        status: 'PENDING',
        comments: `Quick inline edit for ${member.name}`,
      },
    });

    const changes: any[] = [];
    const fields = ['occupation', 'education', 'bloodGroup', 'mobile', 'email'] as const;

    for (const f of fields) {
      const newVal = (params[f] || '').trim();
      const oldVal = ((member[f] as string) || '').trim();
      if (newVal !== oldVal) {
        changes.push({
          requestId: request.id,
          action: 'UPDATE_FIELD',
          tableName: 'Member',
          recordId: member.id,
          fieldName: f,
          oldValue: JSON.stringify(oldVal),
          newValue: JSON.stringify(newVal),
        });
      }
    }

    if (params.isAlive !== member.isAlive) {
      changes.push({
        requestId: request.id,
        action: 'UPDATE_FIELD',
        tableName: 'Member',
        recordId: member.id,
        fieldName: 'isAlive',
        oldValue: JSON.stringify(member.isAlive),
        newValue: JSON.stringify(params.isAlive),
      });
    }

    if (changes.length > 0) {
      await prisma.requestChange.createMany({ data: changes });
    }

    revalidatePath('/dashboard/family');
    return { success: true, requestId: request.id };
  } catch (err: any) {
    console.error('Quick edit error:', err);
    return { error: 'Failed to submit member quick edit.' };
  }
}

