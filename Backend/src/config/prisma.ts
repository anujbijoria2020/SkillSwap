import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

const isNeon = process.env.DATABASE_URL?.includes('neon.tech') ?? false

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL ?? 'postgresql://postgres:postgres@localhost:5432/skillswap',
  ssl: isNeon || process.env.NODE_ENV === 'production'
    ? { rejectUnauthorized: false }
    : false
})

const adapter = new PrismaPg(pool as any)

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({ adapter })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}