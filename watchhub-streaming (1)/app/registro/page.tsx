"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"

export default function RegistroPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Registro:", formData)
    // Aquí iría la lógica de registro
  }

  const handleChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <Header />

      <section className="py-20 px-4">
        <div className="container mx-auto max-w-md">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl text-white">Crear Cuenta</CardTitle>
              <CardDescription className="text-gray-400">
                Únete a WatchHub y disfruta de contenido ilimitado
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name" className="text-white">
                    Nombre Completo
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Tu nombre"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email" className="text-white">
                    Correo Electrónico
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="correo@ejemplo.com"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="password" className="text-white">
                    Contraseña
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Mínimo 8 caracteres"
                    value={formData.password}
                    onChange={(e) => handleChange("password", e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="confirmPassword" className="text-white">
                    Confirmar Contraseña
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Repite tu contraseña"
                    value={formData.confirmPassword}
                    onChange={(e) => handleChange("confirmPassword", e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    required
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="terms"
                    checked={formData.acceptTerms}
                    onCheckedChange={(checked) => handleChange("acceptTerms", checked as boolean)}
                  />
                  <Label htmlFor="terms" className="text-sm text-gray-400">
                    Acepto los{" "}
                    <Link href="/terminos" className="text-red-400 hover:text-red-300">
                      términos y condiciones
                    </Link>
                  </Label>
                </div>
                <Button
                  type="submit"
                  className="w-full bg-red-600 hover:bg-red-700 text-white"
                  disabled={!formData.acceptTerms}
                >
                  Crear Cuenta
                </Button>
              </form>
            </CardContent>
          </Card>

          <p className="text-center text-gray-400 text-sm mt-6">
            ¿Ya tienes cuenta?{" "}
            <Link href="/login" className="text-red-400 hover:text-red-300 font-medium">
              Inicia sesión
            </Link>
          </p>
        </div>
      </section>

      <Footer />
    </div>
  )
}
