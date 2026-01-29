/**
 * Dashboard Navigation
 * Sidebar navigation component with mobile support
 */

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Logo } from '@/components/logo'
import {
  Calendar,
  LogOut,
  Key,
  CreditCard,
  X,
} from 'lucide-react'
import { signOut } from 'next-auth/react'
import { clearAuthToken } from '@/lib/auth-token'

const navigation = [
  {
    name: 'Mes Réservations',
    href: '/dashboard',
    icon: Calendar,
  },
  {
    name: 'Tokens',
    href: '/dashboard/tokens',
    icon: Key,
  },
]

interface DashboardNavProps {
  isMobileOpen?: boolean
  onMobileClose?: () => void
}

export function DashboardNav({ isMobileOpen, onMobileClose }: DashboardNavProps) {
  const pathname = usePathname()

  const handleLogout = async () => {
    // Clear all authentication data from localStorage
    clearAuthToken()

    // Also sign out from NextAuth session
    await signOut({ callbackUrl: '/login' })
  }

  const handleLinkClick = () => {
    // Close mobile menu when a link is clicked
    if (onMobileClose) {
      onMobileClose()
    }
  }

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onMobileClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 border-r bg-card transition-transform duration-300 lg:static lg:translate-x-0',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo and Close Button */}
          <div className="flex items-center justify-between border-b p-6">
            <Logo />
            <button
              onClick={onMobileClose}
              className="lg:hidden rounded-lg p-2 hover:bg-accent"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 space-y-1 p-4">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={handleLinkClick}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* Logout Button */}
          <div className="border-t p-4">
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <LogOut className="h-5 w-5" />
              Déconnexion
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
