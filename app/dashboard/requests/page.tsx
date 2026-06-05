import React from 'react';
import { prisma } from '@/lib/prisma';
import { getAuthSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import RequestsList from '@/components/RequestsList';

export default async function RequestsPage() {
  const session = await getAuthSession();

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

  const isAdmin = ['SUPER_ADMIN', 'PRADESHIK_ADMIN', 'GHATAK_ADMIN'].includes(user.role);

  // Fetch requests based on role
  let requests = [];

  if (user.role === 'USER') {
    // Regular family user sees only their requests
    requests = await prisma.updateRequest.findMany({
      where: { requesterId: user.id },
      include: {
        family: { select: { familyId: true, headName: true } },
        requester: { select: { mobileNumber: true } },
        changes: true,
        documents: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  } else if (user.role === 'GHATAK_ADMIN') {
    // Ghatak admin sees only requests within their Ghatak
    requests = await prisma.updateRequest.findMany({
      where: {
        family: { ghatakId: user.ghatakId || undefined },
      },
      include: {
        family: { select: { familyId: true, headName: true } },
        requester: { select: { mobileNumber: true } },
        changes: true,
        documents: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  } else {
    // Pradeshik / Super Admin sees all requests
    requests = await prisma.updateRequest.findMany({
      include: {
        family: { select: { familyId: true, headName: true } },
        requester: { select: { mobileNumber: true } },
        changes: true,
        documents: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Convert Date properties to standard format if needed
  const formattedRequests = requests.map(req => ({
    ...req,
    createdAt: new Date(req.createdAt),
  }));

  return (
    <div className="space-y-4">
      <RequestsList requests={formattedRequests} isAdmin={isAdmin} userId={user.id} />
    </div>
  );
}
