"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
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
import { Badge } from "@/components/ui/badge"
import { Eye, EyeOff, CreditCard, Shield, User, Crown, Check } from "lucide-react"

interface Plan {
  id: number
  nombre: string
  precio: number
  max_peliculas: number
  descripcion: string
}

export default function RegistroPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    nombre: "",
    nombreUsuario: "",
    rol: "usuario" as 'usuario' | 'admin',
    planId: 1,
    metodoPago: "stripe" as 'stripe' | 'paypal',
    codigoAdmin: ""
  })
  const [planes, setPlanes] = useState<Plan[]>([
    { id: 1, nombre: "Estándar", precio: 9.99, max_peliculas: 5, descripcion: "Perfecto para uso personal" },
    { id: 2, nombre: "Premium", precio: 19.99, max_peliculas: 10, descripcion: "Para los amantes del cine" }
  ])
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { showToast, ToastContainer } = useToast()

  const router = useRouter()

  useEffect(() => {
    // En el futuro, cargar planes desde la base de datos
    // loadPlanes()
  }, [])

  const handleChange = (field: string, value: string | boolean | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const validateForm = () => {
    if (!formData.nombre.trim()) {
      showToast("Por favor ingresa tu nombre completo", "error")
      return false
    }

    if (!formData.nombreUsuario.trim()) {
      showToast("Por favor ingresa un nombre de usuario", "error")
      return false
    }

    if (formData.nombreUsuario.length < 3) {
      showToast("El nombre de usuario debe tener al menos 3 caracteres", "error")
      return false
    }

    if (!formData.email.trim()) {
      showToast("Por favor ingresa tu correo electrónico", "error")
      return false
    }

    if (formData.password.length < 6) {
      showToast("La contraseña debe tener al menos 6 caracteres", "error")
      return false
    }

    if (formData.password !== formData.confirmPassword) {
      showToast("Las contraseñas no coinciden", "error")
      return false
    }

    if (formData.rol === 'admin' && !formData.codigoAdmin.trim()) {
      showToast("Por favor ingresa el código único de administrador", "error")
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    if (!validateForm()) {
      setIsLoading(false)
      return
    }

    try {
      // Verificar si el nombre de usuario ya existe
      const { data: existingUser } = await supabase
        .from('perfiles')
        .select('nombre_usuario')
        .eq('nombre_usuario', formData.nombreUsuario.trim())
        .single()

      if (existingUser) {
        showToast("El nombre de usuario ya está en uso", "error")
        setIsLoading(false)
        return
      }

      // Si es admin, verificar código único contra la base de datos
      if (formData.rol === 'admin') {
        const { data: codigoData, error: codigoError } = await supabase
          .from('codigos_admin')
          .select('*')
          .eq('codigo', formData.codigoAdmin.trim())
          .eq('usado', false)
          .single()

        if (codigoError || !codigoData) {
          showToast("Código de administrador inválido o ya utilizado", "error")
          setIsLoading(false)
          return
        }
      }

      // Registro de autenticación
      const { data, error } = await supabase.auth.signUp({
        email: formData.email.trim().toLowerCase(),
        password: formData.password
      })

      if (error) {
        showToast(`Error de registro: ${error.message}`, "error")
        setIsLoading(false)
        return
      }

      if (data.user) {
        // Crear perfil completo con columnas que SÍ existen en la tabla
        const perfilData = {
          id: data.user.id,
          nombre: formData.nombre.trim(),
          nombre_usuario: formData.nombreUsuario.trim(),
          email: formData.email.trim().toLowerCase(),
          rol: formData.rol,
          plan_id: formData.rol === 'usuario' ? formData.planId : null
        }

        console.log("Datos a insertar:", perfilData)

        const { error: perfilError } = await supabase
          .from('perfiles')
          .insert([perfilData])

        if (perfilError) {
          console.error("Error completo:", perfilError)
          console.error("Código de error:", perfilError.code)
          console.error("Mensaje:", perfilError.message)
          console.error("Detalles:", perfilError.details)
          
          if (perfilError.code === '42703') {
            showToast("Error: Faltan columnas en la base de datos. Ejecuta el script SQL primero.", "error")
          } else if (perfilError.code === '42P01') {
            showToast("Error: La tabla perfiles no existe. Ejecuta el script SQL primero.", "error")
          } else if (perfilError.code === '42P17') {
            showToast("Error: Problema con las políticas de seguridad. Ejecuta 'arreglar-politicas.sql'", "error")
          } else if (perfilError.code === '23503') {
            showToast("Error: Los planes no existen. Ejecuta 'insertar-planes-urgente.sql' primero.", "error")
          } else if (perfilError.code === '23505') {
            showToast("Error: El nombre de usuario ya está en uso.", "error")
          } else {
            showToast(`Error al crear el perfil: ${perfilError.message || 'Error desconocido'}`, "error")
          }
        } else {
          // Marcar código admin como usado si es admin
          if (formData.rol === 'admin') {
            await supabase
              .from('codigos_admin')
              .update({ 
                usado: true, 
                usado_por: data.user.id,
                fecha_uso: new Date().toISOString()
              })
              .eq('codigo', formData.codigoAdmin.trim())
          }

          showToast("¡Registro exitoso! Bienvenido a WatchHub", "success")
          
          // Redirigir según el rol
          if (formData.rol === 'admin') {
            router.push("/admin")
          } else {
            // Para usuarios normales, redirigir a proceso de pago (futuro)
            router.push("/") 
          }
        }
      }
    } catch (err) {
      console.error("Error:", err)
      showToast("Error de conexión", "error")
    }

    setIsLoading(false)
  }

  const selectedPlan = planes.find(p => p.id === formData.planId)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <AuthHeader />
      <ToastContainer />

      <section className="py-12 px-4">
        <div className="container mx-auto max-w-2xl">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl text-white">Únete a WatchHub</CardTitle>
              <CardDescription className="text-gray-400">
                Crea tu cuenta y comienza a disfrutar del mejor contenido
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Selector de Rol */}
                <div>
                  <Label className="text-white text-base font-medium">Tipo de Cuenta</Label>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <button
                      type="button"
                      onClick={() => handleChange('rol', 'usuario')}
                      className={`p-4 border-2 rounded-lg flex items-center justify-center space-x-2 transition-all ${
                        formData.rol === 'usuario' 
                          ? 'border-red-600 bg-red-600/10' 
                          : 'border-gray-600 bg-gray-700/50 hover:border-gray-500'
                      }`}
                    >
                      <User className="h-5 w-5 text-white" />
                      <span className="text-white font-medium">Usuario</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleChange('rol', 'admin')}
                      className={`p-4 border-2 rounded-lg flex items-center justify-center space-x-2 transition-all ${
                        formData.rol === 'admin' 
                          ? 'border-red-600 bg-red-600/10' 
                          : 'border-gray-600 bg-gray-700/50 hover:border-gray-500'
                      }`}
                    >
                      <Crown className="h-5 w-5 text-yellow-500" />
                      <span className="text-white font-medium">Administrador</span>
                    </button>
                  </div>
                </div>

                {/* Información Personal */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="nombre" className="text-white">Nombre Completo *</Label>
                    <Input
                      id="nombre"
                      type="text"
                      placeholder="Juan Pérez"
                      value={formData.nombre}
                      onChange={(e) => handleChange('nombre', e.target.value)}
                      className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="nombreUsuario" className="text-white">Nombre de Usuario *</Label>
                    <Input
                      id="nombreUsuario"
                      type="text"
                      placeholder="juanperez123"
                      value={formData.nombreUsuario}
                      onChange={(e) => handleChange('nombreUsuario', e.target.value.toLowerCase().replace(/\s/g, ''))}
                      className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email" className="text-white">Correo Electrónico *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="correo@ejemplo.com"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="password" className="text-white">Contraseña *</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="********"
                        value={formData.password}
                        onChange={(e) => handleChange('password', e.target.value)}
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
                  <div>
                    <Label htmlFor="confirmPassword" className="text-white">Confirmar Contraseña *</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="********"
                        value={formData.confirmPassword}
                        onChange={(e) => handleChange('confirmPassword', e.target.value)}
                        className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                      >
                        {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Campo de código admin si es admin */}
                {formData.rol === 'admin' && (
                  <div>
                    <Label htmlFor="codigoAdmin" className="text-white flex items-center">
                      <Shield className="h-4 w-4 mr-2 text-yellow-500" />
                      Código Único de Administrador *
                    </Label>
                    <Input
                      id="codigoAdmin"
                      type="text"
                      placeholder="Ingresa el código de administrador"
                      value={formData.codigoAdmin}
                      onChange={(e) => handleChange('codigoAdmin', e.target.value)}
                      className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                      required
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      Este código te será proporcionado por el administrador principal
                    </p>
                  </div>
                )}

                {/* Selección de plan y método de pago solo para usuarios */}
                {formData.rol === 'usuario' && (
                  <>
                    <Separator className="bg-gray-600" />
                    
                    {/* Planes */}
                    <div>
                      <Label className="text-white text-base font-medium">Selecciona tu Plan</Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                        {planes.map((plan) => (
                          <button
                            key={plan.id}
                            type="button"
                            onClick={() => handleChange('planId', plan.id)}
                            className={`p-4 border-2 rounded-lg text-left transition-all ${
                              formData.planId === plan.id 
                                ? 'border-red-600 bg-red-600/10' 
                                : 'border-gray-600 bg-gray-700/50 hover:border-gray-500'
                            }`}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <h3 className="text-white font-bold text-lg">{plan.nombre}</h3>
                              <Badge variant={plan.id === 2 ? "destructive" : "outline"} className="text-xs">
                                {plan.id === 2 ? "Popular" : "Básico"}
                              </Badge>
                            </div>
                            <p className="text-gray-300 text-sm mb-3">{plan.descripcion}</p>
                            <div className="flex justify-between items-center">
                              <span className="text-2xl font-bold text-white">
                                ${plan.precio}
                                <span className="text-sm text-gray-400">/mes</span>
                              </span>
                              <div className="text-right">
                                <p className="text-sm text-gray-400">Hasta</p>
                                <p className="text-lg font-bold text-red-400">{plan.max_peliculas} películas</p>
                              </div>
                            </div>
                            {formData.planId === plan.id && (
                              <div className="mt-3 flex items-center text-green-400">
                                <Check className="h-4 w-4 mr-2" />
                                <span className="text-sm">Plan seleccionado</span>
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Método de Pago */}
                    <div>
                      <Label className="text-white text-base font-medium">Método de Pago</Label>
                      <div className="grid grid-cols-2 gap-4 mt-2">
                        <button
                          type="button"
                          onClick={() => handleChange('metodoPago', 'stripe')}
                          className={`p-4 border-2 rounded-lg flex items-center justify-center space-x-2 transition-all ${
                            formData.metodoPago === 'stripe' 
                              ? 'border-red-600 bg-red-600/10' 
                              : 'border-gray-600 bg-gray-700/50 hover:border-gray-500'
                          }`}
                        >
                          <CreditCard className="h-5 w-5 text-white" />
                          <span className="text-white font-medium">Stripe</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleChange('metodoPago', 'paypal')}
                          className={`p-4 border-2 rounded-lg flex items-center justify-center space-x-2 transition-all ${
                            formData.metodoPago === 'paypal' 
                              ? 'border-red-600 bg-red-600/10' 
                              : 'border-gray-600 bg-gray-700/50 hover:border-gray-500'
                          }`}
                        >
                          <div className="w-5 h-5 bg-blue-600 rounded flex items-center justify-center">
                            <span className="text-white text-xs font-bold">PP</span>
                          </div>
                          <span className="text-white font-medium">PayPal</span>
                        </button>
                      </div>
                    </div>

                    {/* Resumen del plan seleccionado */}
                    {selectedPlan && (
                      <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-600">
                        <h4 className="text-white font-medium mb-2">Resumen de tu suscripción:</h4>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-300">Plan {selectedPlan.nombre}</span>
                          <span className="text-white font-bold">${selectedPlan.precio}/mes</span>
                        </div>
                        <p className="text-sm text-gray-400 mt-1">
                          Acceso a {selectedPlan.max_peliculas} películas por mes
                        </p>
                      </div>
                    )}
                  </>
                )}

                <Button
                  type="submit"
                  className="w-full bg-red-600 hover:bg-red-700 text-white py-3"
                  disabled={isLoading}
                >
                  {isLoading ? "Creando cuenta..." : 
                   formData.rol === 'admin' ? "Crear Cuenta de Administrador" : 
                   "Crear Cuenta y Continuar al Pago"}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="text-center">
              <p className="text-gray-400 text-sm">
                ¿Ya tienes cuenta?{" "}
                <Link href="/login" className="text-red-400 hover:text-red-300 font-medium">
                  Inicia sesión
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
