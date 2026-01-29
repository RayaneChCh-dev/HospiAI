/**
 * Token Generation API
 * POST /api/tokens - Generate a new temporary token
 * GET /api/tokens - List user's tokens
 * DELETE /api/tokens/:id - Revoke a token
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { addDays } from 'date-fns'

// GET - List all tokens for current user
export async function GET() {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const tokens = await prisma.tempToken.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        token: true,
        expiresAt: true,
        createdAt: true,
      },
    })

    return NextResponse.json({ tokens })
  } catch (error) {
    console.error('Error fetching tokens:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tokens' },
      { status: 500 }
    )
  }
}

// POST - Generate a new token
export async function POST() {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Create token with 7-day expiration
    const token = await prisma.tempToken.create({
      data: {
        userId: session.user.id,
        expiresAt: addDays(new Date(), 7),
      },
    })

    return NextResponse.json(
      {
        message: 'Token created successfully',
        token: {
          id: token.id,
          token: token.token,
          expiresAt: token.expiresAt,
          createdAt: token.createdAt,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating token:', error)
    return NextResponse.json(
      { error: 'Failed to create token' },
      { status: 500 }
    )
  }
}

// DELETE - Revoke a token
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const tokenId = searchParams.get('id')

    if (!tokenId) {
      return NextResponse.json(
        { error: 'Token ID is required' },
        { status: 400 }
      )
    }

    // Check if token belongs to user before deleting
    const token = await prisma.tempToken.findUnique({
      where: { id: tokenId },
    })

    if (!token || token.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Token not found' },
        { status: 404 }
      )
    }

    await prisma.tempToken.delete({
      where: { id: tokenId },
    })

    return NextResponse.json({ message: 'Token revoked successfully' })
  } catch (error) {
    console.error('Error revoking token:', error)
    return NextResponse.json(
      { error: 'Failed to revoke token' },
      { status: 500 }
    )
  }
}
