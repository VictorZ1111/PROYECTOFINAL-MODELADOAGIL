"use client"

import { useState, useMemo } from "react"
import type { Content, FilterOptions } from "@/types"

export function useSearch(content: Content[]) {
  const [filters, setFilters] = useState<FilterOptions>({
    search: "",
    genre: "Todos",
    type: "Todos",
    year: "Todos",
    rating: 0,
  })

  const filteredContent = useMemo(() => {
    return content.filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        item.description.toLowerCase().includes(filters.search.toLowerCase())

      const matchesGenre = filters.genre === "Todos" || item.genre === filters.genre

      const matchesType =
        filters.type === "Todos" ||
        (filters.type === "Películas" && item.type === "Película") ||
        (filters.type === "Series" && item.type === "Serie") ||
        (filters.type === "Documentales" && item.type === "Documental")

      const matchesYear = filters.year === "Todos" || item.year === filters.year

      const matchesRating = item.rating >= filters.rating

      return matchesSearch && matchesGenre && matchesType && matchesYear && matchesRating
    })
  }, [content, filters])

  const updateFilter = (key: keyof FilterOptions, value: string | number) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const clearFilters = () => {
    setFilters({
      search: "",
      genre: "Todos",
      type: "Todos",
      year: "Todos",
      rating: 0,
    })
  }

  return { filters, filteredContent, updateFilter, clearFilters }
}
