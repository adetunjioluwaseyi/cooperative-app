import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  Banknote,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  RotateCcw,
  Split,
  XCircle,
} from 'lucide-react';
import { formatCompactDate, formatNaira, formatShortDate } from '../../data/seedData';
import { useCooperative } from '../../store/CooperativeContext';
import { PaymentStatus, PaymentType } from '../../types/cooperative';
import {
  Button,
  EmptyState,
  Pagination,
  ReceiptPreview,
  SearchInput,
  SideDrawer,
  StatusBadge,
} from '../ui/DesignSystem';

const PAGE_SIZE = 8;

export function AdminPaymentVerification() {
  const {
    payments,
    members,
    metrics,
    selectedPaymentIdForReview,
    setSelectedPaymentIdForReview,
    approvePayment,
    rejectPayment,
  } = useCooperative();

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'All' | PaymentType>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | PaymentStatus>('All');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [minAmount, setMinAmount] = useState('');
  const [page, setPage] = useState(1);

  // Side drawer action states
  const [adminNote, setAdminNote] = useState('');
  const [showRejectBox, setShowRejectBox] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectError, setRejectError] = useState('');

  const filteredPayments = useMemo(() => {
    const q = search.trim().toLowerCase();
    const minVal = minAmount ? Number(minAmount) : 0;

    return payments.filter((p) => {
      if (q && !p.memberName.toLowerCase().includes(q) && !p.memberId.toLowerCase().includes(q)) {
        return false;
      }
      if (typeFilter !== 'All' && p.paymentType !== typeFilter) return false;
      if (statusFilter !== 'All' && p.status !== statusFilter) return false;
      if (dateFrom && p.dateSubmitted < dateFrom) return false;
      if (dateTo && p.dateSubmitted > dateTo) return false;
      if (minVal > 0 && p.totalAmount < minVal) return false;
      return true;
    });
  }, [payments, search, typeFilter, statusFilter, dateFrom, dateTo, minAmount]);

  const totalPages = Math.max(1, Math.ceil(filteredPayments.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = filteredPayments.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const hasActiveFilters =
    search !== '' ||
    typeFilter !== 'All' ||
    statusFilter !== 'All' ||
    dateFrom !== '' ||
    dateTo !== '' ||
    minAmount !== '';

  const clearFilters = () => {
    setSearch('');
    setTypeFilter('All');
    setStatusFilter('All');
    setDateFrom('');
    setDateTo('');
    setMinAmount('');
    setPage(1);
  };

  const activePayment = useMemo(
    () => payments.find((p) => p.id === selectedPaymentIdForReview) ?? null,
    [payments, selectedPaymentIdForReview]
  );

  const activeMember = useMemo(
    () => (activePayment ? members.find((m) => m.id === activePayment.memberId) ?? null : null),
    [activePayment, members]
  );

  const openDrawer = (id: string) => {
    setSelectedPaymentIdForReview(id);
    setAdminNote('');
    setShowRejectBox(false);
    setRejectReason('');
    setRejectError('');
  };

  const closeDrawer = () => {
    setSelectedPaymentIdForReview(null);
    setShowRejectBox(false);
    setRejectReason('');
    setRejectError('');
  };

  const handleApprove = () => {
    if (!activePayment) return;
    approvePayment(activePayment.id, adminNote);
    closeDrawer();
  };

  const handleRejectConfirm = () => {
    if (!activePayment) return;
    if (!rejectReason.trim()) {
      setRejectError('Please provide a clear reason so the member knows what to correct.');
      return;
    }
    rejectPayment(activePayment.id, rejectReason);
    closeDrawer();
  };

  return (
    <div className="space-y-7">
      {/* Header */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Payment Verification</h2>
        <p className="text-[15px] text-slate-600 mt-1">
          Verify bank transfer receipts submitted by members. Approving a transfer updates Savings and Loan balances automatically.
        </p>
      </div>

      {/* THREE EXTRA-LARGE PROMINENT SUMMARY CARDS (Section 7) */}
      <section aria-label="Payment Verification Key Numbers" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <button
          type="button"
          onClick={() => {
            setStatusFilter(statusFilter === 'Pending' ? 'All' : 'Pending');
            setPage(1);
          }}
          className={`text-left rounded-2xl p-7 sm:p-8 border-2 transition-colors cursor-pointer ${
            statusFilter === 'Pending'
              ? 'bg-[#FFFBEB] border-[#D97706]'
              : 'bg-[#FFFBEB] border-[#FDE68A] hover:border-[#D97706]'
          }`}
        >
          <div className="flex items-start justify-between gap-4">
            <span className="text-lg font-bold text-[#92400E]">Pending Review</span>
            <div className="w-13 h-13 rounded-xl bg-white border border-[#FDE68A] flex items-center justify-center shrink-0">
              <Clock className="w-7 h-7 text-[#D97706]" />
            </div>
          </div>
          <p className="text-5xl font-extrabold font-mono tabular-nums text-slate-900 mt-5">
            {metrics.pendingPaymentsCount}
          </p>
          <p className="text-base font-medium text-[#92400E] mt-3">
            Transfers waiting for verification
          </p>
        </button>

        <div className="rounded-2xl p-7 sm:p-8 bg-white border-2 border-slate-200">
          <div className="flex items-start justify-between gap-4">
            <span className="text-lg font-bold text-slate-800">Pending Amount</span>
            <div className="w-13 h-13 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0">
              <Banknote className="w-7 h-7 text-[#D97706]" />
            </div>
          </div>
          <p className="text-4xl sm:text-5xl font-extrabold font-mono tabular-nums text-slate-900 mt-5">
            {formatNaira(metrics.pendingPaymentsAmount)}
          </p>
          <p className="text-base font-medium text-slate-600 mt-3">
            Total value awaiting verification
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setStatusFilter(statusFilter === 'Approved' ? 'All' : 'Approved');
            setPage(1);
          }}
          className={`text-left rounded-2xl p-7 sm:p-8 border-2 transition-colors cursor-pointer ${
            statusFilter === 'Approved'
              ? 'bg-[#ECFDF5] border-[#15803D]'
              : 'bg-[#ECFDF5] border-[#BBF7D0] hover:border-[#15803D]'
          }`}
        >
          <div className="flex items-start justify-between gap-4">
            <span className="text-lg font-bold text-[#14532D]">Approved This Month</span>
            <div className="w-13 h-13 rounded-xl bg-white border border-[#BBF7D0] flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-7 h-7 text-[#15803D]" />
            </div>
          </div>
          <p className="text-5xl font-extrabold font-mono tabular-nums text-slate-900 mt-5">
            {metrics.approvedThisMonth}
          </p>
          <p className="text-base font-medium text-[#14532D] mt-3">
            Payments successfully verified
          </p>
        </button>
      </section>

      {/* SEARCH AND FILTER AREA (Section 8) */}
      <section aria-label="Search and Filter Payments" className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">
          <SearchInput
            label="Search Member or ID"
            placeholder="Search Member or ID (e.g. John Ade or MB-00125)"
            value={search}
            onChange={(v) => {
              setSearch(v);
              setPage(1);
            }}
            className="lg:col-span-5"
          />

          <div className="lg:col-span-3">
            <label className="block text-sm font-semibold text-slate-800 mb-1.5">Payment Type</label>
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value as 'All' | PaymentType);
                setPage(1);
              }}
              className="w-full min-h-[46px] px-3.5 rounded-lg border border-slate-300 bg-white text-[15px] text-slate-900"
            >
              <option value="All">All Payment Types</option>
              <option value="Savings">Savings</option>
              <option value="Loan Repayment">Loan Repayment</option>
              <option value="Savings + Loan">Savings + Loan</option>
            </select>
          </div>

          <div className="lg:col-span-2">
            <label className="block text-sm font-semibold text-slate-800 mb-1.5">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as 'All' | PaymentStatus);
                setPage(1);
              }}
              className="w-full min-h-[46px] px-3.5 rounded-lg border border-slate-300 bg-white text-[15px] text-slate-900"
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          <div className="lg:col-span-2">
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
              placeholder="e.g. 50000"
              className="w-full min-h-[46px] px-3.5 rounded-lg border border-slate-300 bg-white text-[15px] font-mono text-slate-900"
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
                className="min-h-[42px] px-3 rounded-lg border border-slate-300 bg-white text-sm text-slate-900"
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
                className="min-h-[42px] px-3 rounded-lg border border-slate-300 bg-white text-sm text-slate-900"
              />
            </div>
          </div>

          {hasActiveFilters && (
            <Button
              variant="secondary"
              size="sm"
              onClick={clearFilters}
              icon={<RotateCcw className="w-4 h-4" />}
            >
              Clear Filters
            </Button>
          )}
        </div>
      </section>

      {/* PAYMENT VERIFICATION TABLE (Section 9) */}
      {filteredPayments.length === 0 ? (
        <EmptyState
          icon={<ClipboardCheck className="w-6 h-6" />}
          title="No matching payments found"
          description="No payment submissions match your current search or filter settings. Try clearing your filters to view all records."
          actionLabel={hasActiveFilters ? 'Clear Filters' : undefined}
          onAction={hasActiveFilters ? clearFilters : undefined}
        />
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-sm font-semibold text-slate-600">
                  <th className="py-4 px-5">Member</th>
                  <th className="py-4 px-4">Member ID</th>
                  <th className="py-4 px-4">Payment Type</th>
                  <th className="py-4 px-4 text-right">Amount</th>
                  <th className="py-4 px-4">Allocation</th>
                  <th className="py-4 px-4">Date</th>
                  <th className="py-4 px-4">Status</th>
                  <th className="py-4 px-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-[15px]">
                {paginated.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-5 font-semibold text-slate-900 whitespace-nowrap">
                      {p.memberName}
                    </td>
                    <td className="py-4 px-4 font-mono text-sm text-slate-600 whitespace-nowrap">
                      {p.memberId}
                    </td>
                    <td className="py-4 px-4 font-medium text-slate-800 whitespace-nowrap">
                      {p.paymentType}
                    </td>
                    <td className="py-4 px-4 text-right font-mono font-bold tabular-nums text-slate-900 whitespace-nowrap">
                      {formatNaira(p.totalAmount)}
                    </td>
                    <td className="py-4 px-4 font-mono text-sm tabular-nums text-slate-700 whitespace-nowrap">
                      {p.paymentType === 'Savings + Loan'
                        ? `${formatNaira(p.savingsAllocation)} + ${formatNaira(p.loanAllocation)}`
                        : p.paymentType === 'Savings'
                        ? `${formatNaira(p.savingsAllocation)} Savings`
                        : `${formatNaira(p.loanAllocation)} Loan`}
                    </td>
                    <td className="py-4 px-4 text-slate-700 whitespace-nowrap">
                      {formatCompactDate(p.dateSubmitted)}
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="py-4 px-5 text-right whitespace-nowrap">
                      {p.status === 'Pending' ? (
                        <Button size="sm" onClick={() => openDrawer(p.id)}>
                          Review
                        </Button>
                      ) : (
                        <Button variant="secondary" size="sm" onClick={() => openDrawer(p.id)}>
                          View Details
                        </Button>
                      )}
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
              totalItems={filteredPayments.length}
              pageSize={PAGE_SIZE}
              onPageChange={setPage}
            />
          </div>
        </div>
      )}

      {/* PAYMENT REVIEW SIDE DRAWER (Sections 10 & 11) */}
      <SideDrawer
        open={Boolean(activePayment)}
        onClose={closeDrawer}
        title={activePayment ? `Review Payment · ${activePayment.memberName}` : 'Review Payment'}
        subtitle={
          activePayment
            ? `${activePayment.memberId} · Submitted ${formatShortDate(activePayment.dateSubmitted)} at ${activePayment.submittedTime}`
            : undefined
        }
        widthClass="max-w-2xl"
        footer={
          activePayment && activePayment.status === 'Pending' ? (
            showRejectBox ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-1.5">
                    Reason for Rejecting Payment
                  </label>
                  <textarea
                    rows={2}
                    value={rejectReason}
                    onChange={(e) => {
                      setRejectReason(e.target.value);
                      setRejectError('');
                    }}
                    placeholder="Example: Receipt reference could not be matched on the cooperative bank statement."
                    className="w-full p-3 rounded-lg border border-slate-300 bg-white text-[15px] text-slate-900"
                  />
                  {rejectError && <p className="text-sm font-medium text-[#B91C1C] mt-1">{rejectError}</p>}
                </div>
                <div className="flex flex-wrap items-center justify-end gap-3">
                  <Button variant="secondary" onClick={() => setShowRejectBox(false)}>
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleRejectConfirm}
                    icon={<XCircle className="w-4 h-4" />}
                  >
                    Confirm Rejection
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap items-center justify-between gap-3">
                <Button
                  variant="destructive"
                  onClick={() => setShowRejectBox(true)}
                  icon={<XCircle className="w-4 h-4" />}
                >
                  Reject Payment
                </Button>
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleApprove}
                  icon={<CheckCircle2 className="w-5 h-5" />}
                >
                  Approve Payment
                </Button>
              </div>
            )
          ) : undefined
        }
      >
        {activePayment && activeMember && (
          <div className="space-y-6">
            {/* Status & Header Strip */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200">
              <div>
                <p className="text-sm text-slate-500">Payment Type</p>
                <p className="text-lg font-bold text-slate-900 mt-0.5">{activePayment.paymentType}</p>
              </div>
              <StatusBadge status={activePayment.status} />
            </div>

            {/* Single Payment Allocation Emphasis (Section 11) */}
            <div className="rounded-xl bg-[#ECFDF5] border border-[#BBF7D0] p-5 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-[#14532D] inline-flex items-center gap-1.5">
                    <Split className="w-4 h-4 text-[#15803D]" />
                    Single Transfer Allocation
                  </p>
                  <p className="text-sm text-[#166534] mt-0.5">
                    One transfer. Multiple allocations. No need to pay twice.
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold text-[#14532D]">Total Payment</p>
                  <p className="text-2xl font-extrabold font-mono tabular-nums text-slate-900">
                    {formatNaira(activePayment.totalAmount)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-[#BBF7D0]">
                <div className="bg-white rounded-lg p-4 border border-[#BBF7D0]">
                  <p className="text-sm font-semibold text-slate-600">Allocated to Savings</p>
                  <p className="text-2xl font-bold font-mono tabular-nums text-[#15803D] mt-1">
                    {formatNaira(activePayment.savingsAllocation)}
                  </p>
                  {activePayment.status === 'Pending' && activePayment.savingsAllocation > 0 && (
                    <p className="text-sm text-slate-700 mt-2 font-mono tabular-nums flex items-center gap-1.5">
                      <span>{formatNaira(activeMember.savingsBalance)}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#15803D]" />
                      <strong className="text-[#15803D]">
                        {formatNaira(activeMember.savingsBalance + activePayment.savingsAllocation)}
                      </strong>
                    </p>
                  )}
                </div>

                <div className="bg-white rounded-lg p-4 border border-[#BBF7D0]">
                  <p className="text-sm font-semibold text-slate-600">Allocated to Loan Repayment</p>
                  <p className="text-2xl font-bold font-mono tabular-nums text-slate-900 mt-1">
                    {formatNaira(activePayment.loanAllocation)}
                  </p>
                  {activePayment.status === 'Pending' && activePayment.loanAllocation > 0 && (
                    <p className="text-sm text-slate-700 mt-2 font-mono tabular-nums flex items-center gap-1.5">
                      <span>{formatNaira(activeMember.loanBalance)}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#15803D]" />
                      <strong className="text-[#15803D]">
                        {formatNaira(Math.max(0, activeMember.loanBalance - activePayment.loanAllocation))}
                      </strong>
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Member Current Balances */}
            <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <p className="text-sm text-slate-600">Current Savings Balance</p>
                <p className="text-xl font-bold font-mono tabular-nums text-slate-900 mt-0.5">
                  {formatNaira(activeMember.savingsBalance)}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Current Loan Balance</p>
                <p className="text-xl font-bold font-mono tabular-nums text-slate-900 mt-0.5">
                  {formatNaira(activeMember.loanBalance)}
                </p>
              </div>
            </div>

            {/* Payment Description */}
            <div>
              <p className="text-sm font-semibold text-slate-800">Member Payment Note</p>
              <p className="text-[15px] text-slate-700 mt-1 bg-slate-50 border border-slate-200 rounded-lg p-3.5">
                {activePayment.description}
              </p>
            </div>

            {/* Uploaded Receipt Preview */}
            <ReceiptPreview payment={activePayment} />

            {/* Admin Note */}
            {activePayment.status === 'Pending' ? (
              <div>
                <label htmlFor="admin-payment-note" className="block text-sm font-semibold text-slate-800 mb-1.5">
                  Add Note (Optional)
                </label>
                <textarea
                  id="admin-payment-note"
                  rows={2}
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder="Example: Verified against First Bank credit alert."
                  className="w-full p-3 rounded-lg border border-slate-300 text-[15px] text-slate-900"
                />
              </div>
            ) : (
              activePayment.adminNote && (
                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                  <p className="text-sm font-semibold text-slate-800">Administrator Note</p>
                  <p className="text-[15px] text-slate-700 mt-1">{activePayment.adminNote}</p>
                </div>
              )
            )}
          </div>
        )}
      </SideDrawer>
    </div>
  );
}
