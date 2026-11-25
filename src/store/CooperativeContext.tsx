import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  ADMIN_NAME,
  ADMIN_PHONE,
  AUTHORIZED_ADMINS,
  buildReducingBalanceSchedule,
  formatNaira,
  INITIAL_LOAN_APPLICATIONS,
  INITIAL_LOANS,
  INITIAL_MEMBERS,
  INITIAL_NOTIFICATIONS,
  INITIAL_PAYMENTS,
  INITIAL_TRANSACTIONS,
  normalizePhone,
  phonesMatch,
} from '../data/seedData';
import {
  AdminSection,
  AuthSession,
  LoanApplication,
  LoanRecord,
  Member,
  MemberSection,
  MemberStatus,
  NotificationItem,
  PaymentSubmission,
  PaymentType,
  SimulatedSmsMessage,
  TransactionRecord,
} from '../types/cooperative';

const STORAGE_KEY = 'unity_coop_state_v1';

// Cooperative baseline totals beyond the sample visible member records so
// headline figures start at exact specification values and react live to actions.
const BASE_SAVINGS_OFFSET = 18400000 - INITIAL_MEMBERS.reduce((s, m) => s + m.savingsBalance, 0);
const BASE_LOANS_OFFSET = 6450000 - INITIAL_MEMBERS.reduce((s, m) => s + m.loanBalance, 0);
const BASE_RECEIVED = 4250000;
const BASE_DISBURSED = 2850000;
const BASE_APPROVED_MONTH = 24;

interface PersistedState {
  members: Member[];
  payments: PaymentSubmission[];
  loans: LoanRecord[];
  loanApplications: LoanApplication[];
  transactions: TransactionRecord[];
  notifications: NotificationItem[];
  receivedDelta: number;
  disbursedDelta: number;
  approvedMonthCount: number;
}

interface NewPaymentInput {
  memberId: string;
  paymentType: PaymentType;
  totalAmount: number;
  savingsAllocation: number;
  loanAllocation: number;
  description: string;
  receiptName: string;
  receiptType: 'JPG' | 'PNG' | 'PDF';
  receiptDataUrl?: string;
  bankName: string;
  bankReference: string;
}

interface NewLoanAppInput {
  applicantId: string;
  amount: number;
  purpose: string;
  repaymentPeriodMonths: number;
  guarantor1Id: string;
  guarantor2Id: string;
}

interface CooperativeContextValue {
  // Auth & navigation
  session: AuthSession | null;
  adminSection: AdminSection;
  memberSection: MemberSection;
  setAdminSection: (s: AdminSection) => void;
  setMemberSection: (s: MemberSection) => void;
  selectedPaymentIdForReview: string | null;
  setSelectedPaymentIdForReview: (id: string | null) => void;
  selectedMemberIdForProfile: string | null;
  setSelectedMemberIdForProfile: (id: string | null) => void;
  selectedLoanAppIdForReview: string | null;
  setSelectedLoanAppIdForReview: (id: string | null) => void;
  isMakePaymentDrawerOpen: boolean;
  setIsMakePaymentDrawerOpen: (open: boolean) => void;

  // Auth actions (Authorized Admin + Profiled Member Phone OTP)
  activeSms: SimulatedSmsMessage | null;
  dismissSms: () => void;
  verifyAdminLogin: (identifier: string, passcode: string) => { ok: boolean; error?: string };
  sendPhoneOtp: (phoneNumber: string, purpose?: string) => { ok: boolean; code?: string; error?: string; resolvedName?: string };
  verifyLoginOtp: (phoneNumber: string, code: string) => { ok: boolean; error?: string };
  verifyRegistrationOtp: (phoneNumber: string, code: string) => { ok: boolean; error?: string };
  quickSwitchToAdmin: () => void;
  quickSwitchToMember: (memberId: string) => void;
  signOut: () => void;

  // Data
  members: Member[];
  payments: PaymentSubmission[];
  loans: LoanRecord[];
  loanApplications: LoanApplication[];
  transactions: TransactionRecord[];
  notifications: NotificationItem[];
  currentMember: Member | null;

  // Computed headline metrics
  metrics: {
    totalCooperativeBalance: number;
    totalSavings: number;
    loansOutstanding: number;
    moneyReceived: number;
    moneyDisbursed: number;
    pendingPaymentsCount: number;
    pendingPaymentsAmount: number;
    approvedThisMonth: number;
    pendingLoanAppsCount: number;
  };

  // Mutations
  submitPayment: (input: NewPaymentInput) => PaymentSubmission;
  approvePayment: (paymentId: string, adminNote?: string) => void;
  rejectPayment: (paymentId: string, reason: string) => void;
  submitLoanApplication: (input: NewLoanAppInput) => LoanApplication;
  respondAsGuarantor: (
    appId: string,
    guarantorMemberId: string,
    decision: 'Approved' | 'Declined',
    reason?: string
  ) => void;
  adminApproveLoanApp: (appId: string, note?: string) => void;
  adminRejectLoanApp: (appId: string, reason: string) => void;
  adminDisburseLoanApp: (appId: string, note?: string) => void;
  registerNewMember: (member: Omit<Member, 'savingsBalance' | 'totalContributed' | 'contributionCount' | 'lastSavingsDate' | 'loanBalance'>) => Member;
  updateMemberStatus: (memberId: string, status: MemberStatus) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: (audience: 'admin' | 'member', memberId?: string) => void;
  resetDemoData: () => void;

  // Toast feedback
  toastMessage: { type: 'success' | 'error' | 'info'; title: string; detail?: string } | null;
  showToast: (type: 'success' | 'error' | 'info', title: string, detail?: string) => void;
  clearToast: () => void;
}

const CooperativeContext = createContext<CooperativeContextValue | null>(null);

function getDefaultPersistedState(): PersistedState {
  return {
    members: INITIAL_MEMBERS,
    payments: INITIAL_PAYMENTS,
    loans: INITIAL_LOANS,
    loanApplications: INITIAL_LOAN_APPLICATIONS,
    transactions: INITIAL_TRANSACTIONS,
    notifications: INITIAL_NOTIFICATIONS,
    receivedDelta: 0,
    disbursedDelta: 0,
    approvedMonthCount: BASE_APPROVED_MONTH,
  };
}

function loadState(): PersistedState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultPersistedState();
    const parsed = JSON.parse(raw) as Partial<PersistedState>;
    if (!parsed.members || !parsed.payments) return getDefaultPersistedState();
    return {
      ...getDefaultPersistedState(),
      ...parsed,
    };
  } catch {
    return getDefaultPersistedState();
  }
}

export function CooperativeProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<PersistedState>(() => loadState());
  const [session, setSession] = useState<AuthSession | null>(null);

  const [adminSection, setAdminSection] = useState<AdminSection>('dashboard');
  const [memberSection, setMemberSection] = useState<MemberSection>('dashboard');
  const [selectedPaymentIdForReview, setSelectedPaymentIdForReview] = useState<string | null>(null);
  const [selectedMemberIdForProfile, setSelectedMemberIdForProfile] = useState<string | null>(null);
  const [selectedLoanAppIdForReview, setSelectedLoanAppIdForReview] = useState<string | null>(null);
  const [isMakePaymentDrawerOpen, setIsMakePaymentDrawerOpen] = useState(false);

  const [otpStore, setOtpStore] = useState<Record<string, { code: string; expiresAt: number }>>({});
  const [activeSms, setActiveSms] = useState<SimulatedSmsMessage | null>(null);
  const [toastMessage, setToastMessage] = useState<{
    type: 'success' | 'error' | 'info';
    title: string;
    detail?: string;
  } | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore storage quota issues
    }
  }, [state]);

  const showToast = (type: 'success' | 'error' | 'info', title: string, detail?: string) => {
    setToastMessage({ type, title, detail });
  };

  useEffect(() => {
    if (!toastMessage) return;
    const t = setTimeout(() => setToastMessage(null), 5000);
    return () => clearTimeout(t);
  }, [toastMessage]);

  const currentMember = useMemo(() => {
    if (!session || session.role !== 'member' || !session.memberId) return null;
    return state.members.find((m) => m.id === session.memberId) ?? null;
  }, [session, state.members]);

  const metrics = useMemo(() => {
    const totalSavings = BASE_SAVINGS_OFFSET + state.members.reduce((sum, m) => sum + m.savingsBalance, 0);
    const loansOutstanding = BASE_LOANS_OFFSET + state.members.reduce((sum, m) => sum + m.loanBalance, 0);
    const totalCooperativeBalance = totalSavings + loansOutstanding;
    const pendingPayments = state.payments.filter((p) => p.status === 'Pending');
    const pendingPaymentsCount = pendingPayments.length;
    const pendingPaymentsAmount = pendingPayments.reduce((sum, p) => sum + p.totalAmount, 0);
    const pendingLoanAppsCount = state.loanApplications.filter(
      (a) => a.status === 'Pending Admin Approval'
    ).length;

    return {
      totalCooperativeBalance,
      totalSavings,
      loansOutstanding,
      moneyReceived: BASE_RECEIVED + state.receivedDelta,
      moneyDisbursed: BASE_DISBURSED + state.disbursedDelta,
      pendingPaymentsCount,
      pendingPaymentsAmount,
      approvedThisMonth: state.approvedMonthCount,
      pendingLoanAppsCount,
    };
  }, [state]);

  const verifyAdminLogin = (identifier: string, passcode: string) => {
    const cleanId = identifier.trim().toLowerCase();
    if (!cleanId || !passcode.trim()) {
      return { ok: false, error: 'Please enter your authorized admin email or phone number and passcode.' };
    }

    const matchedAdmin = AUTHORIZED_ADMINS.find(
      (adm) =>
        adm.email.toLowerCase() === cleanId ||
        adm.id.toLowerCase() === cleanId ||
        phonesMatch(adm.phoneNumber, identifier)
    );

    if (!matchedAdmin || matchedAdmin.passcode !== passcode) {
      return {
        ok: false,
        error: 'Access denied. Invalid administrator credentials. Only authorized cooperative administrators can sign in here.',
      };
    }

    setSession({
      role: 'admin',
      phoneNumber: matchedAdmin.phoneNumber,
      displayName: matchedAdmin.name,
    });
    setAdminSection('dashboard');
    setActiveSms(null);
    showToast('success', `Welcome, ${matchedAdmin.name}`, `Signed in as ${matchedAdmin.title}.`);
    return { ok: true };
  };

  const sendPhoneOtp = (rawPhone: string, purpose = 'Member Login') => {
    const cleaned = rawPhone.replace(/\D/g, '');
    if (cleaned.length < 10) {
      return { ok: false, error: 'Please enter a valid 11-digit Nigerian phone number (e.g. 0802 511 0125).' };
    }

    const formatted = normalizePhone(rawPhone);
    let resolvedName: string | undefined;

    if (purpose === 'Member Login') {
      const isAdminPhone = AUTHORIZED_ADMINS.some((adm) => phonesMatch(adm.phoneNumber, formatted));
      if (isAdminPhone) {
        return {
          ok: false,
          error: 'This phone number belongs to a Cooperative Administrator. Please switch to the Admin Login tab.',
        };
      }

      const found = state.members.find((m) => phonesMatch(m.phoneNumber, formatted));
      if (!found) {
        return {
          ok: false,
          error: 'This phone number is not profiled in Unity Cooperative. Only profiled members registered by an administrator can log in.',
        };
      }
      if (found.status !== 'Active') {
        return {
          ok: false,
          error: `Login blocked: Your membership status is currently "${found.status}". Please contact the cooperative office for assistance.`,
        };
      }
      resolvedName = `${found.fullName} (${found.id})`;
    }

    const code = String(Math.floor(100000 + Math.random() * 900000));
    const key = formatted.replace(/\D/g, '');
    setOtpStore((prev) => ({
      ...prev,
      [key]: { code, expiresAt: Date.now() + 5 * 60 * 1000 },
    }));
    setActiveSms({
      id: `SMS-${Date.now()}`,
      phoneNumber: formatted,
      code,
      purpose,
      sentAt: new Date().toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' }),
    });
    return { ok: true, code, resolvedName };
  };

  const verifyOtpCode = (rawPhone: string, code: string) => {
    const key = normalizePhone(rawPhone).replace(/\D/g, '');
    const record = otpStore[key];
    if (!record) {
      return { ok: false, error: 'No active OTP found for this phone number. Please request a new code.' };
    }
    if (Date.now() > record.expiresAt) {
      return { ok: false, error: 'This OTP code has expired. Please request a new code.' };
    }
    if (record.code !== code.trim()) {
      return { ok: false, error: 'Incorrect 6-digit code. Please check the SMS message and try again.' };
    }
    return { ok: true };
  };

  const verifyLoginOtp = (rawPhone: string, code: string) => {
    const check = verifyOtpCode(rawPhone, code);
    if (!check.ok) return check;
    const formatted = normalizePhone(rawPhone);

    const found = state.members.find((m) => phonesMatch(m.phoneNumber, formatted));
    if (!found || found.status !== 'Active') {
      return { ok: false, error: 'Only active profiled cooperative members can log in.' };
    }

    setSession({
      role: 'member',
      memberId: found.id,
      phoneNumber: found.phoneNumber,
      displayName: found.fullName,
    });
    setMemberSection('dashboard');
    setActiveSms(null);
    showToast('success', `Welcome back, ${found.fullName}`, 'Signed in securely with Phone OTP.');
    return { ok: true };
  };

  const verifyRegistrationOtp = (rawPhone: string, code: string) => {
    const check = verifyOtpCode(rawPhone, code);
    if (check.ok) {
      setActiveSms(null);
    }
    return check;
  };

  const quickSwitchToAdmin = () => {
    setSession({
      role: 'admin',
      phoneNumber: ADMIN_PHONE,
      displayName: ADMIN_NAME,
    });
    setAdminSection('dashboard');
    setSelectedPaymentIdForReview(null);
  };

  const quickSwitchToMember = (memberId: string) => {
    const found = state.members.find((m) => m.id === memberId);
    if (!found) return;
    setSession({
      role: 'member',
      memberId: found.id,
      phoneNumber: found.phoneNumber,
      displayName: found.fullName,
    });
    setMemberSection('dashboard');
  };

  const signOut = () => {
    setSession(null);
    setSelectedPaymentIdForReview(null);
    setSelectedMemberIdForProfile(null);
  };

  const submitPayment = (input: NewPaymentInput): PaymentSubmission => {
    const member = state.members.find((m) => m.id === input.memberId)!;
    const today = '2026-11-24';
    const timeStr = new Date().toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' });
    const newPayment: PaymentSubmission = {
      id: `PAY-2026-${Math.floor(200 + Math.random() * 799)}`,
      memberId: member.id,
      memberName: member.fullName,
      paymentType: input.paymentType,
      totalAmount: input.totalAmount,
      savingsAllocation: input.savingsAllocation,
      loanAllocation: input.loanAllocation,
      dateSubmitted: today,
      submittedTime: timeStr,
      description: input.description || `${input.paymentType} bank transfer`,
      receiptName: input.receiptName,
      receiptType: input.receiptType,
      receiptDataUrl: input.receiptDataUrl,
      bankName: input.bankName,
      bankReference: input.bankReference,
      status: 'Pending',
    };

    const allocSummary =
      input.paymentType === 'Savings + Loan'
        ? `Savings: ${formatNaira(input.savingsAllocation)} · Loan Repayment: ${formatNaira(input.loanAllocation)}`
        : input.paymentType === 'Savings'
        ? `Savings: ${formatNaira(input.savingsAllocation)}`
        : `Loan Repayment: ${formatNaira(input.loanAllocation)}`;

    const pendingTxn: TransactionRecord = {
      id: `TXN-${Math.floor(9100 + Math.random() * 899)}`,
      memberId: member.id,
      memberName: member.fullName,
      date: today,
      description: `Payment Submitted (${allocSummary})`,
      amount: input.totalAmount,
      direction: 'Added',
      category: 'Payment Submission',
      paymentMethod: `Bank Transfer (${input.bankName})`,
      reference: input.bankReference,
      status: 'Pending',
      resultingBalance: member.savingsBalance,
      balanceLabel: 'Savings Balance',
    };

    const adminNotif: NotificationItem = {
      id: `NTF-A-${Date.now()}`,
      audience: 'admin',
      title: 'Payment Received',
      message: `${member.fullName} has submitted a ${formatNaira(input.totalAmount)} payment.`,
      memberName: member.fullName,
      amount: input.totalAmount,
      paymentType: input.paymentType,
      allocationSummary: allocSummary,
      createdAt: 'Just now',
      read: false,
      statusLabel: 'Pending',
      actionType: 'review_payment',
      targetId: newPayment.id,
    };

    const memberNotif: NotificationItem = {
      id: `NTF-M-${Date.now() + 1}`,
      audience: 'member',
      memberId: member.id,
      title: 'Payment Submitted',
      message: `Your ${formatNaira(input.totalAmount)} payment (${allocSummary}) has been submitted and is pending administrator verification.`,
      amount: input.totalAmount,
      createdAt: 'Just now',
      read: false,
      statusLabel: 'Pending',
      actionType: 'view_savings',
    };

    setState((prev) => ({
      ...prev,
      payments: [newPayment, ...prev.payments],
      transactions: [pendingTxn, ...prev.transactions],
      notifications: [adminNotif, memberNotif, ...prev.notifications],
    }));

    return newPayment;
  };

  const approvePayment = (paymentId: string, adminNote?: string) => {
    setState((prev) => {
      const payment = prev.payments.find((p) => p.id === paymentId);
      if (!payment || payment.status !== 'Pending') return prev;

      const member = prev.members.find((m) => m.id === payment.memberId);
      if (!member) return prev;

      const today = '2026-11-24';
      const newSavingsBalance = member.savingsBalance + payment.savingsAllocation;
      const newLoanBalance = Math.max(0, member.loanBalance - payment.loanAllocation);

      const updatedMembers = prev.members.map((m) =>
        m.id === member.id
          ? {
              ...m,
              savingsBalance: newSavingsBalance,
              totalContributed: m.totalContributed + payment.savingsAllocation,
              contributionCount:
                payment.savingsAllocation > 0 ? m.contributionCount + 1 : m.contributionCount,
              lastSavingsDate: payment.savingsAllocation > 0 ? today : m.lastSavingsDate,
              loanBalance: newLoanBalance,
            }
          : m
      );

      // Update active loan record if loan allocation > 0
      const updatedLoans = prev.loans.map((loan) => {
        if (loan.memberId !== member.id || loan.status !== 'Active' || payment.loanAllocation <= 0) {
          return loan;
        }
        const nextRepaid = Math.min(loan.originalAmount, loan.amountRepaid + payment.loanAllocation);
        const nextOutstanding = Math.max(0, loan.originalAmount - nextRepaid);
        const nextPaidCount = Math.min(loan.repaymentPeriodMonths, loan.paymentsMade + 1);
        const nextRemainingCount = Math.max(0, loan.repaymentPeriodMonths - nextPaidCount);
        const updatedSchedule = loan.schedule.map((row) => {
          if (row.month === nextPaidCount) return { ...row, status: 'Paid' as const };
          if (row.month === nextPaidCount + 1) return { ...row, status: 'Due Soon' as const };
          return row;
        });

        return {
          ...loan,
          amountRepaid: nextRepaid,
          outstandingBalance: nextOutstanding,
          paymentsMade: nextPaidCount,
          paymentsRemaining: nextRemainingCount,
          status: nextOutstanding === 0 ? ('Repaid' as const) : ('Active' as const),
          schedule: updatedSchedule,
        };
      });

      const updatedPayments = prev.payments.map((p) =>
        p.id === paymentId
          ? {
              ...p,
              status: 'Approved' as const,
              adminNote: adminNote?.trim() || 'Transfer confirmed on cooperative bank statement.',
              reviewedAt: today,
            }
          : p
      );

      const newTxns: TransactionRecord[] = [];
      if (payment.savingsAllocation > 0) {
        newTxns.push({
          id: `TXN-${Math.floor(9200 + Math.random() * 799)}`,
          memberId: member.id,
          memberName: member.fullName,
          date: today,
          description: 'Savings Contribution (Verified)',
          amount: payment.savingsAllocation,
          direction: 'Added',
          category: 'Savings',
          paymentMethod: `Bank Transfer (${payment.bankName})`,
          reference: payment.bankReference,
          status: 'Approved',
          resultingBalance: newSavingsBalance,
          balanceLabel: 'Savings Balance',
        });
      }
      if (payment.loanAllocation > 0) {
        newTxns.push({
          id: `TXN-${Math.floor(9200 + Math.random() * 799)}`,
          memberId: member.id,
          memberName: member.fullName,
          date: today,
          description: 'Loan Repayment (Verified)',
          amount: payment.loanAllocation,
          direction: 'Deducted',
          category: 'Loan Repayment',
          paymentMethod: `Bank Transfer (${payment.bankName})`,
          reference: payment.bankReference,
          status: 'Approved',
          resultingBalance: newLoanBalance,
          balanceLabel: 'Loan Balance',
        });
      }

      // Mark any pending submission transaction matching this reference as approved
      const refreshedTransactions = prev.transactions.map((t) =>
        t.reference === payment.bankReference && t.status === 'Pending'
          ? { ...t, status: 'Approved' as const }
          : t
      );

      const summaryParts: string[] = [];
      if (payment.savingsAllocation > 0) {
        summaryParts.push(`${formatNaira(payment.savingsAllocation)} added to Savings`);
      }
      if (payment.loanAllocation > 0) {
        summaryParts.push(`${formatNaira(payment.loanAllocation)} deducted from Loan`);
      }

      const memberNotif: NotificationItem = {
        id: `NTF-M-${Date.now()}`,
        audience: 'member',
        memberId: member.id,
        title: 'Payment Approved',
        message: `Your ${formatNaira(payment.totalAmount)} payment has been confirmed. ${summaryParts.join(' and ')}.`,
        amount: payment.totalAmount,
        createdAt: 'Just now',
        read: false,
        statusLabel: 'Approved',
        actionType: payment.savingsAllocation > 0 ? 'view_savings' : 'view_loan',
      };

      const updatedNotifications = prev.notifications.map((n) =>
        n.targetId === paymentId && n.audience === 'admin'
          ? { ...n, read: true, statusLabel: 'Approved' }
          : n
      );

      return {
        ...prev,
        members: updatedMembers,
        loans: updatedLoans,
        payments: updatedPayments,
        transactions: [...newTxns, ...refreshedTransactions],
        notifications: [memberNotif, ...updatedNotifications],
        receivedDelta: prev.receivedDelta + payment.totalAmount,
        approvedMonthCount: prev.approvedMonthCount + 1,
      };
    });

    showToast('success', 'Payment Approved', 'Member savings and loan balances have been updated automatically.');
  };

  const rejectPayment = (paymentId: string, reason: string) => {
    setState((prev) => {
      const payment = prev.payments.find((p) => p.id === paymentId);
      if (!payment || payment.status !== 'Pending') return prev;
      const today = '2026-11-24';

      const updatedPayments = prev.payments.map((p) =>
        p.id === paymentId
          ? {
              ...p,
              status: 'Rejected' as const,
              adminNote: reason.trim() || 'Unable to verify bank transfer.',
              reviewedAt: today,
            }
          : p
      );

      const refreshedTransactions = prev.transactions.map((t) =>
        t.reference === payment.bankReference && t.status === 'Pending'
          ? { ...t, status: 'Rejected' as const }
          : t
      );

      const memberNotif: NotificationItem = {
        id: `NTF-M-${Date.now()}`,
        audience: 'member',
        memberId: payment.memberId,
        title: 'Payment Rejected',
        message: `Your ${formatNaira(payment.totalAmount)} payment could not be confirmed. Reason: ${reason.trim()}`,
        amount: payment.totalAmount,
        createdAt: 'Just now',
        read: false,
        statusLabel: 'Rejected',
        actionType: 'view_savings',
      };

      const updatedNotifications = prev.notifications.map((n) =>
        n.targetId === paymentId && n.audience === 'admin'
          ? { ...n, read: true, statusLabel: 'Rejected' }
          : n
      );

      return {
        ...prev,
        payments: updatedPayments,
        transactions: refreshedTransactions,
        notifications: [memberNotif, ...updatedNotifications],
      };
    });

    showToast('info', 'Payment Rejected', 'The member has been notified with your reason.');
  };

  const submitLoanApplication = (input: NewLoanAppInput): LoanApplication => {
    const applicant = state.members.find((m) => m.id === input.applicantId)!;
    const g1 = state.members.find((m) => m.id === input.guarantor1Id)!;
    const g2 = state.members.find((m) => m.id === input.guarantor2Id)!;
    const today = '2026-11-24';

    const newApp: LoanApplication = {
      id: `APP-2026-${Math.floor(100 + Math.random() * 899)}`,
      applicantId: applicant.id,
      applicantName: applicant.fullName,
      amount: input.amount,
      purpose: input.purpose,
      repaymentPeriodMonths: input.repaymentPeriodMonths,
      dateSubmitted: today,
      guarantor1: {
        memberId: g1.id,
        memberName: g1.fullName,
        status: 'Pending',
      },
      guarantor2: {
        memberId: g2.id,
        memberName: g2.fullName,
        status: 'Pending',
      },
      status: 'Awaiting Guarantors',
    };

    const g1Notif: NotificationItem = {
      id: `NTF-G1-${Date.now()}`,
      audience: 'member',
      memberId: g1.id,
      title: 'Guarantor Request',
      message: `${applicant.fullName} has selected you as a guarantor for a ${formatNaira(input.amount)} loan.`,
      memberName: applicant.fullName,
      amount: input.amount,
      createdAt: 'Just now',
      read: false,
      statusLabel: 'Action Required',
      actionType: 'guarantor_request',
      targetId: newApp.id,
    };

    const g2Notif: NotificationItem = {
      id: `NTF-G2-${Date.now() + 1}`,
      audience: 'member',
      memberId: g2.id,
      title: 'Guarantor Request',
      message: `${applicant.fullName} has selected you as a guarantor for a ${formatNaira(input.amount)} loan.`,
      memberName: applicant.fullName,
      amount: input.amount,
      createdAt: 'Just now',
      read: false,
      statusLabel: 'Action Required',
      actionType: 'guarantor_request',
      targetId: newApp.id,
    };

    const applicantNotif: NotificationItem = {
      id: `NTF-AP-${Date.now() + 2}`,
      audience: 'member',
      memberId: applicant.id,
      title: 'Loan Application Submitted',
      message: `Your ${formatNaira(input.amount)} loan application has been sent to ${g1.fullName} and ${g2.fullName} for guarantor approval.`,
      amount: input.amount,
      createdAt: 'Just now',
      read: false,
      statusLabel: 'Awaiting Guarantors',
      actionType: 'view_loan',
    };

    const adminNotif: NotificationItem = {
      id: `NTF-AD-${Date.now() + 3}`,
      audience: 'admin',
      title: 'New Loan Application',
      message: `${applicant.fullName} applied for a ${formatNaira(input.amount)} loan (awaiting 2 guarantor approvals).`,
      memberName: applicant.fullName,
      amount: input.amount,
      createdAt: 'Just now',
      read: false,
      statusLabel: 'Awaiting Guarantors',
      actionType: 'review_loan_app',
      targetId: newApp.id,
    };

    setState((prev) => ({
      ...prev,
      loanApplications: [newApp, ...prev.loanApplications],
      notifications: [g1Notif, g2Notif, applicantNotif, adminNotif, ...prev.notifications],
    }));

    return newApp;
  };

  const respondAsGuarantor = (
    appId: string,
    guarantorMemberId: string,
    decision: 'Approved' | 'Declined',
    reason?: string
  ) => {
    setState((prev) => {
      const app = prev.loanApplications.find((a) => a.id === appId);
      if (!app) return prev;
      const today = '2026-11-24';

      const isG1 = app.guarantor1.memberId === guarantorMemberId;
      const isG2 = app.guarantor2.memberId === guarantorMemberId;
      if (!isG1 && !isG2) return prev;

      const updatedG1 = isG1
        ? { ...app.guarantor1, status: decision, reason, respondedAt: today }
        : app.guarantor1;
      const updatedG2 = isG2
        ? { ...app.guarantor2, status: decision, reason, respondedAt: today }
        : app.guarantor2;

      const responderName = isG1 ? app.guarantor1.memberName : app.guarantor2.memberName;

      let nextStatus = app.status;
      if (updatedG1.status === 'Declined' || updatedG2.status === 'Declined') {
        nextStatus = 'Guarantor Declined';
      } else if (updatedG1.status === 'Approved' && updatedG2.status === 'Approved') {
        nextStatus = 'Pending Admin Approval';
      } else if (updatedG1.status === 'Approved') {
        nextStatus = 'Guarantor 1 Approved';
      } else if (updatedG2.status === 'Approved') {
        nextStatus = 'Guarantor 2 Approved';
      }

      const updatedApps = prev.loanApplications.map((a) =>
        a.id === appId
          ? { ...a, guarantor1: updatedG1, guarantor2: updatedG2, status: nextStatus }
          : a
      );

      const newNotifs: NotificationItem[] = [
        {
          id: `NTF-M-${Date.now()}`,
          audience: 'member',
          memberId: app.applicantId,
          title: decision === 'Approved' ? 'Guarantor Approved' : 'Guarantor Declined',
          message:
            decision === 'Approved'
              ? `${responderName} has approved your ${formatNaira(app.amount)} loan guarantor request.${
                  nextStatus === 'Pending Admin Approval'
                    ? ' Both guarantors have approved — your application has now moved to the Administrator!'
                    : ''
                }`
              : `${responderName} declined your ${formatNaira(app.amount)} loan guarantor request.${
                  reason ? ` Reason: ${reason}` : ''
                }`,
          amount: app.amount,
          createdAt: 'Just now',
          read: false,
          statusLabel: nextStatus,
          actionType: 'view_loan',
        },
      ];

      if (nextStatus === 'Pending Admin Approval') {
        newNotifs.push({
          id: `NTF-A-${Date.now() + 1}`,
          audience: 'admin',
          title: 'Guarantor Approvals Completed',
          message: `Both guarantors have approved ${app.applicantName}’s ${formatNaira(app.amount)} loan application. Ready for admin decision.`,
          memberName: app.applicantName,
          amount: app.amount,
          createdAt: 'Just now',
          read: false,
          statusLabel: 'Pending Admin Approval',
          actionType: 'review_loan_app',
          targetId: appId,
        });
      }

      const markedNotifs = prev.notifications.map((n) =>
        n.targetId === appId && n.memberId === guarantorMemberId
          ? { ...n, read: true, statusLabel: decision }
          : n
      );

      return {
        ...prev,
        loanApplications: updatedApps,
        notifications: [...newNotifs, ...markedNotifs],
      };
    });

    showToast(
      decision === 'Approved' ? 'success' : 'info',
      decision === 'Approved' ? 'Guarantor Approval Recorded' : 'Guarantor Request Declined',
      decision === 'Approved'
        ? 'Thank you. The applicant and cooperative office have been notified.'
        : 'The applicant has been notified.'
    );
  };

  const adminApproveLoanApp = (appId: string, note?: string) => {
    setState((prev) => {
      const app = prev.loanApplications.find((a) => a.id === appId);
      if (!app) return prev;
      const updatedApps = prev.loanApplications.map((a) =>
        a.id === appId
          ? { ...a, status: 'Approved' as const, adminNote: note || 'Approved by Cooperative Admin.' }
          : a
      );
      const memberNotif: NotificationItem = {
        id: `NTF-M-${Date.now()}`,
        audience: 'member',
        memberId: app.applicantId,
        title: 'Loan Approved',
        message: `Your ${formatNaira(app.amount)} loan application has been approved and is scheduled for disbursement.`,
        amount: app.amount,
        createdAt: 'Just now',
        read: false,
        statusLabel: 'Approved',
        actionType: 'view_loan',
      };
      return {
        ...prev,
        loanApplications: updatedApps,
        notifications: [memberNotif, ...prev.notifications],
      };
    });
    showToast('success', 'Loan Application Approved', 'You can now disburse the funds to the member.');
  };

  const adminRejectLoanApp = (appId: string, reason: string) => {
    setState((prev) => {
      const app = prev.loanApplications.find((a) => a.id === appId);
      if (!app) return prev;
      const updatedApps = prev.loanApplications.map((a) =>
        a.id === appId
          ? { ...a, status: 'Rejected' as const, adminNote: reason || 'Application declined.' }
          : a
      );
      const memberNotif: NotificationItem = {
        id: `NTF-M-${Date.now()}`,
        audience: 'member',
        memberId: app.applicantId,
        title: 'Loan Application Rejected',
        message: `Your ${formatNaira(app.amount)} loan application was not approved. Reason: ${reason}`,
        amount: app.amount,
        createdAt: 'Just now',
        read: false,
        statusLabel: 'Rejected',
        actionType: 'view_loan',
      };
      return {
        ...prev,
        loanApplications: updatedApps,
        notifications: [memberNotif, ...prev.notifications],
      };
    });
    showToast('info', 'Loan Application Rejected', 'The member has been notified.');
  };

  const adminDisburseLoanApp = (appId: string, note?: string) => {
    setState((prev) => {
      const app = prev.loanApplications.find((a) => a.id === appId);
      if (!app) return prev;
      const member = prev.members.find((m) => m.id === app.applicantId);
      if (!member) return prev;
      const today = '2026-11-24';

      const schedule = buildReducingBalanceSchedule(
        app.amount,
        app.repaymentPeriodMonths,
        0,
        today,
        1
      );

      const newLoan: LoanRecord = {
        id: `LN-2026-${Math.floor(100 + Math.random() * 899)}`,
        memberId: member.id,
        memberName: member.fullName,
        originalAmount: app.amount,
        amountRepaid: 0,
        outstandingBalance: app.amount,
        repaymentPeriodMonths: app.repaymentPeriodMonths,
        paymentsMade: 0,
        paymentsRemaining: app.repaymentPeriodMonths,
        interestRatePercent: 1,
        nextRepaymentDate: schedule[0]?.date ?? '2026-12-24',
        nextRepaymentAmount: schedule[0]?.amountPaid ?? Math.round(app.amount / app.repaymentPeriodMonths),
        purpose: app.purpose,
        status: 'Active',
        disbursedDate: today,
        schedule,
      };

      const updatedLoanBalance = member.loanBalance + app.amount;

      const updatedMembers = prev.members.map((m) =>
        m.id === member.id ? { ...m, loanBalance: updatedLoanBalance } : m
      );

      const updatedApps = prev.loanApplications.map((a) =>
        a.id === appId
          ? { ...a, status: 'Disbursed' as const, adminNote: note || 'Funds disbursed to member bank account.' }
          : a
      );

      const disbTxn: TransactionRecord = {
        id: `TXN-${Math.floor(9400 + Math.random() * 599)}`,
        memberId: member.id,
        memberName: member.fullName,
        date: today,
        description: `Loan Disbursed — ${app.purpose}`,
        amount: app.amount,
        direction: 'Added',
        category: 'Loan Disbursement',
        paymentMethod: 'Cooperative Bank Transfer',
        reference: `DISB-${newLoan.id}`,
        status: 'Approved',
        resultingBalance: updatedLoanBalance,
        balanceLabel: 'Loan Balance',
      };

      const memberNotif: NotificationItem = {
        id: `NTF-M-${Date.now()}`,
        audience: 'member',
        memberId: member.id,
        title: 'Loan Disbursed',
        message: `Your ${formatNaira(app.amount)} loan has been disbursed! Your repayment schedule is now available under My Loan.`,
        amount: app.amount,
        createdAt: 'Just now',
        read: false,
        statusLabel: 'Disbursed',
        actionType: 'view_loan',
      };

      return {
        ...prev,
        members: updatedMembers,
        loans: [newLoan, ...prev.loans],
        loanApplications: updatedApps,
        transactions: [disbTxn, ...prev.transactions],
        notifications: [memberNotif, ...prev.notifications],
        disbursedDelta: prev.disbursedDelta + app.amount,
      };
    });

    showToast('success', 'Loan Disbursed Successfully', 'Member loan balance and repayment schedule are now active.');
  };

  const registerNewMember = (
    memberData: Omit<
      Member,
      'savingsBalance' | 'totalContributed' | 'contributionCount' | 'lastSavingsDate' | 'loanBalance'
    >
  ): Member => {
    const newMember: Member = {
      ...memberData,
      phoneNumber: normalizePhone(memberData.phoneNumber),
      savingsBalance: 0,
      totalContributed: 0,
      contributionCount: 0,
      lastSavingsDate: '',
      loanBalance: 0,
    };

    const adminNotif: NotificationItem = {
      id: `NTF-A-${Date.now()}`,
      audience: 'admin',
      title: 'Member Registration Completed',
      message: `${newMember.fullName} (${newMember.id}) has been registered with Phone OTP login enabled.`,
      memberName: newMember.fullName,
      createdAt: 'Just now',
      read: false,
      statusLabel: newMember.status,
    };

    const welcomeNotif: NotificationItem = {
      id: `NTF-M-${Date.now() + 1}`,
      audience: 'member',
      memberId: newMember.id,
      title: 'Welcome to Unity Cooperative',
      message: `Your member account (${newMember.id}) is active. Your phone number ${newMember.phoneNumber} is verified for secure OTP login.`,
      createdAt: 'Just now',
      read: false,
      statusLabel: 'Active',
    };

    setState((prev) => ({
      ...prev,
      members: [newMember, ...prev.members],
      notifications: [adminNotif, welcomeNotif, ...prev.notifications],
    }));

    return newMember;
  };

  const updateMemberStatus = (memberId: string, status: MemberStatus) => {
    setState((prev) => ({
      ...prev,
      members: prev.members.map((m) => (m.id === memberId ? { ...m, status } : m)),
    }));
    showToast('success', 'Member Status Updated', `Account status changed to ${status}.`);
  };

  const markNotificationRead = (id: string) => {
    setState((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    }));
  };

  const markAllNotificationsRead = (audience: 'admin' | 'member', memberId?: string) => {
    setState((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) =>
        n.audience === audience && (!memberId || n.memberId === memberId)
          ? { ...n, read: true }
          : n
      ),
    }));
  };

  const resetDemoData = () => {
    const fresh = getDefaultPersistedState();
    setState(fresh);
    localStorage.removeItem(STORAGE_KEY);
    setSelectedPaymentIdForReview(null);
    setSelectedMemberIdForProfile(null);
    showToast('success', 'Demo Data Reset', 'All cooperative balances, pending reviews, and applications have been restored.');
  };

  return (
    <CooperativeContext.Provider
      value={{
        session,
        adminSection,
        memberSection,
        setAdminSection,
        setMemberSection,
        selectedPaymentIdForReview,
        setSelectedPaymentIdForReview,
        selectedMemberIdForProfile,
        setSelectedMemberIdForProfile,
        selectedLoanAppIdForReview,
        setSelectedLoanAppIdForReview,
        isMakePaymentDrawerOpen,
        setIsMakePaymentDrawerOpen,
        activeSms,
        dismissSms: () => setActiveSms(null),
        verifyAdminLogin,
        sendPhoneOtp,
        verifyLoginOtp,
        verifyRegistrationOtp,
        quickSwitchToAdmin,
        quickSwitchToMember,
        signOut,
        members: state.members,
        payments: state.payments,
        loans: state.loans,
        loanApplications: state.loanApplications,
        transactions: state.transactions,
        notifications: state.notifications,
        currentMember,
        metrics,
        submitPayment,
        approvePayment,
        rejectPayment,
        submitLoanApplication,
        respondAsGuarantor,
        adminApproveLoanApp,
        adminRejectLoanApp,
        adminDisburseLoanApp,
        registerNewMember,
        updateMemberStatus,
        markNotificationRead,
        markAllNotificationsRead,
        resetDemoData,
        toastMessage,
        showToast,
        clearToast: () => setToastMessage(null),
      }}
    >
      {children}
    </CooperativeContext.Provider>
  );
}

export function useCooperative() {
  const ctx = useContext(CooperativeContext);
  if (!ctx) throw new Error('useCooperative must be used within CooperativeProvider');
  return ctx;
}
