import { cn } from '@/lib/utils';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export function Toggle({ checked, onChange, disabled = false, className }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative h-6 w-11 rounded-full transition-colors',
        checked ? 'bg-kaviBlue' : 'bg-muted',
        disabled && 'cursor-not-allowed opacity-50',
        className
      )}
    >
      <span
        className={cn(
          'absolute top-1 h-4 w-4 rounded-full bg-white transition-transform',
          checked ? 'right-1' : 'left-1'
        )}
      />
    </button>
  );
}

export default Toggle;
