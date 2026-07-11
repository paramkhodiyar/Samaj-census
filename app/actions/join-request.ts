'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// Action: Submit a Join/Enrollment Request
export async function submitJoinRequestAction(data: {
  fullName: string;
  mobileNumber: string;
  email: string;
  country: string;
  city: string;
  indiaHometown: string;
  kutchVillage: string;
}) {
  const { fullName, mobileNumber, email, country, city, indiaHometown, kutchVillage } = data;

  if (!fullName || !mobileNumber || !email || !country || !city || !kutchVillage) {
    return { error: 'All fields are required.' };
  }

  try {
    // 1. Check if the mobile number is already in Join Requests (Pending/Approved)
    const existingRequest = await prisma.joinRequest.findFirst({
      where: { mobileNumber },
    });

    if (existingRequest) {
      if (existingRequest.status === 'PENDING') {
        return { error: 'An enrollment request with this mobile number is already pending review.' };
      }
      if (existingRequest.status === 'APPROVED') {
        return { error: 'This mobile number has already been approved. Please proceed to registration.' };
      }
    }

    // 2. Check if mobile number is already in the main Family database
    const existingFamily = await prisma.family.findFirst({
      where: { mobile: mobileNumber },
    });
    if (existingFamily) {
      return { error: 'This mobile number is already registered in our census records. You can sign in directly.' };
    }

    const existingMember = await prisma.member.findFirst({
      where: { mobile: mobileNumber },
    });
    if (existingMember) {
      return { error: 'This mobile number is registered as a family member. Please contact your Family Head to log in.' };
    }

    // 3. Create the join request
    await prisma.joinRequest.create({
      data: {
        fullName,
        mobileNumber,
        email,
        country,
        city,
        indiaHometown,
        kutchVillage,
        status: 'PENDING',
      },
    });

    // Write audit log
    await prisma.auditLog.create({
      data: {
        action: 'SUBMIT_JOIN_REQUEST',
        description: `Join request submitted by ${fullName} (${mobileNumber}) from ${city}, ${country}.`,
      },
    });

    return { success: true };
  } catch (error: any) {
    console.error('Submit join request error:', error);
    return { error: 'Failed to submit enrollment request. Please try again.' };
  }
}

// Action: Approve Join Request
export async function approveJoinRequestAction(requestId: string, verifierId: string) {
  try {
    const verifier = await prisma.user.findUnique({
      where: { id: verifierId },
    });

    if (!verifier || (verifier.role !== 'NRI_ADMIN' && verifier.role !== 'SUPER_ADMIN')) {
      return { error: 'Unauthorized to approve join requests.' };
    }

    const request = await prisma.joinRequest.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      return { error: 'Join request not found.' };
    }

    if (request.status !== 'PENDING') {
      return { error: 'This request has already been processed.' };
    }

    // Generate NRI Family ID
    const lastFamily = await prisma.family.findFirst({
      where: { familyId: { startsWith: 'KG-NRI-' } },
      orderBy: { familyId: 'desc' },
    });

    let nextIndex = 1;
    if (lastFamily) {
      const match = lastFamily.familyId.match(/KG-NRI-(\d+)/);
      if (match) {
        nextIndex = parseInt(match[1], 10) + 1;
      }
    }
    const familyId = `KG-NRI-${String(nextIndex).padStart(5, '0')}`;

    // Create the Family and Member record in a transaction
    await prisma.$transaction(async (tx) => {
      // 1. Create Family
      const family = await tx.family.create({
        data: {
          familyId,
          headName: request.fullName,
          mobile: request.mobileNumber,
          country: request.country,
          city: request.city,
          indiaHometown: request.indiaHometown,
          kutchVillage: request.kutchVillage,
          address: `${request.city}, ${request.country}`,
          nativeVillage: request.kutchVillage,
        },
      });

      // 2. Create the Head Member
      await tx.member.create({
        data: {
          familyId: family.id,
          name: request.fullName,
          relation: 'Head',
          age: 35, // Default placeholder
          occupation: 'Please Update',
          education: 'Please Update',
          bloodGroup: 'Please Update',
          mobile: request.mobileNumber,
          email: request.email,
          gender: 'MALE',
          maritalStatus: 'SINGLE',
        },
      });

      // 3. Mark request as Approved
      await tx.joinRequest.update({
        where: { id: requestId },
        data: { status: 'APPROVED' },
      });
    });

    // Write audit log
    await prisma.auditLog.create({
      data: {
        action: 'APPROVE_JOIN_REQUEST',
        description: `Approved join request for ${request.fullName}. Created Family ID: ${familyId}.`,
        userId: verifierId,
      },
    });

    revalidatePath('/dashboard/join-requests');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error: any) {
    console.error('Approve join request error:', error);
    return { error: 'Failed to approve request. Please try again.' };
  }
}

// Action: Reject Join Request
export async function rejectJoinRequestAction(requestId: string, verifierId: string) {
  try {
    const verifier = await prisma.user.findUnique({
      where: { id: verifierId },
    });

    if (!verifier || (verifier.role !== 'NRI_ADMIN' && verifier.role !== 'SUPER_ADMIN')) {
      return { error: 'Unauthorized to reject join requests.' };
    }

    const request = await prisma.joinRequest.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      return { error: 'Join request not found.' };
    }

    if (request.status !== 'PENDING') {
      return { error: 'This request has already been processed.' };
    }

    await prisma.joinRequest.update({
      where: { id: requestId },
      data: { status: 'REJECTED' },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        action: 'REJECT_JOIN_REQUEST',
        description: `Rejected join request for ${request.fullName} (${request.mobileNumber}).`,
        userId: verifierId,
      },
    });

    revalidatePath('/dashboard/join-requests');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error: any) {
    console.error('Reject join request error:', error);
    return { error: 'Failed to reject request. Please try again.' };
  }
}
