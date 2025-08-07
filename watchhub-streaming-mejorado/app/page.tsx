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
import { plans } from "@/lib/data"
import { TrendingUp, Star, Search } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  const { contenidos, loading: contentLoading, error } = useContenidos()
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
  
  // Obtener contenido para mostrar (filtrado o aleatorio)
  const contentToShow = searchTerm ? filteredContent : contenidos.slice(0, 6)
  const featuredMovies = contenidos.slice(6, 9)
  
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
                {searchTerm ? "Resultados de búsqueda" : "Tendencias"}
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
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
                {contentToShow.map((content) => (
                  <ContentCard key={content.id} content={content} size="medium" />
                ))}
              </div>
            )}
          </div>
        </section>

      {/* Featured Content */}
      {!contentLoading && featuredMovies.length > 0 && (
        <section className="py-16 px-4 bg-gray-900/30">
          <div className="container mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center">
                <Star className="h-6 w-6 text-yellow-500 mr-2" />
                <h2 className="text-3xl font-bold text-white">Contenido Destacado</h2>
              </div>
              <Link href="/catalogo">
                <Button
                  variant="outline"
                  className="border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-black bg-transparent"
                >
                  Explorar catálogo
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredMovies.map((content) => (
                <ContentCard key={content.id} content={content} size="large" />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Plans Preview - Solo si hay planes */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">Planes Especiales</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Aprovecha nuestras ofertas por tiempo limitado. Todos los planes incluyen acceso completo.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan) => (
              <PlanCard key={plan.id} plan={plan} />
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/planes">
              <Button className="bg-red-600 hover:bg-red-700 text-white px-8 py-3">Ver todos los planes</Button>
            </Link>
          </div>
        </div>
      </section>

      <FeaturesSection />
      <Footer />
    </div>
  )
}
