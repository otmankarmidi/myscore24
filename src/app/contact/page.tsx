import { Metadata } from 'next'
import Header from '@/components/common/Header'
import Footer from '@/components/common/Footer'
import ContactForm from '@/components/contact/ContactForm'

export const metadata: Metadata = {
  title: 'Contact MyScore24 | Support & Editorial Enquiries',
  description:
    'Contact the MyScore24 editorial, technical, and partnership teams. Reach us directly at contact@myscore24.com for corrections, copyright requests, or general inquiries.',
  alternates: {
    canonical: 'https://myscore24.com/contact',
  },
  openGraph: {
    title: 'Contact MyScore24 | Support & Editorial Enquiries',
    description:
      'Official contact information and enquiry guidelines for MyScore24 readers, rights holders, and partners.',
    url: 'https://myscore24.com/contact',
    siteName: 'MyScore24',
    type: 'website',
  },
}

export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col bg-surface text-on-surface">
      <Header />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 md:py-12 space-y-8">
        {/* Page Heading */}
        <header className="space-y-3 pb-6 border-b border-surface-bright">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-primary/10 text-primary font-mono text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            Support & Communications
          </div>
          <h1 className="text-2xl md:text-4xl font-extrabold font-geist text-on-surface tracking-tight">
            Contact MyScore24
          </h1>
          <p className="text-sm md:text-base text-on-surface-variant leading-relaxed">
            We value direct communication with our global football audience, content partners, and rights holders. Please direct your correspondence to our official email channel or use the form below.
          </p>

          <div className="pt-2">
            <div className="inline-flex flex-wrap items-center gap-2 p-3 bg-surface-container rounded-lg border border-surface-bright text-xs sm:text-sm">
              <span className="text-on-surface-variant font-medium">Official Contact Email:</span>
              <a
                href="mailto:contact@myscore24.com"
                className="text-primary hover:text-primary-container font-mono font-bold underline transition-colors"
              >
                contact@myscore24.com
              </a>
            </div>
          </div>
        </header>

        {/* Dedicated Enquiry Categories */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold font-geist text-on-surface">
            How Can We Help You?
          </h2>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            To ensure your inquiry is routed to the appropriate team member promptly, please consult the specific guidance for each category:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            {/* 1. General Enquiries */}
            <div className="bg-surface-container rounded-xl border border-surface-bright p-5 space-y-2">
              <div className="flex items-center gap-2 text-primary">
                <span className="material-symbols-outlined text-xl">chat_bubble_outline</span>
                <h3 className="font-bold text-sm text-on-surface">General Enquiries</h3>
              </div>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Have questions about our live score coverage, feature suggestions, or general platform feedback? We welcome reader ideas to help make MyScore24 faster and more useful.
              </p>
            </div>

            {/* 2. Editorial Corrections */}
            <div className="bg-surface-container rounded-xl border border-surface-bright p-5 space-y-2">
              <div className="flex items-center gap-2 text-primary">
                <span className="material-symbols-outlined text-xl">fact_check</span>
                <h3 className="font-bold text-sm text-on-surface">Editorial Corrections</h3>
              </div>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                If you have spotted an error, outdated detail, or factual inaccuracy in an article or data table, please include:
              </p>
              <ul className="list-disc list-inside text-[11px] text-on-surface-variant/90 space-y-1 pl-1">
                <li>The exact URL of the affected page</li>
                <li>A clear description of the specific error</li>
                <li>The correct information with authoritative source links</li>
              </ul>
            </div>

            {/* 3. Technical Issues */}
            <div className="bg-surface-container rounded-xl border border-surface-bright p-5 space-y-2">
              <div className="flex items-center gap-2 text-primary">
                <span className="material-symbols-outlined text-xl">bug_report</span>
                <h3 className="font-bold text-sm text-on-surface">Technical Issues</h3>
              </div>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                To report live score synchronization delays, rendering anomalies, broken links, or performance problems, please include your device type, operating system, and browser version.
              </p>
            </div>

            {/* 4. Copyright Enquiries */}
            <div className="bg-surface-container rounded-xl border border-surface-bright p-5 space-y-2">
              <div className="flex items-center gap-2 text-primary">
                <span className="material-symbols-outlined text-xl">verified</span>
                <h3 className="font-bold text-sm text-on-surface">Copyright & IP Enquiries</h3>
              </div>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                MyScore24 respects intellectual property. If you are a copyright owner or authorized representative seeking notice of material, please provide:
              </p>
              <ul className="list-disc list-inside text-[11px] text-on-surface-variant/90 space-y-1 pl-1">
                <li>Sufficient identification of the copyrighted work claimed</li>
                <li>The exact MyScore24 URL where the material appears</li>
                <li>Statement confirming your authority as or on behalf of the owner</li>
              </ul>
            </div>

            {/* 5. Business & Partnership */}
            <div className="bg-surface-container rounded-xl border border-surface-bright p-5 space-y-2 md:col-span-2">
              <div className="flex items-center gap-2 text-primary">
                <span className="material-symbols-outlined text-xl">handshake</span>
                <h3 className="font-bold text-sm text-on-surface">Business & Partnership Enquiries</h3>
              </div>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                For commercial collaborations, digital advertising proposals, syndication, data partnership inquiries, or press communications, write directly with &ldquo;Partnership&rdquo; in the email subject line to{' '}
                <a
                  href="mailto:contact@myscore24.com"
                  className="text-primary underline hover:text-primary-container font-mono font-medium"
                >
                  contact@myscore24.com
                </a>
                .
              </p>
            </div>
          </div>
        </section>

        {/* Lightweight Contact Form */}
        <section className="pt-2">
          <ContactForm />
        </section>
      </main>

      <Footer />
    </div>
  )
}
