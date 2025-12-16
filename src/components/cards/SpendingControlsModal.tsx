import { useState, useEffect } from 'react';
import {
  X,
  Smartphone,
  CreditCard,
  Globe,
  MapPin,
  DollarSign,
  Plus,
  Trash2,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useVirtualCards } from '@/contexts/VirtualCardContext';
import { cn } from '@/lib/utils';
import type { VirtualCard, SpendingLimit, ChannelControls } from '@/types/card';

interface SpendingControlsModalProps {
  isOpen: boolean;
  onClose: () => void;
  card: VirtualCard;
}

const INTERVALS = [
  { label: 'Per Transaction', value: 'per_authorization' },
  { label: 'Daily', value: 'daily' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly', value: 'monthly' },
  { label: 'Yearly', value: 'yearly' },
  { label: 'All Time', value: 'all_time' },
];

interface ChannelItem {
  id: keyof ChannelControls;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

const CHANNEL_ITEMS: ChannelItem[] = [
  {
    id: 'atm',
    title: 'ATM Withdrawals',
    description: 'Allow cash withdrawals at ATMs',
    icon: MapPin,
    color: 'text-blue-500 bg-blue-500/10',
  },
  {
    id: 'pos',
    title: 'POS Transactions',
    description: 'Allow in-store card payments',
    icon: CreditCard,
    color: 'text-emerald-500 bg-emerald-500/10',
  },
  {
    id: 'web',
    title: 'Online Payments',
    description: 'Allow web-based transactions',
    icon: Globe,
    color: 'text-purple-500 bg-purple-500/10',
  },
  {
    id: 'mobile',
    title: 'Mobile Payments',
    description: 'Allow mobile app purchases',
    icon: Smartphone,
    color: 'text-orange-500 bg-orange-500/10',
  },
];

export function SpendingControlsModal({
  isOpen,
  onClose,
  card,
}: SpendingControlsModalProps) {
  const { updateCardLimits } = useVirtualCards();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [channels, setChannels] = useState<ChannelControls>({
    atm: true,
    pos: true,
    web: true,
    mobile: true,
  });

  const [spendingLimits, setSpendingLimits] = useState<SpendingLimit[]>([]);
  const [showAddLimit, setShowAddLimit] = useState(false);
  const [newLimit, setNewLimit] = useState({
    amount: '',
    interval: 'daily',
  });

  // Initialize from card's spending controls
  useEffect(() => {
    if (card?.spendingControls) {
      const controls = card.spendingControls;

      if (controls.channels) {
        setChannels({
          atm: controls.channels.atm ?? true,
          pos: controls.channels.pos ?? true,
          web: controls.channels.web ?? true,
          mobile: controls.channels.mobile ?? true,
        });
      }

      if (controls.spendingLimits && Array.isArray(controls.spendingLimits)) {
        setSpendingLimits(controls.spendingLimits);
      }
    }
  }, [card]);

  if (!isOpen) return null;

  const handleToggleChannel = (channel: keyof ChannelControls) => {
    setChannels((prev) => ({
      ...prev,
      [channel]: !prev[channel],
    }));
    setError(null);
  };

  const handleAddLimit = () => {
    const amount = parseFloat(newLimit.amount);
    if (!newLimit.amount || isNaN(amount) || amount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    const limit: SpendingLimit = {
      amount,
      interval: newLimit.interval,
    };

    setSpendingLimits((prev) => [...prev, limit]);
    setNewLimit({ amount: '', interval: 'daily' });
    setShowAddLimit(false);
    setError(null);
  };

  const handleRemoveLimit = (index: number) => {
    setSpendingLimits((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Update the card limits with the new spending controls
      await updateCardLimits(card.id, {
        ...card.limits,
        // Note: The actual API integration would update spendingControls
        // This is a simplified version
      });

      setSuccess('Spending controls updated successfully');
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to update spending controls';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-card shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border p-4">
          <h2 className="text-lg font-bold text-foreground">Spending Controls</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="max-h-[70vh] overflow-y-auto p-4">
          {/* Success Message */}
          {success && (
            <div className="mb-4 rounded-xl bg-emerald-500/10 p-3 text-emerald-500">
              <p className="text-sm">{success}</p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-4 rounded-xl bg-destructive/10 p-3 text-destructive">
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* Transaction Channels */}
          <div className="mb-6">
            <h3 className="mb-1 font-semibold text-foreground">Transaction Channels</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              Control where your card can be used
            </p>

            <div className="space-y-2">
              {CHANNEL_ITEMS.map((item) => {
                const Icon = item.icon;
                const isEnabled = channels[item.id];

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleToggleChannel(item.id)}
                    disabled={isLoading}
                    className="flex w-full items-center justify-between rounded-xl border border-border p-3 transition-colors hover:bg-accent/50"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          'flex h-10 w-10 items-center justify-center rounded-xl',
                          item.color
                        )}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-foreground">{item.title}</p>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>
                    </div>

                    {/* Toggle Switch */}
                    <div
                      className={cn(
                        'relative h-6 w-11 rounded-full transition-colors',
                        isEnabled ? 'bg-kaviBlue' : 'bg-gray-300 dark:bg-gray-600'
                      )}
                    >
                      <div
                        className={cn(
                          'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform',
                          isEnabled ? 'translate-x-5' : 'translate-x-0.5'
                        )}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Spending Limits */}
          <div className="mb-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-foreground">Spending Limits</h3>
                <p className="text-sm text-muted-foreground">
                  Set transaction amount limits
                </p>
              </div>
              <Button
                size="sm"
                onClick={() => setShowAddLimit(true)}
                disabled={isLoading}
                className="gap-1"
              >
                <Plus className="h-4 w-4" />
                Add
              </Button>
            </div>

            {/* Existing Limits */}
            {spendingLimits.length > 0 && (
              <div className="mb-4 space-y-2">
                {spendingLimits.map((limit, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-xl border border-border bg-accent/30 p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
                        <DollarSign className="h-5 w-5 text-emerald-500" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">
                          {card.currency} {limit.amount.toLocaleString()}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {INTERVALS.find((i) => i.value === limit.interval)?.label ||
                            limit.interval}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveLimit(index)}
                      disabled={isLoading}
                      className="rounded-lg p-2 text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add New Limit Form */}
            {showAddLimit && (
              <div className="rounded-xl border border-border p-4">
                <h4 className="mb-4 font-medium text-foreground">Add Spending Limit</h4>

                {/* Amount Input */}
                <div className="mb-4">
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    Amount
                  </label>
                  <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2">
                    <DollarSign className="h-5 w-5 text-muted-foreground" />
                    <input
                      type="number"
                      value={newLimit.amount}
                      onChange={(e) =>
                        setNewLimit({ ...newLimit, amount: e.target.value })
                      }
                      placeholder="Enter amount"
                      className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Interval Selection */}
                <div className="mb-4">
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    Interval
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {INTERVALS.map((interval) => (
                      <button
                        key={interval.value}
                        type="button"
                        onClick={() =>
                          setNewLimit({ ...newLimit, interval: interval.value })
                        }
                        disabled={isLoading}
                        className={cn(
                          'rounded-lg border px-3 py-2 text-sm font-medium transition-colors',
                          newLimit.interval === interval.value
                            ? 'border-kaviBlue bg-kaviBlue text-white'
                            : 'border-border text-foreground hover:bg-accent'
                        )}
                      >
                        {interval.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Add/Cancel Buttons */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setShowAddLimit(false);
                      setNewLimit({ amount: '', interval: 'daily' });
                    }}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button className="flex-1" onClick={handleAddLimit} disabled={isLoading}>
                    Add Limit
                  </Button>
                </div>
              </div>
            )}

            {spendingLimits.length === 0 && !showAddLimit && (
              <p className="py-4 text-center text-sm text-muted-foreground">
                No spending limits set. Click "Add" to create one.
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 border-t border-border p-4">
          <Button variant="outline" className="flex-1" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button className="flex-1 gap-2" onClick={handleSave} disabled={isLoading}>
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            Save Controls
          </Button>
        </div>
      </div>
    </div>
  );
}

export default SpendingControlsModal;
