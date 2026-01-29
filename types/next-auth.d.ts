/**
 * NextAuth Type Extensions
 * Extends default NextAuth types with custom user properties
 */

import { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      firstname?: string | null
      surname?: string | null
      profileCompletedAt?: Date | null
    } & DefaultSession['user']
  }

  interface User {
    id: string
    email: string
    firstname?: string | null
    surname?: string | null
    profileCompletedAt?: Date | null
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    email: string
    firstname?: string | null
    surname?: string | null
    profileCompletedAt?: Date | null
  }
}
