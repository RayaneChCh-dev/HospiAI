/**
 * MCP Hospital Details API
 * GET /api/mcp/hospitals/[id] - Get hospital by ID with authentication
 */

import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { prisma } from '@/lib/prisma'

interface TokenPayload {
  sub: string
  user_id: string
  scopes: string[]
}

async function verifyToken(request: NextRequest): Promise<TokenPayload | null> {
  const authHeader = request.headers.get('authorization')

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }

  const token = authHeader.substring(7)
  const jwtSecret = process.env.MCP_JWT_SECRET

  if (!jwtSecret) {
    return null
  }

  try {
    const decoded = jwt.verify(token, jwtSecret, {
      algorithms: ['HS256'],
      issuer: process.env.MCP_JWT_ISSUER || 'hospiai-api',
      audience: process.env.MCP_JWT_AUDIENCE || 'hospiai-mcp',
    }) as TokenPayload

    // Verify token exists and is not expired
    const mcpToken = await prisma.mCP.findUnique({
      where: { tokenMcp: token },
    })

    if (!mcpToken || new Date(mcpToken.expiresAt) < new Date()) {
      return null
    }

    return decoded
  } catch {
    return null
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const decoded = await verifyToken(request)

    if (!decoded) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    if (!decoded.scopes.includes('read:data')) {
      return NextResponse.json(
        { error: 'Permissions insuffisantes' },
        { status: 403 }
      )
    }

    const { id } = await params

    const hospital = await prisma.hospital.findUnique({
      where: { id },
      include: {
        hospitalStatus: true,
      },
    })

    if (!hospital) {
      return NextResponse.json(
        { error: 'Hôpital non trouvé' },
        { status: 404 }
      )
    }

    return NextResponse.json({ hospital })
  } catch (error) {
    console.error('MCP hospital details API error:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue' },
      { status: 500 }
    )
  }
}
