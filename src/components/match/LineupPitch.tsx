'use client'

import { useState } from 'react'
import { LineupPlayer, MatchLineup } from '@/types/match'
import TeamLogo from '@/components/common/TeamLogo'
import PlayerImage from '@/components/common/PlayerImage'
import { useLanguage } from '@/context/LanguageContext'

interface LineupPitchProps {
  lineups: {
    home: MatchLineup
    away: MatchLineup
  }
  homeTeamName: string
  awayTeamName: string
  homeTeamLogo?: string
  awayTeamLogo?: string
}

function RatingBadge({ rating, isLive }: { rating?: number; isLive?: boolean }) {
  if (rating === undefined || rating === null) return null

  let bgClass = 'bg-surface-bright text-on-surface-variant border border-surface-bright'
  if (rating >= 8.0) bgClass = 'bg-emerald-500 text-slate-950 font-bold border border-emerald-400'
  else if (rating >= 7.0) bgClass = 'bg-lime-500 text-slate-950 font-bold border border-lime-400'
  else if (rating >= 6.0) bgClass = 'bg-amber-500 text-slate-950 font-bold border border-amber-400'
  else if (rating < 6.0) bgClass = 'bg-rose-500 text-white font-bold border border-rose-400'

  return (
    <span className={`inline-flex items-center gap-0.5 px-1 py-0.2 rounded text-[10px] tabular-nums leading-none shadow-xs ${bgClass}`}>
      {rating.toFixed(1)}
      {isLive && <span className="w-1 h-1 rounded-full bg-rose-600 animate-pulse ml-0.5" title="Live rating" />}
    </span>
  )
}

function PlayerNode({
  player,
  posX,
  posY,
  isSelected,
  onClick
}: {
  player: LineupPlayer
  posX: number
  posY: number
  isSelected: boolean
  onClick: () => void
}) {
  const displayName = (() => {
    if (!player.name) return 'Player'
    const parts = player.name.trim().split(/\s+/)
    if (parts.length > 1) {
      return `${parts[0].charAt(0)}. ${parts.slice(1).join(' ')}`
    }
    return parts[0]
  })()

  return (
    <button
      onClick={onClick}
      className={`absolute group flex flex-col items-center justify-center transition-transform hover:scale-105 focus:outline-none w-[75px] md:w-[85px] z-10 ${
        isSelected ? 'scale-110 z-20' : ''
      }`}
      style={{
        left: `${posX}%`,
        top: `${posY}%`,
        transform: 'translate(-50%, -50%)',
      }}
    >
      {/* 1. Rating Badge above Shirt Circle (if available) */}
      <div className="h-4 flex items-center justify-center mb-0.5">
        <RatingBadge rating={player.rating} isLive={player.ratingIsLive} />
      </div>

      {/* 2. Player Photo Circle with Number Badge & Events */}
      <div className="relative flex items-center justify-center shrink-0">
        <PlayerImage
          playerId={player.id}
          photo={player.photo}
          name={player.name}
          size="md"
          className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 border-2 border-primary shadow-md group-hover:border-primary-fixed"
        />

        {/* Number badge at bottom-right of player photo */}
        <span className="absolute -bottom-1 -right-1.5 bg-slate-950/95 border border-primary text-[9px] sm:text-[10px] font-geist font-bold text-primary px-1 min-w-[15px] text-center rounded-full leading-none py-0.5 shadow-sm select-none">
          {player.number}
        </span>

        {/* Player Events (Cards & Subs) positioned outside the circle at top-right */}
        <div className="absolute -right-2.5 -top-2.5 flex items-center gap-0.5 z-20 pointer-events-none">
          {player.redCard && (
            <span className="w-2.5 h-3 bg-rose-600 rounded-xs shadow-sm border border-slate-950" title="Red Card" />
          )}
          {player.yellowCard && !player.redCard && (
            <span className="w-2.5 h-3 bg-amber-400 rounded-xs shadow-sm border border-slate-950" title="Yellow Card" />
          )}
          {player.substituted && (
            <span
              className="w-3.5 h-3.5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center border border-slate-950 shadow-sm"
              title="Substituted"
            >
              <span className="material-symbols-outlined text-[9px] font-bold leading-none">sync</span>
            </span>
          )}
        </div>
      </div>

      {/* 3. Player Name Label */}
      <div className="mt-0.5 max-w-full px-1 py-0.5 rounded bg-slate-950/80 backdrop-blur border border-slate-800/80 shadow-xs text-center">
        <span className="block text-[10px] md:text-[11px] font-medium text-slate-100 truncate w-full tracking-tight">
          {displayName}
        </span>
      </div>
    </button>
  )
}

/**
 * Standard formations mapping to row lines (excluding goalkeeper).
 * The sum of outfield lines must equal 10.
 */
const COMMON_FORMATIONS: Record<string, number[]> = {
  '4-3-3': [4, 3, 3],
  '4-2-3-1': [4, 2, 3, 1],
  '3-5-2': [3, 5, 2],
  '4-4-2': [4, 4, 2],
  '3-4-3': [3, 4, 3],
  '5-3-2': [5, 3, 2],
  '4-1-4-1': [4, 1, 4, 1],
  '4-5-1': [4, 5, 1],
  '3-4-2-1': [3, 4, 2, 1],
  '4-1-2-1-2': [4, 1, 2, 1, 2],
  '5-4-1': [5, 4, 1],
}

/**
 * Parse formation string like "4-3-3", "4-2-3-1", "3-5-2" into row count array.
 * Validates that outfield players sum to 10; falls back gracefully.
 */
function parseFormationRows(formationStr?: string): number[] {
  if (!formationStr || typeof formationStr !== 'string') return [4, 3, 3]
  const clean = formationStr.trim().replace(/[^\d-]/g, '')
  if (COMMON_FORMATIONS[clean]) {
    return [...COMMON_FORMATIONS[clean]]
  }
  const parts = clean.split('-').map(p => parseInt(p.trim())).filter(n => !isNaN(n) && n > 0)
  if (parts.length > 0) {
    const sum = parts.reduce((a, b) => a + b, 0)
    if (sum === 10) return parts
    if (sum === 11 && parts[0] === 1) return parts.slice(1) // has GK in formation e.g. 1-4-3-3
  }
  return [4, 3, 3]
}

/**
 * Left-to-right lateral order rating for positions within the same formation line
 * from the team's defensive/attacking perspective:
 * Left flank (lower score) -> Center -> Right flank (higher score)
 */
function getLateralRank(pos?: string): number {
  const p = (pos || '').toUpperCase()

  // Left side
  if (p === 'LB' || p === 'LWB' || p === 'CD-L' || p === 'LCB' || p === 'CB-L') return 10
  if (p === 'LM' || p === 'LWM' || p === 'LW' || p === 'LWF' || p === 'CM-L' || p === 'DM-L' || p === 'LCM' || p === 'LAM' || p === 'AM-L') return 20
  if (p === 'LF' || p === 'LS' || p === 'CF-L') return 30

  // Center
  if (p === 'CB' || p === 'CD' || p === 'SW' || p === 'D') return 50
  if (p === 'CM' || p === 'DM' || p === 'AM' || p === 'M') return 50
  if (p === 'ST' || p === 'CF' || p === 'F' || p === 'FW' || p === 'A') return 50

  // Right side
  if (p === 'RF' || p === 'RS' || p === 'CF-R') return 70
  if (p === 'RM' || p === 'RWM' || p === 'RW' || p === 'RWF' || p === 'CM-R' || p === 'DM-R' || p === 'RCM' || p === 'RAM' || p === 'AM-R') return 80
  if (p === 'RB' || p === 'RWB' || p === 'CD-R' || p === 'RCB' || p === 'CB-R') return 90

  return 50
}

/**
 * Categorize position into general tactical role (GK, DEF, MID, FWD)
 */
function getPositionCategory(pos?: string): 'GK' | 'DEF' | 'MID' | 'FWD' {
  const p = (pos || '').toUpperCase()
  if (p === 'G' || p === 'GK') return 'GK'
  if (p === 'D' || p.includes('B') || p.includes('DF') || p === 'CD' || p === 'SW') return 'DEF'
  if (p === 'M' || p.includes('MID') || p === 'DM' || p === 'AM' || p === 'CM' || p === 'LM' || p === 'RM') return 'MID'
  if (p === 'F' || p === 'A' || p.includes('ST') || p.includes('FW') || p.includes('ATT') || p === 'LW' || p === 'RW' || p.includes('WING')) return 'FWD'
  return 'MID'
}

/**
 * Dynamically calculate X (0-100%) and Y (0-100%) coordinates for each player on the pitch.
 * - Home team occupies top half (Y: 6% - 45%) facing down toward opponent goal.
 * - Away team occupies bottom half (Y: 94% - 55%) facing up toward opponent goal (mirrored).
 * - Preserves exact left-to-right order from the match lineup formation.
 * - Enforces strict boundaries to eliminate overlap with lines, other players, and center circle.
 */
function calculateTeamPositions(
  players: LineupPlayer[],
  formationStr: string | undefined,
  isHome: boolean
): Array<{ player: LineupPlayer; x: number; y: number }> {
  if (!players || players.length === 0) return []

  const outfieldRows = parseFormationRows(formationStr)

  // 1. Identify Goalkeeper
  const gk = players.find(p => p.position === 'GK' || p.position === 'G' || String(p.formationPlace) === '1') || players[0]
  const outfield = players.filter(p => p.id !== gk.id)

  // 2. Partition outfield into rows by formation count, preserving API order
  // If API has formationPlace, use it to ensure left-to-right ordering; otherwise rely on lateral rank / list order
  const sortedOutfield = [...outfield].sort((a, b) => {
    // If formationPlace numbers are available and distinct, sort by formationPlace
    const placeA = parseInt(String(a.formationPlace || '0'))
    const placeB = parseInt(String(b.formationPlace || '0'))
    if (placeA > 0 && placeB > 0 && placeA !== placeB) {
      return placeA - placeB
    }

    // Group by category (DEF -> MID -> FWD)
    const catOrder = { DEF: 1, MID: 2, FWD: 3, GK: 0 }
    const catA = catOrder[getPositionCategory(a.position)] || 2
    const catB = catOrder[getPositionCategory(b.position)] || 2
    if (catA !== catB) return catA - catB

    // Then by lateral position (Left to Right)
    return getLateralRank(a.position) - getLateralRank(b.position)
  })

  const result: Array<{ player: LineupPlayer; x: number; y: number }> = []

  // 3. Goalkeeper placement:
  // Home GK at top 6%, Away GK at bottom 94%
  const gkY = isHome ? 6.5 : 93.5
  result.push({ player: gk, x: 50, y: gkY })

  // 4. Distribute outfield rows strictly within each team's half
  // Home half range: Y from 18% (defenders) to 44% (forwards/strikers) - strictly < 48% (halfway line)
  // Away half range: Y from 82% (defenders) to 56% (forwards/strikers) - strictly > 52% (halfway line)
  const rowCount = outfieldRows.length
  let playerIdx = 0

  for (let r = 0; r < rowCount; r++) {
    const countInRow = outfieldRows[r]
    const rowPlayers = sortedOutfield.slice(playerIdx, playerIdx + countInRow)
    playerIdx += countInRow

    // Sort players within the row from Left to Right (as seen by spectator)
    rowPlayers.sort((a, b) => {
      const placeA = parseInt(String(a.formationPlace || '0'))
      const placeB = parseInt(String(b.formationPlace || '0'))
      if (placeA > 0 && placeB > 0 && placeA !== placeB) {
        return placeA - placeB
      }
      return getLateralRank(a.position) - getLateralRank(b.position)
    })

    // Y calculation (lines progress from defensive to offensive)
    let y = 0
    if (isHome) {
      const startY = 18.5
      const endY = 43.5
      y = rowCount > 1 ? startY + (r / (rowCount - 1)) * (endY - startY) : 31
    } else {
      // Away team is mirrored: defenders are closest to their GK (81.5%), forwards attack toward center (56.5%)
      const startY = 81.5
      const endY = 56.5
      y = rowCount > 1 ? startY - (r / (rowCount - 1)) * (startY - endY) : 69
    }

    // X calculation: evenly distribute across pitch with responsive margins
    const numInRow = rowPlayers.length
    rowPlayers.forEach((player, i) => {
      let x = 50
      if (numInRow === 1) {
        x = 50
      } else {
        // Safe lateral margin (16% to 84%) ensures player names and badges don't clip side touchlines
        const leftMargin = 16
        const span = 68
        // For Home team, left-to-right index maps left-to-right
        // For Away team, mirrored left-to-right orientation maintains spectator consistency
        x = leftMargin + (i / (numInRow - 1)) * span
      }

      result.push({ player, x, y })
    })
  }

  // 5. Handle any leftover players cleanly within team half without overflowing
  if (playerIdx < sortedOutfield.length) {
    const remaining = sortedOutfield.slice(playerIdx)
    const leftoverY = isHome ? 45.5 : 54.5
    remaining.forEach((player, i) => {
      const x = 30 + (i * 20)
      result.push({ player, x: Math.min(Math.max(x, 20), 80), y: leftoverY })
    })
  }

  return result
}

export default function LineupPitch({ lineups, homeTeamName, awayTeamName, homeTeamLogo, awayTeamLogo }: LineupPitchProps) {
  const [viewMode, setViewMode] = useState<'pitch' | 'list'>('pitch')
  const [selectedPlayer, setSelectedPlayer] = useState<LineupPlayer | null>(null)

  const homeStarters: LineupPlayer[] = lineups.home.starters || lineups.home.startingXI || []
  const awayStarters: LineupPlayer[] = lineups.away.starters || lineups.away.startingXI || []
  const homeBench: LineupPlayer[] = lineups.home.bench || lineups.home.substitutes || []
  const awayBench: LineupPlayer[] = lineups.away.bench || lineups.away.substitutes || []

  const homePositions = calculateTeamPositions(homeStarters, lineups.home.formation, true)
  const awayPositions = calculateTeamPositions(awayStarters, lineups.away.formation, false)

  const { t } = useLanguage()

  return (
    <div className="space-y-4">
      {/* Header with Team Formations & View Toggle */}
      <div className="flex items-center justify-between bg-surface-container p-3 rounded-lg border border-surface-bright">
        <div className="flex items-center gap-2">
          <TeamLogo name={homeTeamName} abbreviation={homeTeamName.slice(0, 3)} logo={homeTeamLogo} size="sm" />
          <span className="font-semibold text-body-sm text-on-surface">{homeTeamName} ({lineups.home.formation})</span>
        </div>

        <div className="flex items-center gap-1 bg-surface-container-high p-1 rounded-md">
          <button
            onClick={() => setViewMode('pitch')}
            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
              viewMode === 'pitch' ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            {t('match.lineup.tacticalPitch', 'Tactical Pitch')}
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
              viewMode === 'list' ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            {t('match.lineup.listView', 'List View')}
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-semibold text-body-sm text-on-surface">{awayTeamName} ({lineups.away.formation})</span>
          <TeamLogo name={awayTeamName} abbreviation={awayTeamName.slice(0, 3)} logo={awayTeamLogo} size="sm" />
        </div>
      </div>

      {viewMode === 'pitch' ? (
        /* Pitch Container: minimum responsive heights to prevent vertical crowding */
        <div className="relative w-full min-h-[580px] sm:min-h-[640px] md:min-h-[700px] bg-emerald-950 rounded-xl overflow-hidden border-2 border-emerald-800/80 shadow-inner select-none">
          {/* Pitch Turf & Field Marking overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-950 via-emerald-900 to-emerald-950 opacity-95" />
          <div
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage: `repeating-linear-gradient(0deg, #fff, #fff 1px, transparent 1px, transparent 50px)`
            }}
          />

          {/* Lines & Penalty Areas */}
          <div className="absolute inset-4 border-2 border-emerald-300/35 rounded-sm pointer-events-none">
            {/* Halfway line & Center Circle */}
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-emerald-300/35 -translate-y-1/2" />
            <div className="absolute top-1/2 left-1/2 w-28 h-28 md:w-36 md:h-36 border-2 border-emerald-300/35 rounded-full -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-emerald-300/50 rounded-full -translate-x-1/2 -translate-y-1/2" />

            {/* Top Penalty Box */}
            <div className="absolute top-0 left-1/2 w-1/2 h-1/6 border-b-2 border-x-2 border-emerald-300/35 -translate-x-1/2 rounded-b-sm" />
            <div className="absolute top-0 left-1/2 w-1/4 h-1/12 border-b-2 border-x-2 border-emerald-300/35 -translate-x-1/2" />

            {/* Bottom Penalty Box */}
            <div className="absolute bottom-0 left-1/2 w-1/2 h-1/6 border-t-2 border-x-2 border-emerald-300/35 -translate-x-1/2 rounded-t-sm" />
            <div className="absolute bottom-0 left-1/2 w-1/4 h-1/12 border-t-2 border-x-2 border-emerald-300/35 -translate-x-1/2" />
          </div>

          {/* Home Team Players (Top Half 5% - 46%) */}
          {homePositions.map(({ player, x, y }) => (
            <PlayerNode
              key={player.id}
              player={player}
              posX={x}
              posY={y}
              isSelected={selectedPlayer?.id === player.id}
              onClick={() => setSelectedPlayer(player)}
            />
          ))}

          {/* Away Team Players (Bottom Half 54% - 95%) */}
          {awayPositions.map(({ player, x, y }) => (
            <PlayerNode
              key={player.id}
              player={player}
              posX={x}
              posY={y}
              isSelected={selectedPlayer?.id === player.id}
              onClick={() => setSelectedPlayer(player)}
            />
          ))}
        </div>
      ) : (
        /* List View */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-surface-container rounded-lg p-3 border border-surface-bright">
            <h4 className="text-xs font-bold uppercase tracking-wider text-primary mb-3">
              {homeTeamName} {t('match.lineup.starters', 'Starters')}
            </h4>
            <div className="divide-y divide-surface-bright">
              {homeStarters.map((p) => (
                <div key={p.id} className="py-2 flex items-center justify-between text-body-sm">
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 text-center font-bold text-on-surface-variant text-xs">{p.number}</span>
                    <PlayerImage playerId={p.id} photo={p.photo} name={p.name} size="sm" />
                    <span className="font-medium text-on-surface">{p.name}</span>
                    <span className="text-[10px] text-on-surface-variant uppercase bg-surface-container-high px-1 rounded">
                      {t(`positions.${p.position}`, p.position)}
                    </span>
                  </div>
                  <RatingBadge rating={p.rating} isLive={p.ratingIsLive} />
                </div>
              ))}
            </div>
          </div>

          <div className="bg-surface-container rounded-lg p-3 border border-surface-bright">
            <h4 className="text-xs font-bold uppercase tracking-wider text-primary mb-3">
              {awayTeamName} {t('match.lineup.starters', 'Starters')}
            </h4>
            <div className="divide-y divide-surface-bright">
              {awayStarters.map((p) => (
                <div key={p.id} className="py-2 flex items-center justify-between text-body-sm">
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 text-center font-bold text-on-surface-variant text-xs">{p.number}</span>
                    <PlayerImage playerId={p.id} photo={p.photo} name={p.name} size="sm" />
                    <span className="font-medium text-on-surface">{p.name}</span>
                    <span className="text-[10px] text-on-surface-variant uppercase bg-surface-container-high px-1 rounded">
                      {t(`positions.${p.position}`, p.position)}
                    </span>
                  </div>
                  <RatingBadge rating={p.rating} isLive={p.ratingIsLive} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Substitutes Bench */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-surface-container p-3 rounded-lg border border-surface-bright">
          <h4 className="text-xs font-bold text-on-surface-variant uppercase mb-2">
            {homeTeamName} {t('match.lineup.bench', 'Bench')}
          </h4>
          <div className="space-y-1">
            {homeBench.map((p) => (
              <div key={p.id} className="flex items-center justify-between py-1 text-xs text-on-surface-variant">
                <div className="flex items-center gap-2">
                  <span className="w-4 text-center font-mono text-[11px]">{p.number}</span>
                  <PlayerImage playerId={p.id} photo={p.photo} name={p.name} size="xs" />
                  <span>{p.name}</span>
                </div>
                <RatingBadge rating={p.rating} isLive={p.ratingIsLive} />
              </div>
            ))}
          </div>
          {lineups.home.coach && (
            <div className="mt-3 pt-2 border-t border-surface-bright text-xs text-on-surface-variant">
              <span className="font-semibold">{t('match.lineup.manager', 'Manager')}:</span> {lineups.home.coach}
            </div>
          )}
        </div>

        <div className="bg-surface-container p-3 rounded-lg border border-surface-bright">
          <h4 className="text-xs font-bold text-on-surface-variant uppercase mb-2">
            {awayTeamName} {t('match.lineup.bench', 'Bench')}
          </h4>
          <div className="space-y-1">
            {awayBench.map((p) => (
              <div key={p.id} className="flex items-center justify-between py-1 text-xs text-on-surface-variant">
                <div className="flex items-center gap-2">
                  <span className="w-4 text-center font-mono text-[11px]">{p.number}</span>
                  <PlayerImage playerId={p.id} photo={p.photo} name={p.name} size="xs" />
                  <span>{p.name}</span>
                </div>
                <RatingBadge rating={p.rating} isLive={p.ratingIsLive} />
              </div>
            ))}
          </div>
          {lineups.away.coach && (
            <div className="mt-3 pt-2 border-t border-surface-bright text-xs text-on-surface-variant">
              <span className="font-semibold">{t('match.lineup.manager', 'Manager')}:</span> {lineups.away.coach}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
