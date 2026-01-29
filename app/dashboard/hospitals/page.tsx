/**
 * Hospitals Page
 * View nearby hospitals and their availability
 */

import { Card, CardContent } from '@/components/ui/card'
import { Hospital } from 'lucide-react'

export default function HospitalsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Hôpitaux</h1>
        <p className="mt-2 text-muted-foreground">
          Trouvez les hôpitaux et urgences à proximité
        </p>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Hospital className="h-12 w-12 text-muted-foreground" />
          <p className="mt-4 text-center text-muted-foreground">
            Page en construction
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
