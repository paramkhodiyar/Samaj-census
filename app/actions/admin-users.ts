'use server';

import { prisma } from '@/lib/prisma';
import { getAuthSession } from '@/lib/auth';
import { Role } from '@prisma/client';
import { revalidatePath } from 'next/cache';

export interface UpdateUserRoleParams {
  targetUserId: string;
  newRole: Role;
  ghatakId?: string | null;
  pradeshikId?: string | null;
}

/**
 * Updates a user's system role and administrative jurisdiction (Ghatak/Pradeshik).
 * Restricted strictly to SUPER_ADMIN.
 */
export async function updateUserRoleAction(params: UpdateUserRoleParams) {
  const session = await getAuthSession();
  if (!session) {
    return { error: 'You must be signed in to perform this action.' };
  }

  // Server-side Super Admin check
  if (session.role !== 'SUPER_ADMIN') {
    return { error: 'Unauthorized: Only Super Administrators can modify user roles.' };
  }

  const { targetUserId, newRole, ghatakId, pradeshikId } = params;

  if (!targetUserId || !newRole) {
    return { error: 'Target user ID and new role are required.' };
  }

  // Validate jurisdiction requirement
  if (newRole === 'GHATAK_ADMIN' && !ghatakId) {
    return { error: 'Please select a valid Ghatak for the Ghatak Administrator.' };
  }
  if (newRole === 'PRADESHIK_ADMIN' && !pradeshikId) {
    return { error: 'Please select a valid Pradeshik region for the Pradeshik Administrator.' };
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      include: { ghatak: true, pradeshik: true },
    });

    if (!existingUser) {
      return { error: 'Target user record not found.' };
    }

    // Fetch target Ghatak / Pradeshik names for audit log & messaging
    let ghatakName = '';
    let pradeshikName = '';

    if (newRole === 'GHATAK_ADMIN' && ghatakId) {
      const g = await prisma.ghatak.findUnique({ where: { id: ghatakId } });
      ghatakName = g ? g.name : '';
    }

    if (newRole === 'PRADESHIK_ADMIN' && pradeshikId) {
      const p = await prisma.pradeshik.findUnique({ where: { id: pradeshikId } });
      pradeshikName = p ? p.name : '';
    }

    // Update user role & jurisdiction
    const updatedUser = await prisma.user.update({
      where: { id: targetUserId },
      data: {
        role: newRole,
        ghatakId: newRole === 'GHATAK_ADMIN' ? ghatakId : null,
        pradeshikId: newRole === 'PRADESHIK_ADMIN' ? pradeshikId : null,
      },
    });

    // Write audit log
    const jurisdictionText =
      newRole === 'GHATAK_ADMIN'
        ? ` (${ghatakName} Ghatak)`
        : newRole === 'PRADESHIK_ADMIN'
        ? ` (${pradeshikName} Pradeshik)`
        : '';

    await prisma.auditLog.create({
      data: {
        action: 'ROLE_CHANGE',
        description: `Role changed for ${existingUser.mobileNumber} from ${existingUser.role} to ${newRole}${jurisdictionText}`,
        userId: session.userId,
      },
    });

    revalidatePath('/dashboard/admin/users');

    return {
      success: true,
      message: `Updated role for ${existingUser.mobileNumber} to ${newRole}${jurisdictionText}.`,
    };
  } catch (error: any) {
    console.error('Error updating user role:', error);
    return { error: 'Failed to update user role. Please try again.' };
  }
}
