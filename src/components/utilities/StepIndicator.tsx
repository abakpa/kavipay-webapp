import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StepIndicatorProps {
  currentStep: number;
  steps: string[];
  className?: string;
}

export function StepIndicator({ currentStep, steps, className }: StepIndicatorProps) {
  const getStepStatus = (index: number) => {
    if (index < currentStep) return 'completed';
    if (index === currentStep) return 'active';
    return 'inactive';
  };

  return (
    <div className={cn('flex items-center justify-between px-4 py-4', className)}>
      {steps.map((step, index) => {
        const status = getStepStatus(index);
        const isCompleted = status === 'completed';
        const isActive = status === 'active';
        const isInactive = status === 'inactive';
        const isLast = index === steps.length - 1;

        return (
          <div key={index} className="flex flex-1 items-center">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-colors',
                  isActive && 'bg-kaviBlue text-white',
                  isCompleted && 'bg-emerald-500 text-white',
                  isInactive && 'border-2 border-border bg-muted text-muted-foreground'
                )}
              >
                {isCompleted ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>
              <span
                className={cn(
                  'mt-2 text-xs font-medium text-center max-w-[80px]',
                  isInactive ? 'text-muted-foreground' : 'text-foreground'
                )}
              >
                {step}
              </span>
            </div>

            {!isLast && (
              <div
                className={cn(
                  'mx-2 h-0.5 flex-1',
                  index < currentStep ? 'bg-emerald-500' : 'bg-border'
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default StepIndicator;
