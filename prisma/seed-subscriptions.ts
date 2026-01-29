import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import { neonConfig } from '@neondatabase/serverless';
import ws from 'ws';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });
dotenv.config();

// Configure WebSocket for Neon
neonConfig.webSocketConstructor = ws;

// Create Prisma client with Neon adapter
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const adapter = new PrismaNeon({ connectionString });
const prisma = new PrismaClient({ adapter });

async function seedSubscriptions() {
  console.log('🌱 Seeding subscriptions...');

  try {
    // Delete existing subscriptions
    await prisma.subscription.deleteMany();
    console.log('✅ Cleared existing subscriptions');

    // Create subscription plans
    const freeSubscription = await prisma.subscription.create({
      data: {
        name: 'Offre Gratuite',
        slug: 'free',
        pricePerMonth: 0,
        features: JSON.stringify([
          'Chat IA diagnostic illimité',
          'Conseils médicaux basiques',
          'Numéros d\'urgence',
          '1 prise de RDV/mois'
        ])
      }
    });
    console.log('✅ Created Free subscription');

    const premiumSubscription = await prisma.subscription.create({
      data: {
        name: 'Offre Premium',
        slug: 'premium',
        pricePerMonth: 4.99,
        features: JSON.stringify([
          'Tout de l\'offre gratuite',
          'Prises de RDV urgences illimitées',
          'Historique médical stocké',
          'Priorité téléconsultation',
          'Alertes personnalisées (rappels, prévention)',
          'Export PDF consultations'
        ])
      }
    });
    console.log('✅ Created Premium subscription');

    const payPerUseSubscription = await prisma.subscription.create({
      data: {
        name: 'Pay Per Use',
        slug: 'pay_per_use',
        pricePerMonth: 0, // No monthly fee, pay as you go
        features: JSON.stringify([
          'Tout de l\'offre gratuite',
          '2$/prise de RDV urgences (au-delà du quota gratuit)',
          '25$/téléconsultation (médecin non-conventionné)'
        ])
      }
    });
    console.log('✅ Created Pay Per Use subscription');

    console.log('\n📊 Subscription Plans Summary:');
    console.log('================================');
    console.log(`Free: ${freeSubscription.id} - ${freeSubscription.pricePerMonth}$/month`);
    console.log(`Premium: ${premiumSubscription.id} - ${premiumSubscription.pricePerMonth}$/month`);
    console.log(`Pay Per Use: ${payPerUseSubscription.id} - ${payPerUseSubscription.pricePerMonth}$/month (+ usage fees)`);
    console.log('================================\n');

    console.log('✅ Subscription seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding subscriptions:', error);
    throw error;
  }
}

// Run the seed
seedSubscriptions()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
