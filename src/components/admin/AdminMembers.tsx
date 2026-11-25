import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  Lock,
  RotateCcw,
  UserPlus,
  Users,
} from 'lucide-react';
import { formatMembershipDuration, formatNaira, formatShortDate } from '../../data/seedData';
import { useCooperative } from '../../store/CooperativeContext';
import { Member, MemberStatus } from '../../types/cooperative';
import {
  Button,
  EmptyState,
  MemberAvatar,
  Pagination,
  SearchInput,
  SideDrawer,
  StatusBadge,
} from '../ui/DesignSystem';

const ALL_STATUSES: MemberStatus[] = [
  'Active',
  'Inactive',
  'Absconded',
  'Deceased',
  'Suspended',
  'Disengaged',
];

const PAGE_SIZE = 8;

export function AdminMembers({ onOpenAddMember }: { onOpenAddMember: () => void }) {
  const {
    members,
    selectedMemberIdForProfile,
    setSelectedMemberIdForProfile,
    updateMemberStatus,
    setAdminSection,
  } = useCooperative();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | MemberStatus>('All');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return members.filter((m) => {
      if (q && !m.fullName.toLowerCase().includes(q) && !m.id.toLowerCase().includes(q)) {
        return false;
      }
      if (statusFilter !== 'All' && m.status !== statusFilter) return false;
      return true;
    });
  }, [members, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const activeMember: Member | null = useMemo(
    () => members.find((m) => m.id === selectedMemberIdForProfile) ?? null,
    [members, selectedMemberIdForProfile]
  );

  const ReadOnlyField = ({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) => (
    <div>
      <dt className="text-xs font-semibold text-slate-500">{label}</dt>
      <dd className={`text-[15px] font-medium text-slate-900 mt-0.5 ${mono ? 'font-mono' : ''}`}>
        {value || '—'}
      </dd>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Members Management</h2>
          <p className="text-[15px] text-slate-600 mt-1">
            View all cooperative members, update membership status, inspect verified records, or register new members.
          </p>
        </div>
        <Button onClick={onOpenAddMember} icon={<UserPlus className="w-4 h-4" />}>
          Add New Member
        </Button>
      </div>

      {/* Search & Status Filter */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col md:flex-row md:items-end gap-4">
        <SearchInput
          label="Search Member or ID"
          placeholder="Search Member or ID (e.g. Sunday Ojo or MB-00101)"
          value={search}
          onChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
          className="flex-1"
        />
        <div className="w-full md:w-60">
          <label className="block text-sm font-semibold text-slate-800 mb-1.5">Filter by Status</label>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as 'All' | MemberStatus);
              setPage(1);
            }}
            className="w-full min-h-[46px] px-3.5 rounded-lg border border-slate-300 bg-white text-[15px] text-slate-900"
          >
            <option value="All">All Statuses ({members.length})</option>
            {ALL_STATUSES.map((st) => (
              <option key={st} value={st}>
                {st} ({members.filter((m) => m.status === st).length})
              </option>
            ))}
          </select>
        </div>
        {(search || statusFilter !== 'All') && (
          <Button
            variant="secondary"
            onClick={() => {
              setSearch('');
              setStatusFilter('All');
              setPage(1);
            }}
            icon={<RotateCcw className="w-4 h-4" />}
          >
            Clear Filters
          </Button>
        )}
      </div>

      {/* Members Table */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<Users className="w-6 h-6" />}
          title="No cooperative members found"
          description="No members match your search criteria. Clear filters or add a new cooperative member."
          actionLabel="Clear Filters"
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
                  <th className="py-4 px-5">Full Name</th>
                  <th className="py-4 px-4">Member ID</th>
                  <th className="py-4 px-4">Membership Date</th>
                  <th className="py-4 px-4 text-right">Savings Balance</th>
                  <th className="py-4 px-4 text-right">Loan Balance</th>
                  <th className="py-4 px-4">Status</th>
                  <th className="py-4 px-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-[15px]">
                {paginated.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-5 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => setSelectedMemberIdForProfile(m.id)}
                        className="flex items-center gap-3 text-left group cursor-pointer"
                      >
                        <MemberAvatar name={m.fullName} size="sm" />
                        <div>
                          <p className="font-bold text-slate-900 group-hover:text-[#15803D] transition-colors">
                            {m.fullName}
                          </p>
                          <p className="text-xs font-mono text-slate-500">{m.phoneNumber}</p>
                        </div>
                      </button>
                    </td>
                    <td className="py-4 px-4 font-mono text-sm text-slate-700 whitespace-nowrap">
                      {m.id}
                    </td>
                    <td className="py-4 px-4 text-slate-700 whitespace-nowrap">
                      {formatShortDate(m.membershipDate)}
                    </td>
                    <td className="py-4 px-4 text-right font-mono font-bold tabular-nums text-slate-900 whitespace-nowrap">
                      {formatNaira(m.savingsBalance)}
                    </td>
                    <td className="py-4 px-4 text-right font-mono font-semibold tabular-nums text-slate-800 whitespace-nowrap">
                      {formatNaira(m.loanBalance)}
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <StatusBadge status={m.status} />
                        <select
                          aria-label={`Change status for ${m.fullName}`}
                          value={m.status}
                          onChange={(e) => updateMemberStatus(m.id, e.target.value as MemberStatus)}
                          className="min-h-[36px] px-2 rounded-md border border-slate-300 bg-white text-xs font-semibold text-slate-700 cursor-pointer"
                        >
                          {ALL_STATUSES.map((st) => (
                            <option key={st} value={st}>
                              {st}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>
                    <td className="py-4 px-5 text-right whitespace-nowrap">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setSelectedMemberIdForProfile(m.id)}
                      >
                        View Profile
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-5 pb-4">
            <Pagination
              page={safePage}
              totalPages={totalPages}
              totalItems={filtered.length}
              pageSize={PAGE_SIZE}
              onPageChange={setPage}
            />
          </div>
        </div>
      )}

      {/* DETAILED READ-ONLY MEMBER PROFILE SIDE DRAWER (Sections 22, 23, 24) */}
      <SideDrawer
        open={Boolean(activeMember)}
        onClose={() => setSelectedMemberIdForProfile(null)}
        title={activeMember ? activeMember.fullName : 'Member Profile'}
        subtitle={
          activeMember
            ? `${activeMember.id} · Member since ${formatShortDate(activeMember.membershipDate)} (${formatMembershipDuration(activeMember.membershipDate)})`
            : undefined
        }
        widthClass="max-w-3xl"
      >
        {activeMember && (
          <div className="space-y-7">
            {/* Read-Only Verified Notice (Section 23) */}
            <div className="rounded-xl bg-slate-50 border border-slate-200 px-4 py-3.5 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 text-sm font-semibold text-slate-800">
                <Lock className="w-4 h-4 text-[#15803D]" />
                <span>Verified Member Information · Read Only</span>
              </div>
              <span className="text-xs font-medium text-slate-600">
                Personal records cannot be edited directly from this profile.
              </span>
            </div>

            {/* Member Financial Overview (Section 24) */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-900">Member Financial Overview</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-[#ECFDF5] border border-[#BBF7D0]">
                  <p className="text-sm font-semibold text-[#14532D]">Savings · Current Balance</p>
                  <p className="text-2xl font-extrabold font-mono tabular-nums text-slate-900 mt-1.5">
                    {formatNaira(activeMember.savingsBalance)}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-white border border-slate-200">
                  <p className="text-sm font-semibold text-slate-600">Loan · Outstanding Balance</p>
                  <p className="text-2xl font-extrabold font-mono tabular-nums text-slate-900 mt-1.5">
                    {formatNaira(activeMember.loanBalance)}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-white border border-slate-200">
                  <p className="text-sm font-semibold text-slate-600">Membership Status</p>
                  <div className="mt-2">
                    <StatusBadge status={activeMember.status} />
                  </div>
                </div>
              </div>

              {/* Quick Access Links (Section 24) */}
              <div className="flex flex-wrap gap-2.5">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setSelectedMemberIdForProfile(null);
                    setAdminSection('savings');
                  }}
                >
                  <span>View Savings History</span>
                  <ArrowRight className="w-3.5 h-3.5 inline ml-1" />
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setSelectedMemberIdForProfile(null);
                    setAdminSection('loans');
                  }}
                >
                  <span>View Loan History</span>
                  <ArrowRight className="w-3.5 h-3.5 inline ml-1" />
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setSelectedMemberIdForProfile(null);
                    setAdminSection('payments');
                  }}
                >
                  <span>View Payment History</span>
                  <ArrowRight className="w-3.5 h-3.5 inline ml-1" />
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setSelectedMemberIdForProfile(null);
                    setAdminSection('transactions');
                  }}
                >
                  <span>View Transactions</span>
                  <ArrowRight className="w-3.5 h-3.5 inline ml-1" />
                </Button>
              </div>
            </div>

            {/* Organized Read-Only Information Sections (Section 22) */}
            <div className="space-y-6 pt-4 border-t border-slate-200">
              <section>
                <h4 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-200">
                  Personal Information
                </h4>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
                  <ReadOnlyField label="Full Name" value={activeMember.fullName} />
                  <ReadOnlyField label="Date of Birth" value={formatShortDate(activeMember.dateOfBirth)} />
                  <ReadOnlyField label="Country of Birth" value={activeMember.countryOfBirth} />
                  <ReadOnlyField label="Country of Citizenship" value={activeMember.countryOfCitizenship} />
                  <ReadOnlyField label="State of Origin" value={activeMember.stateOfOrigin} />
                  <ReadOnlyField label="Nationality" value={activeMember.nationality} />
                  <ReadOnlyField label="Gender" value={activeMember.gender} />
                  <ReadOnlyField label="Marital Status" value={activeMember.maritalStatus} />
                </dl>
              </section>

              <section>
                <h4 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-200">
                  Identification
                </h4>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
                  <ReadOnlyField label="Identification Type" value={activeMember.idType} />
                  <ReadOnlyField label="ID Number" value={activeMember.idNumber} mono />
                  <ReadOnlyField label="Issue Date" value={formatShortDate(activeMember.idIssueDate)} />
                  <ReadOnlyField label="Expiry Date" value={formatShortDate(activeMember.idExpiryDate)} />
                </dl>
              </section>

              <section>
                <h4 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-200">
                  Contact Information
                </h4>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
                  <ReadOnlyField
                    label="Phone Number (OTP Login Verified)"
                    value={activeMember.phoneNumber}
                    mono
                  />
                  <ReadOnlyField label="Email Address" value={activeMember.email} />
                  <div className="sm:col-span-2">
                    <ReadOnlyField label="Residential Address" value={activeMember.residentialAddress} />
                  </div>
                </dl>
              </section>

              <section>
                <h4 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-200">
                  Employment Information
                </h4>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
                  <ReadOnlyField label="Employee Status" value={activeMember.employeeStatus} />
                  <ReadOnlyField label="Employee ID" value={activeMember.employeeId} mono />
                  <ReadOnlyField label="Department" value={activeMember.department} />
                  <ReadOnlyField label="Unit" value={activeMember.unit} />
                  <ReadOnlyField label="Position / Role" value={activeMember.position} />
                </dl>
              </section>

              <section>
                <h4 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-200">
                  Insurance Information
                </h4>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
                  <ReadOnlyField label="Insurance Provider / Authority" value={activeMember.insuranceProvider} />
                  <ReadOnlyField label="Insurance Number" value={activeMember.insuranceNumber} mono />
                  <div className="sm:col-span-2">
                    <ReadOnlyField label="Coverage Details" value={activeMember.insuranceDetails} />
                  </div>
                </dl>
              </section>

              <section>
                <h4 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-200">
                  Guarantors &amp; Sponsor
                </h4>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
                  <ReadOnlyField label="Guarantor 1" value={activeMember.registrationGuarantor1} />
                  <ReadOnlyField label="Guarantor 2" value={activeMember.registrationGuarantor2} />
                  <ReadOnlyField label="Sponsor Name" value={activeMember.sponsorName} />
                  <ReadOnlyField label="Sponsor Details" value={activeMember.sponsorDetails} />
                </dl>
              </section>

              <section>
                <h4 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-200">
                  Next of Kin
                </h4>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
                  <ReadOnlyField label="Full Name" value={activeMember.nextOfKin.fullName} />
                  <ReadOnlyField label="Relationship" value={activeMember.nextOfKin.relationship} />
                  <ReadOnlyField label="Phone Number" value={activeMember.nextOfKin.phoneNumber} mono />
                  <ReadOnlyField label="Address" value={activeMember.nextOfKin.address} />
                </dl>
              </section>
            </div>
          </div>
        )}
      </SideDrawer>
    </div>
  );
}
