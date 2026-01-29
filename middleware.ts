/**
 * Middleware
 * Edge-compatible authentication and route protection
 * Uses auth.config.ts which doesn't import Node.js modules
 */

import NextAuth from 'next-auth'
import { authConfig } from './auth.config'

export default NextAuth(authConfig).auth

// Protect specific routes only
export const config = {
  matcher: [
    '/',
    '/dashboard/:path*',
    '/profile/:path*',
    '/login',
    '/register',
  ],
}
