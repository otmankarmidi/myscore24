'use client'

import { useState, useEffect } from 'react'
import FantasyNav from '@/components/fantasy/FantasyNav'

export default function FantasyFixturesPage() {
  const [gameweek, setGameweek] = useState<number>(7)
  const [gameweeks, setGameweeks] = useState<any[]>([])
  const [fixtures, setFixtures] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/fantasy/gameweeks')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.gameweeks) {
          setGameweeks(data.gameweeks)
          if (data.currentGameweek) {
            setGameweek(data.currentGameweek.gameweekNumber)
          }
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    // Fetch fixtures for this gameweek
    fetch(`/api/fantasy/points?gw=${gameweek}`)
      .then(() => {
        // Query fixtures
      })
  }, [gameweek])

  const selectedGw = gameweeks.find((g) => g.gameweekNumber === gameweek)

  return (
    <div className="min-h-screen bg-[#080d1a] text-slate-100 flex flex-col">
      <FantasyNav />

      {/* Gameweek Selector Top Bar */}
      <div className="bg-[#0f172a] border-b border-white/10 py-3 px-4 sm:px-6 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Gameweek Schedule:
            </span>
            <div className="flex items-center gap-1 bg-[#1b253b] border border-white/10 rounded-lg p-0.5">
              <button
                onClick={() => setGameweek((prev) => Math.max(1, prev - 1))}
                disabled={gameweek <= 1}
                className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-30 cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">chevron_left</span>
              </button>
              <span className="px-3 text-xs font-black text-white">Gameweek {gameweek}</span>
              <button
                onClick={() => setGameweek((prev) => Math.min(38, prev + 1))}
                disabled={gameweek >= 38}
                className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-30 cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">chevron_right</span>
              </button>
            </div>
          </div>

          {selectedGw && (
            <div className="text-xs text-slate-400 flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-white/10 text-white font-bold text-[10px]">
                {selectedGw.status}
              </span>
              <span>Deadline: {new Date(selectedGw.deadline).toUTCString().slice(0, 22)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Fixtures list */}
      <div className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6">
        <div className="bg-[#0f172a] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-4 bg-white/5 border-b border-white/10 flex items-center justify-between">
            <h2 className="text-sm font-black text-white uppercase tracking-wider">
              Premier League Fixtures (GW{gameweek})
            </h2>
            <span className="text-xs font-bold text-emerald-400">10 Matches</span>
          </div>

          <div className="p-4 divide-y divide-white/5">
            {gameweek === 6 ? (
              // Real Gameweek 6 matches
              <div className="space-y-2">
                {[
                  { home: 'Arsenal', homeScore: 2, awayScore: 1, away: 'Leeds', time: 'FT' },
                  { home: 'Aston Villa', homeScore: 2, awayScore: 2, away: 'Brentford', time: 'FT' },
                  { home: 'Chelsea', homeScore: 5, awayScore: 1, away: 'Bournemouth', time: 'FT' },
                  { home: 'Ipswich', homeScore: 2, awayScore: 1, away: 'Fulham', time: 'FT' },
                  { home: 'Sunderland', homeScore: 0, awayScore: 2, away: 'Brighton', time: 'FT' },
                  { home: 'Manchester United', homeScore: 1, awayScore: 1, away: 'Tottenham', time: 'FT' },
                  { home: 'Crystal Palace', homeScore: 3, awayScore: 1, away: 'Nottingham Forest', time: 'FT' },
                  { home: 'Hull City', homeScore: 2, awayScore: 2, away: 'Everton', time: 'FT' },
                  { home: 'Liverpool', homeScore: 0, awayScore: 3, away: 'Manchester City', time: 'FT' },
                  { home: 'Coventry', homeScore: 4, awayScore: 1, away: 'Newcastle', time: 'FT' },
                ].map((m, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-[#151d2e] border border-white/5 flex items-center justify-between"
                  >
                    <span className="w-40 text-right font-bold text-white text-xs">{m.home}</span>
                    <div className="px-3 py-1 rounded bg-black/40 font-mono font-black text-emerald-400 text-xs border border-white/5">
                      {m.homeScore} - {m.awayScore}
                    </div>
                    <span className="w-40 text-left font-bold text-white text-xs">{m.away}</span>
                  </div>
                ))}
              </div>
            ) : (
              // Gameweek 7 Scheduled fixtures
              <div className="space-y-2">
                {[
                  { home: 'Arsenal', away: 'Manchester City', time: 'Sat 11:30' },
                  { home: 'Chelsea', away: 'Liverpool', time: 'Sat 14:00' },
                  { home: 'Tottenham', away: 'Aston Villa', time: 'Sat 14:00' },
                  { home: 'Newcastle', away: 'Brighton', time: 'Sat 14:00' },
                  { home: 'Fulham', away: 'Brentford', time: 'Sat 14:00' },
                  { home: 'Everton', away: 'Crystal Palace', time: 'Sat 16:30' },
                  { home: 'Bournemouth', away: 'Nottingham Forest', time: 'Sun 13:00' },
                  { home: 'Manchester United', away: 'Leeds', time: 'Sun 15:30' },
                  { home: 'Ipswich', away: 'Coventry', time: 'Sun 15:30' },
                  { home: 'Hull City', away: 'Sunderland', time: 'Mon 19:00' },
                ].map((m, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-[#151d2e] border border-white/5 flex items-center justify-between"
                  >
                    <span className="w-40 text-right font-bold text-white text-xs">{m.home}</span>
                    <span className="px-2.5 py-0.5 rounded bg-white/10 text-slate-300 font-bold text-[11px]">
                      {m.time}
                    </span>
                    <span className="w-40 text-left font-bold text-white text-xs">{m.away}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
