"use client"

import { useEffect, useState, useRef } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { 
  ArrowLeft, 
  Heart, 
  Star, 
  Play, 
  Clock, 
  Calendar, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize 
} from "lucide-react"
import { supabase } from "@/lib/supabaseClient"
import { useFavorites } from "@/hooks/use-favorites"
import { Header } from "@/components/header"
import type { Content } from "@/types"

export default function PeliculaPage() {
  const params = useParams()
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites()
  const [content, setContent] = useState<Content | null>(null)
  const [loading, setLoading] = useState(true)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [showControls, setShowControls] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (params.id) {
      fetchContent(params.id as string)
    }
  }, [params.id])

  const fetchContent = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('contenidos')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        console.error('Error fetching content:', error)
        return
      }

      // Mapear los datos de español a inglés para compatibilidad
      const mappedContent: Content = {
        id: data.id.toString(),
        title: data.titulo,
        description: data.descripcion,
        genre: data.genero,
        year: data.año.toString(),
        duration: data.duracion,
        rating: data.calificacion,
        image: data.imagen_url,
        image_url: data.imagen_url,
        video_url: data.video_url,
        type: 'Película' as const,
        trending: data.trending,
        featured: data.destacado,
        destacado: data.destacado
      }

      setContent(mappedContent)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFavoriteToggle = () => {
    if (!content) return
    
    if (isFavorite(content.id)) {
      removeFromFavorites(content.id)
    } else {
      addToFavorites(content.id)
    }
  }

  // Controles de video completos
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

  const handleVideoClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    togglePlay()
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
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-xl">Cargando película...</p>
        </div>
      </div>
    )
  }

  if (!content) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-red-600 mb-4">Película no encontrada</h1>
          <p className="text-xl text-gray-400 mb-8">Lo sentimos, no pudimos encontrar esta película.</p>
          <Link href="/catalogo">
            <Button className="bg-red-600 hover:bg-red-700">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al catálogo
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Header de usuario normal */}
      <Header />

      <section className="py-8 px-4">
        <div className="container mx-auto max-w-7xl">
          {/* Video Principal con controles completos - más pequeño */}
          <div 
            className="relative mb-8 rounded-lg overflow-hidden shadow-2xl max-w-4xl mx-auto"
            onMouseEnter={() => setShowControls(true)}
            onMouseLeave={() => setShowControls(false)}
          >
            <video
              ref={videoRef}
              className="w-full aspect-video bg-black cursor-pointer"
              src={content.video_url}
              poster={content.image_url}
              onClick={handleVideoClick}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              controlsList="nodownload nofullscreen noremoteplayback"
              disablePictureInPicture
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

          {/* Información de la película - Nuevo diseño */}
          <div className="max-w-4xl mx-auto">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">{content.title}</h1>
                <div className="flex items-center space-x-4 mb-4">
                  <Badge className="bg-red-600 text-white">{content.genre}</Badge>
                  <span className="text-gray-400">📅 {content.year}</span>
                  <span className="text-gray-400">⏱️ {content.duration}</span>
                  <div className="flex items-center">
                    <span className="text-yellow-500 mr-1">⭐</span>
                    <span className="text-white">{content.rating}/10</span>
                  </div>
                </div>
              </div>

              {/* Botón Agregar a Favoritos para Usuario */}
              <Button
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors duration-200"
                onClick={handleFavoriteToggle}
              >
                <Heart className={`h-4 w-4 mr-2 transition-colors duration-200 ${
                  isFavorite(content.id) 
                    ? "fill-current text-red-500" 
                    : "text-gray-400"
                }`} />
                {isFavorite(content.id) ? "Quitar de favoritos" : "Agregar a favoritos"}
              </Button>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-bold text-white mb-3">Sinopsis</h3>
              <p className="text-gray-300 text-lg leading-relaxed">
                {content.description || "Sin sinopsis disponible."}
              </p>
            </div>

            {content.destacado && (
              <Badge className="bg-purple-600 text-white">
                ⭐ Contenido Destacado
              </Badge>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
