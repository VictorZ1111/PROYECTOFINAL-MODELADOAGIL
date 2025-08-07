"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Play, Star, Heart, Info, Clock, Calendar, ImageIcon, Edit } from "lucide-react"
import { useFavorites } from "@/hooks/use-favorites"
import { supabase } from "@/lib/supabaseClient"
import type { Content } from "@/types"

interface ContentCardProps {
  content: Content
  size?: "small" | "medium" | "large"
}

export function ContentCard({ content, size = "medium" }: ContentCardProps) {
  const { isFavorite, toggleFavorite } = useFavorites()
  const router = useRouter()
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Verificar autenticación y estado admin
  useEffect(() => {
    const checkUserStatus = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        setIsAuthenticated(!!user)
        
        if (user) {
          const { data: perfil } = await supabase
            .from('perfiles')
            .select('rol')
            .eq('id', user.id)
            .single()
          setIsAdmin(perfil?.rol === 'admin')
        } else {
          setIsAdmin(false)
        }
      } catch (error) {
        setIsAuthenticated(false)
        setIsAdmin(false)
      }
    }
    checkUserStatus()
  }, [])

  const sizeClasses = {
    small: "h-48",
    medium: "h-64",
    large: "h-80",
  }

  return (
    <Card className="bg-gray-800/30 border-gray-700 hover:border-red-500/50 transition-all duration-300 hover:scale-105 group cursor-pointer overflow-hidden">
      <div className={`relative overflow-hidden ${sizeClasses[size]}`}>
        {/* Loading/Error State */}
        {(!imageLoaded || imageError) && (
          <div className="absolute inset-0 bg-gray-700 flex items-center justify-center">
            <ImageIcon className="h-12 w-12 text-gray-500" />
          </div>
        )}

        {/* Main Image */}
        <img
          src={content.image || "/placeholder.svg"}
          alt={content.title}
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

        {/* Hover Overlay con opciones dinámicas */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <div className="flex space-x-2">
            {/* Botón VER - Para todos, pero redirige a login si no está autenticado */}
            {isAuthenticated ? (
              <Link href={`/pelicula/${content.id}`}>
                <Button size="sm" className="bg-red-600 hover:bg-red-700 shadow-lg">
                  <Play className="h-4 w-4 mr-1" />
                  Ver
                </Button>
              </Link>
            ) : (
              <Button 
                size="sm" 
                className="bg-red-600 hover:bg-red-700 shadow-lg"
                onClick={() => router.push('/login')}
              >
                <Play className="h-4 w-4 mr-1" />
                Ver
              </Button>
            )}
            
            {/* Botón EDITAR - Solo para admin */}
            {isAdmin && (
              <Link href={`/admin/editar/${content.id}`}>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-black bg-transparent shadow-lg"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Editar
                </Button>
              </Link>
            )}
            
            {/* Botón INFO - Solo para usuarios normales */}
            {!isAdmin && (
              <Button
                size="sm"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-black bg-transparent shadow-lg"
                onClick={(e) => {
                  e.stopPropagation()
                  // Scroll hacia abajo para ver más detalles
                }}
              >
                <Info className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {content.trending && <Badge className="bg-orange-600 text-white text-xs shadow-lg">🔥 Trending</Badge>}
          {content.featured && <Badge className="bg-purple-600 text-white text-xs shadow-lg">⭐ Destacado</Badge>}
        </div>

        {/* Favorite Button - Solo para usuarios autenticados */}
        {isAuthenticated && (
          <Button
            size="sm"
            variant="ghost"
            className="absolute top-2 right-2 text-white hover:text-red-400 bg-black/50 hover:bg-black/70 backdrop-blur-sm"
            onClick={(e) => {
              e.stopPropagation()
              toggleFavorite(content.id)
            }}
          >
            <Heart className={`h-4 w-4 ${isFavorite(content.id) ? "fill-red-500 text-red-500" : ""}`} />
          </Button>
        )}

        {/* Rating Badge */}
        <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-sm rounded px-2 py-1 flex items-center">
          <Star className="h-3 w-3 text-yellow-500 mr-1" />
          <span className="text-white text-xs font-medium">{content.rating}</span>
        </div>
      </div>

      <CardContent className="p-4">
        <h3 className="font-bold text-white mb-2 line-clamp-2 text-sm leading-tight">{content.title}</h3>

        <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
          <div className="flex items-center">
            <Calendar className="h-3 w-3 mr-1" />
            {content.year}
          </div>
          {content.duration && (
            <div className="flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              {content.duration}
            </div>
          )}
          {content.seasons && <span className="text-xs">{content.seasons} temp.</span>}
        </div>

        <div className="flex items-center justify-between">
          <span className="bg-gray-700 px-2 py-1 rounded text-xs text-gray-300">{content.genre}</span>
          {size === "large" && (
            <div className="flex items-center space-x-1">
              {content.trending && <span className="text-orange-500 text-xs">🔥</span>}
              {content.featured && <span className="text-purple-500 text-xs">⭐</span>}
            </div>
          )}
        </div>

        {size === "large" && (
          <p className="text-xs text-gray-400 mt-3 line-clamp-3 leading-relaxed">{content.description}</p>
        )}
      </CardContent>
    </Card>
  )
}
