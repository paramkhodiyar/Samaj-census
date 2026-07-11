import React from 'react';
import { prisma } from '@/lib/prisma';
import { getAuthSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import JoinRequestsClient from './JoinRequestsClient';
import DashboardShell from '@/components/DashboardShell';

export default async function JoinRequestsPage() {
  const session = await getAuthSession();
  if (!session) {
    redirect('/login');
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
  });

  if (!user || (user.role !== 'NRI_ADMIN' && user.role !== 'SUPER_ADMIN')) {
    redirect('/dashboard');
  }

  const requests = await prisma.joinRequest.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return (
    <DashboardShell session={session}>
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg border border-[#E5DDD0] shadow-sm">
          <h1 className="text-xl font-serif font-bold text-[#8B5E3C] md:text-2xl">
            Family Enrollment Requests
          </h1>
          <p className="text-sm text-[#6A5B4D] mt-1">
            Review and approve new NRI families requesting access to the census portal.
          </p>
        </div>

        <JoinRequestsClient initialRequests={requests} verifierId={session.userId} />
      </div>
    </DashboardShell>
  );
}
