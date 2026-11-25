import React, { useMemo, useState } from 'react';
import { History, RotateCcw } from 'lucide-react';
import { formatNaira, formatShortDate } from '../../data/seedData';
import { useCooperative } from '../../store/CooperativeContext';
import { TransactionCategory } from '../../types/cooperative';
import {
  Button,
  EmptyState,
  Pagination,
  SearchInput,
  StatusBadge,
} from '../ui/DesignSystem';

const PAGE_SIZE = 10;

export function AdminTransactions() {
  const { transactions } = useCooperative();

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'All' | TransactionCategory>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Approved' | 'Pending' | 'Rejected'>('All');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [minAmount, setMinAmount] = useState('');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const min = minAmount ? Number(minAmount) : 0;
    return transactions.filter((t) => {
      if (
        q &&
        !t.memberName.toLowerCase().includes(q) &&
        !t.memberId.toLowerCase().includes(q) &&
        !t.reference.toLowerCase().includes(q)
      ) {
        return false;
      }
      if (categoryFilter !== 'All' && t.category !== categoryFilter) return false;
      if (statusFilter !== 'All' && t.status !== statusFilter) return false;
      if (dateFrom && t.date < dateFrom) return false;
      if (dateTo && t.date > dateTo) return false;
      if (min > 0 && t.amount < min) return false;
      return true;
    });
  }, [transactions, search, categoryFilter, statusFilter, dateFrom, dateTo, minAmount]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const hasFilters =
    search !== '' ||
    categoryFilter !== 'All' ||
    statusFilter !== 'All' ||
    dateFrom !== '' ||
    dateTo !== '' ||
    minAmount !== '';

  const clearFilters = () => {
    setSearch('');
    setCategoryFilter('All');
    setStatusFilter('All');
    setDateFrom('');
    setDateTo('');
    setMinAmount('');
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Cooperative Transactions</h2>
        <p className="text-[15px] text-slate-600 mt-1">
          Complete traceable ledger of savings contributions, loan repayments, loan disbursements, and payment submissions across all members.
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          <SearchInput
            label="Search Member, ID, or Reference"
            placeholder="Search Member, ID, or Bank Ref"
            value={search}
            onChange={(v) => {
              setSearch(v);
              setPage(1);
            }}
            className="md:col-span-5"
          />
          <div className="md:col-span-3">
            <label className="block text-sm font-semibold text-slate-800 mb-1.5">Transaction Type</label>
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value as 'All' | TransactionCategory);
                setPage(1);
              }}
              className="w-full min-h-[46px] px-3.5 rounded-lg border border-slate-300 bg-white text-[15px]"
            >
              <option value="All">All Types</option>
              <option value="Savings">Savings Contributions</option>
              <option value="Loan Repayment">Loan Repayments</option>
              <option value="Loan Disbursement">Loan Disbursements</option>
              <option value="Payment Submission">Payment Submissions</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-slate-800 mb-1.5">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as 'All' | 'Approved' | 'Pending' | 'Rejected');
                setPage(1);
              }}
              className="w-full min-h-[46px] px-3.5 rounded-lg border border-slate-300 bg-white text-[15px]"
            >
              <option value="All">All Statuses</option>
              <option value="Approved">Approved</option>
              <option value="Pending">Pending</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-slate-800 mb-1.5">Min Amount (₦)</label>
            <input
              type="number"
              min={0}
              step={10000}
              value={minAmount}
              onChange={(e) => {
                setMinAmount(e.target.value);
                setPage(1);
              }}
              placeholder="0"
              className="w-full min-h-[46px] px-3.5 rounded-lg border border-slate-300 bg-white text-[15px] font-mono"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-end justify-between gap-4 pt-2 border-t border-slate-100">
          <div className="flex flex-wrap items-end gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">From Date</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => {
                  setDateFrom(e.target.value);
                  setPage(1);
                }}
                className="min-h-[42px] px-3 rounded-lg border border-slate-300 bg-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">To Date</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => {
                  setDateTo(e.target.value);
                  setPage(1);
                }}
                className="min-h-[42px] px-3 rounded-lg border border-slate-300 bg-white text-sm"
              />
            </div>
          </div>

          {hasFilters && (
            <Button variant="secondary" size="sm" onClick={clearFilters} icon={<RotateCcw className="w-4 h-4" />}>
              Clear Filters
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<History className="w-6 h-6" />}
          title="No transactions match"
          description="Try clearing your filters to view all cooperative financial transactions."
          actionLabel={hasFilters ? 'Clear Filters' : undefined}
          onAction={hasFilters ? clearFilters : undefined}
        />
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-sm font-semibold text-slate-600">
                  <th className="py-4 px-5">Date</th>
                  <th className="py-4 px-4">Member</th>
                  <th className="py-4 px-4">Description</th>
                  <th className="py-4 px-4">Type</th>
                  <th className="py-4 px-4 text-right">Amount</th>
                  <th className="py-4 px-4">Status</th>
                  <th className="py-4 px-5 text-right">Resulting Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-[15px]">
                {paginated.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50">
                    <td className="py-4 px-5 text-slate-700 whitespace-nowrap">
                      {formatShortDate(t.date)}
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <p className="font-semibold text-slate-900">{t.memberName}</p>
                      <p className="text-xs font-mono text-slate-500">{t.memberId}</p>
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-slate-900 font-medium">{t.description}</p>
                      <p className="text-xs text-slate-500 font-mono">
                        {t.paymentMethod} · Ref {t.reference}
                      </p>
                    </td>
                    <td className="py-4 px-4 text-sm font-medium text-slate-700 whitespace-nowrap">
                      {t.category}
                    </td>
                    <td className="py-4 px-4 text-right whitespace-nowrap">
                      <p
                        className={`font-mono font-bold tabular-nums ${
                          t.direction === 'Added' ? 'text-[#15803D]' : 'text-slate-900'
                        }`}
                      >
                        {t.direction === 'Added' ? '+' : '-'}
                        {formatNaira(t.amount)}
                      </p>
                      <p className="text-xs text-slate-500">{t.direction}</p>
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <StatusBadge status={t.status} />
                    </td>
                    <td className="py-4 px-5 text-right whitespace-nowrap">
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
          <div className="px-5 pb-4">
            <Pagination
              page={safePage}
              totalPages={totalPages}
              totalItems={filtered.length}
              pageSize={PAGE_SIZE}
              onPageChange={setPage}
            />
          </div>
        </div>
      )}
    </div>
  );
}
