import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bitcoin, Banknote } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { CryptoDepositFlow } from '@/components/wallet/CryptoDepositFlow';
import { WalletBalanceHeader } from '@/components/wallet/WalletBalanceHeader';
import { cn } from '@/lib/utils';

type DepositMethod = 'crypto' | 'naira';

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

  const handleMethodSelect = (method: DepositMethod) => {
    if (method === 'naira') {
      navigate('/deposit/naira');
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
        <h1 className="text-2xl font-bold text-foreground">Deposit</h1>
      </div>

      {/* Balance Header */}
      <WalletBalanceHeader />

      {/* Deposit Methods */}
      <div className="space-y-4">
        <h2 className="font-semibold text-foreground">Choose Deposit Method</h2>

        {/* Crypto Deposit */}
        <button
          onClick={() => handleMethodSelect('crypto')}
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
          <span className="rounded-full bg-amber-500/10 px-2 py-1 text-xs font-medium text-amber-500">
            50+ coins
          </span>
        </button>

        {/* Naira Deposit */}
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
            <h3 className="font-semibold text-foreground">Naira (NGN)</h3>
            <p className="text-sm text-muted-foreground">
              Deposit using bank transfer from any Nigerian bank account
            </p>
          </div>
          <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-xs font-medium text-emerald-500">
            Bank Transfer
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
        <Card>
          <CardContent className="py-6">
            <CryptoDepositFlow onComplete={handleComplete} onCancel={handleCancel} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default Deposit;
