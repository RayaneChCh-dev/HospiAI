/**
 * Hospital Status API
 * GET /api/hospitals/[id]/status - Get hospital status
 * PUT /api/hospitals/[id]/status - Update hospital status
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Get hospital status
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const status = await prisma.hospitalStatus.findUnique({
      where: { hospitalId: id },
      include: {
        hospital: {
          select: {
            id: true,
            name: true,
            city: true,
          },
        },
      },
    })

    if (!status) {
      return NextResponse.json(
        { error: 'Statut non trouvé' },
        { status: 404 }
      )
    }

    return NextResponse.json({ status })
  } catch (error) {
    console.error('Hospital status fetch error:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue' },
      { status: 500 }
    )
  }
}

// PUT - Update hospital status
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { availableBeds, icuBeds, ventilators } = body

    // Check if hospital exists
    const hospital = await prisma.hospital.findUnique({
      where: { id },
    })

    if (!hospital) {
      return NextResponse.json(
        { error: 'Hôpital non trouvé' },
        { status: 404 }
      )
    }

    // Upsert hospital status
    const status = await prisma.hospitalStatus.upsert({
      where: { hospitalId: id },
      update: {
        ...(availableBeds !== undefined && { availableBeds }),
        ...(icuBeds !== undefined && { icuBeds }),
        ...(ventilators !== undefined && { ventilators }),
      },
      create: {
        hospitalId: id,
        availableBeds: availableBeds || 0,
        icuBeds: icuBeds || 0,
        ventilators: ventilators || 0,
      },
    })

    return NextResponse.json({ status })
  } catch (error) {
    console.error('Hospital status update error:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue' },
      { status: 500 }
    )
  }
}
