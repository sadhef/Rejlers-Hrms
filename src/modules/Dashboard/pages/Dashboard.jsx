import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Layout from '../../../shared/components/Layout.jsx';
import { ErrorState } from '../../../shared/components/hr/HrPage.jsx';
import StatusBadge from '../../../shared/components/hr/StatusBadge.jsx';
import Icon from '../../../shared/components/Icon.jsx';
import { useAuth } from '../../../shared/context/AuthContext.jsx';
import ApplyLeaveModal from '../../Leave/components/ApplyLeaveModal.jsx';
import { getProfile } from '../../Profile/services/profileService.js';
import { listAttendance } from '../../Attendance/services/attendanceService.js';
import { getBalances, getLeaveList } from '../../Leave/services/leaveService.js';
import { formatDateRange, formatTime } from '../../../shared/utils/date.js';

import { SAMPLE_ANNOUNCEMENTS } from '../../Announcements/data/sampleData.js';
import { SAMPLE_COLLEAGUES } from '../../Directory/data/sampleData.js';
import { SAMPLE_PAYSLIPS } from '../../Payslips/data/sampleData.js';

const SERVICES = [
  { to: '/profile', label: 'My Profile', desc: 'Visa, passport and HR record', icon: 'user' },
  { to: '/attendance', label: 'Attendance', desc: 'Check-ins and working hours', icon: 'siteCheckIn' },
  { to: '/leave', label: 'Leave Requests', desc: 'Apply for leave or check balance', icon: 'calendar' },
  { to: '/payslips', label: 'Payroll', desc: 'Salary statements and pay totals', icon: 'file' },
  { to: '/announcements', label: 'Announcements', desc: 'Company news and updates', icon: 'bell' },
  { to: '/directory', label: 'Team Directory', desc: 'Find colleagues across teams', icon: 'users' },
];

/** Rejlers accent families, in brand order: Deep Blue, Turbine Blue, Green, Passion, Deep Blue accent. */
const LEAVE_BAR_COLORS = ['#2B3A55', '#0093A3', '#2AA784', '#EE767E', '#617AAD'];
const PENDING_STATES = ['confirm', 'validate1'];

/** Sums a record's worked hours, falling back to the check-in/check-out gap when the backend omits it. */
const recordHours = (r) => {
  if (typeof r.workedHours === 'number') return r.workedHours;
  if (r.checkIn && r.checkOut) return (r.checkOut.getTime() - r.checkIn.getTime()) / 3_600_000;
  return 0;
};

/** Renders employee activity and linked service previews. No props; returns a dashboard with per-query error states. */
const Dashboard = () => {
  const navigate = useNavigate();
  const latestPayslip = SAMPLE_PAYSLIPS[0];
  const { user } = useAuth();
  const [applyOpen, setApplyOpen] = useState(false);

  const profileQuery = useQuery({ queryKey: ['profile'], queryFn: getProfile });
  const todayQuery = useQuery({
    queryKey: ['attendance', 'today'],
    queryFn: () => {
      const now = new Date();
      return listAttendance({ dateFrom: now, dateTo: now });
    },
    refetchInterval: 60_000,
  });
  const weekQuery = useQuery({
    queryKey: ['attendance', 'week'],
    queryFn: () => {
      const dateTo = new Date();
      const dateFrom = new Date();
      dateFrom.setDate(dateTo.getDate() - 6);
      return listAttendance({ dateFrom, dateTo });
    },
  });
  const balancesQuery = useQuery({ queryKey: ['leave', 'balances'], queryFn: getBalances });
  const listQuery = useQuery({ queryKey: ['leave', 'list'], queryFn: getLeaveList });

  const latestRecord = todayQuery.data?.[0];
  const activeRecord = todayQuery.data?.find((record) => !record.checkOut);
  const pendingCount = (listQuery.data || []).filter((r) => PENDING_STATES.includes(r.state)).length;
  const recentRequests = useMemo(() => (listQuery.data || []).slice(0, 4), [listQuery.data]);

  const weekBars = useMemo(() => {
    const records = (weekQuery.data || []).filter((r) => r.checkIn).slice(0, 5).reverse();
    const maxHours = Math.max(10, ...records.map(recordHours));
    return records.map((r) => {
      const hours = recordHours(r);
      return {
        day: r.checkIn.toLocaleDateString('en-US', { weekday: 'short' }),
        hours: `${hours.toFixed(1)}h`,
        // A still-open day has no measurable duration yet; it gets a flat track rather than a
        // stub bar, so it never reads as a stray accent line across the chart.
        empty: hours === 0,
        pct: hours === 0 ? 0 : Math.max(6, Math.round((hours / maxHours) * 100)),
      };
    });
  }, [weekQuery.data]);
  const totalWeekHours = useMemo(() => (weekQuery.data || []).reduce((sum, r) => sum + recordHours(r), 0), [weekQuery.data]);
  const totalWeekLabel = `${Math.floor(totalWeekHours)}h ${Math.round((totalWeekHours % 1) * 60)}m`;

  const firstName = (profileQuery.data?.name || user?.name || 'there').split(' ')[0];
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const todayLabel = new Date().toLocaleDateString('en-US', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });

  const statsLoading = todayQuery.isLoading || balancesQuery.isLoading || listQuery.isLoading || weekQuery.isLoading;

  // `live` marks the one tile whose icon reports state rather than just labelling the tile: while the
  // user is checked in at a site, the map pin is the only accent-bearing glyph on the screen.
  const statCards = [
    { icon: 'siteCheckIn', title: 'Attendance', query: todayQuery, value: activeRecord ? formatTime(activeRecord.checkIn) : latestRecord ? formatTime(latestRecord.checkOut) : '-', foot: activeRecord ? 'In progress' : latestRecord ? 'Checked out' : 'No punches today', live: !!activeRecord },
    { icon: 'calendar', title: 'Leave Balance', query: balancesQuery, value: balancesQuery.data ? String(balancesQuery.data.totalRemaining) : '-', foot: 'Days available' },
    { icon: 'pending', title: 'Pending', query: listQuery, value: String(pendingCount).padStart(2, '0'), foot: 'Requests awaiting approval' },
    { icon: 'chart', title: 'Hours This Week', query: weekQuery, value: totalWeekLabel, foot: `Across ${weekBars.length} working days` },
  ];

  return (
    <Layout>
      <div className="flex flex-col gap-[22px]">
        <section className="rj-banner relative isolate overflow-hidden rounded-[22px] px-6 py-6 sm:px-8 sm:py-7">
          <div aria-hidden="true" className="rj-banner__orb absolute -right-16 -top-24 -z-10 h-72 w-72 rounded-full blur-[70px]" />
          <svg aria-hidden="true" viewBox="0 0 260 330" className="absolute -right-6 -top-6 -z-10 hidden h-[150%] sm:block">
            <path className="rj-banner__r" d="M40 300V40H140A75 75 0 0 1 140 190H96L210 300" fill="none" strokeWidth="30" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <h1 className="m-0 break-words text-[26px] font-medium tracking-[-0.01em] text-[var(--tx2)] sm:text-[30px]">
            {greeting}, <span className="font-semibold text-[var(--tx)]">{firstName}</span>
          </h1>
          <p className="m-0 mt-1.5 text-[15px] text-[var(--tx2)]">{todayLabel}</p>
        </section>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-[18px] xl:grid-cols-4">
          {statsLoading ? (
            [0, 1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse rounded-[14px] border border-[var(--border)] bg-[var(--surface)] p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="h-3 w-20 rounded bg-[var(--surface-2)]" />
                  <div className="h-[38px] w-[38px] flex-shrink-0 rounded-[9px] bg-[var(--surface-2)]" />
                </div>
                <div className="mt-3 h-7 w-16 rounded bg-[var(--surface-2)]" />
                <div className="mt-2 h-3 w-28 rounded bg-[var(--surface-2)]" />
              </div>
            ))
          ) : statCards.map(({ icon, title, query, value, foot, live }, i) => (
            <div
              key={title}
              className="gs-fade relative overflow-hidden rounded-[14px] border border-[var(--border)] bg-[var(--surface)] p-5 transition-[background-color,border-color] duration-200 hover:border-[var(--border-2)] hover:bg-[var(--surface-2)]"
              style={{ animationDelay: `${i * 0.06}s` }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="text-[12.5px] font-semibold uppercase tracking-[0.08em] text-[var(--tx2)]">{title}</div>
                <div className={`grid h-[38px] w-[38px] flex-shrink-0 place-items-center rounded-[9px] ${live ? 'bg-[var(--pri-bg)]' : 'bg-[var(--ink-bg)]'}`}>
                  <Icon name={icon} size={20} color={live ? 'var(--pri-d)' : 'var(--ink)'} />
                </div>
              </div>
              <div className="mt-3 break-words text-[30px] font-bold tabular-nums tracking-[-0.03em] text-[var(--ink)]">{query.isError ? 'Unavailable' : value}</div>
              {query.isError ? (
                <div role="alert" className="mt-[3px] text-[13.5px] text-[var(--tx2)]">
                  <p className="m-0 break-words">{query.error.message}</p>
                  <button type="button" disabled={query.isFetching} onClick={() => query.refetch()} className="mt-2 cursor-pointer border-0 bg-transparent p-0 text-[var(--pri)] underline focus-visible:outline-2 focus-visible:outline-[var(--pri)] disabled:cursor-not-allowed">Retry</button>
                </div>
              ) : <div className="mt-[3px] text-[13.5px] text-[var(--tx2)]">{foot}</div>}
            </div>
          ))}
        </div>

        <div>
          <section className="gs-fade rounded-[14px] border border-[var(--border)] bg-[var(--surface)] p-6" style={{ animationDelay: '0.1s' }}>
            <h2 className="m-0 mb-5 text-[17px] font-semibold tracking-[-0.01em] text-[var(--tx)]">Quick Access</h2>
            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
              {SERVICES.map(({ to, label, desc, icon }, i) => (
                <button
                  key={to}
                  type="button"
                  onClick={() => navigate(to)}
                  className="gs-pop flex cursor-pointer flex-col items-start gap-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-[18px] text-left transition-[background-color,border-color] duration-200 hover:border-[var(--ink-2)] hover:bg-[var(--surface-2)]"
                  style={{ animationDelay: `${0.1 + i * 0.04}s` }}
                >
                  <div className="grid h-[42px] w-[42px] place-items-center rounded-[10px] bg-[var(--ink-bg)]">
                    <Icon name={icon} size={20} color="var(--ink)" />
                  </div>
                  <div className="text-[14.5px] font-medium text-[var(--tx)]">{label}</div>
                  <div className="text-[12.5px] leading-[1.4] text-[var(--tx2)]">{desc}</div>
                </button>
              ))}
            </div>
          </section>

        </div>

        <section aria-labelledby="company-overview-heading" className="flex flex-col gap-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 id="company-overview-heading" className="m-0 text-[18px] font-semibold text-[var(--tx)]">Your workplace at a glance</h2>
            <span className="text-xs text-[var(--tx2)]">Sample payroll, announcements and directory</span>
          </div>
          <div className="grid grid-cols-1 gap-[18px] lg:grid-cols-2 xl:grid-cols-[.9fr_1.2fr_1fr]">
            <section className="relative flex min-w-0 flex-col overflow-hidden rounded-[14px] bg-[var(--rj-deep)] p-6 text-white">
              <div className="flex items-center justify-between gap-3">
                <h3 className="m-0 text-[17px] font-medium">Payroll</h3>
                <Icon name="file" size={22} color="var(--rj-green)" />
              </div>
              <div className="mt-7 text-xs text-white/80">Latest net pay ? {latestPayslip.period}</div>
              <div className="mt-2 text-[30px] font-semibold tabular-nums tracking-tight">AED {latestPayslip.netPay.toLocaleString('en-US')}</div>
              <div className="mt-3 flex items-center gap-2 text-xs text-[var(--rj-green)]"><Icon name="check" size={14} /> {latestPayslip.status}</div>
              <dl className="mb-6 mt-6 flex flex-col gap-3 border-t border-white/20 pt-5 text-sm">
                <div className="flex justify-between gap-3"><dt className="text-white/80">Gross pay</dt><dd className="m-0 tabular-nums">AED {latestPayslip.gross.toLocaleString('en-US')}</dd></div>
                <div className="flex justify-between gap-3"><dt className="text-white/80">Deductions</dt><dd className="m-0 tabular-nums">AED {latestPayslip.deductions.toLocaleString('en-US')}</dd></div>
              </dl>
              <Link to="/payslips" className="mt-auto flex min-h-11 cursor-pointer items-center justify-between rounded-lg border border-white/30 px-4 py-3 text-sm text-white transition-colors hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">View payroll <Icon name="chevronRight" size={16} /></Link>
            </section>
            <section className="min-w-0 rounded-[14px] border border-[var(--border)] bg-[var(--surface)] p-6">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h3 className="m-0 text-[17px] font-semibold text-[var(--tx)]">Announcements</h3>
                <Link to="/announcements" className="flex min-h-11 cursor-pointer items-center text-sm font-medium text-[var(--ink)] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2">View all</Link>
              </div>
              <div className="divide-y divide-[var(--border)]">
                {SAMPLE_ANNOUNCEMENTS.slice(0, 3).map((announcement) => (
                  <Link key={announcement.title} to="/announcements" className="group flex cursor-pointer gap-3 py-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--acc)]">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[var(--ink-bg)]"><Icon name="bell" size={18} color="var(--ink)" /></div>
                    <div className="min-w-0">
                      <div className="text-[14px] font-medium leading-snug text-[var(--tx)] group-hover:underline">{announcement.title}</div>
                      <p className="mb-0 mt-1 line-clamp-2 text-xs leading-relaxed text-[var(--tx2)]">{announcement.body}</p>
                      <div className="mt-2 text-[11px] text-[var(--tx2)]">{announcement.group} ? {announcement.meta}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
            <section className="flex min-w-0 flex-col rounded-[14px] border border-[var(--border)] bg-[var(--surface)] p-6 lg:col-span-2 xl:col-span-1">
              <div className="mb-3 flex items-center justify-between gap-3"><h3 className="m-0 text-[17px] font-semibold text-[var(--tx)]">Team Directory</h3><Icon name="users" size={22} color="var(--ink)" /></div>
              <p className="m-0 text-xs leading-relaxed text-[var(--tx2)]">Connect with people across teams and offices.</p>
              <div className="mb-5 mt-3 divide-y divide-[var(--border)]">
                {SAMPLE_COLLEAGUES.slice(0, 3).map((colleague) => (
                  <div key={colleague.body} className="flex items-center gap-3 py-4">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[var(--ink-bg)] text-xs font-semibold text-[var(--ink)]">{colleague.avatar}</div>
                    <div className="min-w-0"><div className="text-sm font-medium text-[var(--tx)]">{colleague.title}</div><div className="mt-1 break-words text-xs text-[var(--tx2)]">{colleague.subtitle}</div></div>
                  </div>
                ))}
              </div>
              <Link to="/directory" className="mt-auto flex min-h-11 cursor-pointer items-center justify-between rounded-lg border border-[var(--border-2)] px-4 py-3 text-sm font-medium text-[var(--ink)] transition-colors hover:bg-[var(--surface-2)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--acc)]">Find a colleague <Icon name="chevronRight" size={16} /></Link>
            </section>
          </div>
        </section>

        <div className="grid grid-cols-1 items-start gap-[18px] xl:grid-cols-3">
          <section className="gs-fade rounded-[14px] border border-[var(--border)] bg-[var(--surface)] p-6" style={{ animationDelay: '0.22s' }}>
            <h2 className="m-0 mb-[18px] text-[17px] font-semibold text-[var(--tx)]">Leave Balance</h2>
            {balancesQuery.isLoading ? (
              <div className="animate-pulse">
                <div className="h-9 w-16 rounded-lg bg-[var(--surface-2)]" />
                <div className="mt-[22px] flex flex-col gap-4">
                  {[0, 1, 2].map((i) => (
                    <div key={i}>
                      <div className="mb-2 flex justify-between">
                        <div className="h-3 w-24 rounded bg-[var(--surface-2)]" />
                        <div className="h-3 w-8 rounded bg-[var(--surface-2)]" />
                      </div>
                      <div className="h-1.5 rounded-[3px] bg-[var(--surface-2)]" />
                    </div>
                  ))}
                </div>
              </div>
            ) : balancesQuery.isError ? (
              <ErrorState message={balancesQuery.error.message} onRetry={() => balancesQuery.refetch()} />
            ) : balancesQuery.data?.balances.length ? (
              <>
                <div className="flex items-baseline gap-2.5">
                  <span className="text-[40px] font-extrabold tabular-nums tracking-[-0.035em] text-[var(--ink)]">{balancesQuery.data.totalRemaining}</span>
                  <span className="text-sm text-[var(--tx2)]">days available</span>
                </div>
                <div className="mt-[18px] flex flex-col gap-3.5">
                  {balancesQuery.data.balances.map((b, i) => (
                    <div key={b.leaveTypeId}>
                      <div className="mb-1.5 flex items-baseline justify-between gap-3 text-[13.5px]">
                        <span className="min-w-0 truncate text-[var(--tx)]">{b.name}</span>
                        <span className="flex-shrink-0 font-bold tabular-nums text-[var(--ink)]">
                          {b.remaining}{b.allocated ? <span className="font-medium text-[var(--tx3)]"> / {b.allocated}</span> : null}
                        </span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-[3px] bg-[var(--ink-bg)]">
                        <i
                          className="block h-full rounded-[3px]"
                          style={{
                            width: `${b.allocated ? Math.min(100, Math.max(0, (b.remaining / b.allocated) * 100)) : 0}%`,
                            background: LEAVE_BAR_COLORS[i % LEAVE_BAR_COLORS.length],
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="m-0 text-sm text-[var(--tx3)]">No leave balances found.</p>
            )}
            <button
              type="button"
              onClick={() => setApplyOpen(true)}
              className="mt-5 flex w-full cursor-pointer items-center justify-center gap-2 rounded-[9px] border border-[var(--border-2)] bg-[var(--surface)] py-3 text-[14.5px] font-medium text-[var(--ink)] transition-all duration-200 hover:bg-[var(--ink-solid)] hover:text-white hover:border-[var(--ink-solid)]"
            >
              Apply Leave <Icon name="chevronRight" size={16} color="currentColor" />
            </button>
          </section>

          <section className="gs-fade rounded-[14px] border border-[var(--border)] bg-[var(--surface)] p-6" style={{ animationDelay: '0.28s' }}>
            <div className="mb-2 flex items-center justify-between">
              <h2 className="m-0 text-[17px] font-semibold text-[var(--tx)]">Recent Requests</h2>
              <button type="button" onClick={() => navigate('/leave')} className="cursor-pointer border-0 bg-transparent text-sm font-medium text-[var(--pri)] hover:text-[var(--pri-d)]">View all</button>
            </div>
            {listQuery.isLoading ? (
              <div className="flex animate-pulse flex-col gap-1">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3 px-2 py-3">
                    <div className="h-8 w-8 flex-shrink-0 rounded-lg bg-[var(--surface-2)]" />
                    <div className="min-w-0 flex-1">
                      <div className="h-3.5 w-32 rounded bg-[var(--surface-2)]" />
                      <div className="mt-2 h-3 w-20 rounded bg-[var(--surface-2)]" />
                    </div>
                    <div className="h-5 w-16 rounded-md bg-[var(--surface-2)]" />
                  </div>
                ))}
              </div>
            ) : listQuery.isError ? (
              <ErrorState message={listQuery.error.message} onRetry={() => listQuery.refetch()} />
            ) : recentRequests.length ? recentRequests.map((r) => (
              <div key={r.id} className="-mx-2 flex items-center gap-3 rounded-[9px] px-2 py-3 transition-colors duration-200 hover:bg-[var(--surface-2)]">
                <div className="grid h-8 w-8 flex-shrink-0 place-items-center rounded-lg bg-[var(--ink-bg)]">
                  <Icon name="calendar" size={15} color="var(--ink)" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[14.5px] font-medium text-[var(--tx)]">{r.leaveTypeName}</div>
                  <div className="mt-0.5 text-[12.5px] text-[var(--tx2)]">{formatDateRange(r.dateFrom, r.dateTo)}</div>
                </div>
                <StatusBadge>{r.status}</StatusBadge>
              </div>
            )) : (
              <p className="m-0 text-sm text-[var(--tx3)]">No requests yet.</p>
            )}
          </section>

          <section className="gs-fade rounded-[14px] border border-[var(--border)] bg-[var(--surface)] p-6" style={{ animationDelay: '0.34s' }}>
            <h2 className="m-0 mb-[18px] text-[17px] font-semibold text-[var(--tx)]">This Week</h2>
            {weekQuery.isLoading ? (
              <div className="flex h-[132px] animate-pulse items-end justify-between gap-2.5">
                {[38, 62, 45, 70, 55].map((h, i) => (
                  <div key={i} className="flex h-full flex-1 flex-col items-center justify-end gap-2.5">
                    <div className="h-3 w-8 rounded bg-[var(--surface-2)]" />
                    <div className="w-full rounded-t-[5px] bg-[var(--surface-2)]" style={{ height: `${h}%` }} />
                    <div className="h-3 w-6 rounded bg-[var(--surface-2)]" />
                  </div>
                ))}
              </div>
            ) : weekQuery.isError ? (
              <ErrorState message={weekQuery.error.message} onRetry={() => weekQuery.refetch()} />
            ) : weekBars.length ? (
              <>
                <div className="flex h-[132px] items-end justify-between gap-2.5">
                  {weekBars.map((b) => (
                    <div key={b.day} className="flex h-full flex-1 flex-col items-center justify-end gap-2.5">
                      <span className={`text-[11.5px] font-semibold tabular-nums ${b.empty ? 'text-[var(--tx3)]' : 'text-[var(--tx2)]'}`}>{b.hours}</span>
                      {b.empty ? (
                        <div className="h-[3px] w-full rounded-full bg-[var(--border)]" />
                      ) : (
                        <div className="w-full rounded-t-[5px] rounded-b-[2px] bg-[var(--ink)]" style={{ height: `${b.pct}%` }} />
                      )}
                      <span className="text-[12.5px] text-[var(--tx2)]">{b.day}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-[18px] flex justify-between border-t border-[var(--border)] pt-4 text-[13.5px]">
                  <span className="text-[var(--tx2)]">Total logged</span>
                  <span className="font-bold tabular-nums text-[var(--ink)]">{totalWeekLabel}</span>
                </div>
              </>
            ) : (
              <p className="m-0 text-sm text-[var(--tx3)]">No punches in the last 7 days.</p>
            )}
          </section>
        </div>
      </div>

      <ApplyLeaveModal open={applyOpen} onClose={() => setApplyOpen(false)} />
    </Layout>
  );
};

export default Dashboard;
