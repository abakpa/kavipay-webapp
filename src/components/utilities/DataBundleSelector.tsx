import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DataBundle, TvPackage } from '@/types/utilities';

interface DataBundleSelectorProps {
  bundles: (DataBundle | TvPackage)[];
  selectedBundle: DataBundle | TvPackage | null;
  onSelect: (bundle: DataBundle | TvPackage) => void;
  label?: string;
  isLoading?: boolean;
  className?: string;
}

export function DataBundleSelector({
  bundles,
  selectedBundle,
  onSelect,
  label = 'Select Plan',
  isLoading = false,
  className,
}: DataBundleSelectorProps) {
  if (isLoading) {
    return (
      <div className={cn('space-y-3', className)}>
        {label && (
          <label className="block text-sm font-medium text-foreground">
            {label}
          </label>
        )}
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-20 rounded-lg border border-border bg-muted animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (bundles.length === 0) {
    return (
      <div className={cn('space-y-3', className)}>
        {label && (
          <label className="block text-sm font-medium text-foreground">
            {label}
          </label>
        )}
        <div className="rounded-lg border border-border bg-muted/50 p-4 text-center">
          <p className="text-sm text-muted-foreground">No plans available</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-3', className)}>
      {label && (
        <label className="block text-sm font-medium text-foreground">
          {label}
        </label>
      )}
      <div className="grid grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-1">
        {bundles.map((bundle) => {
          const isSelected = selectedBundle?.variationCode === bundle.variationCode;
          return (
            <button
              key={bundle.variationCode}
              type="button"
              onClick={() => onSelect(bundle)}
              className={cn(
                'flex flex-col items-start rounded-lg border p-3 text-left transition-all',
                isSelected
                  ? 'border-kaviBlue bg-kaviBlue/10 ring-1 ring-kaviBlue'
                  : 'border-border bg-card hover:border-kaviBlue/50 hover:bg-accent/50'
              )}
            >
              <div className="flex w-full items-start justify-between">
                <span className="text-xs font-medium text-foreground line-clamp-2 flex-1 pr-2">
                  {bundle.name}
                </span>
                {isSelected && (
                  <Check className="h-4 w-4 text-kaviBlue flex-shrink-0" />
                )}
              </div>
              <span className="mt-1 text-sm font-bold text-kaviBlue">
                ₦{bundle.amount.toLocaleString()}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default DataBundleSelector;
