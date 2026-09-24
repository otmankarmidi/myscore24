import { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/components/common/Header'

export const metadata: Metadata = {
  title: 'Terms of Use | MyScore24',
  description:
    'Read the official Terms of Use for MyScore24. Review conditions governing platform access, football data accuracy, intellectual property, advertising, and acceptable use.',
  alternates: {
    canonical: 'https://myscore24.com/terms',
  },
  openGraph: {
    title: 'Terms of Use | MyScore24',
    description:
      'Legal terms, data disclaimers, and acceptable use guidelines governing the MyScore24 football score and information platform.',
    url: 'https://myscore24.com/terms',
    siteName: 'MyScore24',
    type: 'website',
  },
}

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-surface text-on-surface">
      <Header />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 md:py-12 space-y-8">
        {/* Header */}
        <header className="space-y-3 pb-6 border-b border-surface-bright">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-primary/10 text-primary font-mono text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            Terms & Conditions
          </div>
          <h1 className="text-2xl md:text-4xl font-extrabold font-geist text-on-surface tracking-tight">
            Terms of Use
          </h1>
          <p className="text-xs md:text-sm text-on-surface-variant font-mono">
            Last Updated: September 24, 2026
          </p>
          <p className="text-sm md:text-base text-on-surface-variant leading-relaxed">
            Welcome to MyScore24 (&ldquo;Platform&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;), accessible at{' '}
            <strong className="text-on-surface font-semibold">https://myscore24.com</strong>. These Terms of Use govern your access to and use of our live football score tracking platform, editorial articles, statistics, and related online features.
          </p>
        </header>

        {/* 1. Acceptance of Terms */}
        <section className="bg-surface-container rounded-xl border border-surface-bright p-6 md:p-8 space-y-3 shadow-sm">
          <h2 className="text-lg md:text-xl font-bold font-geist text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">check_circle</span>
            <span>1. Acceptance of Terms</span>
          </h2>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            By browsing, accessing, or utilizing any portion of MyScore24, you confirm that you have read, understood, and agreed to be bound by these Terms of Use and our accompanying{' '}
            <Link href="/privacy-policy" className="text-primary underline hover:text-primary-container">
              Privacy Policy
            </Link>{' '}
            and{' '}
            <Link href="/cookie-policy" className="text-primary underline hover:text-primary-container">
              Cookie Policy
            </Link>
            . If you do not agree to these terms in their entirety, you must discontinue your use of the website immediately.
          </p>
        </section>

        {/* 2. Purpose of MyScore24 */}
        <section className="bg-surface-container rounded-xl border border-surface-bright p-6 md:p-8 space-y-3 shadow-sm">
          <h2 className="text-lg md:text-xl font-bold font-geist text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">sports_soccer</span>
            <span>2. Purpose of MyScore24</span>
          </h2>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            MyScore24 is an independent digital media and informational service providing football enthusiasts with real-time match events, schedules, tables, lineups, statistics, and original editorial analysis. Our services are provided strictly for personal, non-commercial sports fandom and informational reference.
          </p>
        </section>

        {/* 3. Football Information and Accuracy */}
        <section className="bg-surface-container rounded-xl border border-surface-bright p-6 md:p-8 space-y-3 shadow-sm">
          <h2 className="text-lg md:text-xl font-bold font-geist text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">warning</span>
            <span>3. Football Information and Accuracy</span>
          </h2>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            Football match data—including real-time scores, minutes, goalscorers, disciplinary cards, video assistant referee (VAR) reversals, match postponements, kickoff times, confirmed lineups, and league table calculations—is dynamic and subject to sudden changes.
          </p>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            While we implement advanced ingestion algorithms and editorial checks, sports feeds may occasionally experience temporary transmission lags, upstream provider errors, or retroactive federation revisions.
          </p>
          <div className="p-4 bg-surface-container-high rounded-lg border border-surface-bright text-xs sm:text-sm text-on-surface-variant leading-relaxed">
            <strong className="text-primary font-bold">Authoritative Records:</strong> For official tournament standings, formal match reports, disciplinary suspensions, or regulatory determinations, the official competition organizers (such as FIFA, UEFA, the Premier League, LaLiga, the FA, and national federations) remain the sole governing authorities.
          </div>
        </section>

        {/* 4. Intellectual Property */}
        <section className="bg-surface-container rounded-xl border border-surface-bright p-6 md:p-8 space-y-3 shadow-sm">
          <h2 className="text-lg md:text-xl font-bold font-geist text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">verified</span>
            <span>4. Intellectual Property Rights</span>
          </h2>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            <strong className="text-on-surface">Original Platform Content:</strong> The unique design, layout, color palette, custom software, source code, data visualization interfaces, text, original news articles, editorial previews, and MyScore24 brand logos are the proprietary property of MyScore24 and are protected under international copyright, trademark, and intellectual property laws.
          </p>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            <strong className="text-on-surface">Third-Party Trademarks:</strong> All football club crests, federation logos, competition trophies, tournament brand marks, and player names displayed on MyScore24 are the property of their respective trademark holders. Their representation on this platform is purely for editorial identification, descriptive reference, and public sports reporting under established fair-use and fair-dealing principles.
          </p>
        </section>

        {/* 5. Third-Party Football Data */}
        <section className="bg-surface-container rounded-xl border border-surface-bright p-6 md:p-8 space-y-3 shadow-sm">
          <h2 className="text-lg md:text-xl font-bold font-geist text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">database</span>
            <span>5. Third-Party Sports Data Providers</span>
          </h2>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            Certain structured sports feeds, match event logs, squad numbers, and historical head-to-head records are supplied by licensed third-party data aggregators. MyScore24 does not warrant the continuous uninterrupted availability or absolute mathematical infallibility of third-party sports feeds.
          </p>
        </section>

        {/* 6. Third-Party Services */}
        <section className="bg-surface-container rounded-xl border border-surface-bright p-6 md:p-8 space-y-3 shadow-sm">
          <h2 className="text-lg md:text-xl font-bold font-geist text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">hub</span>
            <span>6. Third-Party Services</span>
          </h2>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            Our platform may integrate or interface with third-party infrastructure providers, including web hosting networks, Content Delivery Networks (CDNs), and analytical measurement suites (such as Google Analytics). Your interaction with third-party tools is subject to their respective terms and service conditions.
          </p>
        </section>

        {/* 7. External Links */}
        <section className="bg-surface-container rounded-xl border border-surface-bright p-6 md:p-8 space-y-3 shadow-sm">
          <h2 className="text-lg md:text-xl font-bold font-geist text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">link</span>
            <span>7. External Links</span>
          </h2>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            MyScore24 may provide hyperlinks to external third-party websites, news publishers, club portals, or ticketing outlets for user convenience. We do not endorse, sponsor, operate, or assume responsibility for the content, privacy policies, or commercial practices of any linked third-party website.
          </p>
        </section>

        {/* 8. Acceptable Use */}
        <section className="bg-surface-container rounded-xl border border-surface-bright p-6 md:p-8 space-y-3 shadow-sm">
          <h2 className="text-lg md:text-xl font-bold font-geist text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">security</span>
            <span>8. Acceptable Use Policy</span>
          </h2>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            When accessing MyScore24, you agree not to:
          </p>
          <ul className="list-disc list-inside space-y-1.5 text-sm text-on-surface-variant leading-relaxed pl-1">
            <li>Employ automated scraping robots, spiders, crawlers, or data extraction scripts to harvest proprietary editorial articles, databases, or API payloads without our prior written consent.</li>
            <li>Attempt to bypass, disable, probe, or compromise server security measures, firewall rules, authentication routines, or rate limits.</li>
            <li>Transmit malicious code, viruses, trojans, worms, or denial-of-service payloads against the platform.</li>
            <li>Submit fraudulent, abusive, defamatory, or automated spam inquiries via our contact forms or public channels.</li>
            <li>Frame or mirror any part of MyScore24 on another website without express authorization.</li>
          </ul>
        </section>

        {/* 9. Website Availability */}
        <section className="bg-surface-container rounded-xl border border-surface-bright p-6 md:p-8 space-y-3 shadow-sm">
          <h2 className="text-lg md:text-xl font-bold font-geist text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">cloud_sync</span>
            <span>9. Website Availability & Maintenance</span>
          </h2>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            We strive to provide continuous 24/7 access to MyScore24. However, we do not guarantee that access will be entirely uninterrupted, error-free, or devoid of temporary downtime resulting from emergency server repairs, network routing disruptions, software upgrades, or force majeure events.
          </p>
        </section>

        {/* 10. Advertising */}
        <section className="bg-surface-container rounded-xl border border-surface-bright p-6 md:p-8 space-y-3 shadow-sm">
          <h2 className="text-lg md:text-xl font-bold font-geist text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">campaign</span>
            <span>10. Advertising Disclosures</span>
          </h2>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            MyScore24 may display commercial advertising, programmatic banners, or sponsored notices provided by third-party ad networks including Google AdSense. We do not endorse any specific commercial product, wager, service, or brand advertised by third-party ad units. Any business dealings between you and advertisers found on our platform are exclusively between you and the advertiser.
          </p>
        </section>

        {/* 11. Disclaimer of Warranties & Limitation of Liability */}
        <section className="bg-surface-container rounded-xl border border-surface-bright p-6 md:p-8 space-y-3 shadow-sm">
          <h2 className="text-lg md:text-xl font-bold font-geist text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">gavel</span>
            <span>11. Disclaimer of Warranties & Limitation of Liability</span>
          </h2>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            MyScore24 and all its materials, scores, analysis, and data tables are provided strictly on an &ldquo;as is&rdquo; and &ldquo;as available&rdquo; basis without warranties of any kind, whether express or implied.
          </p>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            To the maximum extent permitted by applicable law, MyScore24, its editors, operators, developers, and partners shall not be held liable for any direct, indirect, incidental, consequential, special, or punitive damages arising from your reliance on score data, match times, betting decisions, or the inability to access our platform.
          </p>
        </section>

        {/* 12. Changes to Terms */}
        <section className="bg-surface-container rounded-xl border border-surface-bright p-6 md:p-8 space-y-3 shadow-sm">
          <h2 className="text-lg md:text-xl font-bold font-geist text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">history</span>
            <span>12. Changes to These Terms</span>
          </h2>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            We reserve the right to amend, update, or replace these Terms of Use at our sole discretion. Any modifications take effect immediately upon publication on this page with the revised &ldquo;Last Updated&rdquo; date. Your continued use of MyScore24 following changes represents your full acceptance of the updated terms.
          </p>
        </section>

        {/* 13. Contact Information */}
        <section className="bg-surface-container rounded-xl border border-surface-bright p-6 md:p-8 space-y-3 shadow-sm">
          <h2 className="text-lg md:text-xl font-bold font-geist text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">mail</span>
            <span>13. Contact Information</span>
          </h2>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            For legal inquiries, copyright claims, or questions regarding these Terms of Use, please reach out to us:
          </p>
          <div className="p-4 bg-surface-container-high rounded-lg border border-surface-bright text-xs sm:text-sm font-mono space-y-1">
            <div><strong>Platform:</strong> MyScore24 (https://myscore24.com)</div>
            <div>
              <strong>Email:</strong>{' '}
              <a href="mailto:contact@myscore24.com" className="text-primary underline">
                contact@myscore24.com
              </a>
            </div>
            <div><strong>Subject:</strong> Terms of Use Inquiry</div>
          </div>
        </section>
      </main>
    </div>
  )
}
