import React from 'react';
import { prisma } from '@/lib/prisma';
import { getAuthSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import RequestsList from '@/components/RequestsList';
import { requireRole } from '@/lib/authz';

export default async function RequestsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }>;
}) {
  const session = await getAuthSession();
  requireRole(session, ['SUPER_ADMIN', 'PRADESHIK_ADMIN', 'GHATAK_ADMIN', 'NRI_ADMIN', 'USER']);

  if (!session) {
    redirect('/login');
  }

  // Load active User and role
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, role: true, ghatakId: true },
  });

  if (!user) {
    redirect('/login');
  }

  const resolvedParams = await searchParams;
  const page = parseInt(resolvedParams.page || '1', 10);
  const search = resolvedParams.search || '';
  const pageSize = 10;

  const isAdmin = ['SUPER_ADMIN', 'PRADESHIK_ADMIN', 'GHATAK_ADMIN', 'NRI_ADMIN'].includes(user.role);

  // Build base filters based on user role/jurisdiction
  let baseWhere: any = {};
  if (user.role === 'USER') {
    baseWhere.requesterId = user.id;
  } else if (user.role === 'GHATAK_ADMIN') {
    baseWhere.family = { ghatakId: user.ghatakId || 'null-ghatak-id' };
  } else if (user.role === 'PRADESHIK_ADMIN') {
    const pradeshikUser = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { pradeshikId: true },
    });
    baseWhere.family = { pradeshikId: pradeshikUser?.pradeshikId || 'null-pradeshik-id' };
  } else if (user.role === 'NRI_ADMIN') {
    baseWhere.family = { familyId: { startsWith: 'KG-NRI-' } };
  }

  // Combine with search if present
  let finalWhere = { ...baseWhere };
  if (search) {
    finalWhere = {
      ...baseWhere,
      AND: [
        baseWhere,
        {
          OR: [
            { familyId: { contains: search, mode: 'insensitive' } },
            { family: { headName: { contains: search, mode: 'insensitive' } } },
            { requester: { mobileNumber: { contains: search, mode: 'insensitive' } } },
          ]
        }
      ]
    };
  }

  const totalCount = await prisma.updateRequest.count({
    where: finalWhere,
  });

  const requests = await prisma.updateRequest.findMany({
    where: finalWhere,
    include: {
      family: { select: { familyId: true, headName: true } },
      requester: { select: { mobileNumber: true } },
      changes: true,
      documents: true,
    },
    orderBy: { createdAt: 'desc' },
    skip: (page - 1) * pageSize,
    take: pageSize,
  });

  // Convert Date properties to standard format if needed
  const formattedRequests = requests.map(req => ({
    ...req,
    createdAt: new Date(req.createdAt),
  }));

  return (
    <div className="space-y-4">
      <RequestsList
        requests={formattedRequests}
        isAdmin={isAdmin}
        userId={user.id}
        totalCount={totalCount}
        page={page}
        pageSize={pageSize}
        search={search}
      />
    </div>
  );
}
