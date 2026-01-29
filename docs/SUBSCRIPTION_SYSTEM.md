# Subscription System Documentation

## Overview

HospiAI now includes a complete subscription management system with three tiers:
- **Offre Gratuite** (Free): Basic features with limited appointments
- **Offre Premium** (4.99$/month): Unlimited appointments and premium features
- **Pay Per Use**: Pay-as-you-go for occasional users

## Database Schema

### Subscription Model

Stores the available subscription plans.

```prisma
model Subscription {
  id          String   @id @default(cuid())
  name        String   @unique // "Offre Gratuite", "Offre Premium", "Pay Per Use"
  slug        String   @unique // "free", "premium", "pay_per_use"
  pricePerMonth Float  // 0, 4.99, or 0 for pay-per-use
  features    Json     // Array of features as JSON
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  userSubscriptions UserSubscription[]
}
```

### UserSubscription Model

Links users to their subscription plan and tracks usage.

```prisma
model UserSubscription {
  id              String    @id @default(cuid())
  userId          String    @unique // One subscription per user
  subscriptionId  String
  status          String    @default("active") // active, cancelled, expired
  startDate       DateTime  @default(now())
  endDate         DateTime? // Null for active subscriptions

  // Usage tracking
  appointmentsThisMonth Int @default(0) // For free users (limit 1/month)
  lastResetDate   DateTime  @default(now()) // When to reset monthly counter
  payPerUseBalance Float @default(0) // Track pay-per-use charges

  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  user         User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  subscription Subscription @relation(fields: [subscriptionId], references: [id])
}
```

## Subscription Plans

### 1. Offre Gratuite (Free - 0$/month)

**Features:**
- Chat IA diagnostic illimité
- Conseils médicaux basiques
- Numéros d'urgence
- 1 prise de RDV/mois

**Use Case:** Users who want to try HospiAI with minimal commitment.

### 2. Offre Premium (4.99$/month)

**Features:**
- Tout de l'offre gratuite
- Prises de RDV urgences illimitées
- Historique médical stocké
- Priorité téléconsultation
- Alertes personnalisées (rappels, prévention)
- Export PDF consultations

**Use Case:** Regular users who need frequent appointments and premium features.

### 3. Pay Per Use (0$/month + usage fees)

**Features:**
- Tout de l'offre gratuite
- 2$/prise de RDV urgences (au-delà du quota gratuit)
- 25$/téléconsultation (médecin non-conventionné)

**Use Case:** Occasional users who prefer pay-as-you-go pricing.

## API Endpoints

### GET /api/subscriptions

Returns all available subscription plans.

**Response:**
```json
{
  "subscriptions": [
    {
      "id": "cmkzpqve00000au3h1xvksfj1",
      "name": "Offre Gratuite",
      "slug": "free",
      "pricePerMonth": 0,
      "features": [
        "Chat IA diagnostic illimité",
        "Conseils médicaux basiques",
        "Numéros d'urgence",
        "1 prise de RDV/mois"
      ],
      "createdAt": "2026-01-29T...",
      "updatedAt": "2026-01-29T..."
    }
    // ... other plans
  ]
}
```

### GET /api/subscriptions/user

Returns the current user's subscription information. If user has no subscription, automatically assigns the free plan.

**Authentication:** Required (NextAuth session)

**Response:**
```json
{
  "userSubscription": {
    "id": "...",
    "userId": "...",
    "subscriptionId": "...",
    "status": "active",
    "startDate": "2026-01-29T...",
    "appointmentsThisMonth": 0,
    "payPerUseBalance": 0,
    "subscription": {
      "id": "...",
      "name": "Offre Gratuite",
      "slug": "free",
      "pricePerMonth": 0,
      "features": [...]
    }
  }
}
```

### POST /api/subscriptions/user

Change the user's subscription plan.

**Authentication:** Required (NextAuth session)

**Request Body:**
```json
{
  "subscriptionSlug": "premium" // or "free", "pay_per_use"
}
```

**Response:**
```json
{
  "message": "Subscription updated successfully",
  "userSubscription": {
    // ... updated subscription details
  }
}
```

**Error Responses:**
- `400`: Invalid slug or user already has this subscription
- `401`: Unauthorized
- `404`: User or subscription not found
- `500`: Internal server error

## Frontend Components

### Subscription Management Page

Location: `/app/dashboard/subscriptions/page.tsx`

**Features:**
- Display all available subscription plans
- Show current subscription with visual indicator
- Change subscription with one click
- Display usage information (appointments for free users, balance for pay-per-use)
- Responsive design with color-coded cards

**Icons:**
- Free: Gift icon (green border)
- Premium: CreditCard icon (purple border)
- Pay Per Use: Zap icon (blue border)

### Navigation

Location: `/components/dashboard/nav.tsx`

Added "Abonnements" link to sidebar with CreditCard icon.

## Seeding Subscriptions

To seed the database with subscription plans:

```bash
npx tsx prisma/seed-subscriptions.ts
```

This will:
1. Clear existing subscriptions
2. Create the three subscription plans
3. Display a summary of created plans

**Output:**
```
🌱 Seeding subscriptions...
✅ Cleared existing subscriptions
✅ Created Free subscription
✅ Created Premium subscription
✅ Created Pay Per Use subscription

📊 Subscription Plans Summary:
================================
Free: cmkzpqve00000au3h1xvksfj1 - 0$/month
Premium: cmkzpqveo0001au3hmur9c6jj - 4.99$/month
Pay Per Use: cmkzpqvf70002au3ho0a92jyj - 0$/month (+ usage fees)
================================

✅ Subscription seeding completed successfully!
```

## Usage Tracking

### Free Plan

- `appointmentsThisMonth`: Counter that tracks appointments
- `lastResetDate`: Date when the counter was last reset
- Limit: 1 appointment per month
- Reset: Monthly on the date from `lastResetDate`

**Implementation (TODO):**
When a user books an appointment, check:
```typescript
if (userSubscription.subscription.slug === 'free') {
  // Check if month has passed since last reset
  const now = new Date();
  const lastReset = new Date(userSubscription.lastResetDate);
  const monthsPassed = (now.getMonth() - lastReset.getMonth()) +
                      (12 * (now.getFullYear() - lastReset.getFullYear()));

  if (monthsPassed >= 1) {
    // Reset counter
    await prisma.userSubscription.update({
      where: { id: userSubscription.id },
      data: {
        appointmentsThisMonth: 0,
        lastResetDate: now
      }
    });
  }

  // Check limit
  if (userSubscription.appointmentsThisMonth >= 1) {
    throw new Error('Monthly appointment limit reached. Upgrade to Premium for unlimited appointments.');
  }

  // Increment counter
  await prisma.userSubscription.update({
    where: { id: userSubscription.id },
    data: {
      appointmentsThisMonth: { increment: 1 }
    }
  });
}
```

### Pay Per Use

- `payPerUseBalance`: Running total of charges
- 2$ per emergency appointment (beyond free quota)
- 25$ per teleconsultation with non-contracted doctor

**Implementation (TODO):**
When a user uses a paid service:
```typescript
if (userSubscription.subscription.slug === 'pay_per_use') {
  const charge = service === 'emergency_appointment' ? 2 : 25;

  await prisma.userSubscription.update({
    where: { id: userSubscription.id },
    data: {
      payPerUseBalance: { increment: charge }
    }
  });
}
```

## Default Behavior

When a new user registers or when an existing user without a subscription accesses `/api/subscriptions/user`:
- Automatically assigned the **Free** plan
- Status: `active`
- StartDate: Current date
- Counters reset to 0

## Migration Checklist

- [x] Add Subscription and UserSubscription models to Prisma schema
- [x] Update User model with userSubscription relation
- [x] Push schema changes to database (`npx prisma db push`)
- [x] Generate Prisma client (`npx prisma generate`)
- [x] Create subscription seed script
- [x] Run seed script to populate subscriptions
- [x] Create API endpoints for subscriptions
- [x] Create API endpoints for user subscription management
- [x] Update sidebar navigation with subscription link
- [x] Create subscription management page
- [x] Build and test

## Future Enhancements

### Payment Integration

- [ ] Integrate Stripe for Premium subscription payments
- [ ] Add payment method management
- [ ] Implement billing history
- [ ] Handle failed payments and subscription suspension

### Usage Enforcement

- [ ] Implement appointment limit checks in booking API
- [ ] Add pay-per-use charging logic
- [ ] Create usage dashboard/analytics
- [ ] Email notifications for usage limits

### Subscription Features

- [ ] Add subscription trial periods
- [ ] Implement subscription cancellation flow
- [ ] Add subscription upgrade/downgrade prorating
- [ ] Create admin panel for subscription management

### User Experience

- [ ] Add subscription comparison tool
- [ ] Implement subscription recommendations based on usage
- [ ] Create usage alerts (approaching limits)
- [ ] Add subscription renewal reminders

## Related Files

- `/prisma/schema.prisma` - Database schema
- `/prisma/seed-subscriptions.ts` - Subscription seed script
- `/app/api/subscriptions/route.ts` - Get all subscriptions endpoint
- `/app/api/subscriptions/user/route.ts` - User subscription management endpoint
- `/app/dashboard/subscriptions/page.tsx` - Subscription management UI
- `/components/dashboard/nav.tsx` - Navigation with subscription link

## Testing

### Manual Testing Checklist

1. **Seed Database:**
   ```bash
   npx tsx prisma/seed-subscriptions.ts
   ```

2. **Access Subscription Page:**
   - Login to dashboard
   - Click "Abonnements" in sidebar
   - Verify all 3 plans are displayed

3. **Test Subscription Change:**
   - Click "Choisir cette offre" on Premium plan
   - Verify subscription changes
   - Verify "Abonnement actuel" badge appears on Premium card
   - Check database that UserSubscription was created/updated

4. **Test API Endpoints:**
   ```bash
   # Get all subscriptions
   curl http://localhost:3000/api/subscriptions

   # Get user subscription (requires auth)
   curl http://localhost:3000/api/subscriptions/user \
     -H "Cookie: authjs.session-token=..."

   # Change subscription (requires auth)
   curl -X POST http://localhost:3000/api/subscriptions/user \
     -H "Content-Type: application/json" \
     -H "Cookie: authjs.session-token=..." \
     -d '{"subscriptionSlug":"premium"}'
   ```

5. **Verify Auto-Assignment:**
   - Register new user
   - Access `/dashboard/subscriptions`
   - Verify user is automatically assigned Free plan

---

**Created:** 2026-01-29
**Last Updated:** 2026-01-29
