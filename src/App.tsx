import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { SessionTimeoutProvider } from '@/contexts/SessionTimeoutContext';
import { VirtualCardProvider } from '@/contexts/VirtualCardContext';
import { KYCProvider } from '@/contexts/KYCContext';
import { WalletProvider } from '@/contexts/WalletContext';
import { ReferralProvider } from '@/contexts/ReferralContext';
import { UtilitiesProvider } from '@/contexts/UtilitiesContext';
import { router } from '@/Router';
import './index.css';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SessionTimeoutProvider>
          <KYCProvider>
            <WalletProvider>
              <UtilitiesProvider>
                <ReferralProvider>
                  <VirtualCardProvider>
                    <RouterProvider router={router} />
                  </VirtualCardProvider>
                </ReferralProvider>
              </UtilitiesProvider>
            </WalletProvider>
          </KYCProvider>
        </SessionTimeoutProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
