import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  CheckCircle,
  Clock,
  AlertCircle,
  CreditCard,
  RefreshCw,
  ChevronRight,
  History,
  HelpCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useVirtualCards } from '@/contexts/VirtualCardContext';
import { useAuth } from '@/contexts/AuthContext';
import { CardPreOrderStatus as PreOrderStatus } from '@/types/card';
import { cn } from '@/lib/utils';

// Rejection reason mapping for user-friendly messages
const REJECTION_LABEL_MAP: Record<string, string> = {
  // Selfie/Photo Issues
  SELFIE_MISMATCH: 'Selfie does not match ID photo',
  BAD_FACE_MATCHING: 'Face verification failed',
  BAD_SELFIE: 'Poor quality selfie photo',
  POOR_QUALITY_SELFIE: 'Poor quality selfie photo',
  SELFIE_WITH_ID: 'Please take selfie without holding ID',
  MULTIPLE_FACES: 'Multiple faces detected in selfie',
  NO_FACE_FOUND: 'No face detected in photo',
  FACE_NOT_FULLY_VISIBLE: 'Face not fully visible in photo',
  // Document Issues
  DOCUMENT_PAGE_MISSING: 'Required document page is missing',
  DOCUMENT_DAMAGED: 'Document appears damaged or torn',
  DOCUMENT_EXPIRED: 'Document has expired',
  DOCUMENT_NOT_READABLE: 'Document text is not readable',
  POOR_QUALITY_DOCUMENT: 'Document photo quality is too poor',
  DOCUMENT_NOT_SUPPORTED: 'Document type is not supported',
  BLACKLISTED_COUNTRY: 'Document from unsupported country',
  UNDERAGE_PERSON: 'Must be 18 years or older',
  // Fraud/Security Issues
  FRAUDULENT_PATTERNS: 'Suspicious activity detected',
  DOCUMENT_TEMPLATE: 'Document appears to be fake or template',
  PHOTOCOPY: 'Physical document required, not photocopy',
  SCREEN_RECAPTURE: 'Photo of screen not allowed',
  DIGITAL_DOCUMENT: 'Physical document required',
  BLACKLIST_PERSON: 'Person is on restricted list',
  // Technical Issues
  LOW_QUALITY: 'Image quality is too low',
  BLURRY: 'Image is too blurry',
  DARK_IMAGE: 'Image is too dark',
  BRIGHT_IMAGE: 'Image is too bright',
  INCOMPLETE_IMAGE: 'Image is incomplete or cut off',
  WRONG_SIDE: 'Wrong side of document captured',
  // Address/Proof of Address
  ADDRESS_MISMATCH: 'Address does not match provided information',
  OLD_ADDRESS_DOCUMENT: 'Address document is too old',
  INVALID_ADDRESS_FORMAT: 'Address format is invalid',
  // General
  ADDITIONAL_DOCUMENT_REQUIRED: 'Additional documents required',
  RESUBMISSION_REQUIRED: 'Please resubmit with corrections',
  TIMEOUT: 'Verification session timed out',
  ABANDONED: 'Verification was not completed',
};

const formatRejectionLabel = (label: string): string => {
  return REJECTION_LABEL_MAP[label] || label.replace(/_/g, ' ').toLowerCase();
};

export function CardPreOrderStatus() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    preOrders,
    loadPreOrders,
    processPreOrder,
    syncPreOrder,
    isProcessingPreOrder,
    error,
    clearError,
  } = useVirtualCards();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showBvnModal, setShowBvnModal] = useState(false);
  const [bvn, setBvn] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  // Filter for active pre-orders
  const activePreOrders = useMemo(() => {
    return preOrders.filter(
      (order) =>
        order.status === PreOrderStatus.PENDING_KYC ||
        order.status === PreOrderStatus.KYC_APPROVED ||
        order.status === PreOrderStatus.PROCESSING ||
        order.status === PreOrderStatus.COMPLETED ||
        order.status === PreOrderStatus.CREATION_FAILED ||
        order.status === PreOrderStatus.VERIFICATION_REJECTED ||
        order.status === PreOrderStatus.REFUND_ELIGIBLE ||
        order.status === PreOrderStatus.PENDING_SYNC
    );
  }, [preOrders]);

  // Get the latest active pre-order
  const latestPreOrder = useMemo(() => {
    if (activePreOrders.length === 0) return null;
    return [...activePreOrders].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )[0];
  }, [activePreOrders]);

  // Calculate expiry for pending KYC orders (7 days)
  const expiryDate = useMemo(() => {
    if (!latestPreOrder || latestPreOrder.status !== PreOrderStatus.PENDING_KYC) return null;
    const created = new Date(latestPreOrder.createdAt);
    created.setDate(created.getDate() + 7);
    return created;
  }, [latestPreOrder]);

  const daysUntilExpiry = useMemo(() => {
    if (!expiryDate) return null;
    const now = new Date();
    const diff = expiryDate.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }, [expiryDate]);

  useEffect(() => {
    loadPreOrders();
  }, [loadPreOrders]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    clearError();
    try {
      await loadPreOrders();
    } finally {
      setIsRefreshing(false);
    }
  };

  const getStatusIcon = () => {
    if (!latestPreOrder) return null;

    switch (latestPreOrder.status) {
      case PreOrderStatus.PENDING_KYC:
        return <Shield className="h-12 w-12 text-amber-500" />;
      case PreOrderStatus.KYC_APPROVED:
        return <CheckCircle className="h-12 w-12 text-emerald-500" />;
      case PreOrderStatus.PROCESSING:
      case PreOrderStatus.PENDING_SYNC:
        return <CreditCard className="h-12 w-12 text-blue-500" />;
      case PreOrderStatus.CREATION_FAILED:
        return <AlertCircle className="h-12 w-12 text-red-500" />;
      case PreOrderStatus.COMPLETED:
        return <CheckCircle className="h-12 w-12 text-emerald-500" />;
      case PreOrderStatus.VERIFICATION_REJECTED:
      case PreOrderStatus.REFUND_ELIGIBLE:
        return <AlertCircle className="h-12 w-12 text-red-500" />;
      default:
        return <Clock className="h-12 w-12 text-gray-500" />;
    }
  };

  const getStatusText = () => {
    if (!latestPreOrder) return { title: '', subtitle: '' };

    switch (latestPreOrder.status) {
      case PreOrderStatus.PENDING_KYC:
        return {
          title: 'Verification Required',
          subtitle: 'Complete identity verification to activate your card.',
        };
      case PreOrderStatus.KYC_APPROVED:
        return {
          title: 'Ready to Get Card',
          subtitle: 'Your identity is verified! Click below to get your card.',
        };
      case PreOrderStatus.PROCESSING:
      case PreOrderStatus.PENDING_SYNC:
        return {
          title: 'Creating Your Card',
          subtitle: 'Your identity is verified! We are now creating your card.',
        };
      case PreOrderStatus.CREATION_FAILED:
        return {
          title: 'Card Creation Failed',
          subtitle:
            'We encountered an issue creating your card. Please try again or contact support.',
        };
      case PreOrderStatus.COMPLETED:
        if (latestPreOrder?.type === 'physical') {
          return {
            title: latestPreOrder.deliveryStatus ? 'Card Shipping' : 'Order Confirmed',
            subtitle: latestPreOrder.deliveryStatus
              ? 'Your physical card is on its way!'
              : 'Enter your delivery address to ship your card.',
          };
        }
        return {
          title: 'Card Ready',
          subtitle: 'Your card has been created and is ready to use!',
        };
      case PreOrderStatus.VERIFICATION_REJECTED:
        return {
          title: 'Verification Failed',
          subtitle:
            'Your identity verification was not approved. Please contact support for assistance.',
        };
      case PreOrderStatus.REFUND_ELIGIBLE:
        return {
          title: 'Action Required',
          subtitle:
            'There was an issue with your card request. Please contact support for assistance.',
        };
      default:
        return { title: 'Processing', subtitle: 'Please wait...' };
    }
  };

  const handleGetCard = async (providedBvn?: string) => {
    if (!latestPreOrder) return;

    setLocalError(null);

    // Check if BVN is required for Nigerian users
    const isNigerian = user?.kyc_country?.code === 'NG';
    const isPhysicalCard = latestPreOrder.type === 'physical';

    if (isNigerian && !isPhysicalCard && !providedBvn && !showBvnModal) {
      setShowBvnModal(true);
      return;
    }

    try {
      await processPreOrder(latestPreOrder.id, providedBvn);
      setShowBvnModal(false);
      setBvn('');
      // Navigate to cards on success
      navigate('/cards');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message.toLowerCase() : '';
      if (errorMsg.includes('bvn') && errorMsg.includes('required')) {
        setShowBvnModal(true);
      } else {
        setLocalError(err instanceof Error ? err.message : 'Failed to process card');
      }
    }
  };

  const handleSyncCard = async () => {
    if (!latestPreOrder) return;
    setLocalError(null);

    try {
      await syncPreOrder(latestPreOrder.id);
      navigate('/cards');
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Failed to sync card');
    }
  };

  const handleBvnSubmit = () => {
    if (bvn.length === 11) {
      handleGetCard(bvn);
    }
  };

  const renderActionButton = () => {
    if (!latestPreOrder) return null;

    switch (latestPreOrder.status) {
      case PreOrderStatus.PENDING_KYC:
        return (
          <Button onClick={() => navigate('/kyc')} className="w-full">
            Complete Verification
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        );
      case PreOrderStatus.KYC_APPROVED:
        return (
          <Button
            onClick={() => handleGetCard()}
            disabled={isProcessingPreOrder}
            className="w-full"
          >
            {isProcessingPreOrder ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                Get My Card
                <ChevronRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        );
      case PreOrderStatus.PROCESSING:
        return (
          <Button variant="secondary" disabled className="w-full">
            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            Creating Card...
          </Button>
        );
      case PreOrderStatus.PENDING_SYNC:
        return (
          <Button
            onClick={handleSyncCard}
            disabled={isProcessingPreOrder}
            className="w-full"
          >
            {isProcessingPreOrder ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Syncing...
              </>
            ) : (
              <>
                Sync Card
                <RefreshCw className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        );
      case PreOrderStatus.CREATION_FAILED:
        return (
          <Button
            onClick={() => handleGetCard()}
            disabled={isProcessingPreOrder}
            className="w-full"
          >
            {isProcessingPreOrder ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Retrying...
              </>
            ) : (
              <>
                Retry Card Creation
                <RefreshCw className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        );
      case PreOrderStatus.COMPLETED:
        if (latestPreOrder.type === 'physical') {
          return (
            <Button
              onClick={() =>
                navigate(`/cards/pre-orders/${latestPreOrder.id}/delivery`)
              }
              className="w-full"
            >
              {latestPreOrder.deliveryStatus ? 'Track Delivery' : 'Ship My Card'}
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          );
        }
        return (
          <Button onClick={() => navigate('/cards')} className="w-full">
            View My Cards
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        );
      case PreOrderStatus.VERIFICATION_REJECTED:
      case PreOrderStatus.REFUND_ELIGIBLE:
        return (
          <Button
            variant="secondary"
            onClick={() => window.open('https://www.kavipay.io/help', '_blank')}
            className="w-full"
          >
            <HelpCircle className="mr-2 h-4 w-4" />
            Contact Support
          </Button>
        );
      default:
        return null;
    }
  };

  const statusText = getStatusText();

  if (!latestPreOrder) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CreditCard className="h-16 w-16 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">No Active Orders</h2>
            <p className="text-muted-foreground text-center mb-6">
              You don't have any active card orders at the moment.
            </p>
            <Button onClick={() => navigate('/cards/create')}>
              Create a Card
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Order Status</h1>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          <RefreshCw className={cn('h-4 w-4', isRefreshing && 'animate-spin')} />
        </Button>
      </div>

      {/* Error Display */}
      {(error || localError) && (
        <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
          <p className="text-red-500 text-sm">{error || localError}</p>
        </div>
      )}

      {/* Status Card */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center">
            {getStatusIcon()}
            <h2 className="text-xl font-semibold mt-4 mb-2">{statusText.title}</h2>
            <p className="text-muted-foreground mb-6">{statusText.subtitle}</p>

            {/* Expiry Warning for Pending KYC */}
            {daysUntilExpiry !== null && daysUntilExpiry <= 7 && (
              <div className="w-full mb-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                <p className="text-amber-600 text-sm">
                  {daysUntilExpiry === 0
                    ? 'This order expires today!'
                    : `This order expires in ${daysUntilExpiry} day${daysUntilExpiry !== 1 ? 's' : ''}`}
                </p>
              </div>
            )}

            {/* Rejection Details */}
            {latestPreOrder.status === PreOrderStatus.VERIFICATION_REJECTED &&
              latestPreOrder.rejectionReason && (
                <div className="w-full mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-left">
                  <p className="text-red-500 font-medium mb-2">Rejection Reason:</p>
                  <p className="text-red-400 text-sm">
                    {formatRejectionLabel(latestPreOrder.rejectionReason)}
                  </p>
                  {latestPreOrder.rejectionDetails && (
                    <p className="text-red-400 text-sm mt-2">
                      {latestPreOrder.rejectionDetails}
                    </p>
                  )}
                </div>
              )}

            {renderActionButton()}
          </div>
        </CardContent>
      </Card>

      {/* Order Summary */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Order Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Order ID</span>
              <span className="font-mono text-sm">{latestPreOrder.id.slice(0, 8)}...</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Card Type</span>
              <span className="capitalize">{latestPreOrder.type || 'Virtual'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Brand</span>
              <span className="uppercase">{latestPreOrder.brand}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Initial Balance</span>
              <span>
                {latestPreOrder.currency === 'USD' ? '$' : '₦'}
                {latestPreOrder.initialAmount.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Card Fee</span>
              <span>
                {latestPreOrder.currency === 'USD' ? '$' : '₦'}
                {latestPreOrder.cardFeePaid.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Order Date</span>
              <span>{new Date(latestPreOrder.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* View Order History Link */}
      <Button
        variant="outline"
        className="w-full"
        onClick={() => navigate('/cards/pre-order-history')}
      >
        <History className="mr-2 h-4 w-4" />
        View Order History
      </Button>

      {/* BVN Modal */}
      {showBvnModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-2">Enter BVN</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Your Bank Verification Number (BVN) is required to create your card.
            </p>
            <input
              type="text"
              value={bvn}
              onChange={(e) => setBvn(e.target.value.replace(/\D/g, '').slice(0, 11))}
              placeholder="Enter 11-digit BVN"
              className="w-full px-4 py-3 rounded-lg border bg-background mb-4"
              maxLength={11}
            />
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setShowBvnModal(false);
                  setBvn('');
                }}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={handleBvnSubmit}
                disabled={bvn.length !== 11 || isProcessingPreOrder}
              >
                {isProcessingPreOrder ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  'Submit'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
