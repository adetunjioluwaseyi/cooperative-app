import React, { useMemo, useState } from 'react';
import { History, RotateCcw } from 'lucide-react';
import { formatNaira, formatShortDate } from '../../data/seedData';
import { useCooperative } from '../../store/CooperativeContext';
import { TransactionCategory } from '../../types/cooperative';
import { Button, EmptyState, StatusBadge } from '../ui/DesignSystem';

type DateMode = 'All' | 'Day' | 'Month' | 'Year' | 'Custom';

export function MemberTransactions() {
  const { currentMember, transactions } = useCooperative();

  const [category, setCategory] = useState<'All' | TransactionCategory>('All');
  const [status, setStatus] = useState<'All' | 'Approved' | 'Pending' | 'Rejected'>('All');
  const [dateMode, setDateMode] = useState<DateMode>('All');
  const [customStart, setCustomStart] = useState('2026-08-01');
  const [customEnd, setCustomEnd] = useState('2026-11-24');

  const filtered = useMemo(() => {
    if (!currentMember) return [];
    return transactions.filter((t) => {
      if (t.memberId !== currentMember.id) return false;
      if (category !== 'All' && t.category !== category) return false;
      if (status !== 'All' && t.status !== status) return false;
      if (dateMode === 'Day' && t.date !== '2026-11-24') return false;
      if (dateMode === 'Month' && !t.date.startsWith('2026-11') && !t.date.startsWith('2026-10')) {
        return false;
      }
      if (dateMode === 'Year' && !t.date.startsWith('2026')) return false;
      if (dateMode === 'Custom') {
        if (customStart && t.date < customStart) return false;
        if (customEnd && t.date > customEnd) return false;
      }
      return true;
    });
  }, [currentMember, transactions, category, status, dateMode, customStart, customEnd]);

  if (!currentMember) return null;

  const hasFilters = category !== 'All' || status !== 'All' || dateMode !== 'All';

  const clearFilters = () => {
    setCategory('All');
    setStatus('All');
    setDateMode('All');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">My Transactions</h2>
        <p className="text-[15px] text-slate-600 mt-1">
          Every naira you have saved, borrowed, or repaid — clearly marked as Added or Deducted with your resulting balance.
        </p>
      </div>

      {/* Filters (Section 34) */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-1.5">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as 'All' | TransactionCategory)}
              className="w-full min-h-[46px] px-3.5 rounded-lg border border-slate-300 bg-white text-[15px]"
            >
              <option value="All">All Transactions</option>
              <option value="Savings">Savings Contributions</option>
              <option value="Loan Repayment">Loan Repayments</option>
              <option value="Loan Disbursement">Loan Disbursements</option>
              <option value="Payment Submission">Payment Submissions</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-1.5">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as 'All' | 'Approved' | 'Pending' | 'Rejected')}
              className="w-full min-h-[46px] px-3.5 rounded-lg border border-slate-300 bg-white text-[15px]"
            >
              <option value="All">All Statuses</option>
              <option value="Approved">Approved</option>
              <option value="Pending">Pending</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
          <div className="flex items-end">
            {hasFilters && (
              <Button variant="secondary" onClick={clearFilters} icon={<RotateCcw className="w-4 h-4" />}>
                Clear Filters
              </Button>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-lg">
            {(['All', 'Day', 'Month', 'Year', 'Custom'] as DateMode[]).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setDateMode(mode)}
                className={`px-3.5 py-2 rounded-md text-sm font-semibold transition-colors cursor-pointer ${
                  dateMode === mode ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {mode === 'All' ? 'All Dates' : mode === 'Custom' ? 'Custom Date' : mode}
              </button>
            ))}
          </div>

          {dateMode === 'Custom' && (
            <div className="flex flex-wrap items-center gap-3">
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="min-h-[42px] px-3 rounded-lg border border-slate-300 text-sm"
              />
              <span className="text-sm text-slate-500">to</span>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="min-h-[42px] px-3 rounded-lg border border-slate-300 text-sm"
              />
            </div>
          )}
        </div>
      </div>

      {/* Transaction History Table */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<History className="w-6 h-6" />}
          title="No transactions found"
          description="No transactions match your selected category or date filter."
          actionLabel={hasFilters ? 'Clear Filters' : undefined}
          onAction={hasFilters ? clearFilters : undefined}
        />
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-sm font-semibold text-slate-600">
                  <th className="py-4 px-6">Date</th>
                  <th className="py-4 px-4">Description</th>
                  <th className="py-4 px-4">Type</th>
                  <th className="py-4 px-4 text-right">Amount (Added / Deducted)</th>
                  <th className="py-4 px-4">Status</th>
                  <th className="py-4 px-6 text-right">Resulting Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-[15px]">
                {filtered.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50">
                    <td className="py-4 px-6 text-slate-700 whitespace-nowrap">
                      {formatShortDate(t.date)}
                    </td>
                    <td className="py-4 px-4">
                      <p className="font-semibold text-slate-900">{t.description}</p>
                      <p className="text-xs font-mono text-slate-500">
                        {t.paymentMethod} · Ref {t.reference}
                      </p>
                    </td>
                    <td className="py-4 px-4 text-slate-700 whitespace-nowrap">{t.category}</td>
                    <td className="py-4 px-4 text-right whitespace-nowrap">
                      <p
                        className={`font-mono font-bold tabular-nums text-base ${
                          t.direction === 'Added' ? 'text-[#15803D]' : 'text-slate-900'
                        }`}
                      >
                        {t.direction === 'Added' ? '+' : '-'}
                        {formatNaira(t.amount)}
                      </p>
                      <p
                        className={`text-xs font-semibold ${
                          t.direction === 'Added' ? 'text-[#15803D]' : 'text-slate-600'
                        }`}
                      >
                        {t.direction}
                      </p>
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <StatusBadge status={t.status} />
                    </td>
                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      <p className="font-mono font-bold tabular-nums text-slate-900">
                        {formatNaira(t.resultingBalance)}
                      </p>
                      <p className="text-xs text-slate-500">{t.balanceLabel}</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
