"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabaseClient"

interface UserPlan {
  id: number
  nombre: string
  precio: number
  max_peliculas: number
  descripcion: string
  reproducciones_usadas: number
}

export function useUserPlan() {
  const [userPlan, setUserPlan] = useState<UserPlan | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchUserPlan = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setUserPlan(null)
        return
      }

      // Obtener el perfil del usuario con su plan
      const { data: perfil, error: perfilError } = await supabase
        .from('perfiles')
        .select(`
          plan_id,
          reproducciones_usadas,
          planes!inner (
            id,
            nombre,
            precio,
            max_peliculas,
            descripcion
          )
        `)
        .eq('id', user.id)
        .single()

      if (perfilError) {
        console.error('Error fetching user plan:', perfilError)
        setError('Error al cargar el plan del usuario')
        return
      }

      if (perfil && perfil.planes) {
        // Supabase devuelve un array, tomamos el primer elemento
        const planData = Array.isArray(perfil.planes) ? perfil.planes[0] : perfil.planes
        
        setUserPlan({
          id: planData.id,
          nombre: planData.nombre,
          precio: planData.precio,
          max_peliculas: planData.max_peliculas,
          descripcion: planData.descripcion,
          reproducciones_usadas: perfil.reproducciones_usadas || 0
        })
      } else {
        setUserPlan(null)
      }
    } catch (err) {
      console.error('Error in fetchUserPlan:', err)
      setError('Error al cargar el plan del usuario')
    } finally {
      setLoading(false)
    }
  }

  const updateUserPlan = async (newPlanId: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('Usuario no autenticado')
      }

      // Actualizar el plan del usuario
      const { error: updateError } = await supabase
        .from('perfiles')
        .update({ 
          plan_id: newPlanId,
          reproducciones_usadas: 0 // Resetear reproducciones al cambiar plan
        })
        .eq('id', user.id)

      if (updateError) {
        throw updateError
      }

      // Recargar los datos del plan
      await fetchUserPlan()
      
      return { success: true }
    } catch (err) {
      console.error('Error updating user plan:', err)
      return { success: false, error: err instanceof Error ? err.message : 'Error desconocido' }
    }
  }

  const incrementReproductions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user || !userPlan) {
        return { success: false, error: 'Usuario no autenticado o sin plan' }
      }

      const newCount = (userPlan.reproducciones_usadas || 0) + 1

      // Verificar si no excede el límite
      if (newCount > userPlan.max_peliculas) {
        return { success: false, error: 'Has alcanzado el límite de reproducciones de tu plan' }
      }

      // Actualizar el contador
      const { error: updateError } = await supabase
        .from('perfiles')
        .update({ reproducciones_usadas: newCount })
        .eq('id', user.id)

      if (updateError) {
        throw updateError
      }

      // Actualizar el estado local
      setUserPlan(prev => prev ? {
        ...prev,
        reproducciones_usadas: newCount
      } : null)

      return { success: true, newCount }
    } catch (err) {
      console.error('Error incrementing reproductions:', err)
      return { success: false, error: err instanceof Error ? err.message : 'Error desconocido' }
    }
  }

  const getRemainingReproductions = () => {
    if (!userPlan) return 0
    return Math.max(0, userPlan.max_peliculas - (userPlan.reproducciones_usadas || 0))
  }

  const canWatchMore = () => {
    return getRemainingReproductions() > 0
  }

  useEffect(() => {
    fetchUserPlan()

    // Escuchar cambios en la autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        fetchUserPlan()
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  return {
    userPlan,
    loading,
    error,
    updateUserPlan,
    incrementReproductions,
    getRemainingReproductions,
    canWatchMore,
    refreshUserPlan: fetchUserPlan
  }
}
