'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createFamilyForUserAction } from '@/app/actions/family';
import CountrySelect, { majorCountries } from './CountrySelect';
import CustomDropdown from './CustomDropdown';
import { toast } from 'sonner';
import {
  Home,
  User,
  Plus,
  Trash2,
  CheckCircle,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Globe,
  MapPin,
  Phone,
  Mail,
  Loader2,
  Users
} from 'lucide-react';

interface FamilyEnrollmentWizardProps {
  userEmail?: string | null;
  userMobile?: string | null;
  ghataks?: Array<{ id: string; name: string; code: string; pradeshikId: string }>;
  pradeshiks?: Array<{ id: string; name: string; code: string }>;
}

export default function FamilyEnrollmentWizard({
  userEmail,
  userMobile,
  ghataks = [],
  pradeshiks = [],
}: FamilyEnrollmentWizardProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Step 1: Head & Location State
  const [headName, setHeadName] = useState('');
  const [country, setCountry] = useState('Kenya');
  const [customCountry, setCustomCountry] = useState('');
  const [city, setCity] = useState('');
  const [nativeVillage, setNativeVillage] = useState('');
  const [address, setAddress] = useState('');
  
  // Phone & Dial Code
  const [dialCode, setDialCode] = useState('+254');
  const [customDialCode, setCustomDialCode] = useState('+');
  const [rawPhone, setRawPhone] = useState(userMobile?.replace(/^\+?91/, '').replace(/^\+?254/, '') || '');
  const [email, setEmail] = useState(userEmail || '');
  
  // Optional Ghatak & Pradeshik
  const [selectedGhatakId, setSelectedGhatakId] = useState('');
  const [selectedPradeshikId, setSelectedPradeshikId] = useState('');

  // Step 2: Members State
  const [members, setMembers] = useState<Array<{
    name: string;
    relation: string;
    age: number;
    gender: 'MALE' | 'FEMALE' | 'OTHER';
    occupation: string;
    education: string;
    bloodGroup: string;
    mobile: string;
  }>>([]);

  const [newMember, setNewMember] = useState({
    name: '',
    relation: 'Wife',
    age: 28,
    gender: 'FEMALE' as 'MALE' | 'FEMALE' | 'OTHER',
    occupation: 'Homemaker',
    education: 'Graduate',
    bloodGroup: 'O+',
    mobile: '',
  });

  // Step 3: Consent & Loading State
  const [consentGiven, setConsentGiven] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const effectiveCountry = country === 'Other' ? customCountry.trim() : country;
  const effectiveDialCode = dialCode === 'CUSTOM' ? customDialCode.trim() : dialCode;
  const fullMobile = `${effectiveDialCode} ${rawPhone.trim()}`.trim();

  const handleAddMember = () => {
    if (!newMember.name.trim()) {
      toast.error('Please enter the family member full name.');
      return;
    }
    setMembers([...members, { ...newMember }]);
    setNewMember({
      name: '',
      relation: 'Son',
      age: 18,
      gender: 'MALE',
      occupation: 'Student',
      education: 'Higher Secondary',
      bloodGroup: 'O+',
      mobile: '',
    });
    toast.success(`${newMember.name} added to family member list!`);
  };

  const handleRemoveMember = (index: number) => {
    const removed = members[index];
    setMembers(members.filter((_, i) => i !== index));
    toast.info(`Removed ${removed.name} from list`);
  };

  const handleNextToStep2 = () => {
    if (!headName.trim() || !effectiveCountry || !city.trim() || !nativeVillage.trim() || !address.trim() || !rawPhone.trim()) {
      toast.error('Please complete all required fields (Head Name, Country, City, Native Village, Mobile, Address) in Step 1.');
      return;
    }
    setCurrentStep(2);
  };

  const handleNextToStep3 = () => {
    setCurrentStep(3);
  };

  const handleSubmit = async () => {
    if (!consentGiven) {
      toast.error('You must acknowledge DPDP consent before submitting.');
      return;
    }

    setIsSubmitting(true);
    const res = await createFamilyForUserAction({
      headName,
      country: effectiveCountry,
      city,
      nativeVillage,
      address,
      mobile: fullMobile,
      email: email || undefined,
      ghatakId: selectedGhatakId || undefined,
      pradeshikId: selectedPradeshikId || undefined,
      members,
    });
    setIsSubmitting(false);

    if (res.error) {
      toast.error(res.error);
    } else if (res.success) {
      toast.success('Your family census profile has been created successfully!');
      router.push('/dashboard/family');
      router.refresh();
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header Banner */}
      <div className="bg-white p-6 md:p-8 rounded-2xl border border-[#E5DDD0] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[#8B5E3C] mb-1.5">
            <Sparkles className="w-5 h-5 text-[#8B5E3C]" />
            <span className="text-xs font-bold uppercase tracking-wider">Official Global Samaj Census Enrollment</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-[#2D2D2D]">
            Enroll Your Family Census Profile
          </h1>
          <p className="text-xs md:text-sm text-[#6A5B4D] mt-1">
            Complete this 3-step registration to create your family census profile (domestic or NRI).
          </p>
        </div>
      </div>

      {/* Progress Step Indicator Bar */}
      <div className="bg-white p-4 md:p-6 rounded-xl border border-[#E5DDD0] shadow-xs">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          {/* Step 1 Pill */}
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${
              currentStep === 1 
                ? 'bg-[#8B5E3C] text-white shadow-sm ring-4 ring-[#8B5E3C]/15' 
                : currentStep > 1 
                  ? 'bg-emerald-600 text-white' 
                  : 'bg-[#FAF7F2] text-[#6A5B4D] border border-[#E5DDD0]'
            }`}>
              {currentStep > 1 ? <CheckCircle className="w-5 h-5" /> : '1'}
            </div>
            <div className="hidden sm:block">
              <p className="text-xs font-bold text-[#2D2D2D]">Step 1</p>
              <p className="text-[11px] text-[#6A5B4D]">Location & Heritage</p>
            </div>
          </div>

          <div className={`h-0.5 flex-1 mx-4 transition-colors ${currentStep > 1 ? 'bg-emerald-500' : 'bg-[#E5DDD0]'}`}></div>

          {/* Step 2 Pill */}
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${
              currentStep === 2 
                ? 'bg-[#8B5E3C] text-white shadow-sm ring-4 ring-[#8B5E3C]/15' 
                : currentStep > 2 
                  ? 'bg-emerald-600 text-white' 
                  : 'bg-[#FAF7F2] text-[#6A5B4D] border border-[#E5DDD0]'
            }`}>
              {currentStep > 2 ? <CheckCircle className="w-5 h-5" /> : '2'}
            </div>
            <div className="hidden sm:block">
              <p className="text-xs font-bold text-[#2D2D2D]">Step 2</p>
              <p className="text-[11px] text-[#6A5B4D]">Family Members ({members.length})</p>
            </div>
          </div>

          <div className={`h-0.5 flex-1 mx-4 transition-colors ${currentStep > 2 ? 'bg-emerald-500' : 'bg-[#E5DDD0]'}`}></div>

          {/* Step 3 Pill */}
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${
              currentStep === 3 
                ? 'bg-[#8B5E3C] text-white shadow-sm ring-4 ring-[#8B5E3C]/15' 
                : 'bg-[#FAF7F2] text-[#6A5B4D] border border-[#E5DDD0]'
            }`}>
              3
            </div>
            <div className="hidden sm:block">
              <p className="text-xs font-bold text-[#2D2D2D]">Step 3</p>
              <p className="text-[11px] text-[#6A5B4D]">Review & Submit</p>
            </div>
          </div>
        </div>
      </div>

      {/* STEP 1 CONTENT: Head & NRI Location Info */}
      {currentStep === 1 && (
        <div className="bg-white p-6 md:p-8 rounded-2xl border border-[#E5DDD0] shadow-sm space-y-6">
          <div className="border-b border-[#E5DDD0] pb-4">
            <h2 className="text-lg font-bold text-[#8B5E3C] flex items-center gap-2">
              <Home className="w-5 h-5 text-[#8B5E3C]" />
              Step 1: Family Head & Global Location
            </h2>
            <p className="text-xs text-[#6A5B4D] mt-1">
              Specify your residence country, city, mobile with country code, and native Kutch village.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div>
              <label className="block font-bold text-[#6A5B4D] mb-1.5 uppercase text-[10px]">
                Family Head Full Name *
              </label>
              <input
                type="text"
                required
                value={headName}
                onChange={(e) => setHeadName(e.target.value)}
                placeholder="e.g. Param Khodiyar"
                className="w-full p-3 bg-[#FAF7F2]/50 border border-[#E5DDD0] rounded-lg text-xs font-medium focus:outline-none focus:border-[#8B5E3C]"
              />
            </div>

            {/* Country Selector with Flags & Other option */}
            <div>
              <label className="block font-bold text-[#6A5B4D] mb-1.5 uppercase text-[10px]">
                Country of Residence *
              </label>
              <CountrySelect
                value={country}
                customCountry={customCountry}
                onChange={(c, custom) => {
                  setCountry(c);
                  if (custom !== undefined) setCustomCountry(custom);
                  // Auto set dial code if matched in list
                  const matched = majorCountries.find(m => m.name === c);
                  if (matched) setDialCode(matched.dialCode);
                }}
              />
            </div>

            <div>
              <label className="block font-bold text-[#6A5B4D] mb-1.5 uppercase text-[10px]">
                Current Residence City *
              </label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Nairobi, London, Chicago, Ahmedabad"
                className="w-full p-3 bg-[#FAF7F2]/50 border border-[#E5DDD0] rounded-lg text-xs font-medium focus:outline-none focus:border-[#8B5E3C]"
              />
            </div>

            <div>
              <label className="block font-bold text-[#6A5B4D] mb-1.5 uppercase text-[10px]">
                Native Village in Kutch *
              </label>
              <input
                type="text"
                required
                value={nativeVillage}
                onChange={(e) => setNativeVillage(e.target.value)}
                placeholder="e.g. Madhapar, Kera, Anjar, Dhaneti"
                className="w-full p-3 bg-[#FAF7F2]/50 border border-[#E5DDD0] rounded-lg text-xs font-medium focus:outline-none focus:border-[#8B5E3C]"
              />
            </div>

            {/* Mobile with Country Dial Code Selector */}
            <div>
              <label className="block font-bold text-[#6A5B4D] mb-1.5 uppercase text-[10px]">
                Mobile Number with Country Dial Code *
              </label>
              <div className="flex gap-2">
                <select
                  value={dialCode}
                  onChange={(e) => {
                    setDialCode(e.target.value);
                    if (e.target.value === 'CUSTOM') {
                      setCustomDialCode('+');
                    }
                  }}
                  className="p-3 bg-white border border-[#E5DDD0] rounded-lg text-xs font-bold text-[#8B5E3C] focus:outline-none"
                >
                  {majorCountries.map((c) => (
                    <option key={c.code} value={c.dialCode}>
                      {c.flag} {c.dialCode} ({c.code})
                    </option>
                  ))}
                  <option value="CUSTOM">🌐 Other / Custom Code</option>
                </select>

                {dialCode === 'CUSTOM' && (
                  <input
                    type="text"
                    required
                    value={customDialCode}
                    onChange={(e) => setCustomDialCode(e.target.value)}
                    placeholder="+254"
                    className="w-24 p-3 bg-white border border-[#E5DDD0] rounded-lg text-xs font-bold text-[#8B5E3C] focus:outline-none focus:border-[#8B5E3C]"
                  />
                )}

                <input
                  type="tel"
                  required
                  value={rawPhone}
                  onChange={(e) => setRawPhone(e.target.value)}
                  placeholder="Mobile number"
                  className="flex-1 p-3 bg-[#FAF7F2]/50 border border-[#E5DDD0] rounded-lg text-xs font-medium focus:outline-none focus:border-[#8B5E3C]"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-[#6A5B4D] mb-1.5 uppercase text-[10px]">
                Primary Contact Email (Optional)
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                className="w-full p-3 bg-[#FAF7F2]/50 border border-[#E5DDD0] rounded-lg text-xs font-medium focus:outline-none focus:border-[#8B5E3C]"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block font-bold text-[#6A5B4D] mb-1.5 uppercase text-[10px]">
                Current Street Address *
              </label>
              <textarea
                rows={2}
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Complete street address, city, state, postal code"
                className="w-full p-3 bg-[#FAF7F2]/50 border border-[#E5DDD0] rounded-lg text-xs font-medium focus:outline-none focus:border-[#8B5E3C]"
              />
            </div>

            {/* Optional Ghatak & Pradeshik Section */}
            <div className="md:col-span-2 p-4 bg-[#FAF7F2]/50 rounded-xl border border-[#E5DDD0] space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#8B5E3C] uppercase text-[10px] tracking-wider">
                  Domestic Ghatak & Province (Optional for NRIs)
                </span>
                <span className="text-[10px] text-[#6A5B4D] italic">
                  Leave blank if living abroad outside domestic Ghatak jurisdictions
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-[#6A5B4D] mb-1 uppercase text-[10px]">
                    Ghatak Community Cluster (Optional)
                  </label>
                  <select
                    value={selectedGhatakId}
                    onChange={(e) => setSelectedGhatakId(e.target.value)}
                    className="w-full p-2.5 bg-white border border-[#E5DDD0] rounded-lg text-xs text-[#2D2D2D]"
                  >
                    <option value="">-- None / NRI International --</option>
                    {ghataks.map((g) => (
                      <option key={g.id} value={g.id}>{g.name} Ghatak ({g.code})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#6A5B4D] mb-1 uppercase text-[10px]">
                    Pradeshik Province Zone (Optional)
                  </label>
                  <select
                    value={selectedPradeshikId}
                    onChange={(e) => setSelectedPradeshikId(e.target.value)}
                    className="w-full p-2.5 bg-white border border-[#E5DDD0] rounded-lg text-xs text-[#2D2D2D]"
                  >
                    <option value="">-- None / NRI International --</option>
                    {pradeshiks.map((p) => (
                      <option key={p.id} value={p.id}>{p.name} Zone ({p.code})</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-[#E5DDD0] flex justify-end">
            <button
              type="button"
              onClick={handleNextToStep2}
              className="px-6 py-3 bg-[#8B5E3C] hover:bg-[#704A2E] text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-2 cursor-pointer transition-colors"
            >
              Continue to Step 2: Add Members
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2 CONTENT: Family Members Enrollment */}
      {currentStep === 2 && (
        <div className="bg-white p-6 md:p-8 rounded-2xl border border-[#E5DDD0] shadow-sm space-y-6">
          <div className="border-b border-[#E5DDD0] pb-4 flex flex-col md:flex-row md:items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-bold text-[#8B5E3C] flex items-center gap-2">
                <Users className="w-5 h-5 text-[#8B5E3C]" />
                Step 2: Add Family Members ({members.length + 1} Total)
              </h2>
              <p className="text-xs text-[#6A5B4D] mt-1">
                Family Head ({headName}) is included automatically. Add additional relatives below.
              </p>
            </div>
          </div>

          {/* Enrolled Members Cards List */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-[#6A5B4D] uppercase tracking-wider">Current Enrolled Members</h3>
            
            {/* Head Card */}
            <div className="p-4 bg-[#FAF7F2] rounded-xl border border-[#8B5E3C]/30 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#8B5E3C] text-white font-bold text-sm flex items-center justify-center">
                  {headName.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-[#2D2D2D]">{headName}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#8B5E3C] text-white">
                      Head of Family
                    </span>
                  </div>
                  <p className="text-xs text-[#6A5B4D] mt-0.5">
                    {fullMobile} &bull; {city}, {effectiveCountry} &bull; Native: {nativeVillage}
                  </p>
                </div>
              </div>
            </div>

            {/* Additional Members Cards */}
            {members.map((m, idx) => (
              <div key={idx} className="p-4 bg-[#FAF7F2]/60 rounded-xl border border-[#E5DDD0] flex justify-between items-center hover:border-[#8B5E3C]/40 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#D4A373] text-white font-bold text-sm flex items-center justify-center">
                    {m.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-[#2D2D2D]">{m.name}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#8B5E3C]/15 text-[#8B5E3C]">
                        {m.relation}
                      </span>
                    </div>
                    <p className="text-xs text-[#6A5B4D] mt-0.5">
                      {m.age} Yrs &bull; {m.gender} &bull; {m.occupation} &bull; {m.bloodGroup} {m.mobile ? `(${m.mobile})` : ''}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveMember(idx)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg cursor-pointer transition-colors"
                >
                  <Trash2 className="w-4.5 h-4.5" />
                </button>
              </div>
            ))}
          </div>

          {/* Add New Member Form */}
          <div className="bg-[#FAF7F2] p-5 rounded-xl border border-[#E5DDD0] space-y-4">
            <h4 className="font-bold text-[#8B5E3C] text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-[#8B5E3C]" /> Add Another Family Member
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block font-bold text-[#6A5B4D] mb-1 uppercase text-[10px]">
                  Full Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ramesh Khodiyar"
                  value={newMember.name}
                  onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                  className="w-full p-2.5 bg-white border border-[#E5DDD0] rounded-lg text-xs focus:outline-none focus:border-[#8B5E3C]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#6A5B4D] mb-1 uppercase text-[10px]">
                  Relationship *
                </label>
                <select
                  value={newMember.relation}
                  onChange={(e) => setNewMember({ ...newMember, relation: e.target.value })}
                  className="w-full p-2.5 bg-white border border-[#E5DDD0] rounded-lg text-xs font-semibold text-[#8B5E3C]"
                >
                  {['Wife', 'Son', 'Daughter', 'Father', 'Mother', 'Brother', 'Sister', 'Grandfather', 'Grandmother'].map((rel) => (
                    <option key={rel} value={rel}>{rel}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-[#6A5B4D] mb-1 uppercase text-[10px]">
                  Age & Gender *
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Age"
                    value={newMember.age}
                    onChange={(e) => setNewMember({ ...newMember, age: parseInt(e.target.value, 10) || 0 })}
                    className="w-20 p-2.5 bg-white border border-[#E5DDD0] rounded-lg text-xs focus:outline-none"
                  />
                  <select
                    value={newMember.gender}
                    onChange={(e) => setNewMember({ ...newMember, gender: e.target.value as any })}
                    className="flex-1 p-2.5 bg-white border border-[#E5DDD0] rounded-lg text-xs font-semibold text-[#2D2D2D]"
                  >
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#6A5B4D] mb-1 uppercase text-[10px]">
                  Occupation
                </label>
                <input
                  type="text"
                  placeholder="e.g. Business, Service, Student"
                  value={newMember.occupation}
                  onChange={(e) => setNewMember({ ...newMember, occupation: e.target.value })}
                  className="w-full p-2.5 bg-white border border-[#E5DDD0] rounded-lg text-xs focus:outline-none focus:border-[#8B5E3C]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#6A5B4D] mb-1 uppercase text-[10px]">
                  Education
                </label>
                <input
                  type="text"
                  placeholder="e.g. Graduate, Higher Secondary"
                  value={newMember.education}
                  onChange={(e) => setNewMember({ ...newMember, education: e.target.value })}
                  className="w-full p-2.5 bg-white border border-[#E5DDD0] rounded-lg text-xs focus:outline-none focus:border-[#8B5E3C]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#6A5B4D] mb-1 uppercase text-[10px]">
                  Blood Group & Mobile
                </label>
                <div className="flex gap-2">
                  <select
                    value={newMember.bloodGroup}
                    onChange={(e) => setNewMember({ ...newMember, bloodGroup: e.target.value })}
                    className="w-24 p-2.5 bg-white border border-[#E5DDD0] rounded-lg text-xs font-semibold text-[#8B5E3C]"
                  >
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                  <input
                    type="tel"
                    placeholder="Mobile (Optional)"
                    value={newMember.mobile}
                    onChange={(e) => setNewMember({ ...newMember, mobile: e.target.value })}
                    className="flex-1 p-2.5 bg-white border border-[#E5DDD0] rounded-lg text-xs focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={handleAddMember}
                className="px-4 py-2 bg-[#8B5E3C] hover:bg-[#704A2E] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs"
              >
                <Plus className="w-4 h-4" /> Add Member to List
              </button>
            </div>
          </div>

          <div className="pt-6 border-t border-[#E5DDD0] flex justify-between">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="px-5 py-2.5 border border-[#E5DDD0] text-[#6A5B4D] text-xs font-semibold rounded-lg hover:bg-[#FAF7F2] cursor-pointer flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Step 1
            </button>
            <button
              type="button"
              onClick={handleNextToStep3}
              className="px-6 py-2.5 bg-[#8B5E3C] hover:bg-[#704A2E] text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-2 cursor-pointer transition-colors"
            >
              Review & Submit (Step 3)
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3 CONTENT: Review Summary & DPDP Consent */}
      {currentStep === 3 && (
        <div className="bg-white p-6 md:p-8 rounded-2xl border border-[#E5DDD0] shadow-sm space-y-6">
          <div className="border-b border-[#E5DDD0] pb-4">
            <h2 className="text-lg font-bold text-[#8B5E3C] flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#8B5E3C]" />
              Step 3: Review Global Census Summary & Acknowledge Consent
            </h2>
            <p className="text-xs text-[#6A5B4D] mt-1">
              Verify your family details before saving your official census profile.
            </p>
          </div>

          {/* Summary Grid */}
          <div className="bg-[#FAF7F2] p-5 rounded-xl border border-[#E5DDD0] space-y-4">
            <h3 className="font-bold text-[#8B5E3C] text-xs uppercase tracking-wider">Family Profile Overview</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-[#6A5B4D] block uppercase text-[10px] font-bold">Family Head</span>
                <span className="font-semibold text-[#2D2D2D] text-sm">{headName}</span>
              </div>
              <div>
                <span className="text-[#6A5B4D] block uppercase text-[10px] font-bold">Country & City</span>
                <span className="font-semibold text-[#8B5E3C] text-sm">{city}, {effectiveCountry}</span>
              </div>
              <div>
                <span className="text-[#6A5B4D] block uppercase text-[10px] font-bold">Native Village in Kutch</span>
                <span className="font-semibold text-[#8B5E3C] text-sm">{nativeVillage}</span>
              </div>
              <div>
                <span className="text-[#6A5B4D] block uppercase text-[10px] font-bold">Primary Mobile</span>
                <span className="font-semibold text-[#2D2D2D] text-sm">{fullMobile}</span>
              </div>
              <div className="sm:col-span-2">
                <span className="text-[#6A5B4D] block uppercase text-[10px] font-bold">Residential Address</span>
                <span className="font-medium text-[#2D2D2D]">{address}</span>
              </div>
              <div>
                <span className="text-[#6A5B4D] block uppercase text-[10px] font-bold">Total Enrolled Members</span>
                <span className="font-bold text-[#8B5E3C] text-sm">{members.length + 1} Members</span>
              </div>
            </div>
          </div>

          {/* Members Breakdown List */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-[#6A5B4D] uppercase tracking-wider">Members Included in Record</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Head */}
              <div className="p-3 bg-white border border-[#E5DDD0] rounded-lg text-xs">
                <span className="font-bold text-[#2D2D2D]">{headName}</span>{' '}
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#8B5E3C] text-white">Head</span>
                <p className="text-[11px] text-[#6A5B4D] mt-1">{fullMobile}</p>
              </div>
              {/* Additional Members */}
              {members.map((m, idx) => (
                <div key={idx} className="p-3 bg-white border border-[#E5DDD0] rounded-lg text-xs">
                  <span className="font-bold text-[#2D2D2D]">{m.name}</span>{' '}
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#8B5E3C]/15 text-[#8B5E3C]">{m.relation}</span>
                  <p className="text-[11px] text-[#6A5B4D] mt-1">{m.age} Yrs &bull; {m.gender} &bull; {m.occupation}</p>
                </div>
              ))}
            </div>
          </div>

          {/* DPDP Consent Box */}
          <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-3">
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="dpdp-consent"
                checked={consentGiven}
                onChange={(e) => setConsentGiven(e.target.checked)}
                className="mt-1 w-4 h-4 text-[#8B5E3C] border-[#E5DDD0] rounded focus:ring-[#8B5E3C] cursor-pointer"
              />
              <label htmlFor="dpdp-consent" className="text-xs text-[#2D2D2D] leading-relaxed cursor-pointer">
                <span className="font-bold text-emerald-800 block mb-0.5">DPDP Act 2023 Statutory Consent Acknowledgment</span>
                I hereby declare that I am the authorized Family Head and provide explicit consent to enroll our family census records into the official Shri Kutch Gurjar Kshatriya Samaj directory in accordance with the Digital Personal Data Protection Act 2023.
              </label>
            </div>
          </div>

          <div className="pt-6 border-t border-[#E5DDD0] flex justify-between">
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="px-5 py-2.5 border border-[#E5DDD0] text-[#6A5B4D] text-xs font-semibold rounded-lg hover:bg-[#FAF7F2] cursor-pointer flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Step 2
            </button>
            <button
              type="button"
              disabled={isSubmitting || !consentGiven}
              onClick={handleSubmit}
              className="px-8 py-3 bg-[#8B5E3C] hover:bg-[#704A2E] text-white text-xs font-bold rounded-lg shadow-sm disabled:opacity-50 flex items-center gap-2 cursor-pointer transition-colors"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating Official Census Record...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Confirm & Create Family Profile
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
