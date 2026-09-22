'use client'

import { useState } from 'react'
import Header from '@/components/common/Header'
import DesktopSidebar from '@/components/common/DesktopSidebar'
import RightSidebar from '@/components/common/RightSidebar'
import MobileBottomNavigation from '@/components/common/MobileBottomNavigation'

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !email || !message) return
    setSubmitted(true)
  }

  return (
    <div className="min-h-screen flex flex-col bg-surface text-on-surface pb-20 md:pb-6">
      <Header />

      <div className="flex-1 max-w-[1440px] w-full mx-auto px-2 md:px-4 py-4 flex gap-4">
        <DesktopSidebar />

        <main className="flex-1 min-w-0 space-y-4">
          <div className="bg-surface-container rounded-xl border border-surface-bright p-6 space-y-4">
            <h1 className="text-headline-xl text-on-surface font-extrabold">Contact Us</h1>
            <p className="text-body-sm text-on-surface-variant">
              Have feedback, partnership inquiries, or feature requests? Send us a message below.
            </p>

            {submitted ? (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400 text-body-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-xl">check_circle</span>
                <span>Thank you! Your message has been sent successfully. We will get back to you shortly.</span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full bg-surface-container-high border border-surface-bright rounded-lg px-3 py-2 text-body-sm text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john@example.com"
                    className="w-full bg-surface-container-high border border-surface-bright rounded-lg px-3 py-2 text-body-sm text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">
                    Message
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Write your message here..."
                    className="w-full bg-surface-container-high border border-surface-bright rounded-lg px-3 py-2 text-body-sm text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>

                <button
                  type="submit"
                  className="px-5 py-2.5 bg-primary text-on-primary font-bold text-body-sm rounded-lg hover:bg-primary-container transition-colors shadow"
                >
                  Send Message
                </button>
              </form>
            )}
          </div>
        </main>

        <RightSidebar />
      </div>

      <MobileBottomNavigation />
    </div>
  )
}
