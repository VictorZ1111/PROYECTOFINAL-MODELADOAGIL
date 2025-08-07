"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Edit,
  Trash2,
  Home,
  BarChart3,
  Film,
  User
} from "lucide-react"

export default function AdminVerPelicula() {
  const params = useParams()
  const router = useRouter()
  const videoRef = useRef<HTMLVideoElement>(null)
  
  const [content, setContent] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [showControls, setShowControls] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)

  // Verificar acceso admin
  useEffect(() => {
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
      } catch (error) {
        console.error('Error verificando acceso admin:', error)
        router.push('/login')
      }
    }

    checkAdminAccess()
  }, [router])

  // Cargar contenido
  useEffect(() => {
    const loadContent = async () => {
      if (!params.id || !isAdmin) return

      try {
        const { data, error } = await supabase
          .from('contenidos')
          .select('*')
          .eq('id', params.id)
          .single()

        if (error) {
          setError(error.message)
          return
        }

        if (!data) {
          setError('Contenido no encontrado')
          return
        }

        setContent(data)
      } catch (err) {
        setError('Error al cargar el contenido')
        console.error('Error:', err)
      } finally {
        setLoading(false)
      }
    }

    loadContent()
  }, [params.id, isAdmin])

  // Controles de video
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime)
    }
  }

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration)
    }
  }

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = (parseFloat(e.target.value) / 100) * duration
    if (videoRef.current) {
      videoRef.current.currentTime = newTime
      setCurrentTime(newTime)
    }
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value) / 100
    setVolume(newVolume)
    setIsMuted(newVolume === 0)
    if (videoRef.current) {
      videoRef.current.volume = newVolume
    }
  }

  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de que quieres eliminar este contenido?')) {
      return
    }

    try {
      const { error } = await supabase
        .from('contenidos')
        .delete()
        .eq('id', params.id)

      if (error) {
        console.error('Error al eliminar:', error)
        alert('Error al eliminar el contenido')
        return
      }

      alert('Contenido eliminado exitosamente')
      router.push('/admin')
    } catch (err) {
      console.error('Error:', err)
      alert('Error al eliminar el contenido')
    }
  }

  const toggleMute = () => {
    if (videoRef.current) {
      const newMuted = !isMuted
      setIsMuted(newMuted)
      videoRef.current.muted = newMuted
    }
  }

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen()
      } else {
        videoRef.current.requestFullscreen().catch(err => {
          console.log('Error attempting to enable full-screen mode:', err)
        })
      }
    }
  }

  const formatTime = (time: number) => {
    const hours = Math.floor(time / 3600)
    const minutes = Math.floor((time % 3600) / 60)
    const seconds = Math.floor(time % 60)
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Cargando...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-red-400 text-xl">Error: {error}</div>
      </div>
    )
  }

  if (!content) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Contenido no encontrado</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Header para Admin */}
      <header className="bg-black/80 backdrop-blur-md border-b border-gray-800 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <h1 className="text-2xl font-bold text-red-500">🎬 WatchHub Admin</h1>
              <nav className="hidden md:flex space-x-6">
                <Button 
                  variant="ghost" 
                  className="text-white hover:text-red-400"
                  onClick={() => router.push('/admin')}
                >
                  <Home className="h-4 w-4 mr-2" />
                  Inicio
                </Button>
                <Button 
                  variant="ghost" 
                  className="text-white hover:text-red-400"
                  onClick={() => router.push('/catalogo')}
                >
                  <Film className="h-4 w-4 mr-2" />
                  Catálogo
                </Button>
                <Button 
                  variant="ghost" 
                  className="text-white hover:text-red-400"
                  onClick={() => router.push('/admin/estadisticas')}
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Estadísticas
                </Button>
              </nav>
            </div>
            <Button 
              variant="ghost" 
              className="text-white hover:text-red-400"
              onClick={() => router.push('/perfil')}
            >
              <User className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Video Player - más pequeño */}
        <div 
          className="relative mb-8 rounded-lg overflow-hidden shadow-2xl max-w-4xl mx-auto"
          onMouseEnter={() => setShowControls(true)}
          onMouseLeave={() => setShowControls(false)}
        >
          <video
            ref={videoRef}
            className="w-full aspect-video bg-black cursor-pointer"
            src={content.video_url}
            poster={content.imagen_url}
            onClick={togglePlay}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />

          {/* Play/Pause Overlay con animación */}
          {!isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
              <div className="bg-black/70 rounded-full p-4 transition-transform duration-200 hover:scale-110">
                <Button
                  onClick={togglePlay}
                  className="bg-red-600 hover:bg-red-700 rounded-full w-16 h-16 p-0"
                >
                  <Play className="h-8 w-8 ml-1" />
                </Button>
              </div>
            </div>
          )}

          {/* Animación de click para play/pause */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {isPlaying && (
              <div className="bg-black/50 rounded-full p-3 transition-all duration-300 opacity-0 hover:opacity-100">
                <Pause className="h-6 w-6 text-white" />
              </div>
            )}
          </div>

          {/* Video Controls */}
          {showControls && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
              {/* Progress Bar */}
              <div className="mb-4">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={duration ? (currentTime / duration) * 100 : 0}
                  onChange={handleProgressChange}
                  className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>

              {/* Controls */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Button
                    onClick={togglePlay}
                    variant="ghost"
                    size="sm"
                    className="text-white hover:text-red-400"
                  >
                    {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                  </Button>

                  <div className="flex items-center space-x-2">
                    <Button
                      onClick={toggleMute}
                      variant="ghost"
                      size="sm"
                      className="text-white hover:text-red-400"
                    >
                      {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                    </Button>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={isMuted ? 0 : volume * 100}
                      onChange={handleVolumeChange}
                      className="w-20 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  <span className="text-white text-sm">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>

                <Button
                  onClick={toggleFullscreen}
                  variant="ghost"
                  size="sm"
                  className="text-white hover:text-red-400"
                >
                  <Maximize className="h-5 w-5" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Movie Info - Nuevo diseño */}
        <div className="max-w-4xl mx-auto">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">{content.titulo}</h1>
              <div className="flex items-center space-x-4 mb-4">
                <Badge className="bg-red-600 text-white">{content.genero}</Badge>
                <span className="text-gray-400">📅 {content.año}</span>
                <span className="text-gray-400">⏱️ {content.duracion}</span>
                <div className="flex items-center">
                  <span className="text-yellow-500 mr-1">⭐</span>
                  <span className="text-white">{content.calificacion}/10</span>
                </div>
              </div>
            </div>

            {/* Botones de Administración */}
            <div className="flex gap-2">
              <Button
                onClick={() => router.push(`/editar-contenido/${content.id}`)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
              
              <Button
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar
              </Button>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-bold text-white mb-3">Descripción</h3>
            <p className="text-gray-300 text-lg leading-relaxed">
              {content.descripcion}
            </p>
          </div>

          {content.destacado && (
            <Badge className="bg-purple-600 text-white">
              ⭐ Contenido Destacado
            </Badge>
          )}
        </div>
      </div>
    </div>
  )
}
