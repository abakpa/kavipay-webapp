import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { SessionTimeoutProvider } from '@/contexts/SessionTimeoutContext';
import { VirtualCardProvider } from '@/contexts/VirtualCardContext';
import { KYCProvider } from '@/contexts/KYCContext';
import { WalletProvider } from '@/contexts/WalletContext';

import { UtilitiesProvider } from '@/contexts/UtilitiesContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { VerificationProvider } from '@/contexts/VerificationContext';
import { NotificationToast } from '@/components/notifications';
import { router } from '@/Router';
import './index.css';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <VerificationProvider>
          <NotificationProvider>
            <SessionTimeoutProvider>
              <KYCProvider>
                <WalletProvider>
                  <UtilitiesProvider>
                      <VirtualCardProvider>
                        <RouterProvider router={router} />
                        <NotificationToast />
                      </VirtualCardProvider>
                  </UtilitiesProvider>
                </WalletProvider>
              </KYCProvider>
            </SessionTimeoutProvider>
          </NotificationProvider>
        </VerificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
