'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { api } from '@/lib/api';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  two_factor_code: z.string().length(6).optional().or(z.literal('')),
  remember: z.boolean().optional(),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/admin';
  const [step, setStep] = useState<'login' | '2fa'>('login');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { remember: true },
  });

  const twoFactorCode = watch('two_factor_code');

  const onSubmit = async (data: LoginForm) => {
    setError(null);
    setIsLoading(true);

    try {
      if (step === 'login') {
        const response = await api.login(data.email, data.password, data.two_factor_code || undefined, data.remember);

        if (response.data.two_factor_required) {
          setStep('2fa');
          setValue('two_factor_code', '');
          return;
        }

        router.push(callbackUrl);
        router.refresh();
      } else if (step === '2fa') {
        const response = await api.login(data.email, data.password, data.two_factor_code, data.remember);
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (err: any) {
      if (err.response?.status === 428) {
        // 2FA required
        setStep('2fa');
        setValue('two_factor_code', '');
      } else {
        setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="text-3xl font-bold text-ink">
            ProDo Reporter
          </Link>
          <p className="text-muted mt-2">Admin Dashboard</p>
        </div>

        <div className="card p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {step === 'login' && (
              <>
                <div>
                  <label htmlFor="email" className="label">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    {...register('email')}
                    className="input"
                    disabled={isLoading}
                  />
                  {errors.email && (
                    <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="password" className="label">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    {...register('password')}
                    className="input"
                    disabled={isLoading}
                  />
                  {errors.password && (
                    <p className="text-red-600 text-sm mt-1">{errors.password.message}</p>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      {...register('remember')}
                      className="w-4 h-4 border-hairline rounded-none text-accent focus:ring-accent"
                    />
                    Remember me
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn btn-primary w-full py-3"
                >
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </button>
              </>
            )}

            {step === '2fa' && (
              <>
                <div className="text-center mb-4">
                  <p className="text-muted">
                    Enter the 6-digit code from your authenticator app
                  </p>
                  <p className="text-sm text-muted mt-2">
                    Or use a recovery code
                  </p>
                </div>

                <div>
                  <label htmlFor="two_factor_code" className="label">
                    Two-Factor Code
                  </label>
                  <input
                    id="two_factor_code"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    autoComplete="one-time-code"
                    {...register('two_factor_code')}
                    className="input text-center text-2xl tracking-widest font-mono"
                    disabled={isLoading}
                    required
                  />
                  {errors.two_factor_code && (
                    <p className="text-red-600 text-sm mt-1">{errors.two_factor_code.message}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !twoFactorCode || twoFactorCode.length !== 6}
                  className="btn btn-primary w-full py-3"
                >
                  {isLoading ? 'Verifying...' : 'Verify'}
                </button>

                <button
                  type="button"
                  onClick={() => setStep('login')}
                  disabled={isLoading}
                  className="btn btn-secondary w-full py-2 mt-2"
                >
                  Back to login
                </button>
              </>
            )}
          </form>
        </div>

        <p className="text-center text-sm text-muted mt-6">
          <Link href="/" className="text-accent hover:underline">← Back to site</Link>
        </p>
      </div>
    </div>
  );
}