'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '@/lib/api';

const settingsSchema = z.object({
  journalist_name: z.string().max(255).optional(),
  positioning_line: z.string().max(255).optional(),
  bio: z.string().optional(),
  social_links: z.array(z.string().url()).optional().default([]),
  contact_details: z.record(z.string(), z.string()).optional().default({}),
  newsletter_copy: z.string().optional(),
  newsletter_consent_version: z.string().max(20).optional(),
});

type SettingsForm = z.infer<typeof settingsSchema>;

const defaultSocialLinks = [
  { platform: 'Twitter', url: '', icon: '𝕏' },
  { platform: 'LinkedIn', url: '', icon: 'in' },
  { platform: 'Email', url: '', icon: '✉' },
  { platform: 'Signal', url: '', icon: '🔒' },
];

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SettingsForm>({
    resolver: zodResolver(settingsSchema) as any,
    defaultValues: {
      journalist_name: '',
      positioning_line: '',
      bio: '',
      social_links: defaultSocialLinks.map(l => l.url),
      contact_details: {},
      newsletter_copy: '',
      newsletter_consent_version: '1.0',
    },
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await api.adminGetSettings();
      const settings = response.data;

      if (settings.journalist_name) setValue('journalist_name', settings.journalist_name);
      if (settings.positioning_line) setValue('positioning_line', settings.positioning_line);
      if (settings.bio) setValue('bio', settings.bio);
      if (settings.social_links) {
        const urls = settings.social_links.map((s: any) => s.url || '');
        setValue('social_links', urls);
      }
      if (settings.newsletter_copy) setValue('newsletter_copy', settings.newsletter_copy);
      if (settings.newsletter_consent_version) setValue('newsletter_consent_version', settings.newsletter_consent_version);
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: any) => {
    setSaving(true);
    setMessage(null);
    try {
      await api.adminUpdateSettings(data);
      setMessage({ type: 'success', text: 'Settings saved successfully.' });
    } catch (error) {
      console.error('Failed to save settings:', error);
      setMessage({ type: 'error', text: 'Failed to save settings. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const socialLinks = watch('social_links') || [];

  if (loading) {
    return <div className="p-8 text-center text-muted">Loading...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted mt-1">Configure site-wide settings and journalist profile.</p>
      </div>

      {message && (
        <div className={`p-4 border ${message.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Journalist Identity */}
        <section className="card p-6 space-y-6">
          <h2 className="text-xl font-bold border-b border-hairline pb-3">Journalist Identity</h2>

          <div>
            <label htmlFor="journalist_name" className="label">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              id="journalist_name"
              type="text"
              {...register('journalist_name')}
              className="input"
              placeholder="Full name as it should appear on the site"
            />
            {errors.journalist_name && <p className="text-red-600 text-sm mt-1">{errors.journalist_name.message}</p>}
          </div>

          <div>
            <label htmlFor="positioning_line" className="label">
              Positioning Line
            </label>
            <input
              id="positioning_line"
              type="text"
              {...register('positioning_line')}
              className="input"
              placeholder="One-line professional description (e.g., 'Investigative journalist covering environment and labor in Bangladesh')"
            />
            {errors.positioning_line && <p className="text-red-600 text-sm mt-1">{errors.positioning_line.message}</p>}
          </div>

          <div>
            <label htmlFor="bio" className="label">Bio</label>
            <textarea
              id="bio"
              {...register('bio')}
              className="input min-h-[120px] font-serif"
              placeholder="A short biography for the About section..."
            />
          </div>
        </section>

        {/* Social Links */}
        <section className="card p-6 space-y-6">
          <h2 className="text-xl font-bold border-b border-hairline pb-3">Social & Contact Links</h2>
          <p className="text-sm text-muted">These appear in the footer and contact section.</p>

          <div className="space-y-4">
            {defaultSocialLinks.map((link, index) => (
              <div key={link.platform} className="flex items-center gap-4">
                <span className="font-mono text-lg w-10 text-center">{link.icon}</span>
                <label className="label w-24 mb-0">{link.platform}</label>
                <input
                  type="url"
                  {...register(`social_links.${index}`)}
                  className="input flex-1"
                  placeholder={`https://${link.platform.toLowerCase()}.com/...`}
                />
              </div>
            ))}
          </div>
        </section>

        {/* Newsletter */}
        <section className="card p-6 space-y-6">
          <h2 className="text-xl font-bold border-b border-hairline pb-3">Newsletter</h2>

          <div>
            <label htmlFor="newsletter_copy" className="label">Signup Copy</label>
            <textarea
              id="newsletter_copy"
              {...register('newsletter_copy')}
              className="input min-h-[100px] font-serif"
              placeholder="Text shown on the newsletter signup form..."
            />
          </div>

          <div>
            <label htmlFor="newsletter_consent_version" className="label">Consent Text Version</label>
            <input
              id="newsletter_consent_version"
              type="text"
              {...register('newsletter_consent_version')}
              className="input w-48"
              placeholder="1.0"
            />
            <p className="text-sm text-muted mt-1">Increment when consent text changes to track what subscribers agreed to.</p>
          </div>
        </section>

        {/* SEO & Site */}
        <section className="card p-6 space-y-6">
          <h2 className="text-xl font-bold border-b border-hairline pb-3">Site Configuration</h2>

          <div>
            <label htmlFor="contact_details" className="label">Contact Details (JSON)</label>
            <textarea
              id="contact_details"
              {...register('contact_details')}
              className="input min-h-[100px] font-mono text-sm"
              placeholder='{"email": "hello@example.com", "address": "Dhaka, Bangladesh"}'
            />
            <p className="text-sm text-muted mt-1">Additional contact information for the contact page.</p>
          </div>
        </section>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4">
          <button type="button" onClick={loadSettings} className="btn btn-secondary">
            Reload
          </button>
          <button type="submit" disabled={saving} className="btn btn-primary">
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}