'use client';

import React from 'react';

export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header Banner Skeleton */}
      <div className="bg-white p-6 rounded-lg border border-[#E5DDD0] h-24 flex flex-col justify-center space-y-2">
        <div className="h-6 w-1/3 bg-[#FAF7F2] rounded"></div>
        <div className="h-4 w-1/2 bg-[#FAF7F2] rounded"></div>
      </div>

      {/* Stats Cards Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg border border-[#E5DDD0] h-20 bg-[#FAF7F2]/40"></div>
        <div className="bg-white p-6 rounded-lg border border-[#E5DDD0] h-20 bg-[#FAF7F2]/40"></div>
        <div className="bg-white p-6 rounded-lg border border-[#E5DDD0] h-20 bg-[#FAF7F2]/40"></div>
      </div>

      {/* Main Content Area Skeleton */}
      <div className="bg-white p-6 rounded-lg border border-[#E5DDD0] space-y-4">
        <div className="h-5 w-1/4 bg-[#FAF7F2] rounded mb-6"></div>
        <div className="space-y-3.5">
          <div className="h-10 bg-[#FAF7F2] rounded w-full"></div>
          <div className="h-10 bg-[#FAF7F2] rounded w-full"></div>
          <div className="h-10 bg-[#FAF7F2] rounded w-full"></div>
        </div>
      </div>
    </div>
  );
}
