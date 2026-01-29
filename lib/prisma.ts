/**
 * Prisma Client Instance
 * Singleton pattern to prevent multiple instances in development
 * Optimized for Vercel serverless deployment with Neon Database
 */

import { PrismaClient } from '@prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'
import { neonConfig } from '@neondatabase/serverless'
import ws from 'ws'

// Configure WebSocket for Neon in serverless environments
neonConfig.webSocketConstructor = ws

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL

  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is not set')
  }

  // Use Neon adapter for better serverless compatibility
  const adapter = new PrismaNeon({ connectionString })

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })
}

// Always use singleton pattern (dev and production)
export const prisma = globalForPrisma.prisma ?? createPrismaClient()

// Cache Prisma instance globally to prevent multiple instances
globalForPrisma.prisma = prisma
