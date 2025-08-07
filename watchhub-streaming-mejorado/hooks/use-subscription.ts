import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'

export interface Subscription {
  id: string
  plan_id: number
  estado: 'activa' | 'cancelada' | 'vencida'
  fecha_inicio: string
  fecha_fin: string
  auto_renovacion: boolean
  plan: {
    nombre: string
    precio: number
    max_peliculas: number
  }
}

export const useSubscription = () => {
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadSubscription = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          setLoading(false)
          return
        }

        const { data, error } = await supabase
          .from('suscripciones')
          .select(`
            *,
            planes (
              nombre,
              precio,
              max_peliculas
            )
          `)
          .eq('usuario_id', user.id)
          .eq('estado', 'activa')
          .single()

        if (error && error.code !== 'PGRST116') {
          throw error
        }

        setSubscription(data)
      } catch (err) {
        console.error('Error loading subscription:', err)
        setError(err instanceof Error ? err.message : 'Error desconocido')
      } finally {
        setLoading(false)
      }
    }

    loadSubscription()
  }, [])

  const hasActiveSubscription = () => {
    return subscription && subscription.estado === 'activa'
  }

  const canWatchContent = () => {
    return hasActiveSubscription()
  }

  return {
    subscription,
    loading,
    error,
    hasActiveSubscription,
    canWatchContent,
    refresh: () => window.location.reload()
  }
}
