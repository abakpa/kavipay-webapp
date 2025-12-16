import { useState } from 'react';
import { Search, Filter, X, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TransactionCategory, TransactionStatus, CardTransactionType } from '@/types/card';

interface TransactionFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: TransactionCategory | 'all';
  onCategoryChange: (category: TransactionCategory | 'all') => void;
  selectedStatus: TransactionStatus | 'all';
  onStatusChange: (status: TransactionStatus | 'all') => void;
  selectedType: CardTransactionType | 'all';
  onTypeChange: (type: CardTransactionType | 'all') => void;
  className?: string;
}

const categoryOptions: { value: TransactionCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'All Categories' },
  { value: TransactionCategory.GROCERY, label: 'Grocery' },
  { value: TransactionCategory.RESTAURANT, label: 'Restaurant' },
  { value: TransactionCategory.GAS, label: 'Gas' },
  { value: TransactionCategory.SHOPPING, label: 'Shopping' },
  { value: TransactionCategory.ENTERTAINMENT, label: 'Entertainment' },
  { value: TransactionCategory.TRAVEL, label: 'Travel' },
  { value: TransactionCategory.HEALTHCARE, label: 'Healthcare' },
  { value: TransactionCategory.UTILITIES, label: 'Utilities' },
  { value: TransactionCategory.OTHER, label: 'Other' },
];

const statusOptions: { value: TransactionStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All Statuses' },
  { value: TransactionStatus.SUCCESS, label: 'Success' },
  { value: TransactionStatus.COMPLETED, label: 'Completed' },
  { value: TransactionStatus.PENDING, label: 'Pending' },
  { value: TransactionStatus.FAILED, label: 'Failed' },
  { value: TransactionStatus.CANCELLED, label: 'Cancelled' },
];

const typeOptions: { value: CardTransactionType | 'all'; label: string }[] = [
  { value: 'all', label: 'All Types' },
  { value: CardTransactionType.PURCHASE, label: 'Purchase' },
  { value: CardTransactionType.REFUND, label: 'Refund' },
  { value: CardTransactionType.WITHDRAWAL, label: 'Withdrawal' },
  { value: CardTransactionType.FEE, label: 'Fee' },
];

interface FilterDropdownProps {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}

function FilterDropdown({ label, value, options, onChange }: FilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors',
          value !== 'all'
            ? 'border-kaviBlue bg-kaviBlue/10 text-kaviBlue'
            : 'border-border bg-card text-foreground hover:bg-accent'
        )}
      >
        <span className="max-w-[100px] truncate">
          {selectedOption?.label || label}
        </span>
        <ChevronDown className={cn('h-4 w-4 transition-transform', isOpen && 'rotate-180')} />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute left-0 top-full z-20 mt-1 min-w-[160px] rounded-lg border border-border bg-card py-1 shadow-lg">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={cn(
                  'w-full px-3 py-2 text-left text-sm transition-colors hover:bg-accent',
                  value === option.value && 'bg-kaviBlue/10 text-kaviBlue'
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export function TransactionFilters({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedStatus,
  onStatusChange,
  selectedType,
  onTypeChange,
  className,
}: TransactionFiltersProps) {
  const hasActiveFilters =
    selectedCategory !== 'all' || selectedStatus !== 'all' || selectedType !== 'all';

  const clearAllFilters = () => {
    onCategoryChange('all');
    onStatusChange('all');
    onTypeChange('all');
    onSearchChange('');
  };

  return (
    <div className={cn('space-y-3', className)}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search transactions..."
          className="w-full rounded-xl border border-border bg-card py-3 pl-10 pr-10 text-foreground placeholder:text-muted-foreground focus:border-kaviBlue focus:outline-none focus:ring-2 focus:ring-kaviBlue/20"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Filter Dropdowns */}
      <div className="flex flex-wrap items-center gap-2">
        <Filter className="h-4 w-4 text-muted-foreground" />

        <FilterDropdown
          label="Category"
          value={selectedCategory}
          options={categoryOptions as { value: string; label: string }[]}
          onChange={(v) => onCategoryChange(v as TransactionCategory | 'all')}
        />

        <FilterDropdown
          label="Status"
          value={selectedStatus}
          options={statusOptions as { value: string; label: string }[]}
          onChange={(v) => onStatusChange(v as TransactionStatus | 'all')}
        />

        <FilterDropdown
          label="Type"
          value={selectedType}
          options={typeOptions as { value: string; label: string }[]}
          onChange={(v) => onTypeChange(v as CardTransactionType | 'all')}
        />

        {(hasActiveFilters || searchQuery) && (
          <button
            type="button"
            onClick={clearAllFilters}
            className="flex items-center gap-1 rounded-lg px-2 py-1 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <X className="h-3 w-3" />
            Clear all
          </button>
        )}
      </div>
    </div>
  );
}

export default TransactionFilters;
