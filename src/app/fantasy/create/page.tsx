'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import FantasyNav from '@/components/fantasy/FantasyNav'
import PitchView, { PitchPlayer } from '@/components/fantasy/PitchView'
import { useLanguage } from '@/context/LanguageContext'

interface PlayerItem {
  id: string
  name: string
  webName: string
  teamId: string
  teamName: string
  teamShortName: string
  teamLogo?: string
  position: 'GKP' | 'DEF' | 'MID' | 'FWD'
  price: number
  totalPoints: number
  photo?: string
  status: string
}

const DEFAULT_FORMATION = {
  GKP: 1,
  DEF: 4,
  MID: 4,
  FWD: 2,
}

export default function CreateSquadPage() {
  const router = useRouter()
  const { locale } = useLanguage()

  const [allPlayers, setAllPlayers] = useState<PlayerItem[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'pitch' | 'list'>('pitch')

  // Selected squad: map of position index 1..15 -> PlayerItem
  const [selectedSquad, setSelectedSquad] = useState<Record<number, PlayerItem>>({})
  const [captainSlot, setCaptainSlot] = useState<number>(10) // default forward slot
  const [viceCaptainSlot, setViceCaptainSlot] = useState<number>(9) // default mid slot

  // Active slot being picked (1..15)
  const [activeSlot, setActiveSlot] = useState<number | null>(null)

  // Filters for player drawer
  const [filterPos, setFilterPos] = useState<string>('ALL')
  const [filterTeam, setFilterTeam] = useState<string>('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'price' | 'totalPoints' | 'name'>('price')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null)

  // Fetch players catalogue on mount
  useEffect(() => {
    fetch('/api/fantasy/players')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.players) {
          setAllPlayers(data.players)
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  // Check if user already has squad
  useEffect(() => {
    fetch('/api/fantasy/squad')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.squad && data.squad.players?.length === 15) {
          // Populate existing squad
          const map: Record<number, PlayerItem> = {}
          let cap = 1
          let vcap = 2
          data.squad.players.forEach((sp: any) => {
            map[sp.positionIndex] = {
              id: sp.player.id,
              name: sp.player.name,
              webName: sp.player.webName,
              teamId: sp.player.teamId,
              teamName: sp.player.teamName,
              teamShortName: sp.player.teamShortName,
              teamLogo: sp.player.teamLogo,
              position: sp.player.position,
              price: sp.player.price,
              totalPoints: sp.player.totalPoints,
              photo: sp.player.photo,
              status: sp.player.status,
            }
            if (sp.isCaptain) cap = sp.positionIndex
            if (sp.isViceCaptain) vcap = sp.positionIndex
          })
          setSelectedSquad(map)
          setCaptainSlot(cap)
          setViceCaptainSlot(vcap)
        }
      })
      .catch(() => {})
  }, [])

  // Position slots definition:
  // 1: GKP (Starter)
  // 2-5: DEF (Starters)
  // 6-9: MID (Starters)
  // 10-11: FWD (Starters)
  // 12: GKP (Sub)
  // 13: DEF (Sub 1)
  // 14: MID (Sub 2)
  // 15: FWD (Sub 3)
  const slotPositions: Record<number, 'GKP' | 'DEF' | 'MID' | 'FWD'> = {
    1: 'GKP',
    2: 'DEF',
    3: 'DEF',
    4: 'DEF',
    5: 'DEF',
    6: 'MID',
    7: 'MID',
    8: 'MID',
    9: 'MID',
    10: 'FWD',
    11: 'FWD',
    12: 'GKP',
    13: 'DEF',
    14: 'MID',
    15: 'FWD',
  }

  // Calculate totals
  const selectedCount = Object.keys(selectedSquad).length
  const totalCost = Object.values(selectedSquad).reduce((sum, p) => sum + p.price, 0)
  const remainingBudget = Math.max(0, Math.round((100.0 - totalCost) * 10) / 10)

  // Club counts
  const clubCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    Object.values(selectedSquad).forEach((p) => {
      counts[p.teamId] = (counts[p.teamId] || 0) + 1
    })
    return counts
  }, [selectedSquad])

  // Unique clubs list for filter
  const clubs = useMemo(() => {
    const map = new Map<string, { id: string; name: string }>()
    allPlayers.forEach((p) => {
      if (!map.has(p.teamId)) {
        map.set(p.teamId, { id: p.teamId, name: p.teamName })
      }
    })
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name))
  }, [allPlayers])

  // Filtered catalogue for active slot
  const targetPosition = activeSlot ? slotPositions[activeSlot] : filterPos

  const filteredPlayers = useMemo(() => {
    const selectedIds = new Set(Object.values(selectedSquad).map((p) => p.id))

    return allPlayers
      .filter((p) => {
        // Position match
        if (activeSlot && p.position !== slotPositions[activeSlot]) return false
        if (!activeSlot && filterPos !== 'ALL' && p.position !== filterPos) return false

        // Club match
        if (filterTeam !== 'ALL' && p.teamId !== filterTeam) return false

        // Search match
        if (searchQuery.trim().length > 0) {
          const q = searchQuery.toLowerCase()
          if (!p.name.toLowerCase().includes(q) && !p.webName.toLowerCase().includes(q) && !p.teamShortName.toLowerCase().includes(q)) {
            return false
          }
        }

        // Already in squad?
        if (selectedIds.has(p.id)) return false

        return true
      })
      .sort((a, b) => {
        if (sortBy === 'price') return b.price - a.price
        if (sortBy === 'totalPoints') return b.totalPoints - a.totalPoints
        return a.webName.localeCompare(b.webName)
      })
  }, [allPlayers, activeSlot, filterPos, filterTeam, searchQuery, sortBy, selectedSquad])

  // Select player into slot
  const handleSelectPlayer = (player: PlayerItem) => {
    if (!activeSlot) return

    // Check club limit
    const currentClubCount = clubCounts[player.teamId] || 0
    const currentSlotPlayer = selectedSquad[activeSlot]
    const netClubCount = currentSlotPlayer?.teamId === player.teamId ? currentClubCount : currentClubCount + 1

    if (netClubCount > 3) {
      setSaveError(`Cannot have more than 3 players from ${player.teamName}.`)
      return
    }

    // Check budget
    const currentSlotPrice = currentSlotPlayer?.price || 0
    const newTotalCost = totalCost - currentSlotPrice + player.price
    if (newTotalCost > 100.001) {
      setSaveError(`Budget exceeded. Player costs £${player.price.toFixed(1)}M, but only £${(100.0 - (totalCost - currentSlotPrice)).toFixed(1)}M remaining.`)
      return
    }

    setSaveError(null)
    setSelectedSquad((prev) => ({ ...prev, [activeSlot]: player }))

    // Auto advance to next empty slot
    const emptySlot = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].find(
      (slot) => slot !== activeSlot && !selectedSquad[slot]
    )
    setActiveSlot(emptySlot || null)
  }

  // Remove player from slot
  const handleRemoveSlot = (slot: number) => {
    setSelectedSquad((prev) => {
      const copy = { ...prev }
      delete copy[slot]
      return copy
    })
  }

  // Auto-fill remaining empty slots deterministically within remaining budget
  const handleAutoPick = () => {
    setSaveError(null)
    const newSquad = { ...selectedSquad }
    const counts = { ...clubCounts }
    let currentCost = Object.values(newSquad).reduce((sum, p) => sum + p.price, 0)

    for (let slot = 1; slot <= 15; slot++) {
      if (newSquad[slot]) continue

      const pos = slotPositions[slot]
      const selectedIds = new Set(Object.values(newSquad).map((p) => p.id))
      const budgetPerRemainingSlot = (100.0 - currentCost) / (16 - slot)

      // Find best affordable player in this position
      const candidate = allPlayers.find((p) => {
        if (p.position !== pos) return false
        if (selectedIds.has(p.id)) return false
        if ((counts[p.teamId] || 0) >= 3) return false
        if (currentCost + p.price > 100.001) return false
        return true
      })

      if (candidate) {
        newSquad[slot] = candidate
        counts[candidate.teamId] = (counts[candidate.teamId] || 0) + 1
        currentCost += candidate.price
      }
    }

    setSelectedSquad(newSquad)
    setActiveSlot(null)
  }

  // Save full squad
  const handleSaveSquad = async () => {
    setSaveError(null)
    setSaveSuccess(null)

    if (selectedCount !== 15) {
      setSaveError(`Please pick all 15 players before saving (currently ${selectedCount}/15).`)
      return
    }

    if (totalCost > 100.001) {
      setSaveError(`Your squad cost (£${totalCost.toFixed(1)}M) exceeds the £100.0M budget limit.`)
      return
    }

    setSaving(true)

    try {
      const assignments = Object.entries(selectedSquad).map(([slotStr, player]) => {
        const slot = parseInt(slotStr, 10)
        return {
          fantasyPlayerId: player.id,
          positionIndex: slot,
          isStartingXI: slot <= 11,
          isCaptain: slot === captainSlot,
          isViceCaptain: slot === viceCaptainSlot,
          purchasePrice: player.price,
        }
      })

      const res = await fetch('/api/fantasy/squad', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ players: assignments }),
      })

      const data = await res.json()

      if (!res.ok) {
        setSaveError(data.error || 'Failed to save squad.')
      } else {
        setSaveSuccess('Squad successfully confirmed! Redirecting to My Team...')
        setTimeout(() => {
          router.push('/fantasy/my-team')
        }, 1200)
      }
    } catch {
      setSaveError('Network error while saving squad. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  // Format pitch players array
  const pitchPlayers: PitchPlayer[] = useMemo(() => {
    return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map((slot) => {
      const p = selectedSquad[slot]
      if (p) {
        return {
          id: p.id,
          fantasyPlayerId: p.id,
          webName: p.webName,
          position: p.position,
          positionIndex: slot,
          price: p.price,
          points: p.totalPoints,
          teamShortName: p.teamShortName,
          teamLogo: p.teamLogo,
          photo: p.photo,
          isStartingXI: slot <= 11,
          isCaptain: slot === captainSlot,
          isViceCaptain: slot === viceCaptainSlot,
        }
      }
      return {
        id: `empty_${slot}`,
        fantasyPlayerId: `empty_${slot}`,
        webName: `+ ${slotPositions[slot]}`,
        position: slotPositions[slot],
        positionIndex: slot,
        price: 0,
        teamShortName: '',
        isStartingXI: slot <= 11,
        isCaptain: false,
        isViceCaptain: false,
      }
    })
  }, [selectedSquad, captainSlot, viceCaptainSlot])

  return (
    <div className="min-h-screen bg-[#080d1a] text-slate-100 flex flex-col">
      <FantasyNav />

      {/* Top Bar: Squad Metrics */}
      <div className="bg-[#0f172a] border-b border-white/10 py-3 px-4 sm:px-6 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                Remaining Budget
              </span>
              <span
                className={`text-lg sm:text-xl font-black ${
                  remainingBudget < 0 ? 'text-rose-400' : 'text-emerald-400'
                }`}
              >
                £{remainingBudget.toFixed(1)}M
              </span>
            </div>

            <div className="h-8 w-px bg-white/10 hidden sm:block"></div>

            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                Squad Selection
              </span>
              <span className="text-lg sm:text-xl font-black text-white">
                {selectedCount}/15
              </span>
            </div>

            <div className="h-8 w-px bg-white/10 hidden sm:block"></div>

            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                Squad Value
              </span>
              <span className="text-lg sm:text-xl font-black text-white">
                £{totalCost.toFixed(1)}M
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleAutoPick}
              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-sm">auto_fix_high</span>
              <span>Auto Pick</span>
            </button>

            <button
              onClick={() => setSelectedSquad({})}
              className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 font-bold text-xs transition-colors cursor-pointer"
            >
              Reset
            </button>

            <button
              onClick={handleSaveSquad}
              disabled={saving || selectedCount !== 15 || remainingBudget < 0}
              className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-black font-black text-xs transition-colors cursor-pointer flex items-center gap-1.5 shadow-md"
            >
              <span className="material-symbols-outlined text-sm">check_circle</span>
              <span>{saving ? 'Saving...' : 'Enter Squad'}</span>
            </button>
          </div>
        </div>

        {/* Feedback Messages */}
        {saveError && (
          <div className="max-w-7xl mx-auto mt-2 p-2.5 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-medium flex items-center justify-between">
            <span>{saveError}</span>
            <button onClick={() => setSaveError(null)} className="text-rose-400 font-bold">×</button>
          </div>
        )}
        {saveSuccess && (
          <div className="max-w-7xl mx-auto mt-2 p-2.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-medium">
            {saveSuccess}
          </div>
        )}
      </div>

      {/* Main Workspace: Pitch/List View + Player Drawer */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left / Main Section: Pitch */}
        <div className="lg:col-span-7 flex flex-col items-center">
          {/* View Toggle */}
          <div className="w-full flex items-center justify-between mb-3">
            <div className="flex items-center gap-1 bg-[#151c2e] p-1 rounded-lg border border-white/10">
              <button
                onClick={() => setViewMode('pitch')}
                className={`px-3 py-1 rounded-md text-xs font-bold transition-colors ${
                  viewMode === 'pitch' ? 'bg-emerald-500 text-black' : 'text-slate-400 hover:text-white'
                }`}
              >
                Pitch View
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1 rounded-md text-xs font-bold transition-colors ${
                  viewMode === 'list' ? 'bg-emerald-500 text-black' : 'text-slate-400 hover:text-white'
                }`}
              >
                List View
              </button>
            </div>

            <div className="text-[11px] text-slate-400">
              Click a player to assign <span className="font-bold text-[#00ff87]">Captain (C)</span> or replace
            </div>
          </div>

          {viewMode === 'pitch' ? (
            <PitchView
              players={pitchPlayers}
              selectedPlayerId={activeSlot ? `empty_${activeSlot}` : undefined}
              onPlayerClick={(p) => {
                setActiveSlot(p.positionIndex)
              }}
            />
          ) : (
            <div className="w-full bg-[#111928] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
              <div className="p-3 bg-white/5 border-b border-white/10 text-xs font-bold uppercase tracking-wider text-slate-300">
                Current 15-Man Roster
              </div>
              <div className="divide-y divide-white/5">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map((slot) => {
                  const p = selectedSquad[slot]
                  return (
                    <div
                      key={slot}
                      onClick={() => setActiveSlot(slot)}
                      className={`p-3 flex items-center justify-between cursor-pointer transition-colors ${
                        activeSlot === slot ? 'bg-white/10' : 'hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-[11px] font-bold text-slate-500 w-6">#{slot}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 font-bold text-slate-300">
                          {slotPositions[slot]}
                        </span>
                        {p ? (
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white">{p.name}</span>
                            <span className="text-[10px] text-slate-400">({p.teamShortName})</span>
                            {slot === captainSlot && (
                              <span className="text-[9px] px-1 bg-black text-emerald-400 font-bold border border-emerald-400 rounded">C</span>
                            )}
                            {slot === viceCaptainSlot && (
                              <span className="text-[9px] px-1 bg-slate-800 text-yellow-400 font-bold border border-yellow-400 rounded">V</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-500 italic">+ Empty slot</span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {p && (
                          <>
                            <span className="text-xs font-bold text-emerald-400">£{p.price.toFixed(1)}M</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleRemoveSlot(slot)
                              }}
                              className="p-1 rounded text-slate-500 hover:text-rose-400"
                            >
                              <span className="material-symbols-outlined text-sm">delete</span>
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Captaincy Selection Bar */}
          {selectedCount >= 11 && (
            <div className="w-full max-w-2xl mt-4 bg-[#111928] border border-white/10 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs">
                <span className="font-bold text-white">Captain:</span>
                <select
                  value={captainSlot}
                  onChange={(e) => setCaptainSlot(parseInt(e.target.value, 10))}
                  className="bg-[#1b253b] border border-white/10 rounded-lg px-2.5 py-1 text-xs text-emerald-400 font-bold focus:outline-none"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((s) => (
                    <option key={s} value={s}>
                      {selectedSquad[s] ? `${selectedSquad[s].webName} (${slotPositions[s]})` : `Slot #${s}`}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="font-bold text-white">Vice-Captain:</span>
                <select
                  value={viceCaptainSlot}
                  onChange={(e) => setViceCaptainSlot(parseInt(e.target.value, 10))}
                  className="bg-[#1b253b] border border-white/10 rounded-lg px-2.5 py-1 text-xs text-yellow-400 font-bold focus:outline-none"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((s) => (
                    <option key={s} value={s}>
                      {selectedSquad[s] ? `${selectedSquad[s].webName} (${slotPositions[s]})` : `Slot #${s}`}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Right Section: Player Catalogue Drawer */}
        <div className="lg:col-span-5 bg-[#0f172a] border border-white/10 rounded-2xl p-4 shadow-xl flex flex-col h-[650px]">
          <div className="mb-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <span>Player Selection</span>
                {activeSlot && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                    Slot #{activeSlot} ({slotPositions[activeSlot]})
                  </span>
                )}
              </h3>
              <span className="text-[11px] text-slate-400">
                {filteredPlayers.length} available
              </span>
            </div>

            {/* Position Filter Pills */}
            <div className="grid grid-cols-5 gap-1 mb-2">
              {['ALL', 'GKP', 'DEF', 'MID', 'FWD'].map((pos) => (
                <button
                  key={pos}
                  onClick={() => {
                    setActiveSlot(null)
                    setFilterPos(pos)
                  }}
                  className={`py-1 rounded-md text-[11px] font-bold transition-colors ${
                    (!activeSlot && filterPos === pos) || (activeSlot && slotPositions[activeSlot] === pos)
                      ? 'bg-emerald-500 text-black'
                      : 'bg-white/5 text-slate-400 hover:text-white'
                  }`}
                >
                  {pos}
                </button>
              ))}
            </div>

            {/* Club Filter & Search */}
            <div className="grid grid-cols-2 gap-2 mb-2">
              <select
                value={filterTeam}
                onChange={(e) => setFilterTeam(e.target.value)}
                className="bg-[#1b253b] border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none"
              >
                <option value="ALL">All Clubs</option>
                {clubs.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-[#1b253b] border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none"
              >
                <option value="price">Highest Price</option>
                <option value="totalPoints">Highest Points</option>
                <option value="name">Name A-Z</option>
              </select>
            </div>

            {/* Search Input */}
            <div className="relative">
              <span className="material-symbols-outlined absolute left-2.5 top-2 text-slate-500 text-sm">
                search
              </span>
              <input
                type="text"
                placeholder="Search player name or club..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-[#151c2e] border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Player Catalogue List */}
          <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 no-scrollbar">
            {loading ? (
              <div className="p-8 text-center text-xs text-slate-400">Loading players...</div>
            ) : filteredPlayers.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No players match your filters.
              </div>
            ) : (
              filteredPlayers.map((player) => {
                const clubCount = clubCounts[player.teamId] || 0
                const isClubMaxed = clubCount >= 3
                const canAfford = player.price <= remainingBudget

                return (
                  <div
                    key={player.id}
                    className={`p-2.5 rounded-xl border flex items-center justify-between transition-colors ${
                      isClubMaxed
                        ? 'bg-white/5 border-white/5 opacity-50'
                        : 'bg-[#151d2e] border-white/5 hover:border-emerald-500/50 hover:bg-[#1a243a]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-full overflow-hidden bg-slate-900 border border-white/20 shrink-0">
                        {player.photo ? (
                          <img
                            src={player.photo}
                            alt={player.webName}
                            className="w-full h-full object-cover object-top"
                            loading="lazy"
                            onError={(e) => {
                              ;(e.target as HTMLElement).style.display = 'none'
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-slate-400">
                            {player.position}
                          </div>
                        )}
                      </div>

                      <div>
                        <div className="text-xs font-bold text-white flex items-center gap-1.5">
                          <span>{player.webName}</span>
                          <span className="text-[10px] px-1 py-0.2 rounded bg-white/10 text-slate-300">
                            {player.position}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1">
                          <span>{player.teamShortName}</span>
                          <span>•</span>
                          <span>{player.totalPoints} pts</span>
                          {clubCount > 0 && (
                            <span className="text-emerald-400">({clubCount}/3)</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-white">
                        £{player.price.toFixed(1)}M
                      </span>
                      <button
                        onClick={() => {
                          if (!activeSlot) {
                            // Find first empty slot for this position
                            const emptySlot = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].find(
                              (s) => slotPositions[s] === player.position && !selectedSquad[s]
                            )
                            if (emptySlot) {
                              setActiveSlot(emptySlot)
                              handleSelectPlayer(player)
                            } else {
                              setSaveError(`All ${player.position} slots are already filled. Click a slot on the pitch to replace.`)
                            }
                          } else {
                            handleSelectPlayer(player)
                          }
                        }}
                        disabled={isClubMaxed}
                        className="w-7 h-7 rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:opacity-30 text-black font-black flex items-center justify-center cursor-pointer transition-colors shadow-sm"
                        title="Add Player"
                      >
                        <span className="material-symbols-outlined text-sm">add</span>
                      </button>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
