import { useNavigate } from 'react-router-dom';
import { ServiceCard, WalletBalanceCard } from '@/components/utilities';
import { UtilityServices } from '@/constants/utilities';
import { useAuth } from '@/contexts/AuthContext';
import type { UtilityService } from '@/types/utilities';

export function UtilitiesHome() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleServiceClick = (service: UtilityService) => {
    navigate(service.route);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Utilities</h1>
        <p className="text-muted-foreground">
          Pay bills and buy airtime with crypto or wallet balance
        </p>
      </div>

      {/* Wallet Balance */}
      <WalletBalanceCard
        balance={user?.gameWalletBalance ?? 0}
        currency="USDT"
      />

      {/* Services Grid */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-foreground">Services</h2>
        <div className="space-y-3">
          {UtilityServices.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              onClick={handleServiceClick}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default UtilitiesHome;
