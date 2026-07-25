import React from 'react';
import { prisma } from '@/lib/prisma';
import { getAuthSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import ProfileClientForm from '../../../components/ProfileClientForm';
import DpdpProfileActions from '@/components/DpdpProfileActions';
import { format } from 'date-fns';
import { User, Phone, Shield, FileText, Award } from 'lucide-react';

export default async function ProfilePage() {
  const session = await getAuthSession();

  if (!session) {
    redirect('/login');
  }

  // Fetch User & Audit Logs
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: {
      family: true,
    },
  });

  if (!user) {
    redirect('/login');
  }

  // Load Audit Logs (Max 20 records, UI scrolls after 5 visible items)
  const auditLogs = await prisma.auditLog.findMany({
    where: user.role === 'SUPER_ADMIN' ? undefined : { userId: user.id },
    include: {
      user: { select: { mobileNumber: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });

  const getRoleBadgeColor = (role: string) => {
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
      <div className="bg-white p-6 rounded-xl border border-[#E5DDD0] shadow-sm">
        <h1 className="text-xl font-serif font-bold text-[#8B5E3C] md:text-2xl">
          Account Profile
        </h1>
        <p className="text-xs text-[#6A5B4D] mt-1">
          Manage your account configurations, compliance preferences, and security logs.
        </p>
      </div>

      {/* Balanced 2-Column Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        
        {/* Left Column: Account Details & Security */}
        <div className="space-y-6">
          
          {/* Profile Details */}
          <div className="bg-white p-6 rounded-xl border border-[#E5DDD0] shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-[#6A5B4D] uppercase tracking-wider border-b border-[#FAF7F2] pb-2 flex items-center gap-2">
              <User className="w-4 h-4 text-[#8B5E3C]" />
              Account Information
            </h3>
            
            <div className="space-y-3 text-xs text-[#2D2D2D]">
              <div className="flex justify-between items-center">
                <span className="text-[#6A5B4D] font-medium">Primary Mobile</span>
                <span className="font-bold text-[#2D2D2D]">{user.mobileNumber}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#6A5B4D] font-medium">Account Role</span>
                <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${getRoleBadgeColor(user.role)}`}>
                  {user.role.replace('_', ' ')}
                </span>
              </div>
              {user.family && (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-[#6A5B4D] font-medium">Family Head</span>
                    <span className="font-bold text-[#8B5E3C]">{user.family.headName}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#6A5B4D] font-medium">Family ID</span>
                    <span className="font-bold text-[#8B5E3C]">{user.family.familyId}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Change Password Form */}
          <div className="bg-white p-6 rounded-xl border border-[#E5DDD0] shadow-sm">
            <ProfileClientForm />
          </div>

          {/* DPDP Compliance Card */}
          <DpdpProfileActions />

        </div>

        {/* Right Column: Capped Audit Logs & App Metadata */}
        <div className="space-y-6">

          {/* Activity Audit Logs (Showing max 5 logs with scroll) */}
          <div className="bg-white rounded-xl border border-[#E5DDD0] shadow-sm overflow-hidden">
            <div className="p-4 bg-[#FAF7F2] border-b border-[#E5DDD0] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#8B5E3C]" />
                <h3 className="text-xs font-bold text-[#6A5B4D] uppercase tracking-wider">
                  {user.role === 'SUPER_ADMIN' ? 'Global System Audit Logs' : 'My Activity Audit Logs'}
                </h3>
              </div>
              <span className="text-[10px] font-bold text-[#8B5E3C] bg-white px-2 py-0.5 rounded border border-[#E5DDD0]">
                {auditLogs.length} Total Logs
              </span>
            </div>

            {/* Scrollable container capped at max 5 visible logs (~340px) */}
            <div className="max-h-[340px] overflow-y-auto divide-y divide-[#E5DDD0]/70 text-xs">
              {auditLogs.length === 0 ? (
                <div className="p-8 text-center text-[#6A5B4D] italic">
                  No activity records logged yet.
                </div>
              ) : (
                auditLogs.map((log) => (
                  <div key={log.id} className="p-4 space-y-1.5 hover:bg-[#FAF7F2]/50 transition-colors">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#FAF7F2] border border-[#E5DDD0] text-[#8B5E3C] uppercase">
                        {log.action}
                      </span>
                      <span className="text-[10px] text-[#6A5B4D]">
                        {format(new Date(log.createdAt), 'dd MMM yyyy, hh:mm a')}
                      </span>
                    </div>
                    <p className="text-[#2D2D2D] font-medium text-xs">
                      {log.description}
                    </p>
                    {user.role === 'SUPER_ADMIN' && log.user && (
                      <p className="text-[9px] text-[#6A5B4D] font-semibold">
                        Triggered by: {log.user.mobileNumber}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* About App Portal credits */}
          <div className="bg-white p-6 rounded-xl border-2 border-double border-[#8B5E3C] shadow-sm text-center space-y-3 relative overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-[#FAF7F2] border border-[#D4A373] flex items-center justify-center mx-auto text-[#8B5E3C]">
              <Award className="w-4 h-4" />
            </div>
            <h4 className="font-serif font-bold text-sm text-[#8B5E3C]">
              Digital Family Record Portal
            </h4>
            <p className="text-[10px] text-[#6A5B4D] uppercase tracking-widest font-semibold">
              Version 1.0
            </p>
            <div className="w-16 h-[1px] bg-[#E5DDD0] mx-auto"></div>
            <p className="text-xs text-[#2D2D2D] leading-relaxed">
              Developed & Maintained by <br />
              <span className="font-bold text-[#8B5E3C]">Param Khodiyar</span>
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}
