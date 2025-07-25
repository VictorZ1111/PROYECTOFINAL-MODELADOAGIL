"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ContentCard } from "@/components/content-card"
import { SearchFilters } from "@/components/search-filters"
import { Button } from "@/components/ui/button"
import { useSearch } from "@/hooks/use-search"
import { featuredContent } from "@/lib/data"
import { Grid, List, SlidersHorizontal } from "lucide-react"

export default function CatalogoPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [showFilters, setShowFilters] = useState(true)
  const [sortBy, setSortBy] = useState<"title" | "year" | "rating">("title")

  const { filters, filteredContent, updateFilter, clearFilters } = useSearch([
    ...featuredContent,
    ...featuredContent.map((item) => ({ ...item, id: item.id + "_2" })),
  ])

  const sortedContent = [...filteredContent].sort((a, b) => {
    switch (sortBy) {
      case "year":
        return Number.parseInt(b.year) - Number.parseInt(a.year)
      case "rating":
        return b.rating - a.rating
      default:
        return a.title.localeCompare(b.title)
    }
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <Header />

      <section className="py-8 px-4">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Catálogo Completo</h1>
              <p className="text-gray-400">Explora nuestra extensa biblioteca de contenido premium</p>
            </div>

            {/* View Controls */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-white text-sm">Ordenar por:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as "title" | "year" | "rating")}
                  className="bg-gray-800 border-gray-700 text-white rounded px-3 py-1 text-sm"
                >
                  <option value="title">Título</option>
                  <option value="year">Año</option>
                  <option value="rating">Calificación</option>
                </select>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Filtros
              </Button>

              <div className="flex border border-gray-600 rounded">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="rounded-r-none"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="rounded-l-none"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-4 gap-8">
            {/* Filters Sidebar */}
            {showFilters && (
              <div className="lg:col-span-1">
                <SearchFilters
                  filters={filters}
                  onFilterChange={updateFilter}
                  onClearFilters={clearFilters}
                  resultCount={filteredContent.length}
                />
              </div>
            )}

            {/* Content Grid */}
            <div className={showFilters ? "lg:col-span-3" : "lg:col-span-4"}>
              {sortedContent.length > 0 ? (
                <div
                  className={
                    viewMode === "grid"
                      ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
                      : "space-y-4"
                  }
                >
                  {sortedContent.map((content) => (
                    <ContentCard key={content.id} content={content} size={viewMode === "list" ? "small" : "medium"} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-2xl font-bold text-white mb-2">No se encontraron resultados</h3>
                  <p className="text-gray-400 mb-6">Intenta ajustar tus filtros o buscar algo diferente</p>
                  <Button onClick={clearFilters} className="bg-red-600 hover:bg-red-700">
                    Limpiar filtros
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
