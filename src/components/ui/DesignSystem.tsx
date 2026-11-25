import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Copy,
  FileText,
  Maximize2,
  MessageSquare,
  MinusCircle,
  Search,
  X,
  XCircle,
} from 'lucide-react';
import { COOP_BANK_DETAILS, formatNaira, formatShortDate } from '../../data/seedData';
import { PaymentSubmission, SimulatedSmsMessage } from '../../types/cooperative';

/* ─── BUTTON ─────────────────────────────────────────────────────────────── */

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'destructive' | 'ghost' | 'soft-green';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  icon,
  className = '',
  children,
  ...props
}: ButtonProps) {
  const variants: Record<string, string> = {
    primary:
      'bg-[#15803D] text-white hover:bg-[#166534] border border-transparent disabled:bg-slate-300 disabled:text-slate-500',
    secondary:
      'bg-white text-slate-900 hover:bg-slate-50 border border-slate-300 disabled:bg-slate-100 disabled:text-slate-400',
    destructive:
      'bg-[#B91C1C] text-white hover:bg-[#991B1B] border border-transparent disabled:bg-red-200 disabled:text-red-400',
    ghost:
      'bg-transparent text-slate-700 hover:bg-slate-100 border border-transparent disabled:text-slate-400',
    'soft-green':
      'bg-[#ECFDF5] text-[#14532D] hover:bg-[#DCFCE7] border border-[#BBF7D0] disabled:opacity-50',
  };

  const sizes: Record<string, string> = {
    sm: 'min-h-[40px] px-3.5 py-2 text-sm',
    md: 'min-h-[44px] px-5 py-2.5 text-[15px]',
    lg: 'min-h-[50px] px-6 py-3 text-base',
  };

  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </button>
  );
}

/* ─── STATUS BADGE (ALWAYS ICON + TEXT) ──────────────────────────────────── */

export function StatusBadge({ status }: { status: string }) {
  const normalized = status.toLowerCase();

  if (
    normalized === 'approved' ||
    normalized === 'active' ||
    normalized === 'disbursed' ||
    normalized === 'repaid' ||
    normalized === 'paid' ||
    normalized === 'verified'
  ) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-md bg-[#ECFDF5] border border-[#BBF7D0] px-2.5 py-1 text-sm font-semibold text-[#14532D] whitespace-nowrap">
        <CheckCircle2 className="w-4 h-4 text-[#15803D] shrink-0" />
        <span>{status}</span>
      </span>
    );
  }

  if (
    normalized.includes('pending') ||
    normalized.includes('awaiting') ||
    normalized.includes('guarantor 1') ||
    normalized.includes('guarantor 2') ||
    normalized === 'due soon' ||
    normalized === 'action required'
  ) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-md bg-[#FFFBEB] border border-[#FDE68A] px-2.5 py-1 text-sm font-semibold text-[#92400E] whitespace-nowrap">
        <Clock className="w-4 h-4 text-[#D97706] shrink-0" />
        <span>{status}</span>
      </span>
    );
  }

  if (
    normalized === 'rejected' ||
    normalized === 'declined' ||
    normalized.includes('declined') ||
    normalized === 'suspended' ||
    normalized === 'absconded'
  ) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-md bg-[#FEF2F2] border border-[#FECACA] px-2.5 py-1 text-sm font-semibold text-[#991B1B] whitespace-nowrap">
        {normalized === 'suspended' || normalized === 'absconded' ? (
          <AlertTriangle className="w-4 h-4 text-[#DC2626] shrink-0" />
        ) : (
          <XCircle className="w-4 h-4 text-[#DC2626] shrink-0" />
        )}
        <span>{status}</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-md bg-slate-100 border border-slate-200 px-2.5 py-1 text-sm font-semibold text-slate-700 whitespace-nowrap">
      <MinusCircle className="w-4 h-4 text-slate-500 shrink-0" />
      <span>{status}</span>
    </span>
  );
}

/* ─── MEMBER INITIALS AVATAR ─────────────────────────────────────────────── */

export function MemberAvatar({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' | 'lg' }) {
  const parts = name.trim().split(/\s+/);
  const initials = ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? parts[0]?.[1] ?? '')).toUpperCase();
  const dims =
    size === 'sm'
      ? 'w-9 h-9 text-xs'
      : size === 'lg'
      ? 'w-14 h-14 text-lg'
      : 'w-10 h-10 text-sm';

  return (
    <div
      aria-hidden="true"
      className={`${dims} rounded-lg bg-[#ECFDF5] border border-[#BBF7D0] text-[#14532D] font-bold flex items-center justify-center shrink-0`}
    >
      {initials}
    </div>
  );
}

/* ─── SEARCH INPUT (PROMINENT VISIBLE ICON) ──────────────────────────────── */

interface SearchInputProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  label?: string;
  className?: string;
}

export function SearchInput({
  value,
  onChange,
  placeholder = 'Search Member or ID',
  label,
  className = '',
}: SearchInputProps) {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-semibold text-slate-800 mb-1.5">{label}</label>
      )}
      <div className="relative flex items-center">
        <Search className="w-5 h-5 text-slate-500 absolute left-3.5 pointer-events-none" />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full min-h-[46px] pl-11 pr-10 py-2.5 rounded-lg border border-slate-300 bg-white text-[15px] text-slate-900 placeholder:text-slate-500 focus:border-[#15803D] focus:ring-2 focus:ring-[#15803D]/20 transition-colors"
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            aria-label="Clear search"
            className="absolute right-2.5 p-1.5 text-slate-500 hover:text-slate-800 rounded-md cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

/* ─── SIDE DRAWER ────────────────────────────────────────────────────────── */

interface SideDrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  widthClass?: string;
  footer?: React.ReactNode;
  children: React.ReactNode;
}

export function SideDrawer({
  open,
  onClose,
  title,
  subtitle,
  widthClass = 'max-w-2xl',
  footer,
  children,
}: SideDrawerProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true">
      <div
        className="fixed inset-0 bg-slate-900/45 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={`relative z-10 w-full ${widthClass} bg-white h-full flex flex-col border-l border-slate-200 shadow-2xl`}
      >
        <div className="px-6 py-5 border-b border-slate-200 flex items-start justify-between gap-4 shrink-0">
          <div className="min-w-0">
            <h2 className="text-xl font-bold text-slate-900">{title}</h2>
            {subtitle && <p className="text-[15px] text-slate-600 mt-1">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[42px] px-3 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 text-sm font-semibold shrink-0 cursor-pointer"
          >
            <X className="w-4 h-4" />
            <span>Close</span>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-6">{children}</div>
        {footer && (
          <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 shrink-0">{footer}</div>
        )}
      </div>
    </div>
  );
}

/* ─── MODAL ──────────────────────────────────────────────────────────────── */

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export function Modal({ open, onClose, title, children, maxWidth = 'max-w-lg' }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="fixed inset-0 bg-slate-900/55" onClick={onClose} aria-hidden="true" />
      <div className={`relative z-10 w-full ${maxWidth} bg-white rounded-xl border border-slate-200 shadow-2xl overflow-hidden`}>
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between gap-4">
          <h3 className="text-lg font-bold text-slate-900">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[40px] px-3 inline-flex items-center gap-1 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 text-sm font-semibold cursor-pointer"
          >
            <X className="w-4 h-4" />
            <span>Close</span>
          </button>
        </div>
        <div className="p-6 max-h-[80vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

/* ─── RECEIPT PREVIEW COMPONENT ──────────────────────────────────────────── */

export function ReceiptPreview({ payment }: { payment: PaymentSubmission }) {
  const [fullscreen, setFullscreen] = useState(false);

  const renderReceiptBody = (large = false) => {
    if (payment.receiptDataUrl && payment.receiptType !== 'PDF') {
      return (
        <img
          src={payment.receiptDataUrl}
          alt={`Payment receipt from ${payment.memberName}`}
          referrerPolicy="no-referrer"
          className={`w-full rounded-lg border border-slate-200 object-contain bg-slate-50 ${
            large ? 'max-h-[65vh]' : 'max-h-60'
          }`}
        />
      );
    }

    return (
      <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
        <div className="flex items-start justify-between gap-4 pb-3 border-b border-slate-200">
          <div>
            <p className="text-sm font-semibold text-slate-500">Bank Transfer Receipt</p>
            <p className="text-base font-bold text-slate-900 mt-0.5">{payment.bankName}</p>
          </div>
          <span className="inline-flex items-center gap-1 text-sm font-semibold text-[#15803D]">
            <CheckCircle2 className="w-4 h-4" />
            Successful Transfer
          </span>
        </div>

        <div className="py-2 text-center bg-[#F8FAFC] rounded-lg border border-slate-200">
          <p className="text-sm text-slate-600">Transfer Amount</p>
          <p className="text-3xl font-bold font-mono tabular-nums text-slate-900 mt-0.5">
            {formatNaira(payment.totalAmount)}
          </p>
        </div>

        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-slate-500">Sender</dt>
            <dd className="font-semibold text-slate-900">{payment.memberName}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Reference Number</dt>
            <dd className="font-mono font-semibold text-slate-900">{payment.bankReference}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Beneficiary</dt>
            <dd className="font-semibold text-slate-900">{COOP_BANK_DETAILS.accountName}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Date &amp; Time</dt>
            <dd className="font-semibold text-slate-900">
              {formatShortDate(payment.dateSubmitted)} · {payment.submittedTime}
            </dd>
          </div>
        </dl>

        <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span className="inline-flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5" />
            {payment.receiptName} ({payment.receiptType})
          </span>
          <span>Account: {COOP_BANK_DETAILS.accountNumber}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-slate-800">Uploaded Payment Receipt</span>
        <button
          type="button"
          onClick={() => setFullscreen(true)}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#15803D] hover:text-[#166534] cursor-pointer"
        >
          <Maximize2 className="w-4 h-4" />
          <span>Full Preview</span>
        </button>
      </div>
      {renderReceiptBody(false)}
      <Modal
        open={fullscreen}
        onClose={() => setFullscreen(false)}
        title={`Payment Receipt · ${payment.memberName}`}
        maxWidth="max-w-2xl"
      >
        {renderReceiptBody(true)}
      </Modal>
    </div>
  );
}

/* ─── EMPTY STATE ────────────────────────────────────────────────────────── */

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl px-6 py-12 text-center">
      <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center mx-auto mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-slate-900">{title}</h3>
      <p className="text-[15px] text-slate-600 max-w-md mx-auto mt-1.5">{description}</p>
      {actionLabel && onAction && (
        <div className="mt-5">
          <Button variant="secondary" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
}

/* ─── PAGINATION ─────────────────────────────────────────────────────────── */

export function Pagination({
  page,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (p: number) => void;
}) {
  if (totalItems === 0) return null;
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(totalItems, page * pageSize);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-200 text-sm text-slate-600">
      <p className="tabular-nums">
        Showing <span className="font-semibold text-slate-900">{start}</span> to{' '}
        <span className="font-semibold text-slate-900">{end}</span> of{' '}
        <span className="font-semibold text-slate-900">{totalItems}</span> records
      </p>
      {totalPages > 1 && (
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            icon={<ChevronLeft className="w-4 h-4" />}
          >
            Previous
          </Button>
          <span className="px-2 font-medium text-slate-800 tabular-nums">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="secondary"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4 inline ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
}

/* ─── SIMULATED SMS OTP NOTIFICATION BANNER ──────────────────────────────── */

export function SimulatedSmsToast({
  sms,
  onDismiss,
}: {
  sms: SimulatedSmsMessage | null;
  onDismiss: () => void;
}) {
  const [copied, setCopied] = useState(false);

  if (!sms) return null;

  const handleCopy = () => {
    navigator.clipboard?.writeText(sms.code).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed top-4 right-4 z-[80] w-[calc(100%-2rem)] max-w-md bg-slate-900 text-white rounded-xl border border-slate-700 shadow-2xl p-4"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#15803D] flex items-center justify-center shrink-0 mt-0.5">
            <MessageSquare className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-xs font-medium text-emerald-300">
              SMS Message Delivered · {sms.sentAt}
            </p>
            <p className="text-sm font-semibold text-white mt-0.5">
              To: {sms.phoneNumber}
            </p>
            <p className="text-sm text-slate-200 mt-1.5 leading-relaxed">
              Unity Cooperative {sms.purpose}: Your 6-digit verification code is{' '}
              <span className="font-mono font-bold text-lg text-emerald-300 tracking-wider bg-slate-800 px-2 py-0.5 rounded">
                {sms.code}
              </span>
              . Valid for 5 minutes.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss SMS preview"
          className="text-slate-400 hover:text-white p-1 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="mt-3 flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white cursor-pointer"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Code Copied' : 'Copy OTP Code'}</span>
        </button>
      </div>
    </div>
  );
}

/* ─── GLOBAL TOAST NOTIFICATION ──────────────────────────────────────────── */

export function GlobalToast({
  toast,
  onClose,
}: {
  toast: { type: 'success' | 'error' | 'info'; title: string; detail?: string } | null;
  onClose: () => void;
}) {
  if (!toast) return null;

  const styles =
    toast.type === 'success'
      ? 'bg-[#ECFDF5] border-[#BBF7D0] text-[#14532D]'
      : toast.type === 'error'
      ? 'bg-[#FEF2F2] border-[#FECACA] text-[#991B1B]'
      : 'bg-white border-slate-300 text-slate-900';

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed bottom-5 right-5 z-[75] w-[calc(100%-2.5rem)] max-w-md rounded-xl border shadow-xl p-4 flex items-start gap-3 ${styles}`}
    >
      {toast.type === 'success' ? (
        <CheckCircle2 className="w-5 h-5 text-[#15803D] shrink-0 mt-0.5" />
      ) : toast.type === 'error' ? (
        <AlertCircle className="w-5 h-5 text-[#DC2626] shrink-0 mt-0.5" />
      ) : (
        <Clock className="w-5 h-5 text-slate-600 shrink-0 mt-0.5" />
      )}
      <div className="flex-1 min-w-0">
        <p className="text-[15px] font-bold">{toast.title}</p>
        {toast.detail && <p className="text-sm opacity-90 mt-0.5">{toast.detail}</p>}
      </div>
      <button
        type="button"
        onClick={onClose}
        aria-label="Close message"
        className="p-1 opacity-70 hover:opacity-100 cursor-pointer"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
