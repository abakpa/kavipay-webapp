import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Smartphone, Mail, Loader2, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

const RESEND_COOLDOWN = 60;

export function DeviceVerification() {
  const navigate = useNavigate();
  const {
    deviceVerificationRequired,
    completeDeviceVerification,
    resendDeviceVerificationOTP,
    logout,
    loading,
  } = useAuth();

  const totpAvailable = deviceVerificationRequired?.totpAvailable ?? false;

  const [method, setMethod] = useState<'totp' | 'email_otp'>(
    totpAvailable ? 'totp' : 'email_otp'
  );
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [useBackupCode, setUseBackupCode] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(
    totpAvailable ? 0 : RESEND_COOLDOWN
  );
  const [resending, setResending] = useState(false);
  const [emailOTPRequested, setEmailOTPRequested] = useState(!totpAvailable);
  const inputRef = useRef<HTMLInputElement>(null);

  // Redirect if no verification is required
  useEffect(() => {
    if (!deviceVerificationRequired) {
      navigate('/dashboard', { replace: true });
    }
  }, [deviceVerificationRequired, navigate]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, [method, useBackupCode]);

  // Cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const expectedLength = method === 'totp' && useBackupCode ? 8 : 6;

  const handleVerify = async () => {
    if (code.length !== expectedLength) return;
    setError(null);
    try {
      await completeDeviceVerification(code, method);
      navigate('/dashboard', { replace: true });
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } }; message?: string };
      const message =
        error?.response?.data?.error ||
        error?.message ||
        'Verification failed. Please try again.';
      setError(message);
    }
  };

  // Auto-submit when expected length is reached
  useEffect(() => {
    if (code.length === expectedLength) {
      handleVerify();
    }
  }, [code, expectedLength]);

  const handleResend = async () => {
    if (resendCooldown > 0 || !deviceVerificationRequired) return;
    setResending(true);
    setError(null);
    try {
      await resendDeviceVerificationOTP();
      setResendCooldown(RESEND_COOLDOWN);
    } catch {
      setError('Failed to resend code. Please try again.');
    } finally {
      setResending(false);
    }
  };

  const switchToEmail = async () => {
    setMethod('email_otp');
    setCode('');
    setError(null);
    setUseBackupCode(false);
    // Send email OTP if not already sent
    if (!emailOTPRequested && deviceVerificationRequired) {
      setResending(true);
      try {
        await resendDeviceVerificationOTP();
        setResendCooldown(RESEND_COOLDOWN);
        setEmailOTPRequested(true);
      } catch {
        setError('Failed to send email code. Please try again.');
      } finally {
        setResending(false);
      }
    }
  };

  const switchToTOTP = () => {
    setMethod('totp');
    setCode('');
    setError(null);
    setUseBackupCode(false);
  };

  const toggleBackupCode = () => {
    setUseBackupCode((prev) => !prev);
    setCode('');
    setError(null);
  };

  const maskedEmail = deviceVerificationRequired?.email || '';
  const isTOTP = method === 'totp';

  if (!deviceVerificationRequired) {
    return null;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md rounded-2xl bg-card p-8 shadow-xl">
        <div className="flex flex-col items-center">
          {/* Icon */}
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-kaviBlue/10">
            {isTOTP ? (
              <Smartphone className="h-10 w-10 text-kaviBlue" />
            ) : (
              <Mail className="h-10 w-10 text-kaviBlue" />
            )}
          </div>

          <h1 className="mb-2 text-2xl font-bold">Verify Your Device</h1>
          <p className="mb-8 text-center text-muted-foreground">
            {isTOTP
              ? useBackupCode
                ? 'Enter one of your 8-character backup codes'
                : 'Enter the 6-digit code from your authenticator app'
              : `Enter the 6-digit code sent to ${maskedEmail}`}
          </p>

          {/* Code Input */}
          <input
            ref={inputRef}
            type={isTOTP && useBackupCode ? 'text' : 'text'}
            inputMode={isTOTP && useBackupCode ? 'text' : 'numeric'}
            maxLength={expectedLength}
            value={code}
            onChange={(e) => {
              if (isTOTP && useBackupCode) {
                setCode(
                  e.target.value
                    .replace(/[^A-Za-z0-9]/g, '')
                    .toUpperCase()
                    .slice(0, 8)
                );
              } else {
                setCode(e.target.value.replace(/\D/g, '').slice(0, 6));
              }
              setError(null);
            }}
            placeholder={isTOTP && useBackupCode ? 'XXXXXXXX' : '000000'}
            className={cn(
              'mb-4 w-full rounded-xl border bg-muted px-4 py-4 text-center text-2xl font-bold tracking-[0.3em] focus:border-kaviBlue focus:outline-none',
              error ? 'border-destructive' : 'border-border'
            )}
            autoFocus
            disabled={loading}
          />

          {/* Error */}
          {error && (
            <p className="mb-4 text-center text-sm text-destructive">{error}</p>
          )}

          {/* Verify Button */}
          <Button
            onClick={handleVerify}
            disabled={loading || code.length !== expectedLength}
            className="mb-4 w-full"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              'Verify'
            )}
          </Button>

          {/* TOTP: backup code toggle */}
          {isTOTP && (
            <button
              onClick={toggleBackupCode}
              className="mb-2 text-sm font-medium text-kaviBlue hover:underline"
            >
              {useBackupCode
                ? 'Use authenticator app instead'
                : 'Use a backup code'}
            </button>
          )}

          {/* Email OTP: resend button */}
          {!isTOTP && (
            <button
              onClick={handleResend}
              disabled={resendCooldown > 0 || resending}
              className={cn(
                'mb-2 text-sm font-medium',
                resendCooldown > 0
                  ? 'text-muted-foreground'
                  : 'text-kaviBlue hover:underline'
              )}
            >
              {resending ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Sending...
                </span>
              ) : resendCooldown > 0 ? (
                `Resend code in ${resendCooldown}s`
              ) : (
                'Resend code'
              )}
            </button>
          )}

          {/* Method switcher */}
          {totpAvailable && (
            <button
              onClick={isTOTP ? switchToEmail : switchToTOTP}
              disabled={resending}
              className="mb-4 text-sm font-medium text-kaviBlue hover:underline"
            >
              {isTOTP ? 'Use email code instead' : 'Use authenticator instead'}
            </button>
          )}

          {/* Back to login */}
          <button
            onClick={logout}
            disabled={loading}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeviceVerification;
