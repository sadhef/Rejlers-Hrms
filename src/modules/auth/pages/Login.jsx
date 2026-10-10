import { useEffect, useState } from 'react';
import { useAuth } from '../../../shared/context/AuthContext.jsx';
import AuthLayout from '../components/AuthLayout.jsx';
import { ArrowRightIcon } from '@phosphor-icons/react';
import Icon from '../../../shared/components/Icon.jsx';

const REMEMBERED_USERNAME_KEY = 'rejlers-hrms-remembered-username';

const fieldClass = 'w-full mt-2 rounded-xl border border-[var(--border-2)] bg-[var(--surface)] px-4 py-3.5 text-[15.5px] normal-case tracking-normal text-[var(--tx)] outline-none transition-[border-color,box-shadow] duration-200 placeholder:text-[var(--tx3)] hover:border-[var(--tx3)] focus:border-[var(--acc)] focus:shadow-[0_0_0_4px_var(--acc-bg)]';

/**
 * Login page: username/password form inside AuthLayout, delegating auth to the shared AuthContext.
 * Renders unconditionally - no entrance animation gates the form or its button, since a stalled JS
 * timeline must never be able to make a submit control disappear.
 */
const Login = () => {
  const { login, loading: authLoading } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    const remembered = window.localStorage.getItem(REMEMBERED_USERNAME_KEY);
    if (remembered) {
      setUsername(remembered);
      setRememberMe(true);
    }
  }, []);

  /** Validates required fields client-side, persists/clears the remembered username, and signs in. */
  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError('');
    const normalizedUsername = username.trim();
    if (normalizedUsername.length === 0 || password.trim().length === 0) {
      setFormError('Username and password are required.');
      return;
    }
    try {
      await login({ username: normalizedUsername, password });
      if (rememberMe) {
        window.localStorage.setItem(REMEMBERED_USERNAME_KEY, normalizedUsername);
      } else {
        window.localStorage.removeItem(REMEMBERED_USERNAME_KEY);
      }
      setPassword('');
    } catch (errorValue) {
      const message = errorValue instanceof Error ? errorValue.message : '';
      setFormError(message || 'Unable to sign in.');
    }
  };

  return (
    <AuthLayout>
      <div className="gs-fade mb-9">
        <img src={`${import.meta.env.BASE_URL}brand/rejlers-mark.svg`} alt="" aria-hidden="true" className="block h-9 w-9 dark:hidden" />
        <img src={`${import.meta.env.BASE_URL}brand/rejlers-mark-white.svg`} alt="" aria-hidden="true" className="hidden h-9 w-9 dark:block" />
      </div>

      <h1 className="m-0 text-[28px] font-extrabold tracking-[-0.025em] text-[var(--tx)] sm:text-[32px]">Welcome back</h1>
      <p className="m-0 mb-[30px] mt-3 text-[15.5px] leading-relaxed text-[var(--tx2)]">Sign in with your Rejlers corporate account to manage your attendance, leave and profile.</p>

      <form onSubmit={handleSubmit} className="glass-form flex flex-col gap-4">
        <label className="text-[13px] font-medium uppercase tracking-[0.04em] text-[var(--tx2)]">
          Work Email
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            autoFocus
            placeholder="firstname.lastname@rejlers.com"
            className={fieldClass}
          />
        </label>

        <label className="relative block text-[13px] font-medium uppercase tracking-[0.04em] text-[var(--tx2)]">
          Password
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            placeholder="••••••••"
            className={`${fieldClass} pr-[52px]`}
          />
          <button
            type="button"
            onClick={() => setShowPassword((p) => !p)}
            className="absolute bottom-2 right-2 cursor-pointer rounded-[8px] border-0 bg-transparent px-3 py-2 text-[13px] font-semibold normal-case tracking-normal text-[var(--acc)] transition-colors duration-200 hover:bg-[var(--acc-bg)]"
          >
            {showPassword ? 'Hide' : 'Show'}
          </button>
        </label>

        <div className="mt-0.5 flex items-center">
          <button
            type="button"
            onClick={() => setRememberMe((r) => !r)}
            className="flex cursor-pointer items-center gap-2.5 border-0 bg-transparent p-0 text-[14.5px] text-[var(--tx)]"
          >
            <span className={`grid h-[18px] w-[18px] flex-shrink-0 place-items-center rounded-[6px] border transition-colors duration-150 ${rememberMe ? 'border-[var(--acc)] bg-[var(--acc)] text-white' : 'border-[var(--border-2)] bg-[var(--surface)] text-transparent'}`}>
              <Icon name="check" size={12} color="#fff" />
            </span>
            Keep me signed in
          </button>
        </div>

        {formError && (
          <p className="m-0 rounded-lg bg-[var(--bad-bg)] px-3.5 py-2.5 text-xs font-semibold text-[var(--bad)]">{formError}</p>
        )}

        <button
          type="submit"
          disabled={authLoading}
          className="group mt-2 flex w-full cursor-pointer items-center justify-center gap-2.5 rounded-full border-0 bg-[var(--pri)] py-4 text-[15.5px] font-medium text-white transition-[transform,box-shadow,background-color] duration-200 hover:-translate-y-0.5 hover:bg-[var(--pri-d)] hover:shadow-[var(--shadow-pri)] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 dark:hover:bg-[var(--ink-2)]"
        >
          {authLoading ? 'Signing in...' : 'Sign in'}
          {!authLoading && <ArrowRightIcon size={18} weight="bold" className="transition-transform duration-200 group-hover:translate-x-1" />}
        </button>
      </form>

      <div className="mt-8 flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3.5 text-[13.5px] text-[var(--tx2)]">
        <Icon name="shield" size={20} color="var(--acc)" className="flex-shrink-0" />
        <span>Need access or forgot your password? Contact your local Rejlers IT service desk.</span>
      </div>
    </AuthLayout>
  );
};

export default Login;
