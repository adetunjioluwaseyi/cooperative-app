import React, { useState } from 'react';
import {
  ArrowDownLeft,
  ArrowRight,
  ArrowUpRight,
  Banknote,
  CheckCircle2,
  Clock,
  Landmark,
  PiggyBank,
  UserPlus,
  Wallet,
} from 'lucide-react';
import { FINANCIAL_CHART_DATA, formatCompactDate, formatNaira } from '../../data/seedData';
import { useCooperative } from '../../store/CooperativeContext';
import { Button, StatusBadge } from '../ui/DesignSystem';

type PeriodKey = keyof typeof FINANCIAL_CHART_DATA;

export function AdminDashboardOverview({ onOpenAddMember }: { onOpenAddMember: () => void }) {
  const {
    metrics,
    payments,
    setAdminSection,
    setSelectedPaymentIdForReview,
  } = useCooperative();

  const [period, setPeriod] = useState<PeriodKey>('This Month');
  const [customStart, setCustomStart] = useState('2026-10-01');
  const [customEnd, setCustomEnd] = useState('2026-11-24');

  const chart = FINANCIAL_CHART_DATA[period];
  const maxBar = Math.max(
    1,
    ...chart.series.flatMap((s) => [s.received, s.disbursed])
  );

  const pendingPayments = payments.filter((p) => p.status === 'Pending').slice(0, 5);

  const summaryCards = [
    {
      title: 'Total Cooperative Balance',
      value: formatNaira(metrics.totalCooperativeBalance),
      desc: 'Combined savings pool & active loans',
      trend: '+4.2% this month',
      icon: <Landmark className="w-6 h-6 text-[#15803D]" />,
      accent: 'text-slate-900',
    },
    {
      title: 'Total Savings',
      value: formatNaira(metrics.totalSavings),
      desc: 'Total verified member contributions',
      trend: '+₦2.48M in Nov',
      icon: <PiggyBank className="w-6 h-6 text-[#15803D]" />,
      accent: 'text-slate-900',
    },
    {
      title: 'Loans Outstanding',
      value: formatNaira(metrics.loansOutstanding),
      desc: 'Remaining balance across active loans',
      trend: '96% on-time repayment',
      icon: <Wallet className="w-6 h-6 text-slate-700" />,
      accent: 'text-slate-900',
    },
    {
      title: 'Money Received',
      value: formatNaira(metrics.moneyReceived),
      desc: 'Savings & loan repayments this month',
      trend: 'Verified inflows',
      icon: <ArrowDownLeft className="w-6 h-6 text-[#15803D]" />,
      accent: 'text-[#15803D]',
    },
    {
      title: 'Money Disbursed',
      value: formatNaira(metrics.moneyDisbursed),
      desc: 'Approved loans paid out this month',
      trend: 'Cooperative outflows',
      icon: <ArrowUpRight className="w-6 h-6 text-slate-700" />,
      accent: 'text-slate-900',
    },
    {
      title: 'Pending Requests',
      value: String(metrics.pendingPaymentsCount),
      desc: 'Member transfers waiting for review',
      trend: formatNaira(metrics.pendingPaymentsAmount) + ' awaiting',
      icon: <Clock className="w-6 h-6 text-[#D97706]" />,
      accent: 'text-[#B45309]',
      onClick: () => setAdminSection('payments'),
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page Intro & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Cooperative Overview
          </h2>
          <p className="text-[15px] text-slate-600 mt-1">
            Clear summary of cooperative funds, member savings, loans, and transfers awaiting confirmation.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="secondary"
            onClick={() => setAdminSection('payments')}
            icon={<Clock className="w-4 h-4 text-[#D97706]" />}
          >
            Review Pending ({metrics.pendingPaymentsCount})
          </Button>
          <Button
            variant="primary"
            onClick={onOpenAddMember}
            icon={<UserPlus className="w-4 h-4" />}
          >
            Add New Member
          </Button>
        </div>
      </div>

      {/* 6 Prominent Summary Cards */}
      <section aria-label="Cooperative Financial Summary" className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {summaryCards.map((card) => (
          <div
            key={card.title}
            onClick={card.onClick}
            className={`bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between transition-colors ${
              card.onClick ? 'cursor-pointer hover:border-[#15803D]' : ''
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <p className="text-[15px] font-semibold text-slate-700">{card.title}</p>
              <div className="w-11 h-11 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
                {card.icon}
              </div>
            </div>
            <p className={`text-3xl font-bold font-mono tabular-nums mt-4 ${card.accent}`}>
              {card.value}
            </p>
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between gap-2 text-sm">
              <span className="text-slate-600">{card.desc}</span>
              <span className="font-semibold text-slate-800 whitespace-nowrap">{card.trend}</span>
            </div>
          </div>
        ))}
      </section>

      {/* Large Payment Verification Spotlight */}
      <section aria-label="Payment Verification Summary" className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Payment Verification Status</h3>
            <p className="text-[15px] text-slate-600">
              Confirm bank transfer receipts before member savings and loan balances update.
            </p>
          </div>
          <Button
            variant="soft-green"
            onClick={() => setAdminSection('payments')}
          >
            <span>Open Payment Verification</span>
            <ArrowRight className="w-4 h-4 inline ml-1" />
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <button
            type="button"
            onClick={() => setAdminSection('payments')}
            className="text-left bg-[#FFFBEB] border border-[#FDE68A] hover:border-[#D97706] rounded-xl p-6 sm:p-7 transition-colors cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="text-base font-bold text-[#92400E]">Pending Review</span>
              <Clock className="w-7 h-7 text-[#D97706]" />
            </div>
            <p className="text-4xl font-extrabold font-mono tabular-nums text-slate-900 mt-4">
              {metrics.pendingPaymentsCount}
            </p>
            <p className="text-[15px] text-[#92400E] font-medium mt-2">
              Transfers waiting for verification
            </p>
          </button>

          <button
            type="button"
            onClick={() => setAdminSection('payments')}
            className="text-left bg-white border border-slate-200 hover:border-slate-400 rounded-xl p-6 sm:p-7 transition-colors cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="text-base font-bold text-slate-800">Pending Amount</span>
              <Banknote className="w-7 h-7 text-[#D97706]" />
            </div>
            <p className="text-4xl font-extrabold font-mono tabular-nums text-slate-900 mt-4">
              {formatNaira(metrics.pendingPaymentsAmount)}
            </p>
            <p className="text-[15px] text-slate-600 font-medium mt-2">
              Total value awaiting verification
            </p>
          </button>

          <button
            type="button"
            onClick={() => setAdminSection('payments')}
            className="text-left bg-[#ECFDF5] border border-[#BBF7D0] hover:border-[#15803D] rounded-xl p-6 sm:p-7 transition-colors cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="text-base font-bold text-[#14532D]">Approved This Month</span>
              <CheckCircle2 className="w-7 h-7 text-[#15803D]" />
            </div>
            <p className="text-4xl font-extrabold font-mono tabular-nums text-slate-900 mt-4">
              {metrics.approvedThisMonth}
            </p>
            <p className="text-[15px] text-[#14532D] font-medium mt-2">
              Payments successfully verified
            </p>
          </button>
        </div>
      </section>

      {/* Simple Financial Overview Chart */}
      <section aria-label="Financial Overview" className="bg-white border border-slate-200 rounded-xl p-6 sm:p-7 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Financial Overview</h3>
            <p className="text-[15px] text-slate-600 mt-0.5">
              Money received versus money disbursed · {chart.label}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-lg">
            {(['Today', 'This Week', 'This Month', 'This Year', 'Custom Date'] as PeriodKey[]).map(
              (key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setPeriod(key)}
                  className={`px-3.5 py-2 rounded-md text-sm font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                    period === key
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {key}
                </button>
              )
            )}
          </div>
        </div>

        {period === 'Custom Date' && (
          <div className="flex flex-wrap items-center gap-4 p-4 rounded-lg bg-slate-50 border border-slate-200">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">From Date</label>
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="min-h-[42px] px-3 rounded-lg border border-slate-300 bg-white text-sm text-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">To Date</label>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="min-h-[42px] px-3 rounded-lg border border-slate-300 bg-white text-sm text-slate-900"
              />
            </div>
          </div>
        )}

        {/* 5 Clear Financial Breakdown Figures */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 pt-2 border-t border-slate-100">
          <div>
            <p className="text-sm text-slate-600">Money Received</p>
            <p className="text-xl font-bold font-mono tabular-nums text-[#15803D] mt-1">
              {formatNaira(chart.moneyReceived)}
            </p>
          </div>
          <div>
            <p className="text-sm text-slate-600">Money Disbursed</p>
            <p className="text-xl font-bold font-mono tabular-nums text-slate-900 mt-1">
              {formatNaira(chart.moneyDisbursed)}
            </p>
          </div>
          <div>
            <p className="text-sm text-slate-600">Savings Received</p>
            <p className="text-xl font-bold font-mono tabular-nums text-slate-900 mt-1">
              {formatNaira(chart.savingsReceived)}
            </p>
          </div>
          <div>
            <p className="text-sm text-slate-600">Loan Repayments</p>
            <p className="text-xl font-bold font-mono tabular-nums text-slate-900 mt-1">
              {formatNaira(chart.loanRepayments)}
            </p>
          </div>
          <div>
            <p className="text-sm text-slate-600">Loans Disbursed</p>
            <p className="text-xl font-bold font-mono tabular-nums text-slate-900 mt-1">
              {formatNaira(chart.loansDisbursed)}
            </p>
          </div>
        </div>

        {/* Clean Accessible Grouped Bar Chart */}
        <div className="pt-4">
          <div className="flex items-center gap-6 mb-5 text-sm font-semibold text-slate-700">
            <span className="inline-flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded bg-[#15803D] inline-block" />
              Money Received
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded bg-slate-400 inline-block" />
              Money Disbursed
            </span>
          </div>

          <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${chart.series.length}, minmax(0, 1fr))` }}>
            {chart.series.map((item) => {
              const recPct = Math.max(6, Math.round((item.received / maxBar) * 100));
              const disPct = item.disbursed === 0 ? 0 : Math.max(6, Math.round((item.disbursed / maxBar) * 100));
              return (
                <div key={item.period} className="flex flex-col items-center">
                  <div className="w-full h-48 flex items-end justify-center gap-2.5 px-1 border-b border-slate-200 pb-1">
                    <div className="flex-1 max-w-[38px] flex flex-col items-center justify-end h-full group">
                      <span className="text-[11px] font-mono tabular-nums text-slate-600 mb-1 hidden sm:block">
                        {item.received >= 1000000
                          ? `₦${(item.received / 1000000).toFixed(1)}M`
                          : `₦${Math.round(item.received / 1000)}k`}
                      </span>
                      <div
                        title={`Received: ${formatNaira(item.received)}`}
                        style={{ height: `${recPct}%` }}
                        className="w-full bg-[#15803D] rounded-t-md transition-all duration-200"
                      />
                    </div>
                    <div className="flex-1 max-w-[38px] flex flex-col items-center justify-end h-full">
                      {item.disbursed > 0 && (
                        <span className="text-[11px] font-mono tabular-nums text-slate-500 mb-1 hidden sm:block">
                          {item.disbursed >= 1000000
                            ? `₦${(item.disbursed / 1000000).toFixed(1)}M`
                            : `₦${Math.round(item.disbursed / 1000)}k`}
                        </span>
                      )}
                      <div
                        title={`Disbursed: ${formatNaira(item.disbursed)}`}
                        style={{ height: `${disPct}%` }}
                        className="w-full bg-slate-300 rounded-t-md transition-all duration-200"
                      />
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-slate-700 mt-2.5">{item.period}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pending Transfers Queue Preview */}
      <section aria-label="Latest Transfers Awaiting Review" className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Transfers Waiting for Review</h3>
            <p className="text-sm text-slate-600">Click Review to inspect the uploaded bank receipt and confirm balances.</p>
          </div>
          <Button variant="secondary" size="sm" onClick={() => setAdminSection('payments')}>
            View All Payments
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-sm font-semibold text-slate-600">
                <th className="py-3.5 px-6">Member</th>
                <th className="py-3.5 px-4">Payment Type</th>
                <th className="py-3.5 px-4 text-right">Amount</th>
                <th className="py-3.5 px-4">Allocation</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-[15px]">
              {pendingPayments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-600">
                    All submitted payments have been reviewed.
                  </td>
                </tr>
              ) : (
                pendingPayments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="py-4 px-6">
                      <p className="font-semibold text-slate-900">{p.memberName}</p>
                      <p className="text-xs font-mono text-slate-500">{p.memberId}</p>
                    </td>
                    <td className="py-4 px-4 font-medium text-slate-800">{p.paymentType}</td>
                    <td className="py-4 px-4 text-right font-mono font-bold tabular-nums text-slate-900">
                      {formatNaira(p.totalAmount)}
                    </td>
                    <td className="py-4 px-4 text-sm text-slate-700 font-mono tabular-nums">
                      {p.paymentType === 'Savings + Loan'
                        ? `${formatNaira(p.savingsAllocation)} + ${formatNaira(p.loanAllocation)}`
                        : p.paymentType === 'Savings'
                        ? `Savings: ${formatNaira(p.savingsAllocation)}`
                        : `Loan: ${formatNaira(p.loanAllocation)}`}
                    </td>
                    <td className="py-4 px-4 text-slate-700 whitespace-nowrap">
                      {formatCompactDate(p.dateSubmitted)}
                    </td>
                    <td className="py-4 px-4">
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedPaymentIdForReview(p.id);
                          setAdminSection('payments');
                        }}
                      >
                        Review
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
