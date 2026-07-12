'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { forgotPasswordSendOtpAction } from '@/app/actions/auth';
import { Phone, ArrowLeft, KeyRound } from 'lucide-react';
import { toast } from 'sonner';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [mobileNumber, setMobileNumber] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mobileNumber || mobileNumber.length < 10) {
      toast.error('Please enter a valid 10-digit mobile number');
      return;
    }

    setIsSending(true);
    try {
      const result = await forgotPasswordSendOtpAction(mobileNumber);
      if (result.error) {
        toast.error(result.error);
      } else if (result.success) {
        toast.success('Verification code sent successfully to WhatsApp!');
        router.push(`/reset-password?mobile=${encodeURIComponent(mobileNumber)}`);
      }
    } catch (err) {
      toast.error('Failed to send verification code. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#FAF7F2] text-[#2D2D2D] font-sans">
      <header className="flex justify-between items-center p-6 max-w-7xl w-full mx-auto">
        <Link href="/login" className="flex items-center gap-2 text-[#8B5E3C] hover:text-[#704A2E] font-medium text-sm">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Login</span>
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md bg-white p-8 md:p-10 rounded-lg border border-[#E5DDD0] shadow-md space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-[#FAF7F2] border border-[#E5DDD0] flex items-center justify-center mx-auto text-[#8B5E3C]">
              <KeyRound className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-serif font-bold text-[#8B5E3C]">Forgot Password?</h1>
            <p className="text-sm text-[#6A5B4D]">
              Enter your registered mobile number. We will send you a 6-digit OTP code on WhatsApp to reset your password.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#6A5B4D] mb-1.5">
                Registered Mobile Number
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-[#6A5B4D]/70">
                  <Phone className="w-4 h-4" />
                </span>
                <input
                  type="tel"
                  required
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  placeholder="e.g. 9876543210"
                  className="pl-10 pr-4 py-2.5 w-full bg-[#FAF7F2] border border-[#E5DDD0] rounded-md focus:outline-none focus:ring-1 focus:ring-[#8B5E3C] focus:border-[#8B5E3C] text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSending}
              className="w-full mt-2 py-3 bg-[#8B5E3C] text-white font-semibold rounded-md shadow hover:bg-[#704A2E] focus:outline-none disabled:bg-[#8B5E3C]/60 text-sm cursor-pointer transition-colors"
            >
              {isSending ? 'Sending OTP...' : 'Send Reset Code'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
