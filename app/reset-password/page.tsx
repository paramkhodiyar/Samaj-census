'use client';

import React, { useActionState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { forgotPasswordResetAction } from '@/app/actions/auth';
import { Key, Lock, ArrowLeft, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';

function ResetPasswordPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mobileNumber = searchParams.get('mobile') || '';

  const [state, formAction, isPending] = useActionState(forgotPasswordResetAction, null);

  useEffect(() => {
    if (state?.error) {
      toast.error(state.error);
    } else if (state?.success) {
      toast.success('Password reset successfully! Please log in with your new password.');
      router.push('/login');
    }
  }, [state, router]);

  return (
    <div className="flex flex-col min-h-screen bg-[#FAF7F2] text-[#2D2D2D] font-sans">
      <header className="flex justify-between items-center p-6 max-w-7xl w-full mx-auto">
        <Link href="/forgot-password" className="flex items-center gap-2 text-[#8B5E3C] hover:text-[#704A2E] font-medium text-sm">
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md bg-white p-8 md:p-10 rounded-lg border border-[#E5DDD0] shadow-md space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-[#FAF7F2] border border-[#E5DDD0] flex items-center justify-center mx-auto text-[#8B5E3C]">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-serif font-bold text-[#8B5E3C]">Reset Password</h1>
            <p className="text-sm text-[#6A5B4D]">
              Enter the 6-digit OTP code sent to your WhatsApp and choose your new password.
            </p>
          </div>

          <form action={formAction} className="space-y-4">
            <input type="hidden" name="mobileNumber" value={mobileNumber} />

            <div>
              <label className="block text-sm font-medium text-[#6A5B4D] mb-1.5">
                Verification OTP Code
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
            </div>

            <div>
              <label className="block text-sm font-medium text-[#6A5B4D] mb-1.5">
                New Password
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
                Confirm New Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-[#6A5B4D]/70">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type="password"
                  name="confirmPassword"
                  required
                  placeholder="Confirm password"
                  className="pl-10 pr-4 py-2.5 w-full bg-[#FAF7F2] border border-[#E5DDD0] rounded-md focus:outline-none focus:ring-1 focus:ring-[#8B5E3C] focus:border-[#8B5E3C] text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full mt-2 py-3 bg-[#8B5E3C] text-white font-semibold rounded-md shadow hover:bg-[#704A2E] focus:outline-none disabled:bg-[#8B5E3C]/60 text-sm cursor-pointer transition-colors"
            >
              {isPending ? 'Resetting Password...' : 'Reset Password'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center text-xs text-[#6A5B4D]">Loading...</div>}>
      <ResetPasswordPageContent />
    </Suspense>
  );
}
