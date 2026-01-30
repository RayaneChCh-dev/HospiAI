/**
 * Appointment Detail Page
 * Displays detailed information about a specific appointment
 */

'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Calendar,
  Clock,
  MapPin,
  Phone,
  Mail,
  ArrowLeft,
  Building2,
  FileText,
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
    email: string | null
  }
}

export default function AppointmentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const appointmentId = params?.id as string

  const [appointment, setAppointment] = useState<Appointment | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (appointmentId) {
      fetchAppointment()
    }
  }, [appointmentId])

  const fetchAppointment = async () => {
    try {
      const response = await fetch(`/api/appointments/${appointmentId}`)
      if (response.ok) {
        const data = await response.json()
        setAppointment(data.appointment)
      } else {
        setError('Rendez-vous non trouvé')
      }
    } catch (error) {
      console.error('Error fetching appointment:', error)
      setError('Une erreur est survenue')
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

  const handleBack = () => {
    router.push('/dashboard')
  }

  if (isLoading) {
    return (
      <div className="space-y-8">
        <Button variant="ghost" onClick={handleBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour aux rendez-vous
        </Button>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center text-muted-foreground">
              Chargement du rendez-vous...
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !appointment) {
    return (
      <div className="space-y-8">
        <Button variant="ghost" onClick={handleBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour aux rendez-vous
        </Button>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center">
              <h3 className="text-lg font-medium text-destructive">{error}</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Le rendez-vous demandé n&apos;existe pas ou vous n&apos;avez pas l&apos;autorisation de le consulter.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const statusBadge = getStatusBadge(appointment.status)

  return (
    <div className="space-y-8">
      {/* Back Button */}
      <Button variant="ghost" onClick={handleBack}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Retour aux rendez-vous
      </Button>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-foreground">Détails du rendez-vous</h1>
            <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
          </div>
          <p className="mt-2 text-muted-foreground">
            Informations complètes sur votre rendez-vous
          </p>
        </div>
      </div>

      {/* Appointment Details */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Date & Time Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Date et heure
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Date du rendez-vous</p>
              <p className="text-lg font-medium">
                {new Date(appointment.appointmentDateTime).toLocaleDateString('fr-FR', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Heure</p>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <p className="text-lg font-medium">
                  {new Date(appointment.appointmentDateTime).toLocaleTimeString('fr-FR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Créé le</p>
              <p className="text-sm">
                {new Date(appointment.createdAt).toLocaleDateString('fr-FR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Hospital Information Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Établissement
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Nom de l&apos;hôpital</p>
              <p className="text-lg font-medium">{appointment.hospital.name}</p>
            </div>
            {appointment.hospital.address && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Adresse</p>
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                  <div>
                    <p className="text-sm">{appointment.hospital.address}</p>
                    <p className="text-sm">{appointment.hospital.city}</p>
                  </div>
                </div>
              </div>
            )}
            {!appointment.hospital.address && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Ville</p>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm">{appointment.hospital.city}</p>
                </div>
              </div>
            )}
            {appointment.hospital.phoneNumber && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Téléphone</p>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <a
                    href={`tel:${appointment.hospital.phoneNumber}`}
                    className="text-sm text-primary hover:underline"
                  >
                    {appointment.hospital.phoneNumber}
                  </a>
                </div>
              </div>
            )}
            {appointment.hospital.email && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Email</p>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <a
                    href={`mailto:${appointment.hospital.email}`}
                    className="text-sm text-primary hover:underline"
                  >
                    {appointment.hospital.email}
                  </a>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Description Card */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Description
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              {appointment.description || 'Aucune description fournie pour ce rendez-vous.'}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
