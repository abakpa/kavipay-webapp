import { CreditCard, TrendingDown, Plus, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CardsOverviewCardProps {
  totalCards: number;
  monthlySpending: number;
  currency?: string;
  onAddCard: () => void;
  onViewAllCards: () => void;
  className?: string;
}

export function CardsOverviewCard({
  totalCards,
  monthlySpending,
  currency = 'USD',
  onAddCard,
  onViewAllCards,
  className,
}: CardsOverviewCardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className={cn('rounded-xl border border-border bg-card p-4', className)}>
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-semibold text-foreground">Cards Overview</h3>
        <button
          onClick={onViewAllCards}
          className="flex items-center gap-1 text-sm text-kaviBlue hover:underline"
        >
          View All
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-3 gap-3">
        {/* Total Cards */}
        <div className="rounded-xl bg-accent/50 p-4">
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-kaviBlue/10">
            <CreditCard className="h-5 w-5 text-kaviBlue" />
          </div>
          <p className="text-2xl font-bold text-foreground">{totalCards}</p>
          <p className="text-xs text-muted-foreground">Active Cards</p>
        </div>

        {/* Monthly Spending */}
        <div className="rounded-xl bg-accent/50 p-4">
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/10">
            <TrendingDown className="h-5 w-5 text-amber-500" />
          </div>
          <p className="text-lg font-bold text-foreground">{formatCurrency(monthlySpending)}</p>
          <p className="text-xs text-muted-foreground">This Month</p>
        </div>

        {/* Add Card Button */}
        <button
          onClick={onAddCard}
          className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border p-4 transition-colors hover:border-kaviBlue hover:bg-kaviBlue/5"
        >
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-accent">
            <Plus className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="text-xs font-medium text-muted-foreground">Add Card</p>
        </button>
      </div>
    </div>
  );
}

export default CardsOverviewCard;
