'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslation } from '@/context/I18nContext';
import { BookOpen, ArrowRight, Globe, Lock, ShieldAlert } from 'lucide-react';

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

          <div className="w-20 h-20 rounded-full bg-[#FAF7F2] border border-[#D4A373] flex items-center justify-center mx-auto mb-6 overflow-hidden p-2">
            <img
              src="/logo.svg"
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

          {/* Portals Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto mt-10 text-left">
            {/* Residents of India Portal Card (Locked) */}
            <div className="flex flex-col justify-between p-6 bg-gray-50/50 rounded-xl border border-dashed border-gray-300 relative group select-none">
              {/* Coming Soon Badge */}
              <div className="absolute top-4 right-4 bg-gray-200/80 text-gray-600 text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider">
                {t('comingSoon')}
              </div>
              
              <div>
                {/* Icon Wrapper */}
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4 text-gray-400">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-serif font-bold text-gray-500 mb-2">
                  {t('residentsPortalTitle')}
                </h3>
                <p className="text-sm text-gray-400 font-sans leading-relaxed mb-6">
                  {t('residentsPortalDesc')}
                </p>
              </div>

              <div className="w-full py-3 bg-gray-100 text-gray-400 rounded-md font-semibold text-sm flex items-center justify-center gap-2 cursor-not-allowed border border-gray-200">
                <Lock className="w-4 h-4" />
                {t('locked')}
              </div>
            </div>

            {/* NRI Portal Card (Active) */}
            <div className="flex flex-col justify-between p-6 bg-white rounded-xl border-2 border-[#8B5E3C] shadow-md relative group hover:shadow-lg transition-shadow">
              {/* Active Badge */}
              <div className="absolute top-4 right-4 bg-[#FAF7F2] text-[#8B5E3C] text-xs font-semibold px-2.5 py-1 rounded-full border border-[#D4A373] uppercase tracking-wider">
                {t('active')}
              </div>

              <div>
                {/* Icon Wrapper */}
                <div className="w-12 h-12 rounded-full bg-[#FAF7F2] border border-[#D4A373] flex items-center justify-center mb-4 text-[#8B5E3C]">
                  <Globe className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-serif font-bold text-[#8B5E3C] mb-2">
                  {t('nriPortalTitle')}
                </h3>
                <p className="text-sm text-[#6A5B4D] font-sans leading-relaxed mb-6">
                  {t('nriPortalDesc')}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/login"
                  className="flex-1 px-4 py-3 bg-[#8B5E3C] text-white rounded-md font-semibold text-sm transition-colors hover:bg-[#704A2E] shadow-sm flex items-center justify-center gap-1.5 group text-center"
                >
                  {t('enterPortal')}
                  <ArrowRight className="w-4 h-4 text-[#FAF7F2] group-hover:translate-x-0.5 transition-transform" />
                </Link>
                <Link
                  href="/register"
                  className="flex-1 px-4 py-3 bg-white border border-[#8B5E3C] text-[#8B5E3C] rounded-md font-semibold text-sm transition-colors hover:bg-[#FAF7F2] flex items-center justify-center text-center"
                >
                  {t('registerNow')}
                </Link>
              </div>
            </div>
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
