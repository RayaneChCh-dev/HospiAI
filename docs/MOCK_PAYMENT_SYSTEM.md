# Mock Stripe Payment System Documentation

## Overview

A complete mock payment flow has been implemented for the HospiAI subscription system. This simulates the Stripe payment experience without processing real payments, perfect for development and demonstration purposes.

## Components

### PaymentModal Component
**Location**: `/components/subscriptions/payment-modal.tsx`

A full-featured payment modal that simulates credit card payment processing.

**Features**:
- Credit card number input with auto-formatting (1234 5678 9012 3456)
- Cardholder name field
- Expiry date with MM/YY format
- CVV/CVC security code (3 digits)
- Real-time validation for all fields
- Processing animation
- Success confirmation with auto-redirect
- Security badge ("Paiement sécurisé SSL")
- Responsive modal design with overlay

**States**:
1. **Form** - User enters payment information
2. **Processing** - 2-second simulated payment processing
3. **Success** - Success message with 2-second auto-redirect

### Integration in Subscriptions Page
**Location**: `/app/dashboard/subscriptions/page.tsx`

The payment modal is integrated into the subscription management page.

**Flow**:
1. User clicks "Choisir cette offre" on Premium or Pay Per Use plan
2. Payment modal opens
3. User fills in payment details (any valid format accepted)
4. Click "Payer X$/mois"
5. Processing animation (2 seconds)
6. Success message displayed
7. Subscription is updated in database
8. Auto-redirect to /dashboard/subscriptions
9. Page refreshes to show new subscription

**Free Plan Exception**: Clicking on the free plan bypasses the payment modal and switches directly.

## User Experience Flow

```
┌─────────────────────────────────┐
│  Subscription Selection Page    │
│  - View 3 subscription plans    │
│  - Current plan highlighted     │
└──────────┬──────────────────────┘
           │
           │ Click "Choisir cette offre"
           │ (Premium or Pay Per Use)
           ▼
┌─────────────────────────────────┐
│    Payment Modal Opens          │
│  - Card number field            │
│  - Cardholder name              │
│  - Expiry date (MM/YY)          │
│  - CVV (123)                    │
│  - Security badge               │
└──────────┬──────────────────────┘
           │
           │ Fill payment details
           │ Click "Payer"
           ▼
┌─────────────────────────────────┐
│   Validation & Processing       │
│  - Check all fields valid       │
│  - Show loading animation       │
│  - Simulate 2s processing       │
└──────────┬──────────────────────┘
           │
           ▼
┌─────────────────────────────────┐
│    Success Message              │
│  ✅ "Paiement réussi!"          │
│  "Votre abonnement a été mis    │
│   à jour avec succès"           │
│  "Redirection en cours..."      │
└──────────┬──────────────────────┘
           │
           │ After 2 seconds
           ▼
┌─────────────────────────────────┐
│  Subscription Updated           │
│  - API call to update sub       │
│  - Redirect to subscriptions    │
│  - Refresh page                 │
│  - Show new current plan        │
└─────────────────────────────────┘
```

## Validation Rules

### Card Number
- **Required**: Yes
- **Format**: 16 digits, auto-formatted with spaces (1234 5678 9012 3456)
- **Validation**: Must be exactly 16 digits
- **Error Messages**:
  - "Numéro de carte requis" (if empty)
  - "Numéro de carte invalide" (if not 16 digits)

### Cardholder Name
- **Required**: Yes
- **Format**: Any text
- **Validation**: Must not be empty
- **Error Messages**:
  - "Nom du titulaire requis" (if empty)

### Expiry Date
- **Required**: Yes
- **Format**: MM/YY, auto-formatted
- **Validation**:
  - Must be 4 digits (MMYY)
  - Month must be between 01-12
- **Error Messages**:
  - "Date d'expiration requise" (if empty)
  - "Date invalide (MM/AA)" (if not 4 digits)
  - "Mois invalide" (if month > 12 or < 1)

### CVV
- **Required**: Yes
- **Format**: 3 digits
- **Validation**: Must be exactly 3 digits
- **Error Messages**:
  - "CVV requis" (if empty)
  - "CVV invalide" (if not 3 digits)

## Code Examples

### Using the PaymentModal Component

```typescript
import { PaymentModal } from '@/components/subscriptions/payment-modal'

function MyComponent() {
  const [isPaymentOpen, setIsPaymentOpen] = useState(false)

  const handlePaymentSuccess = async () => {
    // Process the subscription change
    await updateSubscription()
    // Redirect or refresh
    router.push('/dashboard/subscriptions')
  }

  return (
    <>
      <button onClick={() => setIsPaymentOpen(true)}>
        Upgrade to Premium
      </button>

      <PaymentModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        subscriptionName="Offre Premium"
        subscriptionPrice={4.99}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </>
  )
}
```

### Test Credit Card Numbers

Since this is a mock payment system, any valid format is accepted:

```
Valid Examples:
- 4242 4242 4242 4242 (Visa format)
- 5555 5555 5555 4444 (Mastercard format)
- 3782 822463 10005 (Amex format - note: modal validates 16 digits only)
- 1234 5678 9012 3456 (Any 16 digits)

Name: Any name
Expiry: Any future date (MM/YY)
CVV: Any 3 digits
```

## Styling & UI

### Modal Design
- **Width**: Max 448px (max-w-md)
- **Background**: Card background with shadow
- **Overlay**: 50% black opacity
- **Icons**:
  - CreditCard icon for card number field
  - Lock icon for security badge
  - Loader2 for processing state
  - CheckCircle2 for success state

### Color Scheme
- **Primary**: Blue theme (matches HospiAI branding)
- **Success**: Green (#10b981)
- **Error**: Red (#ef4444)
- **Muted**: Gray for secondary text

### Responsive
- Works on all screen sizes
- Mobile-friendly form layout
- Touch-friendly button sizes
- Proper spacing for mobile keyboards

## Security Notes

### Mock Payment Disclaimer
The modal footer displays:
```
"Paiement simulé (Mock Stripe) - Aucun paiement réel"
```

This clearly indicates to users that no real payment is being processed.

### Real Stripe Integration (Future)

To integrate real Stripe payments:

1. Install Stripe SDK:
   ```bash
   yarn add @stripe/stripe-js stripe
   ```

2. Add Stripe keys to environment:
   ```bash
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
   STRIPE_SECRET_KEY=sk_test_...
   ```

3. Create Stripe checkout session API:
   ```typescript
   // app/api/stripe/checkout/route.ts
   import Stripe from 'stripe'

   const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

   export async function POST(req: Request) {
     const { priceId } = await req.json()

     const session = await stripe.checkout.sessions.create({
       mode: 'subscription',
       line_items: [{ price: priceId, quantity: 1 }],
       success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/subscriptions?success=true`,
       cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/subscriptions?canceled=true`,
     })

     return Response.json({ url: session.url })
   }
   ```

4. Replace mock modal with Stripe checkout redirect

## API Integration

The payment flow integrates with existing subscription API:

**Endpoint**: `POST /api/subscriptions/user`

```typescript
// Request
{
  "subscriptionSlug": "premium" // or "free", "pay_per_use"
}

// Response (Success)
{
  "message": "Subscription updated successfully",
  "userSubscription": { /* subscription details */ }
}
```

## Files Modified

1. **Created**:
   - `/components/subscriptions/payment-modal.tsx` - Payment modal component

2. **Modified**:
   - `/app/dashboard/subscriptions/page.tsx` - Added payment flow integration

## Features Summary

✅ Complete payment form with validation
✅ Auto-formatting for card number and expiry
✅ Real-time error messages
✅ Processing animation (2s delay)
✅ Success confirmation with checkmark
✅ Auto-redirect after success
✅ Free plan bypasses payment
✅ Premium and Pay Per Use require "payment"
✅ Mobile responsive
✅ Accessible keyboard navigation
✅ Clear mock payment disclaimer
✅ Integration with subscription API

## Testing Checklist

- [ ] Open subscriptions page
- [ ] Click "Choisir cette offre" on Premium plan
- [ ] Modal opens with payment form
- [ ] Try submitting empty form - see validation errors
- [ ] Fill in valid card details (1234 5678 9012 3456, any name, 12/25, 123)
- [ ] Click "Payer 4.99$/mois"
- [ ] See processing animation for 2 seconds
- [ ] See success message with checkmark
- [ ] Wait 2 seconds for auto-redirect
- [ ] Verify subscription updated to Premium
- [ ] Try selecting Free plan - should change without payment modal
- [ ] Test on mobile device for responsive design

---

**Created**: 2026-01-29
**Status**: Complete ✅
**Purpose**: Mock payment system for subscription management
