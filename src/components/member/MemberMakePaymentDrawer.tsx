import React, { useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  Check,
  CheckCircle2,
  Copy,
  FileCheck2,
  Split,
  Upload,
} from 'lucide-react';
import { COOP_BANK_DETAILS, formatNaira } from '../../data/seedData';
import { useCooperative } from '../../store/CooperativeContext';
import { PaymentType } from '../../types/cooperative';
import { Button, SideDrawer, StatusBadge } from '../ui/DesignSystem';

export function MemberMakePaymentDrawer() {
  const {
    currentMember,
    isMakePaymentDrawerOpen,
    setIsMakePaymentDrawerOpen,
    submitPayment,
  } = useCooperative();

  const [paymentType, setPaymentType] = useState<PaymentType>('Savings + Loan');
  const [totalAmount, setTotalAmount] = useState('100000');
  const [savingsAlloc, setSavingsAlloc] = useState('50000');
  const [loanAlloc, setLoanAlloc] = useState('50000');
  const [bankName, setBankName] = useState('Guaranty Trust Bank (GTBank)');
  const [bankReference, setBankReference] = useState('');
  const [note, setNote] = useState('');

  const [receiptName, setReceiptName] = useState('');
  const [receiptType, setReceiptType] = useState<'JPG' | 'PNG' | 'PDF'>('JPG');
  const [receiptDataUrl, setReceiptDataUrl] = useState<string | undefined>(undefined);
  const [uploadError, setUploadError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [submittedSuccess, setSubmittedSuccess] = useState<{
    total: number;
    savings: number;
    loan: number;
    type: PaymentType;
  } | null>(null);
  const [copiedAcct, setCopiedAcct] = useState(false);

  if (!currentMember) return null;

  const totalNum = Number(totalAmount) || 0;
  const savingsNum =
    paymentType === 'Savings'
      ? totalNum
      : paymentType === 'Loan Repayment'
      ? 0
      : Number(savingsAlloc) || 0;
  const loanNum =
    paymentType === 'Loan Repayment'
      ? totalNum
      : paymentType === 'Savings'
      ? 0
      : Number(loanAlloc) || 0;

  const splitSum = savingsNum + loanNum;
  const splitMismatch = paymentType === 'Savings + Loan' && totalNum > 0 && splitSum !== totalNum;

  const resetForm = () => {
    setPaymentType('Savings + Loan');
    setTotalAmount('100000');
    setSavingsAlloc('50000');
    setLoanAlloc('50000');
    setBankReference('');
    setNote('');
    setReceiptName('');
    setReceiptDataUrl(undefined);
    setUploadError('');
    setSubmitError('');
    setSubmittedSuccess(null);
  };

  const handleClose = () => {
    resetForm();
    setIsMakePaymentDrawerOpen(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError('');
    const file = e.target.files?.[0];
    if (!file) return;

    const ext = file.name.split('.').pop()?.toUpperCase();
    if (!ext || !['JPG', 'JPEG', 'PNG', 'PDF'].includes(ext)) {
      setUploadError('Unsupported file format. Please upload a JPG, PNG, or PDF receipt.');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setUploadError('Receipt file is too large. Please upload a file smaller than 8 MB.');
      return;
    }

    const mappedType: 'JPG' | 'PNG' | 'PDF' =
      ext === 'PDF' ? 'PDF' : ext === 'PNG' ? 'PNG' : 'JPG';
    setReceiptName(file.name);
    setReceiptType(mappedType);

    if (mappedType !== 'PDF') {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') setReceiptDataUrl(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setReceiptDataUrl(undefined);
    }
  };

  const attachSampleReceipt = () => {
    setUploadError('');
    setReceiptName(`BankTransfer_${currentMember.fullName.replace(/\s+/g, '')}_Receipt.jpg`);
    setReceiptType('JPG');
    setReceiptDataUrl(undefined);
    if (!bankReference) {
      setBankReference(`GTB-${Math.floor(1000000000 + Math.random() * 8999999999)}`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');

    if (totalNum <= 0) {
      setSubmitError('Please enter a valid total transfer amount greater than ₦0.');
      return;
    }
    if (paymentType === 'Savings + Loan') {
      if (savingsNum <= 0 || loanNum <= 0) {
        setSubmitError(
          'For a combined payment, please enter amounts greater than ₦0 for both Savings and Loan Repayment.'
        );
        return;
      }
      if (savingsNum + loanNum !== totalNum) {
        setSubmitError(
          `Allocation does not match your Total Payment. Savings (${formatNaira(savingsNum)}) + Loan Repayment (${formatNaira(loanNum)}) = ${formatNaira(splitSum)}, which must equal ${formatNaira(totalNum)}.`
        );
        return;
      }
    }
    if (!receiptName) {
      setSubmitError('Please upload your bank transfer receipt (JPG, PNG, or PDF) before submitting.');
      return;
    }

    submitPayment({
      memberId: currentMember.id,
      paymentType,
      totalAmount: totalNum,
      savingsAllocation: savingsNum,
      loanAllocation: loanNum,
      description:
        note.trim() ||
        (paymentType === 'Savings + Loan'
          ? `Single transfer allocated: ${formatNaira(savingsNum)} Savings + ${formatNaira(loanNum)} Loan Repayment`
          : `${paymentType} bank transfer`),
      receiptName,
      receiptType,
      receiptDataUrl,
      bankName,
      bankReference: bankReference.trim() || `TRF-${Math.floor(1000000000 + Math.random() * 8999999999)}`,
    });

    setSubmittedSuccess({
      total: totalNum,
      savings: savingsNum,
      loan: loanNum,
      type: paymentType,
    });
  };

  return (
    <SideDrawer
      open={isMakePaymentDrawerOpen}
      onClose={handleClose}
      title={submittedSuccess ? 'Payment Submitted' : 'Make Payment'}
      subtitle={
        submittedSuccess
          ? 'Your transfer receipt has been sent to the cooperative administrator.'
          : 'Transfer to the cooperative account and upload your receipt for confirmation.'
      }
      widthClass="max-w-2xl"
      footer={
        !submittedSuccess ? (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Button variant="secondary" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              size="lg"
              onClick={handleSubmit}
              disabled={splitMismatch || totalNum <= 0}
              icon={<CheckCircle2 className="w-5 h-5" />}
            >
              Submit Payment ({formatNaira(totalNum)})
            </Button>
          </div>
        ) : undefined
      }
    >
      {submittedSuccess ? (
        /* SUCCESS CONFIRMATION (Section 32) */
        <div className="py-6 space-y-6">
          <div className="rounded-xl bg-[#ECFDF5] border border-[#BBF7D0] p-6 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-[#15803D] text-white flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900">Payment submitted successfully.</h3>
            <div className="pt-1">
              <StatusBadge status="Pending Confirmation" />
            </div>
            <p className="text-[15px] text-slate-700 max-w-md mx-auto pt-1">
              The cooperative administrator has been notified. Once your transfer is verified, your balances will update automatically.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-3">
            <div className="flex justify-between text-base">
              <span className="text-slate-600">Total Transfer Submitted</span>
              <strong className="font-mono text-lg text-slate-900">
                {formatNaira(submittedSuccess.total)}
              </strong>
            </div>
            {submittedSuccess.savings > 0 && (
              <div className="flex justify-between text-[15px]">
                <span className="text-slate-600">Allocated to Savings</span>
                <strong className="font-mono text-[#15803D]">
                  +{formatNaira(submittedSuccess.savings)}
                </strong>
              </div>
            )}
            {submittedSuccess.loan > 0 && (
              <div className="flex justify-between text-[15px]">
                <span className="text-slate-600">Allocated to Loan Repayment</span>
                <strong className="font-mono text-slate-900">
                  -{formatNaira(submittedSuccess.loan)}
                </strong>
              </div>
            )}
          </div>

          <div className="flex justify-center gap-3">
            <Button variant="secondary" onClick={resetForm}>
              Submit Another Payment
            </Button>
            <Button onClick={handleClose}>Return to Dashboard</Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Signature Feature Highlight Banner (Section 11) */}
          <div className="rounded-xl bg-[#ECFDF5] border border-[#BBF7D0] p-4 flex items-start gap-3">
            <Split className="w-5 h-5 text-[#15803D] shrink-0 mt-0.5" />
            <div>
              <p className="text-[15px] font-bold text-[#14532D]">
                One transfer. Multiple allocations. No need to pay twice.
              </p>
              <p className="text-sm text-[#166534] mt-0.5">
                Send one bank transfer to the cooperative and tell us how much goes to your Savings and how much goes to your Loan.
              </p>
            </div>
          </div>

          {/* Cooperative Bank Details */}
          <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold text-slate-500">Transfer to Cooperative Account</p>
              <p className="text-base font-bold text-slate-900 mt-0.5">
                {COOP_BANK_DETAILS.bankName} ·{' '}
                <span className="font-mono text-[#15803D]">{COOP_BANK_DETAILS.accountNumber}</span>
              </p>
              <p className="text-xs text-slate-600 mt-0.5">{COOP_BANK_DETAILS.accountName}</p>
            </div>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard?.writeText(COOP_BANK_DETAILS.accountNumber).catch(() => {});
                setCopiedAcct(true);
                setTimeout(() => setCopiedAcct(false), 2000);
              }}
              className="min-h-[40px] px-3.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-sm font-semibold text-slate-800 inline-flex items-center gap-1.5 cursor-pointer"
            >
              {copiedAcct ? (
                <>
                  <Check className="w-4 h-4 text-[#15803D]" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy Account</span>
                </>
              )}
            </button>
          </div>

          {submitError && (
            <div className="p-4 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-[#991B1B] text-[15px] font-medium flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <p>{submitError}</p>
            </div>
          )}

          {/* Question 1: What are you paying for? */}
          <div className="space-y-2.5">
            <label className="block text-base font-bold text-slate-900">
              What are you paying for?
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {(
                [
                  { id: 'Savings', label: 'Savings', sub: 'Add to savings balance' },
                  { id: 'Loan Repayment', label: 'Loan Repayment', sub: 'Reduce loan balance' },
                  { id: 'Savings + Loan', label: 'Savings + Loan', sub: 'Split one transfer' },
                ] as { id: PaymentType; label: string; sub: string }[]
              ).map((opt) => {
                const selected = paymentType === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      setPaymentType(opt.id);
                      setSubmitError('');
                      if (opt.id === 'Savings + Loan' && totalNum > 0) {
                        const half = Math.round(totalNum / 2);
                        setSavingsAlloc(String(half));
                        setLoanAlloc(String(totalNum - half));
                      }
                    }}
                    className={`text-left p-4 rounded-xl border-2 transition-colors cursor-pointer ${
                      selected
                        ? 'bg-[#ECFDF5] border-[#15803D]'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <p className={`text-[15px] font-bold ${selected ? 'text-[#14532D]' : 'text-slate-900'}`}>
                      {opt.label}
                    </p>
                    <p className="text-xs text-slate-600 mt-0.5">{opt.sub}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Total Amount */}
          <div>
            <label htmlFor="total-payment-input" className="block text-base font-bold text-slate-900 mb-1.5">
              Total Amount Transferred (₦)
            </label>
            <input
              id="total-payment-input"
              type="number"
              min={1000}
              step={1000}
              value={totalAmount}
              onChange={(e) => {
                const val = e.target.value;
                setTotalAmount(val);
                const n = Number(val) || 0;
                if (paymentType === 'Savings + Loan' && n > 0) {
                  const half = Math.round(n / 2);
                  setSavingsAlloc(String(half));
                  setLoanAlloc(String(n - half));
                }
              }}
              className="w-full min-h-[52px] px-4 rounded-lg border border-slate-300 text-2xl font-mono font-bold tabular-nums text-slate-900"
              required
            />
          </div>

          {/* Allocation Split Box (when Savings + Loan selected) */}
          {paymentType === 'Savings + Loan' && (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h4 className="text-base font-bold text-slate-900">Split Your Single Transfer</h4>
                <button
                  type="button"
                  onClick={() => {
                    const half = Math.round(totalNum / 2);
                    setSavingsAlloc(String(half));
                    setLoanAlloc(String(totalNum - half));
                  }}
                  className="text-sm font-semibold text-[#15803D] hover:underline cursor-pointer"
                >
                  Split 50 / 50
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                    Savings Allocation (₦)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={1000}
                    value={savingsAlloc}
                    onChange={(e) => setSavingsAlloc(e.target.value)}
                    className="w-full min-h-[46px] px-3.5 rounded-lg border border-slate-300 bg-white text-lg font-mono font-bold tabular-nums text-[#15803D]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                    Loan Repayment Allocation (₦)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={1000}
                    value={loanAlloc}
                    onChange={(e) => setLoanAlloc(e.target.value)}
                    className="w-full min-h-[46px] px-3.5 rounded-lg border border-slate-300 bg-white text-lg font-mono font-bold tabular-nums text-slate-900"
                  />
                </div>
              </div>

              {/* Automatic Validation Feedback */}
              {splitMismatch ? (
                <div className="p-3.5 rounded-lg bg-[#FEF2F2] border border-[#FECACA] text-[#991B1B] text-sm font-semibold flex items-center justify-between gap-3">
                  <span>
                    Savings + Loan Repayment ({formatNaira(splitSum)}) must equal Total Payment ({formatNaira(totalNum)}).
                  </span>
                  <button
                    type="button"
                    onClick={() => setLoanAlloc(String(Math.max(0, totalNum - (Number(savingsAlloc) || 0))))}
                    className="underline font-bold shrink-0 cursor-pointer"
                  >
                    Fix Match
                  </button>
                </div>
              ) : (
                <div className="p-3.5 rounded-lg bg-[#ECFDF5] border border-[#BBF7D0] text-[#14532D] text-sm font-semibold">
                  Verified: {formatNaira(savingsNum)} Savings + {formatNaira(loanNum)} Loan Repayment ={' '}
                  {formatNaira(totalNum)} Total Payment
                </div>
              )}
            </div>
          )}

          {/* Live Projected Balances Preview */}
          {!splitMismatch && totalNum > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-white border border-slate-200">
              <div>
                <p className="text-xs font-semibold text-slate-500">Projected Savings After Approval</p>
                <p className="text-sm font-mono tabular-nums text-slate-700 mt-1 flex items-center gap-1.5">
                  <span>{formatNaira(currentMember.savingsBalance)}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#15803D]" />
                  <strong className="text-[#15803D] text-base">
                    {formatNaira(currentMember.savingsBalance + savingsNum)}
                  </strong>
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500">Projected Loan After Approval</p>
                <p className="text-sm font-mono tabular-nums text-slate-700 mt-1 flex items-center gap-1.5">
                  <span>{formatNaira(currentMember.loanBalance)}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#15803D]" />
                  <strong className="text-slate-900 text-base">
                    {formatNaira(Math.max(0, currentMember.loanBalance - loanNum))}
                  </strong>
                </p>
              </div>
            </div>
          )}

          {/* Bank & Reference */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1.5">Your Bank</label>
              <select
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="w-full min-h-[46px] px-3.5 rounded-lg border border-slate-300 bg-white text-[15px]"
              >
                <option>Guaranty Trust Bank (GTBank)</option>
                <option>First Bank of Nigeria</option>
                <option>Zenith Bank Plc</option>
                <option>Access Bank Plc</option>
                <option>United Bank for Africa (UBA)</option>
                <option>Stanbic IBTC Bank</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                Transfer Reference (Optional)
              </label>
              <input
                type="text"
                value={bankReference}
                onChange={(e) => setBankReference(e.target.value)}
                placeholder="e.g. GTB-8849201445"
                className="w-full min-h-[46px] px-3.5 rounded-lg border border-slate-300 text-[15px] font-mono"
              />
            </div>
          </div>

          {/* Upload Payment Receipt (Section 32) */}
          <div className="space-y-2.5">
            <label className="block text-base font-bold text-slate-900">
              Upload Payment Receipt (JPG, PNG, or PDF)
            </label>
            <div className="rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-5 text-center space-y-3">
              {receiptName ? (
                <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-[#BBF7D0] rounded-lg p-3.5 text-left">
                  <div className="flex items-center gap-3 min-w-0">
                    <FileCheck2 className="w-6 h-6 text-[#15803D] shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-900 truncate">{receiptName}</p>
                      <p className="text-xs text-[#15803D] font-semibold">
                        {receiptType} Receipt Attached
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setReceiptName('');
                      setReceiptDataUrl(undefined);
                    }}
                    className="text-sm font-semibold text-[#B91C1C] hover:underline cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <>
                  <Upload className="w-7 h-7 text-slate-500 mx-auto" />
                  <p className="text-[15px] font-medium text-slate-700">
                    Choose a screenshot or PDF of your bank transfer receipt
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
                    <label className="min-h-[42px] px-4 py-2 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-sm font-semibold text-slate-900 cursor-pointer inline-flex items-center gap-2">
                      <span>Choose Receipt File</span>
                      <input
                        type="file"
                        accept=".jpg,.jpeg,.png,.pdf"
                        onChange={handleFileChange}
                        className="sr-only"
                      />
                    </label>
                    <button
                      type="button"
                      onClick={attachSampleReceipt}
                      className="min-h-[42px] px-4 py-2 rounded-lg bg-[#ECFDF5] border border-[#BBF7D0] hover:bg-[#DCFCE7] text-sm font-semibold text-[#14532D] cursor-pointer"
                    >
                      Use Sample Transfer Receipt (Demo)
                    </button>
                  </div>
                </>
              )}
              {uploadError && (
                <p className="text-sm font-semibold text-[#B91C1C]">{uploadError}</p>
              )}
            </div>
          </div>

          {/* Payment Note */}
          <div>
            <label htmlFor="member-pay-note" className="block text-sm font-semibold text-slate-800 mb-1.5">
              Payment Note (Optional)
            </label>
            <textarea
              id="member-pay-note"
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Example: November savings contribution and loan repayment"
              className="w-full p-3 rounded-lg border border-slate-300 text-[15px]"
            />
          </div>
        </form>
      )}
    </SideDrawer>
  );
}
