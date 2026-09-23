import Link from 'next/link'
import Header from '@/components/common/Header'
import MobileBottomNavigation from '@/components/common/MobileBottomNavigation'

export const metadata = {
  title: 'Page Not Found | MyScore24',
  description: 'The requested football page or match could not be found on MyScore24.',
  robots: {
    index: false,
    follow: false,
  },
}

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-surface text-on-surface">
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-16 text-center max-w-lg mx-auto">
        <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center border border-surface-bright mb-4">
          <span className="material-symbols-outlined text-4xl text-primary" aria-hidden="true">
            sports_soccer
          </span>
        </div>
        <h1 className="text-3xl font-extrabold text-on-surface mb-2 font-geist">Page Not Found</h1>
        <p className="text-body-sm text-on-surface-variant mb-6 leading-relaxed">
          The match, competition, club or page you are looking for does not exist or may have been moved.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="px-5 py-2.5 rounded-lg bg-primary text-on-primary font-bold text-sm shadow hover:bg-primary/90 transition-colors"
          >
            Back to Live Scores
          </Link>
          <Link
            href="/competitions"
            className="px-5 py-2.5 rounded-lg bg-surface-container border border-surface-bright text-on-surface font-semibold text-sm hover:bg-surface-container-high transition-colors"
          >
            Browse Competitions
          </Link>
        </div>
      </main>
      <MobileBottomNavigation />
    </div>
  )
}
