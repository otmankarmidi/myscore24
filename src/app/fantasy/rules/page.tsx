'use client'

import FantasyNav from '@/components/fantasy/FantasyNav'

export default function RulesPage() {
  return (
    <div className="min-h-screen bg-[#080d1a] text-slate-100 flex flex-col">
      <FantasyNav />

      {/* Top Banner */}
      <div className="bg-[#0f172a] border-b border-white/10 py-8 px-4 sm:px-6 shadow-sm">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold mb-2">
            <span>Official Rulebook</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            MyScore24 Fantasy Football Rules
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Standard regulations, scoring matrix, squad constraints, and transfer mechanisms for the Premier League 2026/27 season.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 space-y-6 text-xs leading-relaxed">
        {/* Section 1: Squad Selection */}
        <div className="bg-[#0f172a] border border-white/10 rounded-2xl p-5 shadow-xl">
          <h2 className="text-sm font-black text-white uppercase tracking-wider mb-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-emerald-400 text-base">group</span>
            <span>1. Squad Selection &amp; Budget</span>
          </h2>
          <div className="space-y-2 text-slate-300">
            <p>
              Every manager is allocated a virtual starting budget of <strong className="text-emerald-400">£100.0M</strong>. Your squad must consist of exactly <strong>15 players</strong>:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-400">
              <li><strong>2 Goalkeepers (GKP)</strong></li>
              <li><strong>5 Defenders (DEF)</strong></li>
              <li><strong>5 Midfielders (MID)</strong></li>
              <li><strong>3 Forwards (FWD)</strong></li>
            </ul>
            <p className="mt-2 text-amber-300/90 font-medium">
              Club Limit: You can select up to a maximum of 3 players from any single Premier League club.
            </p>
          </div>
        </div>

        {/* Section 2: Formations & Lineups */}
        <div className="bg-[#0f172a] border border-white/10 rounded-2xl p-5 shadow-xl">
          <h2 className="text-sm font-black text-white uppercase tracking-wider mb-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-emerald-400 text-base">format_list_numbered</span>
            <span>2. Formations, Captains &amp; Substitutions</span>
          </h2>
          <div className="space-y-2 text-slate-300">
            <p>
              Prior to each gameweek deadline, select a <strong>Starting XI of 11 players</strong> and rank your 4 substitutes on the bench (1 backup goalkeeper + 3 outfield players in priority order 1, 2, 3).
            </p>
            <p>
              Your Starting XI must satisfy the following structural requirements:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-400">
              <li>Exactly 1 Goalkeeper</li>
              <li>At least 3 Defenders (3 to 5)</li>
              <li>At least 2 Midfielders (2 to 5)</li>
              <li>At least 1 Forward (1 to 3)</li>
            </ul>
            <p className="mt-2">
              <strong>Captain (2x Points):</strong> Select one player from your Starting XI as Captain. Their points will be doubled.
            </p>
            <p>
              <strong>Vice-Captain:</strong> If your Captain plays 0 minutes, double points automatically transfer to your nominated Vice-Captain.
            </p>
            <p>
              <strong>Automatic Substitutions:</strong> If a starter does not play a single minute, they are automatically replaced at the end of the gameweek by the highest-priority bench player who played, provided the formation remains valid.
            </p>
          </div>
        </div>

        {/* Section 3: Scoring Matrix */}
        <div className="bg-[#0f172a] border border-white/10 rounded-2xl p-5 shadow-xl">
          <h2 className="text-sm font-black text-white uppercase tracking-wider mb-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-emerald-400 text-base">scoreboard</span>
            <span>3. Points Scoring System</span>
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-white/5 rounded-xl overflow-hidden">
              <thead className="bg-[#151d2e] text-[10px] uppercase font-bold text-slate-400 border-b border-white/5">
                <tr>
                  <th className="py-2.5 px-3">Event</th>
                  <th className="py-2.5 px-3">Position</th>
                  <th className="py-2.5 px-3 text-right">Points</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300">
                <tr>
                  <td className="py-2 px-3">Playing up to 60 minutes</td>
                  <td className="py-2 px-3 text-slate-400">All</td>
                  <td className="py-2 px-3 text-right font-bold text-emerald-400">+1</td>
                </tr>
                <tr>
                  <td className="py-2 px-3">Playing 60 minutes or more</td>
                  <td className="py-2 px-3 text-slate-400">All</td>
                  <td className="py-2 px-3 text-right font-bold text-emerald-400">+2</td>
                </tr>
                <tr>
                  <td className="py-2 px-3">Goal scored by Goalkeeper / Defender</td>
                  <td className="py-2 px-3 text-slate-400">GKP / DEF</td>
                  <td className="py-2 px-3 text-right font-bold text-emerald-400">+6</td>
                </tr>
                <tr>
                  <td className="py-2 px-3">Goal scored by Midfielder</td>
                  <td className="py-2 px-3 text-slate-400">MID</td>
                  <td className="py-2 px-3 text-right font-bold text-emerald-400">+5</td>
                </tr>
                <tr>
                  <td className="py-2 px-3">Goal scored by Forward</td>
                  <td className="py-2 px-3 text-slate-400">FWD</td>
                  <td className="py-2 px-3 text-right font-bold text-emerald-400">+4</td>
                </tr>
                <tr>
                  <td className="py-2 px-3">Goal Assist</td>
                  <td className="py-2 px-3 text-slate-400">All</td>
                  <td className="py-2 px-3 text-right font-bold text-emerald-400">+3</td>
                </tr>
                <tr>
                  <td className="py-2 px-3">Clean sheet (played 60+ minutes)</td>
                  <td className="py-2 px-3 text-slate-400">GKP / DEF</td>
                  <td className="py-2 px-3 text-right font-bold text-emerald-400">+4</td>
                </tr>
                <tr>
                  <td className="py-2 px-3">Clean sheet (played 60+ minutes)</td>
                  <td className="py-2 px-3 text-slate-400">MID</td>
                  <td className="py-2 px-3 text-right font-bold text-emerald-400">+1</td>
                </tr>
                <tr>
                  <td className="py-2 px-3">Every 2 goals conceded</td>
                  <td className="py-2 px-3 text-slate-400">GKP / DEF</td>
                  <td className="py-2 px-3 text-right font-bold text-rose-400">-1</td>
                </tr>
                <tr>
                  <td className="py-2 px-3">Penalty save</td>
                  <td className="py-2 px-3 text-slate-400">GKP</td>
                  <td className="py-2 px-3 text-right font-bold text-emerald-400">+5</td>
                </tr>
                <tr>
                  <td className="py-2 px-3">Penalty miss</td>
                  <td className="py-2 px-3 text-slate-400">All</td>
                  <td className="py-2 px-3 text-right font-bold text-rose-400">-2</td>
                </tr>
                <tr>
                  <td className="py-2 px-3">Every 3 shots saved</td>
                  <td className="py-2 px-3 text-slate-400">GKP</td>
                  <td className="py-2 px-3 text-right font-bold text-emerald-400">+1</td>
                </tr>
                <tr>
                  <td className="py-2 px-3">Yellow card</td>
                  <td className="py-2 px-3 text-slate-400">All</td>
                  <td className="py-2 px-3 text-right font-bold text-rose-400">-1</td>
                </tr>
                <tr>
                  <td className="py-2 px-3">Red card</td>
                  <td className="py-2 px-3 text-slate-400">All</td>
                  <td className="py-2 px-3 text-right font-bold text-rose-400">-3</td>
                </tr>
                <tr>
                  <td className="py-2 px-3">Own goal</td>
                  <td className="py-2 px-3 text-slate-400">All</td>
                  <td className="py-2 px-3 text-right font-bold text-rose-400">-2</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 4: Transfers & Deadlines */}
        <div className="bg-[#0f172a] border border-white/10 rounded-2xl p-5 shadow-xl">
          <h2 className="text-sm font-black text-white uppercase tracking-wider mb-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-emerald-400 text-base">swap_horiz</span>
            <span>4. Transfers &amp; Rollover</span>
          </h2>
          <div className="space-y-2 text-slate-300">
            <p>
              Managers receive <strong>1 free transfer per gameweek</strong>. If not used, free transfers roll over to subsequent gameweeks up to a maximum accumulation of <strong>5 free transfers</strong>.
            </p>
            <p>
              Each additional transfer beyond your free allowance incurs a deduction of <strong className="text-rose-400">-4 points</strong> from your next gameweek score.
            </p>
            <p>
              <strong>Deadlines:</strong> Transfers and lineup changes lock at the scheduled deadline (typically 90 minutes before the first kickoff of the gameweek). No changes are allowed while matches are live.
            </p>
          </div>
        </div>

        {/* Section 5: Chips */}
        <div className="bg-[#0f172a] border border-white/10 rounded-2xl p-5 shadow-xl">
          <h2 className="text-sm font-black text-white uppercase tracking-wider mb-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-emerald-400 text-base">electric_bolt</span>
            <span>5. Power Chips</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
            <div className="p-3 rounded-xl bg-[#151d2e] border border-white/5">
              <span className="font-bold text-white block mb-1">Triple Captain</span>
              <p className="text-[11px] text-slate-400">
                Your Captain&apos;s points are tripled instead of doubled for one gameweek.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-[#151d2e] border border-white/5">
              <span className="font-bold text-white block mb-1">Bench Boost</span>
              <p className="text-[11px] text-slate-400">
                All 15 players in your squad (including all 4 substitutes) earn points.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-[#151d2e] border border-white/5">
              <span className="font-bold text-white block mb-1">Wildcard</span>
              <p className="text-[11px] text-slate-400">
                Unlimited permanent transfers at no point cost during the gameweek.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-[#151d2e] border border-white/5">
              <span className="font-bold text-white block mb-1">Free Hit</span>
              <p className="text-[11px] text-slate-400">
                Make unlimited transfers for one gameweek. Your old squad reverts back afterward.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
