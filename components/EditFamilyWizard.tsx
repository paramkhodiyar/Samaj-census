'use client';

import React, { useState, startTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslation } from '@/context/I18nContext';
import { submitCorrectionRequest } from '@/app/actions/requests';
import { toast } from 'sonner';
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
  
  // Set initial step based on URL query param if present
  const stepParam = searchParams.get('step');
  const initialStep = stepParam ? parseInt(stepParam, 10) : 1;
  const [step, setStep] = useState(initialStep >= 1 && initialStep <= 7 ? initialStep : 1);
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

  // Step 5 State: Other Corrections
  const [otherCorrections, setOtherCorrections] = useState('');

  // Step 6 State: Documents
  const [documents, setDocuments] = useState<Array<{ name: string; fileUrl: string }>>([]);
  const [docForm, setDocForm] = useState({ name: '', fileUrl: '' });

  // Wizard Navigation
  const handleNext = () => {
    if (step < 7) setStep(step + 1);
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

  // Add Document
  const handleAddDoc = () => {
    if (!docForm.name || !docForm.fileUrl) {
      toast.error('Please specify document type/name and attach a file URL');
      return;
    }
    setDocuments([...documents, docForm]);
    setDocForm({ name: '', fileUrl: '' });
    toast.success('Document uploaded successfully');
  };

  // Submit Request
  const handleSubmit = async () => {
    setIsSubmitting(true);
    const result = await submitCorrectionRequest(family.id, userId, {
      familyInfo,
      addMembers,
      removeMembers,
      transferMembers,
      otherCorrections,
      documents,
    });
    setIsSubmitting(false);

    if (result?.error) {
      toast.error(result.error);
    } else if (result?.success) {
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
    t('step7'),
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
                  <select
                    value={newMemberForm.relation}
                    onChange={(e) => setNewMemberForm({ ...newMemberForm, relation: e.target.value })}
                    className="px-3 py-2 w-full bg-white border border-[#E5DDD0] rounded focus:outline-none focus:ring-1 focus:ring-[#8B5E3C]"
                  >
                    <option value="Wife">Wife</option>
                    <option value="Son">Son</option>
                    <option value="Daughter">Daughter</option>
                    <option value="Father">Father</option>
                    <option value="Mother">Mother</option>
                    <option value="Brother">Brother</option>
                    <option value="Sister">Sister</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#6A5B4D] mb-1">Gender</label>
                  <select
                    value={newMemberForm.gender}
                    onChange={(e) => setNewMemberForm({ ...newMemberForm, gender: e.target.value as any })}
                    className="px-3 py-2 w-full bg-white border border-[#E5DDD0] rounded focus:outline-none"
                  >
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#6A5B4D] mb-1">Marital Status</label>
                  <select
                    value={newMemberForm.maritalStatus}
                    onChange={(e) => setNewMemberForm({ ...newMemberForm, maritalStatus: e.target.value })}
                    className="px-3 py-2 w-full bg-white border border-[#E5DDD0] rounded focus:outline-none"
                  >
                    <option value="SINGLE">Single</option>
                    <option value="MARRIED">Married</option>
                    <option value="DIVORCED">Divorced</option>
                    <option value="WIDOWED">Widowed</option>
                  </select>
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

          {/* STEP 5: Other Corrections */}
          {step === 5 && (
            <div className="space-y-4 max-w-lg">
              <p className="text-xs text-[#6A5B4D] leading-relaxed">
                Describe any other discrepancies on details such as names, spelling corrections, occupations, blood groups, etc.
              </p>
              <div>
                <label className="block text-xs font-bold text-[#6A5B4D] uppercase tracking-wider mb-1.5">
                  Corrections Description
                </label>
                <textarea
                  rows={6}
                  value={otherCorrections}
                  onChange={(e) => setOtherCorrections(e.target.value)}
                  placeholder="Specify spelling fixes, blood groups correction, or educational field adjustments."
                  className="px-3 py-2 w-full bg-[#FAF7F2] border border-[#E5DDD0] rounded text-sm focus:outline-none focus:ring-1 focus:ring-[#8B5E3C]"
                />
              </div>
            </div>
          )}

          {/* STEP 6: Photos & Documents */}
          {step === 6 && (
            <div className="space-y-6">
              <p className="text-xs text-[#6A5B4D] leading-relaxed">
                Upload scans or photographs of verification documents (Aadhaar Cards, certificates, family photo) to support verification.
              </p>

              <div className="bg-[#FAF7F2] p-4 rounded border border-[#E5DDD0] max-w-md text-xs space-y-4">
                <div>
                  <label className="block font-bold text-[#6A5B4D] mb-1">Document Name</label>
                  <input
                    type="text"
                    value={docForm.name}
                    onChange={(e) => setDocForm({ ...docForm, name: e.target.value })}
                    placeholder="e.g. Aadhaar Card - Rohan"
                    className="px-3 py-2 w-full bg-white border border-[#E5DDD0] rounded focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#6A5B4D] mb-1">Document File URL (Simulated Link)</label>
                  <input
                    type="text"
                    value={docForm.fileUrl}
                    onChange={(e) => setDocForm({ ...docForm, fileUrl: e.target.value })}
                    placeholder="e.g. https://files.samaj.org/docs/aadhaar.jpg"
                    className="px-3 py-2 w-full bg-white border border-[#E5DDD0] rounded focus:outline-none"
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleAddDoc}
                    className="px-3.5 py-2 bg-[#B08968] text-white hover:bg-[#977150] rounded font-semibold flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Attach Document
                  </button>
                </div>
              </div>

              {documents.length > 0 && (
                <div className="space-y-2 text-xs">
                  <h4 className="font-bold text-[#6A5B4D] uppercase tracking-wider">Uploaded Documents</h4>
                  <div className="divide-y divide-[#E5DDD0] border border-[#E5DDD0] rounded bg-white">
                    {documents.map((d, idx) => (
                      <div key={idx} className="p-3 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <FolderOpen className="w-4 h-4 text-[#8B5E3C]" />
                          <div>
                            <span className="font-bold text-[#2D2D2D]">{d.name}</span>
                            <span className="text-[10px] text-blue-600 block hover:underline truncate max-w-xs">{d.fileUrl}</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setDocuments(documents.filter((_, i) => i !== idx))}
                          className="text-red-600 hover:text-red-800 p-1"
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

          {/* STEP 7: Review & Submit */}
          {step === 7 && (
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

                {/* Other summary */}
                <div className="p-4 space-y-2 bg-[#FAF7F2]/20">
                  <h4 className="font-bold text-[#8B5E3C] uppercase tracking-wider">Step 5: Other Corrections</h4>
                  {otherCorrections.trim() ? (
                    <p className="text-[#2D2D2D] font-medium">{otherCorrections}</p>
                  ) : (
                    <p className="text-[#6A5B4D] italic">{t('noChanges')}</p>
                  )}
                </div>

                {/* Docs summary */}
                <div className="p-4 space-y-2">
                  <h4 className="font-bold text-[#8B5E3C] uppercase tracking-wider">Step 6: Attached Documents</h4>
                  {documents.length === 0 ? (
                    <p className="text-[#6A5B4D] italic">{t('noChanges')}</p>
                  ) : (
                    <ul className="list-disc list-inside text-xs space-y-1.5 text-blue-600">
                      {documents.map((d, idx) => (
                        <li key={idx} className="hover:underline cursor-pointer">
                          {d.name} ({d.fileUrl})
                        </li>
                      ))}
                    </ul>
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
          
          {step < 7 ? (
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
