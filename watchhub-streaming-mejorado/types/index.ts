export interface Plan {
  id: string
  name: string
  price: string
  originalPrice?: string
  features: string[]
  screens: number
  quality: string
  popular: boolean
  discount?: number
}

export interface Content {
  id: string
  title: string
  type: "Película" | "Serie" | "Documental"
  rating: number
  year: string
  genre: string
  image: string
  description: string
  duration?: string
  seasons?: number
  featured: boolean
  trending: boolean
}

export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  subscription?: string
  favorites: string[]
}

export interface FilterOptions {
  search: string
  genre: string
  type: string
  year: string
  rating: number
}
