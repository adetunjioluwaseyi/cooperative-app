import React, { useState } from 'react';
import { Building2, KeyRound, RotateCcw, ShieldCheck } from 'lucide-react';
import { ADMIN_NAME, ADMIN_PHONE, COOP_BANK_DETAILS, COOP_NAME } from '../../data/seedData';
import { useCooperative } from '../../store/CooperativeContext';
import { Button, Modal } from '../ui/DesignSystem';

export function AdminSettings() {
  const { resetDemoData, signOut } = useCooperative();
  const [confirmReset, setConfirmReset] = useState(false);

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Cooperative Settings</h2>
        <p className="text-[15px] text-slate-600 mt-1">
          Organization details, loan rules, official bank account, and Phone OTP login security policies.
        </p>
      </div>

      {/* Organization & Bank Account */}
      <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-200">
          <Building2 className="w-5 h-5 text-[#15803D]" />
          <h3 className="text-lg font-bold text-slate-900">Organization &amp; Bank Account</h3>
        </div>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-[15px]">
          <div>
            <dt className="text-sm text-slate-500">Cooperative Name</dt>
            <dd className="font-bold text-slate-900 mt-0.5">{COOP_NAME}</dd>
          </div>
          <div>
            <dt className="text-sm text-slate-500">Primary Administrator</dt>
            <dd className="font-bold text-slate-900 mt-0.5">{ADMIN_NAME}</dd>
          </div>
          <div>
            <dt className="text-sm text-slate-500">Official Collection Bank</dt>
            <dd className="font-semibold text-slate-900 mt-0.5">{COOP_BANK_DETAILS.bankName}</dd>
          </div>
          <div>
            <dt className="text-sm text-slate-500">Account Number</dt>
            <dd className="font-mono font-bold text-slate-900 mt-0.5">
              {COOP_BANK_DETAILS.accountNumber}
            </dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-sm text-slate-500">Account Name</dt>
            <dd className="font-semibold text-slate-900 mt-0.5">{COOP_BANK_DETAILS.accountName}</dd>
          </div>
        </dl>
      </section>

      {/* Loan Policy & Phone OTP Security */}
      <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-200">
          <ShieldCheck className="w-5 h-5 text-[#15803D]" />
          <h3 className="text-lg font-bold text-slate-900">Loan Policy &amp; Phone OTP Security</h3>
        </div>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-[15px]">
          <div>
            <dt className="text-sm text-slate-500">Minimum Membership for Loans</dt>
            <dd className="font-bold text-slate-900 mt-0.5">6 Months (Automatically Enforced)</dd>
          </div>
          <div>
            <dt className="text-sm text-slate-500">Required Loan Guarantors</dt>
            <dd className="font-bold text-slate-900 mt-0.5">2 Active Cooperative Members</dd>
          </div>
          <div>
            <dt className="text-sm text-slate-500">Loan Interest Method</dt>
            <dd className="font-bold text-slate-900 mt-0.5">1% Monthly Reducing Balance</dd>
          </div>
          <div>
            <dt className="text-sm text-slate-500">Authentication Method</dt>
            <dd className="font-bold text-[#15803D] mt-0.5">
              Phone Number 6-Digit SMS OTP ({ADMIN_PHONE})
            </dd>
          </div>
        </dl>
      </section>

      {/* Presentation Controls */}
      <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
        <h3 className="text-lg font-bold text-slate-900">Presentation &amp; Demo Controls</h3>
        <p className="text-[15px] text-slate-600">
          Use these options during live product demonstrations to test the Phone OTP login flow or restore the initial cooperative demo figures (₦24,850,000 balance, 8 pending transfers, ₦850,000 pending amount).
        </p>
        <div className="flex flex-wrap items-center gap-3 pt-1">
          <Button
            variant="secondary"
            onClick={signOut}
            icon={<KeyRound className="w-4 h-4" />}
          >
            Test Phone OTP Login Screen
          </Button>
          <Button
            variant="secondary"
            onClick={() => setConfirmReset(true)}
            icon={<RotateCcw className="w-4 h-4" />}
          >
            Reset Demo Data
          </Button>
        </div>
      </section>

      <Modal
        open={confirmReset}
        onClose={() => setConfirmReset(false)}
        title="Reset Cooperative Demo Data?"
      >
        <div className="space-y-5">
          <p className="text-[15px] text-slate-700">
            This will restore all member balances, the 8 pending payment verifications (₦850,000), loan applications, and notifications to their original presentation starting state.
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setConfirmReset(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                resetDemoData();
                setConfirmReset(false);
              }}
            >
              Yes, Reset Demo Data
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
