import React from 'react';
import { getAuthSession } from '@/lib/auth';
import { requireRole } from '@/lib/authz';
import { prisma } from '@/lib/prisma';
import AdminUsersClient from './AdminUsersClient';
import { Role } from '@prisma/client';

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string; role?: string }>;
}) {
  const session = await getAuthSession();
  requireRole(session, ['SUPER_ADMIN']);

  const resolvedParams = await searchParams;
  const page = parseInt(resolvedParams.page || '1', 10);
  const search = resolvedParams.search || '';
  const roleFilter = resolvedParams.role || '';
  const pageSize = 15;

  // Build Prisma where clause
  const where: any = {};
  if (search) {
    where.OR = [
      { mobileNumber: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ];
  }
  if (roleFilter && Object.values(Role).includes(roleFilter as Role)) {
    where.role = roleFilter as Role;
  }

  const [usersCount, usersRaw, ghataks, pradeshiks] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
      include: {
        ghatak: true,
        pradeshik: true,
        family: true,
      },
    }),
    prisma.ghatak.findMany({ orderBy: { name: 'asc' } }),
    prisma.pradeshik.findMany({ orderBy: { name: 'asc' } }),
  ]);

  const totalPages = Math.ceil(usersCount / pageSize);

  const formattedUsers = usersRaw.map((u) => ({
    id: u.id,
    mobileNumber: u.mobileNumber,
    email: u.email,
    role: u.role,
    isVerified: u.isVerified,
    ghatakId: u.ghatakId,
    pradeshikId: u.pradeshikId,
    ghatakName: u.ghatak?.name,
    pradeshikName: u.pradeshik?.name,
    familyId: u.familyId,
    familyHeadName: u.family?.headName,
    createdAt: u.createdAt.toISOString(),
  }));

  return (
    <AdminUsersClient
      users={formattedUsers}
      ghataks={ghataks.map((g) => ({ id: g.id, name: g.name }))}
      pradeshiks={pradeshiks.map((p) => ({ id: p.id, name: p.name }))}
      totalUsers={usersCount}
      currentPage={page}
      totalPages={totalPages}
      currentSearch={search}
      currentRoleFilter={roleFilter}
    />
  );
}
