import { cn } from '@/lib/utils';
import { CARD_CREATION_STEPS, type CardCreationStep } from './constants';

interface CardCreationProgressBarProps {
  currentStep: CardCreationStep;
}

export function CardCreationProgressBar({
  currentStep,
}: CardCreationProgressBarProps) {
  const getStepStatus = (
    stepId: string
  ): 'completed' | 'current' | 'upcoming' => {
    const stepOrder = ['configure', 'review', 'success'];
    const currentIndex = stepOrder.indexOf(currentStep);
    const stepIndex = stepOrder.indexOf(stepId);

    if (stepIndex < currentIndex) {
      return 'completed';
    } else if (stepIndex === currentIndex) {
      return 'current';
    } else {
      return 'upcoming';
    }
  };

  const steps = CARD_CREATION_STEPS.map((step) => ({
    ...step,
    status: getStepStatus(step.id),
  }));

  return (
    <div className="py-4">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.id} className="relative flex flex-1 flex-col items-center">
            {/* Connector line */}
            {index > 0 && (
              <div
                className={cn(
                  'absolute left-0 right-1/2 top-4 h-0.5 -translate-y-1/2',
                  step.status === 'completed' ? 'bg-kaviBlue' : 'bg-border'
                )}
              />
            )}
            {index < steps.length - 1 && (
              <div
                className={cn(
                  'absolute left-1/2 right-0 top-4 h-0.5 -translate-y-1/2',
                  steps[index + 1]?.status === 'completed' ||
                    step.status === 'completed'
                    ? 'bg-kaviBlue'
                    : 'bg-border'
                )}
              />
            )}

            {/* Step dot */}
            <div
              className={cn(
                'relative z-10 flex h-8 w-8 items-center justify-center rounded-full',
                step.status === 'completed' && 'bg-kaviBlue',
                step.status === 'current' &&
                  'bg-kaviBlue ring-4 ring-kaviBlue/20',
                step.status === 'upcoming' && 'border-2 border-border bg-card'
              )}
            >
              {step.status !== 'upcoming' && (
                <div
                  className={cn(
                    'h-2 w-2 rounded-full',
                    step.status === 'completed' && 'bg-white',
                    step.status === 'current' && 'bg-white'
                  )}
                />
              )}
            </div>

            {/* Step label */}
            <span
              className={cn(
                'mt-2 text-xs font-medium',
                step.status === 'completed' && 'text-kaviBlue',
                step.status === 'current' && 'font-semibold text-foreground',
                step.status === 'upcoming' && 'text-muted-foreground'
              )}
            >
              {step.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CardCreationProgressBar;
