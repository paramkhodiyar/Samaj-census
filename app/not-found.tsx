'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Compass } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#2D2D2D] font-sans flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white p-8 md:p-10 rounded-lg border border-[#E5DDD0] shadow-md text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-[#FAF7F2] border border-[#E5DDD0] flex items-center justify-center mx-auto text-[#8B5E3C] animate-pulse">
          <Compass className="w-8 h-8" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-3xl font-serif font-bold text-[#8B5E3C]">404</h1>
          <h2 className="text-lg font-bold text-[#2D2D2D]">Page Not Found</h2>
          <p className="text-sm text-[#6A5B4D] leading-relaxed">
            The page you are looking for does not exist or has been relocated under our new data privacy pathways.
          </p>
        </div>

        <div className="pt-2">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#8B5E3C] text-white font-semibold rounded hover:bg-[#704A2E] text-xs transition-colors shadow"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
