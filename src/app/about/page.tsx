import { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/components/common/Header'
import Footer from '@/components/common/Footer'

export const metadata: Metadata = {
  title: 'About MyScore24 | Football Scores, News & Statistics',
  description:
    'Learn about MyScore24, an independent football information platform delivering real-time live scores, comprehensive match statistics, league standings, and original football editorial coverage.',
  alternates: {
    canonical: 'https://myscore24.com/about',
  },
  openGraph: {
    title: 'About MyScore24 | Football Scores, News & Statistics',
    description:
      'Independent football scores, statistics, and news platform covering major domestic, European, and international competitions.',
    url: 'https://myscore24.com/about',
    siteName: 'MyScore24',
    type: 'website',
  },
}

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-surface text-on-surface">
      <Header />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 md:py-12 space-y-8">
        {/* Page Heading */}
        <header className="space-y-3 pb-6 border-b border-surface-bright">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-primary/10 text-primary font-mono text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            Independent Football Platform
          </div>
          <h1 className="text-2xl md:text-4xl font-extrabold font-geist text-on-surface tracking-tight">
            About MyScore24
          </h1>
          <p className="text-sm md:text-base text-on-surface-variant leading-relaxed">
            MyScore24 is an independent football information and live score platform created for fans who want fast, clear, and comprehensive football data in one accessible place.
          </p>
        </header>

        {/* What We Cover */}
        <section className="bg-surface-container rounded-xl border border-surface-bright p-6 md:p-8 space-y-4 shadow-sm">
          <h2 className="text-xl md:text-2xl font-bold font-geist text-on-surface flex items-center gap-2.5">
            <span className="material-symbols-outlined text-primary text-2xl">sports_soccer</span>
            <span>Comprehensive Football Coverage</span>
          </h2>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            We provide real-time updates and deep structured information across top domestic leagues, continental tournaments, and international football:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
            {[
              { icon: 'speed', title: 'Live Scores', desc: 'Real-time match events, minutes, and scores' },
              { icon: 'calendar_month', title: 'Fixtures & Results', desc: 'Complete season calendars and full-time scores' },
              { icon: 'format_list_numbered', title: 'Standings & Tables', desc: 'Live points, goal difference, and forms' },
              { icon: 'tune', title: 'Match Information', desc: 'Lineups, head-to-head records, and events' },
              { icon: 'shield', title: 'Club & Team Profiles', desc: 'Squad lists, current season forms, and fixtures' },
              { icon: 'person', title: 'Player Profiles', desc: 'Squad numbers, positions, and player data' },
              { icon: 'percent', title: 'Football Statistics', desc: 'Top scorers, discipline stats, and team metrics' },
              { icon: 'newspaper', title: 'Football News & Reports', desc: 'Match previews, analytical reports, and debriefs' },
              { icon: 'emoji_events', title: 'International Football', desc: 'Global tournaments, qualifiers, and cup competitions' },
            ].map((item, idx) => (
              <div key={idx} className="bg-surface-container-high/60 rounded-lg p-3.5 border border-surface-bright/50 space-y-1">
                <div className="flex items-center gap-2 text-primary">
                  <span className="material-symbols-outlined text-lg">{item.icon}</span>
                  <span className="font-bold text-xs text-on-surface">{item.title}</span>
                </div>
                <p className="text-[11px] text-on-surface-variant leading-normal">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Our Mission */}
        <section className="bg-surface-container rounded-xl border border-surface-bright p-6 md:p-8 space-y-3 shadow-sm">
          <h2 className="text-xl md:text-2xl font-bold font-geist text-on-surface flex items-center gap-2.5">
            <span className="material-symbols-outlined text-primary text-2xl">bolt</span>
            <span>Our Mission</span>
          </h2>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            Our mission is straightforward: to provide football supporters with fast, clear, accessible, and useful football information. Football happens at breakneck speed, and fans need reliable scores, lineups, and insights without visual clutter, heavy bloat, or confusing interfaces.
          </p>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            Whether you are following your local club or tracking matches across multiple European leagues simultaneously, MyScore24 is engineered to deliver lightning-quick answers on any desktop, tablet, or smartphone.
          </p>
        </section>

        {/* Editorial Approach */}
        <section className="bg-surface-container rounded-xl border border-surface-bright p-6 md:p-8 space-y-3 shadow-sm">
          <h2 className="text-xl md:text-2xl font-bold font-geist text-on-surface flex items-center gap-2.5">
            <span className="material-symbols-outlined text-primary text-2xl">edit_note</span>
            <span>Editorial Approach</span>
          </h2>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            MyScore24 produces original editorial journalism, match previews, and football analysis. We adhere to clear editorial standards:
          </p>
          <ul className="list-disc list-inside space-y-2 text-sm text-on-surface-variant leading-relaxed pl-1">
            <li>
              <strong className="text-on-surface">Distinguishing Confirmed Facts from Speculation:</strong> We clearly separate official announcements and confirmed results from transfer rumors, reports, or evolving breaking stories.
            </li>
            <li>
              <strong className="text-on-surface">Commitment to Corrections & Updates:</strong> Football stories evolve rapidly. When new, reliable information comes to light or when an error is identified, our editorial staff updates and corrects articles promptly.
            </li>
            <li>
              <strong className="text-on-surface">Originality & Context:</strong> We do not simply republish press releases. Our articles aim to provide statistical depth, tactical context, and historical perspective to help fans understand the stories behind the scores.
            </li>
          </ul>
        </section>

        {/* Football Data & Accuracy */}
        <section className="bg-surface-container rounded-xl border border-surface-bright p-6 md:p-8 space-y-3 shadow-sm">
          <h2 className="text-xl md:text-2xl font-bold font-geist text-on-surface flex items-center gap-2.5">
            <span className="material-symbols-outlined text-primary text-2xl">database</span>
            <span>Football Data & Third-Party Feeds</span>
          </h2>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            Structured football data displayed on MyScore24—including real-time scores, schedules, kickoff times, standings tables, lineups, and player statistics—is supported by professional third-party sports data providers and automated ingestion pipelines.
          </p>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            While we apply automated deduplication, normalization, and verification algorithms to maintain accuracy, live sports data feeds can occasionally experience brief delays, upstream provider corrections, or technical interruptions.
          </p>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            For official results, disciplinary rulings, or tournament records, the relevant competition organizers (e.g. FIFA, UEFA, Premier League, LaLiga) remain the authoritative governing bodies.
          </p>
        </section>

        {/* Independent Platform Disclaimer */}
        <section className="bg-surface-container rounded-xl border border-surface-bright p-6 md:p-8 space-y-3 shadow-sm">
          <h2 className="text-xl md:text-2xl font-bold font-geist text-on-surface flex items-center gap-2.5">
            <span className="material-symbols-outlined text-primary text-2xl">verified</span>
            <span>Independent Platform</span>
          </h2>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            MyScore24 is an independent football information platform and media service. We are not affiliated, associated, authorized, endorsed by, or in any way officially connected with FIFA, UEFA, domestic leagues, football federations, or individual football clubs, unless explicitly stated.
          </p>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            All registered trademarks, club crests, league logos, brand names, and competition titles referenced on MyScore24 belong exclusively to their respective owners. Their inclusion on this website is solely for editorial, informational, and identification purposes under applicable fair-dealing principles.
          </p>
        </section>

        {/* Contact Us Callout */}
        <section className="bg-gradient-to-r from-surface-container to-surface-container-high rounded-xl border border-primary/20 p-6 md:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-lg font-bold font-geist text-on-surface">Have a Question or Feedback?</h3>
            <p className="text-xs text-on-surface-variant">
              We welcome corrections, suggestions, technical reports, and partnership inquiries.
            </p>
          </div>
          <Link
            href="/contact"
            className="px-5 py-2.5 rounded-lg bg-primary text-on-primary font-bold text-xs uppercase tracking-wider hover:bg-primary-container transition-colors shadow-sm shrink-0"
          >
            Contact MyScore24
          </Link>
        </section>
      </main>

      <Footer />
    </div>
  )
}
