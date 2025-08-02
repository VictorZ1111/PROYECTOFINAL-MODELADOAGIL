"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import { Play, Film, Users, Star, TrendingUp, Calendar, Eye } from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function EstadisticasPage() {
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [estadisticas, setEstadisticas] = useState<{
    totalPeliculas: number
    totalUsuarios: number
    peliculasTrending: number
    peliculasDestacadas: number
    calificacionPromedio: number
    peliculasRecientes: any[]
    usuariosRecientes: any[]
    generos: { nombre: string; cantidad: number }[]
  }>({
    totalPeliculas: 0,
    totalUsuarios: 0,
    peliculasTrending: 0,
    peliculasDestacadas: 0,
    calificacionPromedio: 0,
    peliculasRecientes: [],
    usuariosRecientes: [],
    generos: []
  })
  const router = useRouter()

  useEffect(() => {
    checkAdminAccess()
  }, [])

  const checkAdminAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login')
        return
      }

      // Verificar si es admin
      const { data: perfil } = await supabase
        .from('perfiles')
        .select('rol')
        .eq('id', user.id)
        .single()

      if (perfil?.rol !== 'admin') {
        router.push('/')
        return
      }

      setIsAdmin(true)
      await cargarEstadisticas()
    } catch (error) {
      console.error('Error verificando acceso admin:', error)
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }

  const cargarEstadisticas = async () => {
    try {
      // Cargar estadísticas de contenidos
      const { data: contenidos, error: errorContenidos } = await supabase
        .from('contenidos')
        .select('*')

      // Cargar estadísticas de usuarios
      const { data: usuarios, error: errorUsuarios } = await supabase
        .from('perfiles')
        .select('*')

      if (!errorContenidos && contenidos) {
        const totalPeliculas = contenidos.length
        const peliculasTrending = contenidos.filter(c => c.trending).length
        const peliculasDestacadas = contenidos.filter(c => c.destacado).length
        const calificacionPromedio = contenidos.length > 0 
          ? contenidos.reduce((sum, c) => sum + (c.calificacion || 0), 0) / contenidos.length
          : 0

        // Contar géneros
        const generosCount: Record<string, number> = contenidos.reduce((acc, pelicula) => {
          const genero = pelicula.genero || 'Sin género'
          acc[genero] = (acc[genero] || 0) + 1
          return acc
        }, {} as Record<string, number>)

        const generos = Object.entries(generosCount)
          .map(([nombre, cantidad]) => ({ nombre, cantidad }))
          .sort((a, b) => b.cantidad - a.cantidad)

        setEstadisticas(prev => ({
          ...prev,
          totalPeliculas,
          peliculasTrending,
          peliculasDestacadas,
          calificacionPromedio,
          generos,
          peliculasRecientes: contenidos
            .sort((a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime())
            .slice(0, 5)
        }))
      }

      if (!errorUsuarios && usuarios) {
        setEstadisticas(prev => ({
          ...prev,
          totalUsuarios: usuarios.length,
          usuariosRecientes: usuarios
            .sort((a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime())
            .slice(0, 5)
        }))
      }

    } catch (error) {
      console.error('Error cargando estadísticas:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Cargando estadísticas...</div>
      </div>
    )
  }

  if (!isAdmin) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Header */}
      <header className="bg-black/90 backdrop-blur-md border-b border-red-500/20 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Play className="h-8 w-8 text-red-500" />
              <h1 className="text-2xl font-bold text-white">WatchHub - Estadísticas</h1>
            </div>
            <Button
              variant="ghost"
              onClick={() => router.push('/admin')}
              className="text-white hover:text-red-400"
            >
              ← Volver al Panel
            </Button>
          </div>
        </div>
      </header>

      <section className="py-12 px-4">
        <div className="container mx-auto">
          {/* Título */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              📊 Estadísticas de WatchHub
            </h1>
            <p className="text-xl text-gray-400">
              Análisis completo de la plataforma
            </p>
          </div>

          {/* Tarjetas de métricas principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader className="pb-4">
                <CardTitle className="text-white flex items-center gap-2">
                  <Film className="h-5 w-5 text-red-500" />
                  Total Películas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">
                  {estadisticas.totalPeliculas}
                </div>
                <p className="text-sm text-gray-400">Contenido disponible</p>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader className="pb-4">
                <CardTitle className="text-white flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-500" />
                  Total Usuarios
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">
                  {estadisticas.totalUsuarios}
                </div>
                <p className="text-sm text-gray-400">Usuarios registrados</p>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader className="pb-4">
                <CardTitle className="text-white flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-orange-500" />
                  Tendencias
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">
                  {estadisticas.peliculasTrending}
                </div>
                <p className="text-sm text-gray-400">Películas populares</p>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader className="pb-4">
                <CardTitle className="text-white flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  Calificación Promedio
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">
                  {estadisticas.calificacionPromedio.toFixed(1)}
                </div>
                <p className="text-sm text-gray-400">De 10 puntos</p>
              </CardContent>
            </Card>
          </div>

          {/* Fila de gráficos y datos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Géneros más populares */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">🎭 Géneros Más Populares</CardTitle>
                <CardDescription className="text-gray-400">
                  Distribución de contenido por género
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {estadisticas.generos.length > 0 ? (
                    estadisticas.generos.slice(0, 5).map((genero, index) => (
                      <div key={genero.nombre} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center text-white font-bold text-sm">
                            {index + 1}
                          </div>
                          <span className="text-white font-medium">{genero.nombre}</span>
                        </div>
                        <Badge variant="secondary" className="bg-gray-700 text-white">
                          {genero.cantidad} películas
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400 text-center py-8">
                      No hay datos de géneros disponibles
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Contenido destacado */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">⭐ Métricas de Contenido</CardTitle>
                <CardDescription className="text-gray-400">
                  Estado del contenido especial
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex justify-between items-center p-4 bg-gray-700/50 rounded-lg">
                    <div>
                      <p className="text-white font-medium">Contenido Destacado</p>
                      <p className="text-gray-400 text-sm">Películas en portada</p>
                    </div>
                    <div className="text-2xl font-bold text-yellow-500">
                      {estadisticas.peliculasDestacadas}
                    </div>
                  </div>

                  <div className="flex justify-between items-center p-4 bg-gray-700/50 rounded-lg">
                    <div>
                      <p className="text-white font-medium">Tendencias</p>
                      <p className="text-gray-400 text-sm">Contenido en tendencia</p>
                    </div>
                    <div className="text-2xl font-bold text-orange-500">
                      {estadisticas.peliculasTrending}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Actividad reciente */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Películas recientes */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-green-500" />
                  Películas Agregadas Recientemente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {estadisticas.peliculasRecientes.length > 0 ? (
                    estadisticas.peliculasRecientes.map((pelicula) => (
                      <div key={pelicula.id} className="flex items-center space-x-3 p-3 bg-gray-700/30 rounded-lg">
                        <img
                          src={pelicula.imagen_url || "/placeholder.jpg"}
                          alt={pelicula.titulo}
                          className="w-12 h-16 object-cover rounded"
                        />
                        <div className="flex-1">
                          <p className="text-white font-medium">{pelicula.titulo}</p>
                          <p className="text-gray-400 text-sm">{pelicula.genero} • {pelicula.año}</p>
                          <p className="text-gray-500 text-xs">
                            {new Date(pelicula.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-yellow-500">
                          ⭐ {pelicula.calificacion}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400 text-center py-8">
                      No hay películas recientes
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Usuarios recientes */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Users className="h-5 w-5 text-purple-500" />
                  Usuarios Registrados Recientemente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {estadisticas.usuariosRecientes.length > 0 ? (
                    estadisticas.usuariosRecientes.map((usuario) => (
                      <div key={usuario.id} className="flex items-center space-x-3 p-3 bg-gray-700/30 rounded-lg">
                        <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center text-white font-bold">
                          {usuario.nombre?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="flex-1">
                          <p className="text-white font-medium">{usuario.nombre || 'Usuario'}</p>
                          <p className="text-gray-400 text-sm">@{usuario.nombre_usuario}</p>
                          <p className="text-gray-500 text-xs">
                            {new Date(usuario.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge 
                          variant={usuario.rol === 'admin' ? 'destructive' : 'secondary'}
                          className={usuario.rol === 'admin' ? 'bg-red-600' : 'bg-gray-600'}
                        >
                          {usuario.rol}
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400 text-center py-8">
                      No hay usuarios recientes
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}
