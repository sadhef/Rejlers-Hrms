import { NavLink } from 'react-router-dom';
import { XIcon } from '@phosphor-icons/react';
import Icon from './Icon.jsx';

/** Grouped nav: Overview / My Work / Company. */
const NAV_GROUPS = [
  {
    label: 'Overview',
    items: [
      { to: '/', label: 'Dashboard', icon: 'grid', end: true },
      { to: '/profile', label: 'My Profile', icon: 'user' },
    ],
  },
  {
    label: 'My Work',
    items: [
      { to: '/attendance', label: 'Attendance', icon: 'siteCheckIn' },
      { to: '/leave', label: 'Leave Requests', icon: 'calendar' },
      { to: '/payslips', label: 'Payroll', icon: 'file' },
    ],
  },
  {
    label: 'Company',
    items: [
      { to: '/announcements', label: 'Announcements', icon: 'bell' },
      { to: '/directory', label: 'Team Directory', icon: 'users' },
    ],
  },
];

/**
 * Primary navigation rail: grouped nav with a Deep Blue active pill and the Rejlers brand watermark,
 * sliding in as an overlay below the `lg` breakpoint. The signed-in user's identity lives in the
 * header instead of being repeated here.
 * @param {boolean} mobileOpen - Whether the mobile overlay is currently open.
 * @param {() => void} onClose - Closes the mobile overlay (called on nav-link click and the close button).
 * @param {() => void} onLogout - Signs the current user out.
 */
const Sidebar = ({ mobileOpen, onClose, onLogout }) => {
  return (
    <aside
      className={[
        'fixed inset-y-0 left-0 z-[200] flex w-[264px] max-w-[calc(100vw-24px)] flex-shrink-0 flex-col overflow-hidden',
        'rounded-r-[26px] bg-[var(--surface)] px-4 pb-5 pt-[30px] shadow-[1px_0_0_var(--border),18px_0_44px_rgba(43,58,85,0.06)]',
        'transition-transform duration-300 lg:relative lg:z-auto lg:translate-x-0',
        mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
      ].join(' ')}
    >
      <img
        src={`${import.meta.env.BASE_URL}brand/rejlers-mark.svg`}
        alt=""
        aria-hidden="true"
        className="gs-drift pointer-events-none absolute -bottom-[20px] -left-[30px] w-[200px] opacity-[0.045] dark:invert"
      />

      <button
        type="button"
        onClick={onClose}
        aria-label="Close menu"
        className="absolute right-3 top-3 z-10 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full text-[var(--tx2)] hover:bg-[var(--bg)] lg:hidden"
      >
        <XIcon size={16} />
      </button>

      <div className="relative px-2.5 pb-[22px] pt-1.5">
        <img src={`${import.meta.env.BASE_URL}brand/rejlers-logo.svg`} alt="Rejlers" className="block w-[150px] dark:hidden" />
        <img src={`${import.meta.env.BASE_URL}brand/rejlers-logo-white.svg`} alt="Rejlers" className="hidden w-[150px] dark:block" />
      </div>
      <div className="relative mx-2.5 mb-5 h-px bg-[var(--border)]" />

      <nav className="relative flex min-h-0 flex-1 flex-col gap-[22px] overflow-y-auto pr-0.5">
        {NAV_GROUPS.map((group) => (
          <div key={group.label} className="flex flex-col gap-0.5">
            <div className="px-3.5 pb-[9px] text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--tx2)]">{group.label}</div>
            {group.items.map(({ to, label, icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                onClick={onClose}
                className={({ isActive }) =>
                  [
                    'relative flex w-full items-center gap-[13px] overflow-hidden rounded-full px-4 py-[11px] text-left transition-[background-color,color,box-shadow] duration-200',
                    isActive
                      ? 'bg-[var(--ink-solid)] text-white'
                      : 'text-[var(--tx)] hover:bg-[var(--surface-2)]',
                  ].join(' ')
                }
              >
                {({ isActive }) => (
                  <>
                    <span className={`absolute right-4 h-1.5 w-1.5 rounded-full bg-[var(--rj-green)] ${isActive ? 'gs-pop' : 'hidden'}`} />
                    <Icon name={icon} size={20} color={isActive ? '#fff' : 'var(--tx2)'} className="flex-shrink-0" />
                    <span className={`text-[14.5px] tracking-[-0.005em] ${isActive ? 'font-semibold' : 'font-medium'}`}>{label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      <div className="relative mt-auto pt-[18px]">
        <div className="mx-2.5 mb-4 h-px bg-[var(--border)]" />
        <button
          type="button"
          onClick={onLogout}
          className="flex w-full cursor-pointer items-center gap-[13px] rounded-full border-0 bg-transparent px-4 py-[11px] text-[14.5px] font-medium text-[var(--tx)] transition-colors duration-200 hover:bg-[var(--bad-bg)] hover:text-[var(--bad)]"
        >
          <Icon name="logout" size={20} color="currentColor" className="flex-shrink-0" />
          Sign Out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
