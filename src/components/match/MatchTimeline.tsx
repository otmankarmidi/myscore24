import { MatchEvent } from '@/types/match'
import PlayerImage from '@/components/common/PlayerImage'

interface MatchTimelineProps {
  events: MatchEvent[]
  homeTeamName: string
  awayTeamName: string
}

function eventIcon(type: MatchEvent['type']): { icon: string; label: string; color: string } {
  switch (type) {
    case 'goal':           return { icon: '⚽', label: 'Goal', color: 'text-secondary-container' }
    case 'yellow_card':    return { icon: '🟨', label: 'Yellow card', color: 'text-yellow-400' }
    case 'red_card':       return { icon: '🟥', label: 'Red card', color: 'text-error' }
    case 'second_yellow':  return { icon: '🟨🟥', label: 'Second yellow', color: 'text-error' }
    case 'substitution':   return { icon: '🔄', label: 'Substitution', color: 'text-outline' }
    case 'var':            return { icon: '📺', label: 'VAR', color: 'text-outline' }
    case 'penalty_scored': return { icon: '⚽P', label: 'Penalty scored', color: 'text-secondary-container' }
    case 'penalty_missed': return { icon: '✗', label: 'Penalty missed', color: 'text-error' }
    default:               return { icon: '•', label: 'Event', color: 'text-outline' }
  }
}

export default function MatchTimeline({ events, homeTeamName, awayTeamName }: MatchTimelineProps) {
  if (!events.length) {
    return (
      <div className="bg-surface-container-low rounded p-4 text-center font-inter text-[13px] text-on-surface-variant">
        No events recorded yet
      </div>
    )
  }

  const sorted = [...events].sort((a, b) => a.minute - b.minute)

  return (
    <div className="bg-surface-container-low rounded p-3">
      <div className="flex items-center justify-between mb-3 font-geist text-[10px] font-bold uppercase tracking-wider text-outline">
        <span className="text-on-surface">{homeTeamName}</span>
        <span>Timeline</span>
        <span className="text-on-surface text-right">{awayTeamName}</span>
      </div>
      <div className="flex flex-col gap-1.5">
        {sorted.map(event => {
          const { icon, label, color } = eventIcon(event.type)
          const isHome = event.team === 'home'

          return (
            <div
              key={event.id}
              className={`flex items-center gap-2 ${isHome ? 'flex-row' : 'flex-row-reverse'}`}
              role="listitem"
              aria-label={`${label}: ${event.playerName} at ${event.minute} minutes`}
            >
              <div className={`flex-1 flex items-center gap-2 ${isHome ? 'justify-start' : 'justify-end flex-row-reverse'}`}>
                <PlayerImage
                  playerId={event.playerId}
                  photo={event.playerPhoto}
                  name={event.playerName}
                  size="xs"
                />
                <span className="font-inter text-[12px] text-on-surface truncate max-w-[140px] md:max-w-[180px]">
                  {event.playerName}
                </span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className={`font-geist font-bold text-[11px] tabular-nums text-outline w-8 ${isHome ? 'text-right' : 'text-left'}`}>
                  {event.minute}&apos;
                </span>
                <span className={`text-[14px] ${color}`} aria-hidden="true">{icon}</span>
              </div>
              <div className="flex-1" />
            </div>
          )
        })}
      </div>
    </div>
  )
}
