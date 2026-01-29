/**
 * Subscription Management Page
 * Allows users to view and manage their subscription plans
 */

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Loader2, CreditCard, Zap, Gift } from 'lucide-react'
import { PaymentModal } from '@/components/subscriptions/payment-modal'

interface Subscription {
  id: string
  name: string
  slug: string
  pricePerMonth: number
  features: string[]
}

interface UserSubscription {
  id: string
  subscriptionId: string
  status: string
  startDate: string
  appointmentsThisMonth: number
  payPerUseBalance: number
  subscription: Subscription
}

export default function SubscriptionsPage() {
  const router = useRouter()
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [userSubscription, setUserSubscription] = useState<UserSubscription | null>(null)
  const [loading, setLoading] = useState(true)
  const [changingTo, setChangingTo] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [paymentModal, setPaymentModal] = useState<{
    isOpen: boolean
    subscription: Subscription | null
  }>({ isOpen: false, subscription: null })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)

      // Fetch all available subscriptions
      const subsResponse = await fetch('/api/subscriptions')
      const subsData = await subsResponse.json()

      // Fetch user's current subscription
      const userSubResponse = await fetch('/api/subscriptions/user')
      const userSubData = await userSubResponse.json()

      setSubscriptions(subsData.subscriptions)
      setUserSubscription(userSubData.userSubscription)
    } catch (err) {
      console.error('Error fetching subscriptions:', err)
      setError('Impossible de charger les abonnements')
    } finally {
      setLoading(false)
    }
  }

  const handleSelectSubscription = (subscription: Subscription) => {
    // If it's a paid plan (premium or pay_per_use), show payment modal
    if (subscription.slug === 'premium' || subscription.slug === 'pay_per_use') {
      setPaymentModal({ isOpen: true, subscription })
    } else {
      // For free plan, change directly
      handleChangeSubscription(subscription.slug)
    }
  }

  const handleChangeSubscription = async (slug: string) => {
    try {
      setChangingTo(slug)
      setError('')

      const response = await fetch('/api/subscriptions/user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscriptionSlug: slug,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Erreur lors du changement d\'abonnement')
        return
      }

      // Refresh data
      await fetchData()
    } catch (err) {
      console.error('Error changing subscription:', err)
      setError('Une erreur est survenue')
    } finally {
      setChangingTo(null)
    }
  }

  const handlePaymentSuccess = async () => {
    if (!paymentModal.subscription) return

    // Process subscription change
    await handleChangeSubscription(paymentModal.subscription.slug)

    // Redirect to subscriptions page after a short delay
    setTimeout(() => {
      router.push('/dashboard/subscriptions')
      router.refresh()
    }, 500)
  }

  const getSubscriptionIcon = (slug: string) => {
    switch (slug) {
      case 'free':
        return <Gift className="h-8 w-8" />
      case 'premium':
        return <CreditCard className="h-8 w-8" />
      case 'pay_per_use':
        return <Zap className="h-8 w-8" />
      default:
        return null
    }
  }

  const getSubscriptionColor = (slug: string) => {
    switch (slug) {
      case 'free':
        return 'border-green-500'
      case 'premium':
        return 'border-purple-500'
      case 'pay_per_use':
        return 'border-blue-500'
      default:
        return 'border-gray-300'
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Gérer mon abonnement</h1>
        <p className="mt-2 text-muted-foreground">
          Choisissez l'offre qui correspond le mieux à vos besoins
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
          {error}
        </div>
      )}

      {userSubscription && (
        <div className="mb-8 rounded-lg border bg-card p-6">
          <h2 className="mb-4 text-xl font-semibold">Abonnement actuel</h2>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-primary/10 p-3 text-primary">
                {getSubscriptionIcon(userSubscription.subscription.slug)}
              </div>
              <div>
                <p className="font-semibold">{userSubscription.subscription.name}</p>
                <p className="text-sm text-muted-foreground">
                  {userSubscription.subscription.pricePerMonth === 0
                    ? 'Gratuit'
                    : `${userSubscription.subscription.pricePerMonth}$/mois`}
                </p>
              </div>
            </div>
            {userSubscription.subscription.slug === 'free' && (
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Rendez-vous ce mois-ci</p>
                <p className="font-semibold">{userSubscription.appointmentsThisMonth}/1</p>
              </div>
            )}
            {userSubscription.subscription.slug === 'pay_per_use' && userSubscription.payPerUseBalance > 0 && (
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Solde Pay Per Use</p>
                <p className="font-semibold">${userSubscription.payPerUseBalance.toFixed(2)}</p>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        {subscriptions.map((subscription) => {
          const isCurrentPlan = userSubscription?.subscriptionId === subscription.id
          const isChanging = changingTo === subscription.slug

          return (
            <div
              key={subscription.id}
              className={`relative rounded-lg border-2 bg-card p-6 transition-all ${
                isCurrentPlan
                  ? `${getSubscriptionColor(subscription.slug)} shadow-lg`
                  : 'border-border hover:border-primary'
              }`}
            >
              {isCurrentPlan && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                  Abonnement actuel
                </div>
              )}

              <div className="mb-4 flex items-center gap-3">
                <div className={`rounded-lg ${isCurrentPlan ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'} p-3`}>
                  {getSubscriptionIcon(subscription.slug)}
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{subscription.name}</h3>
                  <p className="text-2xl font-bold">
                    {subscription.pricePerMonth === 0 ? (
                      'Gratuit'
                    ) : (
                      <>
                        {subscription.pricePerMonth}$
                        <span className="text-sm font-normal text-muted-foreground">/mois</span>
                      </>
                    )}
                  </p>
                </div>
              </div>

              <ul className="mb-6 space-y-2">
                {subscription.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSelectSubscription(subscription)}
                disabled={isCurrentPlan || isChanging}
                className={`w-full rounded-lg px-4 py-2 font-medium transition-colors ${
                  isCurrentPlan
                    ? 'cursor-not-allowed bg-muted text-muted-foreground'
                    : 'bg-primary text-primary-foreground hover:bg-primary/90'
                } ${isChanging ? 'cursor-wait opacity-50' : ''}`}
              >
                {isChanging ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Changement en cours...
                  </span>
                ) : isCurrentPlan ? (
                  'Abonnement actuel'
                ) : (
                  'Choisir cette offre'
                )}
              </button>
            </div>
          )
        })}
      </div>

      <div className="mt-8 rounded-lg border bg-card p-6">
        <h2 className="mb-4 text-xl font-semibold">À propos des abonnements</h2>
        <div className="space-y-4 text-sm text-muted-foreground">
          <p>
            <strong className="text-foreground">Offre Gratuite:</strong> Parfait pour découvrir HospiAI avec accès
            au chat IA, conseils médicaux basiques et 1 prise de rendez-vous par mois.
          </p>
          <p>
            <strong className="text-foreground">Offre Premium (4.99$/mois):</strong> Pour un usage régulier avec
            prises de RDV illimitées, historique médical, priorité téléconsultation et alertes personnalisées.
          </p>
          <p>
            <strong className="text-foreground">Pay Per Use:</strong> Idéal pour un usage occasionnel au-delà du
            quota gratuit. 2$ par prise de RDV urgence supplémentaire, 25$ par téléconsultation avec médecin
            non-conventionné.
          </p>
          <p className="pt-4 border-t">
            Vous pouvez changer d'abonnement à tout moment. Les modifications prennent effet immédiatement.
          </p>
        </div>
      </div>

      {/* Payment Modal */}
      {paymentModal.subscription && (
        <PaymentModal
          isOpen={paymentModal.isOpen}
          onClose={() => setPaymentModal({ isOpen: false, subscription: null })}
          subscriptionName={paymentModal.subscription.name}
          subscriptionPrice={paymentModal.subscription.pricePerMonth}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  )
}
