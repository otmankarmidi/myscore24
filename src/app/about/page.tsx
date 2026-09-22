import Header from '@/components/common/Header'
import Footer from '@/components/common/Footer'

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-surface text-on-surface">
      <Header />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 space-y-6">
        <div className="bg-surface-container rounded-xl border border-surface-bright p-6 md:p-8 space-y-4">
          <h1 className="text-2xl md:text-3xl font-extrabold text-on-surface">About MyScore24</h1>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            Welcome to <strong className="text-primary">MyScore24</strong>, your ultimate destination for real-time live football scores, fixtures, standings, top scorers, match statistics, and breaking football news.
          </p>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            Our mission is to deliver lightning-fast, accurate sports data to football fans across the globe. Whether you follow the Premier League, La Liga, UEFA Champions League, Serie A, Bundesliga, or international tournaments, MyScore24 ensures you never miss a goal, red card, or match highlight.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-surface-container rounded-xl border border-surface-bright p-5 space-y-2">
            <span className="material-symbols-outlined text-primary text-3xl">bolt</span>
            <h2 className="font-bold text-on-surface">Real-Time Updates</h2>
            <p className="text-xs text-on-surface-variant">Instant score alerts and match status updates with zero delay.</p>
          </div>
          <div className="bg-surface-container rounded-xl border border-surface-bright p-5 space-y-2">
            <span className="material-symbols-outlined text-primary text-3xl">sports_soccer</span>
            <h2 className="font-bold text-on-surface">Comprehensive Coverage</h2>
            <p className="text-xs text-on-surface-variant">Full coverage of major leagues, cup competitions, and international matches.</p>
          </div>
          <div className="bg-surface-container rounded-xl border border-surface-bright p-5 space-y-2">
            <span className="material-symbols-outlined text-primary text-3xl">devices</span>
            <h2 className="font-bold text-on-surface">Mobile First</h2>
            <p className="text-xs text-on-surface-variant">Optimized for speed and seamless experience across all mobile and desktop devices.</p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
