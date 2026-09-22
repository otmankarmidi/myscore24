'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'

interface AdapterStatus {
  name: string
  isPermitted: boolean
  accessStatus: string
  lastCheckTime: string
  details: string
}

interface IngestionLog {
  id: number
  source: string
  status: string
  matches_processed: number
  message: string
  execution_time_ms: number
  created_at: string
}

export default function AdminIngestionDashboard() {
  const [data, setData] = useState<{
    databaseMode: string
    databaseStats: { leaguesCount: number; teamsCount: number; matchesCount: number; standingsCount: number; logsCount: number }
    adapters: AdapterStatus[]
    logs: IngestionLog[]
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [running, setRunning] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/ingestion')
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      setData(json)
      setError(null)
    } catch (err: any) {
      setError(err?.message || 'Failed to connect to ingestion admin API')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const handleTriggerIngestion = async () => {
    try {
      setRunning(true)
      const res = await fetch('/api/admin/ingestion', { method: 'POST' })
      const json = await res.json()
      if (!res.ok || !json.success) throw new Error(json.error || 'Ingestion execution failed')
      await fetchDashboardData()
    } catch (err: any) {
      alert(`Ingestion error: ${err.message}`)
    } finally {
      setRunning(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#0d1117] text-slate-100 p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header Navigation */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <div className="flex items-center gap-3">
              <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs px-2.5 py-1 rounded-full font-medium">
                Admin Control
              </span>
              <span className="text-slate-400 text-xs">MyScore24 Ingestion Platform</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white mt-1">
              Data Ingestion Dashboard
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium transition"
            >
              ← Back to App
            </Link>
            <button
              onClick={handleTriggerIngestion}
              disabled={running}
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-sm font-semibold shadow-lg shadow-emerald-900/20 transition flex items-center gap-2"
            >
              {running ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Syncing Database...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                  </svg>
                  Trigger Sync Now
                </>
              )}
            </button>
          </div>
        </div>

        {/* Mode & Storage Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
            <span className="text-slate-400 text-xs uppercase tracking-wider font-semibold">Active Engine Mode</span>
            <div className="text-lg font-semibold text-emerald-400 mt-1 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              {data?.databaseMode || 'Local DB Store'}
            </div>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
            <span className="text-slate-400 text-xs uppercase tracking-wider font-semibold">Stored Matches</span>
            <div className="text-2xl font-bold text-white mt-1">
              {data?.databaseStats?.matchesCount ?? 0}
            </div>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
            <span className="text-slate-400 text-xs uppercase tracking-wider font-semibold">Active Leagues</span>
            <div className="text-2xl font-bold text-white mt-1">
              {data?.databaseStats?.leaguesCount ?? 0}
            </div>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
            <span className="text-slate-400 text-xs uppercase tracking-wider font-semibold">Execution Logs</span>
            <div className="text-2xl font-bold text-white mt-1">
              {data?.databaseStats?.logsCount ?? 0}
            </div>
          </div>
        </div>

        {/* Source Adapters Compliance & Health */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
            </svg>
            Ingestion Source Adapters Compliance & Status
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data?.adapters?.map((adapter, i) => (
              <div
                key={i}
                className={`p-5 rounded-lg border ${
                  adapter.accessStatus === 'ACTIVE'
                    ? 'bg-emerald-950/20 border-emerald-800/40'
                    : 'bg-amber-950/20 border-amber-800/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-slate-100">{adapter.name}</h3>
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                      adapter.accessStatus === 'ACTIVE'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}
                  >
                    {adapter.accessStatus}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  {adapter.details}
                </p>
                <div className="text-[11px] text-slate-500 mt-3 pt-2 border-t border-slate-800/60">
                  Last Checked: {adapter.lastCheckTime ? new Date(adapter.lastCheckTime).toLocaleTimeString() : 'N/A'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Ingestion Logs Table */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
              </svg>
              Recent Ingestion Logs
            </h2>
            <button
              onClick={fetchDashboardData}
              className="text-xs text-slate-400 hover:text-slate-200 transition"
            >
              Refresh Logs
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-800/60 uppercase text-[10px] tracking-wider text-slate-400">
                <tr>
                  <th className="p-3 rounded-l-lg">Timestamp</th>
                  <th className="p-3">Source Adapter</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Processed</th>
                  <th className="p-3 text-right">Execution Time</th>
                  <th className="p-3 rounded-r-lg">Message</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {data?.logs?.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/30 transition">
                    <td className="p-3 font-mono text-slate-400 whitespace-nowrap">
                      {new Date(log.created_at).toLocaleTimeString()}
                    </td>
                    <td className="p-3 font-medium text-slate-200">{log.source}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          log.status === 'SUCCESS'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : log.status === 'BLOCKED_BY_CLOUDFLARE'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        {log.status}
                      </span>
                    </td>
                    <td className="p-3 text-right font-mono text-slate-200">{log.matches_processed}</td>
                    <td className="p-3 text-right font-mono text-slate-400">{log.execution_time_ms} ms</td>
                    <td className="p-3 text-slate-400 max-w-xs truncate">{log.message}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  )
}
