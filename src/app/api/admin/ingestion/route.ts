import { NextRequest, NextResponse } from 'next/server'
import { ingestionEngine } from '@/services/ingestion/ingestionEngine'
import { isSupabaseConfigured, localDb } from '@/lib/supabaseClient'

export async function GET() {
  try {
    const statuses = await ingestionEngine.getAdapterStatuses()
    const logs = await ingestionEngine.getLogs()

    return NextResponse.json({
      success: true,
      databaseMode: isSupabaseConfigured ? 'Supabase PostgreSQL' : 'Local Football DB Engine',
      databaseStats: {
        leaguesCount: localDb.leagues.size,
        teamsCount: localDb.teams.size,
        matchesCount: localDb.matches.size,
        standingsCount: localDb.standings.size,
        logsCount: logs.length
      },
      adapters: statuses,
      logs
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to retrieve ingestion metrics' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const results = await ingestionEngine.runPipeline()
    return NextResponse.json({
      success: true,
      message: 'Ingestion pipeline execution completed.',
      timestamp: new Date().toISOString(),
      results
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Ingestion execution error' },
      { status: 500 }
    )
  }
}
