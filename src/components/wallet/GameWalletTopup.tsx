import { useState, useEffect } from 'react';
import { Copy, Check, Share2, AlertTriangle, Loader2, Wallet } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/Button';
import { useWallet } from '@/contexts/WalletContext';
import { cn } from '@/lib/utils';

interface GameWalletTopupProps {
  className?: string;
}

export function GameWalletTopup({ className }: GameWalletTopupProps) {
  const { gameWalletAddress, loadGameWalletAddress, isLoading, error } = useWallet();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!gameWalletAddress) {
      loadGameWalletAddress();
    }
  }, [gameWalletAddress, loadGameWalletAddress]);

  const handleCopy = async () => {
    if (!gameWalletAddress) return;
    try {
      await navigator.clipboard.writeText(gameWalletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleShare = async () => {
    if (!gameWalletAddress || !navigator.share) return;
    try {
      await navigator.share({
        title: 'ETH Deposit Address',
        text: 'Send ETH on Base Network to this address',
        url: gameWalletAddress,
      });
    } catch (err) {
      console.error('Failed to share:', err);
    }
  };

  if (isLoading) {
    return (
      <div className={cn('flex flex-col items-center justify-center py-12', className)}>
        <Loader2 className="h-8 w-8 animate-spin text-kaviBlue" />
        <p className="mt-4 text-sm text-muted-foreground">Loading wallet address...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn('rounded-xl bg-destructive/10 p-6 text-center', className)}>
        <AlertTriangle className="mx-auto h-8 w-8 text-destructive" />
        <p className="mt-2 text-sm text-destructive">{error}</p>
        <Button variant="outline" className="mt-4" onClick={() => loadGameWalletAddress()}>
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-kaviBlue/10">
          <Wallet className="h-8 w-8 text-kaviBlue" />
        </div>
        <h2 className="text-xl font-bold text-foreground">Deposit ETH</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Send ETH on Base Network to fund your wallet
        </p>
      </div>

      {/* QR Code */}
      {gameWalletAddress && (
        <div className="flex justify-center">
          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <QRCodeSVG
              value={gameWalletAddress}
              size={200}
              level="H"
              includeMargin={false}
            />
          </div>
        </div>
      )}

      {/* Wallet Address */}
      {gameWalletAddress && (
        <div>
          <label className="mb-2 block text-sm font-medium text-foreground">
            Your Deposit Address
          </label>
          <div className="flex items-center gap-2">
            <div className="flex-1 overflow-hidden rounded-xl border border-border bg-card p-3">
              <p className="truncate font-mono text-sm text-foreground">{gameWalletAddress}</p>
            </div>
            <Button variant="outline" size="sm" onClick={handleCopy} className="shrink-0">
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
            {'share' in navigator && (
              <Button variant="outline" size="sm" onClick={handleShare} className="shrink-0">
                <Share2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Network Warning */}
      <div className="rounded-xl bg-amber-500/10 p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 shrink-0 text-amber-500" />
          <div>
            <p className="font-medium text-amber-600">Important: Base Network Only</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Only send ETH on the <strong>Base Network</strong> (Chain ID: 8453). Sending assets
              on other networks may result in permanent loss of funds.
            </p>
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="rounded-xl bg-accent/50 p-4">
        <h3 className="mb-2 font-medium text-foreground">How it works:</h3>
        <ol className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-kaviBlue/10 text-xs font-semibold text-kaviBlue">
              1
            </span>
            Copy your deposit address above
          </li>
          <li className="flex items-start gap-2">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-kaviBlue/10 text-xs font-semibold text-kaviBlue">
              2
            </span>
            Send ETH from your wallet using Base Network
          </li>
          <li className="flex items-start gap-2">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-kaviBlue/10 text-xs font-semibold text-kaviBlue">
              3
            </span>
            Funds will be credited after blockchain confirmation
          </li>
        </ol>
      </div>
    </div>
  );
}

export default GameWalletTopup;
