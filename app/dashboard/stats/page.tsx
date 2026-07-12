import React from 'react';
import { prisma } from '@/lib/prisma';
import { getAuthSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Users, Home } from 'lucide-react';
import { requireRole } from '@/lib/authz';
import StatsChartsClient from '@/components/StatsChartsClient';

export default async function StatsPage() {
  const session = await getAuthSession();
  requireRole(session, ['SUPER_ADMIN', 'PRADESHIK_ADMIN', 'GHATAK_ADMIN', 'NRI_ADMIN']);

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
  });

  if (!user) {
    redirect('/login');
  }

  // Define filters based on role
  let familyFilter = {};
  let memberFilter: any = { isAlive: true };

  if (user.role === 'GHATAK_ADMIN') {
    familyFilter = { ghatakId: user.ghatakId || 'null-ghatak-id' };
    memberFilter = { isAlive: true, family: { ghatakId: user.ghatakId || 'null-ghatak-id' } };
  } else if (user.role === 'PRADESHIK_ADMIN') {
    familyFilter = { pradeshikId: user.pradeshikId || 'null-pradeshik-id' };
    memberFilter = { isAlive: true, family: { pradeshikId: user.pradeshikId || 'null-pradeshik-id' } };
  } else if (user.role === 'NRI_ADMIN') {
    familyFilter = { familyId: { startsWith: 'KG-NRI-' } };
    memberFilter = { isAlive: true, family: { familyId: { startsWith: 'KG-NRI-' } } };
  }

  // 1. Fetch real counts
  const familyCount = await prisma.family.count({ where: familyFilter });
  const memberCount = await prisma.member.count({ where: memberFilter });

  // 2. Fetch all members within scope to compute distributions dynamically
  const members = await prisma.member.findMany({
    select: {
      gender: true,
      age: true,
      education: true,
      occupation: true,
      isAlive: true,
    },
    where: memberFilter
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

  // Map structures for StatsChartsClient
  const genderData = [
    { name: 'Male', value: maleCount, percent: malePercent },
    { name: 'Female', value: femaleCount, percent: femalePercent },
  ];
  if (otherCount > 0) {
    genderData.push({ name: 'Other', value: otherCount, percent: otherPercent });
  }

  const ageData = ageGroups.map(g => ({
    name: g.label,
    value: g.count,
    percent: g.percent
  }));

  const educationData = educationLevels.map(e => ({
    name: e.label,
    value: e.count,
    percent: e.percent
  }));

  const occupationData = occupations.map(o => ({
    name: o.label,
    value: o.count,
    percent: o.percent
  }));

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-lg border border-[#E5DDD0] shadow-sm">
        <h1 className="text-xl font-serif font-bold text-[#8B5E3C] md:text-2xl">
          Community Census Analytics
        </h1>
        <p className="text-sm text-[#6A5B4D] mt-1">
          Interactive demographics data and distributions of Shri Kutch Gurjar Kshatriya Samaj.
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

      {/* Interactive Charts Client Component */}
      <StatsChartsClient
        genderData={genderData}
        ageData={ageData}
        educationData={educationData}
        occupationData={occupationData}
      />
    </div>
  );
}
