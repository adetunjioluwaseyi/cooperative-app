import React, { useMemo, useState } from 'react';
import { CreditCard, PiggyBank } from 'lucide-react';
import { formatNaira, formatShortDate } from '../../data/seedData';
import { useCooperative } from '../../store/CooperativeContext';
import { Button, EmptyState, StatusBadge } from '../ui/DesignSystem';

type DateScope = 'All' | 'Day' | 'Month' | 'Year' | 'Custom';

export function MemberSavings() {
  const { currentMember, transactions, setIsMakePaymentDrawerOpen } = useCooperative();
  const [dateScope, setDateScope] = useState<DateScope>('All');
  const [customStart, setCustomStart] = useState('2026-08-01');
  const [customEnd, setCustomEnd] = useState('2026-11-24');

  const savingsTxns = useMemo(() => {
    if (!currentMember) return [];
    return transactions.filter((t) => {
      if (t.memberId !== currentMember.id) return false;
      if (t.category !== 'Savings' && !(t.category === 'Payment Submission' && t.description.includes('Savings'))) {
        return false;
      }
      if (dateScope === 'Day') return t.date === '2026-11-24';
      if (dateScope === 'Month') return t.date.startsWith('2026-11') || t.date.startsWith('2026-10');
      if (dateScope === 'Year') return t.date.startsWith('2026');
      if (dateScope === 'Custom') {
        if (customStart && t.date < customStart) return false;
        if (customEnd && t.date > customEnd) return false;
      }
      return true;
    });
  }, [currentMember, transactions, dateScope, customStart, customEnd]);

  if (!currentMember) return null;

  return (
    <div className="space-y-7">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">My Savings</h2>
          <p className="text-[15px] text-slate-600 mt-1">
            See your current savings balance and every verified contribution you have made to the cooperative.
          </p>
        </div>
        <Button
          size="lg"
          onClick={() => setIsMakePaymentDrawerOpen(true)}
          icon={<CreditCard className="w-5 h-5" />}
        >
          Make Savings Payment
        </Button>
      </div>

      {/* Savings Summary Cards (Section 13) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-[#ECFDF5] border-2 border-[#BBF7D0] rounded-xl p-6">
          <p className="text-sm font-bold text-[#14532D]">Current Savings Balance</p>
          <p className="text-4xl font-extrabold font-mono tabular-nums text-slate-900 mt-2">
            {formatNaira(currentMember.savingsBalance)}
          </p>
          <p className="text-sm text-[#166534] mt-2">Verified &amp; available in your account</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <p className="text-sm font-semibold text-slate-600">Total Contributed</p>
          <p className="text-3xl font-bold font-mono tabular-nums text-slate-900 mt-2">
            {formatNaira(currentMember.totalContributed)}
          </p>
          <p className="text-sm text-slate-600 mt-2">Lifetime cooperative thrift deposits</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <p className="text-sm font-semibold text-slate-600">Number of Contributions</p>
          <p className="text-3xl font-bold font-mono tabular-nums text-slate-900 mt-2">
            {currentMember.contributionCount}
          </p>
          <p className="text-sm text-slate-600 mt-2">
            Last deposit: {currentMember.lastSavingsDate ? formatShortDate(currentMember.lastSavingsDate) : 'None yet'}
          </p>
        </div>
      </div>

      {/* Date Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-lg">
          {(['All', 'Day', 'Month', 'Year', 'Custom'] as DateScope[]).map((scope) => (
            <button
              key={scope}
              type="button"
              onClick={() => setDateScope(scope)}
              className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors cursor-pointer ${
                dateScope === scope
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {scope === 'All' ? 'All Time' : scope === 'Custom' ? 'Custom Date' : scope}
            </button>
          ))}
        </div>

        {dateScope === 'Custom' && (
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

      {/* Savings Transaction History Table */}
      {savingsTxns.length === 0 ? (
        <EmptyState
          icon={<PiggyBank className="w-6 h-6" />}
          title="No savings contributions in this date range"
          description="Try switching the date filter to All Time, or submit your first cooperative savings deposit."
          actionLabel={dateScope !== 'All' ? 'Show All Time' : 'Make Payment'}
          onAction={() =>
            dateScope !== 'All' ? setDateScope('All') : setIsMakePaymentDrawerOpen(true)
          }
        />
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-sm font-semibold text-slate-600">
                  <th className="py-4 px-6">Date</th>
                  <th className="py-4 px-4">Description</th>
                  <th className="py-4 px-4 text-right">Amount</th>
                  <th className="py-4 px-4">Status</th>
                  <th className="py-4 px-6 text-right">Resulting Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-[15px]">
                {savingsTxns.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50">
                    <td className="py-4 px-6 text-slate-700 whitespace-nowrap">
                      {formatShortDate(t.date)}
                    </td>
                    <td className="py-4 px-4">
                      <p className="font-semibold text-slate-900">{t.description}</p>
                      <p className="text-xs font-mono text-slate-500">Ref: {t.reference}</p>
                    </td>
                    <td className="py-4 px-4 text-right font-mono font-bold tabular-nums text-[#15803D] whitespace-nowrap">
                      +{formatNaira(t.amount)}
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <StatusBadge status={t.status} />
                    </td>
                    <td className="py-4 px-6 text-right font-mono font-bold tabular-nums text-slate-900 whitespace-nowrap">
                      {formatNaira(t.resultingBalance)}
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
