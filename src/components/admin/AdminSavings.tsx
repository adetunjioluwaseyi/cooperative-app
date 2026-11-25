import React, { useMemo, useState } from 'react';
import { PiggyBank, RotateCcw } from 'lucide-react';
import { formatNaira, formatShortDate } from '../../data/seedData';
import { useCooperative } from '../../store/CooperativeContext';
import { Member } from '../../types/cooperative';
import {
  Button,
  EmptyState,
  MemberAvatar,
  SearchInput,
  SideDrawer,
  StatusBadge,
} from '../ui/DesignSystem';

export function AdminSavings() {
  const { members, transactions } = useCooperative();

  const [search, setSearch] = useState('');
  const [activityFilter, setActivityFilter] = useState<'all' | 'active' | 'no-recent'>('all');
  const [balanceFilter, setBalanceFilter] = useState<'all' | 'under-250k' | '250k-500k' | 'over-500k'>('all');
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);

  const savers = useMemo(() => {
    const q = search.trim().toLowerCase();
    return members.filter((m) => {
      if (m.savingsBalance <= 0 && m.totalContributed <= 0) return false;
      if (q && !m.fullName.toLowerCase().includes(q) && !m.id.toLowerCase().includes(q)) return false;

      if (activityFilter === 'active') {
        if (!m.lastSavingsDate || m.lastSavingsDate < '2026-09-01') return false;
      }
      if (activityFilter === 'no-recent') {
        if (m.lastSavingsDate && m.lastSavingsDate >= '2026-09-01') return false;
      }

      if (balanceFilter === 'under-250k' && m.savingsBalance >= 250000) return false;
      if (balanceFilter === '250k-500k' && (m.savingsBalance < 250000 || m.savingsBalance > 500000)) return false;
      if (balanceFilter === 'over-500k' && m.savingsBalance <= 500000) return false;

      return true;
    });
  }, [members, search, activityFilter, balanceFilter]);

  const selectedMember: Member | null = useMemo(
    () => members.find((m) => m.id === selectedMemberId) ?? null,
    [members, selectedMemberId]
  );

  const memberSavingsHistory = useMemo(() => {
    if (!selectedMember) return [];
    return transactions.filter(
      (t) => t.memberId === selectedMember.id && t.category === 'Savings'
    );
  }, [selectedMember, transactions]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Savings Management</h2>
        <p className="text-[15px] text-slate-600 mt-1">
          Track all members with cooperative savings. Click any member to inspect how their current savings balance was built.
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
        <SearchInput
          label="Search Member or ID"
          placeholder="Search by Name or Member ID"
          value={search}
          onChange={setSearch}
          className="md:col-span-5"
        />
        <div className="md:col-span-3">
          <label className="block text-sm font-semibold text-slate-800 mb-1.5">Contribution Activity</label>
          <select
            value={activityFilter}
            onChange={(e) => setActivityFilter(e.target.value as 'all' | 'active' | 'no-recent')}
            className="w-full min-h-[46px] px-3.5 rounded-lg border border-slate-300 bg-white text-[15px] text-slate-900"
          >
            <option value="all">All Savers</option>
            <option value="active">Active Savers (Recent)</option>
            <option value="no-recent">No Recent Contribution</option>
          </select>
        </div>
        <div className="md:col-span-3">
          <label className="block text-sm font-semibold text-slate-800 mb-1.5">Balance Range</label>
          <select
            value={balanceFilter}
            onChange={(e) =>
              setBalanceFilter(e.target.value as 'all' | 'under-250k' | '250k-500k' | 'over-500k')
            }
            className="w-full min-h-[46px] px-3.5 rounded-lg border border-slate-300 bg-white text-[15px] text-slate-900"
          >
            <option value="all">Any Balance</option>
            <option value="under-250k">Under ₦250,000</option>
            <option value="250k-500k">₦250,000 – ₦500,000</option>
            <option value="over-500k">Above ₦500,000</option>
          </select>
        </div>
        {(search || activityFilter !== 'all' || balanceFilter !== 'all') && (
          <div className="md:col-span-1">
            <Button
              variant="secondary"
              onClick={() => {
                setSearch('');
                setActivityFilter('all');
                setBalanceFilter('all');
              }}
              icon={<RotateCcw className="w-4 h-4" />}
            >
              Reset
            </Button>
          </div>
        )}
      </div>

      {/* Savings Table */}
      {savers.length === 0 ? (
        <EmptyState
          icon={<PiggyBank className="w-6 h-6" />}
          title="No savings records match"
          description="Try adjusting your search or filter selections to see member savings balances."
          actionLabel="Clear Filters"
          onAction={() => {
            setSearch('');
            setActivityFilter('all');
            setBalanceFilter('all');
          }}
        />
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-sm font-semibold text-slate-600">
                  <th className="py-4 px-5">Member Name</th>
                  <th className="py-4 px-4">Member ID</th>
                  <th className="py-4 px-4 text-right">Current Savings</th>
                  <th className="py-4 px-4 text-right">Total Contributions</th>
                  <th className="py-4 px-4">Last Payment</th>
                  <th className="py-4 px-4">Status</th>
                  <th className="py-4 px-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-[15px]">
                {savers.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-5 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => setSelectedMemberId(m.id)}
                        className="flex items-center gap-3 text-left group cursor-pointer"
                      >
                        <MemberAvatar name={m.fullName} size="sm" />
                        <div>
                          <p className="font-bold text-slate-900 group-hover:text-[#15803D]">
                            {m.fullName}
                          </p>
                          {m.loanBalance > 0 && (
                            <p className="text-xs text-slate-500">
                              Also holds active loan ({formatNaira(m.loanBalance)})
                            </p>
                          )}
                        </div>
                      </button>
                    </td>
                    <td className="py-4 px-4 font-mono text-sm text-slate-700 whitespace-nowrap">
                      {m.id}
                    </td>
                    <td className="py-4 px-4 text-right font-mono font-bold tabular-nums text-[#15803D] whitespace-nowrap">
                      {formatNaira(m.savingsBalance)}
                    </td>
                    <td className="py-4 px-4 text-right font-mono tabular-nums text-slate-800 whitespace-nowrap">
                      {formatNaira(m.totalContributed)} · {m.contributionCount} deposits
                    </td>
                    <td className="py-4 px-4 text-slate-700 whitespace-nowrap">
                      {m.lastSavingsDate ? formatShortDate(m.lastSavingsDate) : 'No deposits yet'}
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <StatusBadge status={m.status} />
                    </td>
                    <td className="py-4 px-5 text-right whitespace-nowrap">
                      <Button variant="secondary" size="sm" onClick={() => setSelectedMemberId(m.id)}>
                        View History
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ADMIN SAVINGS MEMBER DETAILS DRAWER (Section 26) */}
      <SideDrawer
        open={Boolean(selectedMember)}
        onClose={() => setSelectedMemberId(null)}
        title={selectedMember ? `Savings History · ${selectedMember.fullName}` : 'Savings History'}
        subtitle={selectedMember ? `${selectedMember.id} · ${selectedMember.phoneNumber}` : undefined}
        widthClass="max-w-3xl"
      >
        {selectedMember && (
          <div className="space-y-6">
            <div className="rounded-xl bg-[#ECFDF5] border border-[#BBF7D0] p-6 flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-[#14532D]">Current Savings</p>
                <p className="text-4xl font-extrabold font-mono tabular-nums text-slate-900 mt-1">
                  {formatNaira(selectedMember.savingsBalance)}
                </p>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-sm text-[#14532D]">Total Contributed</p>
                <p className="text-xl font-bold font-mono tabular-nums text-slate-900 mt-0.5">
                  {formatNaira(selectedMember.totalContributed)} ({selectedMember.contributionCount} contributions)
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-3">
                Complete Savings Transaction History
              </h3>
              {memberSavingsHistory.length === 0 ? (
                <p className="text-[15px] text-slate-600 p-6 bg-slate-50 rounded-xl border border-slate-200">
                  No individual verified deposit entries recorded in this period yet. Opening balance: {formatNaira(selectedMember.savingsBalance)}.
                </p>
              ) : (
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
                          <th className="py-3.5 px-4">Date</th>
                          <th className="py-3.5 px-4 text-right">Amount</th>
                          <th className="py-3.5 px-4">Payment Method</th>
                          <th className="py-3.5 px-4">Reference</th>
                          <th className="py-3.5 px-4">Status</th>
                          <th className="py-3.5 px-4 text-right">Running Balance</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 text-sm">
                        {memberSavingsHistory.map((t) => (
                          <tr key={t.id}>
                            <td className="py-3.5 px-4 text-slate-800 whitespace-nowrap">
                              {formatShortDate(t.date)}
                            </td>
                            <td className="py-3.5 px-4 text-right font-mono font-bold tabular-nums text-[#15803D] whitespace-nowrap">
                              +{formatNaira(t.amount)}
                            </td>
                            <td className="py-3.5 px-4 text-slate-700 whitespace-nowrap">
                              {t.paymentMethod}
                            </td>
                            <td className="py-3.5 px-4 font-mono text-xs text-slate-600 whitespace-nowrap">
                              {t.reference}
                            </td>
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <StatusBadge status={t.status} />
                            </td>
                            <td className="py-3.5 px-4 text-right font-mono font-bold tabular-nums text-slate-900 whitespace-nowrap">
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
          </div>
        )}
      </SideDrawer>
    </div>
  );
}
