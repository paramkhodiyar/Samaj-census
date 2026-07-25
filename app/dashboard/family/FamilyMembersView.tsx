'use client';

import React, { useState, useMemo } from 'react';
import { 
  Search, 
  LayoutGrid, 
  Table as TableIcon, 
  ChevronLeft, 
  ChevronRight, 
  User, 
  Phone, 
  Mail, 
  Heart,
  Briefcase,
  GraduationCap,
  Edit3,
  Clock,
  CheckCircle2,
  AlertCircle,
  X
} from 'lucide-react';
import { submitSingleMemberQuickEditAction } from '@/app/actions/requests';
import { toast } from 'sonner';

type Member = {
  id: string;
  name: string;
  relation: string;
  age: number;
  gender: string;
  bloodGroup: string;
  occupation: string;
  education: string;
  mobile: string | null;
  email: string | null;
  isAlive: boolean;
};

type PendingRequestChange = {
  recordId: string | null;
  fieldName: string | null;
  oldValue: string | null;
  newValue: string | null;
};

type PendingRequest = {
  id: string;
  type: string;
  status: string;
  comments: string | null;
  createdAt: string;
  changes: PendingRequestChange[];
};

interface FamilyMembersViewProps {
  initialMembers: Member[];
  pendingRequests?: PendingRequest[];
  isHeadUser?: boolean;
}

export default function FamilyMembersView({
  initialMembers,
  pendingRequests = [],
  isHeadUser = false,
}: FamilyMembersViewProps) {
  const [viewMode, setViewMode] = useState<'TABLE' | 'GRID'>('TABLE');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Quick Edit Modal State
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [editOccupation, setEditOccupation] = useState('');
  const [editEducation, setEditEducation] = useState('');
  const [editBloodGroup, setEditBloodGroup] = useState('');
  const [editMobile, setEditMobile] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editIsAlive, setEditIsAlive] = useState(true);
  const [isSubmittingQuickEdit, setIsSubmittingQuickEdit] = useState(false);

  // Status View Modal State
  const [activePendingRequest, setActivePendingRequest] = useState<{ memberName: string; request: PendingRequest } | null>(null);

  // Map member ID to pending changes
  const memberPendingMap = useMemo(() => {
    const map = new Map<string, PendingRequest>();
    for (const req of pendingRequests) {
      for (const change of req.changes) {
        if (change.recordId) {
          map.set(change.recordId, req);
        }
      }
    }
    return map;
  }, [pendingRequests]);

  // Filter members based on search query
  const filteredMembers = useMemo(() => {
    return initialMembers.filter(m => {
      const query = searchQuery.toLowerCase();
      return (
        m.name.toLowerCase().includes(query) ||
        m.relation.toLowerCase().includes(query) ||
        m.occupation.toLowerCase().includes(query) ||
        m.education.toLowerCase().includes(query) ||
        m.bloodGroup.toLowerCase().includes(query) ||
        (m.mobile && m.mobile.includes(query)) ||
        (m.email && m.email.toLowerCase().includes(query))
      );
    });
  }, [initialMembers, searchQuery]);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const totalPages = Math.ceil(filteredMembers.length / itemsPerPage) || 1;
  const paginatedMembers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredMembers.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredMembers, currentPage]);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filteredMembers.length);

  const openQuickEdit = (member: Member) => {
    setEditingMember(member);
    setEditOccupation(member.occupation || '');
    setEditEducation(member.education || '');
    setEditBloodGroup(member.bloodGroup || '');
    setEditMobile(member.mobile || '');
    setEditEmail(member.email || '');
    setEditIsAlive(member.isAlive);
  };

  const handleQuickEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;

    setIsSubmittingQuickEdit(true);
    const res = await submitSingleMemberQuickEditAction({
      memberId: editingMember.id,
      occupation: editOccupation,
      education: editEducation,
      bloodGroup: editBloodGroup,
      mobile: editMobile,
      email: editEmail,
      isAlive: editIsAlive,
    });
    setIsSubmittingQuickEdit(false);

    if (res.error) {
      toast.error(res.error);
    } else if (res.success) {
      toast.success('Your update has been sent to your Ghatak Admin for review.');
      setEditingMember(null);
    }
  };

  const renderValue = (rawJson: string | null) => {
    if (!rawJson) return 'N/A';
    try {
      const parsed = JSON.parse(rawJson);
      return String(parsed);
    } catch {
      return rawJson;
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Filter and Toggle Bar */}
      <div className="bg-white p-4 rounded-lg border border-[#E5DDD0] shadow-xs flex flex-col sm:flex-row gap-4 items-center justify-between">
        {/* Search Bar */}
        <div className="relative w-full sm:w-80">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-[#6A5B4D]/70">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Search family members..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-4 py-2 w-full bg-[#FAF7F2] border border-[#E5DDD0] rounded-md focus:outline-none focus:ring-1 focus:ring-[#8B5E3C] focus:border-[#8B5E3C] text-xs"
          />
        </div>

        {/* View Toggle */}
        <div className="flex items-center border border-[#E5DDD0] rounded-md p-1 bg-[#FAF7F2] shrink-0">
          <button
            type="button"
            onClick={() => setViewMode('TABLE')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded transition-all cursor-pointer ${
              viewMode === 'TABLE'
                ? 'bg-[#8B5E3C] text-white shadow-xs'
                : 'text-[#6A5B4D] hover:bg-[#E5DDD0]/50'
            }`}
          >
            <TableIcon className="w-3.5 h-3.5" />
            Table View
          </button>
          <button
            type="button"
            onClick={() => setViewMode('GRID')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded transition-all cursor-pointer ${
              viewMode === 'GRID'
                ? 'bg-[#8B5E3C] text-white shadow-xs'
                : 'text-[#6A5B4D] hover:bg-[#E5DDD0]/50'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            Grid View
          </button>
        </div>
      </div>

      {/* Members Listing */}
      {filteredMembers.length === 0 ? (
        <div className="bg-white p-12 text-center text-sm text-[#6A5B4D] border border-[#E5DDD0] rounded-lg">
          No family members matching "{searchQuery}" found.
        </div>
      ) : viewMode === 'TABLE' ? (
        /* TABLE VIEW (TABULAR) */
        <div className="bg-white rounded-lg border border-[#E5DDD0] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[#E5DDD0] text-left text-xs">
              <thead className="bg-[#FAF7F2] text-[#6A5B4D] font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Name</th>
                  <th className="px-6 py-3.5">Relation</th>
                  <th className="px-6 py-3.5">Age & Gender</th>
                  <th className="px-6 py-3.5">Blood Group</th>
                  <th className="px-6 py-3.5">Occupation</th>
                  <th className="px-6 py-3.5">Education</th>
                  <th className="px-6 py-3.5">Contact Details</th>
                  <th className="px-6 py-3.5">Status & Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5DDD0] text-[#2D2D2D]">
                {paginatedMembers.map((member) => {
                  const pending = memberPendingMap.get(member.id);
                  return (
                    <tr 
                      key={member.id} 
                      className={`hover:bg-[#FAF7F2]/40 transition-colors ${
                        !member.isAlive ? 'bg-red-50/20 opacity-80' : ''
                      }`}
                    >
                      <td className="px-6 py-4 font-semibold whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-[#FAF7F2] border border-[#E5DDD0] flex items-center justify-center text-[#8B5E3C] shrink-0">
                            <User className="w-3.5 h-3.5" />
                          </div>
                          <span>{member.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-amber-800">
                        {member.relation}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {member.age} Yrs / {member.gender}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-red-600">
                        <div className="flex items-center gap-1">
                          <Heart className="w-3 h-3 fill-current text-red-500" />
                          {member.bloodGroup}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {member.occupation}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {member.education}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap space-y-0.5">
                        {member.mobile && (
                          <div className="flex items-center gap-1.5 text-xs text-[#6A5B4D]">
                            <Phone className="w-3 h-3 text-[#B08968]" />
                            <span>{member.mobile}</span>
                          </div>
                        )}
                        {member.email && (
                          <div className="flex items-center gap-1.5 text-xs text-[#6A5B4D]">
                            <Mail className="w-3 h-3 text-[#B08968]" />
                            <span className="truncate max-w-[150px]">{member.email}</span>
                          </div>
                        )}
                        {!member.mobile && !member.email && <span className="text-gray-400">-</span>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap flex items-center gap-2">
                        {pending ? (
                          <button
                            type="button"
                            onClick={() => setActivePendingRequest({ memberName: member.name, request: pending })}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-[10px] font-bold bg-amber-50 border border-amber-300 text-amber-800 uppercase cursor-pointer hover:bg-amber-100 transition-colors"
                          >
                            <Clock className="w-3 h-3 text-amber-600" />
                            Pending Approval
                          </button>
                        ) : (
                          member.isAlive ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-green-50 border border-green-200 text-green-700 uppercase">
                              Alive
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-red-50 border border-red-200 text-red-700 uppercase">
                              Deceased
                            </span>
                          )
                        )}

                        {isHeadUser && (
                          <button
                            type="button"
                            onClick={() => openQuickEdit(member)}
                            className="p-1.5 border border-[#E5DDD0] hover:border-[#8B5E3C] text-[#6A5B4D] hover:text-[#8B5E3C] rounded transition-all cursor-pointer"
                            title="Quick Edit Member"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* TILED GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {paginatedMembers.map((member) => {
            const pending = memberPendingMap.get(member.id);
            return (
              <div
                key={member.id}
                className={`bg-white rounded-lg border shadow-xs overflow-hidden flex flex-col justify-between transition-shadow hover:shadow-md ${
                  member.isAlive ? 'border-[#E5DDD0]' : 'border-red-200 opacity-75'
                }`}
              >
                {/* Card top banner */}
                <div className="p-4 bg-[#FAF7F2] border-b border-[#E5DDD0] flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded bg-white border border-[#E5DDD0] flex items-center justify-center text-[#8B5E3C] shrink-0">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#2D2D2D]">{member.name}</h3>
                      <p className="text-[10px] font-bold text-[#B08968] uppercase tracking-wider">
                        {member.relation} {member.relation.toLowerCase() === 'head' ? 'of Family' : ''}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {pending && (
                      <button
                        type="button"
                        onClick={() => setActivePendingRequest({ memberName: member.name, request: pending })}
                        className="text-[9px] px-2 py-0.5 rounded font-bold border bg-amber-50 text-amber-800 border-amber-300 uppercase cursor-pointer hover:bg-amber-100 flex items-center gap-1"
                      >
                        <Clock className="w-3 h-3" /> Pending
                      </button>
                    )}
                    {isHeadUser && (
                      <button
                        type="button"
                        onClick={() => openQuickEdit(member)}
                        className="p-1.5 border border-[#E5DDD0] hover:border-[#8B5E3C] text-[#6A5B4D] hover:text-[#8B5E3C] rounded bg-white transition-all cursor-pointer"
                        title="Quick Edit Member"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Member detail grid */}
                <div className="p-5 grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-[10px] font-bold text-[#6A5B4D] uppercase tracking-wider block">Age & Gender</span>
                    <span className="font-semibold text-[#2D2D2D] mt-0.5 block">
                      {member.age} Yrs / {member.gender}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-[#6A5B4D] uppercase tracking-wider block">Blood Group</span>
                    <span className="font-semibold text-[#2D2D2D] mt-0.5 block flex items-center gap-1">
                      <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
                      {member.bloodGroup}
                    </span>
                  </div>

                  <div className="col-span-2 border-t border-[#FAF7F2] pt-3 flex gap-2 items-start">
                    <Briefcase className="w-3.5 h-3.5 text-[#B08968] mt-0.5 shrink-0" />
                    <div>
                      <span className="text-[10px] font-bold text-[#6A5B4D] uppercase tracking-wider block">Occupation</span>
                      <span className="font-semibold text-[#2D2D2D] block mt-0.5">{member.occupation}</span>
                    </div>
                  </div>

                  <div className="col-span-2 border-t border-[#FAF7F2] pt-3 flex gap-2 items-start">
                    <GraduationCap className="w-3.5 h-3.5 text-[#B08968] mt-0.5 shrink-0" />
                    <div>
                      <span className="text-[10px] font-bold text-[#6A5B4D] uppercase tracking-wider block">Education</span>
                      <span className="font-semibold text-[#2D2D2D] block mt-0.5">{member.education}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Footer Controls */}
      {totalPages > 1 && (
        <div className="bg-white p-4 rounded-lg border border-[#E5DDD0] shadow-xs flex items-center justify-between text-xs text-[#6A5B4D]">
          <div>
            Showing <span className="font-semibold text-[#2D2D2D]">{startIndex + 1}</span> to{' '}
            <span className="font-semibold text-[#2D2D2D]">{endIndex}</span> of{' '}
            <span className="font-semibold text-[#2D2D2D]">{filteredMembers.length}</span> members
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded border border-[#E5DDD0] hover:bg-[#FAF7F2]/50 disabled:opacity-50 disabled:hover:bg-transparent cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`w-7 h-7 rounded border font-semibold transition-colors cursor-pointer ${
                  currentPage === i + 1
                    ? 'border-[#8B5E3C] bg-[#8B5E3C] text-white'
                    : 'border-[#E5DDD0] hover:bg-[#FAF7F2]/50 text-[#6A5B4D]'
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded border border-[#E5DDD0] hover:bg-[#FAF7F2]/50 disabled:opacity-50 disabled:hover:bg-transparent cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Inline Quick Edit Modal */}
      {editingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-lg border border-[#E5DDD0] shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-[#E5DDD0] pb-3">
              <h3 className="text-base font-serif font-bold text-[#8B5E3C]">
                Quick Edit: {editingMember.name}
              </h3>
              <button
                type="button"
                onClick={() => setEditingMember(null)}
                className="text-gray-400 hover:text-gray-600 font-bold text-sm"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleQuickEditSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] font-bold uppercase text-[#6A5B4D] mb-1">
                  Occupation
                </label>
                <input
                  type="text"
                  value={editOccupation}
                  onChange={(e) => setEditOccupation(e.target.value)}
                  className="w-full p-2 bg-[#FAF7F2] border border-[#E5DDD0] rounded text-xs focus:outline-none focus:border-[#8B5E3C]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-[#6A5B4D] mb-1">
                  Education
                </label>
                <input
                  type="text"
                  value={editEducation}
                  onChange={(e) => setEditEducation(e.target.value)}
                  className="w-full p-2 bg-[#FAF7F2] border border-[#E5DDD0] rounded text-xs focus:outline-none focus:border-[#8B5E3C]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-[#6A5B4D] mb-1">
                    Blood Group
                  </label>
                  <select
                    value={editBloodGroup}
                    onChange={(e) => setEditBloodGroup(e.target.value)}
                    className="w-full p-2 bg-[#FAF7F2] border border-[#E5DDD0] rounded text-xs font-semibold text-[#8B5E3C] focus:outline-none focus:border-[#8B5E3C]"
                  >
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                      <option key={bg} value={bg}>
                        {bg}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-[#6A5B4D] mb-1">
                    Vital Status
                  </label>
                  <select
                    value={editIsAlive ? 'ALIVE' : 'DECEASED'}
                    onChange={(e) => setEditIsAlive(e.target.value === 'ALIVE')}
                    className="w-full p-2 bg-[#FAF7F2] border border-[#E5DDD0] rounded text-xs font-semibold text-[#2D2D2D] focus:outline-none focus:border-[#8B5E3C]"
                  >
                    <option value="ALIVE">Alive</option>
                    <option value="DECEASED">Deceased</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-[#6A5B4D] mb-1">
                  Mobile Number
                </label>
                <input
                  type="text"
                  value={editMobile}
                  onChange={(e) => setEditMobile(e.target.value)}
                  placeholder="e.g. 9876543210"
                  className="w-full p-2 bg-[#FAF7F2] border border-[#E5DDD0] rounded text-xs focus:outline-none focus:border-[#8B5E3C]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-[#6A5B4D] mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  placeholder="e.g. member@email.com"
                  className="w-full p-2 bg-[#FAF7F2] border border-[#E5DDD0] rounded text-xs focus:outline-none focus:border-[#8B5E3C]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#E5DDD0]">
                <button
                  type="button"
                  onClick={() => setEditingMember(null)}
                  className="px-3.5 py-1.5 border border-[#E5DDD0] text-[#6A5B4D] text-xs font-semibold rounded hover:bg-[#FAF7F2] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingQuickEdit}
                  className="px-4 py-1.5 bg-[#8B5E3C] hover:bg-[#704A2E] text-white text-xs font-semibold rounded shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {isSubmittingQuickEdit ? 'Submitting...' : 'Submit Quick Edit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Pending Request Details Modal */}
      {activePendingRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-lg border border-[#E5DDD0] shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-[#E5DDD0] pb-3">
              <h3 className="text-base font-serif font-bold text-[#8B5E3C] flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-600" />
                Pending Update Details
              </h3>
              <button
                type="button"
                onClick={() => setActivePendingRequest(null)}
                className="text-gray-400 hover:text-gray-600 font-bold text-sm"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs space-y-2">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded text-amber-900">
                <strong>Member:</strong> {activePendingRequest.memberName}
                <div className="text-[11px] text-amber-800 mt-0.5">
                  Submitted on {new Date(activePendingRequest.request.createdAt).toLocaleDateString()} &bull; Status: Pending Ghatak Admin Review
                </div>
              </div>

              <div className="space-y-2 pt-1">
                <h4 className="font-bold text-[#6A5B4D] uppercase text-[10px] tracking-wider">
                  Proposed Changes:
                </h4>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {activePendingRequest.request.changes.map((ch, idx) => (
                    <div key={idx} className="p-2.5 bg-[#FAF7F2] border border-[#E5DDD0] rounded flex flex-col gap-0.5">
                      <div className="font-bold text-[#8B5E3C] uppercase text-[10px]">
                        {ch.fieldName}
                      </div>
                      <div className="flex items-center gap-2 text-[11px]">
                        <span className="line-through text-gray-400">{renderValue(ch.oldValue)}</span>
                        <span className="text-gray-400">&rarr;</span>
                        <span className="font-semibold text-emerald-800">{renderValue(ch.newValue)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-[#E5DDD0]">
              <button
                type="button"
                onClick={() => setActivePendingRequest(null)}
                className="px-4 py-1.5 bg-[#8B5E3C] hover:bg-[#704A2E] text-white text-xs font-semibold rounded shadow-xs cursor-pointer"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
