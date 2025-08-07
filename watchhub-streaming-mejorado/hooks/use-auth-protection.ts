"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import { User } from "@supabase/supabase-js"

export function useAuthProtection() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Verificar sesión actual
    const checkAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error("Error verificando sesión:", error)
          router.push(`/login?redirect=${encodeURIComponent(pathname)}`)
          return
        }

        if (!session?.user) {
          router.push(`/login?redirect=${encodeURIComponent(pathname)}`)
          return
        }

        setUser(session.user)
      } catch (err) {
        console.error("Error de autenticación:", err)
        router.push(`/login?redirect=${encodeURIComponent(pathname)}`)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()

    // Escuchar cambios en la autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT' || !session?.user) {
          router.push(`/login?redirect=${encodeURIComponent(pathname)}`)
        } else if (session?.user) {
          setUser(session.user)
        }
        setLoading(false)
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [router, pathname])

  return { user, loading }
}

export function useAuthRedirect() {
  const router = useRouter()
  const pathname = usePathname()
  
  const redirectToLogin = () => {
    router.push(`/login?redirect=${encodeURIComponent(pathname)}`)
  }
  
  return { redirectToLogin }
}
