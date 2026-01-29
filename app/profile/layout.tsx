/**
 * Profile Completion Layout
 * Multi-step profile setup after registration
 */

import { ReactNode } from 'react'
import { Logo } from '@/components/logo'

export default function ProfileLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md">
        {/* Branding */}
        <div className="mb-8 text-center">
          <Logo className="mx-auto mb-4 justify-center" />
          <h1 className="text-2xl font-bold text-foreground">
            Compléter mon profil
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Quelques informations pour personnaliser votre expérience
          </p>
        </div>

        {children}
      </div>
    </div>
  )
}
