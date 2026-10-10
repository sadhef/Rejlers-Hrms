import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ListIcon, MoonIcon, SunIcon } from '@phosphor-icons/react';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { getProfile } from '../../modules/Profile/services/profileService.js';
import Icon from './Icon.jsx';

/**
 * Top bar: the theme toggle and the signed-in user's profile chip, which links straight to My
 * Profile.
 * @param {() => void} onMobileMenuToggle - Opens the sidebar overlay on mobile.
 */
const Header = ({ onMobileMenuToggle }) => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { data: profile } = useQuery({ queryKey: ['profile'], queryFn: getProfile });

  const displayName = profile?.name || user?.name || 'User';
  const initials = displayName.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
  const roleLabel = profile?.jobTitle || 'Employee';

  return (
    <header className="relative z-[60] flex flex-shrink-0 flex-wrap items-center gap-x-3 gap-y-3 px-4 py-3 sm:flex-nowrap sm:gap-x-[22px] sm:px-6 lg:px-9 lg:py-4">
      <button
        type="button"
        onClick={onMobileMenuToggle}
        className="flex h-11 w-11 flex-shrink-0 cursor-pointer items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--tx2)] lg:hidden"
        aria-label="Open menu"
      >
        <ListIcon size={17} />
      </button>

      <div className="ml-auto flex flex-shrink-0 items-center gap-[18px]">
        <button
          type="button"
          onClick={toggleTheme}
          className="flex cursor-pointer items-center justify-center rounded-full border-0 bg-transparent p-2 text-[var(--tx)] transition-colors duration-200 hover:bg-[var(--bg)]"
          aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
        >
          {theme === 'dark' ? <SunIcon size={20} /> : <MoonIcon size={20} />}
        </button>

        <div className="hidden h-7 w-px bg-[var(--border)] sm:block" />

        <Link
          to="/profile"
          className="flex min-w-0 cursor-pointer items-center gap-[11px] rounded-full border-0 bg-transparent py-1 pl-1 pr-3 transition-colors duration-200 hover:bg-[var(--bg)]"
        >
          {profile?.imageUrl ? (
            <img src={profile.imageUrl} alt={displayName} className="h-10 w-10 flex-shrink-0 rounded-full object-cover" />
          ) : (
            <div className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-full bg-[var(--ink-solid)] text-[14px] font-semibold tabular-nums text-white">
              {initials}
            </div>
          )}
          <div className="hidden min-w-0 max-w-[150px] text-left sm:block xl:max-w-[190px]">
            <div className="truncate text-[15px] font-medium text-[var(--tx)]">{displayName}</div>
            <div className="truncate text-[12.5px] text-[var(--tx2)]">{roleLabel}</div>
          </div>
          <Icon name="chevronDown" size={16} color="var(--tx2)" className="hidden sm:block" />
        </Link>
      </div>
    </header>
  );
};

export default Header;
