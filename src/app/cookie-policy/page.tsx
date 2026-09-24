import type { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/components/common/Header'
import CookieSettingsButton from '@/components/common/CookieSettingsButton'
import CookieSettingsTrigger from '@/components/common/CookieSettingsTrigger'

export const metadata: Metadata = {
  title: 'Cookie Policy | MyScore24',
  description:
    'Detailed disclosure of cookies, local storage technologies, Google Analytics consent, and advertising identifiers used on MyScore24.',
  alternates: {
    canonical: 'https://myscore24.com/cookie-policy',
  },
  openGraph: {
    title: 'Cookie Policy | MyScore24',
    description:
      'Understand how MyScore24 uses cookies, local storage, and tracking technologies, and manage your consent preferences.',
    url: 'https://myscore24.com/cookie-policy',
    siteName: 'MyScore24',
    type: 'website',
  },
}

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-surface text-on-surface">
      <Header />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 md:py-12 space-y-8">
        {/* Header */}
        <header className="space-y-3 pb-6 border-b border-surface-bright">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-primary/10 text-primary font-mono text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            Cookie Transparency
          </div>
          <h1 className="text-2xl md:text-4xl font-extrabold font-geist text-on-surface tracking-tight">
            Cookie Policy
          </h1>
          <p className="text-xs md:text-sm text-on-surface-variant font-mono">
            Last Updated: September 24, 2026
          </p>
          <p className="text-sm md:text-base text-on-surface-variant leading-relaxed">
            This Cookie Policy explains what cookies and similar tracking technologies are, how MyScore24 uses them, and how you can manage your preferences at any time.
          </p>
        </header>

        {/* Permanent Cookie Settings Trigger Card */}
        <section className="bg-gradient-to-r from-surface-container to-surface-container-high rounded-xl border border-primary/20 p-6 md:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
          <div className="space-y-1">
            <h2 className="text-lg font-bold font-geist text-on-surface">Manage Your Cookie Preferences</h2>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              You can review, modify, or withdraw your consent for optional analytics and performance cookies at any time.
            </p>
          </div>
          <CookieSettingsButton label="Open Cookie Settings" />
        </section>

        {/* 1. What Are Cookies? */}
        <section className="bg-surface-container rounded-xl border border-surface-bright p-6 md:p-8 space-y-3 shadow-sm">
          <h2 className="text-lg md:text-xl font-bold font-geist text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">info</span>
            <span>1. What Are Cookies and Similar Technologies?</span>
          </h2>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            Cookies are small text files placed on your device (computer, smartphone, or tablet) by websites you visit. They are widely used to make websites work efficiently, provide secure browsing, and deliver reporting data to site operators.
          </p>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            In addition to HTTP cookies, MyScore24 utilizes modern browser storage technologies, primarily HTML5 <strong className="text-on-surface">localStorage</strong>. Local storage allows us to store user preferences client-side directly on your device without transmitting unnecessary tracking data in every server request header.
          </p>
        </section>

        {/* 2. Categories of Technologies Used */}
        <section className="bg-surface-container rounded-xl border border-surface-bright p-6 md:p-8 space-y-4 shadow-sm">
          <h2 className="text-lg md:text-xl font-bold font-geist text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">category</span>
            <span>2. Categories of Cookies & Local Storage</span>
          </h2>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            We classify the technologies used on MyScore24 into four distinct categories:
          </p>

          <div className="space-y-4 pt-2">
            {/* Category 1: Necessary */}
            <div className="bg-surface-container-high/60 rounded-xl border border-surface-bright/60 p-5 space-y-2">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2 text-primary font-bold text-sm">
                  <span className="material-symbols-outlined text-lg">lock</span>
                  <span className="text-on-surface">A. Strictly Necessary (Always Active)</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-surface-bright text-on-surface">
                  Essential
                </span>
              </div>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                These technologies are essential for the operation of MyScore24. They enable core functions such as server load balancing, security protections, rate limiting against DDoS attacks, and preserving your cookie banner consent decisions. The website cannot function correctly without these items.
              </p>
              <div className="pt-1 text-[11px] text-on-surface-variant/80 font-mono">
                Key Examples: <code className="text-primary">myscore24_cookie_consent</code> (stores your consent choice).
              </div>
            </div>

            {/* Category 2: Preferences */}
            <div className="bg-surface-container-high/60 rounded-xl border border-surface-bright/60 p-5 space-y-2">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2 text-primary font-bold text-sm">
                  <span className="material-symbols-outlined text-lg">tune</span>
                  <span className="text-on-surface">B. Preference & Functionality Technologies</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-surface-bright text-on-surface">
                  Functional
                </span>
              </div>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                These client-side entries allow MyScore24 to remember choices you make and provide personalized, enhanced features across your visits:
              </p>
              <ul className="list-disc list-inside text-xs text-on-surface-variant space-y-1 pl-1">
                <li><code className="text-primary font-mono">myscore24_theme</code>: Remembers your Dark mode or Light mode interface selection.</li>
                <li><code className="text-primary font-mono">myscore24_locale</code>: Remembers your selected language (English, French, or Arabic) and layout direction.</li>
                <li><code className="text-primary font-mono">myscore24_timezone_preference</code>: Remembers your preferred kickoff timezone offset.</li>
                <li><code className="text-primary font-mono">myscore24_favorites_*</code>: Stores your pinned favorite teams, leagues, and live score alerts locally on your device.</li>
              </ul>
            </div>

            {/* Category 3: Analytics */}
            <div className="bg-surface-container-high/60 rounded-xl border border-surface-bright/60 p-5 space-y-2">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2 text-primary font-bold text-sm">
                  <span className="material-symbols-outlined text-lg">analytics</span>
                  <span className="text-on-surface">C. Analytics & Performance Cookies (Optional)</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-primary/20 text-primary">
                  Consent Required
                </span>
              </div>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                We use Google Analytics 4 (Measurement ID: <code className="font-mono text-primary">G-L96Q86DFG3</code>) to understand how visitors find and interact with our football match pages, identify navigation bottlenecks, and improve site speed.
              </p>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                <strong className="text-on-surface">Strict Consent Enforcement:</strong> Google Analytics scripts are loaded only after consent has been verified. If you select &ldquo;Essential Only&rdquo;, Google Analytics is not executed, and its cookies (<code className="font-mono text-primary">_ga</code>, <code className="font-mono text-primary">_ga_*</code>) are never placed.
              </p>
            </div>

            {/* Category 4: Advertising */}
            <div className="bg-surface-container-high/60 rounded-xl border border-surface-bright/60 p-5 space-y-2">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2 text-primary font-bold text-sm">
                  <span className="material-symbols-outlined text-lg">campaign</span>
                  <span className="text-on-surface">D. Advertising & Marketing Technologies</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-surface-bright text-on-surface">
                  Third-Party / Optional
                </span>
              </div>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                MyScore24 may display advertisements served through Google AdSense and accredited digital advertising partners. Third-party ad vendors, including Google, use cookies and web beacons to serve ads based on prior visits to our platform and other sites.
              </p>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                For visitors residing in the European Economic Area (EEA), United Kingdom, and Switzerland, Google&rsquo;s EU User Consent Policy requires explicit consent for personalized advertising and ad measurement. When active, personalized ad delivery is governed by Google-certified consent standards.
              </p>
            </div>
          </div>
        </section>

        {/* 3. Managing Cookies in Your Browser */}
        <section className="bg-surface-container rounded-xl border border-surface-bright p-6 md:p-8 space-y-3 shadow-sm">
          <h2 className="text-lg md:text-xl font-bold font-geist text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">settings</span>
            <span>3. How to Manage Cookies in Your Browser</span>
          </h2>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            In addition to our on-site <CookieSettingsTrigger>Cookie Settings</CookieSettingsTrigger>, most web browsers allow you to control or clear cookies through their settings:
          </p>
          <ul className="list-disc list-inside space-y-1 text-xs sm:text-sm text-on-surface-variant leading-relaxed pl-1">
            <li><strong>Google Chrome:</strong> Settings &gt; Privacy and security &gt; Third-party cookies.</li>
            <li><strong>Mozilla Firefox:</strong> Settings &gt; Privacy &amp; Security &gt; Enhanced Tracking Protection.</li>
            <li><strong>Apple Safari:</strong> Preferences &gt; Privacy &gt; Manage Website Data.</li>
            <li><strong>Microsoft Edge:</strong> Settings &gt; Cookies and site permissions &gt; Manage and delete cookies.</li>
          </ul>
          <p className="text-xs text-on-surface-variant leading-relaxed pt-1">
            Please note that disabling strictly necessary cookies through your browser settings may impair certain core functionalities of the website, such as remembering your language or theme.
          </p>
        </section>

        {/* 4. Policy Updates & Contact */}
        <section className="bg-surface-container rounded-xl border border-surface-bright p-6 md:p-8 space-y-3 shadow-sm">
          <h2 className="text-lg md:text-xl font-bold font-geist text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">contact_support</span>
            <span>4. Questions About Our Cookie Practices</span>
          </h2>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            If you have questions regarding our use of cookies or local storage technologies, please reach out to us at{' '}
            <a href="mailto:contact@myscore24.com" className="text-primary underline font-mono">
              contact@myscore24.com
            </a>
            .
          </p>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            For broader details on our data protection practices, please read our{' '}
            <Link href="/privacy-policy" className="text-primary underline hover:text-primary-container">
              Privacy Policy
            </Link>
            .
          </p>
        </section>
      </main>
    </div>
  )
}
