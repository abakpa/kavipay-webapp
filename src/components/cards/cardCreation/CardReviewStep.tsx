import { CreditCard, Wallet, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { CARD_CREATION_FEE, type CardCreationSubmitData } from './constants';

interface CardReviewStepProps {
  cardData: CardCreationSubmitData;
  onConfirm: () => void;
  onBack: () => void;
  loading?: boolean;
}

export function CardReviewStep({
  cardData,
  onConfirm,
  onBack,
  loading = false,
}: CardReviewStepProps) {
  const { user } = useAuth();

  const userBalance = user?.gameWalletBalance || 0;
  const totalCost = CARD_CREATION_FEE + cardData.amount;
  const hasEnoughBalance = userBalance >= totalCost;

  return (
    <div className="space-y-6">
      {/* Section Title */}
      <div>
        <h2 className="text-xl font-bold text-foreground">Review Your Card</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Please review your card details before confirming payment.
        </p>
      </div>

      {/* Card Configuration Summary */}
      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-kaviBlue/10">
            <CreditCard className="h-5 w-5 text-kaviBlue" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">
            Card Configuration
          </h3>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between py-2">
            <span className="text-muted-foreground">Card Type</span>
            <span className="font-semibold text-foreground">
              {cardData.type.charAt(0).toUpperCase() + cardData.type.slice(1)} Card
            </span>
          </div>

          <div className="flex items-center justify-between py-2">
            <span className="text-muted-foreground">Card Brand</span>
            <span className="font-semibold text-foreground">
              {cardData.brand.charAt(0).toUpperCase() + cardData.brand.slice(1)}
            </span>
          </div>

          <div className="flex items-center justify-between py-2">
            <span className="text-muted-foreground">Currency</span>
            <span className="font-semibold text-foreground">{cardData.currency}</span>
          </div>

          {cardData.cardNickname && (
            <div className="flex items-center justify-between py-2">
              <span className="text-muted-foreground">Card Nickname</span>
              <span className="font-semibold text-foreground">
                {cardData.cardNickname}
              </span>
            </div>
          )}

          {cardData.amount > 0 && (
            <>
              <div className="my-2 h-px bg-border" />
              <div className="flex items-center justify-between py-2">
                <span className="text-muted-foreground">Initial Balance</span>
                <span className="font-semibold text-foreground">
                  ${cardData.amount.toFixed(2)}
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Account Balance */}
      <div
        className={cn(
          'rounded-2xl border p-5',
          hasEnoughBalance
            ? 'border-border bg-card'
            : 'border-destructive/50 bg-destructive/10'
        )}
      >
        <div className="mb-3 flex items-center gap-2">
          <Wallet className="h-5 w-5 text-muted-foreground" />
          <span className="text-muted-foreground">Your Account Balance</span>
        </div>
        <span className="text-2xl font-bold text-foreground">
          ${userBalance.toFixed(2)}
        </span>
        {!hasEnoughBalance && (
          <p className="mt-2 text-sm text-destructive">
            Insufficient balance. Please top up your account.
          </p>
        )}
      </div>

      {/* Cost Breakdown */}
      <div className="rounded-2xl border border-border bg-card p-5">
        <h3 className="mb-4 text-lg font-semibold text-foreground">
          Payment Breakdown
        </h3>

        <div className="space-y-2">
          <div className="flex items-center justify-between py-2">
            <span className="text-muted-foreground">Card Creation Fee</span>
            <span className="font-medium text-foreground">
              ${CARD_CREATION_FEE.toFixed(2)}
            </span>
          </div>

          {cardData.amount > 0 && (
            <div className="flex items-center justify-between py-2">
              <span className="text-muted-foreground">Initial Balance</span>
              <span className="font-medium text-foreground">
                ${cardData.amount.toFixed(2)}
              </span>
            </div>
          )}

          <div className="mt-2 flex items-center justify-between border-t-2 border-border pt-3">
            <span className="text-lg font-bold text-foreground">Total</span>
            <span className="text-2xl font-bold text-kaviBlue">
              ${totalCost.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Insufficient Balance Warning */}
      {!hasEnoughBalance && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 flex-shrink-0 text-destructive" />
            <div>
              <p className="font-semibold text-foreground">Insufficient Balance</p>
              <p className="mt-1 text-sm text-muted-foreground">
                You need ${(totalCost - userBalance).toFixed(2)} more to complete this
                transaction. Please top up your account balance.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Form Actions */}
      <div className="flex flex-col gap-3 pt-2">
        <Button
          type="button"
          size="lg"
          onClick={onConfirm}
          disabled={loading || !hasEnoughBalance}
          className="w-full"
        >
          {loading
            ? 'Processing...'
            : hasEnoughBalance
              ? `Pay $${totalCost.toFixed(2)}`
              : 'Insufficient Balance'}
        </Button>

        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={onBack}
          disabled={loading}
          className="w-full"
        >
          Back to Edit
        </Button>
      </div>
    </div>
  );
}

export default CardReviewStep;
