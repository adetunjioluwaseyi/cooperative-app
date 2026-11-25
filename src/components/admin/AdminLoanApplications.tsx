import React, { useMemo, useState } from 'react';
import {
  Banknote,
  CheckCircle2,
  Clock,
  FilePlus2,
  ShieldCheck,
  XCircle,
} from 'lucide-react';
import { formatNaira, formatShortDate } from '../../data/seedData';
import { useCooperative } from '../../store/CooperativeContext';
import { LoanApplication, LoanApplicationStatus } from '../../types/cooperative';
import {
  Button,
  EmptyState,
  SearchInput,
  SideDrawer,
  StatusBadge,
} from '../ui/DesignSystem';

const ALL_APP_STATUSES: LoanApplicationStatus[] = [
  'Awaiting Guarantors',
  'Guarantor 1 Approved',
  'Guarantor 2 Approved',
  'Guarantor Declined',
  'Pending Admin Approval',
  'Approved',
  'Rejected',
  'Disbursed',
  'Repaid',
];

export function AdminLoanApplications() {
  const {
    loanApplications,
    selectedLoanAppIdForReview,
    setSelectedLoanAppIdForReview,
    adminApproveLoanApp,
    adminRejectLoanApp,
    adminDisburseLoanApp,
  } = useCooperative();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | LoanApplicationStatus>('All');
  const [adminNote, setAdminNote] = useState('');
  const [rejectMode, setRejectMode] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return loanApplications.filter((a) => {
      if (q && !a.applicantName.toLowerCase().includes(q) && !a.applicantId.toLowerCase().includes(q)) {
        return false;
      }
      if (statusFilter !== 'All' && a.status !== statusFilter) return false;
      return true;
    });
  }, [loanApplications, search, statusFilter]);

  const activeApp: LoanApplication | null = useMemo(
    () => loanApplications.find((a) => a.id === selectedLoanAppIdForReview) ?? null,
    [loanApplications, selectedLoanAppIdForReview]
  );

  const openApp = (id: string) => {
    setSelectedLoanAppIdForReview(id);
    setAdminNote('');
    setRejectMode(false);
    setRejectReason('');
  };

  const closeApp = () => {
    setSelectedLoanAppIdForReview(null);
    setRejectMode(false);
    setRejectReason('');
  };

  const bothGuarantorsApproved =
    activeApp &&
    activeApp.guarantor1.status === 'Approved' &&
    activeApp.guarantor2.status === 'Approved';

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Loan Applications</h2>
        <p className="text-[15px] text-slate-600 mt-1">
          Track every loan request from guarantor confirmation to administrator approval and disbursement. Applications only move to Admin after both guarantors approve.
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col md:flex-row md:items-end gap-4">
        <SearchInput
          label="Search Member or ID"
          placeholder="Search applicant name or ID"
          value={search}
          onChange={setSearch}
          className="flex-1"
        />
        <div className="w-full md:w-72">
          <label className="block text-sm font-semibold text-slate-800 mb-1.5">Application Stage</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'All' | LoanApplicationStatus)}
            className="w-full min-h-[46px] px-3.5 rounded-lg border border-slate-300 bg-white text-[15px] text-slate-900"
          >
            <option value="All">All Stages ({loanApplications.length})</option>
            {ALL_APP_STATUSES.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<FilePlus2 className="w-6 h-6" />}
          title="No loan applications found"
          description="No loan applications match your selected stage or search term."
          actionLabel="Show All Applications"
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
                  <th className="py-4 px-5">Applicant</th>
                  <th className="py-4 px-4 text-right">Amount</th>
                  <th className="py-4 px-4">Period</th>
                  <th className="py-4 px-4">Guarantors</th>
                  <th className="py-4 px-4">Submitted</th>
                  <th className="py-4 px-4">Stage / Status</th>
                  <th className="py-4 px-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-[15px]">
                {filtered.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50">
                    <td className="py-4 px-5">
                      <p className="font-bold text-slate-900">{app.applicantName}</p>
                      <p className="text-xs font-mono text-slate-500">
                        {app.applicantId} · {app.purpose}
                      </p>
                    </td>
                    <td className="py-4 px-4 text-right font-mono font-bold tabular-nums text-slate-900 whitespace-nowrap">
                      {formatNaira(app.amount)}
                    </td>
                    <td className="py-4 px-4 text-slate-700 whitespace-nowrap">
                      {app.repaymentPeriodMonths} Months
                    </td>
                    <td className="py-4 px-4 text-sm text-slate-700">
                      <div>
                        1. {app.guarantor1.memberName}{' '}
                        <span className="font-semibold">({app.guarantor1.status})</span>
                      </div>
                      <div>
                        2. {app.guarantor2.memberName}{' '}
                        <span className="font-semibold">({app.guarantor2.status})</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-slate-700 whitespace-nowrap">
                      {formatShortDate(app.dateSubmitted)}
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <StatusBadge status={app.status} />
                    </td>
                    <td className="py-4 px-5 text-right whitespace-nowrap">
                      <Button
                        variant={
                          app.status === 'Pending Admin Approval' || app.status === 'Approved'
                            ? 'primary'
                            : 'secondary'
                        }
                        size="sm"
                        onClick={() => openApp(app.id)}
                      >
                        {app.status === 'Pending Admin Approval'
                          ? 'Review'
                          : app.status === 'Approved'
                          ? 'Disburse'
                          : 'View'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* LOAN APPLICATION REVIEW DRAWER */}
      <SideDrawer
        open={Boolean(activeApp)}
        onClose={closeApp}
        title={activeApp ? `Loan Application · ${activeApp.applicantName}` : 'Loan Application'}
        subtitle={
          activeApp
            ? `${activeApp.id} · ${activeApp.applicantId} · Submitted ${formatShortDate(activeApp.dateSubmitted)}`
            : undefined
        }
        widthClass="max-w-2xl"
        footer={
          activeApp && activeApp.status === 'Pending Admin Approval' ? (
            rejectMode ? (
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-slate-900">
                  Reason for Rejecting Loan Application
                </label>
                <textarea
                  rows={2}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Provide a clear reason for the applicant..."
                  className="w-full p-3 rounded-lg border border-slate-300 bg-white text-[15px]"
                />
                <div className="flex justify-end gap-3">
                  <Button variant="secondary" onClick={() => setRejectMode(false)}>
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      adminRejectLoanApp(activeApp.id, rejectReason || 'Application did not meet credit criteria.');
                      closeApp();
                    }}
                  >
                    Confirm Rejection
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap items-center justify-between gap-3">
                <Button
                  variant="destructive"
                  onClick={() => setRejectMode(true)}
                  icon={<XCircle className="w-4 h-4" />}
                >
                  Reject Loan
                </Button>
                <Button
                  size="lg"
                  onClick={() => adminApproveLoanApp(activeApp.id, adminNote)}
                  icon={<CheckCircle2 className="w-5 h-5" />}
                >
                  Approve Loan
                </Button>
              </div>
            )
          ) : activeApp && activeApp.status === 'Approved' ? (
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-slate-700">
                Approved and ready to disburse funds to member.
              </p>
              <Button
                size="lg"
                onClick={() => {
                  adminDisburseLoanApp(activeApp.id, adminNote);
                  closeApp();
                }}
                icon={<Banknote className="w-5 h-5" />}
              >
                Disburse {formatNaira(activeApp.amount)}
              </Button>
            </div>
          ) : undefined
        }
      >
        {activeApp && (
          <div className="space-y-6">
            <div className="flex items-center justify-between gap-3 pb-4 border-b border-slate-200">
              <div>
                <p className="text-sm text-slate-500">Requested Loan Amount</p>
                <p className="text-3xl font-extrabold font-mono tabular-nums text-slate-900 mt-0.5">
                  {formatNaira(activeApp.amount)}
                </p>
              </div>
              <StatusBadge status={activeApp.status} />
            </div>

            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 border border-slate-200 rounded-xl p-5 text-sm">
              <div>
                <dt className="text-slate-500">Applicant</dt>
                <dd className="font-bold text-slate-900 text-base mt-0.5">
                  {activeApp.applicantName} ({activeApp.applicantId})
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Repayment Period</dt>
                <dd className="font-bold text-slate-900 text-base mt-0.5">
                  {activeApp.repaymentPeriodMonths} Months (1% reducing balance)
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-slate-500">Purpose of Loan</dt>
                <dd className="font-semibold text-slate-900 text-base mt-0.5">{activeApp.purpose}</dd>
              </div>
            </dl>

            {/* Guarantor Approvals Section */}
            <div className="space-y-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#15803D]" />
                Guarantor Confirmations (2 Required)
              </h3>
              {[
                { label: 'Guarantor 1', slot: activeApp.guarantor1 },
                { label: 'Guarantor 2', slot: activeApp.guarantor2 },
              ].map(({ label, slot }) => (
                <div
                  key={label}
                  className="p-4 rounded-xl border border-slate-200 bg-white flex flex-wrap items-center justify-between gap-3"
                >
                  <div>
                    <p className="text-xs font-semibold text-slate-500">{label}</p>
                    <p className="text-base font-bold text-slate-900 mt-0.5">
                      {slot.memberName}{' '}
                      <span className="font-mono text-sm font-normal text-slate-500">
                        ({slot.memberId})
                      </span>
                    </p>
                    {slot.reason && (
                      <p className="text-sm text-[#991B1B] mt-1">Reason: {slot.reason}</p>
                    )}
                  </div>
                  <StatusBadge status={slot.status} />
                </div>
              ))}

              {!bothGuarantorsApproved &&
                activeApp.status !== 'Disbursed' &&
                activeApp.status !== 'Rejected' && (
                  <div className="p-4 rounded-xl bg-[#FFFBEB] border border-[#FDE68A] text-[#92400E] text-sm font-medium flex items-start gap-2.5">
                    <Clock className="w-5 h-5 shrink-0 mt-0.5" />
                    <p>
                      Administrator approval is locked until both selected guarantors approve this request. (Tip: Switch to the guarantor’s dashboard from the top-right Portal Switcher to test approving as a guarantor!)
                    </p>
                  </div>
                )}
            </div>

            {(activeApp.status === 'Pending Admin Approval' || activeApp.status === 'Approved') && (
              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                  Administrator Note (Optional)
                </label>
                <textarea
                  rows={2}
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder="Add an approval or disbursement note..."
                  className="w-full p-3 rounded-lg border border-slate-300 text-[15px]"
                />
              </div>
            )}

            {activeApp.adminNote && (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <p className="text-xs font-semibold text-slate-500">Administrator Record Note</p>
                <p className="text-[15px] text-slate-800 mt-1">{activeApp.adminNote}</p>
              </div>
            )}
          </div>
        )}
      </SideDrawer>
    </div>
  );
}
