import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabaseClient"

export interface Plan {
  id: number
  nombre: string
  precio: number
  max_peliculas: number
  descripcion: string
  created_at?: string
}

export function usePlanes() {
  const [planes, setPlanes] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const cargarPlanes = async () => {
      try {
        setLoading(true)
        
        const { data, error: supabaseError } = await supabase
          .from('planes')
          .select('*')
          .order('precio', { ascending: true })

        if (supabaseError) {
          console.error('Error cargando planes:', supabaseError)
          setError(supabaseError.message)
          return
        }

        console.log('Planes cargados:', data)
        setPlanes(data || [])

      } catch (err) {
        console.error('Error general:', err)
        setError(err instanceof Error ? err.message : 'Error desconocido')
      } finally {
        setLoading(false)
      }
    }

    cargarPlanes()
  }, [])

  return { planes, loading, error, refetch: () => window.location.reload() }
}
