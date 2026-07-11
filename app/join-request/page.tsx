'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useTranslation } from '@/context/I18nContext';
import { submitJoinRequestAction } from '@/app/actions/join-request';
import CustomDropdown from '@/components/CustomDropdown';
import { 
  ArrowLeft, 
  Globe, 
  MapPin, 
  User, 
  Phone, 
  Mail, 
  Home, 
  CheckCircle,
  AlertCircle
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

export default function JoinRequestPage() {
  const { language, setLanguage, t } = useTranslation();
  
  // Form states
  const [fullName, setFullName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [email, setEmail] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [customCountry, setCustomCountry] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [customCity, setCustomCity] = useState('');
  const [indiaHometown, setIndiaHometown] = useState('');
  const [selectedVillage, setSelectedVillage] = useState('');
  
  const [isPending, setIsPending] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const countriesList = Object.keys(countryData);
  const citiesList = selectedCountry && selectedCountry !== 'other' ? countryData[selectedCountry] : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const countryVal = selectedCountry === 'other' ? customCountry : selectedCountry;
    const cityVal = selectedCountry === 'other' ? customCity : (selectedCity === 'other' ? customCity : selectedCity);

    if (!fullName || !mobileNumber || !email || !countryVal || !cityVal || !selectedVillage) {
      toast.error('Please fill in all required fields.');
      return;
    }

    setIsPending(true);
    const result = await submitJoinRequestAction({
      fullName,
      mobileNumber,
      email,
      country: countryVal,
      city: cityVal,
      indiaHometown,
      kutchVillage: selectedVillage,
    });
    setIsPending(false);

    if (result?.error) {
      toast.error(result.error);
    } else if (result?.success) {
      setIsSubmitted(true);
      toast.success('Enrollment request submitted successfully!');
    }
  };

  if (isSubmitted) {
    return (
      <div className="flex flex-col min-h-screen bg-[#FAF7F2] text-[#2D2D2D] font-sans items-center justify-center px-4 py-12">
        <div className="w-full max-w-xl bg-white p-8 md:p-12 rounded-lg border-2 border-double border-[#8B5E3C] shadow-md text-center">
          <div className="w-16 h-16 rounded-full bg-[#FAF7F2] border border-[#D4A373] flex items-center justify-center mx-auto mb-6 text-[#8B5E3C]">
            <CheckCircle className="w-8 h-8" />
          </div>
          
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-[#8B5E3C] mb-4">
            Request Submitted
          </h1>
          
          <p className="text-sm md:text-base text-[#6A5B4D] leading-relaxed mb-8">
            Thank you, <strong>{fullName}</strong>. Your family enrollment request has been successfully submitted to the NRI Admin for review.
          </p>

          <div className="bg-[#FAF7F2] p-6 rounded-md border border-[#E5DDD0] text-left text-xs space-y-2 mb-8 text-[#6A5B4D]">
            <div>• <strong>Primary Mobile:</strong> {mobileNumber}</div>
            <div>• <strong>Location:</strong> {selectedCity === 'other' ? customCity : selectedCity}, {selectedCountry === 'other' ? customCountry : selectedCountry}</div>
            <div>• <strong>Kutch Village:</strong> {selectedVillage}</div>
            <div className="pt-2 text-center text-[#B08968] font-medium border-t border-[#E5DDD0] mt-2">
              Once approved, you will be notified and can register to log in.
            </div>
          </div>

          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#8B5E3C] text-white rounded-md font-semibold text-sm transition-colors hover:bg-[#704A2E] shadow-sm"
          >
            <ArrowLeft className="w-4 h-4 text-[#FAF7F2]" />
            Return to Welcome Screen
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#FAF7F2] text-[#2D2D2D] font-sans selection:bg-[#D4A373] selection:text-[#FAF7F2]">
      {/* Header */}
      <header className="flex justify-between items-center p-6 max-w-7xl w-full mx-auto">
        <Link href="/login" className="flex items-center gap-2 text-[#8B5E3C] hover:text-[#704A2E] font-medium text-sm">
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
        <div className="w-full max-w-2xl bg-white p-8 md:p-10 rounded-lg border-2 border-double border-[#8B5E3C] shadow-md">
          
          {/* Section Header */}
          <div className="text-center mb-8 border-b border-[#E5DDD0] pb-6">
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-[#8B5E3C]">
              Request Family Enrollment
            </h1>
            <p className="text-sm text-[#6A5B4D] mt-2">
              For new NRI families whose mobile numbers are not yet registered in the census database.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Contact Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#6A5B4D] mb-2 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#B08968]" />
                  Head Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Devji Rathod"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full p-3 border border-[#E5DDD0] rounded bg-[#FAF7F2]/30 focus:border-[#8B5E3C] focus:outline-none transition-colors text-sm font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#6A5B4D] mb-2 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-[#B08968]" />
                  Mobile Number (with Country Code) <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. +254736900101"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  className="w-full p-3 border border-[#E5DDD0] rounded bg-[#FAF7F2]/30 focus:border-[#8B5E3C] focus:outline-none transition-colors text-sm font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#6A5B4D] mb-2 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-[#B08968]" />
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. ramesh.rathod@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3 border border-[#E5DDD0] rounded bg-[#FAF7F2]/30 focus:border-[#8B5E3C] focus:outline-none transition-colors text-sm font-medium"
                />
              </div>
            </div>

            {/* Location Details (Dynamic Country & City) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-[#FAF7F2]">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#6A5B4D] mb-2 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-[#B08968]" />
                  Country of Residence <span className="text-red-500">*</span>
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
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#6A5B4D] mb-2 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#B08968]" />
                    City of Residence <span className="text-red-500">*</span>
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

            {/* Custom Inputs for Country / City */}
            {(selectedCountry === 'other' || selectedCity === 'other') && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#FAF7F2]/50 p-4 rounded border border-[#E5DDD0] transition-all">
                {selectedCountry === 'other' && (
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#6A5B4D] mb-2">
                      Enter Custom Country <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Kenya"
                      value={customCountry}
                      onChange={(e) => setCustomCountry(e.target.value)}
                      className="w-full p-3 border border-[#E5DDD0] rounded bg-white focus:border-[#8B5E3C] focus:outline-none transition-colors text-sm"
                    />
                  </div>
                )}
                {(selectedCountry === 'other' || selectedCity === 'other') && (
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#6A5B4D] mb-2">
                      Enter Custom City <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Kisumu"
                      value={customCity}
                      onChange={(e) => setCustomCity(e.target.value)}
                      className="w-full p-3 border border-[#E5DDD0] rounded bg-white focus:border-[#8B5E3C] focus:outline-none transition-colors text-sm"
                    />
                  </div>
                )}
              </div>
            )}

            {/* India Connection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-[#FAF7F2]">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#6A5B4D] mb-2 flex items-center gap-1.5">
                  <Home className="w-3.5 h-3.5 text-[#B08968]" />
                  Hometown in India
                </label>
                <input
                  type="text"
                  placeholder="e.g. Mumbai, Pune"
                  value={indiaHometown}
                  onChange={(e) => setIndiaHometown(e.target.value)}
                  className="w-full p-3 border border-[#E5DDD0] rounded bg-[#FAF7F2]/30 focus:border-[#8B5E3C] focus:outline-none transition-colors text-sm font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#6A5B4D] mb-2 flex items-center gap-1.5">
                  <Home className="w-3.5 h-3.5 text-[#B08968]" />
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

            {/* Alert info */}
            <div className="flex items-start gap-2.5 p-4 rounded bg-[#FAF7F2] border border-[#E5DDD0] text-[#6A5B4D] text-xs leading-relaxed">
              <AlertCircle className="w-4 h-4 text-[#D4A373] shrink-0 mt-0.5" />
              <span>
                By submitting this request, you represent that you are the Family Head of your household. Submissions are manually reviewed by NRI admins before approval. Once approved, you will be registered to access the digital family record books.
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 pt-4 border-t border-[#E5DDD0]">
              <Link
                href="/login"
                className="px-6 py-2.5 bg-white border border-[#8B5E3C] text-[#8B5E3C] rounded font-semibold text-sm transition-all hover:bg-[#FAF7F2]"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isPending}
                className="px-8 py-2.5 bg-[#8B5E3C] hover:bg-[#704A2E] text-white rounded font-semibold text-sm transition-all shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2 font-serif cursor-pointer"
              >
                {isPending ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>

          </form>
        </div>
      </main>
    </div>
  );
}
