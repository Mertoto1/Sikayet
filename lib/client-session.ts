'use client'

import { useEffect, useState } from 'react'

// Hook for client-side session management
export function useSession() {
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadSession() {
      try {
        // Use /api/me endpoint to check session
        // This works for all user types including COMPANY and COMPANY_PENDING
        const response = await fetch('/api/me', {
          credentials: 'include' // Include cookies
        })
        
        if (response.ok) {
          const data = await response.json()
          if (data.user) {
            // Create session object from user data
            setSession({
              userId: data.user.id,
              role: data.user.role,
              email: data.user.email,
              name: data.user.name
            })
          }
        } else {
          // Session invalid or expired
          setSession(null)
        }
      } catch (error) {
        console.error('Session loading error:', error)
        setSession(null)
      } finally {
        setLoading(false)
      }
    }

    loadSession()
  }, [])

  return { session, loading }
}