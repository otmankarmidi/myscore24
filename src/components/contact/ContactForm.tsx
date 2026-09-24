'use client'

import { useState } from 'react'

const ENQUIRY_SUBJECTS = [
  'General Enquiry',
  'Editorial Correction',
  'Technical Issue',
  'Copyright Enquiry',
  'Business & Partnership',
]

export default function ContactForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState(ENQUIRY_SUBJECTS[0])
  const [message, setMessage] = useState('')
  const [honeypot, setHoneypot] = useState('') // spam trap
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !email.trim() || !message.trim()) return

    setStatus('submitting')
    setErrorMessage(null)

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          subject: subject.trim(),
          message: message.trim(),
          website_hp: honeypot,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit form.')
      }

      setStatus('success')
      setName('')
      setEmail('')
      setMessage('')
    } catch (err: any) {
      setStatus('error')
      setErrorMessage(err.message || 'An error occurred while sending your message.')
    }
  }

  return (
    <div className="bg-surface-container rounded-xl border border-surface-bright p-6 md:p-8 space-y-6 shadow-sm">
      <div className="space-y-1">
        <h2 className="text-xl font-bold font-geist text-on-surface">Send a Message</h2>
        <p className="text-xs text-on-surface-variant">
          Complete the form below or write directly to{' '}
          <a
            href="mailto:contact@myscore24.com"
            className="text-primary underline hover:text-primary-container font-mono font-medium"
          >
            contact@myscore24.com
          </a>
          .
        </p>
      </div>

      {status === 'success' ? (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400 text-sm space-y-2 animate-fade-in">
          <div className="flex items-center gap-2 font-bold">
            <span className="material-symbols-outlined text-lg">check_circle</span>
            <span>Thank you! Your message has been received.</span>
          </div>
          <p className="text-xs text-emerald-400/90 leading-relaxed">
            Our team reviews all inquiries and will respond to your email address within 24 to 48 business hours.
          </p>
          <button
            type="button"
            onClick={() => setStatus('idle')}
            className="mt-2 text-xs font-semibold underline hover:no-underline text-emerald-300"
          >
            Send another message
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {status === 'error' && errorMessage && (
            <div className="p-3 bg-error-container/20 border border-error text-error text-xs rounded-lg flex items-center gap-2">
              <span className="material-symbols-outlined text-base">error</span>
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Honeypot field (hidden from legitimate users) */}
          <div className="hidden" aria-hidden="true">
            <label htmlFor="website_hp">Leave this empty</label>
            <input
              id="website_hp"
              type="text"
              name="website_hp"
              tabIndex={-1}
              autoComplete="off"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="contact-name"
                className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1"
              >
                Your Name <span className="text-error">*</span>
              </label>
              <input
                id="contact-name"
                type="text"
                required
                minLength={2}
                maxLength={100}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex Morgan"
                disabled={status === 'submitting'}
                className="w-full bg-surface-container-high border border-surface-bright rounded-lg px-3 py-2 text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary disabled:opacity-60"
              />
            </div>

            <div>
              <label
                htmlFor="contact-email"
                className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1"
              >
                Email Address <span className="text-error">*</span>
              </label>
              <input
                id="contact-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex@example.com"
                disabled={status === 'submitting'}
                className="w-full bg-surface-container-high border border-surface-bright rounded-lg px-3 py-2 text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary disabled:opacity-60"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="contact-subject"
              className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1"
            >
              Enquiry Type / Subject <span className="text-error">*</span>
            </label>
            <select
              id="contact-subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              disabled={status === 'submitting'}
              className="w-full bg-surface-container-high border border-surface-bright rounded-lg px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary disabled:opacity-60 cursor-pointer"
            >
              {ENQUIRY_SUBJECTS.map((s) => (
                <option key={s} value={s} className="bg-surface text-on-surface">
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="contact-message"
              className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1"
            >
              Message Details <span className="text-error">*</span>
            </label>
            <textarea
              id="contact-message"
              required
              rows={5}
              minLength={10}
              maxLength={3000}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Please provide complete details, including page URLs or reference sources where applicable..."
              disabled={status === 'submitting'}
              className="w-full bg-surface-container-high border border-surface-bright rounded-lg px-3 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary disabled:opacity-60 leading-relaxed"
            />
            <div className="flex justify-between items-center text-[11px] text-on-surface-variant/60 mt-1">
              <span>Minimum 10 characters</span>
              <span>{message.length} / 3000</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={status === 'submitting'}
            className="w-full sm:w-auto px-6 py-2.5 bg-primary text-on-primary font-bold text-xs uppercase tracking-wider rounded-lg hover:bg-primary-container transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
          >
            {status === 'submitting' ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-on-primary border-t-transparent rounded-full animate-spin" />
                <span>Sending...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-base">send</span>
                <span>Send Message</span>
              </>
            )}
          </button>
        </form>
      )}
    </div>
  )
}
