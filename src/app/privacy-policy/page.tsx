import { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/components/common/Header'
import Footer from '@/components/common/Footer'

export const metadata: Metadata = {
  title: 'Privacy Policy | MyScore24',
  description:
    'Read the official Privacy Policy of MyScore24. Learn how we handle information, cookies, Google Analytics, advertising partners, and your data protection choices.',
  alternates: {
    canonical: 'https://myscore24.com/privacy-policy',
  },
  openGraph: {
    title: 'Privacy Policy | MyScore24',
    description:
      'Transparency on data handling, cookie preferences, analytics, and advertising disclosure for MyScore24 users.',
    url: 'https://myscore24.com/privacy-policy',
    siteName: 'MyScore24',
    type: 'website',
  },
}

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-surface text-on-surface">
      <Header />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 md:py-12 space-y-8">
        {/* Header */}
        <header className="space-y-3 pb-6 border-b border-surface-bright">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-primary/10 text-primary font-mono text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            Legal & Transparency
          </div>
          <h1 className="text-2xl md:text-4xl font-extrabold font-geist text-on-surface tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-xs md:text-sm text-on-surface-variant font-mono">
            Last Updated: September 24, 2026
          </p>
          <p className="text-sm md:text-base text-on-surface-variant leading-relaxed">
            This Privacy Policy explains how MyScore24 (&ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;), operating at{' '}
            <strong className="text-on-surface font-semibold">https://myscore24.com</strong>, processes information when you visit or interact with our website.
          </p>
        </header>

        {/* 1. Information We Process */}
        <section className="bg-surface-container rounded-xl border border-surface-bright p-6 md:p-8 space-y-3 shadow-sm">
          <h2 className="text-lg md:text-xl font-bold font-geist text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">dataset</span>
            <span>1. Information We Process</span>
          </h2>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            Depending on how you use MyScore24, we may process the following categories of information:
          </p>
          <ul className="list-disc list-inside space-y-2 text-sm text-on-surface-variant leading-relaxed pl-1">
            <li>
              <strong className="text-on-surface">Technical & Network Identifiers:</strong> Internet Protocol (IP) address, browser family and version, operating system, device type, screen resolution, and system language settings.
            </li>
            <li>
              <strong className="text-on-surface">Approximate Location:</strong> Non-precise, country- or city-level geographic region derived from your IP address to display relevant local kickoff times and timezones.
            </li>
            <li>
              <strong className="text-on-surface">Usage & Interaction Data:</strong> Pages viewed, referring URLs, links clicked, navigation paths, search terms entered, and timestamps of requests.
            </li>
            <li>
              <strong className="text-on-surface">Client-Side Preferences:</strong> Settings stored locally on your device (in browser localStorage) including chosen theme (Dark/Light mode), language (English, Français, or العربية), active timezone, sound alerts, and pinned favorite teams, matches, or competitions.
            </li>
            <li>
              <strong className="text-on-surface">Consent Preferences:</strong> Records of choices made through our cookie banner (e.g., whether optional analytics measurement is granted or denied).
            </li>
            <li>
              <strong className="text-on-surface">Voluntary Communications:</strong> Your name, email address, subject category, and message contents when you submit an inquiry through our contact form or send an email to <code className="font-mono text-xs text-primary">contact@myscore24.com</code>.
            </li>
          </ul>
        </section>

        {/* 2. Purposes of Processing */}
        <section className="bg-surface-container rounded-xl border border-surface-bright p-6 md:p-8 space-y-3 shadow-sm">
          <h2 className="text-lg md:text-xl font-bold font-geist text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">fact_check</span>
            <span>2. Purposes for Processing Information</span>
          </h2>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            We use the processed data strictly for legitimate operational purposes:
          </p>
          <ul className="list-disc list-inside space-y-1.5 text-sm text-on-surface-variant leading-relaxed pl-1">
            <li>Operating and serving the MyScore24 website, live football scores, and editorial content.</li>
            <li>Ensuring technical stability, server security, and protection against abuse, scrapers, and denial-of-service (DDoS) attacks.</li>
            <li>Remembering your interface preferences across visits without requiring an account.</li>
            <li>Measuring aggregated traffic patterns and diagnosing technical errors to optimize speed and responsiveness.</li>
            <li>Responding to editorial feedback, correction requests, copyright notices, and business correspondence.</li>
            <li>Displaying non-intrusive or contextual advertising where applicable to support free access to football information.</li>
          </ul>
        </section>

        {/* 3. Google Analytics & Measurement */}
        <section className="bg-surface-container rounded-xl border border-surface-bright p-6 md:p-8 space-y-3 shadow-sm">
          <h2 className="text-lg md:text-xl font-bold font-geist text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">monitoring</span>
            <span>3. Google Analytics & Measurement</span>
          </h2>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            MyScore24 integrates Google Analytics 4 (Measurement ID: <code className="font-mono text-xs text-primary">G-L96Q86DFG3</code>), an analytics service provided by Google LLC, to understand how visitors engage with our sports coverage and improve platform performance.
          </p>
          <div className="p-4 bg-surface-container-high rounded-lg border border-surface-bright space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-primary">Consent Enforcement</h3>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Google Analytics is governed by our cookie consent mechanism and Google Consent Mode v2. If you select &ldquo;Essential Only&rdquo; or deny analytics consent, Google Analytics tracking scripts are not executed, ensuring that analytics measurement cookies are never set without your affirmative choice.
            </p>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              When enabled, Google Analytics generates pseudonymous measurement identifiers to evaluate aggregated page navigation, route transitions, and engagement metrics. IP anonymization is enabled by default in GA4.
            </p>
          </div>
        </section>

        {/* 4. Google AdSense & Advertising Technologies */}
        <section className="bg-surface-container rounded-xl border border-surface-bright p-6 md:p-8 space-y-3 shadow-sm">
          <h2 className="text-lg md:text-xl font-bold font-geist text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">campaign</span>
            <span>4. Google AdSense & Advertising Disclosures</span>
          </h2>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            MyScore24 may display third-party advertisements served by Google AdSense and other advertising networks to support the ongoing maintenance and development of our free football score service.
          </p>
          <div className="space-y-2 text-sm text-on-surface-variant leading-relaxed">
            <p>
              Please review the following essential disclosures regarding advertising cookies:
            </p>
            <ul className="list-disc list-inside space-y-2 pl-1 text-xs sm:text-sm">
              <li>
                Third-party vendors, including Google, may use cookies, device identifiers, or web beacons to serve ads based on a user&rsquo;s previous visits to MyScore24 and/or other websites across the Internet.
              </li>
              <li>
                Google&rsquo;s use of advertising cookies enables it and its partners to serve targeted ads to our users based on their browsing activity on MyScore24 and other websites.
              </li>
              <li>
                Users may manage and opt out of personalized advertising by visiting the official Google Ads Settings page:{' '}
                <a
                  href="https://adssettings.google.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline hover:text-primary-container font-mono"
                >
                  https://adssettings.google.com/
                </a>
                .
              </li>
              <li>
                Alternatively, you can opt out of a third-party vendor&rsquo;s use of cookies for personalized advertising by visiting the Digital Advertising Alliance Consumer Choice page:{' '}
                <a
                  href="https://www.aboutads.info/choices/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline hover:text-primary-container font-mono"
                >
                  https://www.aboutads.info/choices/
                </a>{' '}
                or the European Interactive Digital Advertising Alliance:{' '}
                <a
                  href="https://www.youronlinechoices.eu/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline hover:text-primary-container font-mono"
                >
                  https://www.youronlinechoices.eu/
                </a>
                .
              </li>
            </ul>
          </div>
        </section>

        {/* 5. Cookies & Local Storage */}
        <section className="bg-surface-container rounded-xl border border-surface-bright p-6 md:p-8 space-y-3 shadow-sm">
          <h2 className="text-lg md:text-xl font-bold font-geist text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">cookie</span>
            <span>5. Cookies & Local Storage</span>
          </h2>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            We use both HTTP cookies and modern browser storage technologies (such as HTML5 <code className="font-mono text-xs text-primary">localStorage</code>) to operate the platform efficiently without forcing users to register or log in.
          </p>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            For detailed information about each cookie type, purpose, and retention duration, please consult our dedicated{' '}
            <Link href="/cookie-policy" className="text-primary underline hover:text-primary-container font-semibold">
              Cookie Policy
            </Link>
            .
          </p>
        </section>

        {/* 6. Third-Party Services & Football Data Providers */}
        <section className="bg-surface-container rounded-xl border border-surface-bright p-6 md:p-8 space-y-3 shadow-sm">
          <h2 className="text-lg md:text-xl font-bold font-geist text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">hub</span>
            <span>6. Third-Party Services & Data Providers</span>
          </h2>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            To provide live match data, stadium details, team rosters, and competition standings, MyScore24 connects with external sports data APIs and Content Delivery Networks (CDNs).
          </p>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            Third-party API requests are proxied and cached server-side by MyScore24; your personal IP address is not transmitted directly to our upstream sports data providers during regular browsing.
          </p>
        </section>

        {/* 7. External Links */}
        <section className="bg-surface-container rounded-xl border border-surface-bright p-6 md:p-8 space-y-3 shadow-sm">
          <h2 className="text-lg md:text-xl font-bold font-geist text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">link</span>
            <span>7. External Links</span>
          </h2>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            Our news articles, club profiles, and competition tables may contain hyperlinks to external websites, governing bodies, or partner sources. MyScore24 has no control over the privacy practices, content, or cookie policies of third-party websites. We encourage you to review the privacy notices of any external site you visit.
          </p>
        </section>

        {/* 8. Data Security & Retention */}
        <section className="bg-surface-container rounded-xl border border-surface-bright p-6 md:p-8 space-y-3 shadow-sm">
          <h2 className="text-lg md:text-xl font-bold font-geist text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">shield</span>
            <span>8. Data Security & Retention</span>
          </h2>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            We employ modern administrative, technical, and architectural security measures, including HTTPS encryption in transit, strict HTTP headers, rate limiting, and isolated database storage.
          </p>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            Information submitted via the contact form is retained only as long as necessary to resolve your inquiry, comply with legal obligations, or protect against malicious spam submissions. Client-side preferences stored in your browser remain on your device until cleared through browser settings.
          </p>
        </section>

        {/* 9. User Choices & Legal Rights */}
        <section className="bg-surface-container rounded-xl border border-surface-bright p-6 md:p-8 space-y-3 shadow-sm">
          <h2 className="text-lg md:text-xl font-bold font-geist text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">gavel</span>
            <span>9. Your Rights & Choices</span>
          </h2>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            Depending on your jurisdiction (including the European Economic Area under GDPR, the United Kingdom under UK GDPR, and relevant US privacy statutes), you have statutory rights concerning your personal information:
          </p>
          <ul className="list-disc list-inside space-y-1.5 text-sm text-on-surface-variant leading-relaxed pl-1">
            <li><strong className="text-on-surface">Right to Access:</strong> Request confirmation of whether we process personal data relating to you.</li>
            <li><strong className="text-on-surface">Right to Rectification:</strong> Request correction of inaccurate or incomplete personal information.</li>
            <li><strong className="text-on-surface">Right to Erasure (&ldquo;Right to be Forgotten&rdquo;):</strong> Request deletion of your contact correspondence.</li>
            <li><strong className="text-on-surface">Right to Withdraw Consent:</strong> You may modify or withdraw your analytics cookie preferences at any time via the Cookie Settings link in our footer.</li>
          </ul>
          <p className="text-sm text-on-surface-variant leading-relaxed pt-1">
            To exercise any of these rights, contact us directly at{' '}
            <a href="mailto:contact@myscore24.com" className="text-primary underline font-mono">
              contact@myscore24.com
            </a>
            .
          </p>
        </section>

        {/* 10. Children's Privacy */}
        <section className="bg-surface-container rounded-xl border border-surface-bright p-6 md:p-8 space-y-3 shadow-sm">
          <h2 className="text-lg md:text-xl font-bold font-geist text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">family_restroom</span>
            <span>10. Children&rsquo;s Privacy</span>
          </h2>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            MyScore24 provides general football information and is not directed at children under the age of 13 (or under 16 where applicable under EU member state laws). We do not knowingly collect personal information from children. If you believe a child has provided us with personal information, please contact us so we can promptly take appropriate corrective action.
          </p>
        </section>

        {/* 11. Changes to this Policy */}
        <section className="bg-surface-container rounded-xl border border-surface-bright p-6 md:p-8 space-y-3 shadow-sm">
          <h2 className="text-lg md:text-xl font-bold font-geist text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">history</span>
            <span>11. Changes to This Privacy Policy</span>
          </h2>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            We may periodically revise this Privacy Policy to reflect technical updates, changes in applicable data protection laws, or the introduction of new website features. The &ldquo;Last Updated&rdquo; date at the top of this document indicates the effective date of the latest revisions.
          </p>
        </section>

        {/* 12. Contact Us */}
        <section className="bg-surface-container rounded-xl border border-surface-bright p-6 md:p-8 space-y-3 shadow-sm">
          <h2 className="text-lg md:text-xl font-bold font-geist text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">mail</span>
            <span>12. Contact Information</span>
          </h2>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            For questions, data protection requests, or clarification regarding this Privacy Policy, please contact our team:
          </p>
          <div className="p-4 bg-surface-container-high rounded-lg border border-surface-bright text-xs sm:text-sm font-mono space-y-1">
            <div><strong>Platform:</strong> MyScore24 (https://myscore24.com)</div>
            <div>
              <strong>Email:</strong>{' '}
              <a href="mailto:contact@myscore24.com" className="text-primary underline">
                contact@myscore24.com
              </a>
            </div>
            <div><strong>Subject:</strong> Privacy / Data Protection Inquiry</div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
