import React, { useMemo, useState } from 'react';
import { Wallet } from 'lucide-react';
import { formatNaira, formatShortDate } from '../../data/seedData';
import { useCooperative } from '../../store/CooperativeContext';
import { LoanRecord } from '../../types/cooperative';
import {
  Button,
  EmptyState,
  MemberAvatar,
  SearchInput,
  SideDrawer,
  StatusBadge,
} from '../ui/DesignSystem';

export function AdminLoans() {
  const { loans, members } = useCooperative();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Repaid'>('All');
  const [selectedLoanId, setSelectedLoanId] = useState<string | null>(null);

  const filteredLoans = useMemo(() => {
    const q = search.trim().toLowerCase();
    return loans.filter((l) => {
      if (q && !l.memberName.toLowerCase().includes(q) && !l.memberId.toLowerCase().includes(q)) {
        return false;
      }
      if (statusFilter !== 'All' && l.status !== statusFilter) return false;
      return true;
    });
  }, [loans, search, statusFilter]);

  const activeLoan: LoanRecord | null = useMemo(
    () => loans.find((l) => l.id === selectedLoanId) ?? null,
    [loans, selectedLoanId]
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Loans Management</h2>
        <p className="text-[15px] text-slate-600 mt-1">
          Monitor members with active cooperative loans. Members can hold both cooperative savings and an active loan at the same time.
        </p>
      </div>

      {/* Search & Status Filter */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col sm:flex-row sm:items-end gap-4">
        <SearchInput
          label="Search Member or ID"
          placeholder="Search Member or ID"
          value={search}
          onChange={setSearch}
          className="flex-1"
        />
        <div className="w-full sm:w-56">
          <label className="block text-sm font-semibold text-slate-800 mb-1.5">Loan Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'All' | 'Active' | 'Repaid')}
            className="w-full min-h-[46px] px-3.5 rounded-lg border border-slate-300 bg-white text-[15px] text-slate-900"
          >
            <option value="All">All Loans ({loans.length})</option>
            <option value="Active">Active</option>
            <option value="Repaid">Repaid</option>
          </select>
        </div>
      </div>

      {/* Admin Loan Table (Section 28) */}
      {filteredLoans.length === 0 ? (
        <EmptyState
          icon={<Wallet className="w-6 h-6" />}
          title="No loans found"
          description="No active or repaid loans match your search filter."
          actionLabel="Show All Loans"
          onAction={() => {
            setSearch('');
            setStatusFilter('All');
          }}
        />
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-sm font-semibold text-slate-600">
                  <th className="py-4 px-5">Member</th>
                  <th className="py-4 px-4 text-right">Original Loan</th>
                  <th className="py-4 px-4 text-right">Amount Repaid</th>
                  <th className="py-4 px-4 text-right">Outstanding</th>
                  <th className="py-4 px-4">Period</th>
                  <th className="py-4 px-4">Paid / Remaining</th>
                  <th className="py-4 px-4">Loan Status</th>
                  <th className="py-4 px-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-[15px]">
                {filteredLoans.map((l) => {
                  const member = members.find((m) => m.id === l.memberId);
                  return (
                    <tr key={l.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-4 px-5 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => setSelectedLoanId(l.id)}
                          className="flex items-center gap-3 text-left group cursor-pointer"
                        >
                          <MemberAvatar name={l.memberName} size="sm" />
                          <div>
                            <p className="font-bold text-slate-900 group-hover:text-[#15803D]">
                              {l.memberName}
                            </p>
                            <p className="text-xs font-mono text-slate-500">
                              {l.memberId}
                              {member && member.savingsBalance > 0
                                ? ` · Savings ${formatNaira(member.savingsBalance)}`
                                : ''}
                            </p>
                          </div>
                        </button>
                      </td>
                      <td className="py-4 px-4 text-right font-mono font-semibold tabular-nums text-slate-900 whitespace-nowrap">
                        {formatNaira(l.originalAmount)}
                      </td>
                      <td className="py-4 px-4 text-right font-mono font-semibold tabular-nums text-[#15803D] whitespace-nowrap">
                        {formatNaira(l.amountRepaid)}
                      </td>
                      <td className="py-4 px-4 text-right font-mono font-bold tabular-nums text-slate-900 whitespace-nowrap">
                        {formatNaira(l.outstandingBalance)}
                      </td>
                      <td className="py-4 px-4 text-slate-700 whitespace-nowrap">
                        {l.repaymentPeriodMonths} Months
                      </td>
                      <td className="py-4 px-4 text-sm text-slate-700 whitespace-nowrap tabular-nums">
                        <span className="font-semibold text-slate-900">{l.paymentsMade} paid</span> ·{' '}
                        {l.paymentsRemaining} left
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <StatusBadge status={l.status} />
                      </td>
                      <td className="py-4 px-5 text-right whitespace-nowrap">
                        <Button variant="secondary" size="sm" onClick={() => setSelectedLoanId(l.id)}>
                          View Schedule
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ADMIN LOAN DETAILS DRAWER (Section 29) */}
      <SideDrawer
        open={Boolean(activeLoan)}
        onClose={() => setSelectedLoanId(null)}
        title={activeLoan ? `Loan Profile · ${activeLoan.memberName}` : 'Loan Profile'}
        subtitle={
          activeLoan
            ? `${activeLoan.memberId} · ${activeLoan.id} · Purpose: ${activeLoan.purpose}`
            : undefined
        }
        widthClass="max-w-3xl"
      >
        {activeLoan && (
          <div className="space-y-6">
            {/* Loan Summary Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-5 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <p className="text-xs font-semibold text-slate-500">Original Loan</p>
                <p className="text-xl font-bold font-mono tabular-nums text-slate-900 mt-1">
                  {formatNaira(activeLoan.originalAmount)}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500">Total Repaid</p>
                <p className="text-xl font-bold font-mono tabular-nums text-[#15803D] mt-1">
                  {formatNaira(activeLoan.amountRepaid)}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500">Outstanding</p>
                <p className="text-xl font-bold font-mono tabular-nums text-slate-900 mt-1">
                  {formatNaira(activeLoan.outstandingBalance)}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500">Repayment Period</p>
                <p className="text-base font-bold text-slate-900 mt-1">
                  {activeLoan.repaymentPeriodMonths} Months
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500">Payments Made / Remaining</p>
                <p className="text-base font-bold text-slate-900 mt-1 tabular-nums">
                  {activeLoan.paymentsMade} Paid · {activeLoan.paymentsRemaining} Remaining
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500">Loan Status</p>
                <div className="mt-1">
                  <StatusBadge status={activeLoan.status} />
                </div>
              </div>
            </div>

            {/* Visual Progress Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm font-semibold">
                <span className="text-slate-700">Repayment Progress</span>
                <span className="font-mono text-[#15803D]">
                  {Math.round((activeLoan.amountRepaid / activeLoan.originalAmount) * 100)}% Repaid
                </span>
              </div>
              <div className="h-3.5 w-full bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#15803D] rounded-full transition-all duration-200"
                  style={{
                    width: `${Math.min(
                      100,
                      Math.round((activeLoan.amountRepaid / activeLoan.originalAmount) * 100)
                    )}%`,
                  }}
                />
              </div>
            </div>

            {/* Complete Reducing-Balance Repayment Schedule */}
            <div>
              <div className="mb-3">
                <h3 className="text-lg font-bold text-slate-900">Repayment Schedule</h3>
                <p className="text-sm text-slate-600">
                  Calculated on a {activeLoan.interestRatePercent}% monthly reducing balance — interest decreases each month as the principal goes down.
                </p>
              </div>
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
                        <th className="py-3.5 px-4">Month</th>
                        <th className="py-3.5 px-4">Date</th>
                        <th className="py-3.5 px-4 text-right">Amount Paid</th>
                        <th className="py-3.5 px-4 text-right">Principal</th>
                        <th className="py-3.5 px-4 text-right">Interest</th>
                        <th className="py-3.5 px-4 text-right">Balance</th>
                        <th className="py-3.5 px-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-sm">
                      {activeLoan.schedule.map((row) => (
                        <tr key={row.month} className="hover:bg-slate-50">
                          <td className="py-3 px-4 font-semibold text-slate-900">Month {row.month}</td>
                          <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                            {formatShortDate(row.date)}
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-bold tabular-nums text-slate-900 whitespace-nowrap">
                            {formatNaira(row.amountPaid)}
                          </td>
                          <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-700 whitespace-nowrap">
                            {formatNaira(row.principal)}
                          </td>
                          <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-600 whitespace-nowrap">
                            {formatNaira(row.interest)}
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-semibold tabular-nums text-slate-900 whitespace-nowrap">
                            {formatNaira(row.remainingBalance)}
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            <StatusBadge status={row.status} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </SideDrawer>
    </div>
  );
}
