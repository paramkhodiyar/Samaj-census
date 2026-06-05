import React from 'react';
import { prisma } from '@/lib/prisma';
import { getAuthSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { useTranslation } from '@/context/I18nContext';
import { Users, Home, GraduationCap, Briefcase, Calendar, Heart } from 'lucide-react';

export default async function StatsPage() {
  const session = await getAuthSession();

  if (!session) {
    redirect('/login');
  }

  // 1. Fetch real counts
  const familyCount = await prisma.family.count();
  const memberCount = await prisma.member.count();

  // 2. Fetch all members to compute distributions dynamically
  const members = await prisma.member.findMany({
    select: {
      gender: true,
      age: true,
      education: true,
      occupation: true,
      isAlive: true,
    },
    where: { isAlive: true }
  });

  // Calculate Gender Distribution
  const maleCount = members.filter(m => m.gender === 'MALE').length;
  const femaleCount = members.filter(m => m.gender === 'FEMALE').length;
  const otherCount = members.filter(m => m.gender === 'OTHER').length;

  const malePercent = Math.round((maleCount / (members.length || 1)) * 100);
  const femalePercent = Math.round((femaleCount / (members.length || 1)) * 100);
  const otherPercent = 100 - malePercent - femalePercent;

  // Calculate Age Group Distribution
  const children = members.filter(m => m.age < 18).length;
  const youth = members.filter(m => m.age >= 18 && m.age <= 35).length;
  const middleAged = members.filter(m => m.age > 35 && m.age <= 60).length;
  const seniors = members.filter(m => m.age > 60).length;

  const ageGroups = [
    { label: 'Children (Under 18)', count: children, percent: Math.round((children / (members.length || 1)) * 100), color: 'bg-[#8B5E3C]' },
    { label: 'Youth (18 - 35)', count: youth, percent: Math.round((youth / (members.length || 1)) * 100), color: 'bg-[#B08968]' },
    { label: 'Adults (36 - 60)', count: middleAged, percent: Math.round((middleAged / (members.length || 1)) * 100), color: 'bg-[#D4A373]' },
    { label: 'Seniors (60+)', count: seniors, percent: Math.round((seniors / (members.length || 1)) * 100), color: 'bg-[#706354]' },
  ];

  // Calculate Education Levels Distribution
  const eduCounts: Record<string, number> = {};
  members.forEach(m => {
    const edu = m.education.trim() || 'Unspecified';
    // Normalize slightly (e.g. Graduate category)
    let category = edu;
    if (edu.toLowerCase().includes('graduate') || edu.toLowerCase().includes('b.tech') || edu.toLowerCase().includes('mba') || edu.toLowerCase().includes('b.ed') || edu.toLowerCase().includes('bfa') || edu.toLowerCase().includes('m.tech')) {
      category = 'Higher Ed / Graduates';
    } else if (edu.toLowerCase().includes('school') || edu.toLowerCase().includes('secondary')) {
      category = 'School / Secondary';
    }
    eduCounts[category] = (eduCounts[category] || 0) + 1;
  });

  const educationLevels = Object.entries(eduCounts)
    .map(([label, count]) => ({
      label,
      count,
      percent: Math.round((count / (members.length || 1)) * 100),
    }))
    .sort((a, b) => b.count - a.count);

  // Calculate Occupations Distribution
  const occCounts: Record<string, number> = {};
  members.forEach(m => {
    const occ = m.occupation.trim() || 'Unspecified';
    occCounts[occ] = (occCounts[occ] || 0) + 1;
  });

  const occupations = Object.entries(occCounts)
    .map(([label, count]) => ({
      label,
      count,
      percent: Math.round((count / (members.length || 1)) * 100),
    }))
    .sort((a, b) => b.count - a.count);

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-lg border border-[#E5DDD0] shadow-sm">
        <h1 className="text-xl font-serif font-bold text-[#8B5E3C] md:text-2xl">
          Community Census Analytics
        </h1>
        <p className="text-sm text-[#6A5B4D] mt-1">
          Dynamic census distribution data of Shri Kutch Gurjar Kshatriya Samaj.
        </p>
      </div>

      {/* Headline Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg border border-[#E5DDD0] shadow-sm flex items-center gap-4">
          <div className="p-3 bg-[#FAF7F2] text-[#8B5E3C] rounded-md border border-[#E5DDD0]">
            <Home className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-[#6A5B4D] uppercase tracking-wider">Total Families</p>
            <h3 className="text-2xl font-bold text-[#8B5E3C] mt-0.5">{familyCount}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-[#E5DDD0] shadow-sm flex items-center gap-4">
          <div className="p-3 bg-[#FAF7F2] text-[#B08968] rounded-md border border-[#E5DDD0]">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-[#6A5B4D] uppercase tracking-wider">Total Members</p>
            <h3 className="text-2xl font-bold text-[#8B5E3C] mt-0.5">{memberCount}</h3>
          </div>
        </div>
      </div>

      {/* Distribution Grids */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Gender Distribution */}
        <div className="bg-white p-6 rounded-lg border border-[#E5DDD0] shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-[#6A5B4D] uppercase tracking-wider border-b border-[#FAF7F2] pb-2 flex items-center gap-2">
            <Heart className="w-4 h-4 text-[#8B5E3C]" />
            Gender Distribution
          </h3>
          <div className="space-y-3.5 text-xs">
            <ProgressBar label="Male" count={maleCount} percent={malePercent} color="bg-[#8B5E3C]" />
            <ProgressBar label="Female" count={femaleCount} percent={femalePercent} color="bg-[#B08968]" />
            {otherCount > 0 && <ProgressBar label="Other" count={otherCount} percent={otherPercent} color="bg-[#D4A373]" />}
          </div>
        </div>

        {/* Age Groups */}
        <div className="bg-white p-6 rounded-lg border border-[#E5DDD0] shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-[#6A5B4D] uppercase tracking-wider border-b border-[#FAF7F2] pb-2 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#8B5E3C]" />
            Age Distribution
          </h3>
          <div className="space-y-3.5 text-xs">
            {ageGroups.map((group) => (
              <ProgressBar
                key={group.label}
                label={group.label}
                count={group.count}
                percent={group.percent}
                color={group.color}
              />
            ))}
          </div>
        </div>

        {/* Education Distribution */}
        <div className="bg-white p-6 rounded-lg border border-[#E5DDD0] shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-[#6A5B4D] uppercase tracking-wider border-b border-[#FAF7F2] pb-2 flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-[#8B5E3C]" />
            Education Level Distribution
          </h3>
          <div className="space-y-3.5 text-xs">
            {educationLevels.map((edu) => (
              <ProgressBar
                key={edu.label}
                label={edu.label}
                count={edu.count}
                percent={edu.percent}
                color="bg-[#B08968]"
              />
            ))}
          </div>
        </div>

        {/* Occupations Distribution */}
        <div className="bg-white p-6 rounded-lg border border-[#E5DDD0] shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-[#6A5B4D] uppercase tracking-wider border-b border-[#FAF7F2] pb-2 flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-[#8B5E3C]" />
            Occupation Distribution
          </h3>
          <div className="space-y-3.5 text-xs">
            {occupations.map((occ) => (
              <ProgressBar
                key={occ.label}
                label={occ.label}
                count={occ.count}
                percent={occ.percent}
                color="bg-[#D4A373]"
              />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

// Sub-Component: ProgressBar
function ProgressBar({ label, count, percent, color }: { label: string; count: number; percent: number; color: string }) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between font-semibold">
        <span className="text-[#2D2D2D]">{label}</span>
        <span className="text-[#6A5B4D]">
          {count} ({percent}%)
        </span>
      </div>
      <div className="h-2 w-full bg-[#FAF7F2] border border-[#E5DDD0] rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full`} style={{ width: `${percent}%` }}></div>
      </div>
    </div>
  );
}
