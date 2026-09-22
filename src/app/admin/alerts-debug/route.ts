import { NextRequest, NextResponse } from 'next/server'
import { getAlertsHistory, getLiveStateStore } from '@/services/sports/alertService'

export async function GET(request: NextRequest) {
  try {
    const alerts = getAlertsHistory(50)
    const liveStates = Array.from(getLiveStateStore().values())

    const html = `
      <! contaminated>
      <html>
        <head>
          <title>MyScore24 Live Alerts Debugger</title>
          <style>
            body { font-family: monospace; background: #0f172a; color: #f8fafc; padding: 20px; }
            h1, h2 { color: #38bdf8; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            th, td { border: 1px solid #334155; padding: 8px 12px; text-align: left; }
            th { background: #1e293b; color: #94a3b8; }
            tr:nth-child(even) { background: #1e293b/40; }
            .badge { padding: 2px 6px; border-radius: 4px; font-weight: bold; }
            .HIGH { background: #ef4444; color: white; }
            .NORMAL { background: #0ea5e9; color: white; }
          </style>
        </head>
        <body>
          <h1>MyScore24 Live Match Alerts Debugger</h1>
          <p>Server Time: ${new Date().toISOString()}</p>

          <h2>Live Match State Tracking (${liveStates.length} matches)</h2>
          <table>
            <thead>
              <tr>
                <th>Match ID</th>
                <th>Score</th>
                <th>Status</th>
                <th>Clock</th>
                <th>Last Updated</th>
              </tr>
            </thead>
            <tbody>
              ${liveStates.map(s => `
                <tr>
                  <td>${s.matchId}</td>
                  <td>${s.homeScore} - ${s.awayScore}</td>
                  <td>${s.status}</td>
                  <td>${s.minute}'</td>
                  <td>${s.lastUpdatedAt}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <h2>Triggered Alerts History (${alerts.length} events)</h2>
          <table>
            <thead>
              <tr>
                <th>Time</th>
                <th>Type</th>
                <th>Priority</th>
                <th>Title</th>
                <th>Message</th>
                <th>Event ID</th>
              </tr>
            </thead>
            <tbody>
              ${alerts.map(a => `
                <tr>
                  <td>${a.createdAt.split('T')[1]?.slice(0, 8)}</td>
                  <td>${a.type}</td>
                  <td><span class="badge ${a.priority}">${a.priority}</span></td>
                  <td>${a.title}</td>
                  <td>${a.message}</td>
                  <td>${a.eventId}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `

    return new NextResponse(html, { headers: { 'content-type': 'text/html' } })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
