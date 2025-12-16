import { useMemo } from 'react';
import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PasswordStrengthIndicatorProps {
  password: string;
  className?: string;
  showRequirements?: boolean;
}

interface PasswordRequirement {
  label: string;
  test: (password: string) => boolean;
}

const PASSWORD_REQUIREMENTS: PasswordRequirement[] = [
  {
    label: 'At least 8 characters',
    test: (p) => p.length >= 8,
  },
  {
    label: 'Contains uppercase letter',
    test: (p) => /[A-Z]/.test(p),
  },
  {
    label: 'Contains lowercase letter',
    test: (p) => /[a-z]/.test(p),
  },
  {
    label: 'Contains a number',
    test: (p) => /\d/.test(p),
  },
  {
    label: 'Contains special character',
    test: (p) => /[!@#$%^&*(),.?":{}|<>_\-+=[\]\\;'/`~]/.test(p),
  },
];

type StrengthLevel = 'empty' | 'weak' | 'fair' | 'good' | 'strong';

interface StrengthConfig {
  label: string;
  color: string;
  bgColor: string;
  segments: number;
}

const STRENGTH_CONFIG: Record<StrengthLevel, StrengthConfig> = {
  empty: {
    label: '',
    color: 'text-muted-foreground',
    bgColor: 'bg-muted',
    segments: 0,
  },
  weak: {
    label: 'Weak',
    color: 'text-red-500',
    bgColor: 'bg-red-500',
    segments: 1,
  },
  fair: {
    label: 'Fair',
    color: 'text-orange-500',
    bgColor: 'bg-orange-500',
    segments: 2,
  },
  good: {
    label: 'Good',
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500',
    segments: 3,
  },
  strong: {
    label: 'Strong',
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500',
    segments: 4,
  },
};

function calculateStrength(password: string): StrengthLevel {
  if (!password) return 'empty';

  const passedRequirements = PASSWORD_REQUIREMENTS.filter((req) =>
    req.test(password)
  ).length;

  if (passedRequirements <= 1) return 'weak';
  if (passedRequirements === 2) return 'fair';
  if (passedRequirements === 3 || passedRequirements === 4) return 'good';
  return 'strong';
}

export function PasswordStrengthIndicator({
  password,
  className,
  showRequirements = true,
}: PasswordStrengthIndicatorProps) {
  const strength = useMemo(() => calculateStrength(password), [password]);
  const config = STRENGTH_CONFIG[strength];

  const requirementResults = useMemo(
    () =>
      PASSWORD_REQUIREMENTS.map((req) => ({
        ...req,
        passed: req.test(password),
      })),
    [password]
  );

  if (!password) return null;

  return (
    <div className={cn('space-y-3', className)}>
      {/* Strength Bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Password strength</span>
          <span className={cn('text-xs font-medium', config.color)}>
            {config.label}
          </span>
        </div>

        {/* Segmented Progress Bar */}
        <div className="flex gap-1">
          {[1, 2, 3, 4].map((segment) => (
            <div
              key={segment}
              className={cn(
                'h-1.5 flex-1 rounded-full transition-all duration-300',
                segment <= config.segments ? config.bgColor : 'bg-muted'
              )}
            />
          ))}
        </div>
      </div>

      {/* Requirements Checklist */}
      {showRequirements && (
        <div className="space-y-1.5">
          {requirementResults.map((req, index) => (
            <div
              key={index}
              className={cn(
                'flex items-center gap-2 text-xs transition-colors duration-200',
                req.passed ? 'text-emerald-500' : 'text-muted-foreground'
              )}
            >
              {req.passed ? (
                <Check className="h-3.5 w-3.5" />
              ) : (
                <X className="h-3.5 w-3.5" />
              )}
              <span>{req.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Compact version without requirements list
export function PasswordStrengthBar({
  password,
  className,
}: Omit<PasswordStrengthIndicatorProps, 'showRequirements'>) {
  const strength = useMemo(() => calculateStrength(password), [password]);
  const config = STRENGTH_CONFIG[strength];

  if (!password) return null;

  return (
    <div className={cn('space-y-1', className)}>
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((segment) => (
          <div
            key={segment}
            className={cn(
              'h-1 flex-1 rounded-full transition-all duration-300',
              segment <= config.segments ? config.bgColor : 'bg-muted'
            )}
          />
        ))}
      </div>
      <div className="flex justify-end">
        <span className={cn('text-[10px] font-medium', config.color)}>
          {config.label}
        </span>
      </div>
    </div>
  );
}
