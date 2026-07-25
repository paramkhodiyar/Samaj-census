'use client';

import React from 'react';
import CustomDropdown from './CustomDropdown';
import { Globe } from 'lucide-react';

export interface CountryItem {
  name: string;
  code: string;
  flag: string;
  dialCode: string;
}

// NRI Countries (Excluding India)
export const majorCountries: CountryItem[] = [
  { name: 'Kenya', code: 'KE', flag: '🇰🇪', dialCode: '+254' },
  { name: 'United States', code: 'US', flag: '🇺🇸', dialCode: '+1' },
  { name: 'United Kingdom', code: 'GB', flag: '🇬🇧', dialCode: '+44' },
  { name: 'United Arab Emirates', code: 'AE', flag: '🇦🇪', dialCode: '+971' },
  { name: 'Australia', code: 'AU', flag: '🇦🇺', dialCode: '+61' },
  { name: 'Canada', code: 'CA', flag: '🇨🇦', dialCode: '+1' },
  { name: 'Tanzania', code: 'TZ', flag: '🇹🇿', dialCode: '+255' },
  { name: 'Uganda', code: 'UG', flag: '🇺🇬', dialCode: '+256' },
  { name: 'South Africa', code: 'ZA', flag: '🇿🇦', dialCode: '+27' },
  { name: 'Singapore', code: 'SG', flag: '🇸🇬', dialCode: '+65' },
  { name: 'Oman', code: 'OM', flag: '🇴🇲', dialCode: '+968' },
  { name: 'Saudi Arabia', code: 'SA', flag: '🇸🇦', dialCode: '+966' },
  { name: 'Qatar', code: 'QA', flag: '🇶🇦', dialCode: '+974' },
  { name: 'Kuwait', code: 'KW', flag: '🇰🇼', dialCode: '+965' },
  { name: 'New Zealand', code: 'NZ', flag: '🇳🇿', dialCode: '+64' },
  { name: 'Germany', code: 'DE', flag: '🇩🇪', dialCode: '+49' },
  { name: 'France', code: 'FR', flag: '🇫🇷', dialCode: '+33' },
];

interface CountrySelectProps {
  value: string;
  customCountry: string;
  onChange: (country: string, customCountryVal?: string) => void;
  required?: boolean;
}

export default function CountrySelect({
  value,
  customCountry,
  onChange,
  required = true,
}: CountrySelectProps) {
  const options = [
    ...majorCountries.map((c) => ({
      value: c.name,
      label: `${c.flag} ${c.name}`,
    })),
    { value: 'Other', label: '🌐 Other (Type Custom Country Name)' },
  ];

  const handleSelect = (val: string) => {
    if (val === 'Other') {
      onChange('Other', customCountry);
    } else {
      onChange(val, '');
    }
  };

  return (
    <div className="space-y-2">
      <CustomDropdown
        options={options}
        value={value}
        onChange={handleSelect}
        placeholder="Select NRI Country of Residence"
        searchable={true}
        required={required}
      />

      {value === 'Other' && (
        <div className="pt-1 animate-in fade-in duration-200">
          <div className="relative">
            <Globe className="w-4 h-4 text-[#8B5E3C] absolute left-3 top-3" />
            <input
              type="text"
              required={required}
              placeholder="Enter your custom country name..."
              value={customCountry}
              onChange={(e) => onChange('Other', e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 bg-[#FAF7F2] border border-[#E5DDD0] rounded-lg text-xs font-medium focus:outline-none focus:border-[#8B5E3C]"
            />
          </div>
        </div>
      )}
    </div>
  );
}
