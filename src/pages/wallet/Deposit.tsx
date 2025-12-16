import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bitcoin, Wallet } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { CryptoDepositFlow } from '@/components/wallet/CryptoDepositFlow';
import { GameWalletTopup } from '@/components/wallet/GameWalletTopup';
import { WalletBalanceHeader } from '@/components/wallet/WalletBalanceHeader';
import { cn } from '@/lib/utils';

type DepositMethod = 'crypto' | 'eth';

export function Deposit() {
  const navigate = useNavigate();
  const [selectedMethod, setSelectedMethod] = useState<DepositMethod | null>(null);

  const handleComplete = () => {
    navigate('/dashboard');
  };

  const handleCancel = () => {
    if (selectedMethod) {
      setSelectedMethod(null);
    } else {
      navigate(-1);
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
        <div>
          <h1 className="text-2xl font-bold text-foreground">Deposit Funds</h1>
          <p className="text-muted-foreground">Choose a deposit method</p>
        </div>
      </div>

      {/* Balance Header */}
      <WalletBalanceHeader />

      {/* Deposit Methods */}
      <div className="space-y-4">
        <h2 className="font-semibold text-foreground">Select Deposit Method</h2>

        {/* Crypto Deposit */}
        <button
          onClick={() => setSelectedMethod('crypto')}
          className={cn(
            'flex w-full items-center gap-4 rounded-xl border p-4 text-left transition-colors',
            'border-border hover:border-kaviBlue hover:bg-kaviBlue/5'
          )}
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10">
            <Bitcoin className="h-6 w-6 text-amber-500" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground">Cryptocurrency</h3>
            <p className="text-sm text-muted-foreground">
              Deposit using BTC, ETH, USDT, and more
            </p>
          </div>
        </button>

        {/* ETH on Base */}
        <button
          onClick={() => setSelectedMethod('eth')}
          className={cn(
            'flex w-full items-center gap-4 rounded-xl border p-4 text-left transition-colors',
            'border-border hover:border-kaviBlue hover:bg-kaviBlue/5'
          )}
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-kaviBlue/10">
            <Wallet className="h-6 w-6 text-kaviBlue" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground">ETH on Base Network</h3>
            <p className="text-sm text-muted-foreground">
              Direct ETH deposit to your wallet address
            </p>
          </div>
        </button>
      </div>

      {/* Info Box */}
      <div className="rounded-xl bg-accent/50 p-4">
        <p className="text-sm text-muted-foreground">
          All deposits are securely processed. Cryptocurrency deposits typically confirm within
          10-30 minutes depending on network congestion.
        </p>
      </div>
    </div>
  );

  return (
    <div className="mx-auto max-w-2xl">
      {selectedMethod === null ? (
        renderMethodSelection()
      ) : (
        <Card>
          <CardContent className="py-6">
            {selectedMethod === 'crypto' ? (
              <CryptoDepositFlow onComplete={handleComplete} onCancel={handleCancel} />
            ) : (
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <button
                    onClick={handleCancel}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-accent hover:bg-accent/80"
                  >
                    <ArrowLeft className="h-5 w-5 text-foreground" />
                  </button>
                  <div>
                    <h2 className="text-xl font-bold text-foreground">ETH Deposit</h2>
                    <p className="text-sm text-muted-foreground">Base Network</p>
                  </div>
                </div>
                <GameWalletTopup />
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default Deposit;
