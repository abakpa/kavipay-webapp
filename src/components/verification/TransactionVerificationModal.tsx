import { useState, useEffect, useRef } from 'react';
import { Shield, Smartphone, Mail, Key, Loader2 } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import type { VerificationMethod } from '@/lib/api/verification';
import type { VerificationModal } from '@/hooks/useTransactionVerification';

interface TransactionVerificationModalProps {
  activeModal: VerificationModal;
  closeModal: () => void;
  // PIN
  onPinSubmit: (pin: string) => Promise<void>;
  pinError: string | null;
  // TOTP
  onTOTPSubmit: (code: string) => Promise<void>;
  totpError: string | null;
  // Email OTP
  onEmailOTPRequest: () => Promise<void>;
  onEmailOTPSubmit: (code: string) => Promise<void>;
  emailOTPError: string | null;
  emailOTPSent: boolean;
  maskedEmail: string | null;
  // Method selection
  onMethodSelect: (method: VerificationMethod) => void;
  availableMethods: VerificationMethod[];
  // State
  isVerifying: boolean;
}

const METHOD_LABELS: Record<VerificationMethod, string> = {
  pin: 'Transaction PIN',
  totp: 'Authenticator App',
  email_otp: 'Email Code',
};

const getMethodIcon = (method: VerificationMethod) => {
  switch (method) {
    case 'pin':
      return Key;
    case 'totp':
      return Smartphone;
    case 'email_otp':
      return Mail;
  }
};

export function TransactionVerificationModal({
  activeModal,
  closeModal,
  onPinSubmit,
  pinError,
  onTOTPSubmit,
  totpError,
  onEmailOTPRequest,
  onEmailOTPSubmit,
  emailOTPError,
  emailOTPSent,
  maskedEmail,
  onMethodSelect,
  availableMethods,
  isVerifying,
}: TransactionVerificationModalProps) {
  const isOpen = activeModal !== 'none';

  return (
    <Modal isOpen={isOpen} onClose={closeModal}>
      {activeModal === 'method_select' && (
        <MethodSelector
          availableMethods={availableMethods}
          onMethodSelect={onMethodSelect}
        />
      )}
      {activeModal === 'pin' && (
        <PinView
          onSubmit={onPinSubmit}
          error={pinError}
          isVerifying={isVerifying}
          showMethodSwitch={availableMethods.length > 1}
          availableMethods={availableMethods}
          onMethodSelect={onMethodSelect}
        />
      )}
      {activeModal === 'totp' && (
        <TOTPView
          onSubmit={onTOTPSubmit}
          error={totpError}
          isVerifying={isVerifying}
          showMethodSwitch={availableMethods.length > 1}
          availableMethods={availableMethods}
          onMethodSelect={onMethodSelect}
        />
      )}
      {activeModal === 'email_otp' && (
        <EmailOTPView
          onSendCode={onEmailOTPRequest}
          onSubmit={onEmailOTPSubmit}
          error={emailOTPError}
          codeSent={emailOTPSent}
          maskedEmail={maskedEmail}
          isVerifying={isVerifying}
          showMethodSwitch={availableMethods.length > 1}
          availableMethods={availableMethods}
          onMethodSelect={onMethodSelect}
        />
      )}
    </Modal>
  );
}

// --- PIN View ---

interface PinViewProps {
  onSubmit: (pin: string) => Promise<void>;
  error: string | null;
  isVerifying: boolean;
  showMethodSwitch: boolean;
  availableMethods: VerificationMethod[];
  onMethodSelect: (method: VerificationMethod) => void;
}

function PinView({
  onSubmit,
  error,
  isVerifying,
  showMethodSwitch,
  availableMethods,
  onMethodSelect,
}: PinViewProps) {
  const [pin, setPin] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async () => {
    if (pin.length === 6 && !isVerifying) {
      await onSubmit(pin);
      setPin('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="flex flex-col items-center py-4">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-kaviBlue/10">
        <Shield className="h-8 w-8 text-kaviBlue" />
      </div>
      <h3 className="mb-2 text-xl font-semibold">Enter PIN</h3>
      <p className="mb-6 text-center text-sm text-muted-foreground">
        Enter your 6-digit transaction PIN to verify
      </p>

      {error && (
        <p className="mb-4 text-center text-sm text-destructive">{error}</p>
      )}

      <div className="mb-6 flex gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'h-3 w-3 rounded-full transition-colors',
              i < pin.length ? 'bg-kaviBlue' : 'bg-muted'
            )}
          />
        ))}
      </div>

      <input
        ref={inputRef}
        type="password"
        inputMode="numeric"
        maxLength={6}
        value={pin}
        onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
        onKeyDown={handleKeyDown}
        className="sr-only"
        autoFocus
      />

      {/* Number pad */}
      <div className="mb-6 grid grid-cols-3 gap-3">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, null, 0, 'del'].map((num, i) => (
          <button
            key={i}
            type="button"
            disabled={isVerifying}
            onClick={() => {
              if (num === 'del') {
                setPin((prev) => prev.slice(0, -1));
              } else if (num !== null && pin.length < 6) {
                setPin((prev) => prev + num);
              }
            }}
            className={cn(
              'flex h-14 w-14 items-center justify-center rounded-full text-xl font-medium transition-colors',
              num === null
                ? 'invisible'
                : 'bg-muted hover:bg-muted/80 active:bg-muted/60'
            )}
          >
            {num === 'del' ? '⌫' : num}
          </button>
        ))}
      </div>

      <Button
        onClick={handleSubmit}
        disabled={pin.length !== 6 || isVerifying}
        className="w-full"
      >
        {isVerifying ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Verifying...
          </>
        ) : (
          'Verify'
        )}
      </Button>

      {showMethodSwitch && (
        <MethodSwitchLinks
          currentMethod="pin"
          availableMethods={availableMethods}
          onMethodSelect={onMethodSelect}
        />
      )}
    </div>
  );
}

// --- TOTP View ---

interface TOTPViewProps {
  onSubmit: (code: string) => Promise<void>;
  error: string | null;
  isVerifying: boolean;
  showMethodSwitch: boolean;
  availableMethods: VerificationMethod[];
  onMethodSelect: (method: VerificationMethod) => void;
}

function TOTPView({
  onSubmit,
  error,
  isVerifying,
  showMethodSwitch,
  availableMethods,
  onMethodSelect,
}: TOTPViewProps) {
  const [code, setCode] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async () => {
    if (code.length === 6 && !isVerifying) {
      await onSubmit(code);
      setCode('');
    }
  };

  useEffect(() => {
    if (code.length === 6) {
      handleSubmit();
    }
  }, [code]);

  return (
    <div className="flex flex-col items-center py-4">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-kaviBlue/10">
        <Smartphone className="h-8 w-8 text-kaviBlue" />
      </div>
      <h3 className="mb-2 text-xl font-semibold">Authenticator Code</h3>
      <p className="mb-6 text-center text-sm text-muted-foreground">
        Enter the 6-digit code from your authenticator app
      </p>

      {error && (
        <p className="mb-4 text-center text-sm text-destructive">{error}</p>
      )}

      <input
        ref={inputRef}
        type="text"
        inputMode="numeric"
        maxLength={6}
        value={code}
        onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
        placeholder="000000"
        className="mb-6 w-48 rounded-xl border border-border bg-muted px-4 py-3 text-center text-2xl font-bold tracking-[0.5em] focus:border-kaviBlue focus:outline-none"
        autoFocus
      />

      <Button
        onClick={handleSubmit}
        disabled={code.length !== 6 || isVerifying}
        className="w-full"
      >
        {isVerifying ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Verifying...
          </>
        ) : (
          'Verify'
        )}
      </Button>

      {showMethodSwitch && (
        <MethodSwitchLinks
          currentMethod="totp"
          availableMethods={availableMethods}
          onMethodSelect={onMethodSelect}
        />
      )}
    </div>
  );
}

// --- Email OTP View ---

interface EmailOTPViewProps {
  onSendCode: () => Promise<void>;
  onSubmit: (code: string) => Promise<void>;
  error: string | null;
  codeSent: boolean;
  maskedEmail: string | null;
  isVerifying: boolean;
  showMethodSwitch: boolean;
  availableMethods: VerificationMethod[];
  onMethodSelect: (method: VerificationMethod) => void;
}

function EmailOTPView({
  onSendCode,
  onSubmit,
  error,
  codeSent,
  maskedEmail,
  isVerifying,
  showMethodSwitch,
  availableMethods,
  onMethodSelect,
}: EmailOTPViewProps) {
  const [code, setCode] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const [isSending, setIsSending] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-send on mount
  useEffect(() => {
    if (!codeSent) {
      handleSendCode();
    }
  }, []);

  // Focus input when code is sent
  useEffect(() => {
    if (codeSent) {
      inputRef.current?.focus();
    }
  }, [codeSent]);

  // Cooldown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleSendCode = async () => {
    setIsSending(true);
    try {
      await onSendCode();
      setCooldown(60);
    } finally {
      setIsSending(false);
    }
  };

  const handleSubmit = async () => {
    if (code.length === 6 && !isVerifying) {
      await onSubmit(code);
      setCode('');
    }
  };

  useEffect(() => {
    if (code.length === 6) {
      handleSubmit();
    }
  }, [code]);

  return (
    <div className="flex flex-col items-center py-4">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-kaviBlue/10">
        <Mail className="h-8 w-8 text-kaviBlue" />
      </div>
      <h3 className="mb-2 text-xl font-semibold">Email Verification</h3>
      <p className="mb-6 text-center text-sm text-muted-foreground">
        {codeSent
          ? `Enter the 6-digit code sent to ${maskedEmail || 'your email'}`
          : "We'll send a verification code to your email"}
      </p>

      {error && (
        <p className="mb-4 text-center text-sm text-destructive">{error}</p>
      )}

      {codeSent ? (
        <>
          <input
            ref={inputRef}
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="000000"
            className="mb-4 w-48 rounded-xl border border-border bg-muted px-4 py-3 text-center text-2xl font-bold tracking-[0.5em] focus:border-kaviBlue focus:outline-none"
            autoFocus
          />

          <Button
            onClick={handleSubmit}
            disabled={code.length !== 6 || isVerifying}
            className="mb-4 w-full"
          >
            {isVerifying ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              'Verify'
            )}
          </Button>

          <button
            onClick={handleSendCode}
            disabled={cooldown > 0 || isSending}
            className={cn(
              'text-sm font-medium',
              cooldown > 0 ? 'text-muted-foreground' : 'text-kaviBlue hover:underline'
            )}
          >
            {cooldown > 0 ? `Resend code in ${cooldown}s` : 'Resend code'}
          </button>
        </>
      ) : (
        <Button onClick={handleSendCode} disabled={isSending} className="w-full">
          {isSending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending...
            </>
          ) : (
            'Send Verification Code'
          )}
        </Button>
      )}

      {showMethodSwitch && (
        <MethodSwitchLinks
          currentMethod="email_otp"
          availableMethods={availableMethods}
          onMethodSelect={onMethodSelect}
        />
      )}
    </div>
  );
}

// --- Method Selector ---

interface MethodSelectorProps {
  availableMethods: VerificationMethod[];
  onMethodSelect: (method: VerificationMethod) => void;
}

function MethodSelector({ availableMethods, onMethodSelect }: MethodSelectorProps) {
  return (
    <div className="py-4">
      <h3 className="mb-2 text-center text-xl font-semibold">Verify Your Identity</h3>
      <p className="mb-6 text-center text-sm text-muted-foreground">
        Choose a verification method
      </p>

      <div className="space-y-3">
        {availableMethods.map((method) => {
          const Icon = getMethodIcon(method);
          return (
            <button
              key={method}
              onClick={() => onMethodSelect(method)}
              className="flex w-full items-center gap-4 rounded-xl bg-muted p-4 transition-colors hover:bg-muted/80"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-kaviBlue/10">
                <Icon className="h-5 w-5 text-kaviBlue" />
              </div>
              <span className="font-medium">{METHOD_LABELS[method]}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// --- Method Switch Links ---

interface MethodSwitchLinksProps {
  currentMethod: VerificationMethod;
  availableMethods: VerificationMethod[];
  onMethodSelect: (method: VerificationMethod) => void;
}

function MethodSwitchLinks({
  currentMethod,
  availableMethods,
  onMethodSelect,
}: MethodSwitchLinksProps) {
  const otherMethods = availableMethods.filter((m) => m !== currentMethod);

  if (otherMethods.length === 0) return null;

  return (
    <div className="mt-6 flex flex-col items-center gap-2">
      {otherMethods.map((method) => (
        <button
          key={method}
          onClick={() => onMethodSelect(method)}
          className="text-sm font-medium text-kaviBlue hover:underline"
        >
          Use {METHOD_LABELS[method]} instead
        </button>
      ))}
    </div>
  );
}

export default TransactionVerificationModal;
