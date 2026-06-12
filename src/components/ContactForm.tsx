import { useState } from 'react';
import type { FormEvent } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, Check } from 'lucide-react';

// Web3Forms access key (public by design). Submissions are emailed to the
// inbox the key is registered to. Can be overridden via a project-root .env
// file with VITE_WEB3FORMS_ACCESS_KEY=xxx.
const WEB3FORMS_ACCESS_KEY: string =
  import.meta.env.VITE_WEB3FORMS_ACCESS_KEY ??
  '439db6d6-089f-4b63-b19e-d3ccfd1e4824';

const REVENUE_OPTIONS = [
  'Under $1M',
  '$1M to $10M',
  '$10M to $50M',
  '$50M to $250M',
  '$250M+',
  'Prefer not to say',
];

const FIELD_CLASS =
  'w-full rounded-lg border border-white/15 bg-white/5 px-4 py-3 text-white placeholder-white/30 outline-none transition focus:border-white/40 focus:ring-1 focus:ring-white/30';

const LABEL_CLASS = 'mb-1.5 block text-sm text-white/80';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const INITIAL_FIELDS = {
  name: '',
  email: '',
  role: '',
  company: '',
  revenue: '',
  message: '',
};

export default function ContactForm() {
  const [fields, setFields] = useState(INITIAL_FIELDS);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const setField = (key: keyof typeof INITIAL_FIELDS, value: string) => {
    setFields((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!fields.name.trim()) {
      setError('Please enter your name so we know who to reach.');
      return;
    }
    if (!EMAIL_RE.test(fields.email.trim())) {
      setError('Please enter a valid work email address.');
      return;
    }
    if (!WEB3FORMS_ACCESS_KEY) {
      setError(
        'The form is not connected yet. Please email us directly at info@shiftora.ai.'
      );
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          access_key: WEB3FORMS_ACCESS_KEY,
          subject: `New Shiftora inquiry from ${fields.name}${
            fields.company.trim() ? ` (${fields.company.trim()})` : ''
          }`,
          from_name: 'Shiftora Website',
          replyto: fields.email,
          ...fields,
        }),
      });
      const data = await res.json().catch(() => null);
      if (res.ok && data?.success) {
        setSubmitted(true);
      } else {
        setError(
          'Something went wrong sending your details. Please try again, or email info@shiftora.ai directly.'
        );
      }
    } catch {
      setError(
        'We could not reach the server. Please check your connection and try again, or email info@shiftora.ai.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFields(INITIAL_FIELDS);
    setError(null);
    setSubmitted(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
      className="mx-auto max-w-2xl rounded-2xl bg-black p-6 text-white ring-1 ring-white/10 sm:p-8"
    >
      {submitted ? (
        <div className="flex flex-col items-center py-12 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-white/5">
            <Check size={20} />
          </span>
          <p className="mt-5 text-lg font-semibold">
            Thanks, your details are on their way.
          </p>
          <p className="mt-1 text-sm text-white/55">
            We'll reach out from info@shiftora.ai within one business day.
          </p>
          <button
            type="button"
            onClick={resetForm}
            className="mt-6 text-sm text-white/70 underline underline-offset-4 transition-colors hover:text-white"
          >
            Send another
          </button>
        </div>
      ) : (
        <>
          <h3 className="text-lg font-semibold">
            Shiftora · Project Inquiry
          </h3>
          <p className="mt-1 text-sm text-white/55">
            Share a few details and the right person on our team will reach out
            within one business day.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-5" noValidate>
            {error && (
              <div className="rounded border border-white/20 px-4 py-3 text-sm text-white/90">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="contact-name" className={LABEL_CLASS}>
                Your Name
              </label>
              <input
                id="contact-name"
                type="text"
                required
                value={fields.name}
                onChange={(e) => setField('name', e.target.value)}
                placeholder="Jane Doe"
                className={FIELD_CLASS}
              />
            </div>

            <div>
              <label htmlFor="contact-email" className={LABEL_CLASS}>
                Work Email
              </label>
              <input
                id="contact-email"
                type="email"
                required
                value={fields.email}
                onChange={(e) => setField('email', e.target.value)}
                placeholder="you@company.com"
                className={FIELD_CLASS}
              />
            </div>

            <div>
              <label htmlFor="contact-role" className={LABEL_CLASS}>
                Your Role
              </label>
              <input
                id="contact-role"
                type="text"
                value={fields.role}
                onChange={(e) => setField('role', e.target.value)}
                placeholder="Head of Operations"
                className={FIELD_CLASS}
              />
            </div>

            <div>
              <label htmlFor="contact-company" className={LABEL_CLASS}>
                Company Name
              </label>
              <input
                id="contact-company"
                type="text"
                value={fields.company}
                onChange={(e) => setField('company', e.target.value)}
                placeholder="Acme Inc."
                className={FIELD_CLASS}
              />
            </div>

            <div>
              <label htmlFor="contact-revenue" className={LABEL_CLASS}>
                Company Annual Revenue
              </label>
              <select
                id="contact-revenue"
                value={fields.revenue}
                onChange={(e) => setField('revenue', e.target.value)}
                className={`${FIELD_CLASS} appearance-none ${
                  fields.revenue ? '' : 'text-white/30'
                }`}
              >
                <option value="" disabled className="bg-black text-white/50">
                  Select a range
                </option>
                {REVENUE_OPTIONS.map((option) => (
                  <option
                    key={option}
                    value={option}
                    className="bg-black text-white"
                  >
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="contact-message" className={LABEL_CLASS}>
                What do you want to build?
              </label>
              <textarea
                id="contact-message"
                rows={4}
                value={fields.message}
                onChange={(e) => setField('message', e.target.value)}
                placeholder="Briefly, the workflow or outcome you have in mind."
                className={`${FIELD_CLASS} resize-none`}
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition-opacity duration-300 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? 'Sending...' : 'Send details'}
              <ArrowUpRight size={16} />
            </button>
          </form>
        </>
      )}
    </motion.div>
  );
}
