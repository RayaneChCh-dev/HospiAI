/**
 * Hospitals API
 * GET /api/hospitals - List all hospitals or filter by city
 * POST /api/hospitals - Create a new hospital (admin only)
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - List hospitals with optional city filter
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const city = searchParams.get('city')

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
    console.error('Hospital list error:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue' },
      { status: 500 }
    )
  }
}

// POST - Create a new hospital
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, city, distanceKm, address, phoneNumber, email } = body

    if (!name || !city) {
      return NextResponse.json(
        { error: 'Le nom et la ville sont requis' },
        { status: 400 }
      )
    }

    const hospital = await prisma.hospital.create({
      data: {
        name,
        city,
        distanceKm: distanceKm || null,
        address: address || null,
        phoneNumber: phoneNumber || null,
        email: email || null,
      },
    })

    return NextResponse.json({ hospital }, { status: 201 })
  } catch (error) {
    console.error('Hospital creation error:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue' },
      { status: 500 }
    )
  }
}
