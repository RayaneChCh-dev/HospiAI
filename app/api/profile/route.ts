/**
 * Profile Update API Route
 * PATCH /api/profile
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Validation schema for profile update
const profileSchema = z.object({
  firstname: z.string().min(1, 'Le prénom est requis').max(100).optional(),
  surname: z.string().min(1, 'Le nom est requis').max(100).optional(),
  sex: z.enum(['Homme', 'Femme', 'Autre']).optional(),
  age: z.number().int().min(1).max(150).optional(),
  phoneNumber: z
    .string()
    .regex(
      /^(?:(?:\+|00)33|0)[1-9](?:[0-9]{8})$/,
      'Numéro de téléphone français invalide'
    )
    .optional(),
  completeProfile: z.boolean().optional(),
})

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = profileSchema.parse(body)

    // Check if phone number already exists (if provided)
    if (validatedData.phoneNumber) {
      const existingPhone = await prisma.user.findFirst({
        where: {
          phoneNumber: validatedData.phoneNumber,
          NOT: {
            id: session.user.id,
          },
        },
      })

      if (existingPhone) {
        return NextResponse.json(
          { error: 'Ce numéro de téléphone est déjà utilisé' },
          { status: 400 }
        )
      }
    }

    // Prepare update data
    const updateData: any = {}

    if (validatedData.firstname !== undefined) updateData.firstname = validatedData.firstname
    if (validatedData.surname !== undefined) updateData.surname = validatedData.surname
    if (validatedData.sex !== undefined) updateData.sex = validatedData.sex
    if (validatedData.age !== undefined) updateData.age = validatedData.age
    if (validatedData.phoneNumber !== undefined) updateData.phoneNumber = validatedData.phoneNumber

    // If completing profile, set profileCompletedAt
    if (validatedData.completeProfile) {
      updateData.profileCompletedAt = new Date()
    }

    // Update user
    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: {
        id: true,
        email: true,
        firstname: true,
        surname: true,
        sex: true,
        age: true,
        phoneNumber: true,
        profileCompletedAt: true,
      },
    })

    return NextResponse.json({
      message: 'Profil mis à jour avec succès',
      user,
    })
  } catch (error) {
    console.error('Profile update error:', error)

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

// GET endpoint to fetch current user profile
export async function GET() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        firstname: true,
        surname: true,
        sex: true,
        age: true,
        phoneNumber: true,
        profileCompletedAt: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 })
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Profile fetch error:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue' },
      { status: 500 }
    )
  }
}
