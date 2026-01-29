/**
 * MCP Token Generation API
 * POST /api/tokens/generate
 * Calls external FastMCP server to generate RS256 JWT tokens
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const MCP_SERVER_URL = process.env.MCP_SERVER_URL

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

    // Get user details
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        firstname: true,
        surname: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 })
    }

    if (!MCP_SERVER_URL) {
      return NextResponse.json(
        { error: 'MCP server URL not configured' },
        { status: 500 }
      )
    }

    // Call external FastMCP server to generate token
    const mcpResponse = await fetch(`${MCP_SERVER_URL}/tokens/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: user.id,
        email: user.email,
        firstname: user.firstname,
        surname: user.surname,
        name: validatedData.name,
        scopes: validatedData.scopes,
        expires_in_days: validatedData.expiresInDays,
      }),
    })

    if (!mcpResponse.ok) {
      const errorData = await mcpResponse.json().catch(() => ({}))
      console.error('MCP server error:', errorData)
      return NextResponse.json(
        { error: 'Échec de la génération du token sur le serveur MCP' },
        { status: mcpResponse.status }
      )
    }

    const mcpData = await mcpResponse.json()

    // Calculate expiration date
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + validatedData.expiresInDays)

    // Store token reference in our database
    const mcpToken = await prisma.mCP.create({
      data: {
        userId: user.id,
        tokenMcp: mcpData.token || mcpData.access_token, // Handle different response formats
        name: validatedData.name,
        scopes: validatedData.scopes,
        expiresAt: expiresAt,
      },
      select: {
        id: true,
        tokenMcp: true, // Return full token only once
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
