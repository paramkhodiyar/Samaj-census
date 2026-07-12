'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldAlert } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#2D2D2D] font-sans selection:bg-[#D4A373] selection:text-[#FAF7F2] py-12 px-6">
      <div className="max-w-3xl mx-auto bg-white p-8 md:p-12 rounded-lg border border-[#E5DDD0] shadow-sm space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#FAF7F2] pb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#FAF7F2] border border-[#E5DDD0] flex items-center justify-center text-[#8B5E3C]">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-serif font-bold text-[#8B5E3C] md:text-2xl">
                Privacy Policy
              </h1>
              <p className="text-xs text-[#6A5B4D] mt-0.5">
                Last Updated: 12 July 2026 • DPDP Act 2023 Compliant
              </p>
            </div>
          </div>
          <Link href="/login" className="flex items-center gap-1 text-[#8B5E3C] hover:underline font-semibold text-xs">
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Sign In
          </Link>
        </div>

        {/* Content */}
        <div className="space-y-6 text-sm text-[#2D2D2D] leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#8B5E3C]">
              1. Introduction
            </h2>
            <p>
              The KGK Samaj Census Portal ("Samaj Portal") is dedicated to maintaining the privacy and security of our community census records. This Privacy Policy details our data collection, processing, retention, and erasure protocols in strict compliance with the **Digital Personal Data Protection (DPDP) Act, 2023** (India).
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#8B5E3C]">
              2. Data We Collect & Process
            </h2>
            <p>
              We process personal information purely for the purposes of community census enumeration, regional administration, and member communications. This includes:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Full Name, Age, Gender, and Blood Group of family members.</li>
              <li>Registered Mobile Number (WhatsApp-enabled) and Email Address.</li>
              <li>NRI Residence Details (Country, City) and India Native Connection (Kutch native village).</li>
              <li>Academic Education records and Occupation details.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#8B5E3C]">
              3. Purpose Limitation & Consent
            </h2>
            <p>
              Your data is collected solely on the basis of explicit consent provided during user registration or family enrollment. We do not sell, rent, or trade personal data to third-party commercial entities. Data access is restricted to verified administrators (Ghatak, Pradeshik, and NRI Admins) based strictly on their jurisdiction.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#8B5E3C]">
              4. Data Retention & Automatic Erasure
            </h2>
            <p>
              We adhere to strict data minimization. Active census profiles are stored as long as the family head maintains an active account. If you request account deactivation, your census files will be soft-deleted and permanently cleaned up following review. Temporary authentication tokens, unused OTP codes, and rejected join requests are automatically purged every 24 hours.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#8B5E3C]">
              5. Your Rights Under DPDP Act 2023
            </h2>
            <p>
              As a Data Principal, you possess the following statutory rights which you can exercise directly from your Account Dashboard:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong>Right to Access:</strong> View all family census details on your profile page at any time.</li>
              <li><strong>Right to Portability:</strong> Download a digital copy of your entire family data in structured JSON format.</li>
              <li><strong>Right to Correction & Update:</strong> Submit update requests to your local Ghatak Admin for verification.</li>
              <li><strong>Right to Erasure (Deactivation):</strong> Request complete account deactivation & census record erasure.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#8B5E3C]">
              6. Grievance Redressal
            </h2>
            <p>
              If you have any questions, feedback, or concerns regarding your privacy or wish to lodge a complaint, please contact our appointed Grievance Officer immediately.
            </p>
            <p className="font-semibold text-xs text-[#8B5E3C] mt-2">
              For Grievance Officer details, please visit our <Link href="/grievance" className="underline hover:text-[#704A2E]">Grievance Redressal Page</Link>.
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="pt-6 border-t border-[#FAF7F2] text-center text-xs text-[#6A5B4D]">
          KGK Samaj Census Portal • Committed to Community Privacy
        </div>
      </div>
    </div>
  );
}
