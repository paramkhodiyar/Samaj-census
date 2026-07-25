'use client';

import React, { useState } from 'react';
import CreateFamilyModal from '@/components/CreateFamilyModal';
import { Home, Sparkles, PlusCircle } from 'lucide-react';

export default function UnlinkedFamilyClient({ userEmail }: { userEmail?: string | null }) {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="bg-white p-8 md:p-12 rounded-xl border border-[#E5DDD0] shadow-md text-center max-w-xl mx-auto space-y-6">
      <div className="w-16 h-16 rounded-full bg-[#FAF7F2] border border-[#D4A373] flex items-center justify-center mx-auto text-[#8B5E3C]">
        <Home className="w-8 h-8" />
      </div>

      <div className="space-y-2">
        <h2 className="text-xl md:text-2xl font-serif font-bold text-[#8B5E3C]">
          Welcome to Shri K.G.K. Samaj Census Portal!
        </h2>
        <p className="text-xs md:text-sm text-[#6A5B4D] leading-relaxed">
          Your Family Head online account is active. Since your family profile is not yet in our database, click below to register and create your family census profile.
        </p>
      </div>

      <div className="pt-2">
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="px-6 py-3 bg-[#8B5E3C] hover:bg-[#704A2E] text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-2 mx-auto cursor-pointer transition-colors"
        >
          <PlusCircle className="w-5 h-5" />
          Create / Register My Family Census Record
        </button>
      </div>

      {showModal && (
        <CreateFamilyModal
          userEmail={userEmail}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
