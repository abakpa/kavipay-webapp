import { useState } from 'react';
import { Copy, Check, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { NairaVirtualAccount } from '@/types/deposit';
import { cn } from '@/lib/utils';

interface VirtualAccountCardProps {
  account: NairaVirtualAccount;
  className?: string;
}

export function VirtualAccountCard({ account, className }: VirtualAccountCardProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div
      className={cn(
        'overflow-hidden rounded-xl border border-border bg-card',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-3 p-4 pb-0">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20">
          <CheckCircle className="h-6 w-6 text-emerald-500" />
        </div>
        <div>
          <p className="font-semibold text-foreground">Deposit Account</p>
          <p className="text-sm text-muted-foreground">Transfer to this account</p>
        </div>
      </div>

      {/* Account Details */}
      <div className="space-y-4 p-4">
        {/* Bank Name */}
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">
            Bank Name
          </label>
          <div className="rounded-lg border border-border bg-background p-3">
            <p className="font-medium text-foreground">{account.bankName}</p>
          </div>
        </div>

        {/* Account Name */}
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">
            Account Name
          </label>
          <div className="flex items-center gap-2">
            <div className="flex-1 rounded-lg border border-border bg-background p-3">
              <p className="font-medium text-foreground">{account.accountName}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleCopy(account.accountName, 'accountName')}
              className="shrink-0"
            >
              {copiedField === 'accountName' ? (
                <Check className="h-4 w-4 text-emerald-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Account Number */}
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">
            Account Number
          </label>
          <div className="flex items-center gap-2">
            <div className="flex-1 rounded-lg border border-border bg-background p-3">
              <p className="font-mono text-lg font-bold tracking-wider text-foreground">
                {account.accountNumber}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleCopy(account.accountNumber, 'accountNumber')}
              className="shrink-0"
            >
              {copiedField === 'accountNumber' ? (
                <Check className="h-4 w-4 text-emerald-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VirtualAccountCard;
