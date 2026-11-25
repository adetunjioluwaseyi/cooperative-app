import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Landmark,
  Lock,
  Mail,
  Phone,
  ShieldCheck,
  UserCheck,
  Users,
} from 'lucide-react';
import { AUTHORIZED_ADMINS, COOP_NAME } from '../../data/seedData';
import { useCooperative } from '../../store/CooperativeContext';
import { Button } from '../ui/DesignSystem';

type LoginTab = 'member' | 'admin';

export function PhoneOtpAuthScreen() {
  const {
    members,
    sendPhoneOtp,
    verifyLoginOtp,
    verifyAdminLogin,
    activeSms,
  } = useCooperative();

  const [loginTab, setLoginTab] = useState<LoginTab>('member');

  // Member OTP Login state
  const [memberStep, setMemberStep] = useState<'phone' | 'otp'>('phone');
  const [phoneInput, setPhoneInput] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [resolvedMember, setResolvedMember] = useState('');
  const [countdown, setCountdown] = useState(0);

  // Admin Login state
  const [adminIdentifier, setAdminIdentifier] = useState('');
  const [adminPasscode, setAdminPasscode] = useState('');
  const [showPasscode, setShowPasscode] = useState(false);

  const [error, setError] = useState('');

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setInterval(() => setCountdown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(t);
  }, [countdown]);

  const switchTab = (tab: LoginTab) => {
    setLoginTab(tab);
    setError('');
  };

  const handleRequestMemberOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const res = sendPhoneOtp(phoneInput, 'Member Login');
    if (!res.ok) {
      setError(res.error || 'Unable to send verification code.');
      return;
    }
    setResolvedMember(res.resolvedName || '');
    setOtpInput('');
    setCountdown(60);
    setMemberStep('otp');
  };

  const handleVerifyMemberOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const res = verifyLoginOtp(phoneInput, otpInput);
    if (!res.ok) {
      setError(res.error || 'OTP verification failed.');
    }
  };

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const res = verifyAdminLogin(adminIdentifier, adminPasscode);
    if (!res.ok) {
      setError(res.error || 'Unable to sign in.');
    }
  };

  const activeProfiledMembers = members.filter((m) => m.status === 'Active').slice(0, 5);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col lg:flex-row">
      {/* Left Cooperative Trust Landing Panel */}
      <div className="lg:w-[46%] bg-[#0F172A] text-white p-8 sm:p-12 lg:p-14 flex flex-col justify-between">
        <div>
          <div className="inline-flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-[#15803D] flex items-center justify-center">
              <Landmark className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight font-display">{COOP_NAME}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold leading-tight mt-10 max-w-lg">
            Simple, clear cooperative savings and loans you can trust.
          </h1>
          <p className="text-base sm:text-lg text-slate-300 mt-4 max-w-lg leading-relaxed">
            Make every member understand exactly where their money is and make every administrator understand exactly what is happening.
          </p>

          <div className="mt-10 space-y-5 border-t border-slate-800 pt-8 max-w-md">
            <div className="flex items-start gap-3.5">
              <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-white text-base">
                  Restricted to Authorized &amp; Profiled Users
                </p>
                <p className="text-sm text-slate-300 mt-0.5">
                  Only cooperative members profiled by the office and authorized cooperative administrators can access this portal.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3.5">
              <KeyRound className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-white text-base">
                  Phone Number SMS OTP for Members
                </p>
                <p className="text-sm text-slate-300 mt-0.5">
                  Members sign in safely using their registered phone number and a 6-digit one-time SMS verification code — no passwords to forget.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3.5">
              <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-white text-base">
                  One Transfer, Multiple Allocations
                </p>
                <p className="text-sm text-slate-300 mt-0.5">
                  Split a single bank transfer between Savings and Loan Repayment with full receipt verification and transparent history.
                </p>
              </div>
            </div>
          </div>
        </div>

        <p className="text-sm text-slate-400 mt-10">
          Unity Staff Multi-Purpose Cooperative Society Ltd · Lagos, Nigeria
        </p>
      </div>

      {/* Right Login Card & Authorized Credentials Reference */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 lg:p-14">
        <div className="w-full max-w-lg space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-7 sm:p-9 space-y-6">
            {/* Role Selector Tabs */}
            <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() => switchTab('member')}
                className={`min-h-[46px] px-4 py-2.5 rounded-lg text-[15px] font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                  loginTab === 'member'
                    ? 'bg-white text-[#14532D] shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Member Login</span>
              </button>
              <button
                type="button"
                onClick={() => switchTab('admin')}
                className={`min-h-[46px] px-4 py-2.5 rounded-lg text-[15px] font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                  loginTab === 'admin'
                    ? 'bg-white text-[#14532D] shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <UserCheck className="w-4 h-4" />
                <span>Admin Login</span>
              </button>
            </div>

            {error && (
              <div
                role="alert"
                className="p-4 rounded-lg bg-[#FEF2F2] border border-[#FECACA] text-[#991B1B] text-[15px] font-medium"
              >
                {error}
              </div>
            )}

            {/* MEMBER LOGIN FLOW (PHONE NUMBER + SMS OTP) */}
            {loginTab === 'member' ? (
              memberStep === 'phone' ? (
                <form onSubmit={handleRequestMemberOtp} className="space-y-5">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">Member Sign In</h2>
                    <p className="text-[15px] text-slate-600 mt-1">
                      Enter your profiled cooperative phone number to receive a 6-digit SMS OTP code.
                    </p>
                  </div>

                  <div>
                    <label
                      htmlFor="member-otp-phone"
                      className="block text-[15px] font-semibold text-slate-800 mb-2"
                    >
                      Registered Member Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="w-5 h-5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        id="member-otp-phone"
                        type="tel"
                        value={phoneInput}
                        onChange={(e) => setPhoneInput(e.target.value)}
                        placeholder="+234 802 511 0125"
                        className="w-full min-h-[50px] pl-11 pr-4 rounded-lg border border-slate-300 text-base font-mono text-slate-900 focus:border-[#15803D] focus:ring-2 focus:ring-[#15803D]/20"
                        required
                      />
                    </div>
                    <p className="text-sm text-slate-500 mt-1.5">
                      Only active members registered by the cooperative office can sign in.
                    </p>
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full"
                    icon={<KeyRound className="w-5 h-5" />}
                  >
                    Send 6-Digit SMS OTP
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleVerifyMemberOtp} className="space-y-5">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">Enter 6-Digit SMS OTP</h2>
                    <p className="text-[15px] text-slate-600 mt-1">
                      Verification code sent to <strong className="font-mono text-slate-900">{phoneInput}</strong>
                      {resolvedMember ? ` (${resolvedMember})` : ''}.
                    </p>
                  </div>

                  <div>
                    <label
                      htmlFor="member-otp-code"
                      className="block text-[15px] font-semibold text-slate-800 mb-2"
                    >
                      6-Digit Verification Code
                    </label>
                    <input
                      id="member-otp-code"
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={otpInput}
                      onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                      placeholder="000000"
                      className="w-full min-h-[54px] px-4 rounded-lg border border-slate-300 text-2xl font-mono font-bold tracking-[0.35em] text-center text-slate-900 focus:border-[#15803D] focus:ring-2 focus:ring-[#15803D]/20"
                      required
                    />
                    {activeSms && (
                      <div className="mt-2.5 flex items-center justify-between text-sm bg-[#ECFDF5] border border-[#BBF7D0] rounded-lg px-3.5 py-2.5 text-[#14532D]">
                        <span>
                          Delivered SMS Code: <strong className="font-mono text-base">{activeSms.code}</strong>
                        </span>
                        <button
                          type="button"
                          onClick={() => setOtpInput(activeSms.code)}
                          className="font-bold underline hover:text-[#166534] cursor-pointer"
                        >
                          Fill code
                        </button>
                      </div>
                    )}
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full"
                    icon={<ShieldCheck className="w-5 h-5" />}
                  >
                    Verify OTP &amp; Sign In
                  </Button>

                  <div className="flex items-center justify-between pt-1 text-sm">
                    <button
                      type="button"
                      onClick={() => {
                        setMemberStep('phone');
                        setError('');
                      }}
                      className="inline-flex items-center gap-1.5 font-semibold text-slate-700 hover:text-slate-900 cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Change Phone Number
                    </button>
                    <button
                      type="button"
                      disabled={countdown > 0}
                      onClick={() => {
                        const res = sendPhoneOtp(phoneInput, 'Member Login');
                        if (res.ok) setCountdown(60);
                      }}
                      className="font-semibold text-[#15803D] disabled:text-slate-400 cursor-pointer disabled:cursor-not-allowed"
                    >
                      {countdown > 0 ? `Resend in ${countdown}s` : 'Resend OTP'}
                    </button>
                  </div>
                </form>
              )
            ) : (
              /* AUTHORIZED ADMIN LOGIN FLOW */
              <form onSubmit={handleAdminSubmit} className="space-y-5">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Administrator Sign In</h2>
                  <p className="text-[15px] text-slate-600 mt-1">
                    Restricted to authorized Unity Cooperative officers. Enter your official email (or phone) and passcode.
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="admin-identifier"
                    className="block text-[15px] font-semibold text-slate-800 mb-2"
                  >
                    Authorized Admin Email or Phone
                  </label>
                  <div className="relative">
                    <Mail className="w-5 h-5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="admin-identifier"
                      type="text"
                      value={adminIdentifier}
                      onChange={(e) => setAdminIdentifier(e.target.value)}
                      placeholder="admin@unitycoop.org.ng"
                      className="w-full min-h-[50px] pl-11 pr-4 rounded-lg border border-slate-300 text-base text-slate-900 focus:border-[#15803D] focus:ring-2 focus:ring-[#15803D]/20"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="admin-passcode"
                    className="block text-[15px] font-semibold text-slate-800 mb-2"
                  >
                    Administrator Passcode
                  </label>
                  <div className="relative">
                    <Lock className="w-5 h-5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="admin-passcode"
                      type={showPasscode ? 'text' : 'password'}
                      value={adminPasscode}
                      onChange={(e) => setAdminPasscode(e.target.value)}
                      placeholder="Enter administrator passcode"
                      className="w-full min-h-[50px] pl-11 pr-12 rounded-lg border border-slate-300 text-base text-slate-900 focus:border-[#15803D] focus:ring-2 focus:ring-[#15803D]/20"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasscode((s) => !s)}
                      aria-label={showPasscode ? 'Hide passcode' : 'Show passcode'}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-500 hover:text-slate-800 cursor-pointer"
                    >
                      {showPasscode ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  icon={<ShieldCheck className="w-5 h-5" />}
                >
                  Sign In to Admin Portal
                </Button>
              </form>
            )}
          </div>

          {/* Authorized Demo Accounts Reference (Prefills Inputs Only — Never Bypasses Auth) */}
          {/* <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {loginTab === 'member'
                  ? 'Profiled Member Accounts (OTP Login)'
                  : 'Authorized Administrator Accounts'}
              </h3>
              <p className="text-sm text-slate-600 mt-0.5">
                {loginTab === 'member'
                  ? 'Click Fill Phone to test OTP authentication with a profiled cooperative member.'
                  : 'Click Fill Credentials to test signing in as an authorized administrator.'}
              </p>
            </div>

            {loginTab === 'member' ? (
              <div className="divide-y divide-slate-200">
                {activeProfiledMembers.map((m) => (
                  <div key={m.id} className="py-2.5 flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-bold text-slate-900">
                        {m.fullName}{' '}
                        <span className="font-mono font-normal text-slate-500">({m.id})</span>
                      </p>
                      <p className="text-xs font-mono text-slate-600">
                        {m.phoneNumber}
                        {m.id === 'MB-00108' ? ' · Joined < 6 mos (Ineligible for loan)' : ''}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setPhoneInput(m.phoneNumber);
                        setMemberStep('phone');
                        setError('');
                      }}
                      className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-800 cursor-pointer"
                    >
                      Fill Phone
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="divide-y divide-slate-200">
                {AUTHORIZED_ADMINS.map((adm) => (
                  <div key={adm.id} className="py-2.5 flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-bold text-slate-900">
                        {adm.name} · <span className="font-normal text-slate-600">{adm.title}</span>
                      </p>
                      <p className="text-xs font-mono text-slate-600">
                        {adm.email} · Passcode: {adm.passcode}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setAdminIdentifier(adm.email);
                        setAdminPasscode(adm.passcode);
                        setError('');
                      }}
                      className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-800 cursor-pointer"
                    >
                      Fill Credentials
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div> */}
        </div>
      </div>
    </div>
  );
}
