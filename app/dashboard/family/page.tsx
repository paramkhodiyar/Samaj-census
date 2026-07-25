import React from 'react';
import { prisma } from '@/lib/prisma';
import { getAuthSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import FamilyMembersView from './FamilyMembersView';
import { useTranslation } from '@/context/I18nContext';
import { 
  User, 
  MapPin, 
  Phone, 
  Home, 
  FileEdit, 
  Mail, 
  Activity, 
  Briefcase, 
  GraduationCap, 
  Heart,
  Calendar
} from 'lucide-react';

export default async function FamilyDetailsPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const session = await getAuthSession();

  if (!session) {
    redirect('/login');
  }

  // Determine which family ID to load
  let familyId: string | null = null;

  const resolvedParams = await searchParams;

  if (session.role === 'USER') {
    // Regular family users can only view their own linked family
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { familyId: true },
    });
    familyId = user?.familyId || null;
  } else {
    // Admins can view any family via query param
    familyId = resolvedParams.id || null;
    if (!familyId) {
      // If no query param, load the first family in the DB as default view
      const firstFamily = await prisma.family.findFirst({ select: { id: true } });
      familyId = firstFamily?.id || null;
    }
  }

  if (!familyId) {
    return (
      <div className="bg-white p-8 rounded-lg border border-[#E5DDD0] text-center max-w-lg mx-auto">
        <p className="font-semibold text-amber-600 text-lg mb-2">No Family Selected</p>
        <p className="text-[#6A5B4D]">
          There are no family census records linked or selected.
        </p>
      </div>
    );
  }

  // Load Family & Members
  const family = await prisma.family.findUnique({
    where: { id: familyId },
    include: {
      members: {
        orderBy: { relation: 'asc' }, // Head usually first if sorted alphabetically
      },
      pradeshik: true,
      ghatak: true,
    },
  });

  if (!family) {
    return (
      <div className="bg-white p-8 rounded-lg border border-red-200 text-center max-w-lg mx-auto">
        <p className="font-semibold text-red-600 text-lg mb-2">Family Not Found</p>
        <p className="text-[#6A5B4D]">
          The requested family census record does not exist in the database.
        </p>
      </div>
    );
  }

  // Load pending update requests for inline status visibility
  const pendingRequests = await prisma.updateRequest.findMany({
    where: { familyId: family.id, status: 'PENDING' },
    include: { changes: true },
    orderBy: { createdAt: 'desc' },
  });

  // Sort members to place 'Head' at the very top
  const sortedMembers = [...family.members].sort((a, b) => {
    if (a.relation.toLowerCase() === 'head') return -1;
    if (b.relation.toLowerCase() === 'head') return 1;
    return 0;
  });

  const serializedRequests = pendingRequests.map((r) => ({
    id: r.id,
    type: r.type,
    status: r.status,
    comments: r.comments,
    createdAt: r.createdAt.toISOString(),
    changes: r.changes.map((c) => ({
      recordId: c.recordId,
      fieldName: c.fieldName,
      oldValue: c.oldValue,
      newValue: c.newValue,
    })),
  }));

  return (
    <div className="space-y-6">
      
      {/* Family Info Card */}
      <div className="bg-white rounded-lg border border-[#E5DDD0] shadow-sm overflow-hidden">
        {/* Header Block */}
        <div className="p-6 bg-[#FAF7F2] border-b border-[#E5DDD0] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-xl font-serif font-bold text-[#8B5E3C] md:text-2xl">
              Family Census Profile: {family.headName}
            </h1>
            <p className="text-xs text-[#6A5B4D] font-bold uppercase tracking-wider mt-1">
              Family ID: <span className="text-[#8B5E3C]">{family.familyId}</span>
            </p>
          </div>
          {session.role === 'USER' && (
            <Link
              href="/dashboard/family/edit"
              className="px-4 py-2 bg-[#8B5E3C] text-white hover:bg-[#704A2E] rounded text-xs font-semibold shadow flex items-center gap-1.5 transition-colors"
            >
              <FileEdit className="w-4 h-4" />
              Update Records
            </Link>
          )}
        </div>

        {/* General Meta Fields */}
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 text-sm">
          <div className="flex gap-3 items-start">
            <Home className="w-4 h-4 text-[#B08968] shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-[#6A5B4D] uppercase tracking-wider">Pradeshik & Ghatak</p>
              <p className="font-semibold text-[#2D2D2D] mt-0.5">
                {family.pradeshik?.name} Province / {family.ghatak?.name} Ghatak
              </p>
            </div>
          </div>

          <div className="flex gap-3 items-start">
            <MapPin className="w-4 h-4 text-[#B08968] shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-[#6A5B4D] uppercase tracking-wider">Native Village</p>
              <p className="font-semibold text-[#2D2D2D] mt-0.5">{family.nativeVillage || 'N/A'}</p>
            </div>
          </div>

          <div className="flex gap-3 items-start">
            <Phone className="w-4 h-4 text-[#B08968] shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-[#6A5B4D] uppercase tracking-wider">Primary Mobile</p>
              <p className="font-semibold text-[#2D2D2D] mt-0.5">{family.mobile}</p>
            </div>
          </div>

          <div className="flex gap-3 items-start sm:col-span-2 md:col-span-3 pt-3 border-t border-[#FAF7F2]">
            <MapPin className="w-4 h-4 text-[#B08968] shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-[#6A5B4D] uppercase tracking-wider">Current Residential Address</p>
              <p className="font-semibold text-[#2D2D2D] mt-0.5">{family.address || 'N/A'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Members Section */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-[#6A5B4D] uppercase tracking-wider">
          Family Members ({family.members.length})
        </h2>

        <FamilyMembersView
          initialMembers={sortedMembers}
          pendingRequests={serializedRequests}
          isHeadUser={session.role === 'USER'}
        />
      </div>
    </div>
  );
}
