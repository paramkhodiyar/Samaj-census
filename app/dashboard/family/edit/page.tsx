import React from 'react';
import { prisma } from '@/lib/prisma';
import { getAuthSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import EditFamilyWizard from '@/components/EditFamilyWizard';

export default async function FamilyEditPage() {
  const session = await getAuthSession();

  if (!session) {
    redirect('/login');
  }

  // Get active user and their linked family
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, familyId: true },
  });

  if (!user || !user.familyId) {
    redirect('/dashboard');
  }

  const family = await prisma.family.findUnique({
    where: { id: user.familyId },
    include: {
      members: {
        select: {
          id: true,
          name: true,
          relation: true,
          age: true,
          gender: true,
        },
      },
    },
  });

  if (!family) {
    redirect('/dashboard');
  }

  return (
    <div className="space-y-4">
      <EditFamilyWizard family={family} userId={user.id} />
    </div>
  );
}
