"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { AdminHeader } from "@/components/admin-header"
import { Footer } from "@/components/footer"
import { ContentCard } from "@/components/content-card"
import { SearchFilters } from "@/components/search-filters"
import { Button } from "@/components/ui/button"
import { useSearch } from "@/hooks/use-search"
import { useContenidos } from "@/hooks/use-contenidos"
import { supabase } from "@/lib/supabaseClient"
import { Grid, List, SlidersHorizontal, Loader2, Search } from "lucide-react"

export default function CatalogoPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [showFilters, setShowFilters] = useState(true)
  const [sortBy, setSortBy] = useState<"title" | "year" | "rating">("title")
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  const { contenidos, loading: contentLoading, error } = useContenidos()
  const { filters, filteredContent, updateFilter, clearFilters } = useSearch(contenidos)

  // Verificar si el usuario es admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        
        if (user) {
          const { data: perfil } = await supabase
            .from('perfiles')
            .select('rol')
            .eq('id', user.id)
            .single()

          setIsAdmin(perfil?.rol === 'admin')
        }
      } catch (error) {
        console.error('Error verificando admin:', error)
      } finally {
        setLoading(false)
      }
    }

    checkAdminStatus()
  }, [])

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
        {/* Header según el tipo de usuario */}
        {isAdmin ? (
          <AdminHeader showInicio={true} />
        ) : (
          <Header />
        )}
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 text-red-500 animate-spin mx-auto mb-4" />
            <p className="text-white">Cargando contenido...</p>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Header según el tipo de usuario */}
      {isAdmin ? (
        <AdminHeader showInicio={true} />
      ) : (
        <Header />
      )}

      <section className="py-2 px-4">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-4">
            {/* Barra de búsqueda para todos los usuarios */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Buscar películas..."
                  value={filters.search}
                  onChange={(e) => updateFilter("search", e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
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

          <div className="grid lg:grid-cols-5 gap-8">
            {/* Filters Sidebar - Más ancho */}
            {showFilters && (
              <div className="lg:col-span-2">
                <SearchFilters
                  filters={filters}
                  onFilterChange={updateFilter}
                  onClearFilters={clearFilters}
                  resultCount={filteredContent.length}
                />
              </div>
            )}

            {/* Content Grid */}
            <div className={showFilters ? "lg:col-span-3" : "lg:col-span-5"}>
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
