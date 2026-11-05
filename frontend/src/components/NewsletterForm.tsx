'use client';

import { FormEvent, useState } from 'react';
import { api } from '@/lib/api';

type Status = 'idle' | 'sending' | 'success' | 'error';

export default function NewsletterForm({ buttonLabel = 'Subscribe' }: { buttonLabel?: string }) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email.trim()) {
      setStatus('error');
      setMessage('Enter your email address.');
      return;
    }

    setStatus('sending');
    setMessage('');

    try {
      await api.subscribeNewsletter(email.trim(), 'website');
      setStatus('success');
      setMessage('Check your inbox to confirm your subscription.');
      setEmail('');
    } catch (error) {
      const axiosError = error as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } };
      const firstError = axiosError.response?.data?.errors
        ? Object.values(axiosError.response.data.errors)[0]?.[0]
        : undefined;

      setStatus('error');
      setMessage(firstError || axiosError.response?.data?.message || 'Subscription failed. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <div className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="your@email.com"
          className="flex-1 px-4 py-2 border border-hairline bg-white focus:outline-none focus:border-ink"
          disabled={status === 'sending'}
          required
        />
        <button
          type="submit"
          disabled={status === 'sending'}
          className="px-4 py-2 bg-ink text-white hover:bg-muted transition-colors disabled:opacity-60"
        >
          {status === 'sending' ? 'Sending...' : buttonLabel}
        </button>
      </div>
      {message && (
        <p className={`text-sm ${status === 'success' ? 'text-green-700' : 'text-red-600'}`} role="status">
          {message}
        </p>
      )}
    </form>
  );
}
