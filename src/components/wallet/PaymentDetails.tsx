import { useState } from 'react';
import { Copy, Check, Share2, Clock, AlertCircle, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import type { CryptoDeposit } from '@/types/wallet';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface PaymentDetailsProps {
  deposit: CryptoDeposit;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  className?: string;
}

export function PaymentDetails({
  deposit,
  onRefresh,
  isRefreshing,
  className,
}: PaymentDetailsProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(deposit.payAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Payment Address',
          text: `Send ${deposit.payAmount} ${deposit.payCurrency} to this address`,
          url: deposit.payAddress,
        });
      } catch (err) {
        console.error('Failed to share:', err);
      }
    }
  };

  const getStatusConfig = () => {
    switch (deposit.status) {
      case 'waiting':
        return {
          icon: <Clock className="h-5 w-5" />,
          label: 'Waiting for Payment',
          color: 'text-amber-500',
          bgColor: 'bg-amber-500/10',
        };
      case 'confirming':
        return {
          icon: <Loader2 className="h-5 w-5 animate-spin" />,
          label: 'Confirming',
          color: 'text-kaviBlue',
          bgColor: 'bg-kaviBlue/10',
        };
      case 'confirmed':
      case 'sending':
        return {
          icon: <Loader2 className="h-5 w-5 animate-spin" />,
          label: 'Processing',
          color: 'text-kaviBlue',
          bgColor: 'bg-kaviBlue/10',
        };
      case 'finished':
        return {
          icon: <CheckCircle className="h-5 w-5" />,
          label: 'Completed',
          color: 'text-emerald-500',
          bgColor: 'bg-emerald-500/10',
        };
      case 'failed':
      case 'expired':
        return {
          icon: <XCircle className="h-5 w-5" />,
          label: deposit.status === 'expired' ? 'Expired' : 'Failed',
          color: 'text-destructive',
          bgColor: 'bg-destructive/10',
        };
      default:
        return {
          icon: <AlertCircle className="h-5 w-5" />,
          label: deposit.status,
          color: 'text-muted-foreground',
          bgColor: 'bg-accent',
        };
    }
  };

  const statusConfig = getStatusConfig();
  const isTerminal = ['finished', 'failed', 'expired', 'refunded'].includes(deposit.status);

  return (
    <div className={cn('space-y-6', className)}>
      {/* Status Badge */}
      <div className="flex justify-center">
        <div
          className={cn(
            'inline-flex items-center gap-2 rounded-full px-4 py-2',
            statusConfig.bgColor,
            statusConfig.color
          )}
        >
          {statusConfig.icon}
          <span className="font-medium">{statusConfig.label}</span>
        </div>
      </div>

      {/* QR Code */}
      {!isTerminal && (
        <div className="flex justify-center">
          <div className="rounded-2xl bg-white p-4">
            <QRCodeSVG
              value={deposit.payAddress}
              size={200}
              level="H"
              includeMargin={false}
            />
          </div>
        </div>
      )}

      {/* Payment Info */}
      <div className="space-y-4">
        {/* Amount to Send */}
        <div className="rounded-xl bg-accent/50 p-4 text-center">
          <p className="text-sm text-muted-foreground">Send exactly:</p>
          <p className="mt-1 text-2xl font-bold text-foreground">
            {deposit.payAmount.toFixed(8)} {deposit.payCurrency}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            ≈ ${deposit.priceAmount.toFixed(2)} USD
          </p>
        </div>

        {/* Wallet Address */}
        {!isTerminal && (
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">
              {deposit.payCurrency} Address
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 overflow-hidden rounded-xl border border-border bg-card p-3">
                <p className="truncate font-mono text-sm text-foreground">{deposit.payAddress}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                className="shrink-0"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
              {'share' in navigator && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleShare}
                  className="shrink-0"
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Expiry Warning */}
        {deposit.expiresAt && !isTerminal && (
          <div className="flex items-center gap-2 rounded-xl bg-amber-500/10 p-3">
            <AlertCircle className="h-4 w-4 shrink-0 text-amber-500" />
            <p className="text-sm text-amber-600">
              This address expires in 24 hours. Send exact amount to avoid loss.
            </p>
          </div>
        )}

        {/* Refresh Button */}
        {onRefresh && !isTerminal && (
          <Button
            variant="outline"
            className="w-full"
            onClick={onRefresh}
            disabled={isRefreshing}
          >
            {isRefreshing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Checking...
              </>
            ) : (
              'Refresh Status'
            )}
          </Button>
        )}
      </div>
    </div>
  );
}

export default PaymentDetails;
