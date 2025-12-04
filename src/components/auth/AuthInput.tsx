import { forwardRef, useState, type InputHTMLAttributes } from 'react';
import { Eye, EyeOff, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface AuthInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  icon?: LucideIcon;
}

export const AuthInput = forwardRef<HTMLInputElement, AuthInputProps>(
  ({ className, label, error, icon: Icon, type = 'text', ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const isPassword = type === 'password';

    return (
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-white">
          {label}
        </label>
        <div
          className={cn(
            'flex items-center gap-3 rounded-xl border-[1.5px] bg-white/5 px-4 transition-all duration-200 focus-within:outline-none focus-within:ring-0',
            error ? 'border-destructive' : 'border-white/10',
            isFocused && !error && 'border-white/10',
            className
          )}
        >
          {Icon && (
            <Icon
              className={cn(
                'h-5 w-5 flex-shrink-0 transition-colors duration-200',
                isFocused ? 'text-kaviBlue' : 'text-muted-foreground'
              )}
              strokeWidth={2}
            />
          )}
          <input
            ref={ref}
            type={isPassword && showPassword ? 'text' : type}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className="h-14 flex-1 border-0 bg-transparent text-[15px] text-white outline-none ring-0 ring-offset-0 placeholder:text-muted-foreground focus:border-0 focus:outline-none focus:ring-0 focus-visible:border-0 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className={cn(
                'rounded-lg p-1.5 transition-colors focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0',
                isFocused ? 'bg-kaviBlue/10' : 'bg-transparent'
              )}
            >
              {showPassword ? (
                <EyeOff
                  className={cn(
                    'h-5 w-5',
                    isFocused ? 'text-kaviBlue' : 'text-muted-foreground'
                  )}
                  strokeWidth={2}
                />
              ) : (
                <Eye
                  className={cn(
                    'h-5 w-5',
                    isFocused ? 'text-kaviBlue' : 'text-muted-foreground'
                  )}
                  strokeWidth={2}
                />
              )}
            </button>
          )}
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
    );
  }
);

AuthInput.displayName = 'AuthInput';
