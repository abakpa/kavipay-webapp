import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { useKYC } from '@/contexts/KYCContext';
import { KYCStatusDisplay } from '@/components/kyc/KYCStatusDisplay';

export function KYCStatus() {
  const navigate = useNavigate();
  const { unifiedStatus } = useKYC();

  const handleStartVerification = () => {
    navigate('/kyc');
  };

  const handleContinue = () => {
    if (unifiedStatus === 'approved') {
      navigate('/cards');
    } else {
      navigate('/kyc');
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-accent hover:bg-accent/80"
        >
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Verification Status</h1>
          <p className="text-muted-foreground">Track your verification progress</p>
        </div>
      </div>

      {/* Status Display */}
      <Card>
        <CardContent className="py-6">
          <KYCStatusDisplay
            onStartOver={handleStartVerification}
            onContinue={handleContinue}
            showActions={true}
          />
        </CardContent>
      </Card>
    </div>
  );
}

export default KYCStatus;
