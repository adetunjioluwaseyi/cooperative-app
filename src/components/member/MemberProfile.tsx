import React from 'react';
import { Lock, ShieldCheck } from 'lucide-react';
import { formatMembershipDuration, formatShortDate } from '../../data/seedData';
import { useCooperative } from '../../store/CooperativeContext';
import { MemberAvatar, StatusBadge } from '../ui/DesignSystem';

export function MemberProfile() {
  const { currentMember } = useCooperative();
  if (!currentMember) return null;

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">My Profile</h2>
        <p className="text-[15px] text-slate-600 mt-1">
          Your verified cooperative membership and Phone OTP login details. Financial balances are kept separate under My Savings and My Loan.
        </p>
      </div>

      {/* Primary Profile Card (Section 40) */}
      <section className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div className="flex items-center gap-4">
            <MemberAvatar name={currentMember.fullName} size="lg" />
            <div>
              <h3 className="text-2xl font-bold text-slate-900">{currentMember.fullName}</h3>
              <p className="text-base font-mono text-slate-600 mt-0.5">{currentMember.id}</p>
            </div>
          </div>
          <StatusBadge status={currentMember.status} />
        </div>

        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-[15px]">
          <div>
            <dt className="text-sm font-semibold text-slate-500">Full Name</dt>
            <dd className="font-bold text-slate-900 mt-1">{currentMember.fullName}</dd>
          </div>
          <div>
            <dt className="text-sm font-semibold text-slate-500">Member ID</dt>
            <dd className="font-mono font-bold text-slate-900 mt-1">{currentMember.id}</dd>
          </div>
          <div>
            <dt className="text-sm font-semibold text-slate-500">Phone Number (OTP Login)</dt>
            <dd className="font-mono font-bold text-slate-900 mt-1 flex items-center gap-2">
              <span>{currentMember.phoneNumber}</span>
              <span className="inline-flex items-center gap-1 text-xs font-sans font-semibold text-[#15803D]">
                <ShieldCheck className="w-4 h-4" />
                Verified
              </span>
            </dd>
          </div>
          <div>
            <dt className="text-sm font-semibold text-slate-500">Email Address</dt>
            <dd className="font-semibold text-slate-900 mt-1">{currentMember.email}</dd>
          </div>
          <div>
            <dt className="text-sm font-semibold text-slate-500">Membership Date</dt>
            <dd className="font-semibold text-slate-900 mt-1">
              {formatShortDate(currentMember.membershipDate)}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-semibold text-slate-500">Membership Duration</dt>
            <dd className="font-semibold text-slate-900 mt-1">
              {formatMembershipDuration(currentMember.membershipDate)}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-semibold text-slate-500">Account Status</dt>
            <dd className="mt-1">
              <StatusBadge status={currentMember.status} />
            </dd>
          </div>
          <div>
            <dt className="text-sm font-semibold text-slate-500">Department &amp; Unit</dt>
            <dd className="font-semibold text-slate-900 mt-1">
              {currentMember.department} · {currentMember.unit}
            </dd>
          </div>
        </dl>
      </section>

      {/* Read-Only Registration Details Notice */}
      <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
        <div className="flex items-center gap-2.5 text-sm font-bold text-slate-800 pb-3 border-b border-slate-200">
          <Lock className="w-4 h-4 text-[#15803D]" />
          <span>Verified Cooperative Registration Records (Read Only)</span>
        </div>

        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-[15px]">
          <div>
            <dt className="text-sm text-slate-500">Residential Address</dt>
            <dd className="font-medium text-slate-900 mt-0.5">{currentMember.residentialAddress}</dd>
          </div>
          <div>
            <dt className="text-sm text-slate-500">Identification</dt>
            <dd className="font-medium text-slate-900 mt-0.5">
              {currentMember.idType} · <span className="font-mono">{currentMember.idNumber}</span>
            </dd>
          </div>
          <div>
            <dt className="text-sm text-slate-500">Next of Kin</dt>
            <dd className="font-medium text-slate-900 mt-0.5">
              {currentMember.nextOfKin.fullName} ({currentMember.nextOfKin.relationship})
            </dd>
          </div>
          <div>
            <dt className="text-sm text-slate-500">Next of Kin Phone</dt>
            <dd className="font-mono font-medium text-slate-900 mt-0.5">
              {currentMember.nextOfKin.phoneNumber}
            </dd>
          </div>
        </dl>

        <p className="text-sm text-slate-600 pt-2 border-t border-slate-100">
          To update your phone number, address, or next of kin, please visit or contact the Unity Cooperative administrative office.
        </p>
      </section>
    </div>
  );
}
