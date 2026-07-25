'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createFamilyForUserAction } from '@/app/actions/family';
import { toast } from 'sonner';
import CustomDropdown from '@/components/CustomDropdown';
import { Home, MapPin, Phone, User, Plus, Trash2, X, CheckCircle, Sparkles } from 'lucide-react';

interface CreateFamilyModalProps {
  userEmail?: string | null;
  onClose?: () => void;
}

export default function CreateFamilyModal({ userEmail, onClose }: CreateFamilyModalProps) {
  const router = useRouter();
  const [headName, setHeadName] = useState('');
  const [nativeVillage, setNativeVillage] = useState('');
  const [address, setAddress] = useState('');
  const [mobile, setMobile] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Additional member state
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
    education: 'Secondary',
    bloodGroup: 'O+',
    mobile: '',
  });

  const handleAddMember = () => {
    if (!newMember.name.trim()) {
      toast.error('Please enter the family member name.');
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
  };

  const handleRemoveMember = (index: number) => {
    setMembers(members.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!headName.trim() || !nativeVillage.trim() || !address.trim() || !mobile.trim()) {
      toast.error('Please fill in all required family fields.');
      return;
    }

    setIsSubmitting(true);
    const res = await createFamilyForUserAction({
      headName,
      country: 'India',
      city: 'Ahmedabad',
      nativeVillage,
      address,
      mobile,
      email: userEmail || undefined,
      members,
    });
    setIsSubmitting(false);

    if (res.error) {
      toast.error(res.error);
    } else if (res.success) {
      toast.success('Your family census profile has been created successfully!');
      if (onClose) onClose();
      router.refresh();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-xl border border-[#E5DDD0] shadow-2xl max-w-2xl w-full p-6 md:p-8 space-y-6 my-8">
        
        {/* Header */}
        <div className="flex justify-between items-center border-b border-[#E5DDD0] pb-4">
          <div>
            <div className="flex items-center gap-2 text-[#8B5E3C] mb-1">
              <Sparkles className="w-5 h-5 text-[#8B5E3C]" />
              <span className="text-xs font-bold uppercase tracking-wider">New Family Enrollment</span>
            </div>
            <h2 className="text-xl font-serif font-bold text-[#2D2D2D]">
              Create Your Family Census Profile
            </h2>
          </div>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 text-xs">
          
          {/* Step 1: Head & Location Info */}
          <div className="space-y-4 bg-[#FAF7F2] p-4 rounded-lg border border-[#E5DDD0]">
            <h3 className="font-bold text-[#8B5E3C] uppercase text-xs tracking-wider flex items-center gap-1.5">
              <Home className="w-4 h-4" /> 1. Family Head & Primary Location
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-[#6A5B4D] mb-1 uppercase text-[10px]">
                  Family Head Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={headName}
                  onChange={(e) => setHeadName(e.target.value)}
                  placeholder="e.g. Param Khodiyar"
                  className="w-full p-2.5 bg-white border border-[#E5DDD0] rounded text-xs focus:outline-none focus:border-[#8B5E3C]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#6A5B4D] mb-1 uppercase text-[10px]">
                  Native Village in Kutch *
                </label>
                <input
                  type="text"
                  required
                  value={nativeVillage}
                  onChange={(e) => setNativeVillage(e.target.value)}
                  placeholder="e.g. Madhapar, Kera, Anjar"
                  className="w-full p-2.5 bg-white border border-[#E5DDD0] rounded text-xs focus:outline-none focus:border-[#8B5E3C]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-[#6A5B4D] mb-1 uppercase text-[10px]">
                  Primary Contact Mobile Number *
                </label>
                <input
                  type="tel"
                  required
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="10-digit mobile number"
                  className="w-full p-2.5 bg-white border border-[#E5DDD0] rounded text-xs focus:outline-none focus:border-[#8B5E3C]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#6A5B4D] mb-1 uppercase text-[10px]">
                  Residential Address *
                </label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Street address, City, Pincode"
                  className="w-full p-2.5 bg-white border border-[#E5DDD0] rounded text-xs focus:outline-none focus:border-[#8B5E3C]"
                />
              </div>
            </div>
          </div>

          {/* Step 2: Family Members */}
          <div className="space-y-4 border border-[#E5DDD0] p-4 rounded-lg">
            <h3 className="font-bold text-[#8B5E3C] uppercase text-xs tracking-wider flex items-center gap-1.5">
              <User className="w-4 h-4" /> 2. Add Family Members (Optional)
            </h3>

            {/* List of added members */}
            {members.length > 0 && (
              <div className="space-y-2">
                {members.map((m, idx) => (
                  <div key={idx} className="p-3 bg-[#FAF7F2] rounded border border-[#E5DDD0] flex justify-between items-center">
                    <div>
                      <span className="font-bold text-[#2D2D2D]">{m.name}</span>{' '}
                      <span className="text-[10px] px-2 py-0.5 rounded bg-[#8B5E3C]/10 text-[#8B5E3C] font-semibold">
                        {m.relation}
                      </span>
                      <p className="text-[11px] text-[#6A5B4D] mt-0.5">
                        {m.age} Yrs / {m.gender} &bull; {m.occupation} &bull; {m.bloodGroup}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveMember(idx)}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Form to add a member */}
            <div className="p-3 bg-[#FAF7F2]/50 border border-[#E5DDD0] rounded space-y-3">
              <span className="font-semibold text-[#6A5B4D] block uppercase text-[10px]">
                Add New Member Form
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="Member Name"
                  value={newMember.name}
                  onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                  className="p-2 bg-white border border-[#E5DDD0] rounded text-xs focus:outline-none"
                />
                <CustomDropdown
                  options={['Wife', 'Son', 'Daughter', 'Father', 'Mother', 'Brother', 'Sister']}
                  value={newMember.relation}
                  onChange={(val) => setNewMember({ ...newMember, relation: val })}
                  placeholder="Relation"
                />
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Age"
                    value={newMember.age}
                    onChange={(e) => setNewMember({ ...newMember, age: parseInt(e.target.value, 10) || 0 })}
                    className="w-20 p-2 bg-white border border-[#E5DDD0] rounded text-xs focus:outline-none"
                  />
                  <div className="flex-1">
                    <CustomDropdown
                      options={[
                        { value: 'MALE', label: 'Male' },
                        { value: 'FEMALE', label: 'Female' },
                        { value: 'OTHER', label: 'Other' },
                      ]}
                      value={newMember.gender}
                      onChange={(val) => setNewMember({ ...newMember, gender: val as any })}
                      placeholder="Gender"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={handleAddMember}
                  className="px-3.5 py-1.5 bg-[#8B5E3C] hover:bg-[#704A2E] text-white rounded text-xs font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Member to List
                </button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-[#E5DDD0]">
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-[#E5DDD0] text-[#6A5B4D] text-xs font-semibold rounded hover:bg-[#FAF7F2] cursor-pointer"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-[#8B5E3C] hover:bg-[#704A2E] text-white text-xs font-bold rounded shadow-sm disabled:opacity-50 flex items-center gap-2 cursor-pointer"
            >
              <CheckCircle className="w-4 h-4" />
              {isSubmitting ? 'Creating Profile...' : 'Save & Create Family Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
