import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Copy, ArrowLeft, Home } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface ResultState {
  success: boolean;
  type: 'airtime' | 'data' | 'electricity' | 'tv';
  message: string;
  details?: Record<string, string | undefined>;
}

export function UtilityResult() {
  const location = useLocation();
  const navigate = useNavigate();
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const state = location.state as ResultState | null;

  if (!state) {
    return (
      <div className="mx-auto max-w-md text-center py-12">
        <p className="text-muted-foreground">No transaction data found</p>
        <Button onClick={() => navigate('/utilities')} className="mt-4">
          Go to Utilities
        </Button>
      </div>
    );
  }

  const { success, type, message, details } = state;

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const getTypeTitle = () => {
    switch (type) {
      case 'airtime':
        return 'Airtime Purchase';
      case 'data':
        return 'Data Purchase';
      case 'electricity':
        return 'Electricity Payment';
      case 'tv':
        return 'TV Subscription';
      default:
        return 'Transaction';
    }
  };

  return (
    <div className="mx-auto max-w-md">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate('/utilities')}
          className="rounded-lg p-2 hover:bg-accent transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>
        <h1 className="text-xl font-bold text-foreground">{getTypeTitle()}</h1>
      </div>

      {/* Result Card */}
      <div className="rounded-xl border border-border bg-card p-6 text-center">
        {/* Status Icon */}
        <div
          className={cn(
            'mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full',
            success ? 'bg-emerald-500/10' : 'bg-destructive/10'
          )}
        >
          {success ? (
            <CheckCircle className="h-8 w-8 text-emerald-500" />
          ) : (
            <XCircle className="h-8 w-8 text-destructive" />
          )}
        </div>

        {/* Status Message */}
        <h2 className={cn('text-lg font-bold mb-2', success ? 'text-emerald-500' : 'text-destructive')}>
          {success ? 'Success!' : 'Failed'}
        </h2>
        <p className="text-muted-foreground mb-6">{message}</p>

        {/* Transaction Details */}
        {details && success && (
          <div className="mt-6 rounded-lg bg-muted/50 p-4 text-left">
            <h3 className="text-sm font-semibold text-foreground mb-3">Transaction Details</h3>
            <div className="space-y-3">
              {Object.entries(details).map(([key, value]) => {
                if (!value) return null;

                const displayKey = key
                  .replace(/([A-Z])/g, ' $1')
                  .replace(/^./, (str) => str.toUpperCase());

                // Special handling for token (electricity)
                const isToken = key === 'token';

                return (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{displayKey}</span>
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          'text-sm font-medium text-foreground',
                          isToken && 'font-mono bg-kaviBlue/10 px-2 py-1 rounded'
                        )}
                      >
                        {value}
                      </span>
                      {isToken && (
                        <button
                          onClick={() => copyToClipboard(value, key)}
                          className="rounded p-1 hover:bg-accent transition-colors"
                        >
                          <Copy className="h-4 w-4 text-muted-foreground" />
                        </button>
                      )}
                      {copiedField === key && (
                        <span className="text-xs text-emerald-500">Copied!</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="mt-8 space-y-3">
        <Button
          onClick={() => navigate(`/utilities/${type}`)}
          className="w-full"
        >
          {success ? 'Make Another Purchase' : 'Try Again'}
        </Button>
        <Button
          variant="outline"
          onClick={() => navigate('/')}
          className="w-full"
        >
          <Home className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
      </div>
    </div>
  );
}

export default UtilityResult;
