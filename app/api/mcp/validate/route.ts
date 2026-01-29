/**
 * MCP Token Validation API
 * POST /api/mcp/validate - Validate RS256 token and return user data
 * This endpoint validates both JWT signature (RS256) and database existence
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyJWT } from '@/lib/jwt'

export async function POST(request: NextRequest) {
  try {
    // Extract token from Authorization header
    const authHeader = request.headers.get('authorization')

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Token manquant ou format invalide' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7) // Remove "Bearer " prefix

    // Verify JWT signature (RS256)
    try {
      verifyJWT(token)
    } catch (error) {
      return NextResponse.json(
        { error: 'Token JWT invalide ou expiré' },
        { status: 401 }
      )
    }

    // Check if token exists in database (NextJS keeps a reference)
    const mcpToken = await prisma.mCP.findUnique({
      where: {
        tokenMcp: token,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstname: true,
            surname: true,
            phoneNumber: true,
            profileCompletedAt: true,
          },
        },
      },
    })

    if (!mcpToken) {
      return NextResponse.json(
        { error: 'Token révoqué ou inexistant' },
        { status: 401 }
      )
    }

    // Check if token has expired (database expiration)
    if (new Date(mcpToken.expiresAt) < new Date()) {
      return NextResponse.json(
        { error: 'Token expiré' },
        { status: 401 }
      )
    }

    // Token is valid, return user data and permissions
    return NextResponse.json({
      valid: true,
      user: {
        id: mcpToken.user.id,
        email: mcpToken.user.email,
        firstname: mcpToken.user.firstname,
        surname: mcpToken.user.surname,
        phoneNumber: mcpToken.user.phoneNumber,
        profileCompletedAt: mcpToken.user.profileCompletedAt,
      },
      token: {
        id: mcpToken.id,
        name: mcpToken.name,
        scopes: mcpToken.scopes,
        expiresAt: mcpToken.expiresAt,
      },
      scopes: mcpToken.scopes,
    })
  } catch (error) {
    console.error('MCP token validation error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la validation du token' },
      { status: 500 }
    )
  }
}
