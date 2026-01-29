/**
 * Dashboard Home Page - Mes Réservations
 * Overview of user's bookings
 */

import { auth } from '@/auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Calendar,
  Clock,
  MapPin,
  Plus,
} from 'lucide-react'

export default async function DashboardPage() {
  const session = await auth()

  // TODO: Fetch real bookings from database
  const mockBookings = [
    {
      id: '1',
      hospital: 'Hôpital Saint-Louis',
      description: 'Consultation générale',
      reservedAt: new Date('2026-02-01T14:30:00'),
      createdAt: new Date('2026-01-25'),
    },
    {
      id: '2',
      hospital: 'Clinique des Lilas',
      description: 'Analyse de sang',
      reservedAt: new Date('2026-02-05T10:00:00'),
      createdAt: new Date('2026-01-26'),
    },
  ]

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
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Nouvelle réservation
        </Button>
      </div>

      {/* Bookings List */}
      <div className="space-y-4">
        {mockBookings.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">Aucune réservation</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Vous n&apos;avez pas encore de réservation
              </p>
              <Button className="mt-4 gap-2">
                <Plus className="h-4 w-4" />
                Créer une réservation
              </Button>
            </CardContent>
          </Card>
        ) : (
          mockBookings.map((booking) => (
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
                      {booking.reservedAt.toLocaleDateString('fr-FR', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                      {' à '}
                      {booking.reservedAt.toLocaleTimeString('fr-FR', {
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
          ))
        )}
      </div>
    </div>
  )
}
