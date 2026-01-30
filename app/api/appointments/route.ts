/**
 * Appointments API
 * GET /api/appointments - List user's appointments
 * POST /api/appointments - Create a new appointment
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Validation schema
const createAppointmentSchema = z.object({
  hospitalId: z.string().min(1, 'Hospital ID is required'),
  patientId: z.string().optional(),
  description: z.string().optional(),
  date: z.string().min(1, 'Date is required'), // Format: YYYY-MM-DD
  time: z.string().min(1, 'Time is required'), // Format: HH:MM
})

// GET - List user's appointments
export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    const appointments = await prisma.appointment.findMany({
      where: {
        userId: session.user.id,
        ...(status && { status }),
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
    console.error('Appointment list error:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue' },
      { status: 500 }
    )
  }
}

// POST - Create a new appointment
// export async function POST(request: NextRequest) {
//   try {
//     const session = await auth()

//     if (!session?.user?.id) {
//       return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
//     }

//     const body = await request.json()
//     const validatedData = createAppointmentSchema.parse(body)

//     // Check if hospital exists
//     const hospital = await prisma.hospital.findUnique({
//       where: { id: validatedData.hospitalId },
//     })

//     if (!hospital) {
//       return NextResponse.json(
//         { error: 'Hôpital non trouvé' },
//         { status: 404 }
//       )
//     }

//     // Create appointment
//     const appointment = await prisma.appointment.create({
//       data: {
//         userId: session.user.id,
//         hospitalId: validatedData.hospitalId,
//         description: validatedData.description,
//         appointmentDateTime: `${validatedData.date}T${validatedData.time}:00`,
//         status: 'pending',
//       },
//       include: {
//         hospital: {
//           select: {
//             id: true,
//             name: true,
//             city: true,
//             address: true,
//             phoneNumber: true,
//           },
//         },
//       },
//     })

//     return NextResponse.json({ appointment }, { status: 201 })
//   } catch (error) {
//     console.error('Appointment creation error:', error)

//     if (error instanceof z.ZodError) {
//       return NextResponse.json(
//         { error: 'Erreur de validation', details: error.issues },
//         { status: 400 }
//       )
//     }

//     return NextResponse.json(
//       { error: 'Une erreur est survenue' },
//       { status: 500 }
//     )
//   }
// }
