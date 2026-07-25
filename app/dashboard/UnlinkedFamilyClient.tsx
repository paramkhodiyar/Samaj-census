'use client';

import React from 'react';
import Link from 'next/link';
import { Home, PlusCircle, Sparkles, ArrowRight, ShieldCheck, Users } from 'lucide-react';

export default function UnlinkedFamilyClient({ userEmail }: { userEmail?: string | null }) {
  return (
    <div className="max-w-3xl mx-auto space-y-6 py-6">
      {/* Welcome Hero Banner */}
      <div className="bg-white p-8 md:p-12 rounded-2xl border border-[#E5DDD0] shadow-sm text-center space-y-6 relative overflow-hidden">
        <div className="w-16 h-16 rounded-2xl bg-[#FAF7F2] border border-[#8B5E3C]/30 flex items-center justify-center mx-auto text-[#8B5E3C] shadow-xs">
          <Home className="w-8 h-8" />
        </div>

        <div className="space-y-3 max-w-xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF7F2] border border-[#E5DDD0] text-[#8B5E3C] text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> Family Head Portal Setup
          </div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-[#2D2D2D]">
            Welcome to Shri K.G.K. Samaj Census Portal!
          </h1>
          <p className="text-xs md:text-sm text-[#6A5B4D] leading-relaxed">
            Your Family Head online account is active. Since your family profile is not yet enrolled in our census database, click below to complete your official 3-step family enrollment wizard.
          </p>
        </div>

        {/* 3 Step Preview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 max-w-2xl mx-auto text-left text-xs">
          <div className="p-4 bg-[#FAF7F2] rounded-xl border border-[#E5DDD0] space-y-1">
            <span className="w-6 h-6 rounded-full bg-[#8B5E3C] text-white font-bold text-[11px] flex items-center justify-center mb-2">1</span>
            <p className="font-bold text-[#2D2D2D]">Head & Location</p>
            <p className="text-[11px] text-[#6A5B4D]">Head details & native village in Kutch</p>
          </div>
          <div className="p-4 bg-[#FAF7F2] rounded-xl border border-[#E5DDD0] space-y-1">
            <span className="w-6 h-6 rounded-full bg-[#8B5E3C] text-white font-bold text-[11px] flex items-center justify-center mb-2">2</span>
            <p className="font-bold text-[#2D2D2D]">Family Members</p>
            <p className="text-[11px] text-[#6A5B4D]">Enroll spouse, children, parents</p>
          </div>
          <div className="p-4 bg-[#FAF7F2] rounded-xl border border-[#E5DDD0] space-y-1">
            <span className="w-6 h-6 rounded-full bg-[#8B5E3C] text-white font-bold text-[11px] flex items-center justify-center mb-2">3</span>
            <p className="font-bold text-[#2D2D2D]">Review & Submit</p>
            <p className="text-[11px] text-[#6A5B4D]">DPDP statutory consent & save</p>
          </div>
        </div>

        <div className="pt-4">
          <Link
            href="/dashboard/family/create"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#8B5E3C] hover:bg-[#704A2E] text-white text-xs font-bold rounded-xl shadow-sm transition-all transform hover:-translate-y-0.5"
          >
            <PlusCircle className="w-5 h-5" />
            Start Family Census Enrollment (3 Steps)
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
      </div>
    </div>
  );
}
