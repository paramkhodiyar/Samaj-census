'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

type ConfirmOptions = {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
};

type ConfirmContextType = (options: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmContextType | null>(null);

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [dialogState, setDialogState] = useState<{
    options: ConfirmOptions;
    resolve: (value: boolean) => void;
  } | null>(null);

  const confirm = useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      setDialogState({
        options,
        resolve,
      });
    });
  }, []);

  const handleClose = (value: boolean) => {
    if (dialogState) {
      dialogState.resolve(value);
      setDialogState(null);
    }
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      
      {dialogState && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-lg border border-[#E5DDD0] shadow-xl max-w-sm w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200 text-center">
            <h3 className="text-lg font-serif font-bold text-[#8B5E3C]">
              {dialogState.options.title}
            </h3>
            <p className="text-xs text-[#6A5B4D] leading-relaxed">
              {dialogState.options.message}
            </p>
            
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => handleClose(false)}
                className="flex-1 py-2 border border-[#E5DDD0] hover:bg-[#FAF7F2] text-[#6A5B4D] font-semibold text-xs rounded transition-all cursor-pointer focus:outline-none"
              >
                {dialogState.options.cancelLabel || 'Cancel'}
              </button>
              <button
                type="button"
                onClick={() => handleClose(true)}
                className="flex-1 py-2 bg-[#8B5E3C] hover:bg-[#704A2E] text-white font-semibold text-xs rounded transition-all shadow-sm cursor-pointer focus:outline-none"
              >
                {dialogState.options.confirmLabel || 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error('useConfirm must be used within a ConfirmProvider');
  }
  return context;
}
