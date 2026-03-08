import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import {
  ArrowLeft,
  Copy,
  Check,
  Loader2,
  AlertTriangle,
  Shield,
  Download,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import {
  setup2FA,
  verify2FASetup,
  disable2FA,
  getVerificationStatus,
} from '@/lib/api/verification';
import { useVerification } from '@/contexts/VerificationContext';

type Step = 'overview' | 'qr' | 'verify' | 'backup' | 'disable';

export function TwoFactorSetup() {
  const navigate = useNavigate();
  const { refreshStatus } = useVerification();
  const inputRef = useRef<HTMLInputElement>(null);

  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [step, setStep] = useState<Step>('overview');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [secret, setSecret] = useState('');
  const [provisioningUri, setProvisioningUri] = useState('');
  const [code, setCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [copiedBackup, setCopiedBackup] = useState(false);
  const [disableCode, setDisableCode] = useState('');
  const [savedBackupCodes, setSavedBackupCodes] = useState(false);

  // Check if TOTP is already enabled
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const status = await getVerificationStatus();
        setIsEnabled(status.totp_enabled);
      } catch (err) {
        console.error('Failed to check TOTP status:', err);
      } finally {
        setIsLoading(false);
      }
    };
    checkStatus();
  }, []);

  const handleStartSetup = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await setup2FA();
      setSecret(result.secret);
      setProvisioningUri(result.provisioning_uri);
      setStep('qr');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error?.response?.data?.error || 'Failed to start 2FA setup');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (code.length !== 6) return;
    setLoading(true);
    setError(null);
    try {
      const result = await verify2FASetup(code);
      setBackupCodes(result.backup_codes);
      setStep('backup');
      await refreshStatus();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error?.response?.data?.error || 'Invalid code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDisable = async () => {
    if (disableCode.length < 6) return;
    setLoading(true);
    setError(null);
    try {
      await disable2FA(disableCode);
      await refreshStatus();
      navigate(-1);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error?.response?.data?.error || 'Invalid code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copySecret = async () => {
    await navigator.clipboard.writeText(secret);
    setCopiedSecret(true);
    setTimeout(() => setCopiedSecret(false), 2000);
  };

  const copyBackupCodes = async () => {
    await navigator.clipboard.writeText(backupCodes.join('\n'));
    setCopiedBackup(true);
    setTimeout(() => setCopiedBackup(false), 2000);
  };

  const downloadBackupCodes = () => {
    const content = `KaviPay Backup Codes\n${'='.repeat(30)}\n\nSave these codes in a safe place.\nEach code can only be used once.\n\n${backupCodes.join('\n')}\n\nGenerated: ${new Date().toISOString()}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'kavipay-backup-codes.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const confirmDisable = () => {
    if (confirm('Are you sure you want to disable Two-Factor Authentication? Your account will be less secure.')) {
      setStep('disable');
      setError(null);
      setDisableCode('');
    }
  };

  const handleBack = () => {
    if (step === 'backup') {
      navigate(-1);
    } else if (step !== 'overview') {
      setStep('overview');
      setError(null);
    } else {
      navigate(-1);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBack}
          className="h-9 w-9 p-0"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold text-foreground">Two-Factor Authentication</h1>
      </div>

      {/* Overview */}
      {step === 'overview' && (
        <div className="flex flex-col items-center py-8">
          <div
            className={`mb-4 rounded-2xl px-4 py-2 ${
              isEnabled ? 'bg-emerald-500/10' : 'bg-amber-500/10'
            }`}
          >
            <span
              className={`text-sm font-semibold ${
                isEnabled ? 'text-emerald-500' : 'text-amber-500'
              }`}
            >
              {isEnabled ? 'Enabled' : 'Not Enabled'}
            </span>
          </div>

          <h2 className="mb-2 text-center text-xl font-semibold">
            Two-Factor Authentication
          </h2>
          <p className="mb-8 text-center text-muted-foreground">
            {isEnabled
              ? 'Your account is protected with an authenticator app. You will need your authenticator to sign in.'
              : 'Add an extra layer of security by requiring a code from an authenticator app when signing in.'}
          </p>

          {isEnabled ? (
            <Button
              onClick={confirmDisable}
              variant="destructive"
              className="w-full"
            >
              Disable 2FA
            </Button>
          ) : (
            <Button
              onClick={handleStartSetup}
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Setting up...
                </>
              ) : (
                'Set Up 2FA'
              )}
            </Button>
          )}

          {error && (
            <p className="mt-4 text-center text-sm text-destructive">{error}</p>
          )}
        </div>
      )}

      {/* QR Code Step */}
      {step === 'qr' && (
        <div className="flex flex-col items-center py-4">
          <h2 className="mb-2 text-center text-xl font-semibold">Scan QR Code</h2>
          <p className="mb-6 text-center text-muted-foreground">
            Open your authenticator app (Google Authenticator, Authy, etc.) and scan this QR code.
          </p>

          <div className="mb-6 rounded-2xl bg-white p-4">
            <QRCodeSVG value={provisioningUri} size={200} />
          </div>

          <p className="mb-2 text-sm text-muted-foreground">
            Or enter this key manually:
          </p>
          <button
            onClick={copySecret}
            className="mb-6 flex w-full items-center justify-between gap-2 rounded-xl border border-border bg-muted px-4 py-3"
          >
            <code className="flex-1 truncate text-sm font-medium">{secret}</code>
            {copiedSecret ? (
              <Check className="h-4 w-4 text-emerald-500" />
            ) : (
              <Copy className="h-4 w-4 text-muted-foreground" />
            )}
          </button>

          <Button
            onClick={() => {
              setStep('verify');
              setCode('');
              setError(null);
              setTimeout(() => inputRef.current?.focus(), 100);
            }}
            className="w-full"
          >
            Continue
          </Button>
        </div>
      )}

      {/* Verify Step */}
      {step === 'verify' && (
        <div className="flex flex-col items-center py-4">
          <h2 className="mb-2 text-center text-xl font-semibold">Verify Setup</h2>
          <p className="mb-6 text-center text-muted-foreground">
            Enter the 6-digit code from your authenticator app to complete setup.
          </p>

          <input
            ref={inputRef}
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={code}
            onChange={(e) => {
              setCode(e.target.value.replace(/\D/g, '').slice(0, 6));
              setError(null);
            }}
            placeholder="000000"
            className={`mb-4 w-48 rounded-xl border bg-muted px-4 py-4 text-center text-2xl font-bold tracking-[0.5em] focus:outline-none ${
              error ? 'border-destructive' : 'border-border focus:border-kaviBlue'
            }`}
            autoFocus
            disabled={loading}
          />

          {error && (
            <p className="mb-4 text-center text-sm text-destructive">{error}</p>
          )}

          <Button
            onClick={handleVerify}
            disabled={code.length !== 6 || loading}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              'Enable 2FA'
            )}
          </Button>
        </div>
      )}

      {/* Backup Codes Step */}
      {step === 'backup' && (
        <div className="flex flex-col items-center py-4">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10">
            <Shield className="h-8 w-8 text-emerald-500" />
          </div>

          <h2 className="mb-2 text-center text-xl font-semibold">Save Backup Codes</h2>
          <p className="mb-6 text-center text-muted-foreground">
            Save these backup codes in a safe place. Each code can only be used once to sign in if you lose access to your authenticator app.
          </p>

          <Card className="mb-4 w-full">
            <CardContent className="flex flex-wrap justify-center gap-2 p-4">
              {backupCodes.map((bc, i) => (
                <code
                  key={i}
                  className="rounded bg-muted px-3 py-1 text-sm font-semibold"
                >
                  {bc}
                </code>
              ))}
            </CardContent>
          </Card>

          <div className="mb-4 flex w-full gap-2">
            <Button
              onClick={copyBackupCodes}
              variant="outline"
              className="flex-1"
            >
              {copiedBackup ? (
                <>
                  <Check className="mr-2 h-4 w-4 text-emerald-500" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy All
                </>
              )}
            </Button>
            <Button
              onClick={downloadBackupCodes}
              variant="outline"
              className="flex-1"
            >
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
          </div>

          <div className="mb-6 flex w-full items-start gap-3 rounded-xl bg-amber-500/10 p-4">
            <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-500" />
            <p className="text-sm text-amber-700 dark:text-amber-400">
              These codes will not be shown again. Make sure you have saved them before leaving this screen.
            </p>
          </div>

          <label className="mb-4 flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={savedBackupCodes}
              onChange={(e) => setSavedBackupCodes(e.target.checked)}
              className="h-5 w-5 rounded border-border"
            />
            <span className="text-sm">I've saved my backup codes</span>
          </label>

          <Button
            onClick={() => navigate(-1)}
            disabled={!savedBackupCodes}
            className="w-full"
          >
            Done
          </Button>
        </div>
      )}

      {/* Disable Step */}
      {step === 'disable' && (
        <div className="flex flex-col items-center py-4">
          <h2 className="mb-2 text-center text-xl font-semibold">Disable 2FA</h2>
          <p className="mb-6 text-center text-muted-foreground">
            Enter a code from your authenticator app or a backup code to confirm.
          </p>

          <input
            type="text"
            maxLength={8}
            value={disableCode}
            onChange={(e) => {
              setDisableCode(e.target.value.replace(/[^A-Za-z0-9]/g, '').slice(0, 8));
              setError(null);
            }}
            placeholder="Code"
            className={`mb-4 w-48 rounded-xl border bg-muted px-4 py-4 text-center text-xl font-bold focus:outline-none ${
              error ? 'border-destructive' : 'border-border focus:border-kaviBlue'
            }`}
            autoFocus
            disabled={loading}
          />

          {error && (
            <p className="mb-4 text-center text-sm text-destructive">{error}</p>
          )}

          <Button
            onClick={handleDisable}
            disabled={disableCode.length < 6 || loading}
            variant="destructive"
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Disabling...
              </>
            ) : (
              'Disable 2FA'
            )}
          </Button>
        </div>
      )}
    </div>
  );
}

export default TwoFactorSetup;
