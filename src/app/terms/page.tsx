import Header from '@/components/common/Header'
import Footer from '@/components/common/Footer'

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-surface text-on-surface">
      <Header />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 space-y-6">
        <div className="bg-surface-container rounded-xl border border-surface-bright p-6 md:p-8 space-y-6">
          <h1 className="text-2xl md:text-3xl font-extrabold text-on-surface">Terms of Service</h1>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-on-surface">1. Acceptance of Terms</h2>
            <p className="text-xs md:text-sm text-on-surface-variant leading-relaxed">
              By accessing and using MyScore24, you agree to comply with and be bound by these Terms of Service. If you do not agree with any part of these terms, please do not use our platform.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-on-surface">2. Services Offered</h2>
            <p className="text-xs md:text-sm text-on-surface-variant leading-relaxed">
              MyScore24 provides informational sports data including live scores, statistics, league standings, schedules, and news. The service is provided "as is" for personal, non-commercial use.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-on-surface">3. Intellectual Property</h2>
            <p className="text-xs md:text-sm text-on-surface-variant leading-relaxed">
              All branding, custom software, UI design, and logos are property of MyScore24. Team logos and trademarks referenced belong to their respective owners and are used purely for identification purposes.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-on-surface">4. Disclaimer of Warranties</h2>
            <p className="text-xs md:text-sm text-on-surface-variant leading-relaxed">
              While we strive to provide real-time and accurate data, MyScore24 does not guarantee absolute completeness or timeliness. We are not liable for decisions made based on sports score information on the site.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  )
}
