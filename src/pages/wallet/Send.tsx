import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { WithdrawalForm } from '@/components/wallet/WithdrawalForm';
import { WalletBalanceHeader } from '@/components/wallet/WalletBalanceHeader';

export function Send() {
  const navigate = useNavigate();

  const handleSuccess = () => {
    navigate('/dashboard');
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-accent hover:bg-accent/80"
        >
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Send Funds</h1>
          <p className="text-muted-foreground">Withdraw to external wallet</p>
        </div>
      </div>

      {/* Balance Header */}
      <WalletBalanceHeader />

      {/* Withdrawal Form */}
      <Card>
        <CardContent className="py-6">
          <WithdrawalForm onSuccess={handleSuccess} />
        </CardContent>
      </Card>
    </div>
  );
}

export default Send;
