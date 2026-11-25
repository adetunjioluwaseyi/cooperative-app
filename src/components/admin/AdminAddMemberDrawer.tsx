import React, { useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  KeyRound,
  Phone,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';
import { normalizePhone } from '../../data/seedData';
import { useCooperative } from '../../store/CooperativeContext';
import { IdentificationType, Member, MemberStatus } from '../../types/cooperative';
import { Button, SideDrawer, StatusBadge } from '../ui/DesignSystem';

interface AdminAddMemberDrawerProps {
  open: boolean;
  onClose: () => void;
  onViewProfile: (memberId: string) => void;
}

const STEPS = [
  '1. Personal & Contact',
  '2. Employment & ID',
  '3. Guarantors & Membership',
  '4. Phone OTP Verification',
];

export function AdminAddMemberDrawer({
  open,
  onClose,
  onViewProfile,
}: AdminAddMemberDrawerProps) {
  const {
    members,
    registerNewMember,
    sendPhoneOtp,
    verifyRegistrationOtp,
    activeSms,
    quickSwitchToMember,
  } = useCooperative();

  const nextMemberId = useMemo(() => {
    const nums = members.map((m) => parseInt(m.id.replace(/\D/g, ''), 10)).filter((n) => !isNaN(n));
    const max = nums.length ? Math.max(...nums) : 136;
    return `MB-${String(max + 1).padStart(5, '0')}`;
  }, [members]);

  const [step, setStep] = useState(0);
  const [createdMember, setCreatedMember] = useState<Member | null>(null);
  const [formError, setFormError] = useState('');

  // Form Fields (Sections 36 & 37)
  const [fullName, setFullName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('1978-05-15');
  const [countryOfBirth, setCountryOfBirth] = useState('Nigeria');
  const [countryOfCitizenship, setCountryOfCitizenship] = useState('Nigeria');
  const [stateOfOrigin, setStateOfOrigin] = useState('Lagos State');
  const [nationality, setNationality] = useState('Nigerian');
  const [gender, setGender] = useState<'Male' | 'Female'>('Male');
  const [maritalStatus, setMaritalStatus] = useState<'Single' | 'Married' | 'Widowed' | 'Divorced'>('Married');

  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [residentialAddress, setResidentialAddress] = useState('');

  const [employeeId, setEmployeeId] = useState('');
  const [employeeStatus, setEmployeeStatus] = useState('Permanent Staff');
  const [department, setDepartment] = useState('');
  const [unit, setUnit] = useState('');
  const [position, setPosition] = useState('');

  const [idType, setIdType] = useState<IdentificationType>('National ID (NIN)');
  const [idNumber, setIdNumber] = useState('');
  const [idIssueDate, setIdIssueDate] = useState('2022-01-10');
  const [idExpiryDate, setIdExpiryDate] = useState('2032-01-10');

  const [insuranceProvider, setInsuranceProvider] = useState('Leadway Assurance');
  const [insuranceNumber, setInsuranceNumber] = useState('');
  const [insuranceDetails, setInsuranceDetails] = useState('Group Life & Cooperative Credit Protection');

  const [guarantor1, setGuarantor1] = useState('Sunday Ojo (MB-00101)');
  const [guarantor2, setGuarantor2] = useState('Grace Okafor (MB-00104)');
  const [sponsorName, setSponsorName] = useState('');
  const [sponsorDetails, setSponsorDetails] = useState('');

  const [nokName, setNokName] = useState('');
  const [nokRelationship, setNokRelationship] = useState('Spouse');
  const [nokPhone, setNokPhone] = useState('');
  const [nokAddress, setNokAddress] = useState('');

  const [membershipDate, setMembershipDate] = useState('2026-11-24');
  const [memberId, setMemberId] = useState('');
  const [status, setStatus] = useState<MemberStatus>('Active');

  // Phone OTP Registration Verification state
  const [otpSent, setOtpSent] = useState(false);
  const [otpInput, setOtpInput] = useState('');
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [otpFeedback, setOtpFeedback] = useState('');

  const resolvedMemberId = memberId || nextMemberId;

  const resetAll = () => {
    setStep(0);
    setCreatedMember(null);
    setFormError('');
    setFullName('');
    setPhoneNumber('');
    setEmail('');
    setResidentialAddress('');
    setEmployeeId('');
    setDepartment('');
    setUnit('');
    setPosition('');
    setIdNumber('');
    setInsuranceNumber('');
    setSponsorName('');
    setSponsorDetails('');
    setNokName('');
    setNokPhone('');
    setNokAddress('');
    setMemberId('');
    setStatus('Active');
    setOtpSent(false);
    setOtpInput('');
    setPhoneVerified(false);
    setOtpFeedback('');
  };

  const handleClose = () => {
    resetAll();
    onClose();
  };

  const handleNext = () => {
    setFormError('');
    if (step === 0) {
      if (!fullName.trim()) {
        setFormError('Please enter the member’s full name.');
        return;
      }
      if (phoneNumber.replace(/\D/g, '').length < 10) {
        setFormError('Please enter a valid Nigerian phone number for OTP login authentication.');
        return;
      }
      if (!residentialAddress.trim()) {
        setFormError('Please enter the member’s residential address.');
        return;
      }
    }
    if (step === 1) {
      if (!idNumber.trim()) {
        setFormError('Please enter the member’s identification number (e.g. NIN or Passport number).');
        return;
      }
    }
    if (step === 2) {
      if (!nokName.trim() || !nokPhone.trim()) {
        setFormError('Please enter the Next of Kin name and phone number.');
        return;
      }
    }
    setStep((s) => Math.min(STEPS.length - 1, s + 1));
  };

  const handleSendRegOtp = () => {
    setFormError('');
    setOtpFeedback('');
    const res = sendPhoneOtp(phoneNumber, 'New Member Registration');
    if (!res.ok) {
      setFormError(res.error || 'Could not send OTP to phone number.');
      return;
    }
    setOtpSent(true);
    setOtpInput('');
    setOtpFeedback(`A 6-digit OTP code has been sent to ${normalizePhone(phoneNumber)}.`);
  };

  const handleVerifyRegOtp = () => {
    setFormError('');
    const res = verifyRegistrationOtp(phoneNumber, otpInput);
    if (!res.ok) {
      setFormError(res.error || 'Incorrect OTP code.');
      return;
    }
    setPhoneVerified(true);
    setOtpFeedback('Phone number verified! Secure OTP login is ready for this member.');
  };

  const handleCreateMember = () => {
    setFormError('');
    if (!phoneVerified) {
      setFormError('Please verify the member’s phone number with the 6-digit OTP before creating their account.');
      return;
    }

    const newMember = registerNewMember({
      id: resolvedMemberId,
      fullName: fullName.trim(),
      dateOfBirth,
      countryOfBirth,
      countryOfCitizenship,
      stateOfOrigin,
      nationality,
      gender,
      maritalStatus,
      idType,
      idNumber: idNumber.trim(),
      idIssueDate,
      idExpiryDate,
      phoneNumber: normalizePhone(phoneNumber),
      phoneVerified: true,
      email: email.trim() || `${fullName.trim().toLowerCase().replace(/\s+/g, '.')}@unitycoop.org.ng`,
      residentialAddress: residentialAddress.trim(),
      employeeStatus,
      employeeId: employeeId.trim() || 'EMP-4012',
      department: department.trim() || 'General Operations',
      unit: unit.trim() || 'Main Office',
      position: position.trim() || 'Staff Member',
      insuranceProvider: insuranceProvider.trim() || 'Leadway Assurance',
      insuranceNumber: insuranceNumber.trim() || 'LDW-NEW-2026',
      insuranceDetails: insuranceDetails.trim(),
      registrationGuarantor1: guarantor1,
      registrationGuarantor2: guarantor2,
      sponsorName: sponsorName.trim() || 'Sunday Ojo',
      sponsorDetails: sponsorDetails.trim() || 'Cooperative Senior Member',
      nextOfKin: {
        fullName: nokName.trim(),
        relationship: nokRelationship,
        phoneNumber: normalizePhone(nokPhone),
        address: nokAddress.trim() || residentialAddress.trim(),
      },
      membershipDate,
      status,
    });

    setCreatedMember(newMember);
  };

  const fillQuickDemoMember = () => {
    setFullName('Bola Adesanya');
    setDateOfBirth('1975-09-14');
    setStateOfOrigin('Ondo State');
    setPhoneNumber('+234 806 555 0199');
    setEmail('bola.adesanya@unitycoop.org.ng');
    setResidentialAddress('18 Toyin Street, Ikeja, Lagos');
    setEmployeeId('EMP-3810');
    setDepartment('Administration');
    setUnit('Records & Archives');
    setPosition('Principal Admin Officer');
    setIdNumber('74920183645');
    setInsuranceNumber('LDW-92044-NG');
    setSponsorName('Sunday Ojo');
    setSponsorDetails('Principal Accountant · MB-00101');
    setNokName('Mr. Kunle Adesanya');
    setNokRelationship('Spouse');
    setNokPhone('+234 806 555 9011');
    setNokAddress('18 Toyin Street, Ikeja, Lagos');
    setFormError('');
  };

  const inputClass =
    'w-full min-h-[44px] px-3.5 py-2 rounded-lg border border-slate-300 bg-white text-[15px] text-slate-900 focus:border-[#15803D] focus:ring-2 focus:ring-[#15803D]/20';
  const labelClass = 'block text-sm font-semibold text-slate-800 mb-1.5';

  return (
    <SideDrawer
      open={open}
      onClose={handleClose}
      title={createdMember ? 'Member Registered' : 'Add New Member'}
      subtitle={
        createdMember
          ? 'The member account has been created with verified Phone OTP login.'
          : 'Register a cooperative member and verify their phone number for secure OTP login.'
      }
      widthClass="max-w-3xl"
      footer={
        !createdMember ? (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              {step > 0 ? (
                <Button
                  variant="secondary"
                  onClick={() => {
                    setFormError('');
                    setStep((s) => s - 1);
                  }}
                  icon={<ArrowLeft className="w-4 h-4" />}
                >
                  Previous Step
                </Button>
              ) : (
                <Button variant="ghost" onClick={fillQuickDemoMember}>
                  Fill Sample Member Data
                </Button>
              )}
            </div>
            <div className="flex items-center gap-3">
              <Button variant="secondary" onClick={handleClose}>
                Cancel
              </Button>
              {step < STEPS.length - 1 ? (
                <Button onClick={handleNext}>
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4 inline ml-1" />
                </Button>
              ) : (
                <Button
                  onClick={handleCreateMember}
                  disabled={!phoneVerified}
                  icon={<UserCheck className="w-4 h-4" />}
                >
                  Create Member
                </Button>
              )}
            </div>
          </div>
        ) : undefined
      }
    >
      {createdMember ? (
        /* SUCCESS CONFIRMATION (Section 37) */
        <div className="py-6 space-y-6">
          <div className="rounded-xl bg-[#ECFDF5] border border-[#BBF7D0] p-6 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-[#15803D] text-white flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900">Member successfully registered</h3>
            <p className="text-[15px] text-slate-700 max-w-md mx-auto">
              Their cooperative profile is active and they can now log into their Member Dashboard securely using Phone Number OTP.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <p className="text-sm text-slate-500">Member Name</p>
              <p className="text-lg font-bold text-slate-900 mt-0.5">{createdMember.fullName}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Member ID</p>
              <p className="text-lg font-mono font-bold text-slate-900 mt-0.5">{createdMember.id}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Verified Login Phone (OTP)</p>
              <p className="text-base font-mono font-semibold text-[#15803D] mt-0.5">
                {createdMember.phoneNumber}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Account Status</p>
              <div className="mt-1">
                <StatusBadge status={createdMember.status} />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Button
              variant="secondary"
              onClick={() => {
                const id = createdMember.id;
                handleClose();
                onViewProfile(id);
              }}
            >
              View Member Profile
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                const id = createdMember.id;
                handleClose();
                quickSwitchToMember(id);
              }}
            >
              Open Member Dashboard
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Clear Step Progress Indicator */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pb-4 border-b border-slate-200">
            {STEPS.map((label, idx) => {
              const active = idx === step;
              const done = idx < step;
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => idx <= step && setStep(idx)}
                  className={`text-left px-3 py-2.5 rounded-lg text-xs sm:text-sm font-semibold border transition-colors ${
                    active
                      ? 'bg-[#ECFDF5] border-[#15803D] text-[#14532D]'
                      : done
                      ? 'bg-slate-50 border-slate-200 text-slate-800 cursor-pointer'
                      : 'bg-white border-slate-200 text-slate-400 cursor-default'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {formError && (
            <div className="p-4 rounded-lg bg-[#FEF2F2] border border-[#FECACA] text-[#991B1B] text-[15px] font-medium">
              {formError}
            </div>
          )}

          {/* STEP 1: PERSONAL & CONTACT DETAILS */}
          {step === 0 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 pb-2 border-b border-slate-200">
                  Personal Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  <div className="sm:col-span-2">
                    <label className={labelClass}>Full Name *</label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Bola Adesanya"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Date of Birth</label>
                    <input
                      type="date"
                      value={dateOfBirth}
                      onChange={(e) => setDateOfBirth(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Gender</label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value as 'Male' | 'Female')}
                      className={inputClass}
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Country of Birth</label>
                    <input
                      type="text"
                      value={countryOfBirth}
                      onChange={(e) => setCountryOfBirth(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Country of Citizenship</label>
                    <input
                      type="text"
                      value={countryOfCitizenship}
                      onChange={(e) => setCountryOfCitizenship(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>State of Origin</label>
                    <input
                      type="text"
                      value={stateOfOrigin}
                      onChange={(e) => setStateOfOrigin(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Nationality</label>
                    <input
                      type="text"
                      value={nationality}
                      onChange={(e) => setNationality(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Marital Status</label>
                    <select
                      value={maritalStatus}
                      onChange={(e) =>
                        setMaritalStatus(e.target.value as 'Single' | 'Married' | 'Widowed' | 'Divorced')
                      }
                      className={inputClass}
                    >
                      <option value="Married">Married</option>
                      <option value="Single">Single</option>
                      <option value="Widowed">Widowed</option>
                      <option value="Divorced">Divorced</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900 pb-2 border-b border-slate-200">
                  Contact Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className={labelClass}>Phone Number (Used for OTP Login) *</label>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => {
                        setPhoneNumber(e.target.value);
                        setPhoneVerified(false);
                        setOtpSent(false);
                      }}
                      placeholder="+234 806 555 0199"
                      className={`${inputClass} font-mono`}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className={inputClass}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={labelClass}>Residential Address *</label>
                    <input
                      type="text"
                      value={residentialAddress}
                      onChange={(e) => setResidentialAddress(e.target.value)}
                      placeholder="House number, street, city, state"
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: EMPLOYMENT, IDENTIFICATION & INSURANCE */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 pb-2 border-b border-slate-200">
                  Employment Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className={labelClass}>Employee ID</label>
                    <input
                      type="text"
                      value={employeeId}
                      onChange={(e) => setEmployeeId(e.target.value)}
                      placeholder="e.g. EMP-3810"
                      className={`${inputClass} font-mono`}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Employee Status</label>
                    <select
                      value={employeeStatus}
                      onChange={(e) => setEmployeeStatus(e.target.value)}
                      className={inputClass}
                    >
                      <option value="Permanent Staff">Permanent Staff</option>
                      <option value="Contract Staff">Contract Staff</option>
                      <option value="Retired">Retired</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Department</label>
                    <input
                      type="text"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      placeholder="e.g. Administration"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Unit</label>
                    <input
                      type="text"
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                      placeholder="e.g. Records & Archives"
                      className={inputClass}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={labelClass}>Position / Role</label>
                    <input
                      type="text"
                      value={position}
                      onChange={(e) => setPosition(e.target.value)}
                      placeholder="e.g. Principal Officer"
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900 pb-2 border-b border-slate-200">
                  Identification
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className={labelClass}>Identification Type</label>
                    <select
                      value={idType}
                      onChange={(e) => setIdType(e.target.value as IdentificationType)}
                      className={inputClass}
                    >
                      <option value="National ID (NIN)">National ID (NIN)</option>
                      <option value="International Passport">International Passport</option>
                      <option value="Driver's Licence">Driver's Licence</option>
                      <option value="Other Identification">Other Identification</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>ID Number *</label>
                    <input
                      type="text"
                      value={idNumber}
                      onChange={(e) => setIdNumber(e.target.value)}
                      placeholder="Enter NIN or ID number"
                      className={`${inputClass} font-mono`}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Issue Date</label>
                    <input
                      type="date"
                      value={idIssueDate}
                      onChange={(e) => setIdIssueDate(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Expiry Date</label>
                    <input
                      type="date"
                      value={idExpiryDate}
                      onChange={(e) => setIdExpiryDate(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900 pb-2 border-b border-slate-200">
                  Insurance
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className={labelClass}>Insurance Provider / Authority</label>
                    <input
                      type="text"
                      value={insuranceProvider}
                      onChange={(e) => setInsuranceProvider(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Insurance Number / Details</label>
                    <input
                      type="text"
                      value={insuranceNumber}
                      onChange={(e) => setInsuranceNumber(e.target.value)}
                      placeholder="e.g. LDW-92044-NG"
                      className={`${inputClass} font-mono`}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: GUARANTORS, SPONSOR, NEXT OF KIN & MEMBERSHIP */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 pb-2 border-b border-slate-200">
                  Guarantors &amp; Sponsor
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className={labelClass}>Guarantor 1</label>
                    <input
                      type="text"
                      value={guarantor1}
                      onChange={(e) => setGuarantor1(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Guarantor 2</label>
                    <input
                      type="text"
                      value={guarantor2}
                      onChange={(e) => setGuarantor2(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Sponsor Name</label>
                    <input
                      type="text"
                      value={sponsorName}
                      onChange={(e) => setSponsorName(e.target.value)}
                      placeholder="e.g. Sunday Ojo"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Sponsor Information</label>
                    <input
                      type="text"
                      value={sponsorDetails}
                      onChange={(e) => setSponsorDetails(e.target.value)}
                      placeholder="Role or Member ID"
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900 pb-2 border-b border-slate-200">
                  Next of Kin
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className={labelClass}>Full Name *</label>
                    <input
                      type="text"
                      value={nokName}
                      onChange={(e) => setNokName(e.target.value)}
                      placeholder="Next of kin full name"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Relationship</label>
                    <input
                      type="text"
                      value={nokRelationship}
                      onChange={(e) => setNokRelationship(e.target.value)}
                      placeholder="e.g. Spouse, Son, Sister"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Phone Number *</label>
                    <input
                      type="tel"
                      value={nokPhone}
                      onChange={(e) => setNokPhone(e.target.value)}
                      placeholder="+234 80..."
                      className={`${inputClass} font-mono`}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Address</label>
                    <input
                      type="text"
                      value={nokAddress}
                      onChange={(e) => setNokAddress(e.target.value)}
                      placeholder="Residential address"
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900 pb-2 border-b border-slate-200">
                  Membership Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                  <div>
                    <label className={labelClass}>Membership Start Date</label>
                    <input
                      type="date"
                      value={membershipDate}
                      onChange={(e) => setMembershipDate(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Member ID</label>
                    <input
                      type="text"
                      value={resolvedMemberId}
                      onChange={(e) => setMemberId(e.target.value)}
                      className={`${inputClass} font-mono font-semibold`}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Membership Status</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as MemberStatus)}
                      className={inputClass}
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                      <option value="Suspended">Suspended</option>
                      <option value="Disengaged">Disengaged</option>
                      <option value="Absconded">Absconded</option>
                      <option value="Deceased">Deceased</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: PHONE NUMBER OTP AUTHENTICATION SETUP */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="rounded-xl bg-slate-50 border border-slate-200 p-6 space-y-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-11 h-11 rounded-lg bg-[#ECFDF5] border border-[#BBF7D0] flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-6 h-6 text-[#15803D]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">
                      Verify Member Phone Number for Secure OTP Login
                    </h3>
                    <p className="text-[15px] text-slate-600 mt-1">
                      Unity Cooperative uses Phone Number OTP so members never have to remember complicated passwords. Verify <strong>{fullName || 'the member'}</strong>’s phone number below to activate their dashboard login.
                    </p>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-lg p-4 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-slate-500" />
                    <div>
                      <p className="text-xs font-semibold text-slate-500">Member Login Phone Number</p>
                      <p className="text-lg font-mono font-bold text-slate-900">
                        {normalizePhone(phoneNumber)}
                      </p>
                    </div>
                  </div>
                  {phoneVerified ? (
                    <StatusBadge status="Verified" />
                  ) : (
                    <Button
                      variant="soft-green"
                      onClick={handleSendRegOtp}
                      icon={<KeyRound className="w-4 h-4" />}
                    >
                      {otpSent ? 'Resend 6-Digit OTP' : 'Send Verification OTP'}
                    </Button>
                  )}
                </div>

                {otpFeedback && (
                  <p className="text-sm font-semibold text-[#14532D] bg-[#ECFDF5] border border-[#BBF7D0] rounded-lg px-4 py-3">
                    {otpFeedback}
                  </p>
                )}

                {otpSent && !phoneVerified && (
                  <div className="space-y-3 pt-2">
                    <label className="block text-sm font-semibold text-slate-800">
                      Enter 6-Digit OTP Sent to Member’s Phone
                    </label>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        value={otpInput}
                        onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                        placeholder="000000"
                        className="flex-1 min-h-[48px] px-4 rounded-lg border border-slate-300 bg-white text-xl font-mono font-bold tracking-[0.3em] text-center text-slate-900"
                      />
                      <Button onClick={handleVerifyRegOtp} icon={<CheckCircle2 className="w-4 h-4" />}>
                        Verify Phone
                      </Button>
                    </div>
                    {activeSms && (
                      <div className="flex items-center justify-between text-sm text-slate-700 bg-white border border-slate-200 rounded-lg px-4 py-2.5">
                        <span>
                          Demo SMS Code: <strong className="font-mono">{activeSms.code}</strong>
                        </span>
                        <button
                          type="button"
                          onClick={() => setOtpInput(activeSms.code)}
                          className="font-bold text-[#15803D] underline cursor-pointer"
                        >
                          Auto-fill code
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Final Registration Summary */}
              <div className="bg-white border border-slate-200 rounded-xl p-5">
                <h4 className="text-base font-bold text-slate-900 mb-3">Registration Summary</h4>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div>
                    <dt className="text-slate-500">Full Name</dt>
                    <dd className="font-semibold text-slate-900">{fullName}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Assigned Member ID</dt>
                    <dd className="font-mono font-semibold text-slate-900">{resolvedMemberId}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Identification</dt>
                    <dd className="font-semibold text-slate-900">
                      {idType} · <span className="font-mono">{idNumber}</span>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Initial Account Status</dt>
                    <dd className="font-semibold text-slate-900">{status}</dd>
                  </div>
                </dl>
              </div>
            </div>
          )}
        </div>
      )}
    </SideDrawer>
  );
}
