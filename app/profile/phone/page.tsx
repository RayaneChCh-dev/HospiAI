/**
 * Profile Step 3: Phone Number
 * Collect phone number and complete profile
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Phone } from 'lucide-react'

export default function ProfilePhonePage() {
  const router = useRouter()
  const { update } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    phoneNumber: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: formData.phoneNumber,
          completeProfile: true, // Mark profile as completed
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Une erreur est survenue')
        setIsLoading(false)
        return
      }

      // Update session with new profile completion status
      await update({
        profileCompletedAt: data.user.profileCompletedAt,
        firstname: data.user.firstname,
        surname: data.user.surname,
      })

      // Redirect to dashboard after profile completion
      router.push('/dashboard')
      router.refresh()
    } catch (err) {
      setError('Une erreur est survenue. Veuillez réessayer.')
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Numéro de téléphone</CardTitle>
        <CardDescription>
          Étape 3/3 - Dernière étape pour compléter votre profil
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Error Message */}
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {/* Phone Number Field */}
          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Numéro de téléphone</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="phoneNumber"
                type="tel"
                placeholder="0612345678"
                className="pl-10"
                value={formData.phoneNumber}
                onChange={(e) =>
                  setFormData({ ...formData, phoneNumber: e.target.value })
                }
                required
                disabled={isLoading}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Format français : 0612345678 ou +33612345678
            </p>
          </div>

          {/* Navigation Buttons */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => router.back()}
              disabled={isLoading}
            >
              Retour
            </Button>
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Finalisation...' : 'Compléter mon profil'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
