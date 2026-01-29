/**
 * HospiAI Logo Component
 * Medical AI platform logo
 */

import { Activity } from 'lucide-react'

export function Logo({ className }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
        <Activity className="h-6 w-6 text-white" />
      </div>
      <span className="text-xl font-bold text-foreground">HospiAI</span>
    </div>
  )
}
