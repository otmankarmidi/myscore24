'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import FantasyNav from '@/components/fantasy/FantasyNav'
import PitchView, { PitchPlayer } from '@/components/fantasy/PitchView'

export default function MyTeamPage() {
  const [squad, setSquad] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedPlayer, setSelectedPlayer] = useState<PitchPlayer | null>(null)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const fetchSquad = () => {
    setLoading(true)
    fetch('/api/fantasy/squad')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.squad) {
          setSquad(data.squad)
        } else {
          setSquad(null)
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchSquad()
  }, [])

  const handleMakeCaptain = async (playerId: string) => {
    if (!squad) return
    setSaving(true)
    setMessage(null)

    const updated = squad.players.map((sp: any) => ({
      ...sp,
      isCaptain: sp.fantasyPlayerId === playerId,
      isViceCaptain: sp.isViceCaptain && sp.fantasyPlayerId === playerId ? false : sp.isViceCaptain,
    }))

    await saveTeamArrangement(updated)
  }

  const handleMakeViceCaptain = async (playerId: string) => {
    if (!squad) return
    setSaving(true)
    setMessage(null)

    const updated = squad.players.map((sp: any) => ({
      ...sp,
      isViceCaptain: sp.fantasyPlayerId === playerId,
      isCaptain: sp.isCaptain && sp.fantasyPlayerId === playerId ? false : sp.isCaptain,
    }))

    await saveTeamArrangement(updated)
  }

  const handleSwapWithBench = async (starterId: string, benchId: string) => {
    if (!squad) return
    setSaving(true)
    setMessage(null)

    const starterIdx = squad.players.findIndex((p: any) => p.fantasyPlayerId === starterId)
    const benchIdx = squad.players.findIndex((p: any) => p.fantasyPlayerId === benchId)

    if (starterIdx === -1 || benchIdx === -1) return

    const updated = [...squad.players]
    const p1 = updated[starterIdx]
    const p2 = updated[benchIdx]

    // Swap starting status and positionIndex
    const tempIndex = p1.positionIndex
    const tempIsStarting = p1.isStartingXI

    p1.positionIndex = p2.positionIndex
    p1.isStartingXI = p2.isStartingXI

    p2.positionIndex = tempIndex
    p2.isStartingXI = tempIsStarting

    // If starter was captain/vice, transfer status to player coming on
    if (!p1.isStartingXI) {
      if (p1.isCaptain) {
        p1.isCaptain = false
        p2.isCaptain = true
      }
      if (p1.isViceCaptain) {
        p1.isViceCaptain = false
        p2.isViceCaptain = true
      }
    }

    await saveTeamArrangement(updated)
  }

  const saveTeamArrangement = async (players: any[]) => {
    try {
      const assignments = players.map((sp) => ({
        fantasyPlayerId: sp.fantasyPlayerId,
        positionIndex: sp.positionIndex,
        isStartingXI: sp.isStartingXI,
        isCaptain: sp.isCaptain,
        isViceCaptain: sp.isViceCaptain,
        purchasePrice: sp.purchasePrice,
      }))

      const res = await fetch('/api/fantasy/squad', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ players: assignments }),
      })

      const data = await res.json()
      if (res.ok) {
        setMessage('Lineup updated successfully!')
        setSelectedPlayer(null)
        fetchSquad()
      } else {
        setMessage(data.error || 'Failed to update arrangement.')
      }
    } catch {
      setMessage('Network error. Failed to save.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#110114] text-slate-100 flex flex-col">
        <FantasyNav />
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-xs text-slate-400">
          <div className="w-10 h-10 border-4 border-[#00ff87] border-t-transparent rounded-full animate-spin mb-3"></div>
          <span>Loading your Fantasy team...</span>
        </div>
      </div>
    )
  }

  if (!squad) {
    return (
      <div className="min-h-screen bg-[#110114] text-slate-100 flex flex-col">
        <FantasyNav />
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center max-w-md mx-auto">
          <div className="w-16 h-16 rounded-3xl bg-[#37003c] border-2 border-[#00ff87] flex items-center justify-center text-[#00ff87] mb-4 shadow-xl">
            <span className="material-symbols-outlined text-4xl">sports_soccer</span>
          </div>
          <h2 className="text-2xl font-black text-white mb-2">No Squad Found</h2>
          <p className="text-xs text-slate-300 mb-6 leading-relaxed">
            Please log in or create your 15-player Premier League team to manage your starting XI, captain, and substitutes.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <Link
              href="/fantasy"
              className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-[#00ff87] to-[#00d46f] text-[#37003c] font-black text-xs transition-transform hover:scale-105 shadow-xl text-center"
            >
              Sign In (Admin / User)
            </Link>
            <Link
              href="/fantasy/create"
              className="flex-1 py-3 px-4 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-black text-xs transition-colors border border-white/20 text-center"
            >
              Pick 15 Players Free
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const pitchPlayers: PitchPlayer[] = squad.players.map((sp: any) => ({
    id: sp.id,
    fantasyPlayerId: sp.fantasyPlayerId,
    webName: sp.player?.webName || 'Player',
    position: sp.player?.position || 'MID',
    positionIndex: sp.positionIndex,
    price: sp.player?.price || 5.0,
    points: sp.player?.totalPoints || 0,
    teamShortName: sp.player?.teamShortName || 'PL',
    teamLogo: sp.player?.teamLogo,
    photo: sp.player?.photo,
    isStartingXI: sp.isStartingXI,
    isCaptain: sp.isCaptain,
    isViceCaptain: sp.isViceCaptain,
  }))

  const starters = pitchPlayers.filter((p) => p.isStartingXI)
  const bench = pitchPlayers.filter((p) => !p.isStartingXI)

  return (
    <div className="min-h-screen bg-[#110114] text-slate-100 flex flex-col">
      <FantasyNav />

      {/* Header Bar styled with FPL Plum Banner */}
      <div className="bg-gradient-to-r from-[#37003c] via-[#2a0033] to-[#37003c] border-b-2 border-[#00ff87]/30 py-4 px-4 sm:px-6 shadow-xl">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-2xl font-black text-white tracking-wide">{squad.teamName}</h1>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#00ff87] text-[#37003c] font-black uppercase">
                Gameweek Active
              </span>
            </div>
            <div className="text-xs text-slate-300 flex items-center gap-3 mt-1 font-semibold">
              <span className="text-[#00ff87] font-black">{squad.totalPoints} pts</span>
              <span>•</span>
              <span>Free Transfers: {squad.freeTransfers}</span>
              <span>•</span>
              <span>Squad Value: £{squad.squadValue?.toFixed(1) || '100.0'}m</span>
              <span>•</span>
              <span>Bank: £{squad.bank.toFixed(1)}m</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/fantasy/transfers"
              className="px-4 py-2 rounded-xl bg-[#00ff87] hover:bg-[#00e57a] text-[#37003c] font-black text-xs transition-transform hover:scale-105 flex items-center gap-1.5 shadow-lg"
            >
              <span className="material-symbols-outlined text-sm font-bold">swap_horiz</span>
              <span>Transfers</span>
            </Link>
            <Link
              href="/fantasy/points"
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-black text-xs transition-colors flex items-center gap-1.5 border border-white/20"
            >
              <span className="material-symbols-outlined text-sm">scoreboard</span>
              <span>Points View</span>
            </Link>
          </div>
        </div>

        {message && (
          <div className="max-w-7xl mx-auto mt-3 p-3 rounded-xl bg-[#00ff87]/20 border border-[#00ff87]/50 text-[#00ff87] text-xs font-black shadow-md flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">check_circle</span>
            <span>{message}</span>
          </div>
        )}
      </div>

      {/* Main Pitch View */}
      <div className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 flex flex-col items-center">
        <PitchView
          players={pitchPlayers}
          selectedPlayerId={selectedPlayer?.fantasyPlayerId}
          onPlayerClick={(p) => setSelectedPlayer(p)}
          onMakeCaptain={handleMakeCaptain}
          onMakeViceCaptain={handleMakeViceCaptain}
        />

        {/* Selected Player Action Modal (Official FPL Bottom Drawer Style) */}
        {selectedPlayer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-[#240028] border-2 border-[#37003c] rounded-3xl w-full max-w-sm p-5 shadow-2xl text-white">
              <div className="flex items-center justify-between pb-3 border-b border-white/15 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-[#37003c] border-2 border-[#00ff87] shadow-inner">
                    {selectedPlayer.photo ? (
                      <img
                        src={selectedPlayer.photo}
                        alt={selectedPlayer.webName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-black text-white text-xs">
                        {selectedPlayer.position}
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white">{selectedPlayer.webName}</h3>
                    <span className="text-xs text-[#00ff87] font-bold">
                      {selectedPlayer.teamShortName} • {selectedPlayer.position} • £{selectedPlayer.price.toFixed(1)}m
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedPlayer(null)}
                  className="text-slate-400 hover:text-white"
                >
                  <span className="material-symbols-outlined text-xl">close</span>
                </button>
              </div>

              <div className="space-y-2.5">
                {selectedPlayer.isStartingXI ? (
                  <>
                    <button
                      onClick={() => handleMakeCaptain(selectedPlayer.fantasyPlayerId)}
                      disabled={saving || selectedPlayer.isCaptain}
                      className="w-full py-2.5 rounded-xl bg-black text-[#00ff87] border-2 border-[#00ff87] hover:bg-[#00ff87]/15 disabled:opacity-40 font-black text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
                    >
                      <span className="material-symbols-outlined text-base">stars</span>
                      <span>
                        {selectedPlayer.isCaptain ? 'Currently Captain (2x Points)' : 'Make Captain (2x Points)'}
                      </span>
                    </button>

                    <button
                      onClick={() => handleMakeViceCaptain(selectedPlayer.fantasyPlayerId)}
                      disabled={saving || selectedPlayer.isViceCaptain}
                      className="w-full py-2.5 rounded-xl bg-[#17001c] text-[#ffe600] border-2 border-[#ffe600] hover:bg-[#ffe600]/15 disabled:opacity-40 font-black text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
                    >
                      <span className="material-symbols-outlined text-base">shield</span>
                      <span>
                        {selectedPlayer.isViceCaptain ? 'Currently Vice-Captain' : 'Make Vice-Captain'}
                      </span>
                    </button>

                    {/* Swap with bench */}
                    <div className="pt-3 border-t border-white/10">
                      <span className="text-[11px] text-slate-300 font-black uppercase tracking-wider block mb-2">
                        Substitute with Bench Player:
                      </span>
                      <div className="space-y-1.5">
                        {bench.map((b) => (
                          <button
                            key={b.fantasyPlayerId}
                            onClick={() =>
                              handleSwapWithBench(selectedPlayer.fantasyPlayerId, b.fantasyPlayerId)
                            }
                            disabled={saving}
                            className="w-full py-2 px-3 rounded-xl bg-[#140017] hover:bg-white/10 border border-white/10 text-xs font-bold text-slate-200 hover:text-white flex items-center justify-between transition-colors cursor-pointer"
                          >
                            <span className="flex items-center gap-2">
                              <span className="material-symbols-outlined text-sm text-[#00ff87]">
                                swap_vert
                              </span>
                              <span>
                                {b.webName} ({b.position} • {b.teamShortName})
                              </span>
                            </span>
                            <span className="text-[#00ff87] text-[10px] font-black uppercase px-2 py-0.5 rounded bg-[#00ff87]/15 border border-[#00ff87]/30">
                              Sub In
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="space-y-2">
                    <span className="text-[11px] text-slate-300 font-black uppercase tracking-wider block">
                      Substitute with Starter:
                    </span>
                    <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                      {starters.map((s) => (
                        <button
                          key={s.fantasyPlayerId}
                          onClick={() =>
                            handleSwapWithBench(s.fantasyPlayerId, selectedPlayer.fantasyPlayerId)
                          }
                          disabled={saving}
                          className="w-full py-2 px-3 rounded-xl bg-[#140017] hover:bg-white/10 border border-white/10 text-xs font-bold text-slate-200 hover:text-white flex items-center justify-between transition-colors cursor-pointer"
                        >
                          <span className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm text-[#00ff87]">
                              swap_vert
                            </span>
                            <span>
                              {s.webName} ({s.position} • {s.teamShortName})
                            </span>
                          </span>
                          <span className="text-[#00ff87] text-[10px] font-black uppercase px-2 py-0.5 rounded bg-[#00ff87]/15 border border-[#00ff87]/30">
                            Sub In
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
