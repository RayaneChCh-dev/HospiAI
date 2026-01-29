/**
 * Middleware
 * Edge-compatible authentication and route protection
 * Uses auth.config.ts which doesn't import Node.js modules
 */

import NextAuth from 'next-auth'
import { authConfig } from './auth.config'

export default NextAuth(authConfig).auth

// Protect all routes starting with /dashboard or /profile
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
