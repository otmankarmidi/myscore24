'use client'

import { useState, useEffect } from 'react'
import FantasyNav from '@/components/fantasy/FantasyNav'
import PitchView, { PitchPlayer } from '@/components/fantasy/PitchView'

export default function PointsPage() {
  const [gameweek, setGameweek] = useState<number>(6) // Default to GW6 where real matches took place
  const [data, setData] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/fantasy/points?gw=${gameweek}`)
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success) {
          setData(resData)
        } else {
          setData(null)
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [gameweek])

  const pitchPlayers: PitchPlayer[] = data?.players?.map((p: any) => ({
    id: p.id,
    fantasyPlayerId: p.fantasyPlayerId,
    webName: p.webName,
    position: p.position,
    positionIndex: p.positionIndex,
    price: 0,
    points: p.points,
    teamShortName: p.teamShortName,
    teamLogo: p.teamLogo,
    photo: p.photo,
    isStartingXI: p.isStartingXI,
    isCaptain: p.isCaptain,
    isViceCaptain: p.isViceCaptain,
    isEffectiveCaptain: p.isEffectiveCaptain,
    multiplier: p.multiplier,
  })) || []

  return (
    <div className="min-h-screen bg-[#080d1a] text-slate-100 flex flex-col">
      <FantasyNav />

      {/* Gameweek Selector Top Bar */}
      <div className="bg-[#0f172a] border-b border-white/10 py-3 px-4 sm:px-6 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Gameweek:
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

          {/* Gameweek summary */}
          {data?.summary && (
            <div className="flex items-center gap-4 text-xs">
              <div>
                <span className="text-slate-400 text-[10px] block">Gameweek Points</span>
                <span className="text-lg font-black text-emerald-400">
                  {data.summary.netPoints} pts
                </span>
              </div>
              <div className="h-6 w-px bg-white/10"></div>
              <div>
                <span className="text-slate-400 text-[10px] block">Overall Points</span>
                <span className="text-lg font-black text-white">
                  {data.summary.overallPoints} pts
                </span>
              </div>
              <div className="h-6 w-px bg-white/10"></div>
              <div>
                <span className="text-slate-400 text-[10px] block">Gameweek Rank</span>
                <span className="text-lg font-black text-slate-200">
                  #{data.summary.gameweekRank || 1}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Workspace */}
      <div className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 flex flex-col items-center">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading gameweek points...</div>
        ) : !data?.hasSquad ? (
          <div className="p-12 text-center text-xs text-slate-400">
            You do not have a squad yet.
          </div>
        ) : (
          <>
            {/* Auto-Substitutions Banner if any */}
            {data.summary?.substitutionsMade?.length > 0 && (
              <div className="w-full max-w-2xl mb-4 p-3 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-200 text-xs">
                <span className="font-bold flex items-center gap-1 mb-1">
                  <span className="material-symbols-outlined text-sm">published_with_changes</span>
                  Automatic Substitutions Triggered:
                </span>
                <ul className="list-disc pl-5 space-y-0.5 text-[11px] text-purple-300">
                  {data.summary.substitutionsMade.map((sub: any, idx: number) => (
                    <li key={idx}>
                      {sub.playerInName} substituted in for {sub.playerOutName} (+{sub.pointsGained} pts)
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Pitch with scored points */}
            <PitchView players={pitchPlayers} showPoints={true} isReadOnly={true} />

            {/* Detailed Player Breakdown Table */}
            <div className="w-full max-w-2xl mt-6 bg-[#0f172a] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
              <div className="p-3 bg-white/5 border-b border-white/10 text-xs font-bold uppercase tracking-wider text-slate-300">
                Gameweek Performance Breakdown
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#151d2e] text-[10px] uppercase font-bold text-slate-400 border-b border-white/5">
                    <tr>
                      <th className="py-2.5 px-3">Player</th>
                      <th className="py-2.5 px-2">Pos</th>
                      <th className="py-2.5 px-2 text-center">Mins</th>
                      <th className="py-2.5 px-2 text-center">G</th>
                      <th className="py-2.5 px-2 text-center">A</th>
                      <th className="py-2.5 px-2 text-center">CS</th>
                      <th className="py-2.5 px-3 text-right">Pts</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {data.players.map((p: any) => (
                      <tr key={p.id} className="hover:bg-white/5 transition-colors">
                        <td className="py-2 px-3 flex items-center gap-2">
                          <span className="font-bold text-white">{p.webName}</span>
                          <span className="text-[10px] text-slate-400">({p.teamShortName})</span>
                          {p.isEffectiveCaptain && (
                            <span className="text-[9px] px-1 bg-black text-[#00ff87] font-bold border border-[#00ff87] rounded">
                              {p.multiplier}x C
                            </span>
                          )}
                          {!p.isStartingXI && (
                            <span className="text-[9px] px-1 bg-slate-800 text-slate-400 rounded">
                              Bench
                            </span>
                          )}
                        </td>
                        <td className="py-2 px-2 text-slate-400 text-[11px]">{p.position}</td>
                        <td className="py-2 px-2 text-center text-slate-300">{p.minutes}&apos;</td>
                        <td className="py-2 px-2 text-center text-slate-300">{p.goals}</td>
                        <td className="py-2 px-2 text-center text-slate-300">{p.assists}</td>
                        <td className="py-2 px-2 text-center text-slate-300">{p.cleanSheet ? '✓' : '-'}</td>
                        <td className="py-2 px-3 text-right font-black text-emerald-400">{p.points}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
