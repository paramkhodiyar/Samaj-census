'use client';

import React, { useState, startTransition, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslation } from '@/context/I18nContext';
import { submitCorrectionRequest } from '@/app/actions/requests';
import { toast } from 'sonner';
import { useConfirm } from '@/context/ConfirmContext';
import CustomDropdown from '@/components/CustomDropdown';
import { 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  Plus, 
  Trash2, 
  UserPlus, 
  FileText, 
  Camera,
  FolderOpen
} from 'lucide-react';

interface EditFamilyWizardProps {
  family: {
    id: string;
    familyId: string;
    headName: string;
    mobile: string;
    address: string | null;
    nativeVillage: string | null;
    members: Array<{
      id: string;
      name: string;
      relation: string;
      age: number;
      gender: string;
    }>;
  };
  userId: string;
}

export default function EditFamilyWizard({ family, userId }: EditFamilyWizardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const confirm = useConfirm();
  
  // Set initial step based on URL query param if present
  const stepParam = searchParams.get('step');
  const initialStep = stepParam ? parseInt(stepParam, 10) : 1;
  const [step, setStep] = useState(initialStep >= 1 && initialStep <= 6 ? initialStep : 1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { t } = useTranslation();

  // Step 1 State: Family Info
  const [familyInfo, setFamilyInfo] = useState({
    address: family.address || '',
    nativeVillage: family.nativeVillage || '',
    mobile: family.mobile || '',
  });

  // Step 2 State: Add Members
  const [addMembers, setAddMembers] = useState<Array<{
    name: string;
    relation: string;
    age: number;
    occupation: string;
    education: string;
    bloodGroup: string;
    mobile: string;
    email: string;
    gender: 'MALE' | 'FEMALE' | 'OTHER';
    maritalStatus: string;
  }>>([]);

  const [newMemberForm, setNewMemberForm] = useState({
    name: '',
    relation: 'Son',
    age: '',
    occupation: '',
    education: '',
    bloodGroup: 'O+',
    mobile: '',
    email: '',
    gender: 'MALE' as 'MALE' | 'FEMALE' | 'OTHER',
    maritalStatus: 'SINGLE',
  });

  // Step 3 State: Remove Members
  const [removeMembers, setRemoveMembers] = useState<Array<{
    memberId: string;
    memberName: string;
    reason: string;
  }>>([]);

  // Step 4 State: Transfer Members
  const [transferMembers, setTransferMembers] = useState<Array<{
    memberId: string;
    memberName: string;
    targetFamilyId: string;
    reason: string;
  }>>([]);

  // Step 5 State: Member Corrections
  const [memberCorrections, setMemberCorrections] = useState<Array<{
    memberId: string;
    memberName: string;
    fieldName: string;
    oldValue: string;
    newValue: string;
  }>>([]);
  const [selectedCorrMemberId, setSelectedCorrMemberId] = useState('');
  const [selectedCorrField, setSelectedCorrField] = useState('name');
  const [corrNewValue, setCorrNewValue] = useState('');
  const [otherCorrections, setOtherCorrections] = useState('');

  // Load Draft from LocalStorage on mount
  useEffect(() => {
    const draftKey = `samaj_census_edit_draft_${family.id}`;
    const rawDraft = localStorage.getItem(draftKey);
    if (rawDraft) {
      try {
        const draft = JSON.parse(rawDraft);
        
        confirm({
          title: 'Restore Census Draft',
          message: 'We found an unsaved draft of corrections for your family. Do you want to restore your progress?',
        }).then((restore) => {
          if (restore) {
            if (draft.familyInfo) setFamilyInfo(draft.familyInfo);
            if (draft.addMembers) setAddMembers(draft.addMembers);
            if (draft.removeMembers) setRemoveMembers(draft.removeMembers);
            if (draft.transferMembers) setTransferMembers(draft.transferMembers);
            if (draft.memberCorrections) setMemberCorrections(draft.memberCorrections);
            if (draft.otherCorrections) setOtherCorrections(draft.otherCorrections);
            toast.success('Draft restored successfully');
          } else {
            localStorage.removeItem(draftKey);
          }
        });
      } catch (err) {
        console.error('Failed to parse draft:', err);
      }
    }
  }, [family.id]);

  // Save Draft to LocalStorage whenever compilation changes
  useEffect(() => {
    const draftKey = `samaj_census_edit_draft_${family.id}`;
    
    const hasChanges = 
      familyInfo.address !== (family.address || '') ||
      familyInfo.nativeVillage !== (family.nativeVillage || '') ||
      familyInfo.mobile !== (family.mobile || '') ||
      addMembers.length > 0 ||
      removeMembers.length > 0 ||
      transferMembers.length > 0 ||
      memberCorrections.length > 0 ||
      otherCorrections.trim().length > 0;

    if (hasChanges) {
      localStorage.setItem(draftKey, JSON.stringify({
        familyInfo,
        addMembers,
        removeMembers,
        transferMembers,
        memberCorrections,
        otherCorrections
      }));
    } else {
      localStorage.removeItem(draftKey);
    }
  }, [familyInfo, addMembers, removeMembers, transferMembers, memberCorrections, otherCorrections, family]);

  // Wizard Navigation
  const handleNext = () => {
    if (step < 6) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  // Add Member Action
  const handleAddMemberToList = () => {
    if (!newMemberForm.name || !newMemberForm.age) {
      toast.error('Please enter name and age for the new member');
      return;
    }
    setAddMembers([...addMembers, {
      ...newMemberForm,
      age: parseInt(newMemberForm.age, 10),
    }]);
    // Reset form
    setNewMemberForm({
      name: '',
      relation: 'Son',
      age: '',
      occupation: '',
      education: '',
      bloodGroup: 'O+',
      mobile: '',
      email: '',
      gender: 'MALE',
      maritalStatus: 'SINGLE',
    });
    toast.success('Member added to compilation list.');
  };

  // Remove Member Selection toggle
  const handleToggleRemoval = (memberId: string, memberName: string, reason: string) => {
    const existing = removeMembers.find(r => r.memberId === memberId);
    if (existing) {
      setRemoveMembers(removeMembers.filter(r => r.memberId !== memberId));
    } else {
      setRemoveMembers([...removeMembers, { memberId, memberName, reason }]);
    }
  };

  // Add Transfer Action
  const handleAddTransfer = (memberId: string, memberName: string, targetFamilyId: string, reason: string) => {
    if (!targetFamilyId) {
      toast.error('Please enter target Family ID');
      return;
    }
    setTransferMembers([
      ...transferMembers.filter(t => t.memberId !== memberId),
      { memberId, memberName, targetFamilyId, reason }
    ]);
    toast.success(`Transfer requested for ${memberName}`);
  };

  // Add Member Detail Correction
  const handleAddCorrection = () => {
    if (!selectedCorrMemberId || !corrNewValue.trim()) {
      toast.error('Please select a member and enter a corrected value');
      return;
    }
    const member = family.members.find(m => m.id === selectedCorrMemberId);
    if (!member) return;

    // Filter out existing corrections for the same member & field
    const cleanCorrections = memberCorrections.filter(
      c => !(c.memberId === selectedCorrMemberId && c.fieldName === selectedCorrField)
    );
    const oldValue = String((member as any)[selectedCorrField] || '');

    setMemberCorrections([
      ...cleanCorrections,
      {
        memberId: selectedCorrMemberId,
        memberName: member.name,
        fieldName: selectedCorrField,
        oldValue,
        newValue: corrNewValue.trim(),
      }
    ]);
    setCorrNewValue('');
    toast.success(`Correction listed for ${member.name}`);
  };

  // Submit Request
  const handleSubmit = async () => {
    const isConfirmed = await confirm({
      title: 'Submit Update Request',
      message: 'Please review all correction steps before submitting. Proposing incorrect census details is subject to Samaj Committee verification. Do you want to submit this request?',
    });
    if (!isConfirmed) return;

    setIsSubmitting(true);
    const result = await submitCorrectionRequest({
      familyInfo,
      addMembers,
      removeMembers,
      transferMembers,
      memberCorrections,
      otherCorrections: otherCorrections.trim() || undefined,
    });
    setIsSubmitting(false);

    if (result?.error) {
      toast.error(result.error);
    } else if (result?.success) {
      localStorage.removeItem(`samaj_census_edit_draft_${family.id}`);
      toast.success('Correction request submitted successfully! Pending admin approval.');
      startTransition(() => {
        router.push('/dashboard/requests');
      });
    }
  };

  const stepsList = [
    t('step1'),
    t('step2'),
    t('step3'),
    t('step4'),
    t('step5'),
    t('step6'),
  ];

  return (
    <div className="bg-white rounded-lg border border-[#E5DDD0] shadow-sm overflow-hidden flex flex-col md:flex-row min-h-[500px]">
      
      {/* Sidebar - Step Tracker */}
      <div className="w-full md:w-64 bg-[#FAF7F2] p-6 border-b md:border-b-0 md:border-r border-[#E5DDD0]">
        <h3 className="font-serif font-bold text-[#8B5E3C] text-lg mb-6">{t('wizardTitle')}</h3>
        <nav className="space-y-4">
          {stepsList.map((stepName, index) => {
            const stepNum = index + 1;
            const isCurrent = step === stepNum;
            const isCompleted = step > stepNum;
            return (
              <div key={stepNum} className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border transition-colors ${
                  isCurrent ? 'bg-[#8B5E3C] text-white border-[#8B5E3C]' : 
                  isCompleted ? 'bg-[#D4A373] text-white border-[#D4A373]' : 
                  'bg-white text-[#6A5B4D] border-[#E5DDD0]'
                }`}>
                  {isCompleted ? <Check className="w-3.5 h-3.5" /> : stepNum}
                </div>
                <span className={`text-xs font-semibold ${isCurrent ? 'text-[#8B5E3C]' : 'text-[#6A5B4D]'}`}>
                  {stepName}
                </span>
              </div>
            );
          })}
        </nav>
      </div>

      {/* Main Workspaces */}
      <div className="flex-1 p-6 md:p-8 flex flex-col justify-between">
        
        {/* Step Content */}
        <div className="space-y-6">
          <div className="border-b border-[#FAF7F2] pb-4 mb-4">
            <h2 className="text-base font-serif font-bold text-[#8B5E3C] uppercase tracking-wide">
              {step}. {stepsList[step - 1]}
            </h2>
          </div>

          {/* STEP 1: Family Info */}
          {step === 1 && (
            <div className="space-y-4 max-w-md">
              <div>
                <label className="block text-xs font-bold text-[#6A5B4D] uppercase tracking-wider mb-1.5">
                  {t('nativeVillage')}
                </label>
                <input
                  type="text"
                  value={familyInfo.nativeVillage}
                  onChange={(e) => setFamilyInfo({ ...familyInfo, nativeVillage: e.target.value })}
                  placeholder="e.g. Kera, Madhapar"
                  className="px-3 py-2 w-full bg-[#FAF7F2] border border-[#E5DDD0] rounded text-sm focus:outline-none focus:ring-1 focus:ring-[#8B5E3C]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#6A5B4D] uppercase tracking-wider mb-1.5">
                  {t('mobileNumber')}
                </label>
                <input
                  type="tel"
                  value={familyInfo.mobile}
                  onChange={(e) => setFamilyInfo({ ...familyInfo, mobile: e.target.value })}
                  placeholder="Primary contact phone"
                  className="px-3 py-2 w-full bg-[#FAF7F2] border border-[#E5DDD0] rounded text-sm focus:outline-none focus:ring-1 focus:ring-[#8B5E3C]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#6A5B4D] uppercase tracking-wider mb-1.5">
                  {t('address')}
                </label>
                <textarea
                  rows={3}
                  value={familyInfo.address}
                  onChange={(e) => setFamilyInfo({ ...familyInfo, address: e.target.value })}
                  placeholder="Enter full address"
                  className="px-3 py-2 w-full bg-[#FAF7F2] border border-[#E5DDD0] rounded text-sm focus:outline-none focus:ring-1 focus:ring-[#8B5E3C]"
                />
              </div>
            </div>
          )}

          {/* STEP 2: Add Members */}
          {step === 2 && (
            <div className="space-y-6">
              {/* Member form */}
              <div className="bg-[#FAF7F2] p-5 rounded border border-[#E5DDD0] grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-[#6A5B4D] mb-1">Full Name</label>
                  <input
                    type="text"
                    value={newMemberForm.name}
                    onChange={(e) => setNewMemberForm({ ...newMemberForm, name: e.target.value })}
                    placeholder="First Middle Lastname"
                    className="px-3 py-2 w-full bg-white border border-[#E5DDD0] rounded focus:outline-none focus:ring-1 focus:ring-[#8B5E3C]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#6A5B4D] mb-1">Age</label>
                  <input
                    type="number"
                    value={newMemberForm.age}
                    onChange={(e) => setNewMemberForm({ ...newMemberForm, age: e.target.value })}
                    placeholder="e.g. 25"
                    className="px-3 py-2 w-full bg-white border border-[#E5DDD0] rounded focus:outline-none focus:ring-1 focus:ring-[#8B5E3C]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#6A5B4D] mb-1">Relation to Head</label>
                  <CustomDropdown
                    options={['Wife', 'Son', 'Daughter', 'Father', 'Mother', 'Brother', 'Sister']}
                    value={newMemberForm.relation}
                    onChange={(val) => setNewMemberForm({ ...newMemberForm, relation: val })}
                    placeholder="Select Relation"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#6A5B4D] mb-1">Gender</label>
                  <CustomDropdown
                    options={[
                      { value: 'MALE', label: 'Male' },
                      { value: 'FEMALE', label: 'Female' },
                      { value: 'OTHER', label: 'Other' },
                    ]}
                    value={newMemberForm.gender}
                    onChange={(val) => setNewMemberForm({ ...newMemberForm, gender: val as any })}
                    placeholder="Select Gender"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#6A5B4D] mb-1">Marital Status</label>
                  <CustomDropdown
                    options={[
                      { value: 'SINGLE', label: 'Single' },
                      { value: 'MARRIED', label: 'Married' },
                      { value: 'DIVORCED', label: 'Divorced' },
                      { value: 'WIDOWED', label: 'Widowed' },
                    ]}
                    value={newMemberForm.maritalStatus}
                    onChange={(val) => setNewMemberForm({ ...newMemberForm, maritalStatus: val })}
                    placeholder="Select Status"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#6A5B4D] mb-1">Occupation</label>
                  <input
                    type="text"
                    value={newMemberForm.occupation}
                    onChange={(e) => setNewMemberForm({ ...newMemberForm, occupation: e.target.value })}
                    placeholder="e.g. Engineer, Business"
                    className="px-3 py-2 w-full bg-white border border-[#E5DDD0] rounded focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#6A5B4D] mb-1">Education</label>
                  <input
                    type="text"
                    value={newMemberForm.education}
                    onChange={(e) => setNewMemberForm({ ...newMemberForm, education: e.target.value })}
                    placeholder="e.g. Graduate"
                    className="px-3 py-2 w-full bg-white border border-[#E5DDD0] rounded focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#6A5B4D] mb-1">Blood Group</label>
                  <input
                    type="text"
                    value={newMemberForm.bloodGroup}
                    onChange={(e) => setNewMemberForm({ ...newMemberForm, bloodGroup: e.target.value })}
                    placeholder="e.g. O+"
                    className="px-3 py-2 w-full bg-white border border-[#E5DDD0] rounded focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#6A5B4D] mb-1">Mobile</label>
                  <input
                    type="tel"
                    value={newMemberForm.mobile}
                    onChange={(e) => setNewMemberForm({ ...newMemberForm, mobile: e.target.value })}
                    placeholder="Contact number"
                    className="px-3 py-2 w-full bg-white border border-[#E5DDD0] rounded focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-[#6A5B4D] mb-1">Email</label>
                  <input
                    type="email"
                    value={newMemberForm.email}
                    onChange={(e) => setNewMemberForm({ ...newMemberForm, email: e.target.value })}
                    placeholder="example@samaj.org"
                    className="px-3 py-2 w-full bg-white border border-[#E5DDD0] rounded focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-3 flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={handleAddMemberToList}
                    className="px-4 py-2 bg-[#B08968] hover:bg-[#977150] text-white font-semibold rounded shadow flex items-center gap-1.5"
                  >
                    <UserPlus className="w-4 h-4" />
                    Compile Member
                  </button>
                </div>
              </div>

              {/* Added members list */}
              {addMembers.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-[#6A5B4D] uppercase tracking-wider">Members Compiled to Add</h4>
                  <div className="divide-y divide-[#E5DDD0] border border-[#E5DDD0] rounded overflow-hidden bg-white text-xs">
                    {addMembers.map((m, idx) => (
                      <div key={idx} className="p-3 flex justify-between items-center bg-[#FAF7F2]/30">
                        <div>
                          <p className="font-bold text-[#2D2D2D]">{m.name} ({m.relation}, Age {m.age})</p>
                          <p className="text-[#6A5B4D] text-[10px] mt-0.5">Edu: {m.education} | Occ: {m.occupation} | Blood: {m.bloodGroup}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setAddMembers(addMembers.filter((_, i) => i !== idx))}
                          className="text-red-600 hover:text-red-800 p-1.5"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 3: Remove Member */}
          {step === 3 && (
            <div className="space-y-4">
              <p className="text-xs text-[#6A5B4D] leading-relaxed">
                Select family members to remove from current active census record. Specify reasons (e.g. marriage out of family, separation, or demise).
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {family.members.map((m) => {
                  const isChecked = !!removeMembers.find(r => r.memberId === m.id);
                  const removalObj = removeMembers.find(r => r.memberId === m.id);
                  return (
                    <div key={m.id} className={`p-4 rounded border text-xs flex flex-col justify-between ${
                      isChecked ? 'border-[#8B5E3C] bg-[#FAF7F2]/40' : 'border-[#E5DDD0]'
                    }`}>
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-bold text-[#2D2D2D]">{m.name}</h4>
                          <p className="text-[10px] text-[#6A5B4D] mt-0.5">{m.relation} • Gender: {m.gender}</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleRemoval(m.id, m.name, '')}
                          className="w-4 h-4 text-[#8B5E3C] focus:ring-[#8B5E3C]"
                        />
                      </div>
                      
                      {isChecked && (
                        <div className="mt-3">
                          <label className="block text-[10px] font-bold text-[#6A5B4D] uppercase tracking-wider mb-1">Reason for Removal</label>
                          <input
                            type="text"
                            required
                            value={removalObj?.reason || ''}
                            onChange={(e) => {
                              setRemoveMembers(
                                removeMembers.map(r => r.memberId === m.id ? { ...r, reason: e.target.value } : r)
                              );
                            }}
                            placeholder="e.g. Marriage out of family"
                            className="px-2.5 py-1.5 w-full bg-white border border-[#E5DDD0] rounded text-[11px]"
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 4: Transfer Member */}
          {step === 4 && (
            <div className="space-y-4">
              <p className="text-xs text-[#6A5B4D] leading-relaxed">
                Transfer family members to another Family ID (e.g. in case of division, marriage, or regional relocation).
              </p>

              <div className="space-y-4 max-w-lg">
                {family.members.map((m) => {
                  const transferObj = transferMembers.find(t => t.memberId === m.id);
                  const isActive = !!transferObj;

                  return (
                    <div key={m.id} className={`p-4 rounded border text-xs space-y-3 ${
                      isActive ? 'border-[#8B5E3C] bg-[#FAF7F2]/40' : 'border-[#E5DDD0]'
                    }`}>
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-bold text-[#2D2D2D]">{m.name}</h4>
                          <p className="text-[10px] text-[#6A5B4D]">{m.relation} • Age: {m.age}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            if (isActive) {
                              setTransferMembers(transferMembers.filter(t => t.memberId !== m.id));
                            } else {
                              setTransferMembers([...transferMembers, { memberId: m.id, memberName: m.name, targetFamilyId: '', reason: '' }]);
                            }
                          }}
                          className={`px-3 py-1.5 rounded text-[10px] font-bold border ${
                            isActive ? 'bg-[#8B5E3C] text-white border-[#8B5E3C]' : 'bg-white text-[#6A5B4D] border-[#E5DDD0]'
                          }`}
                        >
                          {isActive ? 'Cancel Transfer' : 'Request Transfer'}
                        </button>
                      </div>

                      {isActive && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[#E5DDD0]/50">
                          <div>
                            <label className="block text-[10px] font-bold text-[#6A5B4D] uppercase tracking-wider mb-1">
                              Target Family ID
                            </label>
                            <input
                              type="text"
                              required
                              value={transferObj.targetFamilyId}
                              onChange={(e) => {
                                setTransferMembers(
                                  transferMembers.map(t => t.memberId === m.id ? { ...t, targetFamilyId: e.target.value.toUpperCase() } : t)
                                );
                              }}
                              placeholder="e.g. KG-2026-00456"
                              className="px-2.5 py-1.5 w-full bg-white border border-[#E5DDD0] rounded text-[11px]"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-[#6A5B4D] uppercase tracking-wider mb-1">
                              Reason for Transfer
                            </label>
                            <input
                              type="text"
                              required
                              value={transferObj.reason}
                              onChange={(e) => {
                                setTransferMembers(
                                  transferMembers.map(t => t.memberId === m.id ? { ...t, reason: e.target.value } : t)
                                );
                              }}
                              placeholder="e.g. Partition, relocation"
                              className="px-2.5 py-1.5 w-full bg-white border border-[#E5DDD0] rounded text-[11px]"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 5: Member Details Corrections */}
          {step === 5 && (
            <div className="space-y-6">
              <p className="text-xs text-[#6A5B4D] leading-relaxed">
                Select a member and specify corrections for particular fields. These corrections will be applied automatically upon admin approval.
              </p>

              {/* Add Correction Box */}
              <div className="bg-[#FAF7F2] p-4 rounded border border-[#E5DDD0] max-w-lg text-xs space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-[#6A5B4D] mb-1.5">Select Family Member</label>
                    <CustomDropdown
                      options={[
                        { value: '', label: '-- Choose Member --' },
                        ...family.members.map((m) => ({ value: m.id, label: `${m.name} (${m.relation})` })),
                      ]}
                      value={selectedCorrMemberId}
                      onChange={(val) => {
                        setSelectedCorrMemberId(val);
                        setCorrNewValue('');
                      }}
                      placeholder="-- Choose Member --"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[#6A5B4D] mb-1.5">Select Field to Correct</label>
                    <CustomDropdown
                      options={[
                        { value: 'name', label: 'Full Name' },
                        { value: 'age', label: 'Age' },
                        { value: 'occupation', label: 'Occupation' },
                        { value: 'education', label: 'Education' },
                        { value: 'bloodGroup', label: 'Blood Group' },
                        { value: 'mobile', label: 'Mobile Number' },
                      ]}
                      value={selectedCorrField}
                      onChange={(val) => {
                        setSelectedCorrField(val);
                        setCorrNewValue('');
                      }}
                      placeholder="Select Field"
                    />
                  </div>
                </div>

                {selectedCorrMemberId && (
                  <div className="p-3 bg-white rounded border border-[#E5DDD0]/50 text-xs">
                    <span className="text-[10px] font-bold text-[#6A5B4D] uppercase">Current Value in Census Database:</span>
                    <p className="font-semibold text-[#8B5E3C] mt-0.5">
                      {String((family.members.find(m => m.id === selectedCorrMemberId) as any)?.[selectedCorrField] || 'Empty')}
                    </p>
                  </div>
                )}

                <div>
                  <label className="block font-bold text-[#6A5B4D] mb-1.5">Corrected Value</label>
                  <input
                    type="text"
                    value={corrNewValue}
                    onChange={(e) => setCorrNewValue(e.target.value)}
                    placeholder="Enter the correct spelling/value"
                    className="px-3 py-2 w-full bg-white border border-[#E5DDD0] rounded focus:outline-none text-xs"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleAddCorrection}
                    className="px-4 py-2 bg-[#8B5E3C] hover:bg-[#704A2E] text-white rounded font-semibold text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    Add Correction
                  </button>
                </div>
              </div>

              {/* Table of Corrections */}
              {memberCorrections.length > 0 && (
                <div className="space-y-2 text-xs">
                  <h4 className="font-bold text-[#6A5B4D] uppercase tracking-wider">Proposed Member Corrections</h4>
                  <div className="border border-[#E5DDD0] rounded overflow-hidden bg-white divide-y divide-[#E5DDD0]">
                    {memberCorrections.map((c, idx) => (
                      <div key={idx} className="p-3 flex justify-between items-center text-xs">
                        <div>
                          <p className="font-bold text-[#2D2D2D]">{c.memberName}</p>
                          <p className="text-[10px] text-[#6A5B4D] mt-0.5">
                            Correct <span className="font-bold text-[#8B5E3C] uppercase">{c.fieldName}</span>: 
                            <span className="line-through text-red-500 mx-1">"{c.oldValue || 'Empty'}"</span> → 
                            <span className="text-emerald-600 font-semibold ml-1">"{c.newValue}"</span>
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setMemberCorrections(memberCorrections.filter((_, i) => i !== idx))}
                          className="text-red-600 hover:text-red-800 p-1 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Optional general other corrections text */}
              <div className="max-w-lg border-t border-[#E5DDD0]/60 pt-4">
                <label className="block text-xs font-bold text-[#6A5B4D] uppercase tracking-wider mb-1.5">
                  Other Unstructured Notes (Optional)
                </label>
                <textarea
                  rows={3}
                  value={otherCorrections}
                  onChange={(e) => setOtherCorrections(e.target.value)}
                  placeholder="Specify any general comments or unstructured notes here..."
                  className="px-3 py-2 w-full bg-[#FAF7F2] border border-[#E5DDD0] rounded text-xs focus:outline-none focus:ring-1 focus:ring-[#8B5E3C]"
                />
              </div>
            </div>
          )}

          {/* STEP 6: Review & Submit */}
          {step === 6 && (
            <div className="space-y-6">
              <p className="text-xs text-[#6A5B4D] font-medium">
                {t('reviewHeading')}
              </p>

              <div className="divide-y divide-[#E5DDD0] border border-[#E5DDD0] rounded overflow-hidden bg-white text-xs">
                {/* Family Info summary */}
                <div className="p-4 space-y-2 bg-[#FAF7F2]/20">
                  <h4 className="font-bold text-[#8B5E3C] uppercase tracking-wider">Step 1: Family Corrections</h4>
                  {familyInfo.nativeVillage === family.nativeVillage &&
                   familyInfo.mobile === family.mobile &&
                   familyInfo.address === family.address ? (
                    <p className="text-[#6A5B4D] italic">{t('noChanges')}</p>
                  ) : (
                    <ul className="list-disc list-inside text-xs space-y-1.5 text-[#2D2D2D]">
                      {familyInfo.nativeVillage !== family.nativeVillage && (
                        <li>Native Village: <span className="font-semibold">"{family.nativeVillage}" → "{familyInfo.nativeVillage}"</span></li>
                      )}
                      {familyInfo.mobile !== family.mobile && (
                        <li>Mobile Phone: <span className="font-semibold">"{family.mobile}" → "{familyInfo.mobile}"</span></li>
                      )}
                      {familyInfo.address !== family.address && (
                        <li>Residential Address: <span className="font-semibold">"{family.address}" → "{familyInfo.address}"</span></li>
                      )}
                    </ul>
                  )}
                </div>

                {/* Add member summary */}
                <div className="p-4 space-y-2">
                  <h4 className="font-bold text-[#8B5E3C] uppercase tracking-wider">Step 2: Add Members</h4>
                  {addMembers.length === 0 ? (
                    <p className="text-[#6A5B4D] italic">{t('noChanges')}</p>
                  ) : (
                    <ul className="list-disc list-inside text-xs space-y-1.5 text-[#2D2D2D]">
                      {addMembers.map((m, idx) => (
                        <li key={idx}>
                          Add <span className="font-semibold">{m.name}</span> ({m.relation}, Age {m.age}, Occ: {m.occupation}, Edu: {m.education})
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Remove member summary */}
                <div className="p-4 space-y-2 bg-[#FAF7F2]/20">
                  <h4 className="font-bold text-[#8B5E3C] uppercase tracking-wider">Step 3: Remove Members</h4>
                  {removeMembers.length === 0 ? (
                    <p className="text-[#6A5B4D] italic">{t('noChanges')}</p>
                  ) : (
                    <ul className="list-disc list-inside text-xs space-y-1.5 text-[#2D2D2D]">
                      {removeMembers.map((m) => (
                        <li key={m.memberId}>
                          Remove <span className="font-semibold">{m.memberName}</span>. Reason: "{m.reason || 'Not specified'}"
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Transfer summary */}
                <div className="p-4 space-y-2">
                  <h4 className="font-bold text-[#8B5E3C] uppercase tracking-wider">Step 4: Transfer Members</h4>
                  {transferMembers.length === 0 ? (
                    <p className="text-[#6A5B4D] italic">{t('noChanges')}</p>
                  ) : (
                    <ul className="list-disc list-inside text-xs space-y-1.5 text-[#2D2D2D]">
                      {transferMembers.map((m) => (
                        <li key={m.memberId}>
                          Transfer <span className="font-semibold">{m.memberName}</span> to Family ID: <span className="font-semibold">{m.targetFamilyId}</span>. Reason: "{m.reason || 'Not specified'}"
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Member Corrections summary */}
                <div className="p-4 space-y-2 bg-[#FAF7F2]/20">
                  <h4 className="font-bold text-[#8B5E3C] uppercase tracking-wider">Step 5: Member Corrections</h4>
                  {memberCorrections.length === 0 ? (
                    <p className="text-[#6A5B4D] italic">{t('noChanges')}</p>
                  ) : (
                    <ul className="list-disc list-inside text-xs space-y-1.5">
                      {memberCorrections.map((c, idx) => (
                        <li key={idx}>
                          <strong>{c.memberName}</strong>: Correct {c.fieldName} from "{c.oldValue || 'Empty'}" to "{c.newValue}"
                        </li>
                      ))}
                    </ul>
                  )}
                  {otherCorrections.trim() && (
                    <div className="mt-2 text-xs">
                      <span className="font-bold text-[#6A5B4D] uppercase">General Notes:</span>
                      <p className="text-[#2D2D2D] italic mt-0.5">"{otherCorrections}"</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Wizard Actions */}
        <div className="flex justify-between items-center mt-8 pt-4 border-t border-[#E5DDD0] gap-4">
          <button
            type="button"
            onClick={handleBack}
            disabled={step === 1}
            className="px-4 py-2 border border-[#E5DDD0] text-[#6A5B4D] rounded font-semibold text-xs flex items-center gap-1.5 transition-all hover:bg-[#FAF7F2] disabled:opacity-50"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            {t('back')}
          </button>
          
          {step < 6 ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-5 py-2.5 bg-[#8B5E3C] hover:bg-[#704A2E] text-white font-semibold rounded shadow text-xs flex items-center gap-1.5 transition-all"
            >
              {t('next')}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-[#8B5E3C] hover:bg-[#704A2E] text-white font-semibold rounded shadow text-xs flex items-center gap-1.5 transition-all disabled:opacity-50"
            >
              {isSubmitting ? t('loading') : t('confirmSubmit')}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
