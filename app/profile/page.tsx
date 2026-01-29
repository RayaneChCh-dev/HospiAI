/**
 * Profile Completion Page
 * Redirects to the first step
 */

'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function ProfilePage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to first step
    router.push('/profile/name')
  }, [router])

  return null
}
