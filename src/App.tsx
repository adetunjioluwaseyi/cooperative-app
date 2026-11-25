import React, { useState } from 'react';
import { AdminAddMemberDrawer } from './components/admin/AdminAddMemberDrawer';
import { AdminDashboardOverview } from './components/admin/AdminDashboardOverview';
import { AdminLoanApplications } from './components/admin/AdminLoanApplications';
import { AdminLoans } from './components/admin/AdminLoans';
import { AdminMembers } from './components/admin/AdminMembers';
import { AdminNotifications } from './components/admin/AdminNotifications';
import { AdminPaymentVerification } from './components/admin/AdminPaymentVerification';
import { AdminSavings } from './components/admin/AdminSavings';
import { AdminSettings } from './components/admin/AdminSettings';
import { AdminTransactions } from './components/admin/AdminTransactions';
import { PhoneOtpAuthScreen } from './components/auth/PhoneOtpAuthScreen';
import { AppShell } from './components/layout/AppShell';
import { MemberApplyLoan } from './components/member/MemberApplyLoan';
import { MemberDashboardOverview } from './components/member/MemberDashboardOverview';
import { MemberLoan } from './components/member/MemberLoan';
import { MemberMakePaymentDrawer } from './components/member/MemberMakePaymentDrawer';
import { MemberNotifications } from './components/member/MemberNotifications';
import { MemberProfile } from './components/member/MemberProfile';
import { MemberSavings } from './components/member/MemberSavings';
import { MemberTransactions } from './components/member/MemberTransactions';
import { GlobalToast, SimulatedSmsToast } from './components/ui/DesignSystem';
import { CooperativeProvider, useCooperative } from './store/CooperativeContext';

function CooperativeWorkspace() {
  const {
    session,
    adminSection,
    memberSection,
    setAdminSection,
    setSelectedMemberIdForProfile,
    activeSms,
    dismissSms,
    toastMessage,
    clearToast,
  } = useCooperative();

  const [addMemberOpen, setAddMemberOpen] = useState(false);

  const renderAdminContent = () => {
    switch (adminSection) {
      case 'dashboard':
        return <AdminDashboardOverview onOpenAddMember={() => setAddMemberOpen(true)} />;
      case 'members':
        return <AdminMembers onOpenAddMember={() => setAddMemberOpen(true)} />;
      case 'savings':
        return <AdminSavings />;
      case 'loans':
        return <AdminLoans />;
      case 'payments':
        return <AdminPaymentVerification />;
      case 'loan-applications':
        return <AdminLoanApplications />;
      case 'notifications':
        return <AdminNotifications />;
      case 'transactions':
        return <AdminTransactions />;
      case 'settings':
        return <AdminSettings />;
      default:
        return <AdminDashboardOverview onOpenAddMember={() => setAddMemberOpen(true)} />;
    }
  };

  const renderMemberContent = () => {
    switch (memberSection) {
      case 'dashboard':
        return <MemberDashboardOverview />;
      case 'my-savings':
        return <MemberSavings />;
      case 'my-loan':
        return <MemberLoan />;
      case 'apply-loan':
        return <MemberApplyLoan />;
      case 'transactions':
        return <MemberTransactions />;
      case 'notifications':
        return <MemberNotifications />;
      case 'profile':
        return <MemberProfile />;
      default:
        return <MemberDashboardOverview />;
    }
  };

  return (
    <>
      {!session ? (
        <PhoneOtpAuthScreen />
      ) : (
        <AppShell>
          {session.role === 'admin' ? renderAdminContent() : renderMemberContent()}
        </AppShell>
      )}

      {/* Global Side Drawers */}
      {session?.role === 'admin' && (
        <AdminAddMemberDrawer
          open={addMemberOpen}
          onClose={() => setAddMemberOpen(false)}
          onViewProfile={(memberId) => {
            setAdminSection('members');
            setSelectedMemberIdForProfile(memberId);
          }}
        />
      )}

      {session?.role === 'member' && <MemberMakePaymentDrawer />}

      {/* Simulated SMS OTP Delivery Notification & Global Toast */}
      <SimulatedSmsToast sms={activeSms} onDismiss={dismissSms} />
      <GlobalToast toast={toastMessage} onClose={clearToast} />
    </>
  );
}

export default function App() {
  return (
    <CooperativeProvider>
      <CooperativeWorkspace />
    </CooperativeProvider>
  );
}
