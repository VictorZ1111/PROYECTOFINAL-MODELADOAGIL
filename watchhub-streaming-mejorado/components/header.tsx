"use client"

import Link from "next/link"
import { useState } from "react"
import { Play, Menu, X, User, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  return (
    <header className="bg-black/90 backdrop-blur-md border-b border-red-500/20 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Play className="h-8 w-8 text-red-500" />
            <h1 className="text-2xl font-bold text-white">WatchHub</h1>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            <Link href="/" className="text-white hover:text-red-400 transition-colors font-medium">
              Inicio
            </Link>
            <Link href="/planes" className="text-white hover:text-red-400 transition-colors font-medium">
              Planes
            </Link>
            <Link href="/catalogo" className="text-white hover:text-red-400 transition-colors font-medium">
              Catálogo
            </Link>
            <Link href="/favoritos" className="text-white hover:text-red-400 transition-colors font-medium">
              Favoritos
            </Link>
          </nav>

          {/* Search and User Actions */}
          <div className="flex items-center space-x-4">
            {/* Search Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="text-white hover:text-red-400 lg:hidden"
            >
              <Search className="h-5 w-5" />
            </Button>

            {/* Desktop Search */}
            <div className="hidden lg:block">
              <Input
                placeholder="Buscar contenido..."
                className="w-64 bg-gray-800 border-gray-700 text-white placeholder-gray-400"
              />
            </div>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="text-white hover:text-red-400">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-gray-800 border-gray-700">
                <DropdownMenuItem className="text-white hover:bg-gray-700">
                  <Link href="/perfil">Mi Perfil</Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="text-white hover:bg-gray-700">
                  <Link href="/configuracion">Configuración</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-gray-700" />
                <DropdownMenuItem className="text-white hover:bg-gray-700">
                  <Link href="/login">Iniciar Sesión</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white hover:text-red-400 lg:hidden"
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Search */}
        {isSearchOpen && (
          <div className="mt-4 lg:hidden">
            <Input
              placeholder="Buscar contenido..."
              className="w-full bg-gray-800 border-gray-700 text-white placeholder-gray-400"
            />
          </div>
        )}

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="mt-4 pb-4 lg:hidden">
            <div className="flex flex-col space-y-4">
              <Link
                href="/"
                className="text-white hover:text-red-400 transition-colors font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Inicio
              </Link>
              <Link
                href="/planes"
                className="text-white hover:text-red-400 transition-colors font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Planes
              </Link>
              <Link
                href="/catalogo"
                className="text-white hover:text-red-400 transition-colors font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Catálogo
              </Link>
              <Link
                href="/favoritos"
                className="text-white hover:text-red-400 transition-colors font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Favoritos
              </Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  )
}
