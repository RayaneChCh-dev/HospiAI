/**
 * MCP Tokens Management API
 * GET /api/tokens/mcp - List user's MCP tokens
 * DELETE /api/tokens/mcp - Revoke an MCP token
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

// GET - List all MCP tokens for the current user
export async function GET() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const tokens = await prisma.mCP.findMany({
      where: {
        userId: session.user.id,
      },
      select: {
        id: true,
        name: true,
        scopes: true,
        createdAt: true,
        expiresAt: true,
        // Don't return the actual token for security
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({ tokens })
  } catch (error) {
    console.error('MCP token list error:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue' },
      { status: 500 }
    )
  }
}

// DELETE - Revoke an MCP token
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const tokenId = searchParams.get('id')

    if (!tokenId) {
      return NextResponse.json(
        { error: 'ID du token requis' },
        { status: 400 }
      )
    }

    // Delete the token (only if it belongs to the user)
    const deletedToken = await prisma.mCP.deleteMany({
      where: {
        id: tokenId,
        userId: session.user.id, // Ensure user owns the token
      },
    })

    if (deletedToken.count === 0) {
      return NextResponse.json(
        { error: 'Token non trouvé' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      message: 'Token révoqué avec succès',
    })
  } catch (error) {
    console.error('MCP token revocation error:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue' },
      { status: 500 }
    )
  }
}
