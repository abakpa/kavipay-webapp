import { Link } from 'react-router-dom';
import { ArrowLeft, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export function KYCStatus() {
  // TODO: Fetch KYC status from KYCContext

  return (
    <div className="mx-auto max-w-md space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/kyc">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold">Verification Status</h1>
        <p className="text-muted-foreground">Track your verification progress</p>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center py-8 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-kaviGold/10">
            <Clock className="h-8 w-8 text-kaviGold" />
          </div>
          <h3 className="mb-2 text-lg font-semibold">Not Started</h3>
          <p className="text-muted-foreground">
            You haven't started the verification process yet.
          </p>
        </CardContent>
      </Card>

      <Link to="/kyc">
        <Button className="w-full">Start Verification</Button>
      </Link>
    </div>
  );
}
