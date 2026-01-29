/**
 * Analyses Page
 * View medical analysis history
 */

import { Card, CardContent } from '@/components/ui/card'
import { FileText } from 'lucide-react'

export default function AnalysesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Mes Analyses</h1>
        <p className="mt-2 text-muted-foreground">
          Historique de vos analyses de symptômes
        </p>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <FileText className="h-12 w-12 text-muted-foreground" />
          <p className="mt-4 text-center text-muted-foreground">
            Page en construction
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
