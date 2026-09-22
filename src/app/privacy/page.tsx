import Header from '@/components/common/Header'
import DesktopSidebar from '@/components/common/DesktopSidebar'
import RightSidebar from '@/components/common/RightSidebar'
import MobileBottomNavigation from '@/components/common/MobileBottomNavigation'

import Footer from '@/components/common/Footer'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-surface text-on-surface pb-20 md:pb-6">
      <Header />

      <div className="flex-1 max-w-[1440px] w-full mx-auto px-2 md:px-4 py-4 flex gap-4">
        <DesktopSidebar />

        <main className="flex-1 min-w-0 space-y-4">
          <div className="bg-surface-container rounded-xl border border-surface-bright p-6 space-y-4">
            <h1 className="text-headline-xl text-on-surface font-extrabold">Privacy Policy</h1>
            <p className="text-body-sm text-on-surface-variant">Last updated: September 20, 2026</p>

            <div className="space-y-4 text-body-sm text-on-surface/90 leading-relaxed font-inter">
              <h2 className="text-headline-md text-primary font-bold">1. Information We Collect</h2>
              <p>
                MyScore24 respects your privacy. We collect minimal personal data required to provide live football scores, favorite preferences, and localized content settings. Local storage is utilized for storing saved team, league, and match favorites.
              </p>

              <h2 className="text-headline-md text-primary font-bold">2. How We Use Information</h2>
              <p>
                Your preferences are stored strictly client-side on your device. We do not sell, trade, or transfer your personal preferences to outside parties.
              </p>

              <h2 className="text-headline-md text-primary font-bold">3. Cookies and Analytics</h2>
              <p>
                We use privacy-friendly local storage to remember your chosen theme (Dark/Light mode), language preferences (EN/FR/AR), and sound notification settings.
              </p>
            </div>
          </div>
        </main>

        <RightSidebar />
      </div>

      <Footer />
      <MobileBottomNavigation />
    </div>
  )
}

