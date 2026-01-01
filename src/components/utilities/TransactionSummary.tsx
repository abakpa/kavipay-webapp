import { cn } from '@/lib/utils';

interface SummaryItem {
  label: string;
  value: string;
  highlight?: boolean;
}

interface TransactionSummaryProps {
  items: SummaryItem[];
  title?: string;
  className?: string;
}

export function TransactionSummary({
  items,
  title = 'Transaction Summary',
  className,
}: TransactionSummaryProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-border bg-card p-4',
        className
      )}
    >
      {title && (
        <h3 className="text-sm font-semibold text-foreground mb-4">{title}</h3>
      )}

      <div className="space-y-3">
        {items.map((item, index) => (
          <div
            key={index}
            className={cn(
              'flex items-center justify-between',
              item.highlight && 'pt-3 border-t border-border'
            )}
          >
            <span className="text-sm text-muted-foreground">{item.label}</span>
            <span
              className={cn(
                'text-sm font-medium',
                item.highlight ? 'text-lg font-bold text-foreground' : 'text-foreground'
              )}
            >
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TransactionSummary;
