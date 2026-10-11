import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Login from './modules/auth/pages/Login.jsx';
import { useAuth } from './shared/context/AuthContext.jsx';
import Dashboard from './modules/Dashboard/pages/Dashboard.jsx';
import Profile from './modules/Profile/pages/Profile.jsx';
import Attendance from './modules/Attendance/pages/Attendance.jsx';
import Leave from './modules/Leave/pages/Leave.jsx';
import Payslips from './modules/Payslips/pages/Payslips.jsx';
import Announcements from './modules/Announcements/pages/Announcements.jsx';
import Directory from './modules/Directory/pages/Directory.jsx';

/** Full-page spinner shown while auth state (user/session) is being resolved, used by every route guard below. */
const LoadingScreen = () => (
  <div className="flex min-h-screen items-center justify-center bg-[var(--bg)] text-[var(--tx2)]">
    <img src={`${import.meta.env.BASE_URL}brand/rejlers-mark.svg`} alt="Loading" className="h-10 w-10 animate-pulse dark:invert" />
  </div>
);

/** Requires an authenticated user for every page in the app; redirects to login when signed out. */
const ProtectedRoute = ({ children }) => {
  const { user, initializing } = useAuth();

  if (initializing) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

/** Defines the full route table; also hosts the app-wide toast notifications. */
const AppRoutes = () => {
  const { user, initializing } = useAuth();

  if (initializing) return <LoadingScreen />;

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: 'var(--ink-solid)',
            color: '#fff',
            borderRadius: '999px',
            padding: '14px 24px',
            fontSize: '15px',
            boxShadow: '0 18px 40px rgba(0,0,0,0.32)',
          },
        }}
      />

      <Routes>
        <Route
          path="/login"
          element={user ? <Navigate to="/" replace /> : <Login />}
        />
        <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/attendance" element={<ProtectedRoute><Attendance /></ProtectedRoute>} />
        <Route path="/leave" element={<ProtectedRoute><Leave /></ProtectedRoute>} />
        <Route path="/payslips" element={<ProtectedRoute><Payslips /></ProtectedRoute>} />
        <Route path="/announcements" element={<ProtectedRoute><Announcements /></ProtectedRoute>} />
        <Route path="/directory" element={<ProtectedRoute><Directory /></ProtectedRoute>} />
        <Route path="/requests" element={<Navigate to="/leave" replace />} />
        <Route path="*" element={user ? <Navigate to="/" replace /> : <Navigate to="/login" replace />} />
      </Routes>
    </>
  );
};

/** Root component: wraps the routed app in the browser router. */
const App = () => {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <AppRoutes />
    </BrowserRouter>
  );
};

export default App;
