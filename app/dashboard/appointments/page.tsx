/**
 * Appointments Page
 * Manage medical appointments
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar } from 'lucide-react'

export default function AppointmentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Mes Rendez-vous</h1>
        <p className="mt-2 text-muted-foreground">
          Consultez et gérez vos rendez-vous médicaux
        </p>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Calendar className="h-12 w-12 text-muted-foreground" />
          <p className="mt-4 text-center text-muted-foreground">
            Page en construction
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
