"use client"

import { useSearchParams } from "next/navigation"
import { Suspense } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import PaymentPlansSection from "@/components/payment-plans-section"

function PlanesPageContent() {
  const searchParams = useSearchParams()
  const isFromRegistration = searchParams.get('payment') === 'true'

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <Header />
      
      <section className="py-12">
        {isFromRegistration ? (
          <div className="container mx-auto px-4">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-white mb-4">🎉 ¡Cuenta Creada!</h1>
              <p className="text-gray-400 text-lg">Ahora completa tu suscripción para empezar a disfrutar</p>
              <div className="mt-4 p-3 bg-green-900/20 border border-green-500/30 rounded-lg inline-block">
                <p className="text-green-400 text-sm">✅ Tu cuenta ha sido creada exitosamente</p>
              </div>
            </div>
            <PaymentPlansSection />
          </div>
        ) : (
          <PaymentPlansSection />
        )}
      </section>

      <Footer />
    </div>
  )
}

export default function PlanesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Cargando...</div>
      </div>
    }>
      <PlanesPageContent />
    </Suspense>
  )
}
