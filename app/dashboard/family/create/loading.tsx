import React from 'react';

export default function FamilyCreateLoading() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4 animate-pulse">
      {/* Header Skeleton */}
      <div className="bg-white p-6 rounded-xl border border-[#E5DDD0] shadow-xs space-y-3">
        <div className="h-4 w-36 bg-[#E5DDD0]/60 rounded"></div>
        <div className="h-7 w-72 bg-[#E5DDD0] rounded"></div>
        <div className="h-4 w-96 bg-[#E5DDD0]/40 rounded"></div>
      </div>

      {/* Progress Steps Skeleton */}
      <div className="bg-white p-4 rounded-xl border border-[#E5DDD0] shadow-xs flex justify-between items-center px-8">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#E5DDD0]"></div>
          <div className="h-4 w-28 bg-[#E5DDD0]/60 rounded"></div>
        </div>
        <div className="h-0.5 w-16 bg-[#E5DDD0]/40"></div>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#E5DDD0]/50"></div>
          <div className="h-4 w-28 bg-[#E5DDD0]/40 rounded"></div>
        </div>
        <div className="h-0.5 w-16 bg-[#E5DDD0]/40"></div>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#E5DDD0]/50"></div>
          <div className="h-4 w-28 bg-[#E5DDD0]/40 rounded"></div>
        </div>
      </div>

      {/* Form Card Skeleton */}
      <div className="bg-white p-8 rounded-xl border border-[#E5DDD0] shadow-sm space-y-6">
        <div className="h-5 w-48 bg-[#E5DDD0] rounded"></div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <div className="h-3 w-32 bg-[#E5DDD0]/60 rounded"></div>
            <div className="h-11 w-full bg-[#FAF7F2] border border-[#E5DDD0] rounded"></div>
          </div>
          <div className="space-y-2">
            <div className="h-3 w-32 bg-[#E5DDD0]/60 rounded"></div>
            <div className="h-11 w-full bg-[#FAF7F2] border border-[#E5DDD0] rounded"></div>
          </div>
          <div className="space-y-2">
            <div className="h-3 w-32 bg-[#E5DDD0]/60 rounded"></div>
            <div className="h-11 w-full bg-[#FAF7F2] border border-[#E5DDD0] rounded"></div>
          </div>
          <div className="space-y-2">
            <div className="h-3 w-32 bg-[#E5DDD0]/60 rounded"></div>
            <div className="h-11 w-full bg-[#FAF7F2] border border-[#E5DDD0] rounded"></div>
          </div>
        </div>

        <div className="pt-6 flex justify-between border-t border-[#E5DDD0]">
          <div className="h-10 w-24 bg-[#E5DDD0]/40 rounded"></div>
          <div className="h-10 w-36 bg-[#E5DDD0] rounded"></div>
        </div>
      </div>
    </div>
  );
}
