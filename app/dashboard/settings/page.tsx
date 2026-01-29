/**
 * Settings Page
 * User account settings
 */

import { Card, CardContent } from '@/components/ui/card'
import { Settings } from 'lucide-react'

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Paramètres</h1>
        <p className="mt-2 text-muted-foreground">
          Gérez les paramètres de votre compte
        </p>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Settings className="h-12 w-12 text-muted-foreground" />
          <p className="mt-4 text-center text-muted-foreground">
            Page en construction
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
