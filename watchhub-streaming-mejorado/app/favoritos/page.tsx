"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ContentCard } from "@/components/content-card"
import { Button } from "@/components/ui/button"
import { useFavorites } from "@/hooks/use-favorites"
import { useAuthProtection } from "@/hooks/use-auth-protection"
import { supabase } from "@/lib/supabaseClient"
import { Heart, ArrowRight, Loader2 } from "lucide-react"

export default function FavoritosPage() {
  const { user, loading: authLoading } = useAuthProtection()
  const { favorites } = useFavorites()
  const [favoriteContent, setFavoriteContent] = useState<any[]>([])
  const [contentLoading, setContentLoading] = useState(true)

  useEffect(() => {
    if (favorites.length > 0) {
      loadFavoriteContent()
    } else {
      setFavoriteContent([])
      setContentLoading(false)
    }
  }, [favorites])

  const loadFavoriteContent = async () => {
    try {
      const { data, error } = await supabase
        .from('contenidos')
        .select('*')
        .in('id', favorites.map(id => parseInt(id)))

      if (error) {
        console.error('Error loading favorite content:', error)
        return
      }

      // Mapear los datos para compatibilidad con ContentCard
      const mappedContent = data?.map(item => ({
        id: item.id.toString(),
        title: item.titulo,
        description: item.descripcion,
        genre: item.genero,
        year: item.año,
        duration: item.duracion,
        rating: item.calificacion,
        image: item.imagen_url,
        trending: item.trending,
        featured: item.destacado
      })) || []

      setFavoriteContent(mappedContent)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setContentLoading(false)
    }
  }

  // Mostrar loading mientras verifica autenticación
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 text-red-500 animate-spin mx-auto mb-4" />
          <p className="text-white">Verificando autenticación...</p>
        </div>
      </div>
    )
  }

  // Si no hay usuario, la protección ya lo redirigirá
  if (!user) {
    return null
  }

  // Mostrar loading mientras carga contenido de favoritos
  if (contentLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
        <Header />
        <section className="py-20 px-4">
          <div className="container mx-auto text-center">
            <Loader2 className="h-8 w-8 text-red-500 animate-spin mx-auto mb-4" />
            <p className="text-white">Cargando favoritos...</p>
          </div>
        </section>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <Header />

      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="flex items-center mb-8">
            <Heart className="h-8 w-8 text-red-500 mr-3" />
            <h1 className="text-4xl font-bold text-white">Mis Favoritos</h1>
          </div>

          {favoriteContent.length > 0 ? (
            <>
              <p className="text-gray-400 mb-8">
                Tienes {favoriteContent.length} contenido{favoriteContent.length !== 1 ? "s" : ""} guardado
                {favoriteContent.length !== 1 ? "s" : ""} en favoritos
              </p>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
                {favoriteContent.map((content) => (
                  <ContentCard key={content.id} content={content} />
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-16">
              <Heart className="h-24 w-24 text-gray-600 mx-auto mb-6" />
              <h2 className="text-3xl font-bold text-white mb-4">No tienes favoritos aún</h2>
              <p className="text-gray-400 mb-8 max-w-md mx-auto">
                Explora nuestro catálogo y guarda el contenido que más te guste haciendo clic en el corazón
              </p>
              <Link href="/catalogo">
                <Button className="bg-red-600 hover:bg-red-700 text-white">
                  Explorar Catálogo
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  )
}
