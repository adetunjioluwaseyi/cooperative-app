import React, { useMemo, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  FilePlus2,
  ShieldCheck,
  UserPlus,
  X,
} from 'lucide-react';
import {
  formatMembershipDuration,
  formatNaira,
  formatShortDate,
  getMembershipMonths,
} from '../../data/seedData';
import { useCooperative } from '../../store/CooperativeContext';
import {
  Button,
  MemberAvatar,
  SearchInput,
  StatusBadge,
} from '../ui/DesignSystem';

export function MemberApplyLoan() {
  const {
    currentMember,
    members,
    loanApplications,
    submitLoanApplication,
  } = useCooperative();

  const [amount, setAmount] = useState('200000');
  const [purpose, setPurpose] = useState('');
  const [periodMonths, setPeriodMonths] = useState('10');
  const [guarantorSearch, setGuarantorSearch] = useState('');
  const [guarantor1Id, setGuarantor1Id] = useState<string | null>(null);
  const [guarantor2Id, setGuarantor2Id] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [submittedAppId, setSubmittedAppId] = useState<string | null>(null);

  const eligibleGuarantors = useMemo(() => {
    if (!currentMember) return [];
    const q = guarantorSearch.trim().toLowerCase();
    return members.filter((m) => {
      if (m.id === currentMember.id) return false;
      if (m.status !== 'Active') return false;
      if (q && !m.fullName.toLowerCase().includes(q) && !m.id.toLowerCase().includes(q)) {
        return false;
      }
      return true;
    });
  }, [members, currentMember, guarantorSearch]);

  if (!currentMember) return null;

  const months = getMembershipMonths(currentMember.membershipDate);
  const isEligible = months >= 6;
  const remainingMonths = Math.max(0, 6 - months);

  const guarantor1 = members.find((m) => m.id === guarantor1Id) ?? null;
  const guarantor2 = members.find((m) => m.id === guarantor2Id) ?? null;

  const myApplications = loanApplications.filter((a) => a.applicantId === currentMember.id);

  const numericAmount = Number(amount) || 0;
  const numericMonths = Number(periodMonths) || 10;
  const estFirstPrincipal = numericAmount > 0 ? Math.round(numericAmount / numericMonths) : 0;
  const estFirstInterest = numericAmount > 0 ? Math.round(numericAmount * 0.01) : 0;

  const handleSelectGuarantor = (memberId: string) => {
    setError('');
    if (guarantor1Id === memberId || guarantor2Id === memberId) return;
    if (!guarantor1Id) {
      setGuarantor1Id(memberId);
    } else if (!guarantor2Id) {
      setGuarantor2Id(memberId);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!isEligible) return;

    if (numericAmount < 20000) {
      setError('Please enter a loan amount of at least ₦20,000.');
      return;
    }
    if (!purpose.trim()) {
      setError('Please state the purpose of your loan.');
      return;
    }
    if (!guarantor1Id || !guarantor2Id) {
      setError('You must select exactly two cooperative members as Guarantor 1 and Guarantor 2.');
      return;
    }

    const created = submitLoanApplication({
      applicantId: currentMember.id,
      amount: numericAmount,
      purpose: purpose.trim(),
      repaymentPeriodMonths: numericMonths,
      guarantor1Id,
      guarantor2Id,
    });

    setSubmittedAppId(created.id);
    setPurpose('');
    setGuarantor1Id(null);
    setGuarantor2Id(null);
    setGuarantorSearch('');
  };

  return (
    <div className="space-y-7 max-w-4xl">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Apply for Loan</h2>
        <p className="text-[15px] text-slate-600 mt-1">
          Submit a loan request and choose two cooperative members to guarantee your application.
        </p>
      </div>

      {/* AUTOMATIC 6-MONTH ELIGIBILITY CHECK (Section 16) */}
      {isEligible ? (
        <div className="rounded-xl bg-[#ECFDF5] border-2 border-[#BBF7D0] p-5 flex items-start gap-3.5">
          <CheckCircle2 className="w-6 h-6 text-[#15803D] shrink-0 mt-0.5" />
          <div>
            <h3 className="text-lg font-bold text-[#14532D]">
              You are eligible to apply for a loan.
            </h3>
            <p className="text-[15px] text-[#166534] mt-0.5">
              Membership started {formatShortDate(currentMember.membershipDate)} ({formatMembershipDuration(currentMember.membershipDate)}). You meet the 6-month cooperative membership requirement.
            </p>
          </div>
        </div>
      ) : (
        <div className="rounded-xl bg-[#FFFBEB] border-2 border-[#FDE68A] p-6 space-y-4">
          <div className="flex items-start gap-3.5">
            <Clock className="w-7 h-7 text-[#D97706] shrink-0 mt-0.5" />
            <div>
              <h3 className="text-xl font-bold text-slate-900">
                You are not yet eligible for a loan.
              </h3>
              <p className="text-base font-medium text-[#92400E] mt-1">
                Loan eligibility begins after 6 months of membership.
              </p>
              <p className="text-[15px] text-slate-700 mt-2">
                You joined on <strong>{formatShortDate(currentMember.membershipDate)}</strong> ({formatMembershipDuration(currentMember.membershipDate)} completed). You have approximately{' '}
                <strong>{remainingMonths} {remainingMonths === 1 ? 'month' : 'months'}</strong> remaining before you can apply for a cooperative loan.
              </p>
            </div>
          </div>

          <div className="space-y-1.5 pt-2">
            <div className="flex justify-between text-sm font-semibold text-slate-700">
              <span>Membership Duration Progress</span>
              <span className="font-mono">{months} / 6 Months</span>
            </div>
            <div className="h-3 w-full bg-amber-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#D97706] rounded-full"
                style={{ width: `${Math.min(100, Math.round((months / 6) * 100))}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Submission Success Banner */}
      {submittedAppId && (
        <div className="rounded-xl bg-[#ECFDF5] border border-[#BBF7D0] p-6 space-y-3">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-6 h-6 text-[#15803D] shrink-0 mt-0.5" />
            <div>
              <h3 className="text-lg font-bold text-[#14532D]">
                Loan Application Submitted ({submittedAppId})
              </h3>
              <p className="text-[15px] text-[#166534] mt-1">
                Both selected guarantors have been notified. As soon as both guarantors approve your request, your application will automatically move to the Cooperative Administrator for approval and disbursement.
              </p>
              <p className="text-sm text-[#14532D] font-semibold mt-2">
                Presentation Tip: Use the top-right Portal Switcher to open Guarantor 1 and Guarantor 2’s dashboards to approve this loan live!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* LOAN APPLICATION FORM (Section 17) */}
      <form
        onSubmit={handleSubmit}
        className={`bg-white border border-slate-200 rounded-xl p-6 sm:p-8 space-y-6 ${
          !isEligible ? 'opacity-60 pointer-events-none select-none' : ''
        }`}
      >
        <h3 className="text-xl font-bold text-slate-900 pb-3 border-b border-slate-200">
          Loan Application Form
        </h3>

        {error && (
          <div className="p-4 rounded-lg bg-[#FEF2F2] border border-[#FECACA] text-[#991B1B] text-[15px] font-medium flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label htmlFor="loan-amount" className="block text-sm font-semibold text-slate-800 mb-1.5">
              Loan Amount (₦) *
            </label>
            <input
              id="loan-amount"
              type="number"
              min={20000}
              step={10000}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={!isEligible}
              className="w-full min-h-[48px] px-4 rounded-lg border border-slate-300 text-xl font-mono font-bold tabular-nums text-slate-900"
            />
          </div>

          <div>
            <label htmlFor="loan-period" className="block text-sm font-semibold text-slate-800 mb-1.5">
              Preferred Repayment Period *
            </label>
            <select
              id="loan-period"
              value={periodMonths}
              onChange={(e) => setPeriodMonths(e.target.value)}
              disabled={!isEligible}
              className="w-full min-h-[48px] px-4 rounded-lg border border-slate-300 bg-white text-[15px] font-semibold text-slate-900"
            >
              <option value="3">3 Months</option>
              <option value="6">6 Months</option>
              <option value="10">10 Months</option>
              <option value="12">12 Months</option>
              <option value="18">18 Months</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="loan-purpose" className="block text-sm font-semibold text-slate-800 mb-1.5">
              Purpose of Loan *
            </label>
            <input
              id="loan-purpose"
              type="text"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              disabled={!isEligible}
              placeholder="e.g. Children school fees, house rent, medical support, or home solar power"
              className="w-full min-h-[48px] px-4 rounded-lg border border-slate-300 text-[15px] text-slate-900"
            />
          </div>
        </div>

        {/* Simple Repayment Preview */}
        {numericAmount >= 20000 && (
          <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 flex flex-wrap items-center justify-between gap-4 text-sm">
            <div>
              <p className="font-bold text-slate-900">Estimated First Month Payment (Reducing Balance)</p>
              <p className="text-slate-600 mt-0.5">
                Principal {formatNaira(estFirstPrincipal)} + Interest {formatNaira(estFirstInterest)} (1% reducing monthly)
              </p>
            </div>
            <p className="text-xl font-extrabold font-mono tabular-nums text-[#15803D]">
              {formatNaira(estFirstPrincipal + estFirstInterest)} / mo
            </p>
          </div>
        )}

        {/* GUARANTOR SELECTION (Section 17) */}
        <div className="space-y-4 pt-3 border-t border-slate-200">
          <div>
            <h4 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#15803D]" />
              Select Two Cooperative Guarantors
            </h4>
            <p className="text-sm text-slate-600 mt-0.5">
              Both guarantors must be active cooperative members and must approve your request before it moves to the administrator.
            </p>
          </div>

          {/* Selected Guarantor 1 & Guarantor 2 Slots */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: 'Guarantor 1', member: guarantor1, onClear: () => setGuarantor1Id(null) },
              { label: 'Guarantor 2', member: guarantor2, onClear: () => setGuarantor2Id(null) },
            ].map(({ label, member, onClear }) => (
              <div
                key={label}
                className={`p-4 rounded-xl border-2 ${
                  member
                    ? 'bg-[#ECFDF5] border-[#BBF7D0]'
                    : 'bg-slate-50 border-dashed border-slate-300'
                }`}
              >
                <p className="text-xs font-bold text-slate-600 mb-2">{label}</p>
                {member ? (
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <MemberAvatar name={member.fullName} size="sm" />
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 truncate">{member.fullName}</p>
                        <p className="text-xs font-mono text-slate-600">{member.id} · Active</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={onClear}
                      className="min-h-[36px] px-2.5 rounded-lg border border-slate-300 bg-white hover:bg-red-50 hover:text-[#B91C1C] text-xs font-semibold inline-flex items-center gap-1 cursor-pointer shrink-0"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Replace</span>
                    </button>
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 py-1.5">
                    Select a member from the list below
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Prominent Search Cooperative Member Field */}
          <SearchInput
            label="Search Cooperative Member"
            placeholder="Search Cooperative Member by name or Member ID..."
            value={guarantorSearch}
            onChange={setGuarantorSearch}
          />

          <div className="border border-slate-200 rounded-xl divide-y divide-slate-200 max-h-64 overflow-y-auto bg-white">
            {eligibleGuarantors.length === 0 ? (
              <p className="p-5 text-sm text-slate-600 text-center">
                No active cooperative members match your search.
              </p>
            ) : (
              eligibleGuarantors.map((m) => {
                const isSelected = m.id === guarantor1Id || m.id === guarantor2Id;
                const slotsFull = Boolean(guarantor1Id && guarantor2Id);
                return (
                  <div
                    key={m.id}
                    className="p-3.5 px-4 flex flex-wrap items-center justify-between gap-3 hover:bg-slate-50"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <MemberAvatar name={m.fullName} size="sm" />
                      <div className="min-w-0">
                        <p className="text-[15px] font-bold text-slate-900 truncate">{m.fullName}</p>
                        <p className="text-xs font-mono text-slate-500">
                          {m.id} · {m.department}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <StatusBadge status={m.status} />
                      <Button
                        type="button"
                        size="sm"
                        variant={isSelected ? 'soft-green' : 'secondary'}
                        disabled={isSelected || slotsFull}
                        onClick={() => handleSelectGuarantor(m.id)}
                        icon={isSelected ? <CheckCircle2 className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                      >
                        {isSelected ? 'Selected' : 'Select'}
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <Button
            type="submit"
            size="lg"
            disabled={!isEligible || !guarantor1Id || !guarantor2Id}
            icon={<FilePlus2 className="w-5 h-5" />}
          >
            Submit Loan Application
          </Button>
        </div>
      </form>

      {/* My Submitted Applications Tracker */}
      {myApplications.length > 0 && (
        <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
          <h3 className="text-lg font-bold text-slate-900">My Loan Applications</h3>
          <div className="divide-y divide-slate-200">
            {myApplications.map((app) => (
              <div key={app.id} className="py-4 space-y-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-base font-bold text-slate-900">
                      {formatNaira(app.amount)} · {app.purpose}
                    </p>
                    <p className="text-sm text-slate-600 mt-0.5">
                      {app.id} · {app.repaymentPeriodMonths} Months · Submitted {formatShortDate(app.dateSubmitted)}
                    </p>
                  </div>
                  <StatusBadge status={app.status} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <span className="text-slate-700">
                      Guarantor 1: <strong>{app.guarantor1.memberName}</strong>
                    </span>
                    <StatusBadge status={app.guarantor1.status} />
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <span className="text-slate-700">
                      Guarantor 2: <strong>{app.guarantor2.memberName}</strong>
                    </span>
                    <StatusBadge status={app.guarantor2.status} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
