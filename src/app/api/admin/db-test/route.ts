import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Check if database connection parameters are present
    const hasDatabaseUrl = Boolean(process.env.DATABASE_URL)
    const hasPassword = Boolean(process.env.MYSQL_PASSWORD)

    if (!hasDatabaseUrl && !hasPassword) {
      return NextResponse.json({
        status: 'pending_configuration',
        message: 'DATABASE_URL or MYSQL_PASSWORD is not set in .env.local',
        host: process.env.MYSQL_HOST || 'srv991.hstgr.io',
        user: process.env.MYSQL_USER || 'u875998119_myscore24admin',
        database: process.env.MYSQL_DATABASE || 'u875998119_myscore24',
        testedAt: new Date().toISOString(),
      })
    }

    // Execute minimal safe connection test without altering database schema/data
    const result = await prisma.$queryRaw`SELECT 1 as connected;`

    return NextResponse.json({
      status: 'success',
      message: 'Successfully connected to Hostinger MySQL database via Prisma Client.',
      queryResult: result,
      testedAt: new Date().toISOString(),
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        status: 'error',
        message: 'Failed to connect to MySQL database.',
        error: error?.message || 'Database connection error',
        testedAt: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}
