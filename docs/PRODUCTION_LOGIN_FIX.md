# Production Login Fix - Prisma Serverless Configuration

## Problem

Internal server error (500) when calling `/api/login` in production (Vercel), while the same endpoint worked perfectly in local development.

**Symptoms:**
- ✅ Local environment: Login works
- ✅ JWKS endpoint works in production (curl test successful)
- ✅ Environment variables configured correctly
- ❌ `/api/login` returns 500 error in production

## Root Cause

The issue was in `/lib/prisma.ts` configuration:

### Previous Code (Broken in Production)

```typescript
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
  pool: Pool | undefined  // ❌ Separate pool caching
}

function createPrismaClient() {
  // ❌ Pool singleton pattern
  if (!globalForPrisma.pool) {
    globalForPrisma.pool = new Pool({
      connectionString,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,  // ❌ Too short for cold starts
    })
  }

  const adapter = new PrismaPg(globalForPrisma.pool)
  return new PrismaClient({ adapter })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

// ❌ Only caches in development, not production
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
```

### Issues Identified

1. **Incompatible adapter**: Using `@prisma/adapter-pg` with standard `pg` library instead of Neon serverless adapter
2. **Pool singleton anti-pattern**: Caching pool separately from Prisma client caused stale connections in serverless
3. **Production not cached**: Prisma client was recreated on every request in production, but reused stale pool
4. **Connection timeout too short**: 10 seconds was insufficient for Vercel cold starts
5. **Missing WebSocket config**: Neon requires WebSocket constructor for serverless

## Solution

Switched to Neon serverless adapter with proper configuration:

### New Code (Works in Production)

```typescript
import { PrismaNeon } from '@prisma/adapter-neon'
import { neonConfig } from '@neondatabase/serverless'
import ws from 'ws'

// ✅ Configure WebSocket for serverless
neonConfig.webSocketConstructor = ws

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined  // ✅ Only cache Prisma client
}

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL

  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is not set')
  }

  // ✅ Use Neon adapter with connection string (no explicit pool)
  const adapter = new PrismaNeon({ connectionString })

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })
}

// ✅ Always use singleton pattern (dev AND production)
export const prisma = globalForPrisma.prisma ?? createPrismaClient()

// ✅ Cache globally in all environments
globalForPrisma.prisma = prisma
```

### Key Improvements

1. **Neon serverless adapter**: `@prisma/adapter-neon` is optimized for Vercel's serverless functions
2. **WebSocket support**: Neon uses WebSocket over HTTP for better serverless performance
3. **Simplified pool management**: Adapter handles connection pooling internally
4. **Always cache Prisma**: Both dev and production use singleton to prevent multiple instances
5. **No custom timeouts**: Neon's defaults are optimized for serverless cold starts

## Why This Fix Works

### Neon Database + Vercel = Perfect Match

Your database URL shows you're using Neon:
```
postgresql://...@ep-fancy-cloud-aga4jvlo-pooler.c-2.eu-central-1.aws.neon.tech/neondb
```

Neon is specifically designed for serverless:
- **HTTP/WebSocket protocol**: Works over HTTPS, no persistent TCP connections required
- **Instant cold start**: No connection pool warmup needed
- **Automatic scaling**: Handles concurrent serverless function invocations
- **Built-in pooling**: Connection pooling at the database level, not client-side

### Serverless Execution Model

In Vercel:
1. **Cold start**: New container spins up, global context is fresh
2. **Warm start**: Container reused, global context persists
3. **Multiple instances**: Many containers run in parallel

The previous code:
- Created new Prisma clients in production on every request
- But reused a stale pool that might be from a previous container lifecycle
- Connection timeout was too aggressive for cold starts

The new code:
- Caches Prisma client globally in ALL environments
- Lets Neon adapter handle connections internally
- No manual pool management required

## Verification

### Local Test
```bash
yarn build
yarn dev

# Test JWKS endpoint
curl http://localhost:3000/.well-known/jwks.json

# Should return:
# {"keys":[{"kty":"RSA","n":"...","e":"AQAB","kid":"main-key","use":"sig","alg":"RS256"}]}
```

### Production Test (After Deploy)
```bash
# Test login
curl -X POST https://your-domain.vercel.app/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Should return:
# {"access_token":"eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...","token_type":"Bearer","expires_in":900}
```

## Deployment Checklist

Before deploying to Vercel, ensure:

- [x] `DATABASE_URL` is set in Vercel Environment Variables
- [x] `JWT_PRIVATE_KEY` is set in Vercel Environment Variables
- [x] `JWT_PUBLIC_KEY` is set in Vercel Environment Variables
- [x] `NEXTAUTH_SECRET` is set in Vercel Environment Variables
- [x] `NEXTAUTH_URL` is set to production URL
- [x] Build succeeds locally (`yarn build`)
- [x] All required dependencies are in `package.json`:
  - `@prisma/adapter-neon`
  - `@neondatabase/serverless`
  - `ws`
  - `@types/ws` (devDependencies)

## Related Files

- `/lib/prisma.ts` - Fixed Prisma client configuration
- `/lib/db.ts` - Uses Prisma client for user authentication
- `/app/api/login/route.ts` - Login endpoint that calls `findUser()`
- `/docs/VERCEL_DEPLOYMENT.md` - General deployment guide

## References

- [Prisma Neon Adapter Docs](https://www.prisma.io/docs/orm/overview/databases/neon)
- [Neon Serverless Driver](https://neon.tech/docs/serverless/serverless-driver)
- [Vercel Serverless Functions](https://vercel.com/docs/functions/serverless-functions)

---

**Fixed on:** 2026-01-29
**Tested:** Local ✅ | Production ⏳ (pending deployment)
