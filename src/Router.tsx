import { createBrowserRouter, Navigate } from 'react-router-dom';

// Layouts
import { MainLayout } from '@/components/layout/MainLayout';
import { AuthLayout } from '@/components/layout/AuthLayout';

// Auth Pages
import { AuthPage } from '@/pages/auth/AuthPage';
import { ForgotPassword } from '@/pages/auth/ForgotPassword';

// Dashboard
import { Dashboard } from '@/pages/dashboard/Dashboard';

// Cards
import { CardDashboard } from '@/pages/cards/CardDashboard';

// KYC
import { KYCFlow } from '@/pages/kyc/KYCFlow';
import { KYCStatus } from '@/pages/kyc/KYCStatus';

// Profile
import { Profile } from '@/pages/profile/Profile';
import { Settings } from '@/pages/profile/Settings';

// Error Pages
import { NotFound } from '@/pages/NotFound';

export const router = createBrowserRouter([
  // Auth Routes (public)
  {
    path: '/auth',
    element: <AuthLayout />,
    children: [
      { index: true, element: <AuthPage /> },
      { path: 'login', element: <AuthPage /> },
      { path: 'register', element: <Navigate to="/auth?tab=register" replace /> },
      { path: 'forgot-password', element: <ForgotPassword /> },
    ],
  },

  // Protected Routes
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },

      // Dashboard
      { path: 'dashboard', element: <Dashboard /> },

      // Virtual Cards
      { path: 'cards', element: <CardDashboard /> },

      // KYC
      { path: 'kyc', element: <KYCFlow /> },
      { path: 'kyc/status', element: <KYCStatus /> },

      // Profile & Settings
      { path: 'profile', element: <Profile /> },
      { path: 'settings', element: <Settings /> },
    ],
  },

  // 404 catch-all
  { path: '*', element: <NotFound /> },
]);
