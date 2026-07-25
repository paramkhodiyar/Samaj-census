'use server';

import { prisma } from '@/lib/prisma';
import { getAuthSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function createFamilyForUserAction(data: {
  headName: string;
  nativeVillage: string;
  address: string;
  mobile: string;
  email?: string;
  ghatakId?: string;
  pradeshikId?: string;
  members?: Array<{
    name: string;
    relation: string;
    age: number;
    gender: 'MALE' | 'FEMALE' | 'OTHER';
    occupation?: string;
    education?: string;
    bloodGroup?: string;
    mobile?: string;
  }>;
}) {
  try {
    const session = await getAuthSession();
    if (!session) {
      return { error: 'UNAUTHENTICATED' };
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
    });

    if (!user) {
      return { error: 'User account not found.' };
    }

    if (user.familyId) {
      return { error: 'Your account is already linked to a family census record.' };
    }

    // Generate unique Family ID
    const count = await prisma.family.count();
    const generatedFamilyCode = `KG-2026-${String(count + 101).padStart(5, '0')}`;

    // Get default Pradeshik & Ghatak if not specified
    let ghatakId = data.ghatakId;
    let pradeshikId = data.pradeshikId;

    if (!ghatakId || !pradeshikId) {
      const defaultGhatak = await prisma.ghatak.findFirst({
        include: { pradeshik: true },
      });
      if (defaultGhatak) {
        ghatakId = defaultGhatak.id;
        pradeshikId = defaultGhatak.pradeshikId;
      }
    }

    // Create Family & Member records in transaction
    const family = await prisma.$transaction(async (tx) => {
      const createdFamily = await tx.family.create({
        data: {
          familyId: generatedFamilyCode,
          headName: data.headName.trim(),
          nativeVillage: data.nativeVillage.trim(),
          address: data.address.trim(),
          mobile: data.mobile.trim(),
          ghatakId: ghatakId || null,
          pradeshikId: pradeshikId || null,
          members: {
            create: [
              // Create Head member
              {
                name: data.headName.trim(),
                relation: 'Head',
                age: 30, // Default age
                gender: 'MALE',
                occupation: 'Business',
                education: 'Graduate',
                bloodGroup: 'O+',
                mobile: data.mobile.trim(),
                email: user.email || data.email || null,
              },
              // Create additional family members if provided
              ...(data.members || []).map((m) => ({
                name: m.name.trim(),
                relation: m.relation,
                age: m.age || 25,
                gender: m.gender,
                occupation: m.occupation || 'Service',
                education: m.education || 'Graduate',
                bloodGroup: m.bloodGroup || 'O+',
                mobile: m.mobile || null,
              })),
            ],
          },
        },
      });

      // Link User to Family
      await tx.user.update({
        where: { id: user.id },
        data: { familyId: createdFamily.id },
      });

      return createdFamily;
    });

    // Record Audit Log
    await prisma.auditLog.create({
      data: {
        action: 'CREATE_FAMILY',
        description: `Family Head ${data.headName} created family profile ${family.familyId}`,
        userId: session.userId,
      },
    });

    revalidatePath('/dashboard');
    revalidatePath('/dashboard/family');

    return { success: true, familyId: family.id };
  } catch (error: any) {
    console.error('Create family error:', error);
    return { error: 'Failed to create family record. Please try again.' };
  }
}
