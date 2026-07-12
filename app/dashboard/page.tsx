import React from 'react';
import { prisma } from '@/lib/prisma';
import { getAuthSession } from '@/lib/auth';
import Link from 'next/link';
import ExportNriCsvButton from '@/components/ExportNriCsvButton';
import { redirect } from 'next/navigation';
import { 
  Users, 
  FileText, 
  Clock, 
  Calendar, 
  PlusCircle, 
  UserMinus, 
  ArrowRightLeft, 
  FileEdit, 
  ShieldCheck, 
  FileSpreadsheet, 
  ArrowRight,
  TrendingUp,
  MapPin
} from 'lucide-react';
import { format } from 'date-fns';

export default async function DashboardOverview() {
  const session = await getAuthSession();

  if (!session) {
    redirect('/login');
  }

  // Load User Details
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: {
      family: {
        include: {
          members: true,
          updateRequests: {
            where: { status: 'PENDING' }
          },
          ghatak: true,
          pradeshik: true,
        }
      },
      ghatak: true,
      pradeshik: true,
    }
  });

  if (!user) {
    redirect('/login');
  }

  // Role-Based Views
  if (user.role === 'USER') {
    // FAMILY USER VIEW
    const family = user.family;
    const globalFamiliesCount = await prisma.family.count();
    const globalMembersCount = await prisma.member.count({ where: { isAlive: true } });

    if (!family) {
      return (
        <div className="bg-white p-8 rounded-lg border border-red-200 text-center max-w-lg mx-auto">
          <p className="font-semibold text-red-600 text-lg mb-2">Unlinked Account</p>
          <p className="text-[#6A5B4D] mb-4">
            Your account is not linked to any family census record. Please contact your Ghatak administrator to link your account.
          </p>
        </div>
      );
    }

    const headMember = family.members.find(m => m.relation === 'Head') || family.members[0];
    const pendingCount = family.updateRequests.length;
    const lastUpdateDate = family.updatedAt ? format(new Date(family.updatedAt), 'dd MMM yyyy') : 'N/A';

    return (
      <div className="space-y-6">
        {/* Welcome Card */}
        <div className="bg-white p-6 rounded-lg border border-[#E5DDD0] shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-xl font-serif font-bold text-[#8B5E3C] md:text-2xl">
              Welcome, {family.headName} Family
            </h1>
            <p className="text-sm text-[#6A5B4D] mt-1">
              Family ID: <span className="font-semibold text-[#8B5E3C]">{family.familyId}</span> • {family.ghatak?.name} Ghatak
            </p>
          </div>
          <div className="text-xs text-[#6A5B4D] md:text-right">
            <div>Last Updated: <span className="font-semibold text-[#2D2D2D]">{lastUpdateDate}</span></div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg border border-[#E5DDD0] shadow-sm flex items-center gap-4">
            <div className="p-3 bg-[#FAF7F2] text-[#8B5E3C] rounded-md border border-[#E5DDD0]">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#6A5B4D] uppercase tracking-wider">Family Members</p>
              <h3 className="text-2xl font-bold text-[#8B5E3C] mt-0.5">{family.members.length}</h3>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-[#E5DDD0] shadow-sm flex items-center gap-4">
            <div className="p-3 bg-[#FAF7F2] text-[#D4A373] rounded-md border border-[#E5DDD0]">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#6A5B4D] uppercase tracking-wider">Pending Requests</p>
              <h3 className="text-2xl font-bold text-[#8B5E3C] mt-0.5">{pendingCount}</h3>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-[#E5DDD0] shadow-sm flex items-center gap-4">
            <div className="p-3 bg-[#FAF7F2] text-[#B08968] rounded-md border border-[#E5DDD0]">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#6A5B4D] uppercase tracking-wider">Census Zone</p>
              <h3 className="text-sm font-semibold text-[#8B5E3C] mt-1">{family.pradeshik?.name}</h3>
            </div>
          </div>
        </div>

        {/* Global Samaj Census Status */}
        <div className="bg-[#FAF7F2]/50 p-5 rounded-lg border border-[#E5DDD0] space-y-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#8B5E3C]" />
            <h4 className="text-xs font-bold text-[#8B5E3C] uppercase tracking-wider">
              Samaj Census Growth Metrics
            </h4>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded border border-[#E5DDD0]/50 flex justify-between items-center text-xs">
              <span className="text-[#6A5B4D]">Total Enrolled Families Globally</span>
              <span className="font-bold text-[#8B5E3C] text-sm">{globalFamiliesCount}</span>
            </div>
            <div className="bg-white p-4 rounded border border-[#E5DDD0]/50 flex justify-between items-center text-xs">
              <span className="text-[#6A5B4D]">Total Active Members Globally</span>
              <span className="font-bold text-[#8B5E3C] text-sm">{globalMembersCount}</span>
            </div>
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-[#6A5B4D] uppercase tracking-wider">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <QuickActionCard
              icon={<Users className="w-5 h-5" />}
              title="View Family"
              desc="See family profile & photos"
              href="/dashboard/family"
            />
            <QuickActionCard
              icon={<FileEdit className="w-5 h-5" />}
              title="Update Details"
              desc="Modify family census info"
              href="/dashboard/family/edit?step=1"
            />
            <QuickActionCard
              icon={<PlusCircle className="w-5 h-5" />}
              title="Add Member"
              desc="Submit new member request"
              href="/dashboard/family/edit?step=2"
            />
            <QuickActionCard
              icon={<UserMinus className="w-5 h-5" />}
              title="Remove Member"
              desc="Request member removal"
              href="/dashboard/family/edit?step=3"
            />
          </div>
        </div>
      </div>
    );
  }

  // ADMIN VIEW DATA PREP
  let familyFilter = {};
  let memberFilter: any = { isAlive: true };
  let requestFilter: any = { status: 'PENDING' };

  if (user.role === 'GHATAK_ADMIN') {
    familyFilter = { ghatakId: user.ghatakId || 'null-ghatak-id' };
    memberFilter = { isAlive: true, family: { ghatakId: user.ghatakId || 'null-ghatak-id' } };
    requestFilter = { status: 'PENDING', family: { ghatakId: user.ghatakId || 'null-ghatak-id' } };
  } else if (user.role === 'PRADESHIK_ADMIN') {
    familyFilter = { pradeshikId: user.pradeshikId || 'null-pradeshik-id' };
    memberFilter = { isAlive: true, family: { pradeshikId: user.pradeshikId || 'null-pradeshik-id' } };
    requestFilter = { status: 'PENDING', family: { pradeshikId: user.pradeshikId || 'null-pradeshik-id' } };
  } else if (user.role === 'NRI_ADMIN') {
    familyFilter = { familyId: { startsWith: 'KG-NRI-' } };
    memberFilter = { isAlive: true, family: { familyId: { startsWith: 'KG-NRI-' } } };
    requestFilter = { status: 'PENDING', family: { familyId: { startsWith: 'KG-NRI-' } } };
  }

  const totalFamilies = await prisma.family.count({
    where: familyFilter,
  });

  const totalMembers = await prisma.member.count({
    where: memberFilter,
  });

  const pendingRequests = await prisma.updateRequest.findMany({
    where: requestFilter,
    include: {
      family: true,
      requester: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  if (user.role === 'GHATAK_ADMIN') {
    // GHATAK ADMIN VIEW
    return (
      <div className="space-y-6">
        {/* Admin Header */}
        <div className="bg-white p-6 rounded-lg border border-[#E5DDD0] shadow-sm">
          <h1 className="text-xl font-serif font-bold text-[#8B5E3C] md:text-2xl">
            Ghatak Admin Portal: {user.ghatak?.name}
          </h1>
          <p className="text-sm text-[#6A5B4D] mt-1">
            Manage census verification queue and analytics for your specific Ghatak.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg border border-[#E5DDD0] shadow-sm flex items-center gap-4">
            <div className="p-3 bg-[#FAF7F2] text-[#8B5E3C] rounded-md border border-[#E5DDD0]">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#6A5B4D] uppercase tracking-wider">Total Families</p>
              <h3 className="text-2xl font-bold text-[#8B5E3C] mt-0.5">{totalFamilies}</h3>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-[#E5DDD0] shadow-sm flex items-center gap-4">
            <div className="p-3 bg-[#FAF7F2] text-[#B08968] rounded-md border border-[#E5DDD0]">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#6A5B4D] uppercase tracking-wider">Total Members</p>
              <h3 className="text-2xl font-bold text-[#8B5E3C] mt-0.5">{totalMembers}</h3>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-[#E5DDD0] shadow-sm flex items-center gap-4">
            <div className="p-3 bg-[#FAF7F2] text-[#D4A373] rounded-md border border-[#E5DDD0]">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#6A5B4D] uppercase tracking-wider">Pending Verification</p>
              <h3 className="text-2xl font-bold text-[#8B5E3C] mt-0.5">{pendingRequests.length}</h3>
            </div>
          </div>
        </div>

        {/* Pending Requests Queue */}
        <div className="bg-white rounded-lg border border-[#E5DDD0] shadow-sm overflow-hidden">
          <div className="p-4 bg-[#FAF7F2] border-b border-[#E5DDD0] flex justify-between items-center">
            <h2 className="text-sm font-bold text-[#6A5B4D] uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#8B5E3C]" />
              Pending Verifications Queue ({pendingRequests.length})
            </h2>
            <Link href="/dashboard/requests" className="text-xs font-bold text-[#8B5E3C] hover:underline flex items-center gap-1">
              View All Queue
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="divide-y divide-[#E5DDD0]">
            {pendingRequests.length === 0 ? (
              <div className="p-8 text-center text-sm text-[#6A5B4D]">
                No pending verification requests in your Ghatak queue.
              </div>
            ) : (
              pendingRequests.slice(0, 5).map((req) => (
                <div key={req.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#FAF7F2]/50 transition-colors">
                  <div>
                    <span className="text-xs font-bold text-[#B08968] uppercase tracking-wider">
                      {req.type.replace('_', ' ')}
                    </span>
                    <h4 className="text-sm font-semibold text-[#2D2D2D] mt-0.5">
                      Family: {req.family.headName} ({req.family.familyId})
                    </h4>
                    <p className="text-xs text-[#6A5B4D] mt-0.5">
                      Submitted by: {req.requester.mobileNumber} • {format(new Date(req.createdAt), 'dd MMM yyyy, hh:mm a')}
                    </p>
                  </div>
                  <Link
                    href={`/dashboard/requests`}
                    className="self-start sm:self-center px-4 py-2 border border-[#8B5E3C] hover:bg-[#8B5E3C] hover:text-white text-[#8B5E3C] rounded text-xs font-semibold transition-all shadow-sm"
                  >
                    Verify Request
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  }

  if (user.role === 'PRADESHIK_ADMIN') {
    // PRADESHIK ADMIN VIEW
    const pradeshikGhataks = await prisma.ghatak.findMany({
      where: { pradeshikId: user.pradeshikId || 'null-pradeshik-id' },
      include: {
        families: true,
      }
    });

    return (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg border border-[#E5DDD0] shadow-sm">
          <h1 className="text-xl font-serif font-bold text-[#8B5E3C] md:text-2xl">
            Pradeshik Admin Portal: {user.pradeshik?.name}
          </h1>
          <p className="text-sm text-[#6A5B4D] mt-1">
            Global census reporting, regional stats, and Ghatak management.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg border border-[#E5DDD0] shadow-sm flex items-center gap-4">
            <div className="p-3 bg-[#FAF7F2] text-[#8B5E3C] rounded-md border border-[#E5DDD0]">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#6A5B4D] uppercase tracking-wider">Province Families</p>
              <h3 className="text-2xl font-bold text-[#8B5E3C] mt-0.5">{totalFamilies}</h3>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-[#E5DDD0] shadow-sm flex items-center gap-4">
            <div className="p-3 bg-[#FAF7F2] text-[#B08968] rounded-md border border-[#E5DDD0]">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#6A5B4D] uppercase tracking-wider">Province Members</p>
              <h3 className="text-2xl font-bold text-[#8B5E3C] mt-0.5">{totalMembers}</h3>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-[#E5DDD0] shadow-sm flex items-center gap-4">
            <div className="p-3 bg-[#FAF7F2] text-[#D4A373] rounded-md border border-[#E5DDD0]">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#6A5B4D] uppercase tracking-wider">Managed Ghataks</p>
              <h3 className="text-2xl font-bold text-[#8B5E3C] mt-0.5">{pradeshikGhataks.length}</h3>
            </div>
          </div>
        </div>

        {/* Ghataks List */}
        <div className="bg-white rounded-lg border border-[#E5DDD0] shadow-sm p-6">
          <h3 className="text-sm font-bold text-[#6A5B4D] uppercase tracking-wider mb-4">Regional Ghatak Distribution</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pradeshikGhataks.map((gh) => (
              <div key={gh.id} className="p-4 bg-[#FAF7F2] rounded border border-[#E5DDD0] flex justify-between items-center">
                <div>
                  <h4 className="font-semibold text-sm text-[#8B5E3C]">{gh.name} Ghatak</h4>
                  <p className="text-xs text-[#6A5B4D] mt-0.5">Code: {gh.code}</p>
                </div>
                <div className="text-right">
                  <span className="text-base font-bold text-[#2D2D2D]">{gh.families.length}</span>
                  <p className="text-[10px] font-bold text-[#6A5B4D] uppercase tracking-wider">Families</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (user.role === 'NRI_ADMIN') {
    // NRI ADMIN VIEW
    const totalNriFamilies = await prisma.family.count({
      where: { familyId: { startsWith: 'KG-NRI-' } },
    });

    const totalNriMembers = await prisma.member.count({
      where: { family: { familyId: { startsWith: 'KG-NRI-' } } },
    });

    const pendingJoinRequests = await prisma.joinRequest.count({
      where: { status: 'PENDING' },
    });

    const pendingNriUpdates = await prisma.updateRequest.findMany({
      where: {
        status: 'PENDING',
        family: { familyId: { startsWith: 'KG-NRI-' } },
      },
      include: {
        family: true,
        requester: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return (
      <div className="space-y-6">
        {/* Admin Header */}
        <div className="bg-white p-6 rounded-lg border border-[#E5DDD0] shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl font-serif font-bold text-[#8B5E3C] md:text-2xl">
              NRI Admin Portal
            </h1>
            <p className="text-sm text-[#6A5B4D] mt-1">
              Manage global family enrollment requests, record updates, and census audits.
            </p>
          </div>
          <div className="shrink-0">
            <ExportNriCsvButton />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg border border-[#E5DDD0] shadow-sm flex items-center gap-4">
            <div className="p-3 bg-[#FAF7F2] text-[#8B5E3C] rounded-md border border-[#E5DDD0]">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#6A5B4D] uppercase tracking-wider">NRI Families</p>
              <h3 className="text-2xl font-bold text-[#8B5E3C] mt-0.5">{totalNriFamilies}</h3>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-[#E5DDD0] shadow-sm flex items-center gap-4">
            <div className="p-3 bg-[#FAF7F2] text-[#B08968] rounded-md border border-[#E5DDD0]">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#6A5B4D] uppercase tracking-wider">NRI Members</p>
              <h3 className="text-2xl font-bold text-[#8B5E3C] mt-0.5">{totalNriMembers}</h3>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-[#E5DDD0] shadow-sm flex items-center gap-4">
            <div className="p-3 bg-[#FAF7F2] text-[#D4A373] rounded-md border border-[#E5DDD0]">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#6A5B4D] uppercase tracking-wider">Join Requests</p>
              <h3 className="text-2xl font-bold text-[#8B5E3C] mt-0.5">{pendingJoinRequests}</h3>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-[#E5DDD0] shadow-sm flex items-center gap-4">
            <div className="p-3 bg-[#FAF7F2] text-[#8B5E3C] rounded-md border border-[#E5DDD0]">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#6A5B4D] uppercase tracking-wider">Update Requests</p>
              <h3 className="text-2xl font-bold text-[#8B5E3C] mt-0.5">{pendingNriUpdates.length}</h3>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link href="/dashboard/join-requests" className="bg-white p-6 rounded-lg border border-[#E5DDD0] hover:border-[#8B5E3C] shadow-sm flex items-center justify-between transition-all group">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-[#FAF7F2] text-[#8B5E3C] rounded-full group-hover:bg-[#8B5E3C] group-hover:text-white transition-colors border border-[#E5DDD0]">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#2D2D2D]">Review Enrollment Requests</h4>
                <p className="text-xs text-[#6A5B4D] mt-0.5">Approve new families applying to join the portal ({pendingJoinRequests} pending)</p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-[#8B5E3C] group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link href="/dashboard/requests" className="bg-white p-6 rounded-lg border border-[#E5DDD0] hover:border-[#8B5E3C] shadow-sm flex items-center justify-between transition-all group">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-[#FAF7F2] text-[#8B5E3C] rounded-full group-hover:bg-[#8B5E3C] group-hover:text-white transition-colors border border-[#E5DDD0]">
                <FileEdit className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#2D2D2D]">Review Family Updates</h4>
                <p className="text-xs text-[#6A5B4D] mt-0.5">Approve or reject updates submitted by NRI families ({pendingNriUpdates.length} pending)</p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-[#8B5E3C] group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Pending Update Requests Queue */}
        <div className="bg-white rounded-lg border border-[#E5DDD0] shadow-sm overflow-hidden">
          <div className="p-4 bg-[#FAF7F2] border-b border-[#E5DDD0] flex justify-between items-center">
            <h2 className="text-sm font-bold text-[#6A5B4D] uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#8B5E3C]" />
              Pending Updates Verification Queue ({pendingNriUpdates.length})
            </h2>
          </div>
          <div className="divide-y divide-[#E5DDD0]">
            {pendingNriUpdates.length === 0 ? (
              <div className="p-8 text-center text-sm text-[#6A5B4D]">
                No pending family update requests in queue.
              </div>
            ) : (
              pendingNriUpdates.slice(0, 5).map((req) => (
                <div key={req.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#FAF7F2]/50 transition-colors">
                  <div>
                    <span className="text-xs font-bold text-[#B08968] uppercase tracking-wider">
                      {req.type.replace('_', ' ')}
                    </span>
                    <h4 className="text-sm font-semibold text-[#2D2D2D] mt-0.5">
                      Family: {req.family.headName} ({req.family.familyId})
                    </h4>
                    <p className="text-xs text-[#6A5B4D] mt-0.5">
                      Submitted by: {req.requester.mobileNumber} • {format(new Date(req.createdAt), 'dd MMM yyyy, hh:mm a')}
                    </p>
                  </div>
                  <Link
                    href={`/dashboard/requests`}
                    className="self-start sm:self-center px-4 py-2 border border-[#8B5E3C] hover:bg-[#8B5E3C] hover:text-white text-[#8B5E3C] rounded text-xs font-semibold transition-all shadow-sm"
                  >
                    Verify Request
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  }

  // SUPER ADMIN VIEW
  const allLogs = await prisma.auditLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5,
    include: { user: true },
  });

  return (
    <div className="space-y-6">
      {/* Super Admin Header */}
      <div className="bg-white p-6 rounded-lg border border-[#E5DDD0] shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-serif font-bold text-[#8B5E3C] md:text-2xl">
            Super Admin Portal
          </h1>
          <p className="text-sm text-[#6A5B4D] mt-1">
            Community Management Committee Dashboard.
          </p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-[#8B5E3C] text-white hover:bg-[#704A2E] text-xs font-semibold rounded shadow flex items-center gap-1.5">
            <FileSpreadsheet className="w-4 h-4" />
            Export Census (JSON)
          </button>
        </div>
      </div>

      {/* Global Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg border border-[#E5DDD0] shadow-sm flex items-center gap-4">
          <div className="p-3 bg-[#FAF7F2] text-[#8B5E3C] rounded-md border border-[#E5DDD0]">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-[#6A5B4D] uppercase tracking-wider">Total Families</p>
            <h3 className="text-2xl font-bold text-[#8B5E3C] mt-0.5">{totalFamilies}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-[#E5DDD0] shadow-sm flex items-center gap-4">
          <div className="p-3 bg-[#FAF7F2] text-[#B08968] rounded-md border border-[#E5DDD0]">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-[#6A5B4D] uppercase tracking-wider">Total Members</p>
            <h3 className="text-2xl font-bold text-[#8B5E3C] mt-0.5">{totalMembers}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-[#E5DDD0] shadow-sm flex items-center gap-4">
          <div className="p-3 bg-[#FAF7F2] text-[#D4A373] rounded-md border border-[#E5DDD0]">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-[#6A5B4D] uppercase tracking-wider">Pending Requests</p>
            <h3 className="text-2xl font-bold text-[#8B5E3C] mt-0.5">{pendingRequests.length}</h3>
          </div>
        </div>
      </div>

      {/* Recent Activity Log */}
      <div className="bg-white rounded-lg border border-[#E5DDD0] shadow-sm overflow-hidden">
        <div className="p-4 bg-[#FAF7F2] border-b border-[#E5DDD0]">
          <h2 className="text-sm font-bold text-[#6A5B4D] uppercase tracking-wider flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#8B5E3C]" />
            Recent Global Activity logs
          </h2>
        </div>
        <div className="divide-y divide-[#E5DDD0]">
          {allLogs.length === 0 ? (
            <div className="p-8 text-center text-sm text-[#6A5B4D]">
              No audit logs recorded in system.
            </div>
          ) : (
            allLogs.map((log) => (
              <div key={log.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-[#FAF7F2]/50 transition-colors">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#FAF7F2] border border-[#E5DDD0] text-[#8B5E3C]">
                      {log.action}
                    </span>
                    <span className="text-xs text-[#6A5B4D]">
                      {format(new Date(log.createdAt), 'dd MMM yyyy, hh:mm a')}
                    </span>
                  </div>
                  <p className="text-sm text-[#2D2D2D] font-medium mt-1">{log.description}</p>
                </div>
                <div className="text-xs text-[#6A5B4D] font-semibold">
                  By: {log.user?.mobileNumber || 'System'}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// Sub-Component: QuickActionCard
function QuickActionCard({ icon, title, desc, href }: { icon: React.ReactNode; title: string; desc: string; href: string }) {
  return (
    <Link href={href} className="bg-white p-5 rounded-lg border border-[#E5DDD0] hover:border-[#8B5E3C] shadow-sm flex flex-col items-center text-center transition-all group">
      <div className="p-3 bg-[#FAF7F2] text-[#8B5E3C] rounded-full mb-3 group-hover:bg-[#8B5E3C] group-hover:text-white transition-colors border border-[#E5DDD0]">
        {icon}
      </div>
      <h4 className="text-sm font-bold text-[#2D2D2D]">{title}</h4>
      <p className="text-[11px] text-[#6A5B4D] mt-1 leading-relaxed">{desc}</p>
    </Link>
  );
}
