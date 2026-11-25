import React, { useState } from 'react';
import { Bell, CheckCheck, CheckCircle2, XCircle } from 'lucide-react';
import { formatNaira, formatShortDate } from '../../data/seedData';
import { useCooperative } from '../../store/CooperativeContext';
import { Button, EmptyState, Modal, StatusBadge } from '../ui/DesignSystem';

export function MemberNotifications() {
  const {
    currentMember,
    notifications,
    loanApplications,
    respondAsGuarantor,
    markNotificationRead,
    markAllNotificationsRead,
  } = useCooperative();

  const [declineAppId, setDeclineAppId] = useState<string | null>(null);
  const [declineReason, setDeclineReason] = useState('');

  if (!currentMember) return null;

  const memberNotifs = notifications.filter(
    (n) => n.audience === 'member' && n.memberId === currentMember.id
  );
  const unreadCount = memberNotifs.filter((n) => !n.read).length;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Notifications</h2>
          <p className="text-[15px] text-slate-600 mt-1">
            Payment confirmations, guarantor requests, and loan updates in plain language.
          </p>
        </div>
        {unreadCount > 0 && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => markAllNotificationsRead('member', currentMember.id)}
            icon={<CheckCheck className="w-4 h-4" />}
          >
            Mark All as Read
          </Button>
        )}
      </div>

      {memberNotifs.length === 0 ? (
        <EmptyState
          icon={<Bell className="w-6 h-6" />}
          title="No notifications yet"
          description="You will receive clear notifications here whenever your payments are confirmed, loans are approved, or another member requests you as a guarantor."
        />
      ) : (
        <div className="space-y-4">
          {memberNotifs.map((n) => {
            const linkedApp =
              n.actionType === 'guarantor_request' && n.targetId
                ? loanApplications.find((a) => a.id === n.targetId)
                : null;

            const isPendingForMe =
              linkedApp &&
              ((linkedApp.guarantor1.memberId === currentMember.id &&
                linkedApp.guarantor1.status === 'Pending') ||
                (linkedApp.guarantor2.memberId === currentMember.id &&
                  linkedApp.guarantor2.status === 'Pending'));

            return (
              <div
                key={n.id}
                className={`rounded-xl border p-5 sm:p-6 space-y-4 ${
                  isPendingForMe
                    ? 'bg-[#FFFBEB] border-2 border-[#FDE68A]'
                    : n.read
                    ? 'bg-white border-slate-200'
                    : 'bg-slate-50 border-slate-300'
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h3 className="text-lg font-bold text-slate-900">{n.title}</h3>
                      {n.statusLabel && <StatusBadge status={n.statusLabel} />}
                    </div>
                    <p className="text-[15px] text-slate-800 leading-relaxed">{n.message}</p>
                  </div>
                  <span className="text-sm text-slate-500 whitespace-nowrap">{n.createdAt}</span>
                </div>

                {/* Detailed Guarantor Request Details & Live Actions (Section 18) */}
                {linkedApp && (
                  <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-4">
                    <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                      <div>
                        <dt className="text-slate-500">Applicant Name</dt>
                        <dd className="font-bold text-slate-900">{linkedApp.applicantName}</dd>
                      </div>
                      <div>
                        <dt className="text-slate-500">Loan Amount</dt>
                        <dd className="font-mono font-bold text-slate-900">
                          {formatNaira(linkedApp.amount)}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-slate-500">Repayment Period</dt>
                        <dd className="font-semibold text-slate-900">
                          {linkedApp.repaymentPeriodMonths} Months
                        </dd>
                      </div>
                      <div>
                        <dt className="text-slate-500">Application Date</dt>
                        <dd className="font-semibold text-slate-900">
                          {formatShortDate(linkedApp.dateSubmitted)}
                        </dd>
                      </div>
                      <div className="sm:col-span-2 lg:col-span-4">
                        <dt className="text-slate-500">Loan Purpose</dt>
                        <dd className="font-semibold text-slate-900">{linkedApp.purpose}</dd>
                      </div>
                    </dl>

                    {isPendingForMe ? (
                      <div className="flex flex-wrap items-center justify-end gap-3 pt-2 border-t border-slate-100">
                        <Button
                          variant="secondary"
                          onClick={() => {
                            setDeclineAppId(linkedApp.id);
                            setDeclineReason('');
                          }}
                          icon={<XCircle className="w-4 h-4 text-[#DC2626]" />}
                        >
                          Decline
                        </Button>
                        <Button
                          variant="primary"
                          onClick={() =>
                            respondAsGuarantor(linkedApp.id, currentMember.id, 'Approved')
                          }
                          icon={<CheckCircle2 className="w-4 h-4" />}
                        >
                          Approve
                        </Button>
                      </div>
                    ) : (
                      <p className="text-sm font-semibold text-slate-600 pt-2 border-t border-slate-100">
                        Current Application Stage: <strong className="text-slate-900">{linkedApp.status}</strong>
                      </p>
                    )}
                  </div>
                )}

                {!n.read && !isPendingForMe && (
                  <div className="flex justify-end">
                    <Button variant="ghost" size="sm" onClick={() => markNotificationRead(n.id)}>
                      Mark as Read
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <Modal
        open={Boolean(declineAppId)}
        onClose={() => setDeclineAppId(null)}
        title="Decline Guarantor Request"
      >
        <div className="space-y-4">
          <p className="text-[15px] text-slate-700">
            Optionally provide a brief reason for declining this guarantor request.
          </p>
          <textarea
            rows={3}
            value={declineReason}
            onChange={(e) => setDeclineReason(e.target.value)}
            placeholder="Optional reason..."
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
