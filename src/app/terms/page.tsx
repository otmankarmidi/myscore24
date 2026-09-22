import Header from '@/components/common/Header'
import DesktopSidebar from '@/components/common/DesktopSidebar'
import RightSidebar from '@/components/common/RightSidebar'
import MobileBottomNavigation from '@/components/common/MobileBottomNavigation'

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-surface text-on-surface pb-20 md:pb-6">
      <Header />

      <div className="flex-1 max-w-[1440px] w-full mx-auto px-2 md:px-4 py-4 flex gap-4">
        <DesktopSidebar />

        <main className="flex-1 min-w-0 space-y-4">
          <div className="bg-surface-container rounded-xl border border-surface-bright p-6 space-y-4">
            <h1 className="text-headline-xl text-on-surface font-extrabold">Terms of Service</h1>
            <p className="text-body-sm text-on-surface-variant">Last updated: September 20, 2026</p>

            <div className="space-y-4 text-body-sm text-on-surface/90 leading-relaxed font-inter">
              <h2 className="text-headline-md text-primary font-bold">1. Agreement to Terms</h2>
              <p>
                By accessing or using MyScore24, you agree to be bound by these Terms of Service. All live sports scores, match statistics, lineups, and news content are provided for informational and entertainment purposes only.
              </p>

              <h2 className="text-headline-md text-primary font-bold">2. Intellectual Property</h2>
              <p>
                Team names, logos, and league trademarks remain the property of their respective official rights holders.
              </p>

              <h2 className="text-headline-md text-primary font-bold">3. Disclaimer</h2>
              <p>
                Live scores and stats are updated in real-time. MyScore24 is provided &ldquo;as is&rdquo; without warranties of uninterrupted real-time streaming transmission.
              </p>
            </div>
          </div>
        </main>

        <RightSidebar />
      </div>

      <MobileBottomNavigation />
    </div>
  )
}
