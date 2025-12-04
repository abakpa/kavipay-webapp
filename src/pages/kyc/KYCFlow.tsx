import { Link } from 'react-router-dom';
import { ShieldCheck, ArrowRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export function KYCFlow() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Verify Your Identity</h1>
        <p className="text-muted-foreground">
          Complete verification to unlock all features
        </p>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center py-8 text-center">
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-kaviBlue/10">
            <ShieldCheck className="h-10 w-10 text-kaviBlue" />
          </div>
          <CardTitle className="mb-2">Identity Verification</CardTitle>
          <p className="mb-6 max-w-sm text-muted-foreground">
            We need to verify your identity to comply with regulations and keep your account secure.
          </p>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">You'll need:</p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• A valid government-issued ID</li>
              <li>• A selfie for face verification</li>
              <li>• Proof of address (optional)</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Button className="w-full" size="lg">
        Start Verification
        <ArrowRight className="ml-2 h-4 w-4" />
      </Button>

      <Link to="/kyc/status">
        <Button variant="ghost" className="w-full">
          Check Verification Status
        </Button>
      </Link>
    </div>
  );
}
