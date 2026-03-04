import { ArrowLeft, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';

export function Referral() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex max-w-lg items-center px-4 py-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="h-9 w-9 p-0"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold text-foreground">Referrals</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-lg space-y-6 px-4 py-6">
        {/* How it Works */}
        <div className="rounded-2xl bg-card p-6">
          <h3 className="mb-4 text-lg font-semibold text-foreground">How it Works</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-kaviBlue/10 text-sm font-semibold text-kaviBlue">
                1
              </span>
              <div>
                <p className="font-medium text-foreground">Get your code</p>
                <p className="text-sm text-muted-foreground">
                  Open the Referral Dashboard below to get your unique referral code and link
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-kaviBlue/10 text-sm font-semibold text-kaviBlue">
                2
              </span>
              <div>
                <p className="font-medium text-foreground">Share your code</p>
                <p className="text-sm text-muted-foreground">
                  Send your unique referral link to friends and family
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-kaviBlue/10 text-sm font-semibold text-kaviBlue">
                3
              </span>
              <div>
                <p className="font-medium text-foreground">Friends join</p>
                <p className="text-sm text-muted-foreground">
                  When they sign up using your code, they get bonus rewards
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-kaviBlue/10 text-sm font-semibold text-kaviBlue">
                4
              </span>
              <div>
                <p className="font-medium text-foreground">Earn together</p>
                <p className="text-sm text-muted-foreground">
                  You earn a bonus for each active referral
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Referral Dashboard Link */}
        <div className="rounded-2xl bg-card p-6">
          <h3 className="mb-2 text-lg font-semibold text-foreground">Referral Dashboard</h3>
          <p className="mb-4 text-sm text-muted-foreground">
            Get your unique referral code, view detailed analytics, track your earnings, and manage your referrals on the full dashboard.
          </p>
          <a
            href="https://referral.ploutoslabs.io/dashboard"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-kaviBlue px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-kaviBlue/90"
          >
            Open Referral Dashboard
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </div>
    </div>
  );
}

export default Referral;
