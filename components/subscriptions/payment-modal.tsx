/**
 * Mock Stripe Payment Modal
 * Simulates a payment flow for subscription upgrades
 */

'use client'

import { useState } from 'react'
import { X, CreditCard, Lock, Loader2, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  subscriptionName: string
  subscriptionPrice: number
  onPaymentSuccess: () => void
}

export function PaymentModal({
  isOpen,
  onClose,
  subscriptionName,
  subscriptionPrice,
  onPaymentSuccess,
}: PaymentModalProps) {
  const [step, setStep] = useState<'form' | 'processing' | 'success'>('form')
  const [formData, setFormData] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  if (!isOpen) return null

  const formatCardNumber = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    const formatted = numbers.match(/.{1,4}/g)?.join(' ') || numbers
    return formatted.substring(0, 19) // 16 digits + 3 spaces
  }

  const formatExpiryDate = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    if (numbers.length >= 2) {
      return numbers.substring(0, 2) + '/' + numbers.substring(2, 4)
    }
    return numbers
  }

  const handleInputChange = (field: string, value: string) => {
    let formattedValue = value

    if (field === 'cardNumber') {
      formattedValue = formatCardNumber(value)
    } else if (field === 'expiryDate') {
      formattedValue = formatExpiryDate(value)
    } else if (field === 'cvv') {
      formattedValue = value.replace(/\D/g, '').substring(0, 3)
    }

    setFormData((prev) => ({ ...prev, [field]: formattedValue }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    // Card number validation (should be 16 digits)
    const cardNumberDigits = formData.cardNumber.replace(/\D/g, '')
    if (!cardNumberDigits) {
      newErrors.cardNumber = 'Numéro de carte requis'
    } else if (cardNumberDigits.length !== 16) {
      newErrors.cardNumber = 'Numéro de carte invalide'
    }

    // Card name validation
    if (!formData.cardName.trim()) {
      newErrors.cardName = 'Nom du titulaire requis'
    }

    // Expiry date validation
    const expiryDigits = formData.expiryDate.replace(/\D/g, '')
    if (!expiryDigits) {
      newErrors.expiryDate = 'Date d\'expiration requise'
    } else if (expiryDigits.length !== 4) {
      newErrors.expiryDate = 'Date invalide (MM/AA)'
    } else {
      const month = parseInt(expiryDigits.substring(0, 2))
      if (month < 1 || month > 12) {
        newErrors.expiryDate = 'Mois invalide'
      }
    }

    // CVV validation
    if (!formData.cvv) {
      newErrors.cvv = 'CVV requis'
    } else if (formData.cvv.length !== 3) {
      newErrors.cvv = 'CVV invalide'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    // Simulate processing
    setStep('processing')

    // Mock payment processing delay (2 seconds)
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Show success
    setStep('success')

    // Auto close and call success callback after 2 seconds
    setTimeout(() => {
      onPaymentSuccess()
      handleClose()
    }, 2000)
  }

  const handleClose = () => {
    setStep('form')
    setFormData({
      cardNumber: '',
      cardName: '',
      expiryDate: '',
      cvv: '',
    })
    setErrors({})
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={step === 'form' ? handleClose : undefined}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-md rounded-lg bg-card shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between border-b p-6">
          <div>
            <h2 className="text-xl font-semibold">Paiement sécurisé</h2>
            <p className="text-sm text-muted-foreground">
              {subscriptionName} - {subscriptionPrice}$/mois
            </p>
          </div>
          {step === 'form' && (
            <button
              onClick={handleClose}
              className="rounded-lg p-2 hover:bg-accent"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 'form' && (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Card Number */}
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Numéro de carte
                </label>
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    value={formData.cardNumber}
                    onChange={(e) =>
                      handleInputChange('cardNumber', e.target.value)
                    }
                    className={errors.cardNumber ? 'border-red-500' : ''}
                  />
                  <CreditCard className="absolute right-3 top-3 h-5 w-5 text-muted-foreground" />
                </div>
                {errors.cardNumber && (
                  <p className="mt-1 text-sm text-red-500">{errors.cardNumber}</p>
                )}
              </div>

              {/* Card Name */}
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Nom du titulaire
                </label>
                <Input
                  type="text"
                  placeholder="Jean Dupont"
                  value={formData.cardName}
                  onChange={(e) =>
                    handleInputChange('cardName', e.target.value)
                  }
                  className={errors.cardName ? 'border-red-500' : ''}
                />
                {errors.cardName && (
                  <p className="mt-1 text-sm text-red-500">{errors.cardName}</p>
                )}
              </div>

              {/* Expiry and CVV */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Date d'expiration
                  </label>
                  <Input
                    type="text"
                    placeholder="MM/AA"
                    value={formData.expiryDate}
                    onChange={(e) =>
                      handleInputChange('expiryDate', e.target.value)
                    }
                    className={errors.expiryDate ? 'border-red-500' : ''}
                  />
                  {errors.expiryDate && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.expiryDate}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">CVV</label>
                  <Input
                    type="text"
                    placeholder="123"
                    value={formData.cvv}
                    onChange={(e) => handleInputChange('cvv', e.target.value)}
                    className={errors.cvv ? 'border-red-500' : ''}
                  />
                  {errors.cvv && (
                    <p className="mt-1 text-sm text-red-500">{errors.cvv}</p>
                  )}
                </div>
              </div>

              {/* Security Notice */}
              <div className="flex items-center gap-2 rounded-lg bg-muted p-3">
                <Lock className="h-4 w-4 text-primary" />
                <p className="text-xs text-muted-foreground">
                  Paiement sécurisé SSL. Vos informations sont protégées.
                </p>
              </div>

              {/* Submit Button */}
              <Button type="submit" className="w-full">
                Payer {subscriptionPrice}$/mois
              </Button>
            </form>
          )}

          {step === 'processing' && (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="mb-4 h-12 w-12 animate-spin text-primary" />
              <p className="text-lg font-medium">Traitement du paiement...</p>
              <p className="text-sm text-muted-foreground">
                Veuillez patienter
              </p>
            </div>
          )}

          {step === 'success' && (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="mb-4 rounded-full bg-green-100 p-3">
                <CheckCircle2 className="h-12 w-12 text-green-600" />
              </div>
              <p className="mb-2 text-lg font-medium">Paiement réussi!</p>
              <p className="text-center text-sm text-muted-foreground">
                Votre abonnement a été mis à jour avec succès.
                <br />
                Redirection en cours...
              </p>
            </div>
          )}
        </div>

        {/* Footer - Mock Stripe Badge */}
        {step === 'form' && (
          <div className="border-t bg-muted/50 px-6 py-3">
            <p className="text-center text-xs text-muted-foreground">
              Paiement simulé (Mock Stripe) - Aucun paiement réel
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
