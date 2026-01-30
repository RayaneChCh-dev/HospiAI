/**
 * Appointment Details API
 * GET /api/appointments/[id] - Get appointment by ID
 * PUT /api/appointments/[id] - Update appointment
 * DELETE /api/appointments/[id] - Cancel appointment
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

// GET - Get appointment by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { id } = await params

    const appointment = await prisma.appointment.findFirst({
      where: {
        id,
        userId: session.user.id, // Ensure user owns the appointment
      },
      include: {
        hospital: {
          select: {
            id: true,
            name: true,
            city: true,
            address: true,
            phoneNumber: true,
            email: true,
          },
        },
      },
    })

    if (!appointment) {
      return NextResponse.json(
        { error: 'Rendez-vous non trouvé' },
        { status: 404 }
      )
    }

    return NextResponse.json({ appointment })
  } catch (error) {
    console.error('Appointment fetch error:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue' },
      { status: 500 }
    )
  }
}

// // PUT - Update appointment
// export async function PUT(
//   request: NextRequest,
//   { params }: { params: Promise<{ id: string }> }
// ) {
//   try {
//     const session = await auth()

//     if (!session?.user?.id) {
//       return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
//     }

//     const { id } = await params
//     const body = await request.json()
//     const { date, time, description, status } = body

//     const appointment = await prisma.appointment.updateMany({
//       where: {
//         id,
//         userId: session.user.id, // Ensure user owns the appointment
//       },
//       data: {
//         ...(date && { date }),
//         ...(time && { time }),
//         ...(description !== undefined && { description }),
//         ...(status && { status }),
//       },
//     })

//     if (appointment.count === 0) {
//       return NextResponse.json(
//         { error: 'Rendez-vous non trouvé' },
//         { status: 404 }
//       )
//     }

//     // Fetch updated appointment
//     const updatedAppointment = await prisma.appointment.findUnique({
//       where: { id },
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

//     return NextResponse.json({ appointment: updatedAppointment })
//   } catch (error) {
//     console.error('Appointment update error:', error)
//     return NextResponse.json(
//       { error: 'Une erreur est survenue' },
//       { status: 500 }
//     )
//   }
// }

// // DELETE - Cancel appointment
// export async function DELETE(
//   request: NextRequest,
//   { params }: { params: Promise<{ id: string }> }
// ) {
//   try {
//     const session = await auth()

//     if (!session?.user?.id) {
//       return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
//     }

//     const { id } = await params

//     const deletedAppointment = await prisma.appointment.deleteMany({
//       where: {
//         id,
//         userId: session.user.id, // Ensure user owns the appointment
//       },
//     })

//     if (deletedAppointment.count === 0) {
//       return NextResponse.json(
//         { error: 'Rendez-vous non trouvé' },
//         { status: 404 }
//       )
//     }

//     return NextResponse.json({
//       message: 'Rendez-vous annulé avec succès',
//     })
//   } catch (error) {
//     console.error('Appointment deletion error:', error)
//     return NextResponse.json(
//       { error: 'Une erreur est survenue' },
//       { status: 500 }
//     )
//   }
// }
