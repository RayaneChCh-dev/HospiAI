/**
 * MCP Hospitals API
 * GET /api/mcp/hospitals - List hospitals with RS256 JWT authentication
 * This endpoint is called by MCP clients with Bearer token
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyJWT } from '@/lib/jwt'

interface TokenPayload {
  sub: string
  email: string
  scope: string
}

export async function GET(request: NextRequest) {
  try {
    // Extract and verify token
    const authHeader = request.headers.get('authorization')

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Token manquant ou format invalide' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)

    // Verify JWT with RS256
    let decoded: TokenPayload
    try {
      decoded = verifyJWT(token) as TokenPayload
    } catch (error) {
      return NextResponse.json(
        { error: 'Token invalide ou expiré' },
        { status: 401 }
      )
    }

    // Check if token exists in database
    const mcpToken = await prisma.mCP.findUnique({
      where: { tokenMcp: token },
    })

    if (!mcpToken) {
      return NextResponse.json(
        { error: 'Token révoqué ou inexistant' },
        { status: 401 }
      )
    }

    // Check token expiration
    if (new Date(mcpToken.expiresAt) < new Date()) {
      return NextResponse.json({ error: 'Token expiré' }, { status: 401 })
    }

    // Check scopes (scope is a space-separated string)
    const scopes = decoded.scope.split(' ')
    if (!scopes.includes('read:data')) {
      return NextResponse.json(
        { error: 'Permissions insuffisantes' },
        { status: 403 }
      )
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const city = searchParams.get('city')

    // Fetch hospitals
    const hospitals = await prisma.hospital.findMany({
      where: city ? { city } : undefined,
      include: {
        hospitalStatus: true,
      },
      orderBy: {
        name: 'asc',
      },
    })

    return NextResponse.json({ hospitals })
  } catch (error) {
    console.error('MCP hospitals API error:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue' },
      { status: 500 }
    )
  }
}
