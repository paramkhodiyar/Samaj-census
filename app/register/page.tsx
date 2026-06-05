'use client';

import React, { useState, useActionState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslation } from '@/context/I18nContext';
import { registerAction, sendOtpAction } from '@/app/actions/auth';
import { Phone, Lock, Key, Globe, ArrowLeft, BookOpen, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

export default function RegisterPage() {
  const { language, setLanguage, t } = useTranslation();
  const [familyId, setFamilyId] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [devOtp, setDevOtp] = useState<string | null>(null);

  // Register State Hook
  const [regState, regFormAction, isPending] = useActionState(registerAction, null);

  // Watch for validation errors from registration submit
  useEffect(() => {
    if (regState?.error) {
      toast.error(regState.error);
    }
  }, [regState]);

  // Request OTP from server, matching family id and mobile
  const handleSendOtp = async () => {
    if (!familyId) {
      toast.error('Please enter your Family ID');
      return;
    }
    if (!mobileNumber || mobileNumber.length < 10) {
      toast.error('Please enter a valid 10-digit mobile number');
      return;
    }

    setIsSendingOtp(true);
    const result = await sendOtpAction(mobileNumber, familyId);
    setIsSendingOtp(false);

    if (result?.error) {
      toast.error(result.error);
    } else if (result?.success) {
      setOtpSent(true);
      if (result.otp) {
        setDevOtp(result.otp);
        toast.success(`OTP Sent! (For testing registration, enter code: ${result.otp})`, {
          duration: 15000,
        });
      } else {
        toast.success('OTP sent successfully.');
      }
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#FAF7F2] text-[#2D2D2D] font-sans">
      {/* Header with Language Selector and Back */}
      <header className="flex justify-between items-center p-6 max-w-7xl w-full mx-auto">
        <Link href="/" className="flex items-center gap-2 text-[#8B5E3C] hover:text-[#704A2E] font-medium text-sm">
          <ArrowLeft className="w-4 h-4" />
          <span>{t('back')}</span>
        </Link>
        
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

      {/* Register Wizard Container */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md bg-white p-8 md:p-10 rounded-lg border border-[#E5DDD0] shadow-md">
          {/* Logo Heading */}
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-full bg-[#FAF7F2] border border-[#D4A373] flex items-center justify-center mx-auto mb-3 text-[#8B5E3C]">
              <BookOpen className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-serif font-bold text-[#8B5E3C]">{t('registerTitle')}</h1>
            <p className="text-sm text-[#6A5B4D] mt-1">{t('registerSubtitle')}</p>
          </div>

          <div className="space-y-4">
            {/* Step 1: Input Family ID and Mobile */}
            <div>
              <label className="block text-sm font-medium text-[#6A5B4D] mb-1.5">
                {t('familyId')}
              </label>
              <input
                type="text"
                disabled={otpSent}
                value={familyId}
                onChange={(e) => setFamilyId(e.target.value)}
                placeholder="e.g. KG-2026-00123"
                className="px-4 py-2.5 w-full bg-[#FAF7F2] border border-[#E5DDD0] rounded-md focus:outline-none focus:ring-1 focus:ring-[#8B5E3C] focus:border-[#8B5E3C] text-sm disabled:opacity-75 uppercase"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#6A5B4D] mb-1.5">
                {t('mobileNumber')}
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-[#6A5B4D]/70">
                    <Phone className="w-4 h-4" />
                  </span>
                  <input
                    type="tel"
                    disabled={otpSent}
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    placeholder="e.g. 9876543210"
                    className="pl-10 pr-4 py-2.5 w-full bg-[#FAF7F2] border border-[#E5DDD0] rounded-md focus:outline-none focus:ring-1 focus:ring-[#8B5E3C] focus:border-[#8B5E3C] text-sm disabled:opacity-75"
                  />
                </div>
                {!otpSent && (
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={isSendingOtp}
                    className="px-4 py-2.5 bg-[#8B5E3C] hover:bg-[#704A2E] text-white font-medium rounded-md shadow-sm text-sm whitespace-nowrap disabled:bg-[#8B5E3C]/60"
                  >
                    {isSendingOtp ? t('loading') : t('sendOtp')}
                  </button>
                )}
              </div>
            </div>

            {/* Step 2: Show OTP Verification & Password creation after matching census */}
            {otpSent && (
              <form action={regFormAction} className="space-y-4 pt-2 border-t border-[#E5DDD0]">
                <input type="hidden" name="familyId" value={familyId} />
                <input type="hidden" name="mobileNumber" value={mobileNumber} />

                <div>
                  <label className="block text-sm font-medium text-[#6A5B4D] mb-1.5">
                    {t('enterOtp')}
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-[#6A5B4D]/70">
                      <Key className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      name="otp"
                      required
                      placeholder="6-digit code"
                      className="pl-10 pr-4 py-2.5 w-full bg-[#FAF7F2] border border-[#E5DDD0] rounded-md focus:outline-none focus:ring-1 focus:ring-[#8B5E3C] focus:border-[#8B5E3C] text-sm"
                    />
                  </div>
                  {devOtp && (
                    <p className="text-xs text-[#8B5E3C] mt-1 font-semibold">
                      Testing code: {devOtp} (shown in toast)
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#6A5B4D] mb-1.5">
                    {t('password')}
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-[#6A5B4D]/70">
                      <Lock className="w-4 h-4" />
                    </span>
                    <input
                      type="password"
                      name="password"
                      required
                      placeholder="Minimum 6 characters"
                      className="pl-10 pr-4 py-2.5 w-full bg-[#FAF7F2] border border-[#E5DDD0] rounded-md focus:outline-none focus:ring-1 focus:ring-[#8B5E3C] focus:border-[#8B5E3C] text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#6A5B4D] mb-1.5">
                    {t('confirmPassword')}
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-[#6A5B4D]/70">
                      <Lock className="w-4 h-4" />
                    </span>
                    <input
                      type="password"
                      name="confirmPassword"
                      required
                      placeholder="Repeat password"
                      className="pl-10 pr-4 py-2.5 w-full bg-[#FAF7F2] border border-[#E5DDD0] rounded-md focus:outline-none focus:ring-1 focus:ring-[#8B5E3C] focus:border-[#8B5E3C] text-sm"
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center text-xs text-[#8B5E3C]">
                  <button
                    type="button"
                    onClick={() => {
                      setOtpSent(false);
                      setDevOtp(null);
                    }}
                    className="font-semibold hover:underline"
                  >
                    Change Details
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full py-3 bg-[#8B5E3C] text-white font-semibold rounded-md shadow hover:bg-[#704A2E] focus:outline-none disabled:bg-[#8B5E3C]/60 text-sm"
                >
                  {isPending ? t('loading') : t('registerBtn')}
                </button>
              </form>
            )}
          </div>

          {/* Login Link */}
          <div className="mt-8 text-center text-sm border-t border-[#E5DDD0] pt-6">
            <span className="text-[#6A5B4D]">{t('alreadyHaveAccount')} </span>
            <Link href="/login" className="text-[#8B5E3C] font-bold hover:underline">
              {t('signInNow')}
            </Link>
          </div>
        </div>
      </main>

      {/* Footer credits */}
      <footer className="py-6 text-center text-xs text-[#6A5B4D] bg-white border-t border-[#E5DDD0]">
        {t('footerCredits')}
      </footer>
    </div>
  );
}
