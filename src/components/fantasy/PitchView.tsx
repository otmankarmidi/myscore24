'use client'

import React, { useState } from 'react'

export interface PitchPlayer {
  id: string
  fantasyPlayerId: string
  webName: string
  position: 'GKP' | 'DEF' | 'MID' | 'FWD' | string
  positionIndex: number
  price: number
  points?: number
  teamShortName: string
  teamLogo?: string | null
  photo?: string | null
  isStartingXI: boolean
  isCaptain: boolean
  isViceCaptain: boolean
  isEffectiveCaptain?: boolean
  multiplier?: number
  chanceOfPlaying?: number | null
  nextFixture?: {
    opponent: string
    isHome: boolean
    difficulty: number // 1 to 5 (FDR)
  }
}

interface PitchViewProps {
  players: PitchPlayer[]
  onPlayerClick?: (player: PitchPlayer) => void
  selectedPlayerId?: string | null
  showPoints?: boolean
  isReadOnly?: boolean
  activeChip?: string | null
  onMakeCaptain?: (playerId: string) => void
  onMakeViceCaptain?: (playerId: string) => void
  onSwapWithBench?: (starterId: string, benchId: string) => void
}

// FDR (Fixture Difficulty Rating) color coding matching official FPL
const getFdrBg = (difficulty: number = 3) => {
  switch (difficulty) {
    case 1:
    case 2:
      return 'bg-[#00ff87] text-[#37003c]' // Easy (Green)
    case 3:
      return 'bg-[#ebebeb] text-[#37003c]' // Medium (Grey)
    case 4:
      return 'bg-[#ff1751] text-white' // Difficult (Pink/Red)
    case 5:
      return 'bg-[#80072d] text-white' // Very Hard (Dark Maroon)
    default:
      return 'bg-[#ebebeb] text-[#37003c]'
  }
}

export default function PitchView({
  players,
  onPlayerClick,
  selectedPlayerId,
  showPoints = false,
  isReadOnly = false,
  activeChip = null,
  onMakeCaptain,
  onMakeViceCaptain,
  onSwapWithBench,
}: PitchViewProps) {
  const [modalPlayer, setModalPlayer] = useState<PitchPlayer | null>(null)

  const starters = players.filter((p) => p.isStartingXI)
  const bench = players
    .filter((p) => !p.isStartingXI)
    .sort((a, b) => a.positionIndex - b.positionIndex)

  const gkpList = starters.filter((p) => p.position === 'GKP')
  const defList = starters.filter((p) => p.position === 'DEF')
  const midList = starters.filter((p) => p.position === 'MID')
  const fwdList = starters.filter((p) => p.position === 'FWD')

  const handleCardClick = (p: PitchPlayer) => {
    if (onPlayerClick) {
      onPlayerClick(p)
    } else {
      setModalPlayer(p)
    }
  }

  const renderPlayerCard = (p: PitchPlayer, isBenchCard = false) => {
    const isSelected = selectedPlayerId === p.fantasyPlayerId || selectedPlayerId === p.id

    return (
      <div
        key={p.fantasyPlayerId || p.id}
        onClick={() => handleCardClick(p)}
        className={`group flex flex-col items-center cursor-pointer transition-all duration-200 relative select-none ${
          isSelected ? 'scale-110 z-30' : 'hover:scale-105 hover:z-20'
        }`}
        style={{ width: '74px' }}
      >
        {/* Captain (C) / Vice-Captain (V) Badge */}
        {p.isCaptain && (
          <div className="absolute -top-1.5 -left-1.5 z-20 w-5 h-5 rounded-full bg-black text-[#00ff87] font-black text-[10px] flex items-center justify-center border-2 border-[#00ff87] shadow-lg">
            {p.multiplier === 3 ? '3C' : 'C'}
          </div>
        )}
        {p.isViceCaptain && !p.isCaptain && (
          <div className="absolute -top-1.5 -left-1.5 z-20 w-5 h-5 rounded-full bg-[#1e0125] text-[#ffe600] font-black text-[10px] flex items-center justify-center border-2 border-[#ffe600] shadow-lg">
            V
          </div>
        )}

        {/* Player Image / Kit Avatar */}
        <div
          className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden flex items-center justify-center bg-gradient-to-b from-[#25012a] to-[#140017] border-2 transition-all shadow-md relative ${
            isSelected
              ? 'border-[#00ff87] ring-4 ring-[#00ff87]/40 shadow-xl'
              : 'border-white/80 group-hover:border-[#00ff87]'
          }`}
        >
          {p.photo ? (
            <img
              src={p.photo}
              alt={p.webName}
              className="w-full h-full object-cover object-top"
              loading="lazy"
              referrerPolicy="no-referrer"
              onError={(e) => {
                const target = e.target as HTMLElement
                target.style.display = 'none'
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center font-black text-white text-xs">
              {p.position}
            </div>
          )}

          {/* Club badge pill */}
          <div className="absolute bottom-0 right-0 bg-[#37003c] px-1 py-0.2 rounded-tl text-[8px] font-black text-[#00ff87] border-t border-l border-white/20">
            {p.teamShortName}
          </div>
        </div>

        {/* Official FPL 2-Tier Pill */}
        <div className="w-full mt-1 flex flex-col items-center shadow-lg rounded overflow-hidden border border-black/40">
          {/* Top Pill: Surname */}
          <div
            className={`w-full py-0.5 px-1 text-center font-black text-[10px] sm:text-[11px] truncate leading-tight ${
              isSelected ? 'bg-[#00ff87] text-[#37003c]' : 'bg-[#37003c] text-white'
            }`}
          >
            {p.webName}
          </div>

          {/* Bottom Pill: Points, Price, or Next Opponent */}
          <div className="w-full py-0.5 px-1 text-center font-bold text-[9px] sm:text-[10px] bg-white text-[#37003c] leading-tight flex items-center justify-center gap-1">
            {showPoints ? (
              <span className="font-black text-[#37003c]">{p.points ?? 0} pts</span>
            ) : p.nextFixture ? (
              <span
                className={`px-1 rounded text-[8px] font-bold ${getFdrBg(
                  p.nextFixture.difficulty
                )}`}
              >
                {p.nextFixture.opponent} ({p.nextFixture.isHome ? 'H' : 'A'})
              </span>
            ) : (
              <span>£{p.price.toFixed(1)}m</span>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full flex flex-col items-center select-none">
      {/* Official FPL Chips Bar */}
      <div className="w-full max-w-2xl mb-3 flex items-center justify-between gap-1.5 px-2">
        <span className="text-[11px] font-black tracking-wider uppercase text-[#00ff87] flex items-center gap-1">
          <span className="material-symbols-outlined text-sm">electric_bolt</span>
          <span>FPL Chips</span>
        </span>

        <div className="flex items-center gap-1.5 sm:gap-2">
          {[
            { id: '3C', name: 'Triple Captain', icon: 'stars' },
            { id: 'BB', name: 'Bench Boost', icon: 'groups' },
            { id: 'FH', name: 'Free Hit', icon: 'restart_alt' },
            { id: 'WC', name: 'Wildcard', icon: 'local_fire_department' },
          ].map((chip) => {
            const isActive = activeChip === chip.id
            return (
              <div
                key={chip.id}
                title={`${chip.name} Chip`}
                className={`px-2 py-1 rounded-md text-[10px] font-black uppercase flex items-center gap-1 border transition-all ${
                  isActive
                    ? 'bg-[#00ff87] text-[#37003c] border-[#00ff87] shadow-md shadow-[#00ff87]/30'
                    : 'bg-[#37003c]/70 text-slate-300 border-white/15'
                }`}
              >
                <span className="material-symbols-outlined text-xs">{chip.icon}</span>
                <span className="hidden sm:inline">{chip.name}</span>
                <span className="sm:hidden">{chip.id}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Official FPL Pitch Container */}
      <div
        className="w-full max-w-2xl rounded-2xl p-4 sm:p-6 shadow-2xl relative overflow-hidden border-2 border-emerald-500/40"
        style={{
          // Authentic alternate lawn stripes (cut grass)
          background: `
            repeating-linear-gradient(
              90deg,
              #028940,
              #028940 36px,
              #029b48 36px,
              #029b48 72px
            )
          `,
          minHeight: '480px',
        }}
      >
        {/* Pitch Vignette overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse at center, rgba(0,0,0,0) 40%, rgba(0,0,0,0.45) 100%)',
          }}
        />

        {/* Tactical Pitch Lines SVG */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none opacity-40"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Outer Boundary */}
          <rect x="4%" y="3%" width="92%" height="94%" fill="none" stroke="#ffffff" strokeWidth="2.5" />
          {/* Halfway line */}
          <line x1="4%" y1="50%" x2="96%" y2="50%" stroke="#ffffff" strokeWidth="2.5" />
          {/* Center Circle & Spot */}
          <circle cx="50%" cy="50%" r="52" fill="none" stroke="#ffffff" strokeWidth="2.5" />
          <circle cx="50%" cy="50%" r="4" fill="#ffffff" />
          {/* Top Penalty Area */}
          <rect x="24%" y="3%" width="52%" height="18%" fill="none" stroke="#ffffff" strokeWidth="2.5" />
          {/* Top 6-yard Box */}
          <rect x="37%" y="3%" width="26%" height="7%" fill="none" stroke="#ffffff" strokeWidth="2.5" />
          {/* Top Penalty Arc */}
          <path d="M 42% 21% A 30 30 0 0 0 58% 21%" fill="none" stroke="#ffffff" strokeWidth="2.5" />
          {/* Bottom Penalty Area */}
          <rect x="24%" y="79%" width="52%" height="18%" fill="none" stroke="#ffffff" strokeWidth="2.5" />
          {/* Bottom 6-yard Box */}
          <rect x="37%" y="90%" width="26%" height="7%" fill="none" stroke="#ffffff" strokeWidth="2.5" />
          {/* Bottom Penalty Arc */}
          <path d="M 42% 79% A 30 30 0 0 1 58% 79%" fill="none" stroke="#ffffff" strokeWidth="2.5" />
        </svg>

        {/* 4 Tactical Lines: GKP -> DEF -> MID -> FWD */}
        <div className="relative z-10 flex flex-col justify-between h-[440px] sm:h-[480px]">
          {/* Goalkeepers */}
          <div className="flex justify-center items-center gap-6">
            {gkpList.map((p) => renderPlayerCard(p))}
          </div>

          {/* Defenders */}
          <div className="flex justify-around items-center px-1">
            {defList.map((p) => renderPlayerCard(p))}
          </div>

          {/* Midfielders */}
          <div className="flex justify-around items-center px-1">
            {midList.map((p) => renderPlayerCard(p))}
          </div>

          {/* Forwards */}
          <div className="flex justify-center items-center gap-8 sm:gap-12 px-2">
            {fwdList.map((p) => renderPlayerCard(p))}
          </div>
        </div>
      </div>

      {/* Authentic FPL Dugout Bench Container */}
      <div className="w-full max-w-2xl mt-3.5 bg-gradient-to-r from-[#17001c] via-[#2a0033] to-[#17001c] border-2 border-[#37003c] rounded-2xl p-3.5 sm:p-4 shadow-xl">
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00ff87] animate-pulse"></span>
            <span className="text-xs font-black text-white tracking-widest uppercase">
              Substitutes Dugout
            </span>
          </div>
          <span className="text-[10px] font-semibold text-slate-400">
            Outfield order: 1 → 2 → 3
          </span>
        </div>

        <div className="grid grid-cols-4 gap-2 pt-1">
          {bench.map((p, idx) => (
            <div key={p.fantasyPlayerId || p.id} className="flex flex-col items-center">
              <span className="text-[9px] font-black uppercase text-[#00ff87] mb-1 px-1.5 py-0.2 rounded bg-black/40 border border-[#00ff87]/30">
                {idx === 0 ? 'GKP' : `Sub ${idx}`}
              </span>
              {renderPlayerCard(p, true)}
            </div>
          ))}
        </div>
      </div>

      {/* Internal Modal when no external click handler is attached */}
      {modalPlayer && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4"
          onClick={() => setModalPlayer(null)}
        >
          <div
            className="bg-[#240028] border-2 border-[#37003c] rounded-2xl w-full max-w-sm p-5 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close */}
            <button
              onClick={() => setModalPlayer(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 pb-3 border-b border-white/10 mb-4">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-[#37003c] border-2 border-[#00ff87]">
                {modalPlayer.photo ? (
                  <img
                    src={modalPlayer.photo}
                    alt={modalPlayer.webName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-bold text-white text-xs">
                    {modalPlayer.position}
                  </div>
                )}
              </div>
              <div>
                <h3 className="text-base font-black text-white">{modalPlayer.webName}</h3>
                <span className="text-xs text-[#00ff87] font-bold">
                  {modalPlayer.teamShortName} • {modalPlayer.position} • £{modalPlayer.price.toFixed(1)}m
                </span>
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              <div className="bg-[#17001c] p-2.5 rounded-xl border border-white/10 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Points</span>
                <span className="text-xl font-black text-[#00ff87]">{modalPlayer.points ?? 0}</span>
              </div>
              <div className="bg-[#17001c] p-2.5 rounded-xl border border-white/10 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Status</span>
                <span className="text-xs font-black text-emerald-400">Available (100%)</span>
              </div>
            </div>

            {/* Actions if provided */}
            <div className="space-y-2">
              {onMakeCaptain && modalPlayer.isStartingXI && (
                <button
                  onClick={() => {
                    onMakeCaptain(modalPlayer.fantasyPlayerId)
                    setModalPlayer(null)
                  }}
                  disabled={modalPlayer.isCaptain}
                  className="w-full py-2.5 rounded-xl bg-black text-[#00ff87] border-2 border-[#00ff87] font-black text-xs hover:bg-[#00ff87]/15 disabled:opacity-40 transition-colors flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-sm">stars</span>
                  <span>{modalPlayer.isCaptain ? 'Currently Captain' : 'Make Captain (2x Points)'}</span>
                </button>
              )}

              {onMakeViceCaptain && modalPlayer.isStartingXI && (
                <button
                  onClick={() => {
                    onMakeViceCaptain(modalPlayer.fantasyPlayerId)
                    setModalPlayer(null)
                  }}
                  disabled={modalPlayer.isViceCaptain}
                  className="w-full py-2.5 rounded-xl bg-[#17001c] text-[#ffe600] border-2 border-[#ffe600] font-black text-xs hover:bg-[#ffe600]/15 disabled:opacity-40 transition-colors flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-sm">shield</span>
                  <span>{modalPlayer.isViceCaptain ? 'Currently Vice-Captain' : 'Make Vice-Captain'}</span>
                </button>
              )}

              <button
                onClick={() => setModalPlayer(null)}
                className="w-full py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
