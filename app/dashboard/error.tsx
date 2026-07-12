'use client';

import React, { useEffect } from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Dashboard Error:', error);
  }, [error]);

  return (
    <div className="bg-white p-8 rounded-lg border border-[#E5DDD0] shadow-sm max-w-lg mx-auto text-center space-y-6 my-12">
      <div className="w-12 h-12 rounded-full bg-red-50 border border-red-200 flex items-center justify-center mx-auto text-red-600">
        <AlertCircle className="w-6 h-6" />
      </div>

      <div className="space-y-2">
        <h2 className="text-lg font-serif font-bold text-[#8B5E3C]">An Error Occurred</h2>
        <p className="text-xs text-[#6A5B4D] leading-relaxed">
          We encountered an unexpected issue while retrieving your family census records. This could be due to a transient database connection state.
        </p>
      </div>

      <div className="flex justify-center pt-2">
        <button
          onClick={() => reset()}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#8B5E3C] hover:bg-[#704A2E] text-white rounded font-semibold text-xs transition-colors shadow cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Retry Request
        </button>
      </div>
    </div>
  );
}
