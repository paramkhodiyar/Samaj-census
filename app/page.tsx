'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslation } from '@/context/I18nContext';
import { BookOpen, ArrowRight, Globe } from 'lucide-react';

export default function WelcomeSplash() {
  const { language, setLanguage, t } = useTranslation();

  return (
    <div className="flex flex-col min-h-screen bg-[#FAF7F2] text-[#2D2D2D] font-sans selection:bg-[#D4A373] selection:text-[#FAF7F2]">
      {/* Header Language Selector */}
      <header className="flex justify-end items-center p-6 max-w-7xl w-full mx-auto">
        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-md border border-[#E5DDD0] shadow-sm text-sm">
          <Globe className="w-4 h-4 text-[#8B5E3C]" />
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as any)}
            className="bg-transparent border-none outline-none font-medium text-[#8B5E3C] cursor-pointer"
          >
            <option value="en">English</option>
            <option value="hi">हिन्दी</option>
            <option value="gu">ગુજરાતી</option>
          </select>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12 max-w-4xl mx-auto w-full text-center">
        {/* Heritage Border Container */}
        <div className="w-full bg-white p-8 md:p-16 rounded-lg border-2 border-double border-[#8B5E3C] shadow-md relative overflow-hidden">
          {/* Subtle Traditional Divider Accent */}
          <div className="w-24 h-1 bg-[#D4A373] mx-auto mb-8 rounded-full"></div>

          {/* Community Logo */}
          <div className="w-20 h-20 rounded-full bg-[#FAF7F2] border border-[#D4A373] flex items-center justify-center mx-auto mb-6 overflow-hidden p-2">
            <img
              src="/logo.png"
              alt="Samaj Logo"
              className="w-full h-full object-contain"
            />
          </div>

          <h1 className="text-2xl md:text-4xl font-serif font-bold text-[#8B5E3C] tracking-wide mb-3">
            {t('samajTitle')}
          </h1>
          
          <h2 className="text-lg md:text-xl font-sans font-medium text-[#B08968] tracking-widest uppercase mb-12">
            {t('portalVision')}
          </h2>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-md mx-auto">
            <Link
              href="/login"
              className="w-full sm:w-auto px-8 py-3.5 bg-[#8B5E3C] text-white rounded-md font-semibold text-base transition-colors hover:bg-[#704A2E] shadow-md flex items-center justify-center gap-2 group"
            >
              {t('enterPortal')}
              <ArrowRight className="w-4 h-4 text-[#FAF7F2] group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/register"
              className="w-full sm:w-auto px-8 py-3.5 bg-white border-2 border-[#8B5E3C] text-[#8B5E3C] rounded-md font-semibold text-base transition-colors hover:bg-[#FAF7F2] shadow-sm flex items-center justify-center gap-2"
            >
              {t('registerNow')}
            </Link>
          </div>

          {/* Lotus Divider Motif */}
          <div className="mt-12 flex justify-center items-center gap-2">
            <div className="h-[1px] w-16 bg-[#E5DDD0]"></div>
            <BookOpen className="w-5 h-5 text-[#D4A373]" />
            <div className="h-[1px] w-16 bg-[#E5DDD0]"></div>
          </div>
        </div>
      </main>

      {/* Elegant Footer */}
      <footer className="py-6 border-t border-[#E5DDD0] text-center text-xs text-[#6A5B4D] tracking-wide bg-white">
        {t('footerCredits')}
      </footer>
    </div>
  );
}
