'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useTranslation } from '@/context/I18nContext';
import { submitJoinRequestAction } from '@/app/actions/join-request';
import CustomDropdown from '@/components/CustomDropdown';
import { 
  Phone, 
  Globe, 
  ArrowLeft, 
  User, 
  Mail, 
  CheckCircle,
  AlertCircle,
  MapPin,
  Home
} from 'lucide-react';
import { toast } from 'sonner';

const countryData: Record<string, string[]> = {
  'Kenya': ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret'],
  'United States': ['Chicago', 'New York', 'San Francisco', 'Houston', 'Dallas', 'Los Angeles', 'Seattle'],
  'United Kingdom': ['London', 'Leicester', 'Birmingham', 'Manchester', 'Leeds', 'Glasgow'],
  'United Arab Emirates': ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman'],
  'Australia': ['Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide'],
  'Canada': ['Toronto', 'Vancouver', 'Montreal', 'Calgary', 'Edmonton'],
  'Tanzania': ['Dar es Salaam', 'Arusha', 'Mwanza', 'Dodoma'],
  'Uganda': ['Kampala', 'Entebbe', 'Jinja', 'Gulu'],
  'South Africa': ['Johannesburg', 'Cape Town', 'Durban', 'Pretoria'],
  'Singapore': ['Singapore City'],
};

const traditionalVillages = [
  'Anjar', 'Baladiya', 'Chandiya', 'Dhaneti', 'Galpadar', 'Kera', 'Kukma', 
  'Kumbharia', 'Madhapar', 'Meghpar', 'Mundra', 'Nagalpar', 'Ratnal', 'Reha', 
  'Sinugra', 'Vrishpur'
];

export default function RegisterPage() {
  const { language, setLanguage, t } = useTranslation();
  
  // Join Request States
  const [fullName, setFullName] = useState('');
  const [enrollMobile, setEnrollMobile] = useState('');
  const [email, setEmail] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [customCountry, setCustomCountry] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [customCity, setCustomCity] = useState('');
  const [indiaHometown, setIndiaHometown] = useState('');
  const [selectedVillage, setSelectedVillage] = useState('');
  const [isSendingJoin, setIsSendingJoin] = useState(false);
  const [isJoinSubmitted, setIsJoinSubmitted] = useState(false);

  // Submit Join Request
  const handleJoinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const countryVal = selectedCountry === 'other' ? customCountry : selectedCountry;
    const cityVal = selectedCountry === 'other' ? customCity : (selectedCity === 'other' ? customCity : selectedCity);

    if (!fullName || !enrollMobile || !email || !countryVal || !cityVal || !selectedVillage) {
      toast.error('Please fill in all required fields.');
      return;
    }

    setIsSendingJoin(true);
    const result = await submitJoinRequestAction({
      fullName,
      mobileNumber: enrollMobile,
      email,
      country: countryVal,
      city: cityVal,
      indiaHometown,
      kutchVillage: selectedVillage,
    });
    setIsSendingJoin(false);

    if (result?.error) {
      toast.error(result.error);
    } else if (result?.success) {
      setIsJoinSubmitted(true);
      toast.success('Enrollment request submitted successfully!');
    }
  };

  const countriesList = Object.keys(countryData);
  const citiesList = selectedCountry && selectedCountry !== 'other' ? countryData[selectedCountry] : [];

  return (
    <div className="flex flex-col min-h-screen bg-[#FAF7F2] text-[#2D2D2D] font-sans selection:bg-[#D4A373] selection:text-[#FAF7F2]">
      {/* Header */}
      <header className="flex justify-between items-center p-6 max-w-7xl w-full mx-auto">
        <Link href="/" className="flex items-center gap-2 text-[#8B5E3C] hover:text-[#704A2E] font-medium text-sm">
          <ArrowLeft className="w-4 h-4" />
          <span>{t('back')}</span>
        </Link>
        
        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-md border border-[#E5DDD0] shadow-sm text-sm">
          <Globe className="w-4 h-4 text-[#8B5E3C]" />
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as any)}
            className="bg-transparent border-none outline-none font-medium text-[#8B5E3C] cursor-pointer"
          >
            <option value="en">English</option>
            <option value="hi">हिन्दी</option>
            <option value="gu">ગુજરાતી</option>
          </select>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-xl bg-white p-8 md:p-10 rounded-lg border border-[#E5DDD0] shadow-md transition-all">
          
          {/* Logo Heading */}
          <div className="text-center mb-8 border-b border-[#E5DDD0] pb-6">
            <div className="w-12 h-12 rounded-full bg-[#FAF7F2] border border-[#D4A373] flex items-center justify-center mx-auto mb-3 text-[#8B5E3C]">
              <Globe className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-serif font-bold text-[#8B5E3C]">
              Request Family Enrollment
            </h1>
            <p className="text-sm text-[#6A5B4D] mt-1">
              For new NRI families whose mobile numbers are not in our database.
            </p>
          </div>

          {isJoinSubmitted ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#FAF7F2] border border-[#D4A373] flex items-center justify-center mx-auto text-[#8B5E3C]">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-serif font-bold text-[#8B5E3C]">
                Enrollment Request Submitted
              </h3>
              <p className="text-xs text-[#6A5B4D] leading-relaxed">
                Thank you, <strong>{fullName}</strong>. Your enrollment request has been submitted to the NRI Admin. Once approved, you can log in using your mobile number and OTP.
              </p>
              <Link
                href="/login"
                className="w-full py-2.5 bg-[#8B5E3C] hover:bg-[#704A2E] text-white font-semibold rounded text-sm flex items-center justify-center text-center"
              >
                Return to Sign In
              </Link>
            </div>
          ) : (
            <form onSubmit={handleJoinSubmit} className="space-y-4 text-left">
              {/* Head Name & Mobile */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#6A5B4D] mb-1.5">
                    Head Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-[#6A5B4D]/70">
                      <User className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh Rathod"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="pl-10 pr-4 py-2.5 w-full bg-[#FAF7F2] border border-[#E5DDD0] rounded-md focus:outline-none focus:border-[#8B5E3C] text-sm font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#6A5B4D] mb-1.5">
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-[#6A5B4D]/70">
                      <Phone className="w-4 h-4" />
                    </span>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. +254736900101"
                      value={enrollMobile}
                      onChange={(e) => setEnrollMobile(e.target.value)}
                      className="pl-10 pr-4 py-2.5 w-full bg-[#FAF7F2] border border-[#E5DDD0] rounded-md focus:outline-none focus:border-[#8B5E3C] text-sm font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#6A5B4D] mb-1.5">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-[#6A5B4D]/70">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    type="email"
                    required
                    placeholder="e.g. head@family.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 pr-4 py-2.5 w-full bg-[#FAF7F2] border border-[#E5DDD0] rounded-md focus:outline-none focus:border-[#8B5E3C] text-sm font-medium"
                  />
                </div>
              </div>

              {/* Country & City Dropdowns */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#6A5B4D] mb-1.5">
                    Country <span className="text-red-500">*</span>
                  </label>
                  <CustomDropdown
                    required
                    options={[
                      ...countriesList.map(c => ({ value: c, label: c })),
                      { value: 'other', label: 'Other (Type manually)' }
                    ]}
                    value={selectedCountry}
                    onChange={(val) => {
                      setSelectedCountry(val);
                      setSelectedCity('');
                      setCustomCountry('');
                      setCustomCity('');
                    }}
                    placeholder="Select Country"
                    searchable
                  />
                </div>

                {selectedCountry !== 'other' && (
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#6A5B4D] mb-1.5">
                      City <span className="text-red-500">*</span>
                    </label>
                    <CustomDropdown
                      required
                      disabled={!selectedCountry}
                      options={[
                        ...citiesList.map(c => ({ value: c, label: c })),
                        { value: 'other', label: 'Other (Type manually)' }
                      ]}
                      value={selectedCity}
                      onChange={(val) => {
                        setSelectedCity(val);
                        setCustomCity('');
                      }}
                      placeholder="Select City"
                      searchable
                    />
                  </div>
                )}
              </div>

              {/* Custom Country / City Manual Inputs */}
              {(selectedCountry === 'other' || selectedCity === 'other') && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#FAF7F2] p-3.5 rounded border border-[#E5DDD0]">
                  {selectedCountry === 'other' && (
                    <div>
                      <label className="block text-[11px] font-bold text-[#6A5B4D] mb-1">
                        Custom Country <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Kenya"
                        value={customCountry}
                        onChange={(e) => setCustomCountry(e.target.value)}
                        className="w-full p-2.5 border border-[#E5DDD0] rounded bg-white text-sm"
                      />
                    </div>
                  )}
                  {(selectedCountry === 'other' || selectedCity === 'other') && (
                    <div>
                      <label className="block text-[11px] font-bold text-[#6A5B4D] mb-1">
                        Custom City <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Kisumu"
                        value={customCity}
                        onChange={(e) => setCustomCity(e.target.value)}
                        className="w-full p-2.5 border border-[#E5DDD0] rounded bg-white text-sm"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Indian Connection details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#6A5B4D] mb-1.5">
                    India Hometown
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Mumbai, Pune"
                    value={indiaHometown}
                    onChange={(e) => setIndiaHometown(e.target.value)}
                    className="w-full p-2.5 border border-[#E5DDD0] rounded bg-[#FAF7F2]/30 focus:outline-none focus:border-[#8B5E3C] text-sm font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#6A5B4D] mb-1.5">
                    Kutch Native Village <span className="text-red-500">*</span>
                  </label>
                  <CustomDropdown
                    required
                    options={traditionalVillages}
                    value={selectedVillage}
                    onChange={(val) => setSelectedVillage(val)}
                    placeholder="Select Village"
                    searchable
                  />
                </div>
              </div>

              {/* Alert warning Info */}
              <div className="flex items-start gap-2 p-3 bg-[#FAF7F2] rounded border border-[#E5DDD0] text-[11px] text-[#6A5B4D]">
                <AlertCircle className="w-4 h-4 text-[#D4A373] shrink-0 mt-0.5" />
                <span>
                  Only the Family Head should submit this form. Your request will be verified and approved by the NRI Admin.
                </span>
              </div>

              {/* Form Buttons */}
              <div className="flex justify-end gap-3 pt-3 border-t border-[#E5DDD0]">
                <Link
                  href="/login"
                  className="px-4 py-2 border border-[#E5DDD0] hover:bg-[#FAF7F2] text-[#6A5B4D] text-xs font-semibold rounded cursor-pointer flex items-center justify-center"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={isSendingJoin}
                  className="px-6 py-2 bg-[#8B5E3C] hover:bg-[#704A2E] text-white text-xs font-semibold rounded shadow-sm disabled:bg-gray-400 cursor-pointer font-serif"
                >
                  {isSendingJoin ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          )}

          {/* Login Link */}
          <div className="mt-8 text-center text-sm border-t border-[#E5DDD0] pt-6">
            <span className="text-[#6A5B4D]">{t('alreadyHaveAccount')} </span>
            <Link href="/login" className="text-[#8B5E3C] font-bold hover:underline">
              {t('signInNow')}
            </Link>
          </div>
        </div>
      </main>

      {/* Footer credits */}
      <footer className="py-6 text-center text-xs text-[#6A5B4D] bg-white border-t border-[#E5DDD0]">
        {t('footerCredits')}
      </footer>
    </div>
  );
}
