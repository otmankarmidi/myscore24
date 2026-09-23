'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'

interface HealthData {
  status: string
  timestamp: string
  database: 'healthy' | 'degraded' | 'unhealthy'
  cache: 'healthy' | 'degraded' | 'unhealthy'
  footballProvider: 'healthy' | 'cooldown' | 'unhealthy'
  quota: {
    used: number
    remaining: number
    dailyLimit: number
    warningLevel: string
  }
  data: {
    matches: number
    teams: number
    competitions: number
    seasons: number
  }
  issues: {
    invalidMatches: number
    duplicates: number
    brokenRelations: number
    unnecessaryCalls: number
    brokenMatchRoutes: number
  }
}

interface AuditData {
  audit: {
    scanned: {
      matches: number
      teams: number
      competitions: number
      seasons: number
      countries: number
    }
    summary: {
      totalIssues: number
      errors: number
      warnings: number
      invalidMatches: number
      duplicates: number
      brokenRelations: number
      seasonErrors: number
      suspiciousScores: number
    }
    issues: Array<{
      entityType: string
      entityId: string | number
      severity: string
      code: string
      message: string
      details?: any
    }>
  }
  monitoring: {
    recentBrokenMatches: Array<{
      timestamp: string
      fixtureId: string | number
      type: string
      reason?: string
    }>
    recentWastedRequests: Array<{
      timestamp: string
      endpoint: string
      resourceKey: string
      timeSinceLastMs: number
    }>
    endpointBreakdown: Record<string, number>
    quota: {
      used: number
      remaining: number
      warningLevel: string
    }
  }
}

export default function AdminSystemMonitoringPage() {
  const [health, setHealth] = useState<HealthData | null>(null)
  const [audit, setAudit] = useState<AuditData | null>(null)
  const [loading, setLoading] = useState(true)
  const [auditing, setAuditing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchHealth = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/health')
      if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to load health data`)
      const json = await res.json()
      setHealth(json)
      setError(null)
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch system health')
    } finally {
      setLoading(false)
    }
  }

  const runDataAudit = async () => {
    try {
      setAuditing(true)
      const res = await fetch('/api/admin/data-audit')
      if (!res.ok) throw new Error(`HTTP ${res.status}: Data audit failed`)
      const json = await res.json()
      setAudit(json)
      // Also refresh health numbers
      await fetchHealth()
    } catch (err: any) {
      setError(err?.message || 'Data audit failed')
    } finally {
      setAuditing(false)
    }
  }

  useEffect(() => {
    fetchHealth()
  }, [])

  const getStatusBadge = (status: string) => {
    if (status === 'healthy') {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          Healthy
        </span>
      )
    }
    if (status === 'cooldown' || status === 'degraded') {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
          {status.toUpperCase()}
        </span>
      )
    }
    return (
      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30 flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
        Unhealthy
      </span>
    )
  }

  return (
    <div className="min-h-screen bg-surface text-on-surface p-4 md:p-8 font-inter">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-surface-bright">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Link href="/admin/ingestion" className="text-xs font-medium text-on-surface-variant hover:text-primary transition-colors">
                ← Admin Ingestion
              </Link>
              <span className="text-on-surface-variant text-xs">•</span>
              <span className="text-xs text-primary font-semibold">Monitoring</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold font-geist text-on-surface">
              System Health & Data Monitoring
            </h1>
            <p className="text-sm text-on-surface-variant mt-1">
              Real-time integrity auditing, quota tracking, and route diagnostics for MyScore24
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchHealth}
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-surface-container-high border border-surface-bright text-xs font-semibold text-on-surface hover:bg-surface-bright transition-colors flex items-center gap-1.5"
            >
              <span className={`material-symbols-outlined text-sm ${loading ? 'animate-spin' : ''}`}>refresh</span>
              Refresh
            </button>
            <button
              onClick={runDataAudit}
              disabled={auditing}
              className="px-4 py-2 rounded-lg bg-primary text-on-primary text-xs font-bold tracking-wider hover:opacity-90 transition-opacity flex items-center gap-1.5 disabled:opacity-50"
            >
              <span className={`material-symbols-outlined text-sm ${auditing ? 'animate-spin' : ''}`}>fact_check</span>
              {auditing ? 'Auditing Database...' : 'Run Data Audit'}
            </button>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-lg bg-error-container/20 border border-error/30 text-error text-sm flex items-center gap-2">
            <span className="material-symbols-outlined text-lg">error</span>
            <span>{error}</span>
          </div>
        )}

        {/* 1. Core Health & Quota Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* SYSTEM HEALTH */}
          <div className="bg-surface-container rounded-xl border border-surface-bright p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant font-geist">
                SYSTEM HEALTH
              </h2>
              <span className="material-symbols-outlined text-primary text-base">verified</span>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm py-1 border-b border-surface-bright/40">
                <span className="text-on-surface-variant font-medium">Database (MySQL)</span>
                {health ? getStatusBadge(health.database) : <span className="text-xs text-on-surface-variant">...</span>}
              </div>
              <div className="flex items-center justify-between text-sm py-1 border-b border-surface-bright/40">
                <span className="text-on-surface-variant font-medium">Cache (L1/L2 SWR)</span>
                {health ? getStatusBadge(health.cache) : <span className="text-xs text-on-surface-variant">...</span>}
              </div>
              <div className="flex items-center justify-between text-sm py-1">
                <span className="text-on-surface-variant font-medium">API-Football Provider</span>
                {health ? getStatusBadge(health.footballProvider) : <span className="text-xs text-on-surface-variant">...</span>}
              </div>
            </div>
          </div>

          {/* API QUOTA */}
          <div className="bg-surface-container rounded-xl border border-surface-bright p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant font-geist">
                API QUOTA (24h)
              </h2>
              <span className="material-symbols-outlined text-secondary text-base">speed</span>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm py-1 border-b border-surface-bright/40">
                <span className="text-on-surface-variant font-medium">Used Today</span>
                <span className="font-mono font-bold text-on-surface text-base">
                  {health ? health.quota.used : '0'} <span className="text-xs text-on-surface-variant font-normal">reqs</span>
                </span>
              </div>
              <div className="flex items-center justify-between text-sm py-1 border-b border-surface-bright/40">
                <span className="text-on-surface-variant font-medium">Remaining</span>
                <span className="font-mono font-bold text-primary text-base">
                  {health ? health.quota.remaining : '100'} <span className="text-xs text-on-surface-variant font-normal">/ {health?.quota.dailyLimit || 100}</span>
                </span>
              </div>
              <div className="flex items-center justify-between text-sm py-1">
                <span className="text-on-surface-variant font-medium">Warning Level</span>
                <span className="font-mono text-xs font-bold text-primary px-2 py-0.5 rounded bg-primary/10">
                  {health?.quota.warningLevel || 'NORMAL'}
                </span>
              </div>
            </div>
          </div>

          {/* STORED DATA */}
          <div className="bg-surface-container rounded-xl border border-surface-bright p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant font-geist">
                STORED DATA
              </h2>
              <span className="material-symbols-outlined text-primary text-base">database</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="p-2.5 rounded-lg bg-surface-container-high border border-surface-bright/60">
                <div className="text-xl font-bold font-mono text-on-surface">
                  {health ? health.data.matches.toLocaleString() : '0'}
                </div>
                <div className="text-[11px] text-on-surface-variant uppercase tracking-wider mt-0.5">Matches</div>
              </div>
              <div className="p-2.5 rounded-lg bg-surface-container-high border border-surface-bright/60">
                <div className="text-xl font-bold font-mono text-on-surface">
                  {health ? health.data.teams.toLocaleString() : '0'}
                </div>
                <div className="text-[11px] text-on-surface-variant uppercase tracking-wider mt-0.5">Teams</div>
              </div>
              <div className="p-2.5 rounded-lg bg-surface-container-high border border-surface-bright/60">
                <div className="text-xl font-bold font-mono text-on-surface">
                  {health ? health.data.competitions.toLocaleString() : '0'}
                </div>
                <div className="text-[11px] text-on-surface-variant uppercase tracking-wider mt-0.5">Competitions</div>
              </div>
              <div className="p-2.5 rounded-lg bg-surface-container-high border border-surface-bright/60">
                <div className="text-xl font-bold font-mono text-on-surface">
                  {health ? health.data.seasons.toLocaleString() : '0'}
                </div>
                <div className="text-[11px] text-on-surface-variant uppercase tracking-wider mt-0.5">Seasons</div>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Integrity Issues Summary */}
        <div className="bg-surface-container rounded-xl border border-surface-bright p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold font-geist text-on-surface">
                Data Integrity & Route Issues
              </h2>
              <p className="text-xs text-on-surface-variant">
                Live anomaly detection across stored records and public routes
              </p>
            </div>
            {health && (
              <span className={`px-2.5 py-1 rounded text-xs font-bold font-mono ${
                (health.issues.invalidMatches + health.issues.duplicates + health.issues.brokenRelations) === 0
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
              }`}>
                {(health.issues.invalidMatches + health.issues.duplicates + health.issues.brokenRelations)} Data Inconsistencies
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="p-3 rounded-lg bg-surface-container-high border border-surface-bright/50">
              <span className="text-xs text-on-surface-variant block">Broken Matches</span>
              <span className="text-lg font-bold font-mono text-on-surface mt-1 block">
                {health?.issues.invalidMatches ?? 0}
              </span>
            </div>
            <div className="p-3 rounded-lg bg-surface-container-high border border-surface-bright/50">
              <span className="text-xs text-on-surface-variant block">Duplicates</span>
              <span className="text-lg font-bold font-mono text-on-surface mt-1 block">
                {health?.issues.duplicates ?? 0}
              </span>
            </div>
            <div className="p-3 rounded-lg bg-surface-container-high border border-surface-bright/50">
              <span className="text-xs text-on-surface-variant block">Broken Relations</span>
              <span className="text-lg font-bold font-mono text-on-surface mt-1 block">
                {health?.issues.brokenRelations ?? 0}
              </span>
            </div>
            <div className="p-3 rounded-lg bg-surface-container-high border border-surface-bright/50">
              <span className="text-xs text-on-surface-variant block">Unnecessary Calls</span>
              <span className="text-lg font-bold font-mono text-on-surface mt-1 block">
                {health?.issues.unnecessaryCalls ?? 0}
              </span>
            </div>
            <div className="p-3 rounded-lg bg-surface-container-high border border-surface-bright/50">
              <span className="text-xs text-on-surface-variant block">Route 404/Misses</span>
              <span className="text-lg font-bold font-mono text-on-surface mt-1 block">
                {health?.issues.brokenMatchRoutes ?? 0}
              </span>
            </div>
          </div>
        </div>

        {/* 3. Deep Audit Results (When Available) */}
        {audit && (
          <div className="bg-surface-container rounded-xl border border-surface-bright p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-primary font-geist">
                  Data Audit Report ({audit.audit.summary.totalIssues} Issues Found)
                </h3>
                <span className="text-xs text-on-surface-variant font-mono">
                  Scanned: {audit.audit.scanned.matches} matches, {audit.audit.scanned.teams} teams, {audit.audit.scanned.competitions} competitions
                </span>
              </div>
              <span className="text-xs font-mono text-on-surface-variant">
                {new Date(audit.monitoring.quota.warningLevel ? Date.now() : 0).toLocaleTimeString()}
              </span>
            </div>

            {audit.audit.issues.length === 0 ? (
              <div className="p-6 text-center text-sm text-emerald-400 bg-emerald-500/5 rounded-lg border border-emerald-500/20 font-medium">
                ✅ Zero data integrity anomalies found! All records and relationships strictly validated.
              </div>
            ) : (
              <div className="divide-y divide-surface-bright/40 max-h-80 overflow-y-auto pr-1">
                {audit.audit.issues.map((issue, idx) => (
                  <div key={idx} className="py-2.5 flex items-start justify-between gap-3 text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`px-1.5 py-0.5 rounded font-mono font-bold ${
                          issue.severity === 'ERROR' ? 'bg-rose-500/20 text-rose-300' : 'bg-amber-500/20 text-amber-300'
                        }`}>
                          {issue.code}
                        </span>
                        <span className="text-on-surface font-semibold">
                          {issue.entityType} ID: {issue.entityId}
                        </span>
                      </div>
                      <p className="text-on-surface-variant mt-1">{issue.message}</p>
                    </div>
                    <span className="text-[11px] text-on-surface-variant font-mono shrink-0">
                      {issue.severity}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 4. Recent Broken Match Routes Diagnostics */}
        {audit?.monitoring.recentBrokenMatches && audit.monitoring.recentBrokenMatches.length > 0 && (
          <div className="bg-surface-container rounded-xl border border-surface-bright p-5 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant font-geist">
              Recent Broken Match Route Lookups
            </h3>
            <div className="divide-y divide-surface-bright/40 max-h-60 overflow-y-auto pr-1">
              {audit.monitoring.recentBrokenMatches.map((ev, idx) => (
                <div key={idx} className="py-2 flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-400 font-bold">
                      {ev.type}
                    </span>
                    <span className="text-on-surface">/match/{ev.fixtureId}</span>
                    {ev.reason && <span className="text-on-surface-variant font-sans">({ev.reason})</span>}
                  </div>
                  <span className="text-on-surface-variant text-[11px]">
                    {new Date(ev.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
