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
import { CreateCard } from '@/pages/cards/CreateCard';
import { TopupCard } from '@/pages/cards/TopupCard';
import { WithdrawCard } from '@/pages/cards/WithdrawCard';
import { CardTransactions } from '@/pages/cards/CardTransactions';
import { CardSettings } from '@/pages/cards/CardSettings';

// KYC
import { KYCFlow } from '@/pages/kyc/KYCFlow';
import { KYCStatus } from '@/pages/kyc/KYCStatus';

// Wallet
import { Deposit } from '@/pages/wallet/Deposit';
import { Send } from '@/pages/wallet/Send';

// Referral
import { Referral } from '@/pages/referral/Referral';

// Profile
import { Profile } from '@/pages/profile/Profile';
import { Settings } from '@/pages/profile/Settings';

// Notifications
import { Notifications } from '@/pages/Notifications';

// Utilities
import { UtilitiesHome, Airtime, Data, Electricity, TV, UtilityResult } from '@/pages/utilities';

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
      { path: 'cards/create', element: <CreateCard /> },
      { path: 'cards/:cardId/topup', element: <TopupCard /> },
      { path: 'cards/:cardId/withdraw', element: <WithdrawCard /> },
      { path: 'cards/:cardId/transactions', element: <CardTransactions /> },
      { path: 'cards/:cardId/settings', element: <CardSettings /> },

      // KYC
      { path: 'kyc', element: <KYCFlow /> },
      { path: 'kyc/status', element: <KYCStatus /> },

      // Wallet
      { path: 'deposit', element: <Deposit /> },
      { path: 'send', element: <Send /> },

      // Referral
      { path: 'referral', element: <Referral /> },

      // Profile & Settings
      { path: 'profile', element: <Profile /> },
      { path: 'settings', element: <Settings /> },

      // Notifications
      { path: 'notifications', element: <Notifications /> },

      // Utilities
      { path: 'utilities', element: <UtilitiesHome /> },
      { path: 'utilities/airtime', element: <Airtime /> },
      { path: 'utilities/data', element: <Data /> },
      { path: 'utilities/electricity', element: <Electricity /> },
      { path: 'utilities/tv', element: <TV /> },
      { path: 'utilities/result', element: <UtilityResult /> },

      // Legacy utility routes (redirect to new paths)
      { path: 'airtime', element: <Navigate to="/utilities/airtime" replace /> },
      { path: 'data', element: <Navigate to="/utilities/data" replace /> },
      { path: 'electricity', element: <Navigate to="/utilities/electricity" replace /> },
      { path: 'tv', element: <Navigate to="/utilities/tv" replace /> },
    ],
  },

  // 404 catch-all
  { path: '*', element: <NotFound /> },
]);
