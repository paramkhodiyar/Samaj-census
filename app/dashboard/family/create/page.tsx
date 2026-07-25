import React from 'react';
import { prisma } from '@/lib/prisma';
import { getAuthSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import FamilyEnrollmentWizard from '@/components/FamilyEnrollmentWizard';

export default async function CreateFamilyPage() {
  const session = await getAuthSession();

  if (!session) {
    redirect('/login');
  }

  // Load User Details
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      email: true,
      mobileNumber: true,
      familyId: true,
    },
  });

  if (!user) {
    redirect('/login');
  }

  // If user already has a linked family, redirect directly to family profile view
  if (user.familyId) {
    redirect('/dashboard/family');
  }

  // Fetch Pradeshiks and Ghataks for community cluster selection
  const pradeshiks = await prisma.pradeshik.findMany({
    select: { id: true, name: true, code: true },
    orderBy: { name: 'asc' },
  });

  const ghataks = await prisma.ghatak.findMany({
    select: { id: true, name: true, code: true, pradeshikId: true },
    orderBy: { name: 'asc' },
  });

  return (
    <div className="py-4">
      <FamilyEnrollmentWizard
        userEmail={user.email}
        userMobile={user.mobileNumber}
        pradeshiks={pradeshiks}
        ghataks={ghataks}
      />
    </div>
  );
}
