import { MoonIcon, SunIcon } from '@phosphor-icons/react';
import { useTheme } from '../../../shared/context/ThemeContext.jsx';
import './auth-hero.css';

const BRAND = `${import.meta.env.BASE_URL}brand/`;

/** Rejlers' three focus areas, cycled by the rotating tagline. */
const FOCUS_AREAS = ['Energy transition', 'Industry transformation', 'Future-proof communities'];

/** One three-bladed rotor centred on (0,0); the invisible circle squares its bbox so it spins on the hub. */
const Rotor = ({ length, variant }) => {
  const blade = `M0 0C3.4 -8 2.6 ${-length * 0.72} 0 ${-length}C-1.6 ${-length * 0.72} -2.6 -8 0 0Z`;
  return (
    <g className={`rj-scene__blades ${variant ? `rj-scene__blades--${variant}` : ''}`}>
      <circle r={length} fill="none" />
      {[0, 120, 240].map((deg) => (
        <path key={deg} className="rj-scene__blade" d={blade} transform={`rotate(${deg})`} />
      ))}
    </g>
  );
};

/** Wind turbine whose tower base sits at (x, 272); the rotor is nested so CSS rotation never fights the SVG translate. */
const Turbine = ({ x, height, blade, variant, delay }) => (
  <g transform={`translate(${x} ${272 - height})`}>
    <g className="rj-scene__turbine" style={{ animationDelay: delay }}>
      <path className="rj-scene__tower" d={`M-1.6 0H1.6L3.2 ${height}H-3.2Z`} />
      <Rotor length={blade} variant={variant} />
      <circle className="rj-scene__hub" r="3.6" />
    </g>
  </g>
);

/** A row of tilted solar panels with a light sweep clipped to the glass. */
const SOLAR_PANELS = [0, 1, 2, 3].map((i) => {
  const x = 318 + i * 46;
  return `M${x} 338L${x + 38} 338L${x + 50} 312L${x + 12} 312Z`;
});

/** Line-art scene for Rejlers' three focus areas: communities (skyline), industry (plant) and energy (wind + solar), linked by a live grid. */
const HeroScene = () => (
  <svg className="rj-scene" viewBox="0 0 600 360" fill="none" aria-hidden="true">
    <defs>
      <radialGradient id="rj-sun" cx=".5" cy=".5" r=".5">
        <stop stopColor="#F6B2BB" stopOpacity=".55" />
        <stop offset=".55" stopColor="#F6B2BB" stopOpacity=".14" />
        <stop offset="1" stopColor="#F6B2BB" stopOpacity="0" />
      </radialGradient>
      <linearGradient id="rj-ground" x1="0" y1="272" x2="0" y2="360" gradientUnits="userSpaceOnUse">
        <stop className="rj-scene__ground-stop" stopOpacity=".16" />
        <stop className="rj-scene__ground-stop" offset="1" stopOpacity="0" />
      </linearGradient>
      <linearGradient id="rj-panel" x1="0" y1="312" x2="0" y2="338" gradientUnits="userSpaceOnUse">
        <stop className="rj-scene__panel-stop-a" />
        <stop className="rj-scene__panel-stop-b" offset="1" />
      </linearGradient>
      <linearGradient id="rj-shimmer" x1="0" y1="0" x2="1" y2="0">
        <stop stopColor="#fff" stopOpacity="0" />
        <stop offset=".5" stopColor="#fff" stopOpacity=".55" />
        <stop offset="1" stopColor="#fff" stopOpacity="0" />
      </linearGradient>
      <clipPath id="rj-panels-clip">
        {SOLAR_PANELS.map((d) => <path key={d} d={d} />)}
      </clipPath>
    </defs>

    {/* sky */}
    <circle className="rj-scene__sun" cx="150" cy="190" r="120" />
    <path className="rj-scene__cloud" d="M360 92a14 14 0 0 1 26-6 11 11 0 0 1 18 9h-52a8 8 0 0 1 8-3Z" />
    <path className="rj-scene__cloud" d="M70 70a12 12 0 0 1 22-5 9 9 0 0 1 15 8H62a7 7 0 0 1 8-3Z" />

    {/* ground plane */}
    <path className="rj-scene__ground" d="M0 272H600V360H0Z" />
    <path className="rj-scene__perspective" d="M300 272L-120 360M300 272L60 360M300 272L230 360M300 272L370 360M300 272L540 360M300 272L720 360" />
    <path className="rj-scene__horizon" d="M0 272H600" />

    {/* future-proof communities */}
    <path
      className="rj-scene__city rj-scene__draw"
      pathLength="1"
      d="M24 272V214H52V272M52 272V182H78L86 170L94 182V272M94 272V226H118V272M118 272V196H146V272M146 272V236H172V272"
    />
    {[
      [31, 224], [41, 238], [31, 252], [60, 194], [70, 208], [60, 222], [80, 236], [70, 250],
      [101, 236], [125, 206], [135, 220], [125, 234], [135, 248], [153, 246],
    ].map(([x, y], i) => (
      <rect
        key={`${x}-${y}`}
        className={`rj-scene__window ${i % 4 === 1 ? 'rj-scene__window--warm' : ''}`}
        x={x}
        y={y}
        width="5"
        height="6"
        rx="1"
        style={{ animationDelay: `${(i * 0.73) % 6}s` }}
      />
    ))}

    {/* industry transformation */}
    <path
      className="rj-scene__factory rj-scene__draw rj-scene__draw--late"
      pathLength="1"
      d="M192 272V236L214 222V236L236 222V236L258 222V236H282V272ZM264 236V188H274V236"
    />
    {[0, 1.5, 3].map((delay) => (
      <circle key={delay} className="rj-scene__steam" cx="269" cy="178" r="6" style={{ animationDelay: `${delay}s` }} />
    ))}

    {/* the grid linking energy to industry and homes */}
    <path className="rj-scene__grid-line" d="M556 274C470 296 380 262 300 276S150 294 40 276" />
    <path className="rj-scene__flow" pathLength="1" d="M556 274C470 296 380 262 300 276S150 294 40 276" />

    {/* energy transition */}
    <Turbine x={402} height={150} blade={56} delay=".3s" />
    <Turbine x={484} height={118} blade={44} variant="b" delay=".5s" />
    <Turbine x={552} height={92} blade={34} variant="c" delay=".7s" />

    <g>
      {SOLAR_PANELS.map((d, i) => {
        const x = 318 + i * 46;
        return (
          <g key={d}>
            <path className="rj-scene__panel-leg" d={`M${x + 10} 338V346M${x + 34} 338V346`} />
            <path className="rj-scene__panel" d={d} />
            <path className="rj-scene__panel-grid" d={`M${x + 6} 325H${x + 44}M${x + 19} 312L${x + 13} 338M${x + 31} 312L${x + 25} 338`} />
          </g>
        );
      })}
      <g clipPath="url(#rj-panels-clip)">
        <rect className="rj-scene__shimmer" x="318" y="300" width="70" height="50" />
      </g>
    </g>
  </svg>
);

/**
 * Renders the animated Rejlers brand panel beside the authentication form.
 * @param {{ children: React.ReactNode }} props - Authentication form content.
 * @returns {React.ReactElement} Responsive authentication shell; throws no custom errors.
 */
const AuthLayout = ({ children }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="rj-auth">
      <section className="rj-hero" aria-label="Rejlers HRMS">
        <div className="rj-hero__grid" aria-hidden="true" />
        <div className="rj-hero__orb rj-hero__orb--turbine" aria-hidden="true" />
        <div className="rj-hero__orb rj-hero__orb--green" aria-hidden="true" />
        <div className="rj-hero__orb rj-hero__orb--passion" aria-hidden="true" />
        <svg className="rj-hero__r" viewBox="0 0 260 330" aria-hidden="true">
          <path pathLength="1" d="M40 300V40H140A75 75 0 0 1 140 190H96L210 300" />
        </svg>

        <header className="rj-hero__header rj-rise rj-rise--1">
          <img src={`${BRAND}rejlers-logo.svg`} alt="Rejlers" className="rj-hero__logo dark:hidden" />
          <img src={`${BRAND}rejlers-logo-white.svg`} alt="Rejlers" className="rj-hero__logo hidden dark:block" />
        </header>

        <div className="rj-hero__art">
          <HeroScene />
        </div>

        <div className="rj-hero__copy">
          <p className="rj-hero__eyebrow rj-rise rj-rise--2">Home of the learning minds</p>
          <h2 className="rj-hero__title rj-rise rj-rise--3">
            Engineering a sustainable future
            <span className="rj-rotator" aria-label={FOCUS_AREAS.join(', ')}>
              {FOCUS_AREAS.map((area) => <span key={area} aria-hidden="true">{area}</span>)}
            </span>
          </h2>
          <p className="rj-hero__description rj-rise rj-rise--4">
            Your attendance, leave and personal records - one place for every Rejlers learning mind.
          </p>
        </div>

        <footer className="rj-hero__footer">
          <span>&copy; {new Date().getFullYear()} Rejlers</span>
        </footer>
      </section>

      <section className="rj-auth__form" aria-label="Sign in">
        <button
          type="button"
          onClick={toggleTheme}
          className="absolute right-3 top-3 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--tx)] transition-colors duration-200 hover:bg-[var(--surface-2)] sm:right-4 sm:top-4"
          aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
          title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
        >
          {theme === 'dark' ? <SunIcon size={20} /> : <MoonIcon size={20} />}
        </button>
        <div className="w-full max-w-[408px]">{children}</div>
      </section>
    </div>
  );
};

export default AuthLayout;
