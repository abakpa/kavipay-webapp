import { useState } from 'react';
import { Send, AlertTriangle, Loader2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useWallet } from '@/contexts/WalletContext';
import { useAuth } from '@/contexts/AuthContext';
import { MIN_WITHDRAWAL_AMOUNT } from '@/types/wallet';
import { cn } from '@/lib/utils';

interface WithdrawalFormProps {
  onSuccess?: () => void;
  className?: string;
}

export function WithdrawalForm({ onSuccess, className }: WithdrawalFormProps) {
  const { user } = useAuth();
  const { submitWithdrawal, isLoading, error } = useWallet();

  const [amount, setAmount] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const balance = user?.gameWalletBalance ?? 0;
  const numAmount = parseFloat(amount) || 0;

  const isValidAmount = numAmount >= MIN_WITHDRAWAL_AMOUNT && numAmount <= balance;
  const isValidAddress = walletAddress.length >= 10 && walletAddress.startsWith('0x');
  const canSubmit = isValidAmount && isValidAddress && !isLoading;

  const quickPercentages = [25, 50, 75, 100];

  const handleQuickPercentage = (percent: number) => {
    const newAmount = (balance * percent) / 100;
    setAmount(newAmount.toFixed(2));
  };

  const handleSubmit = () => {
    setLocalError(null);

    if (!isValidAmount) {
      setLocalError(
        numAmount < MIN_WITHDRAWAL_AMOUNT
          ? `Minimum withdrawal is $${MIN_WITHDRAWAL_AMOUNT}`
          : 'Insufficient balance'
      );
      return;
    }

    if (!isValidAddress) {
      setLocalError('Please enter a valid Ethereum address');
      return;
    }

    setShowConfirm(true);
  };

  const handleConfirm = async () => {
    setShowConfirm(false);

    const withdrawal = await submitWithdrawal(numAmount, walletAddress);
    if (withdrawal) {
      setIsSuccess(true);
      setTimeout(() => {
        onSuccess?.();
      }, 2000);
    }
  };

  if (isSuccess) {
    return (
      <div className={cn('flex flex-col items-center py-8 text-center', className)}>
        <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10">
          <CheckCircle className="h-10 w-10 text-emerald-500" />
        </div>
        <h3 className="mb-2 text-xl font-bold text-foreground">Withdrawal Submitted!</h3>
        <p className="mb-4 text-muted-foreground">
          Your withdrawal of ${numAmount.toFixed(2)} is being processed.
        </p>
        <p className="text-sm text-muted-foreground">
          You will receive a notification when the transaction is complete.
        </p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-kaviBlue/10">
          <Send className="h-8 w-8 text-kaviBlue" />
        </div>
        <h2 className="text-xl font-bold text-foreground">Withdraw Funds</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Withdraw ETH to your external wallet
        </p>
      </div>

      {/* Balance Display */}
      <div className="rounded-xl bg-accent/50 p-4 text-center">
        <p className="text-sm text-muted-foreground">Available Balance</p>
        <p className="text-2xl font-bold text-foreground">${balance.toFixed(2)}</p>
      </div>

      {/* Error Display */}
      {(error || localError) && (
        <div className="rounded-xl bg-destructive/10 p-4 text-sm text-destructive">
          {error || localError}
        </div>
      )}

      {/* Amount Input */}
      <div>
        <label className="mb-2 block text-sm font-medium text-foreground">Amount (USD)</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
          min={MIN_WITHDRAWAL_AMOUNT}
          max={balance}
          step="0.01"
          className="w-full rounded-xl border border-border bg-card px-4 py-3 text-lg font-semibold text-foreground placeholder:text-muted-foreground focus:border-kaviBlue focus:outline-none focus:ring-2 focus:ring-kaviBlue/20"
        />
        <p className="mt-1 text-xs text-muted-foreground">
          Minimum: ${MIN_WITHDRAWAL_AMOUNT.toFixed(2)} USD
        </p>
      </div>

      {/* Quick Percentage Buttons */}
      <div className="flex gap-2">
        {quickPercentages.map((percent) => (
          <button
            key={percent}
            type="button"
            onClick={() => handleQuickPercentage(percent)}
            className={cn(
              'flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors',
              numAmount === (balance * percent) / 100
                ? 'border-kaviBlue bg-kaviBlue text-white'
                : 'border-border bg-card text-foreground hover:border-kaviBlue hover:bg-kaviBlue/10'
            )}
          >
            {percent === 100 ? 'MAX' : `${percent}%`}
          </button>
        ))}
      </div>

      {/* Wallet Address Input */}
      <div>
        <label className="mb-2 block text-sm font-medium text-foreground">
          Destination Address
        </label>
        <input
          type="text"
          value={walletAddress}
          onChange={(e) => setWalletAddress(e.target.value)}
          placeholder="0x..."
          className="w-full rounded-xl border border-border bg-card px-4 py-3 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:border-kaviBlue focus:outline-none focus:ring-2 focus:ring-kaviBlue/20"
        />
        <p className="mt-1 text-xs text-muted-foreground">
          Enter your Ethereum wallet address on Base Network
        </p>
      </div>

      {/* Warning */}
      <div className="rounded-xl bg-amber-500/10 p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 shrink-0 text-amber-500" />
          <div>
            <p className="font-medium text-amber-600">Important</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Withdrawals are sent on the Base Network. Make sure your wallet supports Base Network
              ETH. Sending to an incorrect address may result in permanent loss of funds.
            </p>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <Button className="w-full" onClick={handleSubmit} disabled={!canSubmit}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            Withdraw ${numAmount > 0 ? numAmount.toFixed(2) : '0.00'}
            <Send className="ml-2 h-4 w-4" />
          </>
        )}
      </Button>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-card p-6">
            <h3 className="mb-4 text-lg font-bold text-foreground">Confirm Withdrawal</h3>
            <div className="mb-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount:</span>
                <span className="font-semibold text-foreground">${numAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">To:</span>
                <span className="truncate font-mono text-xs text-foreground">{walletAddress}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Network:</span>
                <span className="font-semibold text-foreground">Base</span>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setShowConfirm(false)}>
                Cancel
              </Button>
              <Button className="flex-1" onClick={handleConfirm}>
                Confirm
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default WithdrawalForm;
