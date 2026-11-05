'use client';

import { FormEvent, useState } from 'react';
import { api } from '@/lib/api';

type Status = 'idle' | 'sending' | 'success' | 'error';

export default function ContactForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [feedback, setFeedback] = useState('');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!name.trim() || !email.trim() || !message.trim()) {
      setStatus('error');
      setFeedback('Please fill in your name, email, and message.');
      return;
    }

    setStatus('sending');
    setFeedback('');

    try {
      const response = await api.sendContact({
        name: name.trim(),
        email: email.trim(),
        message: message.trim(),
        honeypot,
      });

      setStatus('success');
      setFeedback(response.data?.message || 'Message sent successfully.');
      setName('');
      setEmail('');
      setMessage('');
    } catch (error) {
      const axiosError = error as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } };
      const firstError = axiosError.response?.data?.errors
        ? Object.values(axiosError.response.data.errors)[0]?.[0]
        : undefined;

      setStatus('error');
      setFeedback(firstError || axiosError.response?.data?.message || 'Message could not be sent. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="text"
        name="honeypot"
        value={honeypot}
        onChange={(event) => setHoneypot(event.target.value)}
        className="hidden"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
      />

      <div>
        <label htmlFor="contact-name" className="block text-sm font-medium mb-1">Name</label>
        <input
          id="contact-name"
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="w-full px-3 py-2 border border-hairline bg-white focus:outline-none focus:border-ink"
          maxLength={255}
          required
        />
      </div>

      <div>
        <label htmlFor="contact-email" className="block text-sm font-medium mb-1">Email</label>
        <input
          id="contact-email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="w-full px-3 py-2 border border-hairline bg-white focus:outline-none focus:border-ink"
          maxLength={255}
          required
        />
      </div>

      <div>
        <label htmlFor="contact-message" className="block text-sm font-medium mb-1">Message</label>
        <textarea
          id="contact-message"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          rows={6}
          className="w-full px-3 py-2 border border-hairline bg-white focus:outline-none focus:border-ink"
          maxLength={10000}
          required
        />
      </div>

      <button
        type="submit"
        disabled={status === 'sending'}
        className="px-6 py-2 bg-ink text-white hover:bg-muted transition-colors disabled:opacity-60"
      >
        {status === 'sending' ? 'Sending...' : 'Send Message'}
      </button>

      {feedback && (
        <p className={`text-sm ${status === 'success' ? 'text-green-700' : 'text-red-600'}`} role="status">
          {feedback}
        </p>
      )}
    </form>
  );
}
