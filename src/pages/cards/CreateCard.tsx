import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useVirtualCards } from '@/contexts/VirtualCardContext';
import { useAuth } from '@/contexts/AuthContext';
import {
  CardCreationForm,
  CardCreationProgressBar,
  CardCreationSuccess,
  CardReviewStep,
  type CardCreationStep,
  type CardCreationSubmitData,
} from '@/components/cards/cardCreation';
import { BVNInputModal } from '@/components/cards';
import type { VirtualCard, CardPreOrder } from '@/types/card';

export function CreateCard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { createPreOrder, processPreOrder, loadCards } = useVirtualCards();

  const [currentStep, setCurrentStep] = useState<CardCreationStep>('configure');
  const [cardData, setCardData] = useState<CardCreationSubmitData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdCard, setCreatedCard] = useState<VirtualCard | undefined>();
  const [createdPreOrder, setCreatedPreOrder] = useState<CardPreOrder | undefined>();
  const [showBvnModal, setShowBvnModal] = useState(false);
  const [pendingPreOrderForBvn, setPendingPreOrderForBvn] = useState<CardPreOrder | null>(null);

  const isKYCVerified = user?.kycStatus === 'verified';
  // Check if user is Nigerian (requires BVN for card creation)
  const isNigerian = user?.kyc_country?.code?.toUpperCase() === 'NG';

  const handleFormSubmit = (data: CardCreationSubmitData) => {
    setCardData(data);
    setCurrentStep('review');
  };

  const handleConfirmPayment = async (bvn?: string) => {
    if (!cardData) return;

    setIsLoading(true);
    setError(null);

    try {
      // If we have a pending pre-order for BVN, use that instead of creating a new one
      let preOrder = pendingPreOrderForBvn;

      if (!preOrder) {
        // Create pre-order
        preOrder = await createPreOrder({
          type: cardData.type,
          currency: cardData.currency,
          brand: cardData.brand,
          amount: cardData.amount,
          provider: cardData.provider,
          requires3dSecure: cardData.requires3dSecure,
          cardNickname: cardData.cardNickname,
        });
      }

      // If KYC is verified, try to process the card immediately
      if (isKYCVerified) {
        try {
          // For Nigerian users, we need BVN to process the card
          if (isNigerian && !bvn) {
            // Show BVN modal and save the pre-order for later processing
            setPendingPreOrderForBvn(preOrder);
            setShowBvnModal(true);
            setIsLoading(false);
            return;
          }

          const card = await processPreOrder(preOrder.id, bvn);
          setCreatedCard(card);
          setCreatedPreOrder(undefined);
          setPendingPreOrderForBvn(null);
        } catch (err) {
          // Check if error is BVN-related
          const errorMsg = err instanceof Error ? err.message.toLowerCase() : '';
          if (errorMsg.includes('bvn') && errorMsg.includes('required')) {
            // Show BVN modal and save the pre-order for later processing
            setPendingPreOrderForBvn(preOrder);
            setShowBvnModal(true);
            setIsLoading(false);
            return;
          }
          // If processing fails for other reasons, still show success with pre-order
          setCreatedPreOrder(preOrder);
          setPendingPreOrderForBvn(null);
        }
      } else {
        // KYC not verified, show pre-order success
        setCreatedPreOrder(preOrder);
        setPendingPreOrderForBvn(null);
      }

      // Refresh cards list
      await loadCards(true);

      setCurrentStep('success');
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to create card. Please try again.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle BVN submission from modal
  const handleBvnSubmit = async (bvn: string) => {
    setShowBvnModal(false);
    await handleConfirmPayment(bvn);
  };

  const handleBack = () => {
    if (currentStep === 'review') {
      setCurrentStep('configure');
    }
  };

  const handleCancel = () => {
    navigate('/cards');
  };

  const handleViewDashboard = () => {
    navigate('/cards');
  };

  const handleManageCard = () => {
    if (createdCard) {
      navigate(`/cards/${createdCard.id}/settings`);
    } else if (!isKYCVerified) {
      navigate('/kyc');
    } else {
      navigate('/cards');
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      {/* Header */}
      {currentStep !== 'success' && (
        <div className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCancel}
            className="mb-4 gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Cards
          </Button>

          <h1 className="text-2xl font-bold text-foreground">Create Virtual Card</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Set up a new virtual card for online purchases
          </p>
        </div>
      )}

      {/* Progress Bar */}
      {currentStep !== 'success' && (
        <CardCreationProgressBar currentStep={currentStep} />
      )}

      {/* Error Banner */}
      {error && (
        <div className="mb-6 rounded-xl bg-destructive/10 p-4 text-destructive">
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Content */}
      <div className="rounded-2xl border border-border bg-card p-6">
        {currentStep === 'configure' && (
          <CardCreationForm
            onSubmit={handleFormSubmit}
            onCancel={handleCancel}
            loading={isLoading}
          />
        )}

        {currentStep === 'review' && cardData && (
          <CardReviewStep
            cardData={cardData}
            onConfirm={handleConfirmPayment}
            onBack={handleBack}
            loading={isLoading}
          />
        )}

        {currentStep === 'success' && (
          <CardCreationSuccess
            createdCard={createdCard}
            createdPreOrder={createdPreOrder}
            onViewDashboard={handleViewDashboard}
            onManageCard={handleManageCard}
          />
        )}
      </div>

      {/* BVN Input Modal for Nigerian users */}
      <BVNInputModal
        isOpen={showBvnModal}
        onClose={() => {
          setShowBvnModal(false);
          // If we have a pending pre-order, show it as success
          if (pendingPreOrderForBvn) {
            setCreatedPreOrder(pendingPreOrderForBvn);
            setPendingPreOrderForBvn(null);
            setCurrentStep('success');
          }
        }}
        onSubmit={handleBvnSubmit}
        isLoading={isLoading}
      />
    </div>
  );
}
