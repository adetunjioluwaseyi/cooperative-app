import React from 'react';
import { ArrowRight, Bell, CheckCheck } from 'lucide-react';
import { formatNaira } from '../../data/seedData';
import { useCooperative } from '../../store/CooperativeContext';
import { Button, EmptyState, StatusBadge } from '../ui/DesignSystem';

export function AdminNotifications() {
  const {
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    setAdminSection,
    setSelectedPaymentIdForReview,
    setSelectedLoanAppIdForReview,
  } = useCooperative();

  const adminNotifs = notifications.filter((n) => n.audience === 'admin');
  const unreadCount = adminNotifs.filter((n) => !n.read).length;

  const handleAction = (n: (typeof adminNotifs)[number]) => {
    markNotificationRead(n.id);
    if (n.actionType === 'review_payment' && n.targetId) {
      setSelectedPaymentIdForReview(n.targetId);
      setAdminSection('payments');
    } else if (n.actionType === 'review_loan_app' && n.targetId) {
      setSelectedLoanAppIdForReview(n.targetId);
      setAdminSection('loan-applications');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Notifications</h2>
          <p className="text-[15px] text-slate-600 mt-1">
            Important alerts and quick actions for incoming payment receipts, guarantor completions, and member registrations.
          </p>
        </div>
        {unreadCount > 0 && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => markAllNotificationsRead('admin')}
            icon={<CheckCheck className="w-4 h-4" />}
          >
            Mark All as Read
          </Button>
        )}
      </div>

      {adminNotifs.length === 0 ? (
        <EmptyState
          icon={<Bell className="w-6 h-6" />}
          title="No notifications yet"
          description="You will be alerted here whenever members submit payment receipts, complete guarantor approvals, or join the cooperative."
        />
      ) : (
        <div className="space-y-3.5">
          {adminNotifs.map((n) => (
            <div
              key={n.id}
              className={`rounded-xl border p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4 transition-colors ${
                n.read ? 'bg-white border-slate-200' : 'bg-[#F8FAFC] border-slate-300'
              }`}
            >
              <div className="space-y-2 flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h3 className="text-base font-bold text-slate-900">{n.title}</h3>
                  {n.statusLabel && <StatusBadge status={n.statusLabel} />}
                  {!n.read && (
                    <span className="text-xs font-bold text-[#15803D]">New Alert</span>
                  )}
                </div>

                <p className="text-[15px] text-slate-800">{n.message}</p>

                {n.allocationSummary && (
                  <p className="text-sm font-mono font-semibold text-[#14532D] bg-[#ECFDF5] border border-[#BBF7D0] rounded-lg px-3.5 py-2 inline-block">
                    {n.allocationSummary}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500 pt-0.5">
                  {n.memberName && <span>Member: {n.memberName}</span>}
                  {n.amount !== undefined && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono font-semibold text-slate-700">
                        {formatNaira(n.amount)}
                      </span>
                    </>
                  )}
                  {n.paymentType && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span>{n.paymentType}</span>
                    </>
                  )}
                  <span aria-hidden="true">·</span>
                  <span>{n.createdAt}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                {n.actionType === 'review_payment' && (
                  <Button onClick={() => handleAction(n)}>
                    <span>Review Payment</span>
                    <ArrowRight className="w-4 h-4 inline ml-1" />
                  </Button>
                )}
                {n.actionType === 'review_loan_app' && (
                  <Button variant="soft-green" onClick={() => handleAction(n)}>
                    <span>Review Application</span>
                    <ArrowRight className="w-4 h-4 inline ml-1" />
                  </Button>
                )}
                {!n.read && !n.actionType && (
                  <Button variant="secondary" size="sm" onClick={() => markNotificationRead(n.id)}>
                    Mark Read
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
