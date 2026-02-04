import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Banknote, Loader2, AlertCircle, History, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { CountdownTimer, VirtualAccountCard } from '@/components/deposit';
import {
  createNairaVirtualAccount,
  getNairaVirtualAccount,
  cancelNairaVirtualAccount,
  getNairaDeposits,
} from '@/lib/api/deposit';
import type {
  NairaVirtualAccount,
  NairaDeposit as NairaDepositType,
} from '@/types/deposit';
import { NAIRA_MIN_AMOUNT, NAIRA_MAX_AMOUNT, NAIRA_QUICK_AMOUNTS } from '@/types/deposit';
import { cn } from '@/lib/utils';

type DepositStep = 'amount' | 'account' | 'expired';

export function NairaDeposit() {
  const navigate = useNavigate();

  // State
  const [step, setStep] = useState<DepositStep>('amount');
  const [amount, setAmount] = useState('');
  const [virtualAccount, setVirtualAccount] = useState<NairaVirtualAccount | null>(null);
  const [recentDeposits, setRecentDeposits] = useState<NairaDepositType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAccount, setIsCheckingAccount] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const numAmount = parseFloat(amount) || 0;
  const isValidAmount = numAmount >= NAIRA_MIN_AMOUNT && numAmount <= NAIRA_MAX_AMOUNT;

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      setIsCheckingAccount(true);
      try {
        // Check for existing virtual account
        const account = await getNairaVirtualAccount();
        if (account && account.status === 'active') {
          // Check if not expired
          const expiresAt = new Date(account.expiresAt);
          if (expiresAt > new Date()) {
            setVirtualAccount(account);
            setStep('account');
          }
        }

        // Load recent deposits
        try {
          const response = await getNairaDeposits(1, 3);
          setRecentDeposits(response.deposits || []);
        } catch {
          // Ignore errors loading recent deposits
        }
      } catch (err) {
        console.error('Failed to load data:', err);
        // No active account, stay on amount step
      } finally {
        setIsCheckingAccount(false);
      }
    };

    loadData();
  }, []);

  const handleAmountChange = (value: string) => {
    // Remove non-numeric characters except decimal
    const cleaned = value.replace(/[^0-9]/g, '');
    setAmount(cleaned);
    setError(null);
  };

  const handleQuickAmount = (value: number) => {
    setAmount(value.toString());
    setError(null);
  };

  const handleCreateAccount = async () => {
    if (!isValidAmount) return;

    setIsLoading(true);
    setError(null);

    try {
      // Create virtual account via API
      const account = await createNairaVirtualAccount(numAmount);
      setVirtualAccount(account);
      setStep('account');
    } catch (err: unknown) {
      let message = 'Failed to create virtual account';
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { data?: { error?: string; message?: string } } };
        message = axiosError.response?.data?.error || axiosError.response?.data?.message || message;
      } else if (err instanceof Error) {
        message = err.message;
      }
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelAccount = async () => {
    if (!virtualAccount) return;

    setIsLoading(true);
    setError(null);

    try {
      // Cancel virtual account via API
      await cancelNairaVirtualAccount();
      setVirtualAccount(null);
      setAmount('');
      setStep('amount');
    } catch (err: unknown) {
      let message = 'Failed to cancel account';
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { data?: { error?: string; message?: string } } };
        message = axiosError.response?.data?.error || axiosError.response?.data?.message || message;
      } else if (err instanceof Error) {
        message = err.message;
      }
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExpire = useCallback(() => {
    setStep('expired');
  }, []);

  const handleStartNew = () => {
    setVirtualAccount(null);
    setAmount('');
    setStep('amount');
  };

  const formatNaira = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Loading state while checking for existing account
  if (isCheckingAccount) {
    return (
      <div className="mx-auto max-w-2xl">
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-kaviBlue" />
              <p className="mt-2 text-muted-foreground">Loading...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/deposit')}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-accent hover:bg-accent/80"
          >
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </button>
          <h1 className="text-2xl font-bold text-foreground">Naira Deposit</h1>
        </div>

        {/* Error Display */}
        {error && (
          <div className="flex items-center gap-2 rounded-xl bg-destructive/10 p-4">
            <AlertCircle className="h-5 w-5 shrink-0 text-destructive" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {/* Step: Enter Amount */}
        {step === 'amount' && (
          <Card>
            <CardContent className="space-y-6 py-6">
              {/* Header */}
              <div>
                <h2 className="text-lg font-semibold text-foreground">Enter Amount to Deposit</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Enter the exact amount in naira that you want to deposit. A temporary account will be generated for 30 minutes.
                </p>
              </div>

              {/* Amount Input */}
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
                  Amount (NGN)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-semibold text-muted-foreground">
                    ₦
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={amount ? formatNaira(numAmount) : ''}
                    onChange={(e) => handleAmountChange(e.target.value)}
                    placeholder="0"
                    className={cn(
                      'w-full rounded-xl border bg-card py-4 pl-10 pr-4 text-2xl font-bold text-foreground placeholder:text-muted-foreground focus:border-kaviBlue focus:outline-none focus:ring-2 focus:ring-kaviBlue/20',
                      error ? 'border-destructive' : 'border-border'
                    )}
                  />
                </div>
              </div>

              {/* Quick Amount Buttons */}
              <div>
                <label className="mb-2 block text-sm font-medium text-muted-foreground">
                  Quick Select
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {NAIRA_QUICK_AMOUNTS.map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => handleQuickAmount(value)}
                      className={cn(
                        'rounded-lg border px-3 py-2 text-sm font-medium transition-colors',
                        numAmount === value
                          ? 'border-emerald-500 bg-emerald-500 text-white'
                          : 'border-border bg-card text-foreground hover:border-emerald-500 hover:bg-emerald-500/10'
                      )}
                    >
                      ₦{value >= 1000 ? `${value / 1000}k` : value}
                    </button>
                  ))}
                </div>
              </div>

              {/* Continue Button */}
              <Button
                className="w-full bg-emerald-500 hover:bg-emerald-600"
                onClick={handleCreateAccount}
                disabled={!isValidAmount || isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  <>
                    <Banknote className="mr-2 h-4 w-4" />
                    Generate Deposit Account
                  </>
                )}
              </Button>

              {/* Recent Deposits */}
              {recentDeposits.length > 0 && (
                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-sm font-medium text-foreground">Recent Deposits</h3>
                    <button className="flex items-center gap-1 text-xs text-kaviBlue hover:underline">
                      <History className="h-3 w-3" />
                      View All
                    </button>
                  </div>
                  <div className="space-y-2">
                    {recentDeposits.map((deposit) => (
                      <div
                        key={deposit.ID}
                        className="flex items-center justify-between rounded-lg border border-border bg-card p-3"
                      >
                        <div>
                          <p className="font-medium text-foreground">
                            ₦{formatNaira(deposit.amountNgn)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(deposit.CreatedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <span
                          className={cn(
                            'rounded-full px-2 py-1 text-xs font-medium',
                            deposit.status === 'confirmed' &&
                              'bg-emerald-500/10 text-emerald-500',
                            deposit.status === 'pending' && 'bg-amber-500/10 text-amber-500',
                            deposit.status === 'failed' && 'bg-destructive/10 text-destructive'
                          )}
                        >
                          {deposit.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Step: Virtual Account Active */}
        {step === 'account' && virtualAccount && (
          <Card>
            <CardContent className="space-y-6 py-6">
              {/* Countdown Timer */}
              <CountdownTimer expiresAt={virtualAccount.expiresAt} onExpire={handleExpire} />

              {/* Amount to Transfer */}
              <div className="rounded-xl bg-emerald-500/10 px-4 py-4">
                <p className="mb-1 text-center text-sm font-medium text-emerald-600">
                  Transfer exactly this amount
                </p>
                <p className="text-center font-mono text-2xl font-bold text-emerald-500">
                  ₦{formatNaira(virtualAccount.amountNgn)}
                </p>
              </div>

              {/* Virtual Account Card */}
              <VirtualAccountCard account={virtualAccount} />

              {/* Warning */}
              <div className="flex items-start gap-2 rounded-xl bg-amber-500/10 p-4">
                <AlertCircle className="h-5 w-5 shrink-0 text-amber-500" />
                <p className="text-sm text-amber-600">
                  Transfer exactly ₦{formatNaira(virtualAccount.amountNgn)} to complete this deposit. Different amount may not be credited automatically.
                </p>
              </div>

              {/* Info Banner */}
              <div className="rounded-xl bg-accent/50 p-4">
                <p className="text-sm text-muted-foreground">
                  Once we receive your transfer, your Naira wallet will be credited automatically.
                </p>
              </div>

              {/* Cancel Button */}
              <Button
                variant="outline"
                className="w-full text-destructive hover:text-destructive"
                onClick={handleCancelAccount}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Cancelling...
                  </>
                ) : (
                  'Cancel & Start New Deposit'
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step: Expired */}
        {step === 'expired' && (
          <Card>
            <CardContent className="py-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
                <AlertCircle className="h-8 w-8 text-destructive" />
              </div>
              <h3 className="mb-2 text-xl font-bold text-foreground">Account Expired</h3>
              <p className="mb-6 text-muted-foreground">
                The virtual account has expired. Please create a new one to continue.
              </p>
              <Button onClick={handleStartNew} className="bg-emerald-500 hover:bg-emerald-600">
                <RefreshCw className="mr-2 h-4 w-4" />
                Start New Deposit
              </Button>
            </CardContent>
          </Card>
        )}

      </div>
    </div>
  );
}

export default NairaDeposit;
