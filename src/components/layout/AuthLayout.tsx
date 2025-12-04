import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import kaviIcon from '@/assets/kavi-icon.png';

export function AuthLayout() {
  const { user, loading, isInitializing } = useAuth();

  if (loading || isInitializing) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-kaviNavy">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-kaviBlue border-t-transparent" />
      </div>
    );
  }

  // If user is already logged in, redirect to dashboard
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden">
      {/* Gradient Background */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, #0A1628 0%, #0F1F3A 50%, #1A2C4A 100%)',
        }}
      />

      {/* Subtle radial glow */}
      <div
        className="absolute left-1/2 top-0 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2"
        style={{
          background:
            'radial-gradient(circle, rgba(77, 166, 255, 0.08) 0%, transparent 70%)',
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-1 flex-col">
        {/* Logo/Header */}
        <div className="flex flex-col items-center justify-center pb-4 pt-8 sm:pt-12">
          <div className="mb-2 flex h-[60px] w-[60px] items-center justify-center rounded-full bg-kaviBlue/20 shadow-lg shadow-kaviBlue/20">
            <img
              src={kaviIcon}
              alt="KaviPay"
              className="h-[45px] w-[45px] object-contain"
            />
          </div>
        </div>

        {/* Auth content - centered with max-width */}
        <div className="flex flex-1 items-start justify-center px-4 pb-8 sm:items-center sm:pb-16">
          <div className="w-full max-w-[400px]">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
