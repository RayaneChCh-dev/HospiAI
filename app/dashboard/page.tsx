/**
 * Dashboard Home Page - Mes Réservations
 * Overview of user's bookings
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Calendar,
  Clock,
  MapPin,
  ExternalLink,
  Eye,
} from 'lucide-react'

interface Appointment {
  id: string
  description: string | null
  appointmentDateTime: string
  status: string
  createdAt: string
  hospital: {
    id: string
    name: string
    city: string
    address: string | null
    phoneNumber: string | null
  }
}

export default function DashboardPage() {
  const router = useRouter()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchAppointments()
  }, [])

  const fetchAppointments = async () => {
    try {
      const response = await fetch('/api/appointments')
      if (response.ok) {
        const data = await response.json()
        setAppointments(data.appointments || [])
      }
    } catch (error) {
      console.error('Error fetching appointments:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'En attente', variant: 'outline' as const },
      confirmed: { label: 'Confirmé', variant: 'default' as const },
      cancelled: { label: 'Annulé', variant: 'destructive' as const },
      completed: { label: 'Terminé', variant: 'secondary' as const },
    }
    return statusConfig[status as keyof typeof statusConfig] || { label: status, variant: 'outline' as const }
  }

  const handleGoToMistral = () => {
    window.open('https://chat.mistral.ai/', '_blank', 'noopener,noreferrer')
  }

  const handleViewAppointment = (appointmentId: string) => {
    router.push(`/dashboard/appointments/${appointmentId}`)
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Mes Rendez-vous
          </h1>
          <p className="mt-2 text-muted-foreground">
            Gérez vos rendez-vous et consultations hospitalières
          </p>
        </div>
      </div>

      {/* Appointments List */}
      {isLoading ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center text-muted-foreground">
              Chargement des rendez-vous...
            </div>
          </CardContent>
        </Card>
      ) : appointments.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 space-y-4">
            <Calendar className="h-12 w-12 text-muted-foreground" />
            <div className="text-center">
              <h3 className="text-lg font-medium">Aucun rendez-vous</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Vous n&apos;avez aucun rendez-vous pour le moment.
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
          {appointments.map((appointment) => {
            const statusBadge = getStatusBadge(appointment.status)
            return (
              <Card key={appointment.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-xl">{appointment.hospital.name}</CardTitle>
                        <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
                      </div>
                      <CardDescription>
                        {appointment.description || 'Pas de description'}
                      </CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewAppointment(appointment.id)}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      Voir
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-3 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>
                        {new Date(appointment.appointmentDateTime).toLocaleDateString('fr-FR', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                        {' à '}
                        {new Date(appointment.appointmentDateTime).toLocaleTimeString('fr-FR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{appointment.hospital.city}{appointment.hospital.address && ` - ${appointment.hospital.address}`}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
