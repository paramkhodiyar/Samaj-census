'use client';

import React from 'react';
import { Home, MapPin, Phone } from 'lucide-react';

interface StepFamilyInfoProps {
  familyInfo: {
    address: string;
    nativeVillage: string;
    mobile: string;
  };
  onChange: (field: string, value: string) => void;
}

export default function StepFamilyInfo({ familyInfo, onChange }: StepFamilyInfoProps) {
  return (
    <div className="space-y-4">
      <div className="border-b border-[#E5DDD0] pb-3 mb-4">
        <h2 className="text-base font-serif font-bold text-[#8B5E3C] flex items-center gap-2">
          <Home className="w-5 h-5 text-[#8B5E3C]" />
          Step 1: Family & Location Information
        </h2>
        <p className="text-xs text-[#6A5B4D] mt-0.5">
          Update primary residential address, native village in Kutch, or primary family phone number.
        </p>
      </div>

      <div className="space-y-4 text-xs">
        <div>
          <label className="block font-bold text-[#6A5B4D] uppercase tracking-wider mb-1.5">
            Primary Residential Address
          </label>
          <textarea
            rows={3}
            value={familyInfo.address}
            onChange={(e) => onChange('address', e.target.value)}
            placeholder="House/Flat No., Society/Street Name, City, Pincode"
            className="w-full p-2.5 bg-[#FAF7F2] border border-[#E5DDD0] rounded text-xs focus:outline-none focus:border-[#8B5E3C]"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-bold text-[#6A5B4D] uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[#B08968]" />
              Native Village in Kutch
            </label>
            <input
              type="text"
              value={familyInfo.nativeVillage}
              onChange={(e) => onChange('nativeVillage', e.target.value)}
              placeholder="e.g. Madhapar, Anjar, Dhaneti"
              className="w-full p-2.5 bg-[#FAF7F2] border border-[#E5DDD0] rounded text-xs focus:outline-none focus:border-[#8B5E3C]"
            />
          </div>

          <div>
            <label className="block font-bold text-[#6A5B4D] uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-[#B08968]" />
              Primary Contact Phone
            </label>
            <input
              type="tel"
              value={familyInfo.mobile}
              onChange={(e) => onChange('mobile', e.target.value)}
              placeholder="10-digit mobile number"
              className="w-full p-2.5 bg-[#FAF7F2] border border-[#E5DDD0] rounded text-xs focus:outline-none focus:border-[#8B5E3C]"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
