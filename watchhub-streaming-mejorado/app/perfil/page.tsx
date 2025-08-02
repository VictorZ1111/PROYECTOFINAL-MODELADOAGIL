'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from "next/link"
import { supabase } from '@/lib/supabaseClient'
import { Play, User, LogOut, Edit, Home, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Footer } from "@/components/footer"
import { AdminHeader } from "@/components/admin-header"
import { useToast } from "@/components/ui/toast-custom"

interface Perfil {
  id: string
  nombre: string
  nombre_usuario?: string
  email?: string
  rol: string
  created_at?: string
}

export default function PerfilPage() {
  const [perfil, setPerfil] = useState<Perfil | null>(null)
  const [loading, setLoading] = useState(true)
  const [editando, setEditando] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const router = useRouter()
  const { showToast, ToastContainer } = useToast()

  useEffect(() => {
    const fetchPerfil = async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()
      
      if (userError || !user) {
        router.push('/login')
        return
      }

      // Primero intentar obtener el perfil existente
      const { data, error } = await supabase
        .from('perfiles')
        .select('id, nombre, nombre_usuario, email, rol, created_at')
        .eq('id', user.id)
        .single()

      if (error && error.code === 'PGRST116') {
        // Si no existe el perfil, crearlo automáticamente
        console.log('Perfil no encontrado, creando uno nuevo...')
        
        const nuevoPerfilData = {
          id: user.id,
          nombre: user.user_metadata?.name || user.email?.split('@')[0] || 'Usuario',
          nombre_usuario: user.email?.split('@')[0] || 'usuario',
          email: user.email || '',
          rol: 'usuario'
        }

        const { data: nuevoPerfil, error: errorCreacion } = await supabase
          .from('perfiles')
          .insert([nuevoPerfilData])
          .select()
          .single()

        if (errorCreacion) {
          console.error('Error al crear perfil:', errorCreacion)
          showToast('Error al crear perfil automáticamente', 'error')
        } else {
          setPerfil(nuevoPerfil)
          setIsAdmin(nuevoPerfil.rol === 'admin')
        }
      } else if (error) {
        console.error('Error al obtener perfil:', error)
        showToast('Error al cargar perfil', 'error')
      } else {
        setPerfil(data)
        // Verificar si es admin
        setIsAdmin(data.rol === 'admin')
      }

      setLoading(false)
    }

    fetchPerfil()
  }, [router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (!perfil) return
    setPerfil({ ...perfil, [e.target.name]: e.target.value })
  }

  const handleGuardar = async () => {
    if (!perfil) return
    
    try {
      // Actualizar perfil en la tabla perfiles
      const { error: perfilError } = await supabase
        .from('perfiles')
        .update({
          nombre: perfil.nombre,
          nombre_usuario: perfil.nombre_usuario,
          email: perfil.email,
          rol: perfil.rol
        })
        .eq('id', perfil.id)

      if (perfilError) {
        console.error('Error al actualizar perfil:', perfilError)
        showToast('Error al guardar cambios en el perfil', 'error')
        return
      }

      // Si se cambió el email, actualizar también en auth
      if (perfil.email) {
        const { error: authError } = await supabase.auth.updateUser({
          email: perfil.email
        })

        if (authError) {
          console.error('Error al actualizar email en auth:', authError)
          showToast('Perfil actualizado, pero hubo un problema al actualizar el email', 'error')
        } else {
          showToast('Perfil actualizado correctamente', 'success')
        }
      } else {
        showToast('Perfil actualizado correctamente', 'success')
      }

      setEditando(false)
    } catch (error) {
      console.error('Error:', error)
      showToast('Error inesperado al guardar cambios', 'error')
    }
  }

  const handleCerrarSesion = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('Error al cerrar sesión:', error)
    } else {
      router.push('/login')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Cargando perfil...</div>
      </div>
    )
  }

  if (!perfil) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">No se encontró el perfil.</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex flex-col">
      {/* Header según el tipo de usuario */}
      {isAdmin ? (
        <AdminHeader showInicio={true} />
      ) : (
        /* Header personalizado para perfil de usuario normal */
        <header className="bg-black/90 backdrop-blur-md border-b border-red-500/20 sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              {/* Logo */}
              <Link href="/" className="flex items-center space-x-2">
                <Play className="h-8 w-8 text-red-500" />
                <h1 className="text-2xl font-bold text-white">WatchHub</h1>
              </Link>

              {/* Navigation */}
              <nav className="hidden md:flex items-center space-x-6">
                <Link href="/" className="text-white hover:text-red-400 transition-colors font-medium flex items-center space-x-2">
                  <Home className="h-4 w-4" />
                  <span>Inicio</span>
                </Link>
                <Link href="/catalogo" className="text-white hover:text-red-400 transition-colors font-medium">
                  Catálogo
                </Link>
                <Link href="/favoritos" className="text-white hover:text-red-400 transition-colors font-medium">
                  Favoritos
                </Link>
              </nav>

              {/* User Menu */}
              <div className="flex items-center space-x-4">
                <span className="hidden md:block text-gray-300">Bienvenido, {perfil.nombre}</span>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-white hover:text-red-400">
                      <User className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-gray-800 border-gray-700">
                    <DropdownMenuItem className="text-white hover:bg-gray-700">
                      <Edit className="h-4 w-4 mr-2" />
                      Editar perfil
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-white hover:bg-gray-700">
                      <Settings className="h-4 w-4 mr-2" />
                      Configuración
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-gray-600" />
                    <DropdownMenuItem 
                      className="text-red-400 hover:bg-gray-700"
                      onClick={handleCerrarSesion}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Cerrar sesión
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </header>
      )}

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 flex-grow">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Picture and Basic Info */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-6 text-center">
                <div className="w-24 h-24 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="h-12 w-12 text-white" />
                </div>
                <h2 className="text-xl font-bold text-white mb-2">{perfil.nombre}</h2>
                <p className="text-gray-400 mb-4 capitalize">
                  {perfil.rol === 'admin' ? 'Administrador' : 'Usuario'}
                </p>
                <Button
                  onClick={() => setEditando(!editando)}
                  className="bg-red-600 hover:bg-red-700 text-white w-full"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Editar perfil
                </Button>
              </CardContent>
            </Card>

            {/* Profile Details */}
            <Card className="lg:col-span-2 bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Información del perfil</CardTitle>
                <CardDescription className="text-gray-400">
                  Detalles de tu cuenta
                </CardDescription>
              </CardHeader>
              <CardContent>
                {editando ? (
                  <div className="space-y-6">
                    <div>
                      <Label htmlFor="nombre" className="text-gray-300">Nombre completo</Label>
                      <Input
                        id="nombre"
                        name="nombre"
                        value={perfil.nombre}
                        onChange={handleChange}
                        className="bg-gray-700 border-gray-600 text-white mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="nombre_usuario" className="text-gray-300">Nombre de usuario</Label>
                      <Input
                        id="nombre_usuario"
                        name="nombre_usuario"
                        value={perfil.nombre_usuario || ''}
                        onChange={handleChange}
                        className="bg-gray-700 border-gray-600 text-white mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="email" className="text-gray-300">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={perfil.email || ''}
                        onChange={handleChange}
                        className="bg-gray-700 border-gray-600 text-white mt-1"
                      />
                    </div>
                    
                    {isAdmin && (
                      <div>
                        <Label htmlFor="rol" className="text-gray-300">Rol</Label>
                        <select
                          id="rol"
                          name="rol"
                          value={perfil.rol}
                          onChange={handleChange}
                          className="w-full bg-gray-700 border border-gray-600 text-white rounded-md px-3 py-2 mt-1"
                        >
                          <option value="usuario">Usuario</option>
                          <option value="admin">Administrador</option>
                        </select>
                      </div>
                    )}

                    <div className="flex space-x-4">
                      <Button
                        onClick={handleGuardar}
                        className="bg-red-600 hover:bg-red-700 text-white"
                      >
                        Guardar cambios
                      </Button>
                      <Button
                        onClick={() => setEditando(false)}
                        variant="outline"
                        className="border-gray-600 text-gray-300 hover:bg-gray-700"
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">Información personal</h3>
                      <div className="space-y-3">
                        <div>
                          <span className="text-gray-400">Nombre: </span>
                          <span className="text-white">{perfil.nombre}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Nombre de usuario: </span>
                          <span className="text-white">{perfil.nombre_usuario || 'No definido'}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Email: </span>
                          <span className="text-white">{perfil.email || 'No definido'}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Rol: </span>
                          <span className="text-white capitalize">
                            {perfil.rol === 'admin' ? 'Administrador' : 'Usuario'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
      <ToastContainer />
    </div>
  )
}
