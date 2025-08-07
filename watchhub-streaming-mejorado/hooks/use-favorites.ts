"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabaseClient"
import { useAuthToast } from "./use-auth-toast"

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([])
  const [user, setUser] = useState<any>(null)
  const { showAuthRequiredToast } = useAuthToast()

  useEffect(() => {
    // Verificar autenticación
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        setUser(session.user)
        loadFavorites(session.user.id)
      }
    }

    checkAuth()

    // Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user)
          loadFavorites(session.user.id)
        } else {
          setUser(null)
          setFavorites([])
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const loadFavorites = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('favoritos')
        .select('contenido_id')
        .eq('usuario_id', userId)

      if (error) {
        console.error('Error cargando favoritos:', error)
        // Si la tabla no existe, retornar array vacío
        if (error.code === '42P01') {
          console.log('Tabla favoritos no existe aún')
          return
        }
        return
      }

      const favoriteIds = data?.map(fav => fav.contenido_id.toString()) || []
      setFavorites(favoriteIds)
    } catch (err) {
      console.error('Error:', err)
    }
  }

  const toggleFavorite = async (contentId: string) => {
    // Verificar si está autenticado
    if (!user) {
      showAuthRequiredToast("agregar contenido a favoritos")
      return
    }

    try {
      const isFav = favorites.includes(contentId)

      if (isFav) {
        // Eliminar de favoritos
        const { error } = await supabase
          .from('favoritos')
          .delete()
          .eq('usuario_id', user.id)
          .eq('contenido_id', parseInt(contentId))

        if (error) {
          console.error('Error eliminando favorito:', error)
          if (error.code === '42P01') {
            console.log('Tabla favoritos no existe - ejecuta el script SQL primero')
          }
          return
        }

        setFavorites(prev => prev.filter(id => id !== contentId))
      } else {
        // Agregar a favoritos
        const { error } = await supabase
          .from('favoritos')
          .insert([{
            usuario_id: user.id,
            contenido_id: parseInt(contentId)
          }])

        if (error) {
          console.error('Error completo agregando favorito:', error)
          console.error('Código de error:', error.code)
          console.error('Mensaje:', error.message)
          console.error('Detalles:', error.details)
          
          if (error.code === '42P01') {
            console.log('Tabla favoritos no existe - ejecuta el script SQL primero')
          } else if (error.code === '23503') {
            console.log('Error: El contenido_id no existe en la tabla contenidos')
          }
          return
        }

        setFavorites(prev => [...prev, contentId])
      }
    } catch (err) {
      console.error('Error:', err)
    }
  }

  const isFavorite = (contentId: string) => favorites.includes(contentId)

  // Funciones de compatibilidad
  const addToFavorites = async (contentId: string) => {
    if (!isFavorite(contentId)) {
      await toggleFavorite(contentId)
    }
  }

  const removeFromFavorites = async (contentId: string) => {
    if (isFavorite(contentId)) {
      await toggleFavorite(contentId)
    }
  }

  return { 
    favorites, 
    toggleFavorite, 
    isFavorite, 
    addToFavorites, 
    removeFromFavorites, 
    user 
  }
}
