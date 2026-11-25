import React, { useState } from 'react';
import {
  ArrowLeftRight,
  Bell,
  ChevronDown,
  ClipboardCheck,
  CreditCard,
  FilePlus2,
  History,
  Landmark,
  LayoutDashboard,
  LogOut,
  Menu,
  PiggyBank,
  Settings,
  User,
  Users,
  Wallet,
  X,
} from 'lucide-react';
import { COOP_NAME } from '../../data/seedData';
import { useCooperative } from '../../store/CooperativeContext';
import { AdminSection, MemberSection } from '../../types/cooperative';
import { MemberAvatar } from '../ui/DesignSystem';

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const {
    session,
    adminSection,
    memberSection,
    setAdminSection,
    setMemberSection,
    setIsMakePaymentDrawerOpen,
    members,
    notifications,
    metrics,
    quickSwitchToAdmin,
    quickSwitchToMember,
    signOut,
  } = useCooperative();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [switcherOpen, setSwitcherOpen] = useState(false);

  if (!session) return null;

  const isAdmin = session.role === 'admin';

  const adminUnreadCount = notifications.filter((n) => n.audience === 'admin' && !n.read).length;
  const memberUnreadCount = notifications.filter(
    (n) => n.audience === 'member' && n.memberId === session.memberId && !n.read
  ).length;

  const adminNav: { id: AdminSection; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'members', label: 'Members', icon: <Users className="w-5 h-5" /> },
    { id: 'savings', label: 'Savings', icon: <PiggyBank className="w-5 h-5" /> },
    { id: 'loans', label: 'Loans', icon: <Wallet className="w-5 h-5" /> },
    {
      id: 'payments',
      label: 'Payments',
      icon: <ClipboardCheck className="w-5 h-5" />,
      badge: metrics.pendingPaymentsCount > 0 ? metrics.pendingPaymentsCount : undefined,
    },
    {
      id: 'loan-applications',
      label: 'Loan Applications',
      icon: <FilePlus2 className="w-5 h-5" />,
      badge: metrics.pendingLoanAppsCount > 0 ? metrics.pendingLoanAppsCount : undefined,
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: <Bell className="w-5 h-5" />,
      badge: adminUnreadCount > 0 ? adminUnreadCount : undefined,
    },
    { id: 'transactions', label: 'Transactions', icon: <History className="w-5 h-5" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
  ];

  const memberNav: { id: MemberSection; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'my-savings', label: 'My Savings', icon: <PiggyBank className="w-5 h-5" /> },
    { id: 'my-loan', label: 'My Loan', icon: <Wallet className="w-5 h-5" /> },
    { id: 'make-payment', label: 'Make Payment', icon: <CreditCard className="w-5 h-5" /> },
    { id: 'apply-loan', label: 'Apply for Loan', icon: <FilePlus2 className="w-5 h-5" /> },
    { id: 'transactions', label: 'Transactions', icon: <History className="w-5 h-5" /> },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: <Bell className="w-5 h-5" />,
      badge: memberUnreadCount > 0 ? memberUnreadCount : undefined,
    },
    { id: 'profile', label: 'Profile', icon: <User className="w-5 h-5" /> },
  ];

  const activeTitle = isAdmin
    ? adminNav.find((i) => i.id === adminSection)?.label ?? 'Dashboard'
    : memberNav.find((i) => i.id === memberSection)?.label ?? 'Dashboard';

  const handleNavClick = (id: string) => {
    if (isAdmin) {
      setAdminSection(id as AdminSection);
    } else {
      if (id === 'make-payment') {
        setIsMakePaymentDrawerOpen(true);
      } else {
        setMemberSection(id as MemberSection);
      }
    }
    setMobileMenuOpen(false);
  };

  const renderSidebarLinks = () => {
    const items = isAdmin ? adminNav : memberNav;
    const currentId = isAdmin ? adminSection : memberSection;

    return (
      <nav aria-label="Primary Navigation" className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {items.map((item) => {
          const active = currentId === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleNavClick(item.id)}
              className={`w-full min-h-[46px] px-3.5 py-2.5 rounded-lg flex items-center justify-between gap-3 text-[15px] font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                active
                  ? 'bg-[#ECFDF5] text-[#14532D] border border-[#BBF7D0]'
                  : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 border border-transparent'
              }`}
            >
              <span className="flex items-center gap-3 min-w-0">
                <span className={active ? 'text-[#15803D]' : 'text-slate-500'}>{item.icon}</span>
                <span className="truncate">{item.label}</span>
              </span>
              {item.badge !== undefined && (
                <span
                  className={`text-xs font-bold font-mono tabular-nums px-2 py-0.5 rounded-md ${
                    active ? 'bg-[#15803D] text-white' : 'bg-[#FFFBEB] text-[#92400E] border border-[#FDE68A]'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    );
  };

  const mobileBottomItems = isAdmin
    ? [
        { id: 'dashboard', label: 'Home', icon: <LayoutDashboard className="w-5 h-5" /> },
        { id: 'payments', label: 'Payments', icon: <ClipboardCheck className="w-5 h-5" /> },
        { id: 'members', label: 'Members', icon: <Users className="w-5 h-5" /> },
        { id: 'loans', label: 'Loans', icon: <Wallet className="w-5 h-5" /> },
      ]
    : [
        { id: 'dashboard', label: 'Home', icon: <LayoutDashboard className="w-5 h-5" /> },
        { id: 'my-savings', label: 'Savings', icon: <PiggyBank className="w-5 h-5" /> },
        { id: 'make-payment', label: 'Pay', icon: <CreditCard className="w-5 h-5" /> },
        { id: 'my-loan', label: 'Loan', icon: <Wallet className="w-5 h-5" /> },
      ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      {/* Desktop Left Sidebar */}
      <aside className="hidden lg:flex lg:flex-col w-[268px] shrink-0 bg-white border-r border-slate-200 sticky top-0 h-screen">
        <div className="px-5 py-5 border-b border-slate-200 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#15803D] flex items-center justify-center shrink-0">
            <Landmark className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-base font-bold text-slate-900 truncate font-display">{COOP_NAME}</p>
            <p className="text-xs font-medium text-slate-500">
              {isAdmin ? 'Admin Portal' : 'Member Portal'}
            </p>
          </div>
        </div>

        {renderSidebarLinks()}

        <div className="p-4 border-t border-slate-200 space-y-2">
          <div className="flex items-center gap-3 px-2 py-1.5">
            <MemberAvatar name={session.displayName} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-slate-900 truncate">{session.displayName}</p>
              <p className="text-xs text-slate-500 font-mono truncate">{session.phoneNumber}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={signOut}
            className="w-full min-h-[42px] px-3 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out (OTP Login)</span>
          </button>
        </div>
      </aside>

      {/* Mobile Slide-Over Menu Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/50"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <div className="relative z-10 w-[290px] max-w-[85vw] bg-white h-full flex flex-col shadow-2xl">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-[#15803D] flex items-center justify-center">
                  <Landmark className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-slate-900 font-display">{COOP_NAME}</span>
              </div>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close navigation menu"
                className="p-2 rounded-lg text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {renderSidebarLinks()}
            <div className="p-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  signOut();
                }}
                className="w-full min-h-[44px] px-4 rounded-lg border border-slate-300 text-slate-800 text-sm font-semibold flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out (OTP Login)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col pb-20 lg:pb-0">
        {/* Top Contextual Header */}
        <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-4 sm:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open navigation menu"
              className="lg:hidden min-h-[42px] min-w-[42px] flex items-center justify-center rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <span className="hidden sm:inline">{isAdmin ? 'Admin' : 'Member'}</span>
                <span className="hidden sm:inline" aria-hidden="true">/</span>
                <h1 className="text-base sm:text-lg font-bold text-slate-900 truncate">
                  {activeTitle}
                </h1>
              </div>
            </div>
          </div>

          {/* Account Action / Admin Member Preview */}
          <div className="relative shrink-0 flex items-center gap-2.5">
            {isAdmin ? (
              <>
                <button
                  type="button"
                  onClick={() => setSwitcherOpen((o) => !o)}
                  className="min-h-[42px] px-3.5 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-sm font-semibold text-slate-800 inline-flex items-center gap-2 cursor-pointer whitespace-nowrap"
                >
                  <ArrowLeftRight className="w-4 h-4 text-[#15803D]" />
                  <span className="hidden sm:inline">Admin Portal</span>
                  <ChevronDown className="w-4 h-4 text-slate-500" />
                </button>

                {switcherOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setSwitcherOpen(false)}
                      aria-hidden="true"
                    />
                    <div className="absolute right-0 top-12 w-80 bg-white rounded-xl border border-slate-200 shadow-xl z-50 p-2">
                      <div className="px-3 py-2 border-b border-slate-100">
                        <p className="text-xs font-semibold text-slate-500">
                          Authorized Admin · Preview Member View
                        </p>
                      </div>
                      <div className="max-h-60 overflow-y-auto py-1 space-y-0.5">
                        {members
                          .filter((m) => m.status === 'Active')
                          .map((m) => (
                            <button
                              key={m.id}
                              type="button"
                              onClick={() => {
                                quickSwitchToMember(m.id);
                                setSwitcherOpen(false);
                              }}
                              className="w-full text-left px-3 py-2 rounded-lg text-sm flex items-center justify-between gap-2 hover:bg-slate-50 text-slate-800 cursor-pointer"
                            >
                              <span className="truncate">{m.fullName}</span>
                              <span className="text-xs font-mono text-slate-500 shrink-0">{m.id}</span>
                            </button>
                          ))}
                      </div>
                      <div className="pt-2 mt-1 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => {
                            setSwitcherOpen(false);
                            signOut();
                          }}
                          className="w-full text-left px-3 py-2 rounded-lg text-sm font-semibold text-[#B91C1C] hover:bg-[#FEF2F2] cursor-pointer"
                        >
                          Sign Out to Login Page
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </>
            ) : (
              <button
                type="button"
                onClick={signOut}
                className="min-h-[42px] px-3.5 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-sm font-semibold text-slate-800 inline-flex items-center gap-2 cursor-pointer whitespace-nowrap"
              >
                <LogOut className="w-4 h-4 text-slate-600" />
                <span>Sign Out</span>
              </button>
            )}
          </div>
        </header>

        {/* Page Viewport */}
        <main className="flex-1 w-full max-w-[1360px] mx-auto px-4 sm:px-8 py-6 sm:py-8">
          {children}
        </main>
      </div>

      {/* Compact Mobile Bottom Navigation (≤ 15% viewport height) */}
      <nav
        aria-label="Mobile Navigation"
        className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-white border-t border-slate-200 grid grid-cols-4 h-16"
      >
        {mobileBottomItems.map((item) => {
          const active = (isAdmin ? adminSection : memberSection) === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleNavClick(item.id)}
              className={`flex flex-col items-center justify-center gap-0.5 text-xs font-semibold ${
                active ? 'text-[#15803D]' : 'text-slate-600'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
