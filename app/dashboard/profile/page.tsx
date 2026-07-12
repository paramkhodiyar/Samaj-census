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

  // Load Audit Logs
  const auditLogs = await prisma.auditLog.findMany({
    where: user.role === 'SUPER_ADMIN' ? undefined : { userId: user.id },
    include: {
      user: { select: { mobileNumber: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: user.role === 'SUPER_ADMIN' ? 25 : 15,
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white p-6 rounded-lg border border-[#E5DDD0] shadow-sm">
        <h1 className="text-xl font-serif font-bold text-[#8B5E3C] md:text-2xl">
          Account Profile
        </h1>
        <p className="text-sm text-[#6A5B4D] mt-1">
          Manage your account configurations and view logs.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Columns: Info & Security */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Profile Details */}
          <div className="bg-white p-6 rounded-lg border border-[#E5DDD0] shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-[#6A5B4D] uppercase tracking-wider border-b border-[#FAF7F2] pb-2 flex items-center gap-2">
              <User className="w-4 h-4 text-[#8B5E3C]" />
              Account Information
            </h3>
            
            <div className="space-y-3.5 text-xs text-[#2D2D2D]">
              <div className="flex justify-between">
                <span className="text-[#6A5B4D] font-medium">Mobile Number</span>
                <span className="font-bold">{user.mobileNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6A5B4D] font-medium">Account Role</span>
                <span className="font-bold text-[#8B5E3C]">{user.role.replace('_', ' ')}</span>
              </div>
              {user.family && (
                <div className="flex justify-between">
                  <span className="text-[#6A5B4D] font-medium">Family ID</span>
                  <span className="font-bold text-[#8B5E3C]">{user.family.familyId}</span>
                </div>
              )}
            </div>
          </div>

          {/* Change Password Form (Client-side interactivity) */}
          <div className="bg-white p-6 rounded-lg border border-[#E5DDD0] shadow-sm">
            <ProfileClientForm />
          </div>

          {/* DPDP Compliance Card */}
          <DpdpProfileActions />

          {/* About App Portal credits */}
          <div className="bg-white p-6 rounded-lg border-2 border-double border-[#8B5E3C] shadow-sm text-center space-y-3 relative overflow-hidden">
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

        {/* Right Columns: Audit Logs */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-[#E5DDD0] shadow-sm overflow-hidden">
          <div className="p-4 bg-[#FAF7F2] border-b border-[#E5DDD0] flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#8B5E3C]" />
            <h3 className="text-xs font-bold text-[#6A5B4D] uppercase tracking-wider">
              {user.role === 'SUPER_ADMIN' ? 'Global System Audit Logs' : 'My Activity Audit Logs'}
            </h3>
          </div>

          <div className="divide-y divide-[#E5DDD0] text-xs">
            {auditLogs.length === 0 ? (
              <div className="p-8 text-center text-[#6A5B4D] italic">
                No activity records logged yet.
              </div>
            ) : (
              auditLogs.map((log) => (
                <div key={log.id} className="p-4 space-y-1 hover:bg-[#FAF7F2]/40 transition-colors">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#FAF7F2] border border-[#E5DDD0] text-[#8B5E3C] uppercase">
                      {log.action}
                    </span>
                    <span className="text-[10px] text-[#6A5B4D]">
                      {format(new Date(log.createdAt), 'dd MMM yyyy, hh:mm a')}
                    </span>
                  </div>
                  <p className="text-[#2D2D2D] font-medium text-xs mt-1.5">
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

      </div>
    </div>
  );
}
