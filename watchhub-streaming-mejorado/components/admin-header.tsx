"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { supabase } from "@/lib/supabaseClient"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Play, User, LogOut } from "lucide-react"

interface AdminHeaderProps {
  showInicio?: boolean // Para mostrar "Inicio" cuando NO estamos en /admin
}

export function AdminHeader({ showInicio = false }: AdminHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

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
          <div className="flex items-center space-x-2">
            <Play className="h-8 w-8 text-red-500" />
            <h1 className="text-2xl font-bold text-white">WatchHub</h1>
          </div>

          {/* Desktop Navigation - Opciones según la página */}
          <nav className="hidden lg:flex items-center space-x-8">
            {showInicio && (
              <Button
                variant="ghost"
                onClick={() => router.push('/admin')}
                className="text-white hover:text-red-400 transition-colors font-medium"
              >
                Inicio
              </Button>
            )}
            <Button
              variant="ghost"
              onClick={() => router.push('/catalogo')}
              className="text-white hover:text-red-400 transition-colors font-medium"
            >
              Catálogo
            </Button>
            <Button
              variant="ghost"
              onClick={() => router.push('/estadisticas')}
              className="text-white hover:text-red-400 transition-colors font-medium"
            >
              Estadísticas
            </Button>
          </nav>

          {/* Search and User Actions */}
          <div className="flex items-center space-x-4">
            {/* User Menu - Con ícono simple */}
            {loading ? (
              <div className="w-8 h-8 bg-gray-600 rounded-full animate-pulse" />
            ) : user ? (
              <div className="flex items-center space-x-4">
                {/* Ícono de usuario simple */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="text-white hover:text-red-400 p-2">
                      <User className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-gray-800 border-gray-700">
                    <DropdownMenuItem className="text-white hover:bg-gray-700">
                      <Link href="/perfil" className="flex items-center">
                        <User className="h-4 w-4 mr-2" />
                        Mi Perfil
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
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  onClick={() => router.push('/login')}
                  className="text-white hover:text-red-400"
                >
                  Iniciar Sesión
                </Button>
                <Button
                  onClick={() => router.push('/registro')}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  Registrarse
                </Button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden text-white p-2"
            >
              {isMenuOpen ? <div>✕</div> : <div>☰</div>}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden mt-4 py-4 border-t border-gray-700">
            <nav className="flex flex-col space-y-4">
              {showInicio && (
                <Button
                  variant="ghost"
                  onClick={() => router.push('/admin')}
                  className="text-white hover:text-red-400 justify-start"
                >
                  Inicio
                </Button>
              )}
              <Button
                variant="ghost"
                onClick={() => router.push('/catalogo')}
                className="text-white hover:text-red-400 justify-start"
              >
                Catálogo
              </Button>
              <Button
                variant="ghost"
                onClick={() => router.push('/estadisticas')}
                className="text-white hover:text-red-400 justify-start"
              >
                Estadísticas
              </Button>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
