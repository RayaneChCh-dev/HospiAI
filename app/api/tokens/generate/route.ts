/**
 * MCP Token Generation API
 * POST /api/tokens/generate
 * Generates JWT tokens for FastMCP authentication
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'
import { z } from 'zod'

// Validation schema
const generateTokenSchema = z.object({
  name: z.string().min(1, 'Le nom du token est requis').max(100),
  scopes: z.array(z.string()).optional().default(['read:data']),
  expiresInDays: z.number().int().min(1).max(365).optional().default(90),
})

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Check if user has completed profile
    if (!session.user.profileCompletedAt) {
      return NextResponse.json(
        { error: 'Veuillez compléter votre profil avant de générer des tokens' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validatedData = generateTokenSchema.parse(body)

    // Get JWT secret from environment
    const jwtSecret = process.env.MCP_JWT_SECRET
    if (!jwtSecret) {
      console.error('MCP_JWT_SECRET is not configured')
      return NextResponse.json(
        { error: 'Configuration du serveur invalide' },
        { status: 500 }
      )
    }

    // Calculate expiration
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + validatedData.expiresInDays)

    // Generate JWT token with HMAC
    const token = jwt.sign(
      {
        // Standard JWT claims
        sub: session.user.id, // Subject (user ID)
        iss: process.env.MCP_JWT_ISSUER || 'hospiai-api',
        aud: process.env.MCP_JWT_AUDIENCE || 'hospiai-mcp',
        exp: Math.floor(expiresAt.getTime() / 1000), // Expiration time
        iat: Math.floor(Date.now() / 1000), // Issued at

        // Custom claims
        client_id: session.user.email,
        scopes: validatedData.scopes,
        name: validatedData.name,
        user_id: session.user.id,
      },
      jwtSecret,
      {
        algorithm: 'HS256', // HMAC with SHA-256
      }
    )

    // Store token in database
    const mcpToken = await prisma.mCP.create({
      data: {
        userId: session.user.id,
        tokenMcp: token,
        name: validatedData.name,
        scopes: validatedData.scopes,
        expiresAt: expiresAt,
      },
      select: {
        id: true,
        tokenMcp: true,
        name: true,
        scopes: true,
        createdAt: true,
        expiresAt: true,
      },
    })

    return NextResponse.json({
      message: 'Token généré avec succès',
      token: mcpToken,
    })
  } catch (error) {
    console.error('Token generation error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Erreur de validation', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la génération du token' },
      { status: 500 }
    )
  }
}
