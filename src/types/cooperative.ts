export type MemberStatus =
  | 'Active'
  | 'Inactive'
  | 'Absconded'
  | 'Deceased'
  | 'Suspended'
  | 'Disengaged';

export type IdentificationType =
  | 'National ID (NIN)'
  | 'International Passport'
  | "Driver's Licence"
  | 'Other Identification';

export interface NextOfKin {
  fullName: string;
  relationship: string;
  phoneNumber: string;
  address: string;
}

export interface Member {
  id: string; // e.g. MB-00125
  fullName: string;
  dateOfBirth: string;
  countryOfBirth: string;
  countryOfCitizenship: string;
  stateOfOrigin: string;
  nationality: string;
  gender: 'Male' | 'Female';
  maritalStatus: 'Single' | 'Married' | 'Widowed' | 'Divorced';

  idType: IdentificationType;
  idNumber: string;
  idIssueDate: string;
  idExpiryDate: string;

  phoneNumber: string;
  phoneVerified: boolean;
  email: string;
  residentialAddress: string;

  employeeStatus: string;
  employeeId: string;
  department: string;
  unit: string;
  position: string;

  insuranceProvider: string;
  insuranceNumber: string;
  insuranceDetails: string;

  registrationGuarantor1: string;
  registrationGuarantor2: string;

  sponsorName: string;
  sponsorDetails: string;

  nextOfKin: NextOfKin;

  membershipDate: string; // YYYY-MM-DD
  status: MemberStatus;

  savingsBalance: number;
  totalContributed: number;
  contributionCount: number;
  lastSavingsDate: string;
  loanBalance: number;
}

export type PaymentType = 'Savings' | 'Loan Repayment' | 'Savings + Loan';
export type PaymentStatus = 'Pending' | 'Approved' | 'Rejected';

export interface PaymentSubmission {
  id: string;
  memberId: string;
  memberName: string;
  paymentType: PaymentType;
  totalAmount: number;
  savingsAllocation: number;
  loanAllocation: number;
  dateSubmitted: string; // YYYY-MM-DD
  submittedTime: string;
  description: string;
  receiptName: string;
  receiptType: 'JPG' | 'PNG' | 'PDF';
  receiptDataUrl?: string;
  bankName: string;
  bankReference: string;
  status: PaymentStatus;
  adminNote?: string;
  reviewedAt?: string;
}

export interface LoanRepaymentRow {
  month: number;
  date: string;
  amountPaid: number;
  principal: number;
  interest: number;
  remainingBalance: number;
  status: 'Paid' | 'Upcoming' | 'Due Soon';
}

export interface LoanRecord {
  id: string;
  memberId: string;
  memberName: string;
  originalAmount: number;
  amountRepaid: number;
  outstandingBalance: number;
  repaymentPeriodMonths: number;
  paymentsMade: number;
  paymentsRemaining: number;
  interestRatePercent: number; // e.g. 1% monthly reducing balance
  nextRepaymentDate: string;
  nextRepaymentAmount: number;
  purpose: string;
  status: 'Active' | 'Repaid';
  disbursedDate: string;
  schedule: LoanRepaymentRow[];
}

export type GuarantorDecision = 'Pending' | 'Approved' | 'Declined';

export interface GuarantorSlot {
  memberId: string;
  memberName: string;
  status: GuarantorDecision;
  reason?: string;
  respondedAt?: string;
}

export type LoanApplicationStatus =
  | 'Awaiting Guarantors'
  | 'Guarantor 1 Approved'
  | 'Guarantor 2 Approved'
  | 'Guarantor Declined'
  | 'Pending Admin Approval'
  | 'Approved'
  | 'Rejected'
  | 'Disbursed'
  | 'Repaid';

export interface LoanApplication {
  id: string;
  applicantId: string;
  applicantName: string;
  amount: number;
  purpose: string;
  repaymentPeriodMonths: number;
  dateSubmitted: string;
  guarantor1: GuarantorSlot;
  guarantor2: GuarantorSlot;
  status: LoanApplicationStatus;
  adminNote?: string;
}

export type TransactionCategory =
  | 'Savings'
  | 'Loan Repayment'
  | 'Loan Disbursement'
  | 'Payment Submission';

export interface TransactionRecord {
  id: string;
  memberId: string;
  memberName: string;
  date: string;
  description: string;
  amount: number;
  direction: 'Added' | 'Deducted';
  category: TransactionCategory;
  paymentMethod: string;
  reference: string;
  status: 'Approved' | 'Pending' | 'Rejected';
  resultingBalance: number;
  balanceLabel: 'Savings Balance' | 'Loan Balance';
}

export type NotificationActionType =
  | 'review_payment'
  | 'review_loan_app'
  | 'guarantor_request'
  | 'view_savings'
  | 'view_loan';

export interface NotificationItem {
  id: string;
  audience: 'admin' | 'member';
  memberId?: string;
  title: string;
  message: string;
  memberName?: string;
  amount?: number;
  paymentType?: PaymentType;
  allocationSummary?: string;
  createdAt: string;
  read: boolean;
  statusLabel?: string;
  actionType?: NotificationActionType;
  targetId?: string;
}

export interface SimulatedSmsMessage {
  id: string;
  phoneNumber: string;
  code: string;
  purpose: string;
  sentAt: string;
}

export type AdminSection =
  | 'dashboard'
  | 'members'
  | 'savings'
  | 'loans'
  | 'payments'
  | 'loan-applications'
  | 'notifications'
  | 'transactions'
  | 'settings';

export type MemberSection =
  | 'dashboard'
  | 'my-savings'
  | 'my-loan'
  | 'make-payment'
  | 'apply-loan'
  | 'transactions'
  | 'notifications'
  | 'profile';

export interface AuthSession {
  role: 'admin' | 'member';
  memberId?: string; // present when role === 'member'
  phoneNumber: string;
  displayName: string;
}
