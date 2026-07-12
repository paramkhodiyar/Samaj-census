'use client';

import React, { useState } from 'react';
import { exportFamilyDataAction, requestDeactivationAction } from '@/app/actions/requests';
import { useConfirm } from '@/context/ConfirmContext';
import { Download, Trash2, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

export default function DpdpProfileActions() {
  const [isExporting, setIsExporting] = useState(false);
  const [isDeactivating, setIsDeactivating] = useState(false);
  const confirm = useConfirm();

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const result = await exportFamilyDataAction();
      if (result.error) {
        toast.error(result.error);
      } else if (result.success && result.data) {
        const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(result.data, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute('href', dataStr);
        downloadAnchor.setAttribute('download', `family_${result.data.familyId}_data.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
        toast.success('Your family census data has been downloaded.');
      }
    } catch (err) {
      toast.error('Failed to export data.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeactivate = async () => {
    const isConfirmed = await confirm({
      title: 'Request Account Deactivation',
      message: 'Are you sure you want to request account deactivation & census data erasure under DPDP Act 2023? This will create a pending deactivation ticket for Super Admin review and soft-delete your census records.',
    });

    if (!isConfirmed) return;

    setIsDeactivating(true);
    try {
      const result = await requestDeactivationAction();
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('Your deactivation request has been successfully submitted to the Admin committee.');
      }
    } catch (err) {
      toast.error('Failed to submit request.');
    } finally {
      setIsDeactivating(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg border border-[#E5DDD0] shadow-sm space-y-4">
      <h3 className="text-xs font-bold text-[#6A5B4D] uppercase tracking-wider border-b border-[#FAF7F2] pb-2 flex items-center gap-2">
        <ShieldCheck className="w-4 h-4 text-[#8B5E3C]" />
        Privacy & DPDP Compliance
      </h3>

      <div className="space-y-3 text-xs">
        <p className="text-[#6A5B4D] leading-relaxed">
          Under the Digital Personal Data Protection (DPDP) Act 2023, you have the right to access, download, and request deactivation/erasure of your personal data.
        </p>

        <div className="grid grid-cols-1 gap-2 pt-2">
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="w-full py-2 bg-[#FAF7F2] border border-[#E5DDD0] hover:bg-[#E5DDD0]/50 text-[#8B5E3C] font-semibold rounded text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            {isExporting ? 'Exporting...' : 'Download My Family Data (JSON)'}
          </button>

          <button
            onClick={handleDeactivate}
            disabled={isDeactivating}
            className="w-full py-2 border border-red-200 hover:bg-red-50 text-red-600 font-semibold rounded text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
            {isDeactivating ? 'Submitting...' : 'Request Account Deactivation'}
          </button>
        </div>
      </div>
    </div>
  );
}
