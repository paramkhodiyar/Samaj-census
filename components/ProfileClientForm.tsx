'use client';

import React, { useActionState, useEffect, useRef } from 'react';
import { changePasswordAction } from '@/app/actions/auth';
import { Lock, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';

interface ProfileClientFormProps {
  userId: string;
}

export default function ProfileClientForm({ userId }: ProfileClientFormProps) {
  const [state, formAction, isPending] = useActionState(changePasswordAction, null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.error) {
      toast.error(state.error);
    } else if (state?.success) {
      toast.success('Password updated successfully!');
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      <h3 className="text-xs font-bold text-[#6A5B4D] uppercase tracking-wider border-b border-[#FAF7F2] pb-2 flex items-center gap-2">
        <ShieldAlert className="w-4 h-4 text-[#8B5E3C]" />
        Change Password
      </h3>

      <input type="hidden" name="userId" value={userId} />

      <div>
        <label className="block text-[10px] font-bold text-[#6A5B4D] uppercase tracking-wider mb-1">
          New Password
        </label>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-[#6A5B4D]/75">
            <Lock className="w-3.5 h-3.5" />
          </span>
          <input
            type="password"
            name="password"
            required
            placeholder="Minimum 6 characters"
            className="pl-8 pr-3 py-1.5 w-full bg-[#FAF7F2] border border-[#E5DDD0] rounded text-xs focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label className="block text-[10px] font-bold text-[#6A5B4D] uppercase tracking-wider mb-1">
          Confirm New Password
        </label>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-[#6A5B4D]/75">
            <Lock className="w-3.5 h-3.5" />
          </span>
          <input
            type="password"
            name="confirmPassword"
            required
            placeholder="Confirm password"
            className="pl-8 pr-3 py-1.5 w-full bg-[#FAF7F2] border border-[#E5DDD0] rounded text-xs focus:outline-none"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full mt-2 py-2 bg-[#8B5E3C] hover:bg-[#704A2E] text-white font-semibold rounded text-xs shadow-sm transition-colors disabled:opacity-50"
      >
        {isPending ? 'Updating...' : 'Update Password'}
      </button>
    </form>
  );
}
