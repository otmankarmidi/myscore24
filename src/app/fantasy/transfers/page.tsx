'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import FantasyNav from '@/components/fantasy/FantasyNav'

interface TransferPlayer {
  id: string
  fantasyPlayerId: string
  name: string
  webName: string
  position: 'GKP' | 'DEF' | 'MID' | 'FWD'
  price: number
  totalPoints: number
  teamId: string
  teamName: string
  teamShortName: string
  teamLogo?: string
  photo?: string
  positionIndex: number
}

export default function TransfersPage() {
  const router = useRouter()
  const [squad, setSquad] = useState<any | null>(null)
  const [allPlayers, setAllPlayers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Track transfers pending: slot index -> replacement player
  // If slot is marked for transfer but no replacement picked yet: null
  const [pendingOutSlots, setPendingOutSlots] = useState<Set<number>>(new Set())
  const [pendingInMap, setPendingInMap] = useState<Record<number, any>>({})

  const [activeSlotToFill, setActiveSlotToFill] = useState<number | null>(null)
  const [filterTeam, setFilterTeam] = useState<string>('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'price' | 'totalPoints' | 'name'>('price')

  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([
      fetch('/api/fantasy/squad').then((r) => r.json()),
      fetch('/api/fantasy/players').then((r) => r.json()),
    ])
      .then(([squadRes, playersRes]) => {
        if (squadRes.success && squadRes.squad) {
          setSquad(squadRes.squad)
        }
        if (playersRes.success && playersRes.players) {
          setAllPlayers(playersRes.players)
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  // Squad players mapped by positionIndex (1..15)
  const squadMap = useMemo(() => {
    const map: Record<number, TransferPlayer> = {}
    if (squad?.players) {
      squad.players.forEach((sp: any) => {
        map[sp.positionIndex] = {
          id: sp.player.id,
          fantasyPlayerId: sp.fantasyPlayerId,
          name: sp.player.name,
          webName: sp.player.webName,
          position: sp.player.position,
          price: sp.player.price,
          totalPoints: sp.player.totalPoints,
          teamId: sp.player.teamId,
          teamName: sp.player.teamName,
          teamShortName: sp.player.teamShortName,
          teamLogo: sp.player.teamLogo,
          photo: sp.player.photo,
          positionIndex: sp.positionIndex,
        }
      })
    }
    return map
  }, [squad])

  // Calculation of funds gained / spent
  const transfersCount = pendingOutSlots.size
  const completedTransfersCount = Object.keys(pendingInMap).length

  const fundsGained = useMemo(() => {
    let sum = 0
    pendingOutSlots.forEach((slot) => {
      if (squadMap[slot]) sum += squadMap[slot].price
    })
    return sum
  }, [pendingOutSlots, squadMap])

  const fundsSpent = useMemo(() => {
    let sum = 0
    Object.values(pendingInMap).forEach((p) => {
      if (p) sum += p.price
    })
    return sum
  }, [pendingInMap])

  const currentBank = squad?.bank || 0
  const prospectiveBank = Math.round((currentBank + fundsGained - fundsSpent) * 10) / 10

  // Free transfers and point deduction calculation
  const freeTransfers = squad?.freeTransfers || 1
  const extraTransfers = Math.max(0, transfersCount - freeTransfers)
  const pointCost = extraTransfers * 4

  // Club filter list
  const clubs = useMemo(() => {
    const map = new Map<string, { id: string; name: string }>()
    allPlayers.forEach((p) => {
      if (!map.has(p.teamId)) map.set(p.teamId, { id: p.teamId, name: p.teamName })
    })
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name))
  }, [allPlayers])

  // Available replacements for activeSlotToFill
  const availableReplacements = useMemo(() => {
    if (!activeSlotToFill || !squadMap[activeSlotToFill]) return []
    const requiredPos = squadMap[activeSlotToFill].position

    // All player IDs currently in squad (excluding the ones marked for transfer)
    const activeSquadIds = new Set<string>()
    Object.entries(squadMap).forEach(([sStr, p]) => {
      const s = parseInt(sStr, 10)
      if (!pendingOutSlots.has(s)) {
        activeSquadIds.add(p.id)
      }
    })
    // Also include pendingInMap selections
    Object.entries(pendingInMap).forEach(([sStr, p]) => {
      const s = parseInt(sStr, 10)
      if (s !== activeSlotToFill && p) {
        activeSquadIds.add(p.id)
      }
    })

    return allPlayers
      .filter((p) => {
        if (p.position !== requiredPos) return false
        if (activeSquadIds.has(p.id)) return false
        if (filterTeam !== 'ALL' && p.teamId !== filterTeam) return false

        if (searchQuery.trim().length > 0) {
          const q = searchQuery.toLowerCase()
          if (!p.name.toLowerCase().includes(q) && !p.webName.toLowerCase().includes(q) && !p.teamShortName.toLowerCase().includes(q)) {
            return false
          }
        }
        return true
      })
      .sort((a, b) => {
        if (sortBy === 'price') return b.price - a.price
        if (sortBy === 'totalPoints') return b.totalPoints - a.totalPoints
        return a.webName.localeCompare(b.webName)
      })
  }, [activeSlotToFill, squadMap, pendingOutSlots, pendingInMap, allPlayers, filterTeam, searchQuery, sortBy])

  const handleSell = (slot: number) => {
    setErrorMsg(null)
    setPendingOutSlots((prev) => new Set(prev).add(slot))
    setActiveSlotToFill(slot)
  }

  const handleCancelSell = (slot: number) => {
    setPendingOutSlots((prev) => {
      const copy = new Set(prev)
      copy.delete(slot)
      return copy
    })
    setPendingInMap((prev) => {
      const copy = { ...prev }
      delete copy[slot]
      return copy
    })
    if (activeSlotToFill === slot) setActiveSlotToFill(null)
  }

  const handleSelectReplacement = (player: any) => {
    if (!activeSlotToFill) return
    setErrorMsg(null)

    // Check prospective bank
    const currentReplacementPrice = pendingInMap[activeSlotToFill]?.price || 0
    const netSpend = player.price - currentReplacementPrice
    if (prospectiveBank - netSpend < -0.001) {
      setErrorMsg(`Cannot afford ${player.webName}. Insufficient funds.`)
      return
    }

    setPendingInMap((prev) => ({ ...prev, [activeSlotToFill]: player }))
    setActiveSlotToFill(null)
  }

  const handleConfirmTransfers = async () => {
    setErrorMsg(null)
    setSuccessMsg(null)

    if (transfersCount === 0) {
      setErrorMsg('No transfers have been made.')
      return
    }

    if (completedTransfersCount !== transfersCount) {
      setErrorMsg('Please select replacements for all sold players.')
      return
    }

    if (prospectiveBank < -0.001) {
      setErrorMsg('Budget exceeded. Remaining bank cannot be negative.')
      return
    }

    setSubmitting(true)

    try {
      const payloadTransfers = Array.from(pendingOutSlots).map((slot) => ({
        playerOutId: squadMap[slot].fantasyPlayerId,
        playerInId: pendingInMap[slot].id,
      }))

      const res = await fetch('/api/fantasy/squad/transfers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transfers: payloadTransfers }),
      })

      const data = await res.json()
      if (!res.ok) {
        setErrorMsg(data.error || 'Failed to complete transfers.')
      } else {
        setSuccessMsg(`Transfers successful! Cost: ${data.pointCost} points. Redirecting...`)
        setTimeout(() => {
          router.push('/fantasy/my-team')
        }, 1200)
      }
    } catch {
      setErrorMsg('Network error. Failed to process transfers.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080d1a] text-slate-100 flex flex-col">
        <FantasyNav />
        <div className="flex-1 flex items-center justify-center p-8 text-xs text-slate-400">
          Loading transfer market...
        </div>
      </div>
    )
  }

  if (!squad) {
    return (
      <div className="min-h-screen bg-[#080d1a] text-slate-100 flex flex-col">
        <FantasyNav />
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center max-w-md mx-auto">
          <h2 className="text-xl font-bold text-white mb-2">No Squad Found</h2>
          <p className="text-xs text-slate-400 mb-4">Please build your initial squad first.</p>
          <Link href="/fantasy/create" className="px-5 py-2 rounded-xl bg-emerald-500 text-black font-bold text-xs">
            Create Squad
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#080d1a] text-slate-100 flex flex-col">
      <FantasyNav />

      {/* Transfer Metrics Top Bar */}
      <div className="bg-[#0f172a] border-b border-white/10 py-3 px-4 sm:px-6 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                Free Transfers
              </span>
              <span className="text-lg sm:text-xl font-black text-white">
                {Math.max(0, freeTransfers - transfersCount)}
              </span>
            </div>

            <div className="h-8 w-px bg-white/10 hidden sm:block"></div>

            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                Cost
              </span>
              <span className={`text-lg sm:text-xl font-black ${pointCost > 0 ? 'text-rose-400' : 'text-slate-300'}`}>
                {pointCost > 0 ? `-${pointCost} pts` : '0 pts'}
              </span>
            </div>

            <div className="h-8 w-px bg-white/10 hidden sm:block"></div>

            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                Bank Remaining
              </span>
              <span className={`text-lg sm:text-xl font-black ${prospectiveBank < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                £{prospectiveBank.toFixed(1)}M
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setPendingOutSlots(new Set())
                setPendingInMap({})
                setActiveSlotToFill(null)
              }}
              disabled={transfersCount === 0}
              className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-40 text-slate-300 font-bold text-xs transition-colors cursor-pointer"
            >
              Reset
            </button>

            <button
              onClick={handleConfirmTransfers}
              disabled={submitting || transfersCount === 0 || completedTransfersCount !== transfersCount || prospectiveBank < 0}
              className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-black font-black text-xs transition-colors cursor-pointer flex items-center gap-1.5 shadow-md"
            >
              <span className="material-symbols-outlined text-sm">check</span>
              <span>{submitting ? 'Confirming...' : `Make Transfers (${transfersCount})`}</span>
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="max-w-7xl mx-auto mt-2 p-2.5 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-medium">
            {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="max-w-7xl mx-auto mt-2 p-2.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-medium">
            {successMsg}
          </div>
        )}
      </div>

      {/* Main Container */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Section: 15 Squad Slots */}
        <div className="lg:col-span-7 space-y-2">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-black text-white uppercase tracking-wider">
              Your Current Players
            </h2>
            <span className="text-xs text-slate-400">Click &quot;Sell&quot; to transfer out</span>
          </div>

          <div className="space-y-1.5">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map((slot) => {
              const currentP = squadMap[slot]
              if (!currentP) return null
              const isSold = pendingOutSlots.has(slot)
              const replacement = pendingInMap[slot]

              return (
                <div
                  key={slot}
                  className={`p-3 rounded-xl border flex items-center justify-between transition-colors ${
                    isSold
                      ? 'bg-rose-950/20 border-rose-500/30'
                      : 'bg-[#0f172a] border-white/5 hover:border-white/15'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 font-bold text-slate-300">
                      {currentP.position}
                    </span>

                    {/* Sold player vs Replacement display */}
                    {!isSold ? (
                      <div>
                        <div className="text-xs font-bold text-white flex items-center gap-1.5">
                          <span>{currentP.webName}</span>
                          <span className="text-[10px] text-slate-400 font-normal">({currentP.teamShortName})</span>
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {currentP.totalPoints} pts • £{currentP.price.toFixed(1)}M
                        </div>
                      </div>
                    ) : replacement ? (
                      <div className="flex items-center gap-2">
                        <span className="line-through text-xs text-slate-500">{currentP.webName}</span>
                        <span className="material-symbols-outlined text-xs text-emerald-400">arrow_forward</span>
                        <div>
                          <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                            <span>{replacement.webName}</span>
                            <span className="text-[10px] text-slate-400 font-normal">({replacement.teamShortName})</span>
                          </div>
                          <div className="text-[10px] text-slate-400">£{replacement.price.toFixed(1)}M</div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="line-through text-xs text-slate-500">{currentP.webName}</span>
                        <span className="material-symbols-outlined text-xs text-rose-400">arrow_forward</span>
                        <span className="text-xs font-bold text-rose-400 italic">Select replacement &gt;&gt;</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {!isSold ? (
                      <button
                        onClick={() => handleSell(slot)}
                        className="px-3 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-xs font-bold transition-colors cursor-pointer"
                      >
                        Sell
                      </button>
                    ) : (
                      <button
                        onClick={() => handleCancelSell(slot)}
                        className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Right Section: Replacement Drawer */}
        <div className="lg:col-span-5 bg-[#0f172a] border border-white/10 rounded-2xl p-4 shadow-xl flex flex-col h-[650px]">
          <div className="mb-3">
            <h3 className="text-sm font-black text-white uppercase tracking-wider mb-2">
              {activeSlotToFill && squadMap[activeSlotToFill]
                ? `Pick Replacement for ${squadMap[activeSlotToFill].webName} (${squadMap[activeSlotToFill].position})`
                : 'Replacement Market'}
            </h3>

            {/* Filter controls */}
            <div className="grid grid-cols-2 gap-2 mb-2">
              <select
                value={filterTeam}
                onChange={(e) => setFilterTeam(e.target.value)}
                className="bg-[#1b253b] border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none"
              >
                <option value="ALL">All Clubs</option>
                {clubs.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
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

            <div className="relative">
              <span className="material-symbols-outlined absolute left-2.5 top-2 text-slate-500 text-sm">search</span>
              <input
                type="text"
                placeholder="Search players..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-[#151c2e] border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Replacement List */}
          <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 no-scrollbar">
            {!activeSlotToFill ? (
              <div className="p-8 text-center text-xs text-slate-400">
                Click &quot;Sell&quot; on any player on the left to see available replacements.
              </div>
            ) : availableReplacements.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No matching players available.
              </div>
            ) : (
              availableReplacements.map((player) => (
                <div
                  key={player.id}
                  className="p-2.5 rounded-xl bg-[#151d2e] border border-white/5 hover:border-emerald-500/50 flex items-center justify-between transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-900 border border-white/20 shrink-0">
                      {player.photo ? (
                        <img src={player.photo} alt={player.webName} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-white">
                          {player.position}
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span>{player.webName}</span>
                        <span className="text-[10px] px-1 py-0.2 rounded bg-white/10 text-slate-300">{player.position}</span>
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {player.teamShortName} • {player.totalPoints} pts
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-white">£{player.price.toFixed(1)}M</span>
                    <button
                      onClick={() => handleSelectReplacement(player)}
                      className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs transition-colors cursor-pointer"
                    >
                      Buy
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
