import { Match } from '@/types/match'
import TeamLogo from '@/components/common/TeamLogo'
import MatchStatusBadge from '@/components/common/MatchStatusBadge'
import { formatDate } from '@/lib/utils'
import { useTimezone } from '@/context/TimezoneContext'
import Link from 'next/link'

interface MatchH2HProps {
  homeTeamName: string
  awayTeamName: string
  homeTeamLogo?: string
  awayTeamLogo?: string
  history: Match[]
}

export default function MatchH2H({ homeTeamName, awayTeamName, homeTeamLogo, awayTeamLogo, history }: MatchH2HProps) {
  const { activeTimezone } = useTimezone()
  // Calculate win/draw/loss breakdown
  let homeWins = 0
  let awayWins = 0
  let draws = 0

  history.forEach((m) => {
    if (m.score.home !== null && m.score.away !== null) {
      if (m.score.home > m.score.away) homeWins++
      else if (m.score.away > m.score.home) awayWins++
      else draws++
    }
  })

  const total = history.length || 1
  const homePct = Math.round((homeWins / total) * 100)
  const drawPct = Math.round((draws / total) * 100)
  const awayPct = Math.round((awayWins / total) * 100)

  return (
    <div className="space-y-4">
      {/* Summary Card */}
      <div className="bg-surface-container p-4 rounded-lg border border-surface-bright space-y-3">
        <h3 className="text-body-md font-bold text-on-surface">Head to Head Summary</h3>

        <div className="flex items-center justify-between text-body-sm">
          <div className="flex items-center gap-2">
            <TeamLogo name={homeTeamName} abbreviation={homeTeamName.slice(0, 3)} logo={homeTeamLogo} size="sm" />
            <span className="font-semibold text-on-surface">{homeTeamName}</span>
            <span className="text-primary font-bold">({homeWins} Wins)</span>
          </div>

          <div className="text-on-surface-variant font-medium">{draws} Draws</div>

          <div className="flex items-center gap-2">
            <span className="text-secondary font-bold">({awayWins} Wins)</span>
            <span className="font-semibold text-on-surface">{awayTeamName}</span>
            <TeamLogo name={awayTeamName} abbreviation={awayTeamName.slice(0, 3)} logo={awayTeamLogo} size="sm" />
          </div>
        </div>

        {/* Multi-colored bar */}
        <div className="h-3 w-full bg-surface-container-high rounded-full overflow-hidden flex">
          <div style={{ width: `${homePct}%` }} className="bg-primary h-full transition-all" />
          <div style={{ width: `${drawPct}%` }} className="bg-surface-bright h-full transition-all" />
          <div style={{ width: `${awayPct}%` }} className="bg-secondary h-full transition-all" />
        </div>

        <div className="flex justify-between text-[11px] text-on-surface-variant font-mono">
          <span>{homePct}% Home</span>
          <span>{drawPct}% Draw</span>
          <span>{awayPct}% Away</span>
        </div>
      </div>

      {/* Past Matches List */}
      <div className="bg-surface-container rounded-lg border border-surface-bright overflow-hidden">
        <div className="px-4 py-3 bg-surface-container-high border-b border-surface-bright flex items-center justify-between">
          <span className="text-xs font-bold uppercase text-on-surface-variant tracking-wider">Previous Meetings ({history.length})</span>
        </div>

        <div className="divide-y divide-surface-bright">
          {history.length === 0 ? (
            <div className="p-4 text-center text-xs text-on-surface-variant">No previous matches found between these teams</div>
          ) : (
            history.map((match) => (
              <Link
                key={match.id}
                href={`/match/${match.id}`}
                className="p-3 flex items-center justify-between hover:bg-surface-container-high/50 transition-colors"
              >
                <div className="flex items-center gap-2 text-xs text-on-surface-variant shrink-0 w-28">
                  <span>{formatDate(match.kickoff || match.kickoffTime, undefined, activeTimezone)}</span>
                </div>

                <div className="flex-1 flex items-center justify-center gap-3">
                  <span className={`text-body-sm font-semibold ${match.score.home !== null && match.score.away !== null && match.score.home > match.score.away ? 'text-primary' : 'text-on-surface'}`}>
                    {match.homeTeam.name}
                  </span>
                  <div className="px-2 py-0.5 bg-surface-container-lowest rounded font-bold text-body-sm text-on-surface tabular-nums border border-surface-bright">
                    {match.score.home ?? '-'} - {match.score.away ?? '-'}
                  </div>
                  <span className={`text-body-sm font-semibold ${match.score.home !== null && match.score.away !== null && match.score.away > match.score.home ? 'text-secondary' : 'text-on-surface'}`}>
                    {match.awayTeam.name}
                  </span>
                </div>

                <div className="shrink-0 w-24 text-right">
                  <MatchStatusBadge status={match.status} size="sm" />
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
