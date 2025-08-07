"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Play, Menu, X, User, Search, LogOut, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { supabase } from "@/lib/supabaseClient"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Verificar usuario actual
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }

    getUser()

    // Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleCerrarSesion = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('Error al cerrar sesión:', error)
    } else {
      router.push('/login')
    }
  }

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
            {/* User Menu con ícono simple siempre visible */}
            {loading ? (
              <div className="w-8 h-8 bg-gray-600 rounded-full animate-pulse" />
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="text-white hover:text-red-400 p-2">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-gray-800 border-gray-700">
                  {user ? (
                    <>
                      <DropdownMenuItem className="text-white hover:bg-gray-700">
                        <Link href="/perfil" className="flex items-center">
                          <User className="h-4 w-4 mr-2" />
                          Mi Perfil
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-white hover:bg-gray-700">
                        <Link href="/favoritos" className="flex items-center">
                          <Settings className="h-4 w-4 mr-2" />
                          Favoritos
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-gray-700" />
                      <DropdownMenuItem 
                        className="text-red-400 hover:bg-gray-700 cursor-pointer"
                        onClick={handleCerrarSesion}
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Cerrar Sesión
                      </DropdownMenuItem>
                    </>
                  ) : (
                    <>
                      <DropdownMenuItem className="text-white hover:bg-gray-700">
                        <Link href="/login" className="flex items-center">
                          <LogOut className="h-4 w-4 mr-2" />
                          Iniciar Sesión
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-white hover:bg-gray-700">
                        <Link href="/registro" className="flex items-center">
                          <User className="h-4 w-4 mr-2" />
                          Registrarse
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

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
