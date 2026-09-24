import { PrismaClient } from '@prisma/client'

// Production Hostinger MySQL fallback connection if not injected by environment
const DEFAULT_DATABASE_URL =
  'mysql://u875998119_myscore24admin:Malika2019*@srv991.hstgr.io:3306/u875998119_myscore24'

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = DEFAULT_DATABASE_URL
}

// Prevent multiple instances of Prisma Client in development during hot-reload
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL || DEFAULT_DATABASE_URL,
      },
    },
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
