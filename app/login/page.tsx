'use client';

import React, { useState, useActionState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslation } from '@/context/I18nContext';
import { loginAction, loginOtpAction, sendOtpAction, checkMobileNumberAction } from '@/app/actions/auth';
import { Phone, Lock, Key, Globe, ArrowLeft, ShieldCheck, AlertCircle, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';

export default function LoginPage() {
  const { language, setLanguage, t } = useTranslation();
  const [loginMode, setLoginMode] = useState<'password' | 'otp'>('password');
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [mobileStatus, setMobileStatus] = useState<'IDLE' | 'ACTIVE' | 'BLOCKED_NON_HEAD' | 'NOT_ACTIVATED' | 'UNREGISTERED'>('IDLE');

  // Password Login State
  const [pwdState, pwdFormAction, isPwdPending] = useActionState(loginAction, null);

  // OTP Login State
  const [otpState, otpFormAction, isOtpPending] = useActionState(loginOtpAction, null);

  // Display errors if server action fails
  useEffect(() => {
    if (pwdState?.error) {
      if (pwdState.error === 'BLOCKED_NON_HEAD') {
        setMobileStatus('BLOCKED_NON_HEAD');
      } else if (pwdState.error === 'NOT_ACTIVATED') {
        setMobileStatus('NOT_ACTIVATED');
      } else if (pwdState.error === 'UNREGISTERED') {
        setMobileStatus('UNREGISTERED');
      } else {
        toast.error(pwdState.error);
      }
    }
  }, [pwdState]);

  useEffect(() => {
    if (otpState?.error) {
      if (otpState.error === 'BLOCKED_NON_HEAD') {
        setMobileStatus('BLOCKED_NON_HEAD');
      } else if (otpState.error === 'NOT_ACTIVATED') {
        setMobileStatus('NOT_ACTIVATED');
      } else if (otpState.error === 'UNREGISTERED') {
        setMobileStatus('UNREGISTERED');
      } else {
        toast.error(otpState.error);
      }
    }
  }, [otpState]);

  // Handle OTP request
  const handleSendOtp = async () => {
    if (!mobileNumber || mobileNumber.length < 10) {
      toast.error('Please enter a valid 10-digit mobile number');
      return;
    }

    setIsSendingOtp(true);
    
    // Check mobile status before sending OTP
    const check = await checkMobileNumberAction(mobileNumber);
    if (check.error) {
      setIsSendingOtp(false);
      toast.error(check.error);
      return;
    }
    
    if (check.status && check.status !== 'ACTIVE' && check.status !== 'NOT_ACTIVATED') {
      setIsSendingOtp(false);
      setMobileStatus(check.status as any);
      return;
    }

    const result = await sendOtpAction(mobileNumber);
    setIsSendingOtp(false);

    if (result?.error) {
      toast.error(result.error);
    } else if (result?.success) {
      setMobileStatus('ACTIVE');
      setOtpSent(true);
      toast.success('OTP sent successfully. Please check your WhatsApp.');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#FAF7F2] text-[#2D2D2D] font-sans">
      {/* Header with Language Selector and Back to Home */}
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

      {/* Main Login Box */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md bg-white p-8 md:p-10 rounded-lg border border-[#E5DDD0] shadow-md">
          {/* Logo Heading */}
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-full bg-[#FAF7F2] border border-[#D4A373] flex items-center justify-center mx-auto mb-3 text-[#8B5E3C]">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-serif font-bold text-[#8B5E3C]">{t('loginTitle')}</h1>
            <p className="text-sm text-[#6A5B4D] mt-1">{t('loginSubtitle')}</p>
          </div>

          {mobileStatus === 'IDLE' || mobileStatus === 'ACTIVE' ? (
            <>
              {/* Toggle Buttons */}
              <div className="grid grid-cols-2 gap-2 mb-6 p-1 bg-[#FAF7F2] rounded-md border border-[#E5DDD0]">
                <button
                  type="button"
                  onClick={() => {
                    setLoginMode('password');
                    setOtpSent(false);
                    setDevOtp(null);
                  }}
                  className={`py-2 text-sm font-semibold rounded ${
                    loginMode === 'password'
                      ? 'bg-[#8B5E3C] text-white shadow-sm'
                      : 'text-[#6A5B4D] hover:bg-[#E5DDD0]/50'
                  }`}
                >
                  {t('pwdLoginBtn')}
                </button>
                <button
                  type="button"
                  onClick={() => setLoginMode('otp')}
                  className={`py-2 text-sm font-semibold rounded ${
                    loginMode === 'otp'
                      ? 'bg-[#8B5E3C] text-white shadow-sm'
                      : 'text-[#6A5B4D] hover:bg-[#E5DDD0]/50'
                  }`}
                >
                  {t('otpLoginBtn')}
                </button>
              </div>

              {/* Mode 1: Mobile + Password Form */}
              {loginMode === 'password' && (
                <form action={pwdFormAction} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#6A5B4D] mb-1.5">
                      {t('mobileNumber')}
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-[#6A5B4D]/70">
                        <Phone className="w-4 h-4" />
                      </span>
                      <input
                        type="tel"
                        name="mobileNumber"
                        required
                        value={mobileNumber}
                        onChange={(e) => setMobileNumber(e.target.value)}
                        placeholder="e.g. 9876543210"
                        className="pl-10 pr-4 py-2.5 w-full bg-[#FAF7F2] border border-[#E5DDD0] rounded-md focus:outline-none focus:ring-1 focus:ring-[#8B5E3C] focus:border-[#8B5E3C] text-sm"
                      />
                    </div>
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
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="pl-10 pr-4 py-2.5 w-full bg-[#FAF7F2] border border-[#E5DDD0] rounded-md focus:outline-none focus:ring-1 focus:ring-[#8B5E3C] focus:border-[#8B5E3C] text-sm"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isPwdPending}
                    className="w-full mt-2 py-3 bg-[#8B5E3C] text-white font-semibold rounded-md shadow hover:bg-[#704A2E] focus:outline-none disabled:bg-[#8B5E3C]/60 text-sm"
                  >
                    {isPwdPending ? t('loading') : t('loginBtn')}
                  </button>
                </form>
              )}

              {/* Mode 2: Mobile + OTP Form */}
              {loginMode === 'otp' && (
                <div className="space-y-4">
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
                          className="px-4 py-2.5 bg-[#B08968] hover:bg-[#977150] text-white font-medium rounded-md shadow-sm text-sm whitespace-nowrap disabled:bg-[#B08968]/60"
                        >
                          {isSendingOtp ? t('loading') : t('sendOtp')}
                        </button>
                      )}
                    </div>
                  </div>

                  {otpSent && (
                    <form action={otpFormAction} className="space-y-4">
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
                            Testing Code auto-filled in toast: {devOtp}
                          </p>
                        )}
                      </div>

                      <div className="flex justify-between items-center text-xs">
                        <button
                          type="button"
                          onClick={() => setOtpSent(false)}
                          className="text-[#8B5E3C] font-semibold hover:underline"
                        >
                          Change Mobile Number
                        </button>
                        <button
                          type="button"
                          onClick={handleSendOtp}
                          className="text-[#B08968] font-semibold hover:underline"
                        >
                          Resend OTP
                        </button>
                      </div>

                      <button
                        type="submit"
                        disabled={isOtpPending}
                        className="w-full py-3 bg-[#8B5E3C] text-white font-semibold rounded-md shadow hover:bg-[#704A2E] focus:outline-none disabled:bg-[#8B5E3C]/60 text-sm"
                      >
                        {isOtpPending ? t('loading') : t('loginBtn')}
                      </button>
                    </form>
                  )}
                </div>
              )}

              {/* Development Quick Logins */}
              <div className="mt-6 pt-6 border-t border-[#E5DDD0]">
                <h4 className="text-xs font-bold text-[#6A5B4D] uppercase tracking-wider mb-3 text-center">
                  Quick Login (Dev Mode)
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setLoginMode('password');
                      setMobileNumber('9999999999');
                      setPassword('AdminPassword123!');
                    }}
                    className="py-2 px-3 border border-[#E5DDD0] hover:border-[#8B5E3C] rounded bg-[#FAF7F2] font-semibold text-[#8B5E3C] cursor-pointer"
                  >
                    Super Admin
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setLoginMode('password');
                      setMobileNumber('8888888888');
                      setPassword('Pradeshik123!');
                    }}
                    className="py-2 px-3 border border-[#E5DDD0] hover:border-[#8B5E3C] rounded bg-[#FAF7F2] font-semibold text-[#8B5E3C] cursor-pointer"
                  >
                    Pradeshik Admin
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setLoginMode('password');
                      setMobileNumber('7777777777');
                      setPassword('Ghatak123!');
                    }}
                    className="py-2 px-3 border border-[#E5DDD0] hover:border-[#8B5E3C] rounded bg-[#FAF7F2] font-semibold text-[#8B5E3C] cursor-pointer"
                  >
                    Ghatak Admin
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setLoginMode('password');
                      setMobileNumber('9876543210');
                      setPassword('UserPassword123!');
                    }}
                    className="py-2 px-3 border border-[#E5DDD0] hover:border-[#8B5E3C] rounded bg-[#FAF7F2] font-semibold text-[#8B5E3C] cursor-pointer"
                  >
                    Family Head
                  </button>
                </div>
              </div>

              {/* Registration Link */}
              <div className="mt-6 text-center text-sm border-t border-[#E5DDD0] pt-6">
                <span className="text-[#6A5B4D]">{t('dontHaveAccount')} </span>
                <Link href="/register" className="text-[#8B5E3C] font-bold hover:underline">
                  {t('registerNow')}
                </Link>
              </div>
            </>
          ) : (
            <div className="space-y-6">
              {mobileStatus === 'BLOCKED_NON_HEAD' && (
                <div className="space-y-6 text-center py-4">
                  <div className="w-14 h-14 rounded-full bg-amber-50 border border-amber-300 flex items-center justify-center mx-auto text-amber-600">
                    <AlertCircle className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-lg font-serif font-bold text-[#8B5E3C] mb-2">
                      Only Family Heads Can Log In
                    </h3>
                    <p className="text-sm text-[#6A5B4D] leading-relaxed">
                      Please log in using your Family Head's mobile number. Only family heads can access the census portal. If you need to make corrections or updates, ask your Family Head to log in and edit the family records.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMobileStatus('IDLE')}
                    className="w-full py-2.5 bg-[#8B5E3C] text-white font-semibold rounded hover:bg-[#704A2E] text-sm"
                  >
                    Try Another Number
                  </button>
                </div>
              )}

              {mobileStatus === 'NOT_ACTIVATED' && (
                <div className="space-y-6 text-center py-4">
                  <div className="w-14 h-14 rounded-full bg-blue-50 border border-blue-300 flex items-center justify-center mx-auto text-blue-600">
                    <ShieldAlert className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-lg font-serif font-bold text-[#8B5E3C] mb-2">
                      Account Not Activated Yet
                    </h3>
                    <p className="text-sm text-[#6A5B4D] leading-relaxed">
                      Your family is enrolled in our census database, but your online portal account is not yet activated. Please register to set up your password and log in.
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Link
                      href={`/register?mobile=${mobileNumber}`}
                      className="w-full py-2.5 bg-[#8B5E3C] text-white font-semibold rounded hover:bg-[#704A2E] text-sm flex items-center justify-center text-center"
                    >
                      Go to Registration
                    </Link>
                    <button
                      type="button"
                      onClick={() => setMobileStatus('IDLE')}
                      className="w-full py-2 bg-white border border-[#E5DDD0] text-[#6A5B4D] font-semibold rounded hover:bg-[#FAF7F2] text-sm"
                    >
                      Change Number
                    </button>
                  </div>
                </div>
              )}

              {mobileStatus === 'UNREGISTERED' && (
                <div className="space-y-6 py-2">
                  <div className="w-14 h-14 rounded-full bg-red-50 border border-red-300 flex items-center justify-center mx-auto text-red-600">
                    <AlertCircle className="w-7 h-7" />
                  </div>
                  
                  <div className="text-center">
                    <h3 className="text-lg font-serif font-bold text-[#8B5E3C] mb-2">
                      Mobile Number Not Found
                    </h3>
                    <p className="text-xs text-[#6A5B4D] leading-relaxed">
                      We couldn't find this mobile number in our census records. This usually happens in one of two cases:
                    </p>
                  </div>

                  <div className="space-y-3 bg-[#FAF7F2] p-4 rounded border border-[#E5DDD0] text-[11px] text-[#6A5B4D] text-left">
                    <div>
                      <span className="font-bold text-[#8B5E3C]">1. Are you a Family Member?</span>
                      <p className="mt-1 pl-3">
                        Please contact your Family Head and ask them to log in using their registered number. They can add or update your mobile number inside the family record.
                      </p>
                    </div>
                    <div className="border-t border-[#E5DDD0] pt-2">
                      <span className="font-bold text-[#8B5E3C]">2. Are you the Family Head of a new NRI Family?</span>
                      <p className="mt-1 pl-3">
                        If you are the Family Head of an NRI family not yet in our database, you can submit an enrollment request to the NRI Admin.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Link
                      href="/join-request"
                      className="w-full py-2.5 bg-[#8B5E3C] text-white font-semibold rounded hover:bg-[#704A2E] text-sm flex items-center justify-center text-center"
                    >
                      Request Family Enrollment
                    </Link>
                    <button
                      type="button"
                      onClick={() => setMobileStatus('IDLE')}
                      className="w-full py-2 bg-white border border-[#E5DDD0] text-[#6A5B4D] font-semibold rounded hover:bg-[#FAF7F2] text-sm"
                    >
                      Try Another Number
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Footer credits */}
      <footer className="py-6 text-center text-xs text-[#6A5B4D] bg-white border-t border-[#E5DDD0]">
        {t('footerCredits')}
      </footer>
    </div>
  );
}
