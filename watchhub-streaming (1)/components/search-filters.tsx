"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Search, Filter, X } from "lucide-react"
import { genres, contentTypes, years } from "@/lib/data"
import type { FilterOptions } from "@/types"

interface SearchFiltersProps {
  filters: FilterOptions
  onFilterChange: (key: keyof FilterOptions, value: string | number) => void
  onClearFilters: () => void
  resultCount: number
}

export function SearchFilters({ filters, onFilterChange, onClearFilters, resultCount }: SearchFiltersProps) {
  return (
    <div className="space-y-6 bg-gray-800/30 rounded-lg p-6">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
        <Input
          placeholder="Buscar películas, series, documentales..."
          value={filters.search}
          onChange={(e) => onFilterChange("search", e.target.value)}
          className="pl-10 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
        />
      </div>

      {/* Active Filters */}
      {(filters.search ||
        filters.genre !== "Todos" ||
        filters.type !== "Todos" ||
        filters.year !== "Todos" ||
        filters.rating > 0) && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm text-gray-400">Filtros activos:</span>
          {filters.search && (
            <Badge variant="secondary" className="bg-red-600 text-white">
              "{filters.search}"
              <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => onFilterChange("search", "")} />
            </Badge>
          )}
          {filters.genre !== "Todos" && (
            <Badge variant="secondary" className="bg-blue-600 text-white">
              {filters.genre}
              <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => onFilterChange("genre", "Todos")} />
            </Badge>
          )}
          {filters.type !== "Todos" && (
            <Badge variant="secondary" className="bg-green-600 text-white">
              {filters.type}
              <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => onFilterChange("type", "Todos")} />
            </Badge>
          )}
          {filters.year !== "Todos" && (
            <Badge variant="secondary" className="bg-purple-600 text-white">
              {filters.year}
              <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => onFilterChange("year", "Todos")} />
            </Badge>
          )}
          <Button variant="ghost" size="sm" onClick={onClearFilters} className="text-red-400 hover:text-red-300">
            Limpiar todo
          </Button>
        </div>
      )}

      {/* Filter Buttons */}
      <div className="space-y-4">
        {/* Genre Filter */}
        <div>
          <h3 className="text-white font-medium mb-2 flex items-center">
            <Filter className="h-4 w-4 mr-2" />
            Género
          </h3>
          <div className="flex flex-wrap gap-2">
            {genres.map((genre) => (
              <Button
                key={genre}
                variant={filters.genre === genre ? "default" : "outline"}
                size="sm"
                onClick={() => onFilterChange("genre", genre)}
                className={`${
                  filters.genre === genre
                    ? "bg-red-600 hover:bg-red-700 text-white"
                    : "border-gray-600 text-gray-300 hover:bg-red-600 hover:border-red-600 bg-transparent"
                }`}
              >
                {genre}
              </Button>
            ))}
          </div>
        </div>

        {/* Type Filter */}
        <div>
          <h3 className="text-white font-medium mb-2">Tipo de Contenido</h3>
          <div className="flex flex-wrap gap-2">
            {contentTypes.map((type) => (
              <Button
                key={type}
                variant={filters.type === type ? "default" : "outline"}
                size="sm"
                onClick={() => onFilterChange("type", type)}
                className={`${
                  filters.type === type
                    ? "bg-red-600 hover:bg-red-700 text-white"
                    : "border-gray-600 text-gray-300 hover:bg-red-600 hover:border-red-600 bg-transparent"
                }`}
              >
                {type}
              </Button>
            ))}
          </div>
        </div>

        {/* Year Filter */}
        <div>
          <h3 className="text-white font-medium mb-2">Año</h3>
          <div className="flex flex-wrap gap-2">
            {years.map((year) => (
              <Button
                key={year}
                variant={filters.year === year ? "default" : "outline"}
                size="sm"
                onClick={() => onFilterChange("year", year)}
                className={`${
                  filters.year === year
                    ? "bg-red-600 hover:bg-red-700 text-white"
                    : "border-gray-600 text-gray-300 hover:bg-red-600 hover:border-red-600 bg-transparent"
                }`}
              >
                {year}
              </Button>
            ))}
          </div>
        </div>

        {/* Rating Filter */}
        <div>
          <h3 className="text-white font-medium mb-2">Calificación mínima: {filters.rating.toFixed(1)} ⭐</h3>
          <Slider
            value={[filters.rating]}
            onValueChange={(value) => onFilterChange("rating", value[0])}
            max={5}
            min={0}
            step={0.1}
            className="w-full"
          />
        </div>
      </div>

      {/* Results Count */}
      <div className="text-center text-gray-400 text-sm">
        {resultCount} resultado{resultCount !== 1 ? "s" : ""} encontrado{resultCount !== 1 ? "s" : ""}
      </div>
    </div>
  )
}
