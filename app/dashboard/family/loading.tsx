import React from 'react';

export default function FamilyDashboardLoading() {
  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-pulse">
      {/* Family Header Banner Skeleton */}
      <div className="bg-white p-6 rounded-xl border border-[#E5DDD0] shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-2">
          <div className="h-7 w-64 bg-[#E5DDD0] rounded"></div>
          <div className="h-4 w-96 bg-[#E5DDD0]/60 rounded"></div>
        </div>
        <div className="h-10 w-32 bg-[#E5DDD0] rounded-lg"></div>
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-[#E5DDD0] shadow-xs space-y-3">
          <div className="h-3 w-28 bg-[#E5DDD0]/60 rounded"></div>
          <div className="h-8 w-16 bg-[#E5DDD0] rounded"></div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-[#E5DDD0] shadow-xs space-y-3">
          <div className="h-3 w-28 bg-[#E5DDD0]/60 rounded"></div>
          <div className="h-8 w-16 bg-[#E5DDD0] rounded"></div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-[#E5DDD0] shadow-xs space-y-3">
          <div className="h-3 w-28 bg-[#E5DDD0]/60 rounded"></div>
          <div className="h-8 w-24 bg-[#E5DDD0] rounded"></div>
        </div>
      </div>

      {/* Member Cards Grid Skeleton */}
      <div className="space-y-4">
        <div className="h-5 w-44 bg-[#E5DDD0] rounded"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white p-6 rounded-xl border border-[#E5DDD0] shadow-xs space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-[#E5DDD0]"></div>
                <div className="space-y-2 flex-1">
                  <div className="h-5 w-32 bg-[#E5DDD0] rounded"></div>
                  <div className="h-3 w-20 bg-[#E5DDD0]/60 rounded"></div>
                </div>
              </div>
              <div className="space-y-2 pt-2 border-t border-[#E5DDD0]/60">
                <div className="h-3 w-full bg-[#E5DDD0]/40 rounded"></div>
                <div className="h-3 w-3/4 bg-[#E5DDD0]/40 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
