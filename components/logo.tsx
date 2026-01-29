/**
 * HospiAI Logo Component
 * Medical AI platform logo
 */

import  Image  from 'next/image'

export function Logo({ className }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex h-10 w-10 items-center justify-center">
        <Image src="/logo.png" alt="HospiAI Logo" width={100} height={100} />
      </div>
      <span className="text-xl font-bold text-foreground">HospiAI</span>
    </div>
  )
}
