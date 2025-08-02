"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabaseClient"

export interface Contenido {
  id: string
  titulo: string
  descripcion: string
  genero: string
  año: number
  duracion: string
  imagen_url: string
  video_url?: string
  calificacion: number
  trending: boolean
  destacado: boolean
  created_at?: string
}

// Convertir formato de BD a formato de la aplicación
function convertToContentFormat(contenido: any) {
  return {
    id: contenido.id.toString(),
    title: contenido.titulo,
    titulo: contenido.titulo, // Mantener campo original
    description: contenido.descripcion,
    descripcion: contenido.descripcion, // Mantener campo original
    type: 'Película', // Solo manejamos películas
    rating: contenido.calificacion || 0,
    calificacion: contenido.calificacion || 0, // Mantener campo original
    year: contenido.año?.toString() || '2024',
    año: contenido.año || 2024, // Mantener campo original
    genre: contenido.genero || 'Sin género',
    genero: contenido.genero || 'Sin género', // Mantener campo original
    image: contenido.imagen_url || '/placeholder.jpg',
    imagen_url: contenido.imagen_url || '/placeholder.jpg', // Mantener campo original
    videoUrl: contenido.video_url || '',
    video_url: contenido.video_url || '', // Mantener campo original
    duration: contenido.duracion,
    duracion: contenido.duracion, // Mantener campo original
    featured: contenido.destacado || false, // Para compatibilidad
    destacado: contenido.destacado || false, // Campo original de Supabase
    trending: contenido.trending || false // Campo original de Supabase
  }
}

export function useContenidos() {
  const [contenidos, setContenidos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadContenidos = async () => {
    try {
      setLoading(true)
      
      // Intentar cargar desde Supabase primero (sin verificar usuario)
      console.log('useContenidos - Intentando cargar desde Supabase...')
      const { data, error } = await supabase
        .from('contenidos')
        .select('*')
        .order('created_at', { ascending: false })

      console.log('useContenidos - Data:', data)
      console.log('useContenidos - Error:', error)

      if (error) {
        console.error('Error cargando contenidos (probablemente RLS):', error)
        setError(`Error: ${error.message}. Necesitas configurar RLS en Supabase para acceso público.`)
        
        // Solo usar datos de respaldo si hay error de permisos
        const { featuredContent } = await import('@/lib/data')
        console.log('useContenidos - Usando datos de respaldo por error de permisos')
        setContenidos(featuredContent)
      } else if (!data || data.length === 0) {
        console.log('useContenidos - No hay datos en Supabase')
        setError('No hay contenido en la base de datos')
        setContenidos([])
      } else {
        // Convertir datos de BD al formato esperado
        const formattedContent = data.map(convertToContentFormat)
        console.log('useContenidos - Contenido de Supabase cargado:', formattedContent)
        setContenidos(formattedContent)
        setError(null)
      }
    } catch (err) {
      console.error('Error:', err)
      setError('Error de conexión')
      // Usar datos de respaldo
      const { featuredContent } = await import('@/lib/data')
      setContenidos(featuredContent)
    } finally {
      setLoading(false)
    }
  }

  const agregarContenido = async (nuevoContenido: Omit<Contenido, 'id' | 'created_at'>) => {
    try {
      const { data, error } = await supabase
        .from('contenidos')
        .insert([nuevoContenido])
        .select()
        .single()

      if (error) {
        throw error
      }

      // Actualizar lista local
      const formatted = convertToContentFormat(data)
      setContenidos(prev => [formatted, ...prev])
      
      return { success: true, data: formatted }
    } catch (err: any) {
      console.error('Error agregando contenido:', err)
      return { success: false, error: err.message }
    }
  }

  useEffect(() => {
    loadContenidos()
  }, [])

  return {
    contenidos,
    loading,
    error,
    refetch: loadContenidos,
    agregarContenido
  }
}
