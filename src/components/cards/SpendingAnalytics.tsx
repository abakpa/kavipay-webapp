import { useState, useMemo } from 'react';
import {
  BarChart3,
  Calendar,
  DollarSign,
  TrendingUp,
  ArrowUp,
  ArrowDown,
  Minus,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CardTransaction } from '@/types/card';
import { CardTransactionType } from '@/types/card';

interface SpendingAnalyticsProps {
  transactions: CardTransaction[];
  className?: string;
}

export function SpendingAnalytics({ transactions, className }: SpendingAnalyticsProps) {
  const [selectedMonthIndex, setSelectedMonthIndex] = useState<number | null>(null);

  // Generate monthly spending data from transactions
  const { labels, data } = useMemo(() => {
    if (!transactions.length) {
      return { labels: [] as string[], data: [] as number[] };
    }

    // Filter for spending transactions (purchases, fees, settlements)
    const spendTypes: string[] = [
      CardTransactionType.PURCHASE,
      CardTransactionType.FEE,
      CardTransactionType.WITHDRAWAL,
    ];

    const spendingTransactions = transactions.filter(
      (tx) => tx.type && spendTypes.includes(tx.type) && tx.amount < 0
    );

    const now = new Date();
    const monthlyDataMap: Record<string, number> = {};
    const monthNames: string[] = [];

    const buildMonthKey = (date: Date): string => {
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      return `${year}-${String(month).padStart(2, '0')}`;
    };

    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = buildMonthKey(d);
      monthlyDataMap[key] = 0;
      monthNames.push(d.toLocaleDateString('en-US', { month: 'short' }));
    }

    // Aggregate spending
    spendingTransactions.forEach((transaction) => {
      const transactionDate = new Date(transaction.date);
      const monthKey = buildMonthKey(transactionDate);

      if (Object.prototype.hasOwnProperty.call(monthlyDataMap, monthKey)) {
        monthlyDataMap[monthKey] += Math.abs(transaction.amount);
      }
    });

    const labelsArr: string[] = [];
    const dataArr: number[] = [];

    Object.keys(monthlyDataMap)
      .sort()
      .forEach((_, index) => {
        labelsArr.push(monthNames[index]);
        dataArr.push(Object.values(monthlyDataMap).sort()[index] || 0);
      });

    // Fix: properly map data to labels
    const sortedKeys = Object.keys(monthlyDataMap).sort();
    const finalData = sortedKeys.map(key => monthlyDataMap[key]);

    return { labels: monthNames, data: finalData };
  }, [transactions]);

  // Calculate statistics
  const totalSpending = data.reduce((sum, amount) => sum + amount, 0);
  const averageSpending = data.length > 0 ? totalSpending / data.length : 0;
  const currentMonthSpending = data[data.length - 1] || 0;
  const previousMonthSpending = data[data.length - 2] || 0;

  // Calculate month-over-month change
  const monthOverMonthChange =
    previousMonthSpending === 0
      ? 0
      : ((currentMonthSpending - previousMonthSpending) / previousMonthSpending) * 100;

  const isIncreasing = monthOverMonthChange > 0;
  const isDecreasing = monthOverMonthChange < 0;

  // Find highest and lowest spending months
  const maxSpending = Math.max(...data);
  const minSpending = Math.min(...data.filter((v) => v > 0));
  const maxMonthIndex = data.indexOf(maxSpending);
  const minMonthIndex = data.indexOf(minSpending);

  // Calculate max value for chart scaling
  const chartMax = Math.max(...data, 1);

  const handleMonthPress = (index: number) => {
    setSelectedMonthIndex(selectedMonthIndex === index ? null : index);
  };

  // Generate insight text for selected month
  const getInsightText = (index: number) => {
    if (index === maxMonthIndex && maxSpending > 0) {
      return 'This was your highest spending month in the last 6 months.';
    }
    if (index === minMonthIndex && minSpending > 0) {
      return 'This was your lowest spending month in the last 6 months.';
    }
    if (data[index] > averageSpending) {
      const percentage = (((data[index] - averageSpending) / averageSpending) * 100).toFixed(0);
      return `This is ${percentage}% above your average spending.`;
    }
    if (data[index] < averageSpending && data[index] > 0) {
      const percentage = (((averageSpending - data[index]) / averageSpending) * 100).toFixed(0);
      return `This is ${percentage}% below your average spending.`;
    }
    return 'No spending recorded for this month.';
  };

  // Empty state
  if (!transactions.length) {
    return (
      <div className={cn('rounded-xl border border-border bg-card p-6', className)}>
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-kaviBlue" />
            <h3 className="text-lg font-bold text-foreground">Spending Analytics</h3>
          </div>
          <span className="rounded-full border border-kaviBlue/30 bg-kaviBlue/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-kaviBlue">
            6 Months
          </span>
        </div>

        {/* Empty State */}
        <div className="flex flex-col items-center py-12">
          <TrendingUp className="mb-4 h-12 w-12 text-muted-foreground/50" />
          <p className="text-base font-medium text-muted-foreground">
            No transaction data available
          </p>
          <p className="mt-2 text-sm text-muted-foreground/70">
            Start using your card to see analytics here
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('rounded-xl border border-border bg-card p-6', className)}>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-kaviBlue" />
          <h3 className="text-lg font-bold text-foreground">Spending Analytics</h3>
        </div>
        <span className="rounded-full border border-kaviBlue/30 bg-kaviBlue/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-kaviBlue">
          6 Months
        </span>
      </div>

      {/* Statistics Cards */}
      <div className="mb-6 space-y-3">
        {/* Primary Stat - This Month */}
        <div className="rounded-lg border border-border bg-accent/30 p-4">
          <div className="mb-2 flex items-center gap-2">
            <Calendar className="h-4 w-4 text-kaviBlue" />
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              This Month
            </span>
          </div>
          <p className="text-[28px] font-extrabold tracking-tight text-kaviBlue">
            ${currentMonthSpending.toFixed(2)}
          </p>
          {previousMonthSpending > 0 && (
            <div className="mt-2 flex items-center gap-1">
              {isIncreasing && <ArrowUp className="h-3.5 w-3.5 text-red-500" />}
              {isDecreasing && <ArrowDown className="h-3.5 w-3.5 text-emerald-500" />}
              {!isIncreasing && !isDecreasing && (
                <Minus className="h-3.5 w-3.5 text-muted-foreground" />
              )}
              <span
                className={cn(
                  'text-xs font-semibold',
                  isIncreasing
                    ? 'text-red-500'
                    : isDecreasing
                      ? 'text-emerald-500'
                      : 'text-muted-foreground'
                )}
              >
                {Math.abs(monthOverMonthChange).toFixed(1)}% vs last month
              </span>
            </div>
          )}
        </div>

        {/* Secondary Stats Row */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-border bg-accent/30 p-4">
            <div className="mb-2 flex items-center gap-2">
              <DollarSign className="h-3.5 w-3.5 text-kaviBlue" />
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Total
              </span>
            </div>
            <p className="text-2xl font-extrabold tracking-tight text-foreground">
              ${totalSpending.toFixed(0)}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-accent/30 p-4">
            <div className="mb-2 flex items-center gap-2">
              <TrendingUp className="h-3.5 w-3.5 text-kaviBlue" />
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Average
              </span>
            </div>
            <p className="text-2xl font-extrabold tracking-tight text-foreground">
              ${averageSpending.toFixed(0)}
            </p>
          </div>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="mb-5 overflow-hidden rounded-lg">
        <div className="flex h-[180px] items-end justify-between gap-2 rounded-lg bg-gradient-to-b from-kaviBlue/10 to-kaviBlue/5 p-4">
          {data.map((value, index) => {
            const heightPercent = chartMax > 0 ? (value / chartMax) * 100 : 0;
            const isSelected = selectedMonthIndex === index;

            return (
              <div key={index} className="flex flex-1 flex-col items-center gap-2">
                {/* Bar */}
                <div className="relative flex h-[120px] w-full items-end justify-center">
                  <div
                    className={cn(
                      'w-full max-w-[40px] rounded-t-md transition-all duration-300',
                      isSelected ? 'bg-kaviBlue' : 'bg-kaviBlue/70 hover:bg-kaviBlue/90'
                    )}
                    style={{ height: `${Math.max(heightPercent, 2)}%` }}
                    onClick={() => handleMonthPress(index)}
                  />
                </div>
                {/* Label */}
                <span
                  className={cn(
                    'text-xs font-semibold',
                    isSelected ? 'text-kaviBlue' : 'text-muted-foreground'
                  )}
                >
                  {labels[index]}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive Month Selector */}
      <div className="mb-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Tap to view details
        </p>
        <div className="flex flex-wrap gap-2">
          {labels.map((label, index) => (
            <button
              key={index}
              onClick={() => handleMonthPress(index)}
              className={cn(
                'min-w-[80px] rounded-lg border px-4 py-2 text-center transition-all',
                selectedMonthIndex === index
                  ? 'border-kaviBlue bg-kaviBlue text-white'
                  : 'border-border bg-accent/30 text-foreground hover:border-kaviBlue/50'
              )}
            >
              <span className="block text-sm font-semibold">{label}</span>
              <span
                className={cn(
                  'mt-0.5 block text-xs',
                  selectedMonthIndex === index ? 'text-white/80' : 'text-muted-foreground'
                )}
              >
                ${data[index].toFixed(0)}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Selected Month Detail */}
      {selectedMonthIndex !== null && (
        <div className="rounded-lg border border-border bg-accent/30 p-4">
          <div className="mb-4 flex items-center justify-between">
            <span className="font-bold text-foreground">
              {labels[selectedMonthIndex]} Spending
            </span>
            <span className="text-2xl font-extrabold text-kaviBlue">
              ${data[selectedMonthIndex].toFixed(2)}
            </span>
          </div>
          <div className="rounded-md bg-muted/50 p-3 dark:bg-background/50">
            <p className="text-sm leading-relaxed text-foreground">
              {getInsightText(selectedMonthIndex)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default SpendingAnalytics;
