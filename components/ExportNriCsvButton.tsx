'use client';

import React, { useState } from 'react';
import { FileSpreadsheet } from 'lucide-react';
import { exportNriFamiliesAction } from '@/app/actions/auth';

export default function ExportNriCsvButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [filename, setFilename] = useState('nri-families-export');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleExport = async () => {
    setIsProcessing(true);
    try {
      const csvContent = await exportNriFamiliesAction();
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${filename.trim() || 'nri-families'}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setIsOpen(false);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-[#8B5E3C] text-white hover:bg-[#704A2E] text-xs font-semibold rounded shadow flex items-center gap-1.5 transition-colors border border-[#8B5E3C]"
      >
        <FileSpreadsheet className="w-4 h-4" />
        Export NRI Families (CSV)
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-[#2D2D2D]/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#FAF7F2] border border-[#E5DDD0] rounded-lg shadow-xl max-w-sm w-full overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-5 space-y-4">
              <div>
                <h3 className="text-sm font-serif font-bold text-[#8B5E3C] uppercase tracking-wider">
                  Export Families
                </h3>
                <p className="text-xs text-[#6A5B4D] mt-1">
                  Specify the filename for your NRI Census CSV export.
                </p>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#6A5B4D] uppercase tracking-wider mb-1">
                  File Name
                </label>
                <div className="flex items-center bg-white border border-[#E5DDD0] rounded px-3 py-1.5">
                  <input
                    type="text"
                    value={filename}
                    onChange={(e) => setFilename(e.target.value)}
                    placeholder="Enter filename..."
                    className="w-full bg-transparent text-xs focus:outline-none text-[#2D2D2D]"
                    autoFocus
                  />
                  <span className="text-xs text-[#B08968] font-semibold select-none">.csv</span>
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  onClick={() => setIsOpen(false)}
                  disabled={isProcessing}
                  className="px-3.5 py-2 border border-[#D4A373] text-[#8B5E3C] hover:bg-[#D4A373]/10 rounded font-semibold text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleExport}
                  disabled={isProcessing}
                  className="px-4 py-2 bg-[#8B5E3C] text-white hover:bg-[#704A2E] rounded font-semibold text-xs shadow-sm transition-colors"
                >
                  {isProcessing ? 'Exporting...' : 'Download CSV'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
