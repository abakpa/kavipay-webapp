import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Wallet, Banknote } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { WithdrawalForm } from '@/components/wallet/WithdrawalForm';
import { WalletBalanceHeader } from '@/components/wallet/WalletBalanceHeader';
import { cn } from '@/lib/utils';

type WithdrawalMethod = 'crypto' | 'naira';

export function Send() {
  const navigate = useNavigate();
  const [selectedMethod, setSelectedMethod] = useState<WithdrawalMethod | null>(null);

  const handleSuccess = () => {
    navigate('/dashboard');
  };

  const handleCancel = () => {
    if (selectedMethod) {
      setSelectedMethod(null);
    } else {
      navigate(-1);
    }
  };

  const handleMethodSelect = (method: WithdrawalMethod) => {
    if (method === 'naira') {
      navigate('/withdrawal/naira');
    } else {
      setSelectedMethod(method);
    }
  };

  const renderMethodSelection = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-accent hover:bg-accent/80"
        >
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>
        <h1 className="text-2xl font-bold text-foreground">Send / Withdraw</h1>
      </div>

      {/* Balance Header */}
      <WalletBalanceHeader />

      {/* Withdrawal Methods */}
      <div className="space-y-4">
        <h2 className="font-semibold text-foreground">Choose Withdrawal Method</h2>

        {/* Crypto Withdrawal */}
        <button
          onClick={() => handleMethodSelect('crypto')}
          className={cn(
            'flex w-full items-center gap-4 rounded-xl border p-4 text-left transition-colors',
            'border-border hover:border-kaviBlue hover:bg-kaviBlue/5'
          )}
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-kaviBlue/10">
            <Wallet className="h-6 w-6 text-kaviBlue" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground">Crypto Wallet</h3>
            <p className="text-sm text-muted-foreground">
              Send USD to an external crypto wallet address
            </p>
          </div>
          <span className="rounded-full bg-kaviBlue/10 px-2 py-1 text-xs font-medium text-kaviBlue">
            USDC
          </span>
        </button>

        {/* Naira Withdrawal */}
        <button
          onClick={() => handleMethodSelect('naira')}
          className={cn(
            'flex w-full items-center gap-4 rounded-xl border p-4 text-left transition-colors',
            'border-border hover:border-emerald-500 hover:bg-emerald-500/5'
          )}
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10">
            <Banknote className="h-6 w-6 text-emerald-500" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground">Bank Account (NGN)</h3>
            <p className="text-sm text-muted-foreground">
              Withdraw Naira to any Nigerian bank account
            </p>
          </div>
          <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-xs font-medium text-emerald-500">
            Instant
          </span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="mx-auto max-w-2xl">
      {selectedMethod === null ? (
        renderMethodSelection()
      ) : (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <button
              onClick={handleCancel}
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
      )}
    </div>
  );
}

export default Send;
