import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, User, LogIn, UserPlus, Gift } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { AuthInput } from '@/components/auth/AuthInput';

// Schemas
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  referralCode: z.string().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

// Login Form Component
function LoginForm({ onSwitchTab }: { onSwitchTab: (email?: string) => void }) {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setError(null);
      await login(data.email, data.password);
      navigate('/dashboard');
    } catch {
      setError('Invalid email or password');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-1">
      {error && (
        <div className="mb-4 rounded-xl bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <AuthInput
        label="Email Address"
        type="email"
        placeholder="Enter your email"
        icon={Mail}
        error={errors.email?.message}
        {...register('email')}
      />

      <AuthInput
        label="Password"
        type="password"
        placeholder="Enter your password"
        icon={Lock}
        error={errors.password?.message}
        {...register('password')}
      />

      <div className="flex justify-end pt-2">
        <Link
          to="/auth/forgot-password"
          className="text-sm font-medium text-kaviBlue hover:underline"
        >
          Forgot Password?
        </Link>
      </div>

      <div className="pt-4">
        <Button
          type="submit"
          size="lg"
          className="h-[52px] w-full gap-2 rounded-xl text-base font-semibold shadow-lg shadow-kaviBlue/20"
          disabled={isSubmitting}
        >
          {!isSubmitting && <LogIn className="h-5 w-5" />}
          {isSubmitting ? 'Signing In...' : 'Sign In'}
        </Button>
      </div>
    </form>
  );
}

// Register Form Component
function RegisterForm({
  onSwitchTab,
}: {
  onSwitchTab: (email?: string) => void;
}) {
  const navigate = useNavigate();
  const { register: registerUser } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setError(null);
      await registerUser({
        name: data.name,
        email: data.email,
        password: data.password,
        referralCode: data.referralCode,
      });
      navigate('/dashboard');
    } catch (err: unknown) {
      if (
        err &&
        typeof err === 'object' &&
        'code' in err &&
        err.code === 'auth/email-already-in-use'
      ) {
        setError(
          'This email is already registered. Please sign in instead.'
        );
      } else {
        setError('Failed to create account. Please try again.');
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-1">
      {error && (
        <div className="mb-4 rounded-xl bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <AuthInput
        label="Full Name"
        type="text"
        placeholder="Enter your full name"
        icon={User}
        autoCapitalize="words"
        error={errors.name?.message}
        {...register('name')}
      />

      <AuthInput
        label="Email Address"
        type="email"
        placeholder="Enter your email"
        icon={Mail}
        error={errors.email?.message}
        {...register('email')}
      />

      <AuthInput
        label="Password"
        type="password"
        placeholder="Create a secure password"
        icon={Lock}
        error={errors.password?.message}
        {...register('password')}
      />

      <AuthInput
        label="Upline ID (Optional)"
        type="text"
        placeholder="Enter upline ID"
        icon={Gift}
        autoCapitalize="characters"
        error={errors.referralCode?.message}
        {...register('referralCode')}
      />

      <div className="pt-4">
        <Button
          type="submit"
          size="lg"
          className="h-[52px] w-full gap-2 rounded-xl bg-emerald-500 text-base font-semibold shadow-lg shadow-emerald-500/20 hover:bg-emerald-500/90"
          disabled={isSubmitting}
        >
          {!isSubmitting && <UserPlus className="h-5 w-5" />}
          {isSubmitting ? 'Creating Account...' : 'Create Account'}
        </Button>
      </div>
    </form>
  );
}

// Main Auth Page
export function AuthPage() {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') === 'register' ? 'register' : 'login';
  const [activeTab, setActiveTab] = useState<'login' | 'register'>(initialTab);

  const handleSwitchToLogin = (email?: string) => {
    setActiveTab('login');
    // Could prefill email if needed
  };

  const handleSwitchToRegister = () => {
    setActiveTab('register');
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-[28px] font-bold text-white">Welcome</h1>
        <p className="text-[15px] text-muted-foreground">
          {activeTab === 'login'
            ? 'Sign in to access your account'
            : 'Create your account to get started'}
        </p>
      </div>

      {/* Tab Selector */}
      <div className="mb-6 flex rounded-2xl bg-kaviCard p-1.5">
        <button
          type="button"
          onClick={() => setActiveTab('login')}
          className={`flex-1 rounded-xl py-3 text-base font-semibold transition-all duration-200 ${
            activeTab === 'login'
              ? 'bg-kaviNavy text-white shadow-lg'
              : 'text-muted-foreground hover:text-white'
          }`}
        >
          Login
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('register')}
          className={`flex-1 rounded-xl py-3 text-base font-semibold transition-all duration-200 ${
            activeTab === 'register'
              ? 'bg-kaviNavy text-white shadow-lg'
              : 'text-muted-foreground hover:text-white'
          }`}
        >
          Register
        </button>
      </div>

      {/* Form Container */}
      <div className="rounded-3xl border border-white/5 bg-kaviCard p-5 sm:p-6">
        {activeTab === 'login' ? (
          <LoginForm onSwitchTab={handleSwitchToRegister} />
        ) : (
          <RegisterForm onSwitchTab={handleSwitchToLogin} />
        )}
      </div>

      {/* Footer */}
      <div className="mt-6 text-center">
        <p className="text-sm leading-relaxed text-muted-foreground">
          By continuing, you agree to our{' '}
          <a
            href="https://ploutoslabs.io/terms"
            target="_blank"
            rel="noopener noreferrer"
            className="text-kaviBlue underline hover:text-kaviBlue/80"
          >
            Terms of Service
          </a>{' '}
          and{' '}
          <a
            href="https://ploutoslabs.io/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="text-kaviBlue underline hover:text-kaviBlue/80"
          >
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  );
}
