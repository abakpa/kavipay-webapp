import { createBrowserRouter, Navigate } from 'react-router-dom';

// Layouts
import { MainLayout } from '@/components/layout/MainLayout';
import { AuthLayout } from '@/components/layout/AuthLayout';

// Auth Pages
import { AuthPage } from '@/pages/auth/AuthPage';
import { ForgotPassword } from '@/pages/auth/ForgotPassword';
import { DeviceVerification } from '@/pages/auth/DeviceVerification';

// Dashboard
import { Dashboard } from '@/pages/dashboard/Dashboard';

// Cards
import { CardDashboard } from '@/pages/cards/CardDashboard';
import { CreateCard } from '@/pages/cards/CreateCard';
import { TopupCard } from '@/pages/cards/TopupCard';
import { WithdrawCard } from '@/pages/cards/WithdrawCard';
import { CardTransactions } from '@/pages/cards/CardTransactions';
import { CardSettings } from '@/pages/cards/CardSettings';
import { CardPreOrderStatus } from '@/pages/cards/CardPreOrderStatus';
import { CardPreOrderHistory } from '@/pages/cards/CardPreOrderHistory';
import { CardDelivery } from '@/pages/cards/CardDelivery';

// KYC
import { KYCFlow } from '@/pages/kyc/KYCFlow';
import { KYCStatus } from '@/pages/kyc/KYCStatus';

// Wallet
import { Deposit } from '@/pages/wallet/Deposit';
import { Send } from '@/pages/wallet/Send';
import { NairaDeposit } from '@/pages/deposit/NairaDeposit';
import { NairaWithdrawal } from '@/pages/withdrawal';

// Transactions
import { TransactionsPage, TransactionDetailPage } from '@/pages/transactions';

// Referral
import { ReferralDashboard } from '@/pages/referral/ReferralDashboard';

// Profile
import { Profile } from '@/pages/profile/Profile';
import { Settings } from '@/pages/profile/Settings';
import { AboutKavipay } from '@/pages/profile/AboutKavipay';
import { Legal } from '@/pages/profile/Legal';

// Security
import { SecuritySettings, TwoFactorSetup, PINManagement, Sessions } from '@/pages/security';

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
      { path: 'verify-device', element: <DeviceVerification /> },
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
      { path: 'cards/pre-order-status', element: <CardPreOrderStatus /> },
      { path: 'cards/pre-order-history', element: <CardPreOrderHistory /> },
      { path: 'cards/pre-orders/:preOrderId/delivery', element: <CardDelivery /> },
      { path: 'cards/:cardId/topup', element: <TopupCard /> },
      { path: 'cards/:cardId/withdraw', element: <WithdrawCard /> },
      { path: 'cards/:cardId/transactions', element: <CardTransactions /> },
      { path: 'cards/:cardId/settings', element: <CardSettings /> },

      // KYC
      { path: 'kyc', element: <KYCFlow /> },
      { path: 'kyc/status', element: <KYCStatus /> },

      // Wallet
      { path: 'deposit', element: <Deposit /> },
      { path: 'deposit/naira', element: <NairaDeposit /> },
      { path: 'withdrawal/naira', element: <NairaWithdrawal /> },
      { path: 'send', element: <Send /> },

      // Transactions
      { path: 'transactions', element: <TransactionsPage /> },
      { path: 'transactions/:id', element: <TransactionDetailPage /> },

      // Referral
      { path: 'referral', element: <ReferralDashboard /> },

      // Profile & Settings
      { path: 'profile', element: <Profile /> },
      { path: 'settings', element: <Settings /> },
      { path: 'about', element: <AboutKavipay /> },
      { path: 'legal', element: <Legal /> },

      // Security
      { path: 'security', element: <SecuritySettings /> },
      { path: 'security/2fa', element: <TwoFactorSetup /> },
      { path: 'security/pin', element: <PINManagement /> },
      { path: 'security/sessions', element: <Sessions /> },

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
