import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Provider {
  id: string;
  name: string;
  shortName?: string;
}

interface ProviderSelectorProps<T extends Provider> {
  providers: T[];
  selectedProvider: T | null;
  onSelect: (provider: T) => void;
  label?: string;
  className?: string;
}

export function ProviderSelector<T extends Provider>({
  providers,
  selectedProvider,
  onSelect,
  label,
  className,
}: ProviderSelectorProps<T>) {
  return (
    <div className={cn('space-y-3', className)}>
      {label && (
        <label className="block text-sm font-medium text-foreground">
          {label}
        </label>
      )}
      <div className="grid grid-cols-2 gap-3">
        {providers.map((provider) => {
          const isSelected = selectedProvider?.id === provider.id;
          return (
            <button
              key={provider.id}
              type="button"
              onClick={() => onSelect(provider)}
              className={cn(
                'flex items-center justify-between rounded-lg border p-3 text-left transition-all',
                isSelected
                  ? 'border-kaviBlue bg-kaviBlue/10 ring-1 ring-kaviBlue'
                  : 'border-border bg-card hover:border-kaviBlue/50 hover:bg-accent/50'
              )}
            >
              <div className="flex-1">
                <span className="block text-sm font-medium text-foreground">
                  {provider.shortName || provider.name}
                </span>
                {provider.shortName && (
                  <span className="block text-xs text-muted-foreground truncate">
                    {provider.name}
                  </span>
                )}
              </div>
              {isSelected && (
                <Check className="h-4 w-4 text-kaviBlue flex-shrink-0 ml-2" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default ProviderSelector;
