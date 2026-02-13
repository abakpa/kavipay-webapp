import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  CheckCircle,
  Search,
  Building2,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import {
  getNigerianBanks,
  validateBankAccount,
  initiateNairaPayout,
} from '@/lib/api/deposit';
import type {
  NigerianBank,
  NameEnquiryResult,
  NairaPayout,
} from '@/types/deposit';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

type WithdrawalStep = 'bank_details' | 'amount' | 'confirm' | 'result';

// Minimum withdrawal amount
const MIN_WITHDRAWAL_NGN = 100;

// Quick amount options
const QUICK_AMOUNTS = [5000, 10000, 25000, 50000];

export function NairaWithdrawal() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Step tracking
  const [step, setStep] = useState<WithdrawalStep>('bank_details');

  // Bank selection
  const [banks, setBanks] = useState<NigerianBank[]>([]);
  const [filteredBanks, setFilteredBanks] = useState<NigerianBank[]>([]);
  const [selectedBank, setSelectedBank] = useState<NigerianBank | null>(null);
  const [bankSearch, setBankSearch] = useState('');
  const [showBankList, setShowBankList] = useState(false);
  const [accountNumber, setAccountNumber] = useState('');

  // Name enquiry
  const [nameEnquiry, setNameEnquiry] = useState<NameEnquiryResult | null>(null);
  const [validating, setValidating] = useState(false);

  // Amount
  const [amount, setAmount] = useState('');

  // Submission
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<NairaPayout | null>(null);

  // Loading
  const [loadingBanks, setLoadingBanks] = useState(true);


  // Error
  const [error, setError] = useState<string | null>(null);

  const nairaBalance = user?.nairaBalance || 0;

  // Fetch banks on mount
  useEffect(() => {
    const fetchBanks = async () => {
      try {
        const data = await getNigerianBanks();
        setBanks(data);
        setFilteredBanks(data);
      } catch (err: unknown) {
        console.error('Failed to load banks:', err);
        let message = 'Failed to load banks';
        if (err && typeof err === 'object' && 'response' in err) {
          const axiosError = err as { response?: { data?: { error?: string; message?: string } } };
          message = axiosError.response?.data?.error || axiosError.response?.data?.message || message;
        }
        setError(message);
      } finally {
        setLoadingBanks(false);
      }
    };
    fetchBanks();
  }, []);

  // Filter banks based on search
  useEffect(() => {
    const filtered = banks.filter((b) =>
      b.name.toLowerCase().includes(bankSearch.toLowerCase())
    );
    setFilteredBanks(filtered);
  }, [bankSearch, banks]);

  // Auto name enquiry when account number is 10 digits
  useEffect(() => {
    if (accountNumber.length === 10 && selectedBank) {
      handleNameEnquiry();
    } else {
      setNameEnquiry(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountNumber, selectedBank]);

  const handleNameEnquiry = async () => {
    if (!selectedBank) return;
    setValidating(true);
    setNameEnquiry(null);
    setError(null);
    try {
      const enquiryResult = await validateBankAccount(
        selectedBank.nipCode || selectedBank.code,
        accountNumber
      );
      setNameEnquiry(enquiryResult);
    } catch (err: unknown) {
      let message = 'Could not validate account';
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { data?: { error?: string; message?: string } } };
        message = axiosError.response?.data?.error || axiosError.response?.data?.message || message;
      }
      setError(message);
    } finally {
      setValidating(false);
    }
  };

  const handleBankSelect = (bank: NigerianBank) => {
    setSelectedBank(bank);
    setShowBankList(false);
    setBankSearch('');
    setAccountNumber('');
    setNameEnquiry(null);
  };

  const handleAmountChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '');
    if (cleaned) {
      const number = parseInt(cleaned, 10);
      setAmount(number.toLocaleString('en-NG'));
    } else {
      setAmount('');
    }
  };

  const handleQuickAmount = (value: number) => {
    setAmount(value.toLocaleString('en-NG'));
  };

  const handleSubmit = async () => {
    if (!selectedBank || !nameEnquiry) return;
    setSubmitting(true);
    setError(null);
    try {
      const numAmount = parseFloat(amount.replace(/,/g, ''));
      const payout = await initiateNairaPayout({
        bankCode: selectedBank.nipCode || selectedBank.code,
        bankName: selectedBank.name,
        accountNumber,
        accountName: nameEnquiry.accountName,
        nameEnquiryReference: nameEnquiry.nameEnquiryReference,
        amount: numAmount,
      });
      setResult(payout);
      setStep('result');
    } catch (err: unknown) {
      let message = 'Failed to process withdrawal';
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { data?: { error?: string; message?: string } } };
        message = axiosError.response?.data?.error || axiosError.response?.data?.message || message;
      } else if (err instanceof Error) {
        message = err.message;
      }
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setStep('bank_details');
    setSelectedBank(null);
    setAccountNumber('');
    setNameEnquiry(null);
    setAmount('');
    setResult(null);
    setBankSearch('');
    setShowBankList(false);
    setError(null);
  };

  const formatNaira = (value: number) => {
    return value.toLocaleString('en-NG');
  };

  // Loading state while fetching banks
  if (loadingBanks) {
    return (
      <div className="mx-auto max-w-2xl">
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-kaviBlue" />
              <p className="mt-2 text-muted-foreground">Loading banks...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Step 1: Bank Details
  const renderBankDetailsStep = () => {
    return (
      <Card>
        <CardContent className="space-y-6 py-6">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Select Bank Account</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Choose your bank and enter the account number
            </p>
          </div>

          {/* Bank Selection */}
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">Bank</label>
            {selectedBank ? (
              <div className="flex items-center justify-between rounded-xl border border-border bg-card p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent">
                    <Building2 className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <span className="font-medium text-foreground">{selectedBank.name}</span>
                </div>
                <button
                  onClick={() => {
                    setSelectedBank(null);
                    setShowBankList(true);
                    setAccountNumber('');
                    setNameEnquiry(null);
                  }}
                  className="rounded-full p-1 hover:bg-accent"
                >
                  <X className="h-5 w-5 text-muted-foreground" />
                </button>
              </div>
            ) : (
              <div className="rounded-xl border border-border bg-card">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    value={bankSearch}
                    onChange={(e) => setBankSearch(e.target.value)}
                    onFocus={() => setShowBankList(true)}
                    placeholder="Search banks..."
                    className="w-full rounded-xl border-0 bg-transparent py-3 pl-10 pr-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-0"
                  />
                </div>
                {showBankList && (
                  <div className="max-h-60 overflow-y-auto border-t border-border">
                    {filteredBanks.length === 0 ? (
                      <p className="py-4 text-center text-muted-foreground">No banks found</p>
                    ) : (
                      filteredBanks.map((bank) => (
                        <button
                          key={bank._id}
                          onClick={() => handleBankSelect(bank)}
                          className="flex w-full items-center gap-3 border-b border-border p-3 text-left last:border-b-0 hover:bg-accent/50"
                        >
                          <span className="text-foreground">{bank.name}</span>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Account Number */}
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">Account Number</label>
            <input
              type="text"
              inputMode="numeric"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
              placeholder="Enter 10-digit account number"
              disabled={!selectedBank}
              className={cn(
                'w-full rounded-xl border border-border bg-card py-4 px-4 text-lg font-medium text-foreground placeholder:text-muted-foreground focus:border-kaviBlue focus:outline-none focus:ring-2 focus:ring-kaviBlue/20',
                !selectedBank && 'opacity-50'
              )}
            />
            <p className="mt-1 text-xs text-muted-foreground">
              {accountNumber.length}/10 digits
            </p>
          </div>

          {/* Validation Status */}
          {validating && (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-kaviBlue" />
              <span className="text-sm text-muted-foreground">Validating account...</span>
            </div>
          )}

          {/* Validated Account Name */}
          {nameEnquiry && (
            <div className="flex items-center gap-3 rounded-xl border border-emerald-500 bg-emerald-500/10 p-4">
              <CheckCircle className="h-5 w-5 text-emerald-500" />
              <span className="font-medium text-foreground">{nameEnquiry.accountName}</span>
            </div>
          )}

          {/* Continue Button */}
          <Button
            className="w-full bg-emerald-500 hover:bg-emerald-600"
            onClick={() => setStep('amount')}
            disabled={!nameEnquiry}
          >
            Continue
          </Button>
        </CardContent>
      </Card>
    );
  };

  // Step 2: Amount
  const renderAmountStep = () => {
    const numAmount = amount ? parseFloat(amount.replace(/,/g, '')) : 0;
    const isValidAmount = numAmount >= MIN_WITHDRAWAL_NGN && numAmount <= nairaBalance;

    return (
      <Card>
        <CardContent className="space-y-6 py-6">
          {/* Balance Display */}
          <div className="rounded-xl bg-emerald-500/10 px-4 py-3">
            <p className="text-sm text-muted-foreground">Available Naira Balance</p>
            <p className="text-xl font-bold text-emerald-500">
              ₦{formatNaira(nairaBalance)}
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-foreground">Enter Amount</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              How much would you like to withdraw?
            </p>
          </div>

          {/* Amount Input */}
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">Amount (NGN)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-semibold text-muted-foreground">
                ₦
              </span>
              <input
                type="text"
                inputMode="numeric"
                value={amount}
                onChange={(e) => handleAmountChange(e.target.value)}
                placeholder="0"
                className={cn(
                  'w-full rounded-xl border bg-card py-4 pl-10 pr-4 text-2xl font-bold text-foreground placeholder:text-muted-foreground focus:border-kaviBlue focus:outline-none focus:ring-2 focus:ring-kaviBlue/20',
                  numAmount > nairaBalance ? 'border-destructive' : 'border-border'
                )}
              />
            </div>
            {numAmount > nairaBalance && (
              <p className="mt-1 text-xs text-destructive">Insufficient balance</p>
            )}
          </div>

          {/* Quick Amount Buttons */}
          <div>
            <label className="mb-2 block text-sm font-medium text-muted-foreground">
              Quick Select
            </label>
            <div className="grid grid-cols-4 gap-2">
              {QUICK_AMOUNTS.map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => handleQuickAmount(value)}
                  disabled={value > nairaBalance}
                  className={cn(
                    'rounded-lg border px-3 py-2 text-sm font-medium transition-colors',
                    parseFloat(amount.replace(/,/g, '') || '0') === value
                      ? 'border-emerald-500 bg-emerald-500 text-white'
                      : value > nairaBalance
                        ? 'border-border bg-card text-muted-foreground opacity-50'
                        : 'border-border bg-card text-foreground hover:border-emerald-500 hover:bg-emerald-500/10'
                  )}
                >
                  ₦{value >= 1000 ? `${value / 1000}k` : value}
                </button>
              ))}
            </div>
          </div>

          <p className="text-sm text-muted-foreground">
            Minimum withdrawal: ₦{MIN_WITHDRAWAL_NGN}
          </p>

          {/* Continue Button */}
          <Button
            className="w-full bg-emerald-500 hover:bg-emerald-600"
            onClick={() => setStep('confirm')}
            disabled={!isValidAmount}
          >
            Continue
          </Button>

          <Button
            variant="outline"
            className="w-full"
            onClick={() => setStep('bank_details')}
          >
            Back
          </Button>
        </CardContent>
      </Card>
    );
  };

  // Step 3: Confirm
  const renderConfirmStep = () => {
    const numAmount = amount ? parseFloat(amount.replace(/,/g, '')) : 0;

    return (
      <Card>
        <CardContent className="space-y-6 py-6">
          <div className="text-center">
            <h2 className="text-lg font-semibold text-foreground">Confirm Withdrawal</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Please verify all details before confirming
            </p>
          </div>

          {/* Details */}
          <div className="space-y-3 rounded-xl border border-border p-4">
            <div className="flex justify-between border-b border-border pb-3">
              <span className="text-sm text-muted-foreground">Bank</span>
              <span className="font-medium text-foreground">{selectedBank?.name}</span>
            </div>
            <div className="flex justify-between border-b border-border pb-3">
              <span className="text-sm text-muted-foreground">Account Number</span>
              <span className="font-mono font-medium text-foreground">{accountNumber}</span>
            </div>
            <div className="flex justify-between border-b border-border pb-3">
              <span className="text-sm text-muted-foreground">Account Name</span>
              <span className="font-medium text-foreground">{nameEnquiry?.accountName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Amount</span>
              <span className="text-lg font-bold text-foreground">
                ₦{formatNaira(numAmount)}
              </span>
            </div>
          </div>

          {/* Warning */}
          <div className="flex items-start gap-2 rounded-xl bg-amber-500/10 p-4">
            <AlertCircle className="h-5 w-5 shrink-0 text-amber-500" />
            <p className="text-sm text-amber-600">
              Please verify all details before confirming. Withdrawals are processed immediately and cannot be reversed.
            </p>
          </div>

          {/* Submit Button */}
          <Button
            className="w-full bg-emerald-500 hover:bg-emerald-600"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              'Confirm & Withdraw'
            )}
          </Button>

          <Button
            variant="outline"
            className="w-full"
            onClick={() => setStep('amount')}
            disabled={submitting}
          >
            Go Back
          </Button>
        </CardContent>
      </Card>
    );
  };

  // Step 4: Result
  const renderResultStep = () => {
    if (!result) return null;

    const numAmount = result.amountNgn ?? parseFloat(amount.replace(/,/g, '')) ?? 0;

    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10">
              <CheckCircle className="h-8 w-8 text-emerald-500" />
            </div>
            <h3 className="mb-2 text-xl font-bold text-foreground">Withdrawal Processing</h3>
            <p className="mb-6 text-muted-foreground">
              Your withdrawal of ₦{formatNaira(numAmount)} is being processed
            </p>
          </div>

          {/* Details */}
          <div className="mb-6 space-y-3 rounded-xl border border-border p-4">
            <div className="flex justify-between border-b border-border pb-3">
              <span className="text-sm text-muted-foreground">Reference</span>
              <span className="font-mono text-xs text-foreground">
                {result.paymentReference}
              </span>
            </div>
            <div className="flex justify-between border-b border-border pb-3">
              <span className="text-sm text-muted-foreground">Status</span>
              <span
                className={cn(
                  'rounded-full px-2 py-0.5 text-xs font-medium uppercase',
                  result.status === 'completed' && 'bg-emerald-500/10 text-emerald-500',
                  result.status === 'pending' && 'bg-amber-500/10 text-amber-500',
                  result.status === 'processing' && 'bg-blue-500/10 text-blue-500',
                  result.status === 'failed' && 'bg-destructive/10 text-destructive'
                )}
              >
                {result.status}
              </span>
            </div>
            <div className="flex justify-between border-b border-border pb-3">
              <span className="text-sm text-muted-foreground">Bank</span>
              <span className="font-medium text-foreground">{result.bankName}</span>
            </div>
            <div className="flex justify-between border-b border-border pb-3">
              <span className="text-sm text-muted-foreground">Account</span>
              <span className="font-medium text-foreground">{result.accountNumber}</span>
            </div>
            <div className="flex justify-between border-b border-border pb-3">
              <span className="text-sm text-muted-foreground">Account Name</span>
              <span className="font-medium text-foreground">{result.accountName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Amount</span>
              <span className="text-lg font-bold text-foreground">
                ₦{formatNaira(numAmount)}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <Button
              onClick={() => navigate('/dashboard')}
              className="w-full bg-emerald-500 hover:bg-emerald-600"
            >
              Back to Dashboard
            </Button>
            <Button
              variant="outline"
              onClick={handleReset}
              className="w-full"
            >
              Make Another Withdrawal
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="space-y-6">
        {/* Header */}
        {step !== 'result' && (
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                if (step === 'bank_details') {
                  navigate('/send');
                } else if (step === 'amount') {
                  setStep('bank_details');
                } else if (step === 'confirm') {
                  setStep('amount');
                }
              }}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-accent hover:bg-accent/80"
            >
              <ArrowLeft className="h-5 w-5 text-foreground" />
            </button>
            <h1 className="text-2xl font-bold text-foreground">Naira Withdrawal</h1>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="flex items-center gap-2 rounded-xl bg-destructive/10 p-4">
            <AlertCircle className="h-5 w-5 shrink-0 text-destructive" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {/* Render current step */}
        {step === 'bank_details' && renderBankDetailsStep()}
        {step === 'amount' && renderAmountStep()}
        {step === 'confirm' && renderConfirmStep()}
        {step === 'result' && renderResultStep()}
      </div>
    </div>
  );
}

export default NairaWithdrawal;
