import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Package,
  Truck,
  MapPin,
  CheckCircle2,
  AlertCircle,
  ChevronLeft,
  RefreshCw,
  Clock,
  User,
  Phone,
  Home,
  Building,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import * as cardApi from '@/lib/api/cards';
import type { CardDelivery as CardDeliveryType, DeliveryStatus, TrackingEvent } from '@/types/card';
import { cn } from '@/lib/utils';

// Delivery timeline steps
const DELIVERY_STEPS = [
  { status: 'ordered' as DeliveryStatus, label: 'Order Placed', Icon: Package },
  { status: 'in_transit' as DeliveryStatus, label: 'In Transit', Icon: Truck },
  { status: 'out_for_delivery' as DeliveryStatus, label: 'Out for Delivery', Icon: MapPin },
  { status: 'delivered' as DeliveryStatus, label: 'Delivered', Icon: CheckCircle2 },
];

const NIGERIAN_PHONE_REGEX = /^0[789][01]\d{8}$/;

const getStepIndex = (status: DeliveryStatus): number => {
  if (status === 'pending') return -1;
  const idx = DELIVERY_STEPS.findIndex((s) => s.status === status);
  return idx >= 0 ? idx : 0;
};

const formatTrackingTime = (timeStr: string): string => {
  try {
    const date = new Date(timeStr);
    if (isNaN(date.getTime())) return timeStr;
    return date.toLocaleString();
  } catch {
    return timeStr;
  }
};

// Delivery Form Component
interface DeliveryFormProps {
  preOrderId: string;
  onSuccess: (delivery: CardDeliveryType) => void;
}

function DeliveryForm({ preOrderId, onSuccess }: DeliveryFormProps) {
  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!recipientName || !recipientPhone || !address || !city || !state) {
      setError('Please fill in all fields');
      return;
    }

    if (!NIGERIAN_PHONE_REGEX.test(recipientPhone)) {
      setError('Please enter a valid Nigerian phone number (e.g. 08012345678)');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await cardApi.createDeliveryOrder(preOrderId, {
        recipientName,
        recipientPhone,
        address,
        city,
        state,
      });
      onSuccess(result.delivery);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create delivery order');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Delivery Address</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-red-500 text-sm">{error}</p>
            </div>
          )}

          <div>
            <label className="text-sm text-muted-foreground mb-1.5 block">
              Recipient Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="Full name"
                className="pl-10"
              />
            </div>
          </div>

          <div>
            <label className="text-sm text-muted-foreground mb-1.5 block">
              Phone Number
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={recipientPhone}
                onChange={(e) => setRecipientPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
                placeholder="e.g. 08012345678"
                className="pl-10"
                maxLength={11}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Nigerian phone number format
            </p>
          </div>

          <div>
            <label className="text-sm text-muted-foreground mb-1.5 block">
              Street Address
            </label>
            <div className="relative">
              <Home className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="House number, street name"
                className="pl-10"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-muted-foreground mb-1.5 block">
                City
              </label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Lagos"
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1.5 block">
                State
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="e.g. Lagos"
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Truck className="mr-2 h-4 w-4" />
                Submit Delivery Order
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

// Tracking View Component
interface TrackingViewProps {
  delivery: CardDeliveryType;
  onRefresh: () => void;
  isRefreshing: boolean;
}

function TrackingView({ delivery, onRefresh, isRefreshing }: TrackingViewProps) {
  const currentStep = getStepIndex(delivery.status);
  const isFailed = delivery.status === 'failed';
  const events = delivery.trackingEvents?.events || [];

  return (
    <div className="space-y-6">
      {/* Status Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              {isFailed ? (
                <div className="p-3 rounded-full bg-red-500/10">
                  <AlertCircle className="h-6 w-6 text-red-500" />
                </div>
              ) : delivery.status === 'delivered' ? (
                <div className="p-3 rounded-full bg-emerald-500/10">
                  <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                </div>
              ) : (
                <div className="p-3 rounded-full bg-blue-500/10">
                  <Truck className="h-6 w-6 text-blue-500" />
                </div>
              )}
              <div>
                <h3 className="font-semibold">
                  {isFailed
                    ? 'Delivery Failed'
                    : delivery.status === 'delivered'
                      ? 'Delivered'
                      : 'In Progress'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Waybill: {delivery.waybillNo}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={cn('h-4 w-4', isRefreshing && 'animate-spin')} />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Timeline */}
      {!isFailed && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Delivery Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              {DELIVERY_STEPS.map((step, index) => {
                const isCompleted = index <= currentStep;
                const isCurrent = index === currentStep;
                const { Icon } = step;

                return (
                  <div key={step.status} className="relative flex items-start pb-8 last:pb-0">
                    {/* Connector Line */}
                    {index < DELIVERY_STEPS.length - 1 && (
                      <div
                        className={cn(
                          'absolute left-[15px] top-[32px] w-0.5 h-[calc(100%-16px)]',
                          isCompleted ? 'bg-primary' : 'bg-border'
                        )}
                      />
                    )}

                    {/* Icon */}
                    <div
                      className={cn(
                        'relative z-10 flex items-center justify-center w-8 h-8 rounded-full border-2',
                        isCompleted
                          ? 'bg-primary border-primary'
                          : 'bg-background border-border'
                      )}
                    >
                      <Icon
                        className={cn(
                          'h-4 w-4',
                          isCompleted ? 'text-primary-foreground' : 'text-muted-foreground'
                        )}
                      />
                    </div>

                    {/* Label */}
                    <div className="ml-4">
                      <p
                        className={cn(
                          'font-medium',
                          isCurrent ? 'text-primary' : isCompleted ? 'text-foreground' : 'text-muted-foreground'
                        )}
                      >
                        {step.label}
                      </p>
                      {isCurrent && delivery.status !== 'delivered' && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Current status
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tracking Events */}
      {events.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Tracking Updates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {events.map((event: TrackingEvent, index: number) => (
                <div
                  key={`${event.time}-${event.action}-${index}`}
                  className="flex items-start gap-3"
                >
                  <div className="p-2 rounded-full bg-muted">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm">
                      {event.messageEng || event.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatTrackingTime(event.time)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Delivery Address */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Delivery Address</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="font-medium">{delivery.recipientName}</p>
            <p className="text-muted-foreground">{delivery.recipientPhone}</p>
            <p className="text-muted-foreground">{delivery.address}</p>
            <p className="text-muted-foreground">
              {delivery.city}, {delivery.state}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Main Component
export function CardDelivery() {
  const { preOrderId } = useParams<{ preOrderId: string }>();
  const navigate = useNavigate();

  const [delivery, setDelivery] = useState<CardDeliveryType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDelivery = async (showRefreshing = false) => {
    if (!preOrderId) return;

    if (showRefreshing) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      const result = await cardApi.getDeliveryStatus(preOrderId);
      setDelivery(result.delivery || null);
    } catch (err) {
      // Don't show error if delivery doesn't exist yet
      if (err instanceof Error && !err.message.includes('404')) {
        setError(err.message);
      }
      setDelivery(null);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    if (!preOrderId) return;

    setIsRefreshing(true);
    try {
      await cardApi.refreshDeliveryTracking(preOrderId);
      await loadDelivery(true);
    } catch (err) {
      // Just reload without refresh if tracking refresh fails
      await loadDelivery(true);
    }
  };

  useEffect(() => {
    loadDelivery();
  }, [preOrderId]);

  const handleDeliveryCreated = (newDelivery: CardDeliveryType) => {
    setDelivery(newDelivery);
  };

  if (!preOrderId) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-8">
        <Card>
          <CardContent className="py-12 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p>Invalid order ID</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="p-2"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">
          {delivery ? 'Track Delivery' : 'Ship Your Card'}
        </h1>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
          <p className="text-red-500 text-sm">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <Card>
          <CardContent className="py-12 flex items-center justify-center">
            <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
          </CardContent>
        </Card>
      )}

      {/* Content */}
      {!isLoading && (
        <>
          {delivery ? (
            <TrackingView
              delivery={delivery}
              onRefresh={handleRefresh}
              isRefreshing={isRefreshing}
            />
          ) : (
            <DeliveryForm
              preOrderId={preOrderId}
              onSuccess={handleDeliveryCreated}
            />
          )}
        </>
      )}
    </div>
  );
}
