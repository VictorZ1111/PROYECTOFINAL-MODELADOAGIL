"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuthProtection } from "@/hooks/use-auth-protection"
import { usePayment } from "@/hooks/use-payment"
import { AuthHeader } from "@/components/auth-header"
import { Footer } from "@/components/footer"
import PayPalPaymentButton from "@/components/paypal-payment-button"
import StripePaymentForm from "@/components/stripe-payment-form"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CreditCard, Shield, Check, ArrowLeft } from "lucide-react"
import { useToast } from "@/components/ui/toast-custom"

interface PaymentData {
  userId: string
  planId: number
  metodoPago: 'stripe' | 'paypal'
  plan: {
    id: number
    nombre: string
    precio: number
    max_peliculas: number
    descripcion: string
  }
}

function PagarPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, loading } = useAuthProtection()
  const { processPayPalPayment, processStripePayment } = usePayment()
  const { showToast, ToastContainer } = useToast()
  
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null)
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    // Verificar si hay datos de pago pendientes
    const pendingPayment = localStorage.getItem('pendingPayment')
    
    if (pendingPayment) {
      try {
        const data = JSON.parse(pendingPayment)
        setPaymentData(data)
      } catch (error) {
        console.error('Error parsing payment data:', error)
        router.push('/planes')
      }
    } else {
      // Si no hay datos pendientes, redirigir a planes
      router.push('/planes')
    }
  }, [router])

  const handlePaymentSuccess = async () => {
    // Limpiar datos de pago pendientes
    localStorage.removeItem('pendingPayment')
    
    showToast("¡Pago exitoso! Tu suscripción ha sido activada", "success")
    
    // Redirigir al dashboard
    setTimeout(() => {
      router.push('/')
    }, 2000)
  }

  const handlePaymentError = (error: string) => {
    showToast(`Error en el pago: ${error}`, "error")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Cargando...</div>
      </div>
    )
  }

  if (!paymentData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Cargando datos de pago...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <AuthHeader />
      <ToastContainer />

      <section className="py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">Completar Suscripción</h1>
            <p className="text-gray-400">Finaliza tu pago para activar tu plan</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Resumen del Plan */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                  Resumen de tu Plan
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-gray-700/30 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-xl font-bold text-white">{paymentData.plan.nombre}</h3>
                      <p className="text-gray-400 text-sm">{paymentData.plan.descripcion}</p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      Popular
                    </Badge>
                  </div>
                  
                  <div className="mt-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-300">Precio mensual:</span>
                      <span className="text-2xl font-bold text-white">
                        ${paymentData.plan.precio}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Películas incluidas:</span>
                      <span className="text-white font-medium">
                        {paymentData.plan.max_peliculas} películas/mes
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center text-green-400">
                    <Check className="h-4 w-4 mr-2" />
                    <span className="text-sm">Acceso inmediato</span>
                  </div>
                  <div className="flex items-center text-green-400">
                    <Check className="h-4 w-4 mr-2" />
                    <span className="text-sm">Calidad HD</span>
                  </div>
                  <div className="flex items-center text-green-400">
                    <Check className="h-4 w-4 mr-2" />
                    <span className="text-sm">Sin permanencia</span>
                  </div>
                  <div className="flex items-center text-green-400">
                    <Check className="h-4 w-4 mr-2" />
                    <span className="text-sm">Soporte 24/7</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Método de Pago */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <CreditCard className="h-5 w-5 text-blue-500 mr-2" />
                  Método de Pago
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Método seleccionado: {paymentData.metodoPago === 'stripe' ? 'Tarjeta de Crédito/Débito' : 'PayPal'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {paymentData.metodoPago === 'stripe' ? (
                  <StripePaymentForm
                    amount={paymentData.plan.precio}
                    planId={paymentData.plan.id}
                    onSuccess={handlePaymentSuccess}
                    onError={handlePaymentError}
                  />
                ) : (
                  <PayPalPaymentButton
                    amount={paymentData.plan.precio}
                    planId={paymentData.plan.id}
                    onSuccess={handlePaymentSuccess}
                    onError={handlePaymentError}
                  />
                )}
              </CardContent>
            </Card>
          </div>

          {/* Información de Seguridad */}
          <div className="mt-8 text-center">
            <div className="flex items-center justify-center text-gray-400 text-sm">
              <Shield className="h-4 w-4 mr-2" />
              <span>Tus datos están protegidos con cifrado SSL</span>
            </div>
          </div>

          {/* Botón de Volver */}
          <div className="mt-6 text-center">
            <Button
              variant="outline"
              onClick={() => router.push('/planes')}
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a Planes
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default function PagarPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Cargando...</div>
      </div>
    }>
      <PagarPageContent />
    </Suspense>
  )
}
