import React, { useState } from 'react';
import {
  ArrowRight,
  Bell,
  CalendarClock,
  CheckCircle2,
  CreditCard,
  FilePlus2,
  FileText,
  PiggyBank,
  ShieldAlert,
  Wallet,
  XCircle,
} from 'lucide-react';
import {
  formatNaira,
  formatShortDate,
  getMembershipMonths,
} from '../../data/seedData';
import { useCooperative } from '../../store/CooperativeContext';
import { PaymentSubmission } from '../../types/cooperative';
import { Button, Modal, ReceiptPreview, StatusBadge } from '../ui/DesignSystem';

export function MemberDashboardOverview() {
  const {
    currentMember,
    loans,
    payments,
    loanApplications,
    transactions,
    notifications,
    setMemberSection,
    setIsMakePaymentDrawerOpen,
    respondAsGuarantor,
  } = useCooperative();

  const [previewReceiptPayment, setPreviewReceiptPayment] = useState<PaymentSubmission | null>(null);
  const [declineAppId, setDeclineAppId] = useState<string | null>(null);
  const [declineReason, setDeclineReason] = useState('');

  if (!currentMember) return null;

  const activeLoan = loans.find(
    (l) => l.memberId === currentMember.id && l.status === 'Active'
  );
  const memberPayments = payments.filter((p) => p.memberId === currentMember.id);
  const memberTxns = transactions
    .filter((t) => t.memberId === currentMember.id)
    .slice(0, 5);
  const memberNotifs = notifications
    .filter((n) => n.audience === 'member' && n.memberId === currentMember.id)
    .slice(0, 4);

  const guarantorRequests = loanApplications.filter(
    (app) =>
      (app.guarantor1.memberId === currentMember.id && app.guarantor1.status === 'Pending') ||
      (app.guarantor2.memberId === currentMember.id && app.guarantor2.status === 'Pending')
  );

  const months = getMembershipMonths(currentMember.membershipDate);
  const isEligibleForLoan = months >= 6;

  return (
    <div className="space-y-8">
      {/* Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Welcome, {currentMember.fullName}
          </h2>
          <p className="text-[15px] text-slate-600 mt-1">
            Member ID <span className="font-mono font-semibold text-slate-800">{currentMember.id}</span> · Here is a clear view of your cooperative savings and loan.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button
            size="lg"
            variant="primary"
            onClick={() => setIsMakePaymentDrawerOpen(true)}
            icon={<CreditCard className="w-5 h-5" />}
          >
            Make Payment
          </Button>
          <Button
            size="lg"
            variant="secondary"
            onClick={() => setMemberSection('apply-loan')}
            icon={<FilePlus2 className="w-5 h-5" />}
          >
            Apply for Loan
          </Button>
        </div>
      </div>

      {/* Pending Guarantor Request Banner (Section 18) */}
      {guarantorRequests.length > 0 && (
        <section aria-label="Guarantor Requests" className="space-y-4">
          {guarantorRequests.map((app) => (
            <div
              key={app.id}
              className="rounded-xl bg-[#FFFBEB] border-2 border-[#FDE68A] p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-5"
            >
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 text-sm font-bold text-[#92400E]">
                  <ShieldAlert className="w-5 h-5 text-[#D97706]" />
                  <span>Guarantor Approval Requested</span>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                  {app.applicantName} has selected you as a guarantor for a {formatNaira(app.amount)} loan.
                </h3>
                <p className="text-[15px] text-slate-700">
                  Purpose: <strong>{app.purpose}</strong> · Repayment Period:{' '}
                  <strong>{app.repaymentPeriodMonths} Months</strong> · Applied{' '}
                  {formatShortDate(app.dateSubmitted)}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setDeclineAppId(app.id);
                    setDeclineReason('');
                  }}
                  icon={<XCircle className="w-4 h-4 text-[#DC2626]" />}
                >
                  Decline
                </Button>
                <Button
                  variant="primary"
                  onClick={() => respondAsGuarantor(app.id, currentMember.id, 'Approved')}
                  icon={<CheckCircle2 className="w-4 h-4" />}
                >
                  Approve as Guarantor
                </Button>
              </div>
            </div>
          ))}
        </section>
      )}

      {/* TWO MAJOR PROMINENT FINANCIAL CARDS (Section 12) */}
      <section aria-label="My Financial Summary" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* MY SAVINGS */}
        <div className="bg-white border-2 border-[#BBF7D0] rounded-2xl p-7 sm:p-8 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-base font-bold text-[#14532D]">MY SAVINGS</p>
                <p className="text-sm text-slate-600 mt-0.5">Current Savings Balance</p>
              </div>
              <div className="w-13 h-13 rounded-xl bg-[#ECFDF5] border border-[#BBF7D0] flex items-center justify-center shrink-0">
                <PiggyBank className="w-7 h-7 text-[#15803D]" />
              </div>
            </div>

            <p className="text-4xl sm:text-5xl font-extrabold font-mono tabular-nums text-slate-900 mt-6">
              {formatNaira(currentMember.savingsBalance)}
            </p>
            <p className="text-[15px] text-slate-600 mt-3">
              Total contributed: <strong className="font-mono text-slate-900">{formatNaira(currentMember.totalContributed)}</strong> across{' '}
              <strong>{currentMember.contributionCount}</strong> contributions
            </p>
          </div>

          <div className="mt-6 pt-5 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setMemberSection('my-savings')}
              className="text-[15px] font-bold text-[#15803D] hover:text-[#166534] inline-flex items-center gap-1.5 cursor-pointer"
            >
              <span>View Savings History</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <Button size="sm" variant="soft-green" onClick={() => setIsMakePaymentDrawerOpen(true)}>
              Add to Savings
            </Button>
          </div>
        </div>

        {/* MY LOAN */}
        <div className="bg-white border-2 border-slate-200 rounded-2xl p-7 sm:p-8 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-base font-bold text-slate-800">MY LOAN</p>
                <p className="text-sm text-slate-600 mt-0.5">Outstanding Loan</p>
              </div>
              <div className="w-13 h-13 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                <Wallet className="w-7 h-7 text-slate-700" />
              </div>
            </div>

            <p className="text-4xl sm:text-5xl font-extrabold font-mono tabular-nums text-slate-900 mt-6">
              {formatNaira(currentMember.loanBalance)}
            </p>
            {activeLoan ? (
              <p className="text-[15px] text-slate-600 mt-3">
                Borrowed <strong className="font-mono text-slate-900">{formatNaira(activeLoan.originalAmount)}</strong> · Repaid{' '}
                <strong className="font-mono text-[#15803D]">{formatNaira(activeLoan.amountRepaid)}</strong> ({activeLoan.paymentsMade} of {activeLoan.repaymentPeriodMonths} months)
              </p>
            ) : (
              <p className="text-[15px] text-slate-600 mt-3">
                {isEligibleForLoan
                  ? 'You currently have no outstanding loan. You are eligible to apply for a loan.'
                  : 'You currently have no outstanding loan. Loan eligibility begins after 6 months of membership.'}
              </p>
            )}
          </div>

          <div className="mt-6 pt-5 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setMemberSection('my-loan')}
              className="text-[15px] font-bold text-slate-800 hover:text-[#15803D] inline-flex items-center gap-1.5 cursor-pointer"
            >
              <span>{activeLoan ? 'View Repayment Schedule' : 'Check Loan Eligibility'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            {activeLoan ? (
              <Button size="sm" variant="secondary" onClick={() => setIsMakePaymentDrawerOpen(true)}>
                Repay Loan
              </Button>
            ) : (
              <Button size="sm" variant="secondary" onClick={() => setMemberSection('apply-loan')}>
                Apply for Loan
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Next Repayment Strip (when active loan exists) */}
      {activeLoan && (
        <section className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#ECFDF5] border border-[#BBF7D0] flex items-center justify-center shrink-0">
              <CalendarClock className="w-6 h-6 text-[#15803D]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-600">Next Scheduled Loan Repayment</p>
              <p className="text-xl font-bold text-slate-900 mt-0.5">
                <span className="font-mono tabular-nums">{formatNaira(activeLoan.nextRepaymentAmount)}</span> due on{' '}
                {formatShortDate(activeLoan.nextRepaymentDate)}
              </p>
              <p className="text-sm text-slate-600 mt-1">
                Tip: You can send one bank transfer and split it between Savings and Loan Repayment at the same time.
              </p>
            </div>
          </div>
          <Button onClick={() => setIsMakePaymentDrawerOpen(true)}>Make Combined Payment</Button>
        </section>
      )}

      {/* Payment Status Tracking (Section 33) */}
      <section aria-label="My Payment Tracking" className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-slate-900">My Submitted Payments &amp; Verification Status</h3>
            <p className="text-sm text-slate-600">
              Track whether your bank transfers have been confirmed by the cooperative administrator.
            </p>
          </div>
          <Button size="sm" variant="soft-green" onClick={() => setIsMakePaymentDrawerOpen(true)}>
            Submit New Payment
          </Button>
        </div>

        {memberPayments.length === 0 ? (
          <div className="p-8 text-center text-[15px] text-slate-600">
            You have not submitted any bank transfer receipts yet. Click <strong>Make Payment</strong> to upload a transfer receipt.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-sm font-semibold text-slate-600">
                  <th className="py-3.5 px-6">Date Submitted</th>
                  <th className="py-3.5 px-4">Purpose</th>
                  <th className="py-3.5 px-4 text-right">Amount</th>
                  <th className="py-3.5 px-4">Allocation</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Admin Note</th>
                  <th className="py-3.5 px-6 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-[15px]">
                {memberPayments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="py-4 px-6 text-slate-700 whitespace-nowrap">
                      {formatShortDate(p.dateSubmitted)}
                    </td>
                    <td className="py-4 px-4 font-semibold text-slate-900 whitespace-nowrap">
                      {p.paymentType}
                    </td>
                    <td className="py-4 px-4 text-right font-mono font-bold tabular-nums text-slate-900 whitespace-nowrap">
                      {formatNaira(p.totalAmount)}
                    </td>
                    <td className="py-4 px-4 text-sm font-mono tabular-nums text-slate-700 whitespace-nowrap">
                      {p.paymentType === 'Savings + Loan'
                        ? `Savings ${formatNaira(p.savingsAllocation)} + Loan ${formatNaira(p.loanAllocation)}`
                        : p.paymentType === 'Savings'
                        ? `Savings ${formatNaira(p.savingsAllocation)}`
                        : `Loan ${formatNaira(p.loanAllocation)}`}
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="py-4 px-4 text-sm text-slate-600 max-w-xs">
                      {p.adminNote || (p.status === 'Pending' ? 'Awaiting administrator check' : '—')}
                    </td>
                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => setPreviewReceiptPayment(p)}
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#15803D] hover:underline cursor-pointer"
                      >
                        <FileText className="w-4 h-4" />
                        <span>View Receipt</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Bottom 2-Column: Recent Activity & Important Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-lg font-bold text-slate-900">Recent Activity</h3>
            <button
              type="button"
              onClick={() => setMemberSection('transactions')}
              className="text-sm font-semibold text-[#15803D] hover:underline cursor-pointer"
            >
              All Transactions
            </button>
          </div>
          {memberTxns.length === 0 ? (
            <p className="text-[15px] text-slate-600 py-4">No transactions recorded yet.</p>
          ) : (
            <div className="divide-y divide-slate-200">
              {memberTxns.map((t) => (
                <div key={t.id} className="py-3.5 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[15px] font-semibold text-slate-900 truncate">{t.description}</p>
                    <p className="text-sm text-slate-500">
                      {formatShortDate(t.date)} · {t.status}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p
                      className={`font-mono font-bold tabular-nums text-[15px] ${
                        t.direction === 'Added' ? 'text-[#15803D]' : 'text-slate-900'
                      }`}
                    >
                      {t.direction === 'Added' ? '+' : '-'}
                      {formatNaira(t.amount)}
                    </p>
                    <p className="text-xs text-slate-500 font-mono">
                      Bal: {formatNaira(t.resultingBalance)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Bell className="w-5 h-5 text-[#15803D]" />
              Important Notifications
            </h3>
            <button
              type="button"
              onClick={() => setMemberSection('notifications')}
              className="text-sm font-semibold text-[#15803D] hover:underline cursor-pointer"
            >
              View All
            </button>
          </div>
          {memberNotifs.length === 0 ? (
            <p className="text-[15px] text-slate-600 py-4">You have no new notifications.</p>
          ) : (
            <div className="divide-y divide-slate-200">
              {memberNotifs.map((n) => (
                <div key={n.id} className="py-3.5 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[15px] font-bold text-slate-900">{n.title}</p>
                    <span className="text-xs text-slate-500">{n.createdAt}</span>
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed">{n.message}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Receipt Preview Modal */}
      <Modal
        open={Boolean(previewReceiptPayment)}
        onClose={() => setPreviewReceiptPayment(null)}
        title="Submitted Payment Receipt"
        maxWidth="max-w-xl"
      >
        {previewReceiptPayment && <ReceiptPreview payment={previewReceiptPayment} />}
      </Modal>

      {/* Decline Guarantor Modal */}
      <Modal
        open={Boolean(declineAppId)}
        onClose={() => setDeclineAppId(null)}
        title="Decline Guarantor Request"
      >
        <div className="space-y-4">
          <p className="text-[15px] text-slate-700">
            You may optionally share a brief reason for declining this guarantor request.
          </p>
          <textarea
            rows={3}
            value={declineReason}
            onChange={(e) => setDeclineReason(e.target.value)}
            placeholder="Optional reason (e.g. Already guaranteeing another cooperative loan)"
            className="w-full p-3 rounded-lg border border-slate-300 text-[15px]"
          />
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setDeclineAppId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (declineAppId) {
                  respondAsGuarantor(declineAppId, currentMember.id, 'Declined', declineReason);
                }
                setDeclineAppId(null);
              }}
            >
              Confirm Decline
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
