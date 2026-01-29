/**
 * Seed script to populate initial hospital data
 * Run with: npx tsx prisma/seed-hospitals.ts
 */

import { prisma } from '../lib/prisma'

const hospitalsData = [
  {
    name: 'Hôpital Saint-Louis',
    city: 'Paris',
    distanceKm: 2.1,
    address: '1 Avenue Claude Vellefaux, 75010 Paris',
    phoneNumber: '+33 1 42 49 49 49',
    email: 'contact@hopital-saint-louis.fr',
    status: {
      availableBeds: 15,
      icuBeds: 3,
      ventilators: 5,
    },
  },
  {
    name: 'Hôpital Lariboisière',
    city: 'Paris',
    distanceKm: 3.4,
    address: '2 Rue Ambroise Paré, 75010 Paris',
    phoneNumber: '+33 1 49 95 65 65',
    email: 'contact@lariboisiere.fr',
    status: {
      availableBeds: 8,
      icuBeds: 2,
      ventilators: 3,
    },
  },
  {
    name: 'Hôpital Bichat-Claude Bernard',
    city: 'Paris',
    distanceKm: 4.2,
    address: '46 Rue Henri Huchard, 75018 Paris',
    phoneNumber: '+33 1 40 25 80 80',
    email: 'contact@bichat.fr',
    status: {
      availableBeds: 22,
      icuBeds: 6,
      ventilators: 9,
    },
  },
  {
    name: 'Hôpital Pitié-Salpêtrière',
    city: 'Paris',
    distanceKm: 5.0,
    address: '47-83 Boulevard de l\'Hôpital, 75013 Paris',
    phoneNumber: '+33 1 42 16 00 00',
    email: 'contact@pitie-salpetriere.fr',
    status: {
      availableBeds: 18,
      icuBeds: 5,
      ventilators: 8,
    },
  },
  {
    name: 'Hôpital Necker-Enfants malades',
    city: 'Paris',
    distanceKm: 3.8,
    address: '149 Rue de Sèvres, 75015 Paris',
    phoneNumber: '+33 1 44 49 40 00',
    email: 'contact@necker.fr',
    status: {
      availableBeds: 12,
      icuBeds: 4,
      ventilators: 6,
    },
  },
  {
    name: 'Hôpital Cochin',
    city: 'Paris',
    distanceKm: 2.9,
    address: '27 Rue du Faubourg Saint-Jacques, 75014 Paris',
    phoneNumber: '+33 1 58 41 41 41',
    email: 'contact@cochin.fr',
    status: {
      availableBeds: 16,
      icuBeds: 4,
      ventilators: 7,
    },
  },
  {
    name: 'Hôpital Européen Georges-Pompidou',
    city: 'Paris',
    distanceKm: 4.5,
    address: '20 Rue Leblanc, 75015 Paris',
    phoneNumber: '+33 1 56 09 20 00',
    email: 'contact@hegp.fr',
    status: {
      availableBeds: 20,
      icuBeds: 6,
      ventilators: 10,
    },
  },
  {
    name: 'Hôpital Beaujon',
    city: 'Clichy',
    distanceKm: 6.3,
    address: '100 Boulevard du Général Leclerc, 92110 Clichy',
    phoneNumber: '+33 1 40 87 50 00',
    email: 'contact@beaujon.fr',
    status: {
      availableBeds: 14,
      icuBeds: 3,
      ventilators: 5,
    },
  },
  {
    name: 'Hôpital Henri-Mondor',
    city: 'Créteil',
    distanceKm: 12.5,
    address: '51 Avenue du Maréchal de Lattre de Tassigny, 94010 Créteil',
    phoneNumber: '+33 1 49 81 21 11',
    email: 'contact@henri-mondor.fr',
    status: {
      availableBeds: 17,
      icuBeds: 5,
      ventilators: 8,
    },
  },
  {
    name: 'Hôpital Antoine-Béclère',
    city: 'Clamart',
    distanceKm: 8.7,
    address: '157 Rue de la Porte de Trivaux, 92140 Clamart',
    phoneNumber: '+33 1 45 37 44 44',
    email: 'contact@beclere.fr',
    status: {
      availableBeds: 11,
      icuBeds: 3,
      ventilators: 4,
    },
  },
  {
    name: 'CHU Louis-Mourier',
    city: 'Colombes',
    distanceKm: 9.2,
    address: '178 Rue des Renouillers, 92700 Colombes',
    phoneNumber: '+33 1 47 60 61 62',
    email: 'contact@louis-mourier.fr',
    status: {
      availableBeds: 13,
      icuBeds: 4,
      ventilators: 6,
    },
  },
  {
    name: 'Hôpital Ambroise-Paré',
    city: 'Boulogne-Billancourt',
    distanceKm: 7.1,
    address: '9 Avenue Charles de Gaulle, 92100 Boulogne-Billancourt',
    phoneNumber: '+33 1 49 09 50 00',
    email: 'contact@ambroise-pare.fr',
    status: {
      availableBeds: 15,
      icuBeds: 4,
      ventilators: 7,
    },
  },
]

async function main() {
  console.log('🏥 Starting hospital database seeding...')

  for (const hospitalData of hospitalsData) {
    const { status, ...hospital } = hospitalData

    // Check if hospital already exists
    const existingHospital = await prisma.hospital.findFirst({
      where: {
        name: hospital.name,
        city: hospital.city,
      },
    })

    if (existingHospital) {
      console.log(`✓ Hospital already exists: ${hospital.name}`)
      continue
    }

    // Create hospital with status
    const createdHospital = await prisma.hospital.create({
      data: {
        ...hospital,
        hospitalStatus: {
          create: status,
        },
      },
      include: {
        hospitalStatus: true,
      },
    })

    console.log(`✓ Created hospital: ${createdHospital.name} (${createdHospital.city})`)
    console.log(`  - Available beds: ${createdHospital.hospitalStatus?.availableBeds}`)
    console.log(`  - ICU beds: ${createdHospital.hospitalStatus?.icuBeds}`)
    console.log(`  - Ventilators: ${createdHospital.hospitalStatus?.ventilators}`)
  }

  console.log('\n✅ Hospital seeding completed!')

  // Print summary
  const totalHospitals = await prisma.hospital.count()
  const totalStatuses = await prisma.hospitalStatus.count()

  console.log('\n📊 Database Summary:')
  console.log(`  - Total hospitals: ${totalHospitals}`)
  console.log(`  - Total hospital statuses: ${totalStatuses}`)
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
