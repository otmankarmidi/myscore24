import Link from 'next/link'
import { TopScorer } from '@/types/standing'
import TeamLogo from '@/components/common/TeamLogo'
import PlayerImage from '@/components/common/PlayerImage'

interface TopScorersTableProps {
  scorers: TopScorer[]
}

export default function TopScorersTable({ scorers }: TopScorersTableProps) {
  if (!scorers || scorers.length === 0) {
    return (
      <div className="bg-surface-container rounded-lg p-8 text-center text-on-surface-variant text-sm border border-surface-bright">
        No top scorers data available for this competition yet.
      </div>
    )
  }

  return (
    <div className="bg-surface-container rounded-lg border border-surface-bright overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container-high border-b border-surface-bright text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
              <th className="py-2.5 px-3 text-center w-10">#</th>
              <th className="py-2.5 px-3">Player</th>
              <th className="py-2.5 px-3">Team</th>
              <th className="py-2.5 px-2 text-center">App</th>
              <th className="py-2.5 px-2 text-center font-extrabold text-primary">Goals</th>
              <th className="py-2.5 px-2 text-center">Assists</th>
              <th className="py-2.5 px-2 text-center hidden md:table-cell">Penalties</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-bright/60 text-body-sm font-geist">
            {scorers.map((item: any, index) => {
              const pName = item.playerName || item.player?.name || 'Player'
              const pSlug = item.playerSlug || item.player?.slug || `player-${item.playerId || index + 1}`
              const photoUrl = item.photo || item.player?.photo
              const tName = item.teamName || item.team?.name || 'Club'
              const tSlug = item.teamSlug || item.team?.slug || 'club'
              const tLogo = item.teamLogo || item.team?.logo

              return (
                <tr key={item.playerId || index} className="hover:bg-surface-container-high/40 transition-colors">
                  <td className="py-2.5 px-3 text-center font-mono text-xs font-bold text-on-surface-variant">
                    {index + 1}
                  </td>

                  <td className="py-2.5 px-3">
                    <Link href={`/player/${pSlug}`} className="flex items-center gap-2.5 hover:underline group">
                      <PlayerImage
                        playerId={item.playerId}
                        photo={photoUrl}
                        name={pName}
                        size="sm"
                      />
                      <span className="font-semibold text-on-surface group-hover:text-primary transition-colors">
                        {pName}
                      </span>
                    </Link>
                  </td>

                  <td className="py-2.5 px-3">
                    <Link href={`/team/${item.teamId || tSlug}`} className="flex items-center gap-2 hover:underline text-on-surface-variant hover:text-on-surface">
                      <TeamLogo name={tName} abbreviation={tName.slice(0, 3)} logo={tLogo} size="xs" />
                      <span className="text-xs">{tName}</span>
                    </Link>
                  </td>

                  <td className="py-2.5 px-2 text-center font-mono text-xs tabular-nums text-on-surface-variant">{item.matches || 0}</td>
                  <td className="py-2.5 px-2 text-center font-mono text-sm font-extrabold tabular-nums text-primary">{item.goals || 0}</td>
                  <td className="py-2.5 px-2 text-center font-mono text-xs tabular-nums text-on-surface-variant">{item.assists || 0}</td>
                  <td className="py-2.5 px-2 text-center font-mono text-xs tabular-nums text-on-surface-variant hidden md:table-cell">{item.penalties || 0}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
