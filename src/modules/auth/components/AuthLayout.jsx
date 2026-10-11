import { MoonIcon, SunIcon } from '@phosphor-icons/react';
import { useTheme } from '../../../shared/context/ThemeContext.jsx';
import './auth-hero.css';

const BRAND = `${import.meta.env.BASE_URL}brand/`;

/**
 * Renders the branded employee sign-in shell.
 * @param {{ children: React.ReactNode }} props - Authentication form content.
 * @returns {React.ReactElement} Responsive shell; throws no custom errors.
 */
const AuthLayout = ({ children }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="rj-auth">
      <section className="rj-hero" aria-label="Rejlers employee portal">
        <header className="rj-hero__header">
          <img src={`${BRAND}rejlers-logo.svg`} alt="Rejlers" className="rj-hero__logo dark:hidden" />
          <img src={`${BRAND}rejlers-logo-white.svg`} alt="Rejlers" className="rj-hero__logo hidden dark:block" />
        </header>
        <div className="rj-hero__copy">
          <p className="rj-hero__eyebrow">Connected by curiosity. Driven by purpose.</p>
          <h2>Home of the<br /><span>learning minds.</span></h2>
          <p className="rj-hero__description">Your people. Your possibilities.<br />Your working day, connected.</p>
        </div>
        <figure className="rj-hero__visual">
          <img src={`${BRAND}rejlers-energy-transition.jpg`} alt="Engineers installing solar panels alongside wind turbines and energy infrastructure" className="rj-hero__photo" width="1024" height="576" fetchPriority="high" />
          <div className="rj-hero__photo-shade" aria-hidden="true" />
          <img src={`${BRAND}rejlers-mark-white.svg`} alt="" className="rj-hero__photo-mark" aria-hidden="true" />
          <figcaption>
            <span className="rj-hero__photo-label">Ideas into impact</span>
            <span className="rj-hero__photo-title">Engineering a<br />sustainable future.</span>
          </figcaption>
        </figure>
        <footer className="rj-hero__footer">
          <span>Energy transition</span><span>Industry transformation</span><span>Future-proof communities</span>
        </footer>
      </section>

      <section className="rj-auth__form" aria-label="Sign in">
        <button
          type="button"
          onClick={toggleTheme}
          className="absolute right-3 top-3 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--tx)] transition-colors hover:bg-[var(--surface-2)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--acc)] sm:right-4 sm:top-4"
          aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
        >
          {theme === 'dark' ? <SunIcon size={20} /> : <MoonIcon size={20} />}
        </button>
        <div className="w-full max-w-[408px]">{children}</div>
      </section>
    </div>
  );
};

export default AuthLayout;
