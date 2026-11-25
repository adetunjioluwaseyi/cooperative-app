import React from 'react';
import { CreditCard, Info, Wallet } from 'lucide-react';
import { formatNaira, formatShortDate } from '../../data/seedData';
import { useCooperative } from '../../store/CooperativeContext';
import { Button, EmptyState, StatusBadge } from '../ui/DesignSystem';

export function MemberLoan() {
  const {
    currentMember,
    loans,
    setIsMakePaymentDrawerOpen,
    setMemberSection,
  } = useCooperative();

  if (!currentMember) return null;

  const memberLoans = loans.filter((l) => l.memberId === currentMember.id);
  const activeLoan = memberLoans.find((l) => l.status === 'Active') ?? memberLoans[0] ?? null;

  if (!activeLoan) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">My Loan</h2>
          <p className="text-[15px] text-slate-600 mt-1">
            View how much you borrowed, how much you have paid, and how much remains.
          </p>
        </div>
        <EmptyState
          icon={<Wallet className="w-6 h-6" />}
          title="You have no active cooperative loan"
          description="Your outstanding loan balance is ₦0. Whenever you need financial support, you can check your 6-month eligibility and apply for a loan."
          actionLabel="Apply for Loan"
          onAction={() => setMemberSection('apply-loan')}
        />
      </div>
    );
  }

  const progressPct = Math.min(
    100,
    Math.round((activeLoan.amountRepaid / activeLoan.originalAmount) * 100)
  );

  return (
    <div className="space-y-7">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">My Loan</h2>
          <p className="text-[15px] text-slate-600 mt-1">
            Loan {activeLoan.id} · Purpose: {activeLoan.purpose}
          </p>
        </div>
        {activeLoan.status === 'Active' && (
          <Button
            size="lg"
            onClick={() => setIsMakePaymentDrawerOpen(true)}
            icon={<CreditCard className="w-5 h-5" />}
          >
            Make Loan Repayment
          </Button>
        )}
      </div>

      {/* Clear 3-Step Transparency Progress Card (Sections 14 & 15) */}
      <section className="bg-white border-2 border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-slate-600">
              How much I borrowed → how much I have paid → how much remains
            </p>
            <h3 className="text-xl font-bold text-slate-900 mt-0.5">Loan Repayment Progress</h3>
          </div>
          <StatusBadge status={activeLoan.status} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="p-5 rounded-xl bg-slate-50 border border-slate-200">
            <p className="text-sm font-semibold text-slate-600">Original Loan Amount</p>
            <p className="text-3xl font-extrabold font-mono tabular-nums text-slate-900 mt-1.5">
              {formatNaira(activeLoan.originalAmount)}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Disbursed {formatShortDate(activeLoan.disbursedDate)}
            </p>
          </div>

          <div className="p-5 rounded-xl bg-[#ECFDF5] border border-[#BBF7D0]">
            <p className="text-sm font-semibold text-[#14532D]">Total Amount Repaid</p>
            <p className="text-3xl font-extrabold font-mono tabular-nums text-[#15803D] mt-1.5">
              {formatNaira(activeLoan.amountRepaid)}
            </p>
            <p className="text-xs text-[#166534] mt-1">
              {activeLoan.paymentsMade} of {activeLoan.repaymentPeriodMonths} monthly payments made
            </p>
          </div>

          <div className="p-5 rounded-xl bg-white border-2 border-slate-300">
            <p className="text-sm font-semibold text-slate-700">Outstanding Balance</p>
            <p className="text-3xl font-extrabold font-mono tabular-nums text-slate-900 mt-1.5">
              {formatNaira(activeLoan.outstandingBalance)}
            </p>
            <p className="text-xs text-slate-600 mt-1">
              {activeLoan.paymentsRemaining} monthly payments remaining
            </p>
          </div>
        </div>

        {/* Visual Progress Bar */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-base font-bold">
            <span className="text-slate-800">Repayment Progress</span>
            <span className="font-mono text-[#15803D]">{progressPct}% Paid</span>
          </div>
          <div className="h-4 w-full bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#15803D] rounded-full transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* Supporting Loan Details */}
        <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-200 text-sm">
          <div>
            <dt className="text-slate-500">Next Repayment</dt>
            <dd className="font-bold font-mono text-slate-900 text-base mt-0.5">
              {activeLoan.status === 'Active' ? formatNaira(activeLoan.nextRepaymentAmount) : '₦0'}
            </dd>
            {activeLoan.status === 'Active' && (
              <dd className="text-xs text-slate-500">Due {formatShortDate(activeLoan.nextRepaymentDate)}</dd>
            )}
          </div>
          <div>
            <dt className="text-slate-500">Repayment Duration</dt>
            <dd className="font-bold text-slate-900 text-base mt-0.5">
              {activeLoan.repaymentPeriodMonths} Months
            </dd>
          </div>
          <div>
            <dt className="text-slate-500">Interest Rate</dt>
            <dd className="font-bold text-slate-900 text-base mt-0.5">
              {activeLoan.interestRatePercent}% Monthly Reducing
            </dd>
          </div>
          <div>
            <dt className="text-slate-500">Loan Reference</dt>
            <dd className="font-bold font-mono text-slate-900 text-base mt-0.5">{activeLoan.id}</dd>
          </div>
        </dl>
      </section>

      {/* Plain-English Reducing-Balance Interest Explanation (Section 15) */}
      <div className="rounded-xl bg-[#ECFDF5] border border-[#BBF7D0] p-5 flex items-start gap-3.5">
        <Info className="w-6 h-6 text-[#15803D] shrink-0 mt-0.5" />
        <div>
          <h4 className="text-base font-bold text-[#14532D]">
            How your reducing-balance interest works (in simple terms)
          </h4>
          <p className="text-[15px] text-[#166534] mt-1 leading-relaxed">
            Your interest is calculated only on the money you still owe — never on the original loan amount. Every time you pay back principal, your remaining balance becomes smaller, so your monthly interest drops automatically.
          </p>
        </div>
      </div>

      {/* Complete Repayment History & Schedule (Section 15) */}
      <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200">
          <h3 className="text-lg font-bold text-slate-900">Loan Repayment History &amp; Schedule</h3>
          <p className="text-sm text-slate-600">
            Notice how your monthly interest reduces step by step as your remaining balance goes down.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-sm font-semibold text-slate-600">
                <th className="py-4 px-5">Month</th>
                <th className="py-4 px-4">Date</th>
                <th className="py-4 px-4 text-right">Amount Paid</th>
                <th className="py-4 px-4 text-right">Principal</th>
                <th className="py-4 px-4 text-right">Interest</th>
                <th className="py-4 px-4 text-right">Remaining Balance</th>
                <th className="py-4 px-5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-[15px]">
              {activeLoan.schedule.map((row) => (
                <tr key={row.month} className="hover:bg-slate-50">
                  <td className="py-4 px-5 font-bold text-slate-900 whitespace-nowrap">
                    Month {row.month}
                  </td>
                  <td className="py-4 px-4 text-slate-700 whitespace-nowrap">
                    {formatShortDate(row.date)}
                  </td>
                  <td className="py-4 px-4 text-right font-mono font-bold tabular-nums text-slate-900 whitespace-nowrap">
                    {formatNaira(row.amountPaid)}
                  </td>
                  <td className="py-4 px-4 text-right font-mono tabular-nums text-slate-700 whitespace-nowrap">
                    {formatNaira(row.principal)}
                  </td>
                  <td className="py-4 px-4 text-right font-mono tabular-nums text-[#15803D] whitespace-nowrap">
                    {formatNaira(row.interest)}
                  </td>
                  <td className="py-4 px-4 text-right font-mono font-bold tabular-nums text-slate-900 whitespace-nowrap">
                    {formatNaira(row.remainingBalance)}
                  </td>
                  <td className="py-4 px-5 whitespace-nowrap">
                    <StatusBadge status={row.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
