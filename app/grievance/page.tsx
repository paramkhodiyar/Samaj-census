'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, UserCheck, ShieldAlert } from 'lucide-react';

export default function GrievancePage() {
  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#2D2D2D] font-sans selection:bg-[#D4A373] selection:text-[#FAF7F2] py-12 px-6">
      <div className="max-w-2xl mx-auto bg-white p-8 md:p-12 rounded-lg border border-[#E5DDD0] shadow-sm space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#FAF7F2] pb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#FAF7F2] border border-[#E5DDD0] flex items-center justify-center text-[#8B5E3C]">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-serif font-bold text-[#8B5E3C] md:text-2xl">
                Grievance Redressal
              </h1>
              <p className="text-xs text-[#6A5B4D] mt-0.5">
                DPDP Act 2023 Statutory Redressal Officer
              </p>
            </div>
          </div>
          <Link href="/login" className="flex items-center gap-1 text-[#8B5E3C] hover:underline font-semibold text-xs">
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Sign In
          </Link>
        </div>

        {/* Content */}
        <div className="space-y-6 text-sm text-[#2D2D2D] leading-relaxed">
          <p>
            Under the **Digital Personal Data Protection (DPDP) Act, 2023**, the KGK Samaj Census Committee has appointed a dedicated Grievance Officer to oversee data protection concerns, manage data principal requests, and resolve user disputes.
          </p>

          {/* Officer Details Card */}
          <div className="p-6 bg-[#FAF7F2] rounded border border-[#E5DDD0] space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#8B5E3C] border-b border-[#E5DDD0]/50 pb-1.5 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-[#8B5E3C]" />
              Appointed Grievance Officer
            </h3>
            <div className="space-y-2 text-xs">
              <p><span className="font-bold text-[#6A5B4D]">Name:</span> Param Khodiyar</p>
              <p><span className="font-bold text-[#6A5B4D]">Designation:</span> Lead Administrator & Systems Officer</p>
              <p><span className="font-bold text-[#6A5B4D]">Address:</span> KGK Samaj Census Office, India</p>
              <p><span className="font-bold text-[#6A5B4D]">Email Contact:</span> <span className="font-semibold text-[#8B5E3C]">grievance@kgksamaj.org</span></p>
              <p><span className="font-bold text-[#6A5B4D]">Escalation Line:</span> +91 98754 13483</p>
            </div>
          </div>

          <section className="space-y-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#8B5E3C]">
              Timeline & SLA for Resolution
            </h2>
            <p>
              In compliance with DPDP standards, our Grievance Officer is legally mandated to acknowledge all privacy queries within **48 hours** and finalize resolution or response actions within **7 business days** from receipt of a formal grievance.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#8B5E3C]">
              How to Raise a Grievance
            </h2>
            <p>
              Please submit a detailed email to our Grievance Officer specifying:
            </p>
            <ol className="list-decimal pl-5 space-y-1">
              <li>Your registered mobile number and Family ID.</li>
              <li>A clear description of the data protection or access issue.</li>
              <li>Any supporting evidence or requested correction details.</li>
            </ol>
          </section>
        </div>

        {/* Footer */}
        <div className="pt-6 border-t border-[#FAF7F2] text-center text-xs text-[#6A5B4D]">
          KGK Samaj Census Committee • Grievance Redressal Team
        </div>
      </div>
    </div>
  );
}
