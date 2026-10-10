import { useQuery } from '@tanstack/react-query';
import Layout from '../../../shared/components/Layout.jsx';
import { ErrorState } from '../../../shared/components/hr/HrPage.jsx';
import { getProfile } from '../services/profileService.js';
import { formatDate } from '../../../shared/utils/date.js';

/** Label/value row used across every info card on this page. */
const InfoRow = ({ label, value }) => (
  <div className="flex flex-col items-start gap-1 border-b border-[var(--border)] py-3 text-[14.5px] last:border-b-0 sm:flex-row sm:justify-between sm:gap-5">
    <span className="flex-shrink-0 text-[var(--tx3)]">{label}</span>
    <span className="min-w-0 break-words text-left text-[var(--tx)] sm:text-right">{value || '-'}</span>
  </div>
);

/** My Profile page: identity hero and the employee's HR record grouped into four info cards. */
const Profile = () => {
  const { data: profile, isLoading, isError, error, refetch } = useQuery({ queryKey: ['profile'], queryFn: getProfile });

  if (isLoading) {
    return (
      <Layout>
        <div className="flex flex-col gap-[22px]">
          <div className="animate-pulse rounded-[14px] border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-7 lg:p-9">
            <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:gap-6">
              <div className="h-[88px] w-[88px] flex-shrink-0 rounded-2xl bg-[var(--surface-2)]" />
              <div className="min-w-0 flex-1">
                <div className="h-6 w-48 rounded bg-[var(--surface-2)]" />
                <div className="mt-2.5 h-3.5 w-36 rounded bg-[var(--surface-2)]" />
                <div className="mt-4 flex gap-2.5">
                  <div className="h-6 w-20 rounded-[7px] bg-[var(--surface-2)]" />
                  <div className="h-6 w-24 rounded-[7px] bg-[var(--surface-2)]" />
                </div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-5">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse rounded-[14px] border border-[var(--border)] bg-[var(--surface)] p-[22px]">
                <div className="mb-4 h-4 w-40 rounded bg-[var(--surface-2)]" />
                {[0, 1, 2, 3].map((r) => (
                  <div key={r} className="flex items-center justify-between border-b border-[var(--border)] py-3 last:border-b-0">
                    <div className="h-3 w-24 rounded bg-[var(--surface-2)]" />
                    <div className="h-3 w-32 rounded bg-[var(--surface-2)]" />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </Layout>
    );
  }
  if (isError) return <Layout><ErrorState message={error.message} onRetry={refetch} /></Layout>;

  const initials = (profile.name || '?').split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);

  const sections = [
    { title: 'Personal Information', fields: [
      { k: 'Legal Name', v: profile.legalName },
      { k: 'Date of Birth', v: formatDate(profile.birthday) },
      { k: 'Place of Birth', v: profile.placeOfBirth },
      { k: 'Country of Birth', v: profile.countryOfBirth },
      { k: 'Gender', v: profile.gender },
    ] },
    { title: 'Employment', fields: [
      { k: 'Employee Code', v: profile.employeeCode },
      { k: 'Employee Type', v: profile.employeeType },
      { k: 'Department', v: profile.department },
      { k: 'Work Location', v: profile.workLocation },
      { k: 'Manager', v: profile.manager },
      { k: 'Coach', v: profile.coach },
    ] },
    { title: 'Contact', fields: [
      { k: 'Work Email', v: profile.workEmail },
      { k: 'Work Phone', v: profile.workPhone },
      { k: 'Personal Email', v: profile.personalEmail },
      { k: 'Personal Phone', v: profile.personalPhone || profile.mobilePhone },
    ] },
    { title: 'Address', fields: [
      { k: 'Private Address', v: profile.address },
      { k: 'Home-Work Distance', v: profile.homeWorkDistance ? `${profile.homeWorkDistance} ${profile.homeWorkDistanceUnit || ''}`.trim() : null },
    ] },
    { title: 'Documents & IDs', fields: [
      { k: 'Nationality', v: profile.nationality },
      { k: 'Identification No.', v: profile.identificationNo },
      { k: 'Unified Number', v: profile.ssnNo },
      { k: 'Passport No.', v: profile.passportNo },
      { k: 'Visa No.', v: profile.visaExpirationDate ? `${profile.visaNo} · expires ${formatDate(profile.visaExpirationDate)}` : profile.visaNo },
      { k: 'Work Permit No.', v: profile.workPermitExpirationDate ? `${profile.workPermitNo} · expires ${formatDate(profile.workPermitExpirationDate)}` : profile.workPermitNo },
      { k: 'Work Permit Document', v: profile.workPermitDocumentUploaded ? profile.workPermitDocumentName : null },
    ] },
    { title: 'Education', fields: [
      { k: 'Certificate Level', v: profile.certificateLevel },
      { k: 'Field of Study', v: profile.fieldOfStudy },
      { k: 'School', v: profile.school },
    ] },
    { title: 'Family & Emergency', fields: [
      { k: 'Emergency Contact', v: profile.emergencyContact ? `${profile.emergencyContact} · ${profile.emergencyPhone || ''}` : null },
      { k: 'Marital Status', v: profile.maritalStatus },
      { k: 'Spouse Name', v: profile.spouseLegalName },
      { k: 'Spouse Birthday', v: formatDate(profile.spouseBirthdate) },
      { k: 'Dependent Children', v: profile.dependentChildren || null },
    ] },
  ];

  return (
    <Layout>
      <div className="flex flex-col gap-[22px]">
        <section className="relative overflow-hidden rounded-[14px] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[1px_0_0_var(--border),0_18px_44px_rgba(43,58,85,0.06)] sm:p-7 lg:p-9">
          <img
            src={`${import.meta.env.BASE_URL}brand/rejlers-mark.svg`}
            alt=""
            aria-hidden="true"
            className="gs-drift pointer-events-none absolute -bottom-[24px] -right-[10px] w-[220px] opacity-[0.05] dark:invert"
          />
          <div className="relative flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:gap-6">
            {profile.imageUrl ? (
              <img src={profile.imageUrl} alt={profile.name} className="h-[88px] w-[88px] flex-shrink-0 rounded-2xl border border-[var(--border)] object-cover" />
            ) : (
              <div className="grid h-[88px] w-[88px] flex-shrink-0 place-items-center rounded-2xl bg-[var(--ink-solid)] text-[28px] font-extrabold tabular-nums text-white">
                {initials}
              </div>
            )}
            <div className="min-w-0">
              <div className="break-words text-[27px] font-semibold tracking-[-0.02em] text-[var(--tx)]">{profile.name}</div>
              <div className="mt-1 break-words text-[15px] text-[var(--tx2)]">{[profile.jobTitle, profile.department].filter(Boolean).join(' · ')}</div>
              <div className="mt-3.5 flex flex-wrap gap-2.5">
                {profile.employeeCode && <span className="rounded-[7px] bg-[var(--ink-bg)] px-3.5 py-1.5 text-[12.5px] font-semibold tabular-nums text-[var(--ink-2)]">{profile.employeeCode}</span>}
                {profile.company && <span className="rounded-[7px] bg-[var(--surface-2)] px-3.5 py-1.5 text-[13px] text-[var(--tx2)]">{profile.company}</span>}
              </div>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-5">
          {sections.map((s) => (
            <section key={s.title} className="gs-fade min-w-0 rounded-[14px] border border-[var(--border)] bg-[var(--surface)] p-[22px]">
              <div className="mb-1.5 flex items-center gap-2.5">
                <span className="block h-4 w-1 bg-[var(--pri)]" />
                <h2 className="m-0 text-[17px] font-semibold text-[var(--tx)]">{s.title}</h2>
              </div>
              {s.fields.map((f) => <InfoRow key={f.k} label={f.k} value={f.v} />)}
            </section>
          ))}
          <section className="gs-fade min-w-0 rounded-[14px] border border-[var(--border)] bg-[var(--surface)] p-[22px]">
            <div className="mb-1.5 flex items-center gap-2.5">
              <span className="block h-4 w-1 bg-[var(--pri)]" />
              <h2 className="m-0 text-[17px] font-semibold text-[var(--tx)]">Bank Accounts</h2>
            </div>
            {profile.bankAccounts.length === 0 ? (
              <p className="py-3 text-[14.5px] text-[var(--tx3)]">No bank account linked. Ask HR to add yours.</p>
            ) : profile.bankAccounts.map((b) => (
              <div key={b.id} className="border-b border-[var(--border)] py-3 last:border-b-0">
                <InfoRow label="Bank" value={b.bankName} />
                <InfoRow label="Account No." value={b.accNumberLast4 ? `•••• ${b.accNumberLast4}` : b.accNumber} />
                <InfoRow label="Account Holder" value={b.holderName} />
              </div>
            ))}
          </section>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
