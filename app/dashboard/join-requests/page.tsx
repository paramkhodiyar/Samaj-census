import React from 'react';
import { prisma } from '@/lib/prisma';
import { getAuthSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import JoinRequestsClient from './JoinRequestsClient';
import DashboardShell from '@/components/DashboardShell';
import { requireRole } from '@/lib/authz';

export default async function JoinRequestsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }>;
}) {
  const session = await getAuthSession();
  requireRole(session, ['SUPER_ADMIN', 'NRI_ADMIN']);
  if (!session) {
    redirect('/login');
  }

  const resolvedParams = await searchParams;
  const page = parseInt(resolvedParams.page || '1', 10);
  const search = resolvedParams.search || '';
  const pageSize = 10;

  const whereClause: any = {};
  if (search) {
    whereClause.OR = [
      { fullName: { contains: search, mode: 'insensitive' } },
      { mobileNumber: { contains: search, mode: 'insensitive' } },
      { city: { contains: search, mode: 'insensitive' } },
      { country: { contains: search, mode: 'insensitive' } },
    ];
  }

  const totalCount = await prisma.joinRequest.count({ where: whereClause });

  const requests = await prisma.joinRequest.findMany({
    where: whereClause,
    orderBy: { createdAt: 'desc' },
    skip: (page - 1) * pageSize,
    take: pageSize,
  });

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg border border-[#E5DDD0] shadow-sm">
        <h1 className="text-xl font-serif font-bold text-[#8B5E3C] md:text-2xl">
          Family Enrollment Requests
        </h1>
        <p className="text-sm text-[#6A5B4D] mt-1">
          Review and approve new NRI families requesting access to the census portal.
        </p>
      </div>

      <JoinRequestsClient 
        initialRequests={requests} 
        totalCount={totalCount}
        page={page}
        pageSize={pageSize}
        search={search}
      />
    </div>
  );
}
