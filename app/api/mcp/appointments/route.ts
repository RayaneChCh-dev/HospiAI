/**
 * MCP Appointments API
 * GET /api/mcp/appointments - List user's appointments with RS256 JWT authentication
 * POST /api/mcp/appointments - Create appointment with RS256 JWT authentication
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyJWT } from '@/lib/jwt'
import { z } from 'zod'

interface TokenPayload {
  sub: string
  email: string
  scope: string
}

const createAppointmentSchema = z.object({
  hospitalId: z.string().min(1),
  description: z.string().optional(),
  date: z.string().min(1), // Format: YYYY-MM-DD
  time: z.string().min(1), // Format: HH:MM
})

async function verifyToken(request: NextRequest): Promise<{ userId: string; scopes: string[] } | null> {
  const authHeader = request.headers.get('authorization')

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }

  const token = authHeader.substring(7)

  try {
    const decoded = verifyJWT(token) as TokenPayload

    const mcpToken = await prisma.mCP.findUnique({
      where: { tokenMcp: token },
    })

    if (!mcpToken || new Date(mcpToken.expiresAt) < new Date()) {
      return null
    }

    // Parse scopes from space-separated string
    const scopes = decoded.scope.split(' ')

    return {
      userId: decoded.sub,
      scopes,
    }
  } catch {
    return null
  }
}

// GET - List user's appointments
export async function GET(request: NextRequest) {
  try {
    const decoded = await verifyToken(request)

    if (!decoded) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    if (!decoded.scopes.includes('read:bookings')) {
      return NextResponse.json(
        { error: 'Permissions insuffisantes (read:bookings requis)' },
        { status: 403 }
      )
    }

    const appointments = await prisma.appointment.findMany({
      where: {
        userId: decoded.userId,
      },
      include: {
        hospital: {
          select: {
            id: true,
            name: true,
            city: true,
            address: true,
            phoneNumber: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({ appointments })
  } catch (error) {
    console.error('MCP appointments list error:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue' },
      { status: 500 }
    )
  }
}

// POST - Create appointment
export async function POST(request: NextRequest) {
  try {
    const decoded = await verifyToken(request)

    if (!decoded) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    if (!decoded.scopes.includes('write:bookings')) {
      return NextResponse.json(
        { error: 'Permissions insuffisantes (write:bookings requis)' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validatedData = createAppointmentSchema.parse(body)

    // Check if hospital exists
    const hospital = await prisma.hospital.findUnique({
      where: { id: validatedData.hospitalId },
    })

    if (!hospital) {
      return NextResponse.json(
        { error: 'Hôpital non trouvé' },
        { status: 404 }
      )
    }

    // Create appointment
    const appointment = await prisma.appointment.create({
      data: {
        userId: decoded.userId,
        hospitalId: validatedData.hospitalId,
        description: validatedData.description,
        appointmentDateTime: `${validatedData.date}T${validatedData.time}:00`,
        status: 'pending',
      },
      include: {
        hospital: {
          select: {
            id: true,
            name: true,
            city: true,
            address: true,
            phoneNumber: true,
          },
        },
      },
    })

    return NextResponse.json({ appointment }, { status: 201 })
  } catch (error) {
    console.error('MCP appointment creation error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Erreur de validation', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Une erreur est survenue' },
      { status: 500 }
    )
  }
}
