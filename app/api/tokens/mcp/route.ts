/**
 * MCP Tokens Management API
 * GET /api/tokens/mcp - List user's MCP tokens
 * DELETE /api/tokens/mcp - Revoke an MCP token (database-only, no external calls)
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

// DELETE - Revoke an MCP token (no external MCP server call needed)
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

    // Get the token from database
    const mcpToken = await prisma.mCP.findFirst({
      where: {
        id: tokenId,
        userId: session.user.id, // Ensure user owns the token
      },
    })

    if (!mcpToken) {
      return NextResponse.json(
        { error: 'Token non trouvé' },
        { status: 404 }
      )
    }

    // Delete the token from our database
    // Since we're not using an external MCP server anymore,
    // removing from DB is sufficient - endpoints will reject the token
    await prisma.mCP.delete({
      where: {
        id: tokenId,
      },
    })

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
