import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KYCProgressIndicatorProps {
  steps: { id: number; title: string }[];
  currentStep: number;
  completedSteps: number[];
  onStepClick?: (stepIndex: number) => void;
  className?: string;
}

export function KYCProgressIndicator({
  steps,
  currentStep,
  completedSteps,
  onStepClick,
  className,
}: KYCProgressIndicatorProps) {
  return (
    <div className={cn('flex items-center justify-between', className)}>
      {steps.map((step, index) => {
        const isCompleted = completedSteps.includes(index);
        const isActive = index === currentStep;
        const isClickable = onStepClick && (isCompleted || isActive);
        const isLast = index === steps.length - 1;

        return (
          <div key={step.id} className="flex flex-1 items-center">
            {/* Step Indicator */}
            <div className="flex flex-col items-center">
              <button
                type="button"
                onClick={() => isClickable && onStepClick?.(index)}
                disabled={!isClickable}
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-all',
                  isCompleted
                    ? 'bg-emerald-500 text-white'
                    : isActive
                      ? 'bg-kaviBlue text-white'
                      : 'bg-accent text-muted-foreground',
                  isClickable && 'cursor-pointer hover:scale-105',
                  !isClickable && 'cursor-default'
                )}
              >
                {isCompleted ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <span>{index + 1}</span>
                )}
              </button>

              {/* Step Title */}
              <span
                className={cn(
                  'mt-2 text-center text-xs',
                  isActive || isCompleted
                    ? 'font-medium text-foreground'
                    : 'text-muted-foreground'
                )}
              >
                {step.title}
              </span>
            </div>

            {/* Connector Line */}
            {!isLast && (
              <div
                className={cn(
                  'mx-2 h-0.5 flex-1',
                  completedSteps.includes(index + 1)
                    ? 'bg-emerald-500'
                    : 'bg-border'
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default KYCProgressIndicator;
