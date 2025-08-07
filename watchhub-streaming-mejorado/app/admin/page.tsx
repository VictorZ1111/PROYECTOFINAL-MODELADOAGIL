"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import { Footer } from "@/components/footer"
import { AdminHeader } from "@/components/admin-header"
import { useContenidos } from "@/hooks/use-contenidos"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, BarChart3, Film, Play, ImageIcon, Calendar, Clock, Trash2, Edit, AlertTriangle, X } from "lucide-react"

// Función para convertir duración de minutos a formato "Xh Ymin"
const formatDuration = (duracion: string | number | undefined) => {
  if (!duracion) return ""
  const totalMinutos = parseInt(duracion.toString()) || 0
  if (totalMinutos === 0) return ""
  
  const horas = Math.floor(totalMinutos / 60)
  const minutos = totalMinutos % 60
  
  if (horas === 0) return `${minutos}min`
  if (minutos === 0) return `${horas}h`
  return `${horas}h ${minutos}min`
}

function AdminPageContent() {
  const [user, setUser] = useState<any>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [usuarios, setUsuarios] = useState<any[]>([])
  const [usuariosLoading, setUsuariosLoading] = useState(true)
  const { contenidos, loading: contentLoading, error } = useContenidos()
  const router = useRouter()

  useEffect(() => {
    const checkAdminAccess = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          router.push('/login')
          return
        }

        setUser(user)

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
      } catch (error) {
        console.error('Error verificando acceso admin:', error)
        router.push('/login')
      } finally {
        setLoading(false)
      }
    }

    checkAdminAccess()
  }, [router])

  // Cargar usuarios para las estadísticas
  useEffect(() => {
    const cargarUsuarios = async () => {
      if (!isAdmin) return
      
      try {
        const { count, error } = await supabase
          .from('perfiles')
          .select('*', { count: 'exact', head: true })

        if (error) {
          console.error('Error al cargar usuarios:', error.message)
          setUsuarios([]) // Fallback a array vacío
        } else {
          // Crear array con el número de usuarios para mostrar el count
          setUsuarios(new Array(count || 0))
        }
      } catch (error) {
        console.error('Error al cargar usuarios:', error)
        setUsuarios([]) // Fallback a array vacío
      } finally {
        setUsuariosLoading(false)
      }
    }

    cargarUsuarios()
  }, [isAdmin])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Verificando acceso...</div>
      </div>
    )
  }

  if (!isAdmin) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Header para admin - SIN Inicio porque YA ES el inicio */}
      <AdminHeader showInicio={false} />

      <section className="py-12 px-4">
        <div className="container mx-auto">
          {/* Header del Dashboard */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              🎬 Panel de Administración
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Gestiona el contenido de WatchHub
            </p>
          </div>

          {/* Estadísticas rápidas - Solo usuarios y contenidos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader className="pb-4">
                <CardTitle className="text-white flex items-center gap-2">
                  <Film className="h-5 w-5 text-red-500" />
                  Total Películas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">
                  {contentLoading ? "..." : contenidos.length}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader className="pb-4">
                <CardTitle className="text-white flex items-center gap-2">
                  👥 Total Usuarios
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">
                  {usuariosLoading ? "..." : usuarios.length}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Botón de agregar contenido */}
          <div className="flex justify-center mb-12">
            <Button
              onClick={() => router.push('/agregar-contenido')}
              className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 text-lg"
            >
              <Plus className="h-5 w-5 mr-2" />
              Agregar Nuevo Contenido
            </Button>
          </div>

          {/* Lista de contenido */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-2">
              📚 ¡PELICULAS!
              <Badge variant="secondary" className="bg-gray-700 text-white">
                {contenidos.length} películas
              </Badge>
            </h2>

            {contentLoading ? (
              <div className="text-center text-white py-12">
                Cargando contenido...
              </div>
            ) : error ? (
              <div className="text-center text-red-400 py-12">
                {error}
              </div>
            ) : contenidos.length === 0 ? (
              <div className="text-center text-gray-400 py-12">
                No hay contenido disponible. ¡Agrega la primera película!
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {contenidos.map((content) => (
                  <AdminContentCard key={content.id} content={content} />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

// Componente de tarjeta de contenido para admin (igual que usuarios normales)
function AdminContentCard({ content }: { content: any }) {
  const router = useRouter()
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null)

  const handleEdit = () => {
    router.push(`/admin/editar/${content.id}`)
  }

  const handleDelete = async () => {
    setDeleteLoading(true)
    
    try {
      const { error } = await supabase
        .from('contenidos')
        .delete()
        .eq('id', content.id)

      if (error) {
        setMessage({type: 'error', text: 'Error al eliminar contenido'})
        setShowDeleteModal(false)
        setDeleteLoading(false)
      } else {
        setMessage({type: 'success', text: 'Contenido eliminado exitosamente'})
        setShowDeleteModal(false)
        setDeleteLoading(false)
        
        // Recargar después de 2 segundos
        setTimeout(() => {
          window.location.reload()
        }, 2000)
      }
    } catch (err) {
      setMessage({type: 'error', text: 'Error de conexión'})
      setShowDeleteModal(false)
      setDeleteLoading(false)
    }
  }

  const handleView = () => {
    // Navegar a la página de admin para ver contenido
    router.push(`/admin/ver/${content.id}`)
  }

  return (
    <Card className="bg-gray-800/30 border-gray-700 hover:border-red-500/50 transition-all duration-300 hover:scale-105 group cursor-pointer overflow-hidden w-full min-w-[280px]">
      <div className="relative overflow-hidden h-72">
        {/* Loading/Error State */}
        {(!imageLoaded || imageError) && (
          <div className="absolute inset-0 bg-gray-700 flex items-center justify-center">
            <ImageIcon className="h-12 w-12 text-gray-500" />
          </div>
        )}

        {/* Main Image */}
        <img
          src={content.image || content.imagen_url || "/placeholder.jpg"}
          alt={content.title || content.titulo}
          className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-300 ${
            imageLoaded && !imageError ? "opacity-100" : "opacity-0"
          }`}
          onLoad={() => setImageLoaded(true)}
          onError={() => {
            setImageError(true)
            setImageLoaded(true)
          }}
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60"></div>

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <div className="flex space-x-2">
            {/* Botón VER */}
            <Button 
              size="sm" 
              className="bg-red-600 hover:bg-red-700 shadow-lg"
              onClick={handleView}
            >
              <Play className="h-4 w-4 mr-1" />
              Ver
            </Button>
            
            {/* Botón EDITAR */}
            <Button
              size="sm"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-black bg-transparent shadow-lg"
              onClick={handleEdit}
            >
              <Edit className="h-4 w-4 mr-1" />
              Editar
            </Button>
          </div>
        </div>

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {content.trending && <Badge className="bg-orange-600 text-white text-xs shadow-lg">🔥 Trending</Badge>}
          {(content.featured || content.destacado) && <Badge className="bg-purple-600 text-white text-xs shadow-lg">⭐ Destacado</Badge>}
        </div>

        {/* Delete Button */}
        <Button
          size="sm"
          variant="ghost"
          className="absolute top-2 right-2 text-white hover:text-red-400 bg-black/50 hover:bg-black/70 backdrop-blur-sm"
          onClick={(e) => {
            e.stopPropagation()
            setShowDeleteModal(true)
          }}
        >
          <Trash2 className="h-4 w-4" />
        </Button>

        {/* Rating Badge */}
        <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-sm rounded px-2 py-1 flex items-center">
          <span className="text-yellow-500 mr-1">⭐</span>
          <span className="text-white text-xs font-medium">{content.rating || content.calificacion || "N/A"}/10</span>
        </div>
      </div>

      <CardContent className="p-4">
        <h3 className="font-bold text-white mb-2 line-clamp-2 text-sm leading-tight">{content.title || content.titulo}</h3>

        <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
          <div className="flex items-center">
            <Calendar className="h-3 w-3 mr-1" />
            {content.year || content.año}
          </div>
          {(content.duration || content.duracion) && (
            <div className="flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              {formatDuration(content.duration || content.duracion)}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <span className="bg-gray-700 px-2 py-1 rounded text-xs text-gray-300">{content.genre || content.genero}</span>
        </div>
      </CardContent>

      {/* Modal de confirmación de eliminación */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 border border-gray-700">
            <div className="flex items-center mb-4">
              <AlertTriangle className="h-6 w-6 text-red-500 mr-3" />
              <h3 className="text-xl font-bold text-white">Confirmar eliminación</h3>
            </div>
            <p className="text-gray-300 mb-6">
              ¿Estás seguro de que quieres eliminar <span className="font-semibold text-white">"{content.titulo || content.title}"</span>? 
              Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                onClick={() => setShowDeleteModal(false)}
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
                disabled={deleteLoading}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700 text-white"
                disabled={deleteLoading}
              >
                {deleteLoading ? 'Eliminando...' : 'Eliminar'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Mensaje de notificación */}
      {message && (
        <div className="fixed top-4 right-4 z-50">
          <div className={`
            p-4 rounded-lg shadow-lg flex items-center gap-3 min-w-80
            ${message.type === 'success' ? 'bg-green-600' : 'bg-red-600'}
          `}>
            <span className="text-white font-medium">{message.text}</span>
            <Button
              onClick={() => setMessage(null)}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20 p-1"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </Card>
  )
}

export default function AdminPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Cargando panel de administración...</div>
      </div>
    }>
      <AdminPageContent />
    </Suspense>
  )
}
