'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useConfirm } from '@/context/ConfirmContext';
import { updateUserRoleAction } from '@/app/actions/admin-users';
import { Role } from '@prisma/client';
import { toast } from 'sonner';
import CustomDropdown from '@/components/CustomDropdown';
import { Search, Shield, UserCheck, CheckCircle2, ChevronLeft, ChevronRight, UserCog } from 'lucide-react';

interface GhatakOption {
  id: string;
  name: string;
}

interface PradeshikOption {
  id: string;
  name: string;
}

interface UserRecord {
  id: string;
  mobileNumber: string;
  email: string | null;
  role: Role;
  isVerified: boolean;
  ghatakId: string | null;
  pradeshikId: string | null;
  ghatakName?: string;
  pradeshikName?: string;
  familyId: string | null;
  familyHeadName?: string;
  createdAt: string;
}

interface AdminUsersClientProps {
  users: UserRecord[];
  ghataks: GhatakOption[];
  pradeshiks: PradeshikOption[];
  totalUsers: number;
  currentPage: number;
  totalPages: number;
  currentSearch: string;
  currentRoleFilter: string;
}

export default function AdminUsersClient({
  users,
  ghataks,
  pradeshiks,
  totalUsers,
  currentPage,
  totalPages,
  currentSearch,
  currentRoleFilter,
}: AdminUsersClientProps) {
  const router = useRouter();
  const confirm = useConfirm();

  const [searchTerm, setSearchTerm] = useState(currentSearch);
  const [roleFilter, setRoleFilter] = useState(currentRoleFilter);
  const [selectedUser, setSelectedUser] = useState<UserRecord | null>(null);
  const [newRole, setNewRole] = useState<Role>('USER');
  const [selectedGhatakId, setSelectedGhatakId] = useState('');
  const [selectedPradeshikId, setSelectedPradeshikId] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchTerm) params.set('search', searchTerm);
    if (roleFilter) params.set('role', roleFilter);
    router.push(`/dashboard/admin/users?${params.toString()}`);
  };

  const handleRoleFilterChange = (role: string) => {
    setRoleFilter(role);
    const params = new URLSearchParams();
    if (searchTerm) params.set('search', searchTerm);
    if (role) params.set('role', role);
    router.push(`/dashboard/admin/users?${params.toString()}`);
  };

  const openEditModal = (user: UserRecord) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setSelectedGhatakId(user.ghatakId || (ghataks[0]?.id || ''));
    setSelectedPradeshikId(user.pradeshikId || (pradeshiks[0]?.id || ''));
  };

  const handleRoleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    if (newRole === 'GHATAK_ADMIN' && !selectedGhatakId) {
      toast.error('Please select a Ghatak cluster for this administrator.');
      return;
    }
    if (newRole === 'PRADESHIK_ADMIN' && !selectedPradeshikId) {
      toast.error('Please select a Pradeshik region for this administrator.');
      return;
    }

    const gName = ghataks.find((g) => g.id === selectedGhatakId)?.name || '';
    const pName = pradeshiks.find((p) => p.id === selectedPradeshikId)?.name || '';

    let scopeDesc = '';
    if (newRole === 'GHATAK_ADMIN') scopeDesc = ` Over ${gName} Ghatak`;
    if (newRole === 'PRADESHIK_ADMIN') scopeDesc = ` Over ${pName} Pradeshik`;

    const isConfirmed = await confirm({
      title: 'Confirm Role Update',
      message: `Assigning ${selectedUser.mobileNumber} as ${newRole}${scopeDesc}. Continue?`,
      confirmLabel: 'Assign Role',
      cancelLabel: 'Cancel',
    });

    if (!isConfirmed) return;

    setIsUpdating(true);
    const res = await updateUserRoleAction({
      targetUserId: selectedUser.id,
      newRole,
      ghatakId: newRole === 'GHATAK_ADMIN' ? selectedGhatakId : null,
      pradeshikId: newRole === 'PRADESHIK_ADMIN' ? selectedPradeshikId : null,
    });
    setIsUpdating(false);

    if (res.error) {
      toast.error(res.error);
    } else if (res.success) {
      toast.success(res.message);
      setSelectedUser(null);
      router.refresh();
    }
  };

  const getRoleBadgeColor = (role: Role) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'PRADESHIK_ADMIN':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'GHATAK_ADMIN':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'NRI_ADMIN':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default:
        return 'bg-stone-100 text-stone-700 border-stone-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-lg border border-[#E5DDD0] shadow-xs">
        <div>
          <h1 className="text-xl font-serif font-bold text-[#8B5E3C] flex items-center gap-2">
            <UserCog className="w-6 h-6 text-[#8B5E3C]" />
            Role & Access Management
          </h1>
          <p className="text-xs text-[#6A5B4D] mt-1">
            Assign administrative roles and geographic jurisdictions to portal users ({totalUsers} total registered accounts).
          </p>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-white p-4 rounded-lg border border-[#E5DDD0] shadow-xs flex flex-col md:flex-row gap-3 justify-between items-center">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-[#6A5B4D]/70">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Search by mobile number or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-4 py-2 w-full bg-[#FAF7F2] border border-[#E5DDD0] rounded text-xs focus:outline-none focus:border-[#8B5E3C]"
          />
        </form>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <span className="text-xs font-semibold text-[#6A5B4D] whitespace-nowrap">Filter Role:</span>
          {['ALL', 'USER', 'GHATAK_ADMIN', 'PRADESHIK_ADMIN', 'NRI_ADMIN', 'SUPER_ADMIN'].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => handleRoleFilterChange(r === 'ALL' ? '' : r)}
              className={`px-3 py-1.5 rounded text-xs font-medium border transition-all cursor-pointer whitespace-nowrap ${
                (r === 'ALL' && !roleFilter) || roleFilter === r
                  ? 'bg-[#8B5E3C] text-white border-[#8B5E3C] shadow-xs'
                  : 'bg-white text-[#6A5B4D] border-[#E5DDD0] hover:bg-[#FAF7F2]'
              }`}
            >
              {r === 'ALL' ? 'All Roles' : r.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg border border-[#E5DDD0] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#FAF7F2] border-b border-[#E5DDD0] text-[11px] font-bold uppercase tracking-wider text-[#6A5B4D]">
                <th className="py-3 px-4">User Contact</th>
                <th className="py-3 px-4">Current Role</th>
                <th className="py-3 px-4">Assigned Jurisdiction</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5DDD0] text-xs text-[#2D2D2D]">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-[#6A5B4D]">
                    No users matching search or filter criteria.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-[#FAF7F2]/50 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-[#8B5E3C]">{u.mobileNumber}</div>
                      {u.email && <div className="text-[11px] text-[#6A5B4D]">{u.email}</div>}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold border ${getRoleBadgeColor(u.role)}`}>
                        {u.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {u.role === 'GHATAK_ADMIN' && u.ghatakName ? (
                        <span className="text-amber-800 font-medium">{u.ghatakName} Ghatak</span>
                      ) : u.role === 'PRADESHIK_ADMIN' && u.pradeshikName ? (
                        <span className="text-blue-800 font-medium">{u.pradeshikName} Pradeshik</span>
                      ) : u.role === 'NRI_ADMIN' ? (
                        <span className="text-emerald-800 font-medium">NRI Overseas Families</span>
                      ) : (
                        <span className="text-gray-400">&mdash;</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      {u.isVerified ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 text-[11px] font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                        </span>
                      ) : (
                        <span className="text-gray-400 text-[11px]">Unverified</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => openEditModal(u)}
                        className="px-3 py-1.5 bg-white border border-[#E5DDD0] hover:border-[#8B5E3C] hover:text-[#8B5E3C] text-[#6A5B4D] text-xs font-semibold rounded shadow-xs cursor-pointer transition-all"
                      >
                        Change Role
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center p-4 bg-[#FAF7F2] border-t border-[#E5DDD0] text-xs">
            <span className="text-[#6A5B4D]">
              Page {currentPage} of {totalPages} ({totalUsers} total users)
            </span>
            <div className="flex gap-2">
              <button
                disabled={currentPage <= 1}
                onClick={() => {
                  const params = new URLSearchParams();
                  if (searchTerm) params.set('search', searchTerm);
                  if (roleFilter) params.set('role', roleFilter);
                  params.set('page', String(currentPage - 1));
                  router.push(`/dashboard/admin/users?${params.toString()}`);
                }}
                className="px-3 py-1 bg-white border border-[#E5DDD0] text-[#6A5B4D] rounded disabled:opacity-50 flex items-center gap-1 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>
              <button
                disabled={currentPage >= totalPages}
                onClick={() => {
                  const params = new URLSearchParams();
                  if (searchTerm) params.set('search', searchTerm);
                  if (roleFilter) params.set('role', roleFilter);
                  params.set('page', String(currentPage + 1));
                  router.push(`/dashboard/admin/users?${params.toString()}`);
                }}
                className="px-3 py-1 bg-white border border-[#E5DDD0] text-[#6A5B4D] rounded disabled:opacity-50 flex items-center gap-1 cursor-pointer"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Role Assignment Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-lg border border-[#E5DDD0] shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-[#E5DDD0] pb-3">
              <h3 className="text-base font-serif font-bold text-[#8B5E3C] flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Change User Role
              </h3>
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="text-gray-400 hover:text-gray-600 font-bold text-sm"
              >
                &times;
              </button>
            </div>

            <div className="text-xs space-y-1 bg-[#FAF7F2] p-3 rounded border border-[#E5DDD0]">
              <div><strong>User:</strong> {selectedUser.mobileNumber}</div>
              {selectedUser.email && <div><strong>Email:</strong> {selectedUser.email}</div>}
              <div><strong>Current Role:</strong> {selectedUser.role}</div>
            </div>

            <form onSubmit={handleRoleSubmit} className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-[#6A5B4D] mb-1.5 uppercase">
                  Select New Role
                </label>
                <CustomDropdown
                  options={[
                    { value: 'USER', label: 'USER (Family Head)' },
                    { value: 'GHATAK_ADMIN', label: 'GHATAK_ADMIN (Local Cluster Admin)' },
                    { value: 'PRADESHIK_ADMIN', label: 'PRADESHIK_ADMIN (State/Region Admin)' },
                    { value: 'NRI_ADMIN', label: 'NRI_ADMIN (International Families Admin)' },
                    { value: 'SUPER_ADMIN', label: 'SUPER_ADMIN (Global System Administrator)' },
                  ]}
                  value={newRole}
                  onChange={(val) => setNewRole(val as Role)}
                  placeholder="Select Role"
                />
              </div>

              {/* Jurisdiction Dropdowns */}
              {newRole === 'GHATAK_ADMIN' && (
                <div>
                  <label className="block text-xs font-bold text-[#6A5B4D] mb-1.5 uppercase">
                    Assign Ghatak Cluster <span className="text-red-500">*</span>
                  </label>
                  <CustomDropdown
                    options={ghataks.map((g) => ({ value: g.id, label: g.name }))}
                    value={selectedGhatakId}
                    onChange={setSelectedGhatakId}
                    placeholder="Select Ghatak"
                    searchable
                  />
                </div>
              )}

              {newRole === 'PRADESHIK_ADMIN' && (
                <div>
                  <label className="block text-xs font-bold text-[#6A5B4D] mb-1.5 uppercase">
                    Assign Pradeshik Region <span className="text-red-500">*</span>
                  </label>
                  <CustomDropdown
                    options={pradeshiks.map((p) => ({ value: p.id, label: p.name }))}
                    value={selectedPradeshikId}
                    onChange={setSelectedPradeshikId}
                    placeholder="Select Pradeshik"
                    searchable
                  />
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-[#E5DDD0]">
                <button
                  type="button"
                  onClick={() => setSelectedUser(null)}
                  className="px-4 py-2 border border-[#E5DDD0] text-[#6A5B4D] text-xs font-semibold rounded hover:bg-[#FAF7F2] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-5 py-2 bg-[#8B5E3C] hover:bg-[#704A2E] text-white text-xs font-semibold rounded shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {isUpdating ? 'Updating Role...' : 'Save Role Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
