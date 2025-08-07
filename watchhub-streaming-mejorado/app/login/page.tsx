"use client"

import { useState, useEffect, Suspense } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import { useToast } from "@/components/ui/toast-custom"

import { AuthHeader } from "@/components/auth-header"
import { Footer } from "@/components/footer"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Eye, EyeOff, Lock } from "lucide-react"

function LoginContent() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { showToast, ToastContainer } = useToast()

  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect') || '/'

  useEffect(() => {
    // Verificar si ya está autenticado
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        router.push(redirectTo)
      }
    }
    checkAuth()
  }, [router, redirectTo])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    if (!username.trim() || !password.trim()) {
      showToast('Por favor completa todos los campos', 'error')
      setIsLoading(false)
      return
    }

    try {
      console.log('Buscando usuario:', username.trim().toLowerCase())
      
      // Buscar el perfil del usuario usando el nombre de usuario
      const { data: perfilData, error: perfilError } = await supabase
        .from('perfiles')
        .select('email, nombre_usuario')
        .eq('nombre_usuario', username.trim().toLowerCase())
        .single()

      console.log('Resultado búsqueda:', perfilData)
      console.log('Error búsqueda:', perfilError)

      if (perfilError || !perfilData) {
        showToast('Nombre de usuario no encontrado', 'error')
        setIsLoading(false)
        return
      }

      console.log('Email encontrado:', perfilData.email)

      // Iniciar sesión con el email encontrado
      const { data, error } = await supabase.auth.signInWithPassword({
        email: perfilData.email,
        password,
      })

      if (error) {
        showToast(`Error de inicio de sesión: ${error.message}`, 'error')
      } else if (data.user) {
        // Verificar el rol del usuario para redirigir correctamente
        const { data: perfilCompleto } = await supabase
          .from('perfiles')
          .select('rol')
          .eq('id', data.user.id)
          .single()

        showToast('¡Has iniciado sesión exitosamente!', 'success')
        
        // Redirigir según el rol
        if (perfilCompleto?.rol === 'admin') {
          router.push('/admin')
        } else {
          router.push(redirectTo)
        }
      }
    } catch (err) {
      console.error('Error:', err)
      showToast('Error de conexión', 'error')
    }

    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <AuthHeader />
      <ToastContainer />

      <section className="py-20 px-4">
        <div className="container mx-auto max-w-md">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader className="text-center">
              <div className="flex items-center justify-center mb-4">
                <Lock className="h-8 w-8 text-red-500" />
              </div>
              <CardTitle className="text-3xl text-white">Iniciar Sesión</CardTitle>
              <CardDescription className="text-gray-400">
                {redirectTo !== '/' ? 
                  'Necesitas iniciar sesión para acceder a tus favoritos y contenido personalizado' :
                  'Inicia sesión para continuar disfrutando de WatchHub'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <Label htmlFor="username" className="text-white">
                    Nombre de Usuario
                  </Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="tu_nombre_usuario"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s/g, ''))}
                    className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="password" className="text-white">
                    Contraseña
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="********"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
                <Button
                  type="submit"
                  className="w-full bg-red-600 hover:bg-red-700 text-white"
                  disabled={isLoading}
                >
                  {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
                </Button>
              </form>

              
            </CardContent>
            <CardFooter className="text-center">
              <p className="text-gray-400 text-sm">
                ¿No tienes cuenta?{" "}
                <Link href="/registro" className="text-red-400 hover:text-red-300 font-medium">
                  Regístrate gratis
                </Link>
              </p>
            </CardFooter>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  )
}

// Componente wrapper con Suspense
export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Cargando...</div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  )
}

