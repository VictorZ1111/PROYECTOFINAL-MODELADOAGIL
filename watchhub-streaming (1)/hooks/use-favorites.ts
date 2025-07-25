"use client"

import { useState, useEffect } from "react"

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([])

  useEffect(() => {
    const savedFavorites = localStorage.getItem("watchhub-favorites")
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites))
    }
  }, [])

  const toggleFavorite = (contentId: string) => {
    setFavorites((prev) => {
      const newFavorites = prev.includes(contentId) ? prev.filter((id) => id !== contentId) : [...prev, contentId]

      localStorage.setItem("watchhub-favorites", JSON.stringify(newFavorites))
      return newFavorites
    })
  }

  const isFavorite = (contentId: string) => favorites.includes(contentId)

  return { favorites, toggleFavorite, isFavorite }
}
