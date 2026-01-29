/**
 * MCP Token Validation API
 * POST /api/mcp/validate - Validate JWT token and return user data
 * This endpoint is called by FastMCP servers to authenticate requests
 */

import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { prisma } from '@/lib/prisma'

interface TokenPayload {
  sub: string // user ID
  iss: string
  aud: string
  exp: number
  iat: number
  client_id: string
  scopes: string[]
  name: string
  user_id: string
}

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

    // Verify JWT secret is configured
    const jwtSecret = process.env.MCP_JWT_SECRET
    if (!jwtSecret) {
      console.error('MCP_JWT_SECRET not configured')
      return NextResponse.json(
        { error: 'Configuration serveur invalide' },
        { status: 500 }
      )
    }

    // Verify and decode the JWT
    let decoded: TokenPayload
    try {
      decoded = jwt.verify(token, jwtSecret, {
        algorithms: ['HS256'],
        issuer: process.env.MCP_JWT_ISSUER || 'hospiai-api',
        audience: process.env.MCP_JWT_AUDIENCE || 'hospiai-mcp',
      }) as TokenPayload
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        return NextResponse.json(
          { error: 'Token expiré' },
          { status: 401 }
        )
      }
      if (error instanceof jwt.JsonWebTokenError) {
        return NextResponse.json(
          { error: 'Token invalide' },
          { status: 401 }
        )
      }
      throw error
    }

    // Check if token has been revoked in database
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
      scopes: decoded.scopes,
    })
  } catch (error) {
    console.error('MCP token validation error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la validation du token' },
      { status: 500 }
    )
  }
}
