/**
 * Dashboard Home Page - Mes Réservations
 * Overview of user's bookings
 */

'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Calendar,
  Clock,
  MapPin,
  ExternalLink,
} from 'lucide-react'

interface Booking {
  id: string
  description: string
  hospital: string
  reservedAt: string
  createdAt: string
}

export default function DashboardPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    try {
      const response = await fetch('/api/bookings')
      if (response.ok) {
        const data = await response.json()
        setBookings(data.bookings || [])
      }
    } catch (error) {
      console.error('Error fetching bookings:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoToMistral = () => {
    window.open('https://chat.mistral.ai/', '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Mes Réservations
          </h1>
          <p className="mt-2 text-muted-foreground">
            Gérez vos rendez-vous et réservations hospitalières
          </p>
        </div>
      </div>

      {/* Bookings List */}
      {isLoading ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center text-muted-foreground">
              Chargement des réservations...
            </div>
          </CardContent>
        </Card>
      ) : bookings.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 space-y-4">
            <Calendar className="h-12 w-12 text-muted-foreground" />
            <div className="text-center">
              <h3 className="text-lg font-medium">Aucune réservation</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Vous n&apos;avez aucune réservation pour le moment.
              </p>
            </div>
            <Button onClick={handleGoToMistral} className="mt-4">
              <ExternalLink className="mr-2 h-4 w-4" />
              Prendre rendez-vous avec Mistral AI
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <Card key={booking.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl">{booking.hospital}</CardTitle>
                    <CardDescription className="mt-1">
                      {booking.description}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      Modifier
                    </Button>
                    <Button variant="destructive" size="sm">
                      Annuler
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>
                      {new Date(booking.reservedAt).toLocaleDateString('fr-FR', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                      {' à '}
                      {new Date(booking.reservedAt).toLocaleTimeString('fr-FR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>Voir sur la carte</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
