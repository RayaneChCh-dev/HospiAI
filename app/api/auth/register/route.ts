/**
 * User Registration API Route
 * POST /api/auth/register
 *
 * Registers a new user and automatically returns a JWT access token
 */

import { NextRequest, NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { signJWT } from '@/lib/jwt'

// Validation schema for registration
const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validatedData = registerSchema.parse(body)

    const { email, password } = validatedData

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'A user with this email already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await hash(password, 12)

    // Create user
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
      },
      select: {
        id: true,
        email: true,
        createdAt: true,
        profileCompletedAt: true,
      },
    })

    // Define scopes based on user properties
    const scopes: string[] = ["read:data"];

    // Add additional scopes for users with completed profiles
    if (user.profileCompletedAt) {
      scopes.push("read:bookings", "write:bookings");
    }

    // Sign JWT token for automatic authentication
    const accessToken = signJWT({
      id: user.id,
      email: user.email,
      scopes,
    });

    // Return OAuth2-compliant response
    return NextResponse.json(
      {
        message: 'User created successfully',
        user: {
          id: user.id,
          email: user.email,
          createdAt: user.createdAt,
        },
        access_token: accessToken,
        token_type: "Bearer",
        expires_in: 900, // 15 minutes in seconds
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Registration error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'An error occurred during registration' },
      { status: 500 }
    )
  }
}
