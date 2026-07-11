'use client';

import React, { useState, useTransition } from 'react';
import { approveJoinRequestAction, rejectJoinRequestAction } from '@/app/actions/join-request';
import { 
  User, 
  Phone, 
  Mail, 
  Globe, 
  MapPin, 
  Home, 
  Check, 
  X, 
  Clock, 
  CheckCircle2, 
  XCircle 
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { useConfirm } from '@/context/ConfirmContext';

type JoinRequest = {
  id: string;
  fullName: string;
  mobileNumber: string;
  email: string;
  country: string;
  city: string;
  indiaHometown: string;
  kutchVillage: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | string;
  createdAt: Date;
  updatedAt: Date;
};

export default function JoinRequestsClient({
  initialRequests,
  verifierId,
}: {
  initialRequests: any[];
  verifierId: string;
}) {
  const [requests, setRequests] = useState<JoinRequest[]>(initialRequests as JoinRequest[]);
  const [activeTab, setActiveTab] = useState<'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');
  const [isPendingAction, startTransition] = useTransition();
  const confirm = useConfirm();

  const filteredRequests = requests.filter(req => req.status === activeTab);

  const handleApprove = async (id: string) => {
    const isConfirmed = await confirm({
      title: 'Approve Enrollment Request',
      message: 'Are you sure you want to approve this family enrollment request and enroll them into the census portal?',
    });

    if (!isConfirmed) return;

    startTransition(async () => {
      const result = await approveJoinRequestAction(id, verifierId);
      if (result?.error) {
        toast.error(result.error);
      } else if (result?.success) {
        toast.success('Request approved! Family created.');
        setRequests(prev => 
          prev.map(r => r.id === id ? { ...r, status: 'APPROVED' } : r)
        );
      }
    });
  };

  const handleReject = async (id: string) => {
    const isConfirmed = await confirm({
      title: 'Reject Enrollment Request',
      message: 'Are you sure you want to reject this family enrollment request?',
    });

    if (!isConfirmed) return;

    startTransition(async () => {
      const result = await rejectJoinRequestAction(id, verifierId);
      if (result?.error) {
        toast.error(result.error);
      } else if (result?.success) {
        toast.success('Request rejected.');
        setRequests(prev => 
          prev.map(r => r.id === id ? { ...r, status: 'REJECTED' } : r)
        );
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex border-b border-[#E5DDD0]">
        {(['PENDING', 'APPROVED', 'REJECTED'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`py-3 px-6 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === tab
                ? 'border-[#8B5E3C] text-[#8B5E3C]'
                : 'border-transparent text-[#6A5B4D] hover:text-[#8B5E3C]'
            }`}
          >
            {tab.charAt(0) + tab.slice(1).toLowerCase()} ({requests.filter(r => r.status === tab).length})
          </button>
        ))}
      </div>

      {/* Grid of Request Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredRequests.length === 0 ? (
          <div className="md:col-span-2 bg-white p-12 text-center text-sm text-[#6A5B4D] border border-[#E5DDD0] rounded-lg">
            No {activeTab.toLowerCase()} enrollment requests found.
          </div>
        ) : (
          filteredRequests.map((req) => (
            <div 
              key={req.id} 
              className="bg-white p-6 rounded-lg border border-[#E5DDD0] shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden"
            >
              {/* Top Banner Accent */}
              <div className={`absolute top-0 left-0 right-0 h-1 ${
                req.status === 'PENDING' ? 'bg-[#D4A373]' :
                req.status === 'APPROVED' ? 'bg-green-500' : 'bg-red-400'
              }`} />

              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-serif font-bold text-[#8B5E3C]">
                      {req.fullName}
                    </h3>
                    <p className="text-xs text-[#6A5B4D] mt-0.5">
                      Submitted on: {format(new Date(req.createdAt), 'dd MMM yyyy, hh:mm a')}
                    </p>
                  </div>
                  
                  {/* Status Badges */}
                  {req.status === 'PENDING' && (
                    <span className="flex items-center gap-1 text-xs font-bold text-[#D4A373] bg-[#FAF7F2] border border-[#E5DDD0] px-2.5 py-1 rounded-full uppercase tracking-wider">
                      <Clock className="w-3.5 h-3.5" />
                      Pending
                    </span>
                  )}
                  {req.status === 'APPROVED' && (
                    <span className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 border border-green-200 px-2.5 py-1 rounded-full uppercase tracking-wider">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Approved
                    </span>
                  )}
                  {req.status === 'REJECTED' && (
                    <span className="flex items-center gap-1 text-xs font-bold text-red-600 bg-red-50 border border-red-200 px-2.5 py-1 rounded-full uppercase tracking-wider">
                      <XCircle className="w-3.5 h-3.5" />
                      Rejected
                    </span>
                  )}
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-4 pt-3 border-t border-[#FAF7F2] text-xs text-[#6A5B4D]">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-[#B08968] shrink-0" />
                    <span className="truncate">{req.mobileNumber}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-[#B08968] shrink-0" />
                    <span className="truncate">{req.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-[#B08968] shrink-0" />
                    <span className="truncate">{req.city}, {req.country}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Home className="w-4 h-4 text-[#B08968] shrink-0" />
                    <span className="truncate">Kutch: {req.kutchVillage}</span>
                  </div>
                  <div className="col-span-2 flex items-center gap-2 pt-1">
                    <MapPin className="w-4 h-4 text-[#B08968] shrink-0" />
                    <span className="truncate">India Hometown: {req.indiaHometown || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons (Pending only) */}
              {req.status === 'PENDING' && (
                <div className="flex gap-3 mt-6 pt-4 border-t border-[#FAF7F2]">
                  <button
                    onClick={() => handleReject(req.id)}
                    disabled={isPendingAction}
                    className="flex-1 py-2 border border-red-200 hover:bg-red-50 text-red-600 font-semibold text-xs rounded transition-all flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                  >
                    <X className="w-3.5 h-3.5" />
                    Reject
                  </button>
                  <button
                    onClick={() => handleApprove(req.id)}
                    disabled={isPendingAction}
                    className="flex-1 py-2 bg-[#8B5E3C] hover:bg-[#704A2E] text-white font-semibold text-xs rounded transition-all shadow-sm flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                  >
                    <Check className="w-3.5 h-3.5 text-white" />
                    Approve & Enroll
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
