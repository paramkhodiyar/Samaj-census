'use client';

import React, { useEffect, useState, useTransition } from 'react';
import { getParsedSeedData, confirmAndSeedAction } from '@/app/actions/seed';
import { useRouter } from 'next/navigation';
import { 
  Users, 
  MapPin, 
  Phone, 
  Check, 
  Loader2, 
  Globe, 
  AlertTriangle,
  ArrowLeft,
  Trash2,
  Plus
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { useConfirm } from '@/context/ConfirmContext';

export default function SeedReviewPage() {
  const router = useRouter();
  const [families, setFamilies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const confirm = useConfirm();

  useEffect(() => {
    async function loadData() {
      const result = await getParsedSeedData();
      setLoading(false);
      if (result.error) {
        setError(result.error);
      } else if (result.families) {
        // Default all to selected
        const formatted = result.families.map((f: any) => ({ ...f, selected: true }));
        setFamilies(formatted);
      }
    }
    loadData();
  }, []);

  const updateFamilyField = (index: number, field: string, val: any) => {
    setFamilies(prev => prev.map((f, i) => i === index ? { ...f, [field]: val } : f));
  };

  const updateMemberField = (famIdx: number, memIdx: number, field: string, val: string) => {
    setFamilies(prev => prev.map((f, i) => {
      if (i !== famIdx) return f;
      const updatedMembers = f.members.map((m: any, j: number) => 
        j === memIdx ? { ...m, [field]: val } : m
      );
      return { ...f, members: updatedMembers };
    }));
  };

  const addMember = (famIdx: number) => {
    setFamilies(prev => prev.map((f, i) => {
      if (i !== famIdx) return f;
      return {
        ...f,
        members: [...f.members, { name: '', relation: 'Family Member', mobile: '', occupation: 'Please Update' }]
      };
    }));
  };

  const deleteMember = (famIdx: number, memIdx: number) => {
    setFamilies(prev => prev.map((f, i) => {
      if (i !== famIdx) return f;
      return {
        ...f,
        members: f.members.filter((_: any, j: number) => j !== memIdx)
      };
    }));
  };

  const deleteFamily = async (famIdx: number) => {
    const isConfirmed = await confirm({
      title: 'Remove Family Record',
      message: 'Are you sure you want to remove this entire family from the seed list?',
    });
    if (!isConfirmed) return;
    setFamilies(prev => prev.filter((_, i) => i !== famIdx));
  };

  const toggleAll = (checked: boolean) => {
    setFamilies(prev => prev.map(f => ({ ...f, selected: checked })));
  };

  const selectedCount = families.filter(f => f.selected).length;

  const handleSeed = async () => {
    const selectedFamilies = families.filter(f => f.selected);
    if (selectedFamilies.length === 0) {
      toast.error('Please select at least one family to seed.');
      return;
    }

    const isConfirmed = await confirm({
      title: 'Confirm Seeding',
      message: `Are you sure you want to seed the selected ${selectedFamilies.length} families into the Neon Postgres database?`,
    });

    if (!isConfirmed) return;

    startTransition(async () => {
      const result = await confirmAndSeedAction(selectedFamilies);
      if (result.error) {
        toast.error(result.error);
      } else if (result.success) {
        toast.success(`Successfully seeded ${result.count} families to the database!`);
        router.push('/dashboard');
      }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-[#8B5E3C] animate-spin" />
        <p className="text-sm font-semibold text-[#6A5B4D]">Parsing spreadsheet records...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-lg border border-red-200 shadow-sm text-center space-y-4">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto" />
          <h2 className="text-lg font-bold text-red-600">Failed to Parse Data</h2>
          <p className="text-sm text-[#6A5B4D]">{error}</p>
          <div className="flex flex-col gap-2 pt-2 border-t border-[#FAF7F2]">
            <p className="text-xs text-gray-500">
              Note: Make sure your new Google Sheets link is shared publicly. Click <strong>Share</strong> in Sheets and set General Access to <strong>"Anyone with the link can view"</strong>, then re-paste the link.
            </p>
            <Link href="/dashboard" className="inline-block mt-2 px-4 py-2 bg-[#8B5E3C] text-white rounded text-xs font-semibold">
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2] py-12 px-4 sm:px-6 lg:px-8 text-[#2D2D2D] selection:bg-[#D4A373] selection:text-white">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header Banner */}
        <div className="bg-white p-6 rounded-lg border border-[#E5DDD0] shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#8B5E3C] uppercase tracking-wider">
              <Link href="/dashboard" className="hover:underline flex items-center gap-1">
                <ArrowLeft className="w-3.5 h-3.5" />
                Dashboard
              </Link>
              <span>/</span>
              <span>Staging Verification Panel</span>
            </div>
            <h1 className="text-xl font-serif font-bold text-[#8B5E3C] mt-2 md:text-2xl">
              Spreadsheet Seeding Review
            </h1>
            <p className="text-xs text-[#6A5B4D] mt-1">
              Select specific families, inline edit relations, and confirm to seed to Neon Postgres.
            </p>
          </div>

          <button
            onClick={handleSeed}
            disabled={isPending || selectedCount === 0}
            className="w-full sm:w-auto px-6 py-3 bg-[#8B5E3C] hover:bg-[#704A2E] text-white text-xs font-semibold rounded shadow flex items-center justify-center gap-2 disabled:bg-gray-400 cursor-pointer"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                Seeding Records...
              </>
            ) : (
              <>
                <Check className="w-4 h-4 text-white" />
                Confirm & Seed Database ({selectedCount} of {families.length} Selected)
              </>
            )}
          </button>
        </div>

        {/* Action controls */}
        <div className="bg-white p-4 rounded-lg border border-[#E5DDD0] shadow-sm flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#6A5B4D]">
            <input 
              type="checkbox"
              id="select-all-toggle"
              checked={families.length > 0 && selectedCount === families.length}
              onChange={(e) => toggleAll(e.target.checked)}
              className="w-4 h-4 text-[#8B5E3C] border-[#E5DDD0] rounded focus:ring-[#8B5E3C] cursor-pointer"
            />
            <label htmlFor="select-all-toggle" className="cursor-pointer">
              Select All {families.length} Families
            </label>
          </div>

          <div className="text-xs text-[#6A5B4D]">
            Selected for Seeding: <span className="font-bold text-[#8B5E3C]">{selectedCount}</span>
          </div>
        </div>

        {/* Families List */}
        <div className="space-y-6">
          <div className="space-y-6">
            {families.map((fam, idx) => (
              <div 
                key={fam.familyId} 
                className={`bg-white rounded-lg border shadow-sm overflow-hidden transition-all ${
                  fam.selected ? 'border-[#E5DDD0]' : 'border-dashed border-gray-200 opacity-60'
                }`}
              >
                {/* Family Header */}
                <div className="p-4 bg-[#FAF7F2] border-b border-[#E5DDD0] flex flex-col gap-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <input 
                        type="checkbox"
                        checked={fam.selected}
                        onChange={(e) => updateFamilyField(idx, 'selected', e.target.checked)}
                        className="w-4 h-4 text-[#8B5E3C] border-[#E5DDD0] rounded focus:ring-[#8B5E3C] cursor-pointer"
                      />
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white border border-[#E5DDD0] text-[#8B5E3C]">
                        {fam.familyId}
                      </span>
                      <span className="text-xs text-gray-500 font-medium">NRI Staging Card</span>
                    </div>
                    <button
                      onClick={() => deleteFamily(idx)}
                      className="p-1 text-red-500 hover:bg-red-50 rounded border border-transparent hover:border-red-200 transition-colors"
                      title="Remove Family"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 text-xs">
                    <div>
                      <label className="block text-[10px] font-bold text-[#6A5B4D] uppercase tracking-wider mb-1">Head Name</label>
                      <input 
                        type="text" 
                        value={fam.headName}
                        onChange={(e) => updateFamilyField(idx, 'headName', e.target.value)}
                        className="w-full p-2 border border-[#E5DDD0] bg-white rounded font-semibold text-sm"
                        disabled={!fam.selected}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[#6A5B4D] uppercase tracking-wider mb-1">Mobile</label>
                      <input 
                        type="text" 
                        value={fam.mobile}
                        onChange={(e) => updateFamilyField(idx, 'mobile', e.target.value)}
                        className="w-full p-2 border border-[#E5DDD0] bg-white rounded"
                        disabled={!fam.selected}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[#6A5B4D] uppercase tracking-wider mb-1">Country</label>
                      <input 
                        type="text" 
                        value={fam.country}
                        onChange={(e) => updateFamilyField(idx, 'country', e.target.value)}
                        className="w-full p-2 border border-[#E5DDD0] bg-white rounded"
                        disabled={!fam.selected}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[#6A5B4D] uppercase tracking-wider mb-1">City</label>
                      <input 
                        type="text" 
                        value={fam.city}
                        onChange={(e) => updateFamilyField(idx, 'city', e.target.value)}
                        className="w-full p-2 border border-[#E5DDD0] bg-white rounded"
                        disabled={!fam.selected}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[#6A5B4D] uppercase tracking-wider mb-1">Kutch Village</label>
                      <input 
                        type="text" 
                        value={fam.kutchVillage}
                        onChange={(e) => updateFamilyField(idx, 'kutchVillage', e.target.value)}
                        className="w-full p-2 border border-[#E5DDD0] bg-white rounded"
                        disabled={!fam.selected}
                      />
                    </div>
                  </div>
                </div>

                {/* Members List */}
                {fam.selected && (
                  <div className="p-4 space-y-3">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-[#E5DDD0] text-left text-xs">
                        <thead className="text-[#6A5B4D] font-bold uppercase tracking-wider">
                          <tr>
                            <th className="py-2 pr-4 w-1/3">Member Name</th>
                            <th className="py-2 px-4 w-1/4">Relation</th>
                            <th className="py-2 px-4 w-1/4">Mobile</th>
                            <th className="py-2 px-4 w-1/4">Occupation</th>
                            <th className="py-2 pl-4 w-10 text-right">Delete</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#FAF7F2] text-[#2D2D2D]">
                          {fam.members.map((mem: any, mIdx: number) => (
                            <tr key={mIdx}>
                              <td className="py-1.5 pr-4">
                                <input 
                                  type="text"
                                  value={mem.name}
                                  onChange={(e) => updateMemberField(idx, mIdx, 'name', e.target.value)}
                                  className="w-full p-1 border border-[#E5DDD0] rounded text-xs bg-[#FAF7F2]/30 focus:bg-white"
                                  placeholder="Member Full Name"
                                />
                              </td>
                              <td className="py-1.5 px-4">
                                <input 
                                  type="text"
                                  value={mem.relation}
                                  onChange={(e) => updateMemberField(idx, mIdx, 'relation', e.target.value)}
                                  className="w-full p-1 border border-[#E5DDD0] rounded text-xs font-semibold text-amber-800 bg-[#FAF7F2]/30 focus:bg-white"
                                  placeholder="Head, Spouse, Child, etc."
                                />
                              </td>
                              <td className="py-1.5 px-4">
                                <input 
                                  type="text"
                                  value={mem.mobile || ''}
                                  onChange={(e) => updateMemberField(idx, mIdx, 'mobile', e.target.value)}
                                  className="w-full p-1 border border-[#E5DDD0] rounded text-xs text-gray-500 bg-[#FAF7F2]/30 focus:bg-white"
                                  placeholder="e.g. 254736900101"
                                />
                              </td>
                              <td className="py-1.5 px-4">
                                <input 
                                  type="text"
                                  value={mem.occupation}
                                  onChange={(e) => updateMemberField(idx, mIdx, 'occupation', e.target.value)}
                                  className="w-full p-1 border border-[#E5DDD0] rounded text-xs text-gray-600 bg-[#FAF7F2]/30 focus:bg-white"
                                  placeholder="IT, Business, etc."
                                />
                              </td>
                              <td className="py-1.5 pl-4 text-right">
                                <button
                                  type="button"
                                  onClick={() => deleteMember(idx, mIdx)}
                                  className="p-1 text-red-500 hover:bg-red-50 border border-transparent hover:border-red-200 rounded"
                                  title="Remove Member"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Add Member */}
                    <div className="pt-2 border-t border-[#FAF7F2] flex justify-end">
                      <button
                        type="button"
                        onClick={() => addMember(idx)}
                        className="px-3.5 py-1.5 border border-[#8B5E3C] hover:bg-[#FAF7F2] text-[#8B5E3C] font-semibold text-[11px] rounded flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add Relative Row
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
