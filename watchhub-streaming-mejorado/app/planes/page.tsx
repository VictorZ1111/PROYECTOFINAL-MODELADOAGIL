"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { PlanCard } from "@/components/plan-card"
import { usePlanes } from "@/hooks/use-planes"

export default function PlanesPage() {
  const { planes, loading: planesLoading, error } = usePlanes()

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <Header />

      <section className="py-20 px-4">
        <div className="container mx-auto">
          <h1 className="text-5xl font-bold text-white text-center mb-4">Planes Especiales</h1>
          <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
            ¡Elige el plan perfecto para ti!
          </p>

          {planesLoading ? (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">Cargando planes...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-400 text-lg">Error al cargar planes: {error}</p>
            </div>
          ) : planes.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">No hay planes disponibles</p>
            </div>
          ) : (
            <div className="flex justify-center w-full">
              <div className="flex flex-wrap justify-center gap-8 max-w-4xl">
                {planes.map((plan, index) => (
                  <div key={plan.id} className="w-full max-w-sm">
                    <PlanCard 
                      plan={plan} 
                      popular={false} // Todos iguales, sin "más popular"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Additional Benefits */}
          <div className="mt-16 bg-gray-800/30 rounded-lg p-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-white text-center mb-6">¡Todos los planes incluyen!</h3>
            <div className="flex justify-center items-center gap-12">
              <div className="text-gray-300 text-center">
                <div className="text-3xl mb-2">🎬</div>
                <p>Catálogo</p>
              </div>
              <div className="text-gray-300 text-center">
                <div className="text-3xl mb-2">🎭</div>
                <p>Contenido de calidad</p>
              </div>
            </div>
            <div className="text-center mt-6">
              <p className="text-lg text-red-400 font-semibold">¡Entretenimiento sin límites!</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
