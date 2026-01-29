/**
 * Hospital Details API
 * GET /api/hospitals/[id] - Get hospital by ID
 * PUT /api/hospitals/[id] - Update hospital
 * DELETE /api/hospitals/[id] - Delete hospital
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Get hospital by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const hospital = await prisma.hospital.findUnique({
      where: { id },
      include: {
        hospitalStatus: true,
        appointments: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 10,
        },
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
    console.error('Hospital fetch error:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue' },
      { status: 500 }
    )
  }
}

// PUT - Update hospital
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, city, distanceKm, address, phoneNumber, email } = body

    const hospital = await prisma.hospital.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(city && { city }),
        ...(distanceKm !== undefined && { distanceKm }),
        ...(address !== undefined && { address }),
        ...(phoneNumber !== undefined && { phoneNumber }),
        ...(email !== undefined && { email }),
      },
    })

    return NextResponse.json({ hospital })
  } catch (error) {
    console.error('Hospital update error:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue' },
      { status: 500 }
    )
  }
}

// DELETE - Delete hospital
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await prisma.hospital.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Hôpital supprimé avec succès' })
  } catch (error) {
    console.error('Hospital deletion error:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue' },
      { status: 500 }
    )
  }
}
