"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ContentCard } from "@/components/content-card"
import { Button } from "@/components/ui/button"
import { useFavorites } from "@/hooks/use-favorites"
import { featuredContent } from "@/lib/data"
import { Heart, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function FavoritosPage() {
  const { favorites } = useFavorites()

  const favoriteContent = featuredContent.filter((content) => favorites.includes(content.id))

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
