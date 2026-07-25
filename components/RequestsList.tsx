'use client';

import React, { useState, startTransition, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/context/I18nContext';
import { processCorrectionRequest } from '@/app/actions/requests';
import { toast } from 'sonner';
import { useConfirm } from '@/context/ConfirmContext';
import { 
  FileText, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Clock, 
  FileCheck,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { format } from 'date-fns';

interface RequestItem {
  id: string;
  type: string;
  status: string;
  comments: string | null;
  createdAt: Date;
  family: {
    familyId: string;
    headName: string;
  };
  requester: {
    mobileNumber: string;
  };
  changes: Array<{
    id: string;
    action: string;
    tableName: string;
    recordId: string | null;
    fieldName: string | null;
    oldValue: string | null;
    newValue: string | null;
  }>;
  documents: Array<{
    id: string;
    name: string;
    fileUrl: string;
  }>;
}

interface RequestsListProps {
  requests: RequestItem[];
  isAdmin: boolean;
  userId: string;
  totalCount: number;
  page: number;
  pageSize: number;
  search: string;
}

export default function RequestsList({ 
  requests, 
  isAdmin, 
  userId,
  totalCount,
  page,
  pageSize,
  search: initialSearch,
}: RequestsListProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const confirm = useConfirm();
  const [selectedRequest, setSelectedRequest] = useState<RequestItem | null>(null);
  const [comment, setComment] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [search, setSearch] = useState(initialSearch);

  // Client-side status filter
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/dashboard/requests?page=1&search=${encodeURIComponent(search)}`);
  };

  const handlePageChange = (newPage: number) => {
    router.push(`/dashboard/requests?page=${newPage}&search=${encodeURIComponent(search)}`);
  };

  const filteredRequests = useMemo(() => {
    if (statusFilter === 'ALL') return requests;
    return requests.filter((r) => r.status === statusFilter);
  }, [requests, statusFilter]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-[#3D7A4E]/10 text-[#3D7A4E] border-[#3D7A4E]/30';
      case 'REJECTED':
        return 'bg-[#B3452E]/10 text-[#B3452E] border-[#B3452E]/30';
      case 'CORRECTION_REQUIRED':
        return 'bg-[#C68A2E]/10 text-[#C68A2E] border-[#C68A2E]/30';
      default:
        return 'bg-[#3C6E8B]/10 text-[#3C6E8B] border-[#3C6E8B]/30';
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

  const handleProcess = async (status: 'APPROVED' | 'REJECTED' | 'CORRECTION_REQUIRED') => {
    if (!selectedRequest) return;
    
    if ((status === 'REJECTED' || status === 'CORRECTION_REQUIRED') && !comment.trim()) {
      toast.error('Please enter a comment explaining the reason before proceeding.');
      return;
    }

    const hasCriticalChange = selectedRequest.changes.some(
      (c) => c.action === 'REMOVE_MEMBER' || c.action === 'TRANSFER_MEMBER'
    );

    if (status === 'APPROVED' && hasCriticalChange) {
      const isConfirmed = await confirm({
        title: 'Confirm Critical Census Approval',
        message: `Approving this request will modify family membership count or head status for ${selectedRequest.family.headName}. Continue?`,
        confirmLabel: 'Approve & Update Family',
        cancelLabel: 'Cancel',
      });
      if (!isConfirmed) return;
    }

    setIsProcessing(true);
    const result = await processCorrectionRequest(selectedRequest.id, status, comment || null);
    setIsProcessing(false);

    if (result?.error) {
      toast.error(result.error);
    } else {
      if (status === 'APPROVED') {
        toast.success('Approved. The family record has been updated.');
      } else if (status === 'CORRECTION_REQUIRED') {
        toast.success(`Sent back to ${selectedRequest.family.headName} for correction.`);
      } else {
        toast.success('Request rejected.');
      }

      setSelectedRequest(null);
      setComment('');
      startTransition(() => {
        router.refresh();
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Filter Row */}
      <div className="bg-white p-4 rounded-lg border border-[#E5DDD0] shadow-xs flex flex-col md:flex-row gap-3 justify-between items-center">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by family name or ID..."
            className="px-3 py-2 bg-[#FAF7F2] border border-[#E5DDD0] rounded text-xs focus:outline-none focus:border-[#8B5E3C] w-full"
          />
        </form>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 text-xs">
          <span className="font-semibold text-[#6A5B4D] whitespace-nowrap">Filter Status:</span>
          {['ALL', 'PENDING', 'APPROVED', 'CORRECTION_REQUIRED', 'REJECTED'].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-2.5 py-1 rounded text-[11px] font-semibold border transition-colors cursor-pointer whitespace-nowrap ${
                statusFilter === st
                  ? 'bg-[#8B5E3C] text-white border-[#8B5E3C] shadow-xs'
                  : 'bg-white text-[#6A5B4D] border-[#E5DDD0] hover:bg-[#FAF7F2]'
              }`}
            >
              {st === 'ALL' ? 'All Requests' : st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Side: Requests Queue */}
        <div className={`bg-white rounded-lg border border-[#E5DDD0] shadow-xs overflow-hidden ${
          selectedRequest ? 'lg:col-span-1' : 'lg:col-span-3'
        }`}>
          <div className="p-4 bg-[#FAF7F2] border-b border-[#E5DDD0] flex justify-between items-center">
            <h2 className="text-xs font-bold text-[#6A5B4D] uppercase tracking-wider">
              {isAdmin ? 'Verification Requests Queue' : 'My Requests Status'}
            </h2>
            <span className="text-xs text-[#8B5E3C] font-semibold">
              {filteredRequests.length} Item(s)
            </span>
          </div>

          <div className="divide-y divide-[#E5DDD0]">
            {filteredRequests.length === 0 ? (
              <div className="p-12 text-center text-xs text-[#6A5B4D] space-y-2">
                <Sparkles className="w-8 h-8 text-[#B08968] mx-auto opacity-75" />
                <p className="font-semibold text-[#8B5E3C] text-sm">You're all caught up!</p>
                <p>No pending requests matching your current filter.</p>
              </div>
            ) : (
              filteredRequests.map((req) => (
                <div
                  key={req.id}
                  onClick={() => setSelectedRequest(req)}
                  className={`p-4 flex items-center justify-between gap-4 cursor-pointer transition-colors ${
                    selectedRequest?.id === req.id ? 'bg-[#FAF7F2]' : 'hover:bg-[#FAF7F2]/45'
                  }`}
                >
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded border ${getStatusBadge(req.status)}`}>
                        {req.status.replace('_', ' ')}
                      </span>
                      <span className="text-[10px] text-[#6A5B4D]">
                        {format(new Date(req.createdAt), 'dd MMM yyyy')}
                      </span>
                    </div>
                    
                    <h3 className="font-semibold text-xs text-[#2D2D2D] truncate">
                      Family: {req.family.headName} ({req.family.familyId})
                    </h3>
                    <p className="text-[11px] text-[#6A5B4D] truncate">
                      Type: {req.type.replace('_', ' ')}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#B08968]" />
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          {totalCount > pageSize && (
            <div className="p-4 bg-[#FAF7F2] border-t border-[#E5DDD0] flex justify-between items-center text-xs text-[#6A5B4D]">
              <span>Page {page} of {Math.ceil(totalCount / pageSize)}</span>
              <div className="flex gap-2">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page <= 1}
                  className="px-2.5 py-1 border border-[#E5DDD0] rounded bg-white hover:bg-[#FAF7F2] disabled:opacity-50 cursor-pointer"
                >
                  Prev
                </button>
                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page * pageSize >= totalCount}
                  className="px-2.5 py-1 border border-[#E5DDD0] rounded bg-white hover:bg-[#FAF7F2] disabled:opacity-50 cursor-pointer"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Request Details & Side-by-Side Review */}
        {selectedRequest && (
          <div className="lg:col-span-2 bg-white rounded-lg border border-[#E5DDD0] shadow-xs overflow-hidden sticky top-24">
            {/* Detail Header */}
            <div className="p-5 bg-[#FAF7F2] border-b border-[#E5DDD0] flex justify-between items-center">
              <div>
                <span className="text-[10px] font-bold text-[#8B5E3C] uppercase tracking-wider block">
                  Request Review & Decision
                </span>
                <h3 className="font-serif font-bold text-base text-[#2D2D2D] mt-0.5">
                  Family: {selectedRequest.family.headName} ({selectedRequest.family.familyId})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRequest(null)}
                className="text-xs font-bold text-[#6A5B4D] hover:text-[#2D2D2D] cursor-pointer"
              >
                Close
              </button>
            </div>

            {/* Changes list */}
            <div className="p-6 space-y-6 max-h-[55vh] overflow-y-auto">
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-[#6A5B4D] uppercase tracking-wider border-b border-[#FAF7F2] pb-2">
                  Side-by-Side Proposed Changes
                </h4>

                {selectedRequest.changes.map((change) => {
                  if (change.action === 'UPDATE_FIELD') {
                    return (
                      <div key={change.id} className="p-3.5 bg-[#FAF7F2]/50 border border-[#E5DDD0] rounded text-xs space-y-2">
                        <span className="font-bold text-[#8B5E3C] uppercase text-[10px] tracking-wider block">
                          Field Update: {change.fieldName}
                        </span>
                        <div className="grid grid-cols-2 gap-4 bg-white p-3 rounded border border-[#E5DDD0]">
                          <div>
                            <span className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Old Value</span>
                            <span className="font-medium text-gray-500 line-through block">{renderValue(change.oldValue)}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-[#3D7A4E] font-bold uppercase block mb-1">New Value</span>
                            <span className="font-bold text-[#3D7A4E] block">{renderValue(change.newValue)}</span>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  if (change.action === 'ADD_MEMBER') {
                    const m = JSON.parse(change.newValue!);
                    return (
                      <div key={change.id} className="p-4 bg-emerald-50/30 border border-emerald-200 rounded text-xs space-y-2">
                        <span className="font-bold text-[#3D7A4E] uppercase text-[10px] tracking-wider block">
                          Proposed New Member Profile
                        </span>
                        <div className="grid grid-cols-2 gap-2 text-xs bg-white p-3 rounded border border-emerald-100">
                          <p><span className="font-bold text-[#6A5B4D]">Name:</span> {m.name}</p>
                          <p><span className="font-bold text-[#6A5B4D]">Relation:</span> {m.relation}</p>
                          <p><span className="font-bold text-[#6A5B4D]">Age/Gender:</span> {m.age} Yrs / {m.gender}</p>
                          <p><span className="font-bold text-[#6A5B4D]">Blood Group:</span> {m.bloodGroup}</p>
                          <p><span className="font-bold text-[#6A5B4D]">Occupation:</span> {m.occupation}</p>
                          <p><span className="font-bold text-[#6A5B4D]">Education:</span> {m.education}</p>
                          {m.mobile && <p className="col-span-2"><span className="font-bold text-[#6A5B4D]">Mobile:</span> {m.mobile}</p>}
                        </div>
                      </div>
                    );
                  }

                  if (change.action === 'REMOVE_MEMBER') {
                    const d = JSON.parse(change.newValue!);
                    return (
                      <div key={change.id} className="p-4 bg-red-50/30 border border-red-200 rounded text-xs space-y-2">
                        <span className="font-bold text-[#B3452E] uppercase text-[10px] tracking-wider block">
                          Remove Member Request
                        </span>
                        <div className="bg-white p-3 rounded border border-red-100 space-y-1">
                          <p className="font-bold text-[#B3452E]">Member Name: {d.name}</p>
                          <p><span className="font-bold text-[#6A5B4D]">Reason:</span> {d.reason}</p>
                        </div>
                      </div>
                    );
                  }

                  if (change.action === 'TRANSFER_MEMBER') {
                    const d = JSON.parse(change.newValue!);
                    return (
                      <div key={change.id} className="p-4 bg-amber-50/30 border border-amber-200 rounded text-xs space-y-2">
                        <span className="font-bold text-[#C68A2E] uppercase text-[10px] tracking-wider block">
                          Transfer Member Request
                        </span>
                        <div className="bg-white p-3 rounded border border-amber-100 space-y-1">
                          <p className="font-bold text-[#2D2D2D]">Member Name: {d.name}</p>
                          <p><span className="font-bold text-[#6A5B4D]">Target Family ID:</span> {d.targetFamilyId}</p>
                          <p><span className="font-bold text-[#6A5B4D]">Reason:</span> {d.reason}</p>
                        </div>
                      </div>
                    );
                  }

                  return null;
                })}
              </div>

              {/* Documents Attachment List */}
              {selectedRequest.documents.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-[#6A5B4D] uppercase tracking-wider border-b border-[#FAF7F2] pb-2">
                    Verification Documents Attached
                  </h4>
                  <div className="space-y-1.5 text-xs">
                    {selectedRequest.documents.map((doc) => (
                      <a
                        key={doc.id}
                        href={doc.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 text-blue-700 hover:underline font-medium"
                      >
                        <FileText className="w-4 h-4 text-[#8B5E3C]" />
                        <span>{doc.name}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Remarks / Comments Section */}
              {selectedRequest.comments && (
                <div className="p-3 bg-[#FAF7F2] rounded border border-[#E5DDD0] text-xs">
                  <span className="font-bold text-[#6A5B4D] block uppercase text-[9px] tracking-wider mb-1">
                    Requester Remarks
                  </span>
                  <p className="text-[#2D2D2D] italic font-medium">"{selectedRequest.comments}"</p>
                </div>
              )}
            </div>

            {/* Admin Decision Controls */}
            {isAdmin && selectedRequest.status === 'PENDING' && (
              <div className="p-5 border-t border-[#E5DDD0] bg-[#FAF7F2] space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-[#6A5B4D] uppercase tracking-wider mb-1">
                    Verification Comment <span className="text-red-500">* (Required for Reject / Correction)</span>
                  </label>
                  <input
                    type="text"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Enter review decision explanation..."
                    className="px-3 py-2 w-full bg-white border border-[#E5DDD0] rounded text-xs focus:outline-none focus:border-[#8B5E3C]"
                  />
                </div>

                <div className="flex flex-wrap gap-2.5 justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => handleProcess('CORRECTION_REQUIRED')}
                    disabled={isProcessing || !comment.trim()}
                    className="px-3.5 py-2 border border-[#C68A2E] text-[#C68A2E] hover:bg-[#C68A2E]/10 rounded font-semibold text-xs transition-colors disabled:opacity-40 cursor-pointer"
                  >
                    Request Correction
                  </button>
                  <button
                    type="button"
                    onClick={() => handleProcess('REJECTED')}
                    disabled={isProcessing || !comment.trim()}
                    className="px-3.5 py-2 bg-[#B3452E] hover:bg-[#963723] text-white rounded font-semibold text-xs transition-colors disabled:opacity-40 cursor-pointer"
                  >
                    Reject Request
                  </button>
                  <button
                    type="button"
                    onClick={() => handleProcess('APPROVED')}
                    disabled={isProcessing}
                    className="px-4 py-2 bg-[#3D7A4E] hover:bg-[#326440] text-white rounded font-semibold text-xs shadow-xs transition-colors disabled:opacity-40 flex items-center gap-1.5 cursor-pointer"
                  >
                    <FileCheck className="w-4 h-4" />
                    Approve & Apply
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
