/**
 * NextAuth Configuration
 * Credentials-based authentication with JWT strategy
 * Imports Node.js modules (bcryptjs, prisma) - NOT used in middleware
 */

import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { compare } from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { authConfig } from './auth.config'

// Validation schema for sign-in credentials
const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        try {
          // Validate input
          const { email, password } = signInSchema.parse(credentials)

          // Find user by email
          const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase() },
            select: {
              id: true,
              email: true,
              password: true,
              firstname: true,
              surname: true,
              profileCompletedAt: true,
            },
          })

          // Check if user exists
          if (!user) {
            return null // Don't reveal if user exists (prevent user enumeration)
          }

          // Verify password
          const isPasswordValid = await compare(password, user.password)

          if (!isPasswordValid) {
            return null
          }

          // Return user data (password excluded)
          return {
            id: user.id,
            email: user.email,
            name: user.firstname && user.surname ? `${user.firstname} ${user.surname}` : user.email,
            firstname: user.firstname,
            surname: user.surname,
            profileCompletedAt: user.profileCompletedAt,
          }
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      },
    }),
  ],
})
