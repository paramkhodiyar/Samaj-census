'use client';

import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

interface ChartDataItem {
  name: string;
  value: number;
  percent: number;
}

interface StatsChartsClientProps {
  genderData: ChartDataItem[];
  ageData: ChartDataItem[];
  educationData: ChartDataItem[];
  occupationData: ChartDataItem[];
}

const COLORS = ['#8B5E3C', '#B08968', '#D4A373', '#706354', '#A39281', '#C6B7A6'];

export default function StatsChartsClient({
  genderData,
  ageData,
  educationData,
  occupationData
}: StatsChartsClientProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-[400px] flex items-center justify-center text-xs text-[#6A5B4D] italic">
        Loading analytics visualization engine...
      </div>
    );
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white border border-[#E5DDD0] p-2.5 rounded shadow-md text-xs font-sans">
          <p className="font-bold text-[#2D2D2D]">{data.name}</p>
          <p className="text-[#8B5E3C] mt-0.5 font-semibold">
            Count: {data.value} ({data.percent}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      
      {/* 1. Gender Distribution */}
      <div className="bg-white p-6 rounded-lg border border-[#E5DDD0] shadow-sm flex flex-col min-h-[340px]">
        <h3 className="text-xs font-bold text-[#6A5B4D] uppercase tracking-wider border-b border-[#FAF7F2] pb-3 mb-4">
          Gender Distribution
        </h3>
        <div className="flex-1 min-h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={genderData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={4}
                dataKey="value"
              >
                {genderData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px', color: '#2D2D2D' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. Age Distribution */}
      <div className="bg-white p-6 rounded-lg border border-[#E5DDD0] shadow-sm flex flex-col min-h-[340px]">
        <h3 className="text-xs font-bold text-[#6A5B4D] uppercase tracking-wider border-b border-[#FAF7F2] pb-3 mb-4">
          Age Groups
        </h3>
        <div className="flex-1 min-h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={ageData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="name" stroke="#6A5B4D" fontSize={10} tickLine={false} />
              <YAxis stroke="#6A5B4D" fontSize={10} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" fill="#8B5E3C" radius={[4, 4, 0, 0]}>
                {ageData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 3. Education Distribution */}
      <div className="bg-white p-6 rounded-lg border border-[#E5DDD0] shadow-sm flex flex-col min-h-[380px] md:col-span-2">
        <h3 className="text-xs font-bold text-[#6A5B4D] uppercase tracking-wider border-b border-[#FAF7F2] pb-3 mb-4">
          Education Level Distribution
        </h3>
        <div className="flex-1 min-h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={educationData.slice(0, 8)}
              layout="vertical"
              margin={{ top: 10, right: 20, left: 30, bottom: 5 }}
            >
              <XAxis type="number" stroke="#6A5B4D" fontSize={10} tickLine={false} />
              <YAxis type="category" dataKey="name" stroke="#6A5B4D" fontSize={10} tickLine={false} width={120} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" fill="#B08968" radius={[0, 4, 4, 0]}>
                {educationData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 4. Occupation Distribution */}
      <div className="bg-white p-6 rounded-lg border border-[#E5DDD0] shadow-sm flex flex-col min-h-[380px] md:col-span-2">
        <h3 className="text-xs font-bold text-[#6A5B4D] uppercase tracking-wider border-b border-[#FAF7F2] pb-3 mb-4">
          Occupation Distribution
        </h3>
        <div className="flex-1 min-h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={occupationData.slice(0, 8)}
              layout="vertical"
              margin={{ top: 10, right: 20, left: 30, bottom: 5 }}
            >
              <XAxis type="number" stroke="#6A5B4D" fontSize={10} tickLine={false} />
              <YAxis type="category" dataKey="name" stroke="#6A5B4D" fontSize={10} tickLine={false} width={120} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" fill="#D4A373" radius={[0, 4, 4, 0]}>
                {occupationData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}
