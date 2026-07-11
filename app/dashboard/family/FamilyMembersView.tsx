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
  GraduationCap
} from 'lucide-react';

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

export default function FamilyMembersView({ initialMembers }: { initialMembers: Member[] }) {
  const [viewMode, setViewMode] = useState<'TABLE' | 'GRID'>('TABLE');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

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

  // Reset page when search query changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredMembers.length / itemsPerPage) || 1;
  const paginatedMembers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredMembers.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredMembers, currentPage]);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filteredMembers.length);

  return (
    <div className="space-y-4">
      {/* Top Filter and Toggle Bar */}
      <div className="bg-white p-4 rounded-lg border border-[#E5DDD0] shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
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
                ? 'bg-[#8B5E3C] text-white shadow-sm'
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
                ? 'bg-[#8B5E3C] text-white shadow-sm'
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
        <div className="bg-white rounded-lg border border-[#E5DDD0] shadow-sm overflow-hidden">
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
                  <th className="px-6 py-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5DDD0] text-[#2D2D2D]">
                {paginatedMembers.map((member) => (
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
                    <td className="px-6 py-4 whitespace-nowrap">
                      {member.isAlive ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-green-50 border border-green-200 text-green-700 uppercase">
                          Alive
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-red-50 border border-red-200 text-red-700 uppercase">
                          Deceased
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* TILED GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {paginatedMembers.map((member) => (
            <div
              key={member.id}
              className={`bg-white rounded-lg border shadow-sm overflow-hidden flex flex-col justify-between transition-shadow hover:shadow-md ${
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
                
                {!member.isAlive && (
                  <span className="text-[9px] px-2 py-0.5 rounded font-bold border bg-red-50 text-red-700 border-red-200 uppercase">
                    Deceased
                  </span>
                )}
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

                {(member.mobile || member.email) && (
                  <div className="col-span-2 border-t border-[#FAF7F2] pt-3 space-y-1.5">
                    {member.mobile && (
                      <div className="flex gap-2 items-center text-[#6A5B4D]">
                        <Phone className="w-3.5 h-3.5 text-[#B08968] shrink-0" />
                        <span className="font-semibold text-xs text-[#2D2D2D]">{member.mobile}</span>
                      </div>
                    )}
                    {member.email && (
                      <div className="flex gap-2 items-center text-[#6A5B4D]">
                        <Mail className="w-3.5 h-3.5 text-[#B08968] shrink-0" />
                        <span className="font-semibold text-xs text-[#2D2D2D] truncate">{member.email}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Footer Controls */}
      {totalPages > 1 && (
        <div className="bg-white p-4 rounded-lg border border-[#E5DDD0] shadow-sm flex items-center justify-between text-xs text-[#6A5B4D]">
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
    </div>
  );
}
