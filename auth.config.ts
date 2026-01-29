/**
 * NextAuth Configuration for Edge Runtime
 * This config is used by middleware and doesn't import Node.js modules
 */

import type { NextAuthConfig } from 'next-auth'

export const authConfig = {
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const pathname = nextUrl.pathname

      const isPublicRoute = ['/login', '/register', '/'].includes(pathname)
      const isProfileRoute = pathname.startsWith('/profile')
      const isDashboardRoute = pathname.startsWith('/dashboard')

      // If user is logged in, check if profile is completed (from session)
      if (isLoggedIn && auth?.user) {
        const hasCompletedProfile = !!(auth.user as any).profileCompletedAt

        // Redirect to profile completion if not completed and trying to access dashboard
        if (!hasCompletedProfile && isDashboardRoute) {
          return Response.redirect(new URL('/profile', nextUrl))
        }

        // Redirect to dashboard if profile completed and trying to access profile pages
        if (hasCompletedProfile && isProfileRoute) {
          return Response.redirect(new URL('/dashboard', nextUrl))
        }

        // Redirect logged-in users from auth pages to appropriate location
        if (pathname === '/login' || pathname === '/register') {
          const destination = hasCompletedProfile ? '/dashboard' : '/profile'
          return Response.redirect(new URL(destination, nextUrl))
        }
      }

      // Protect profile and dashboard routes - require authentication
      if (!isLoggedIn && (isProfileRoute || isDashboardRoute)) {
        return false // Will redirect to signIn page
      }

      return true
    },
    async jwt({ token, user, trigger, session }) {
      // Add user data to JWT token on sign in
      if (user) {
        token.id = user.id
        token.email = user.email
        token.firstname = (user as any).firstname
        token.surname = (user as any).surname
        token.profileCompletedAt = (user as any).profileCompletedAt
      }

      // Update token when session.update() is called from client
      if (trigger === 'update' && session) {
        // Update token with values passed from client
        if (session.profileCompletedAt !== undefined) {
          token.profileCompletedAt = session.profileCompletedAt
        }
        if (session.firstname !== undefined) {
          token.firstname = session.firstname
        }
        if (session.surname !== undefined) {
          token.surname = session.surname
        }
      }

      return token
    },
    async session({ session, token }) {
      // Add user data to session from token
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.email = token.email as string
        session.user.firstname = token.firstname as string | null
        session.user.surname = token.surname as string | null
        session.user.profileCompletedAt = token.profileCompletedAt as Date | null
      }
      return session
    },
  },
  providers: [], // Providers are added in auth.ts
} satisfies NextAuthConfig
