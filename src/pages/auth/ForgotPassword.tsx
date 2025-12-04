import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Mail, Send } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { AuthInput } from '@/components/auth/AuthInput';

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;

export function ForgotPassword() {
  const { resetPassword } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordForm) => {
    try {
      setError(null);
      await resetPassword(data.email);
      setSuccess(true);
    } catch {
      setError('Failed to send reset email. Please try again.');
    }
  };

  if (success) {
    return (
      <div className="w-full">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-kaviBlue/20">
            <Mail className="h-8 w-8 text-kaviBlue" />
          </div>
          <h1 className="mb-2 text-[28px] font-bold text-white">
            Check your email
          </h1>
          <p className="text-[15px] text-muted-foreground">
            We've sent a password reset link to your email address.
          </p>
        </div>

        {/* Card */}
        <div className="rounded-3xl border border-white/5 bg-kaviCard p-5 sm:p-6">
          <Link to="/auth/login">
            <Button
              variant="outline"
              size="lg"
              className="h-[52px] w-full gap-2 rounded-xl text-base font-semibold"
            >
              <ArrowLeft className="h-5 w-5" />
              Back to sign in
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-[28px] font-bold text-white">
          Reset password
        </h1>
        <p className="text-[15px] text-muted-foreground">
          Enter your email and we'll send you a reset link.
        </p>
      </div>

      {/* Card */}
      <div className="rounded-3xl border border-white/5 bg-kaviCard p-5 sm:p-6">
        <Link
          to="/auth/login"
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to sign in
        </Link>

        {error && (
          <div className="mb-4 rounded-xl bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-1">
          <AuthInput
            label="Email Address"
            type="email"
            placeholder="Enter your email"
            icon={Mail}
            error={errors.email?.message}
            {...register('email')}
          />

          <div className="pt-4">
            <Button
              type="submit"
              size="lg"
              className="h-[52px] w-full gap-2 rounded-xl text-base font-semibold shadow-lg shadow-kaviBlue/20"
              disabled={isSubmitting}
            >
              {!isSubmitting && <Send className="h-5 w-5" />}
              {isSubmitting ? 'Sending...' : 'Send reset link'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
