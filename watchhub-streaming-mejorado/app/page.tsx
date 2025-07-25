"use client"

import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { FeaturesSection } from "@/components/features-section"
import { Footer } from "@/components/footer"
import { ContentCard } from "@/components/content-card"
import { PlanCard } from "@/components/plan-card"
import { Button } from "@/components/ui/button"
import { featuredContent, plans } from "@/lib/data"
import { TrendingUp, Star } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  const trendingContent = featuredContent.filter((content) => content.trending)
  const featuredMovies = featuredContent.filter((content) => content.featured)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <Header />
      <HeroSection />

      {/* Trending Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <TrendingUp className="h-6 w-6 text-red-500 mr-2" />
              <h2 className="text-3xl font-bold text-white">Tendencias</h2>
            </div>
            <Link href="/catalogo">
              <Button
                variant="outline"
                className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white bg-transparent"
              >
                Ver todo
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
            {trendingContent.map((content) => (
              <ContentCard key={content.id} content={content} size="medium" />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Content */}
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
            {featuredMovies.slice(0, 3).map((content) => (
              <ContentCard key={content.id} content={content} size="large" />
            ))}
          </div>
        </div>
      </section>

      {/* Plans Preview */}
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

      {/* Stats Section */}
      <section className="py-16 px-4 bg-gray-900/30">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-red-500 mb-2">10K+</div>
              <div className="text-gray-400">Películas y Series</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-red-500 mb-2">1M+</div>
              <div className="text-gray-400">Usuarios Activos</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-red-500 mb-2">50+</div>
              <div className="text-gray-400">Países</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-red-500 mb-2">24/7</div>
              <div className="text-gray-400">Soporte</div>
            </div>
          </div>
        </div>
      </section>

      <FeaturesSection />
      <Footer />
    </div>
  )
}
