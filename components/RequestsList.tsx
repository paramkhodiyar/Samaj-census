'use client';

import React, { useState, startTransition } from 'react';
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
  Eye, 
  MessageSquare,
  FileCheck,
  ChevronRight,
  ArrowRight
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

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/dashboard/requests?page=1&search=${encodeURIComponent(search)}`);
  };

  const handlePageChange = (newPage: number) => {
    router.push(`/dashboard/requests?page=${newPage}&search=${encodeURIComponent(search)}`);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <CheckCircle className="w-5 h-5 text-emerald-600" />;
      case 'REJECTED':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'CORRECTION_REQUIRED':
        return <AlertCircle className="w-5 h-5 text-amber-600" />;
      default:
        return <Clock className="w-5 h-5 text-blue-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'REJECTED':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'CORRECTION_REQUIRED':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  };

  const handleProcess = async (status: 'APPROVED' | 'REJECTED' | 'CORRECTION_REQUIRED') => {
    if (!selectedRequest) return;
    
    if ((status === 'REJECTED' || status === 'CORRECTION_REQUIRED') && !comment.trim()) {
      toast.error('Please enter a comment explaining the rejection/correction reason.');
      return;
    }

    const isConfirmed = await confirm({
      title: `${status === 'APPROVED' ? 'Approve' : status === 'REJECTED' ? 'Reject' : 'Request Correction'} Update`,
      message: `Are you sure you want to mark this request as ${status.toLowerCase()}? This action is logged for audit purposes.`,
    });
    if (!isConfirmed) return;

    setIsProcessing(true);
    const result = await processCorrectionRequest(selectedRequest.id, status, comment || null);
    setIsProcessing(false);

    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success(`Request successfully mark as ${status.toLowerCase()}`);
      setSelectedRequest(null);
      setComment('');
      startTransition(() => {
        router.refresh();
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Side: Requests Queue */}
        <div className={`bg-white rounded-lg border border-[#E5DDD0] shadow-sm overflow-hidden ${
          selectedRequest ? 'lg:col-span-1' : 'lg:col-span-3'
        }`}>
          <div className="p-4 bg-[#FAF7F2] border-b border-[#E5DDD0] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="text-sm font-bold text-[#6A5B4D] uppercase tracking-wider">
              {isAdmin ? 'Verification Requests Queue' : 'My Correction Requests'}
            </h2>
            <form onSubmit={handleSearchSubmit} className="flex gap-1 shrink-0">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="px-2 py-1 bg-white border border-[#E5DDD0] rounded text-xs focus:outline-none focus:ring-1 focus:ring-[#8B5E3C] w-40"
              />
              <button
                type="submit"
                className="px-2.5 py-1 bg-[#8B5E3C] hover:bg-[#704A2E] text-white font-semibold text-[10px] rounded transition-colors cursor-pointer"
              >
                Go
              </button>
            </form>
          </div>

          <div className="divide-y divide-[#E5DDD0]">
            {requests.length === 0 ? (
              <div className="p-8 text-center text-sm text-[#6A5B4D]">
                No records found.
              </div>
            ) : (
              requests.map((req) => (
                <div
                  key={req.id}
                  onClick={() => setSelectedRequest(req)}
                  className={`p-4 flex items-center justify-between gap-4 cursor-pointer transition-colors ${
                    selectedRequest?.id === req.id ? 'bg-[#FAF7F2]' : 'hover:bg-[#FAF7F2]/45'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded border ${getStatusBadge(req.status)}`}>
                        {req.status}
                      </span>
                      <span className="text-[10px] text-[#6A5B4D]">
                        {format(new Date(req.createdAt), 'dd MMM yyyy')}
                      </span>
                    </div>
                    
                    <h3 className="font-semibold text-sm text-[#2D2D2D] mt-1.5 truncate">
                      Family: {req.family.headName} ({req.family.familyId})
                    </h3>
                    <p className="text-xs text-[#6A5B4D] mt-0.5 truncate">
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
                  className="px-2 py-1 border border-[#E5DDD0] rounded bg-white hover:bg-[#FAF7F2] disabled:opacity-50 disabled:hover:bg-white cursor-pointer"
                >
                  Prev
                </button>
                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page * pageSize >= totalCount}
                  className="px-2 py-1 border border-[#E5DDD0] rounded bg-white hover:bg-[#FAF7F2] disabled:opacity-50 disabled:hover:bg-white cursor-pointer"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Request Details & Side-by-Side Review */}
        {selectedRequest && (
          <div className="lg:col-span-2 bg-white rounded-lg border border-[#E5DDD0] shadow-sm overflow-hidden sticky top-24">
            
            {/* Detail Header */}
            <div className="p-5 bg-[#FAF7F2] border-b border-[#E5DDD0] flex justify-between items-center">
              <div>
                <span className="text-xs font-bold text-[#8B5E3C] uppercase tracking-wider">
                  Request Details
                </span>
                <h3 className="font-serif font-bold text-base text-[#2D2D2D] mt-0.5">
                  Family: {selectedRequest.family.headName} ({selectedRequest.family.familyId})
                </h3>
              </div>
              <button
                onClick={() => setSelectedRequest(null)}
                className="text-xs font-bold text-[#6A5B4D] hover:text-[#2D2D2D]"
              >
                {t('close')}
              </button>
            </div>

            {/* Changes list */}
            <div className="p-6 space-y-6 max-h-[50vh] overflow-y-auto">
              
              {/* Detailed field corrections */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-[#6A5B4D] uppercase tracking-wider border-b border-[#FAF7F2] pb-2">
                  Proposed Changes
                </h4>

                {selectedRequest.changes.map((change) => {
                  if (change.action === 'UPDATE_FIELD') {
                    return (
                      <div key={change.id} className="p-3 bg-[#FAF7F2]/50 border border-[#E5DDD0] rounded text-xs">
                        <span className="font-bold text-[#8B5E3C] uppercase text-[9px] tracking-wider block mb-2">
                          Field Update: {change.fieldName}
                        </span>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span className="text-[10px] text-[#6A5B4D] block uppercase font-bold">Old Value</span>
                            <span className="font-medium text-red-700 block mt-0.5 line-through">{change.oldValue || 'Empty'}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-[#6A5B4D] block uppercase font-bold">New Value</span>
                            <span className="font-semibold text-emerald-700 block mt-0.5">{change.newValue || 'Empty'}</span>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  if (change.action === 'ADD_MEMBER') {
                    const m = JSON.parse(change.newValue!);
                    return (
                      <div key={change.id} className="p-4 bg-emerald-50/20 border border-emerald-100 rounded text-xs space-y-2">
                        <span className="font-bold text-emerald-800 uppercase text-[9px] tracking-wider block">
                          Add New Member Profile
                        </span>
                        <div className="grid grid-cols-2 gap-2 text-xs">
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
                      <div key={change.id} className="p-4 bg-red-50/20 border border-red-100 rounded text-xs space-y-2">
                        <span className="font-bold text-red-800 uppercase text-[9px] tracking-wider block">
                          Remove Member
                        </span>
                        <p className="font-semibold text-red-950">Member Name: {d.name}</p>
                        <p><span className="font-bold text-[#6A5B4D]">Reason for Removal:</span> {d.reason}</p>
                      </div>
                    );
                  }

                  if (change.action === 'TRANSFER_MEMBER') {
                    const d = JSON.parse(change.newValue!);
                    return (
                      <div key={change.id} className="p-4 bg-amber-50/20 border border-amber-100 rounded text-xs space-y-2">
                        <span className="font-bold text-amber-800 uppercase text-[9px] tracking-wider block">
                          Transfer Member
                        </span>
                        <p className="font-semibold text-[#2D2D2D]">Member Name: {d.name}</p>
                        <p><span className="font-bold text-[#6A5B4D]">Target Family ID:</span> {d.targetFamilyId}</p>
                        <p><span className="font-bold text-[#6A5B4D]">Reason:</span> {d.reason}</p>
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
                    Verification Documents
                  </h4>
                  <div className="space-y-1.5 text-xs text-blue-600">
                    {selectedRequest.documents.map((doc) => (
                      <a
                        key={doc.id}
                        href={doc.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 hover:underline"
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

              {/* Rejection comments from previous actions */}
              {selectedRequest.status !== 'PENDING' && selectedRequest.comments && (
                <div className="p-3 bg-[#FAF7F2] rounded border border-[#E5DDD0] text-xs flex gap-2">
                  <MessageSquare className="w-4 h-4 text-[#8B5E3C] shrink-0" />
                  <div>
                    <span className="font-bold text-[#6A5B4D] block uppercase text-[9px] tracking-wider mb-1">
                      Verifier Comment
                    </span>
                    <p className="text-[#2D2D2D] font-semibold">"{selectedRequest.comments}"</p>
                  </div>
                </div>
              )}
            </div>

            {/* Admin Verification Controls */}
            {isAdmin && selectedRequest.status === 'PENDING' && (
              <div className="p-5 border-t border-[#E5DDD0] bg-[#FAF7F2] space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#6A5B4D] uppercase tracking-wider mb-1.5">
                    Verification Comment (Required for Rejection / Corrections request)
                  </label>
                  <input
                    type="text"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Enter review explanation or instructions..."
                    className="px-3 py-2 w-full bg-white border border-[#E5DDD0] rounded text-xs focus:outline-none"
                  />
                </div>

                <div className="flex flex-wrap gap-2.5 justify-end">
                  <button
                    onClick={() => handleProcess('CORRECTION_REQUIRED')}
                    disabled={isProcessing}
                    className="px-3.5 py-2 border border-[#D4A373] text-[#8B5E3C] hover:bg-[#D4A373]/10 rounded font-semibold text-xs transition-colors disabled:opacity-50"
                  >
                    Request Corrections
                  </button>
                  <button
                    onClick={() => handleProcess('REJECTED')}
                    disabled={isProcessing}
                    className="px-3.5 py-2 border border-red-300 text-red-700 hover:bg-red-50 rounded font-semibold text-xs transition-colors disabled:opacity-50"
                  >
                    Reject Request
                  </button>
                  <button
                    onClick={() => handleProcess('APPROVED')}
                    disabled={isProcessing}
                    className="px-4 py-2 bg-[#8B5E3C] text-white hover:bg-[#704A2E] rounded font-semibold text-xs shadow-sm transition-colors disabled:opacity-50 flex items-center gap-1"
                  >
                    <FileCheck className="w-3.5 h-3.5" />
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
