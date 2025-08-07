"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { FeaturesSection } from "@/components/features-section"
import { Footer } from "@/components/footer"
import { ContentCard } from "@/components/content-card"
import { PlanCard } from "@/components/plan-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useContenidos } from "@/hooks/use-contenidos"
import { usePlanes } from "@/hooks/use-planes"
import { TrendingUp, Star, Search } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  const { contenidos, loading: contentLoading, error } = useContenidos()
  const { planes, loading: planesLoading } = usePlanes()
  const [searchTerm, setSearchTerm] = useState("")
  
  // Debug: verificar qué contenidos se están cargando
  console.log('HomePage - contenidos:', contenidos)
  console.log('HomePage - contentLoading:', contentLoading)
  console.log('HomePage - error:', error)
  console.log('HomePage - contenidos.length:', contenidos.length)
  
  // Filtrar contenido basado en la búsqueda
  const filteredContent = contenidos.filter(content =>
    content.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    content.title?.toLowerCase().includes(searchTerm.toLowerCase())
  )
  
  // Separar contenido por tipo
  const trendingContent = contenidos.filter(content => content.trending === true)
  const destacadoContent = contenidos.filter(content => content.destacado === true)
  const regularContent = contenidos.filter(content => !content.trending && !content.destacado)
  
  // Debug para destacados
  console.log('🔥 DEBUGGING DESTACADOS:')
  console.log('Total contenidos:', contenidos.length)
  console.log('Contenidos trending:', trendingContent.length)
  console.log('Contenidos destacados:', destacadoContent.length)
  console.log('Contenidos con destacado=true:', contenidos.filter(c => c.destacado).length)
  console.log('Primer contenido (campos destacado):', contenidos[0] ? {
    id: contenidos[0].id,
    titulo: contenidos[0].titulo,
    destacado: contenidos[0].destacado,
    trending: contenidos[0].trending
  } : 'No hay contenidos')
  
  // Obtener contenido para mostrar (filtrado o por categorías)
  const contentToShow = searchTerm ? filteredContent : trendingContent.slice(0, 8)
  const featuredMovies = destacadoContent.slice(0, 6)
  
  console.log('contentToShow:', contentToShow)
  console.log('contentToShow.length:', contentToShow.length)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <Header />
      <HeroSection />

      {/* Trending Section con Búsqueda */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <TrendingUp className="h-6 w-6 text-red-500 mr-2" />
              <h2 className="text-3xl font-bold text-white">
                {searchTerm ? "Resultado de la búsqueda" : "Tendencias"}
              </h2>
            </div>
            {/* Barra de búsqueda */}
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                id="search-movies"
                name="search"
                type="text"
                placeholder="Buscar películas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-red-500"
                autoComplete="off"
              />
            </div>
          </div>
            
            {contentLoading ? (
              <div className="text-center py-12">
                <p className="text-gray-400 text-lg">Cargando contenido...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-400 text-lg">Error: {error}</p>
                <p className="text-gray-400 text-sm mt-2">Revisa la consola para más detalles</p>
              </div>
            ) : contenidos.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400 text-lg">No hay contenido disponible en la base de datos</p>
              </div>
            ) : searchTerm && filteredContent.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400 text-lg">No se encontraron películas con "{searchTerm}"</p>
              </div>
            ) : searchTerm ? (
              /* Resultados de búsqueda */
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
                {contentToShow.map((content) => (
                  <ContentCard key={content.id} content={content} size="medium" />
                ))}
              </div>
            ) : trendingContent.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400 text-lg">¡No hay contenido en tendencias disponible!</p>
              </div>
            ) : (
              /* Contenido trending */
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
                {contentToShow.map((content) => (
                  <ContentCard key={content.id} content={content} size="medium" />
                ))}
              </div>
            )}
          </div>
        </section>

      {/* Featured Content - Destacados siempre después de Tendencias */}
      {!contentLoading && (
        <section className="py-16 px-4 bg-gray-900/30">
          <div className="container mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center">
                <Star className="h-6 w-6 text-yellow-500 mr-2" />
                <h2 className="text-3xl font-bold text-white">
                  Destacados 
                </h2>
              </div>
            </div>
            
            {destacadoContent.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400 text-lg">
                  ¡No hay contenido destacado disponible!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
                {featuredMovies.map((content) => (
                  <ContentCard key={content.id} content={content} size="medium" />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Regular Content - Contenidos sin etiquetas especiales */}
      {!contentLoading && !searchTerm && (
        <section className="py-16 px-4 bg-gray-800/20">
          <div className="container mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center">
                <h2 className="text-3xl font-bold text-white">
                  ¡Peliculas!
                </h2>
              </div>
              <Link href="/catalogo">
                <Button
                  variant="outline"
                  className="border-orange-400 text-orange-400 hover:bg-gray-400 hover:text-black bg-transparent"
                >
                  Explorar Catalogo
                </Button>
              </Link>
            </div>
            
            {regularContent.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400 text-lg">
                  ¡No hay peliculas disponibles!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
                {regularContent.slice(0, 10).map((content) => (
                  <ContentCard key={content.id} content={content} size="medium" />
                ))}
              </div>
            )}
          </div>
        </section>
      )}
      <FeaturesSection />
      <Footer />
    </div>
  )
}
