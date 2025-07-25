import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { PlanCard } from "@/components/plan-card"
import { plans } from "@/lib/data"

export default function PlanesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <Header />

      <section className="py-20 px-4">
        <div className="container mx-auto">
          <h1 className="text-5xl font-bold text-white text-center mb-4">Planes de Suscripción</h1>
          <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
            Elige el plan perfecto para ti. Todos incluyen acceso completo sin anuncios y puedes cancelar cuando
            quieras.
          </p>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => (
              <PlanCard key={index} plan={plan} />
            ))}
          </div>

          {/* Additional Benefits */}
          <div className="mt-16 bg-gray-800/30 rounded-lg p-8">
            <h3 className="text-2xl font-bold text-white text-center mb-6">Todos los planes incluyen:</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 text-center">
              <div className="text-gray-300">
                <div className="text-3xl mb-2">🎬</div>
                <p>Catálogo completo</p>
              </div>
              <div className="text-gray-300">
                <div className="text-3xl mb-2">📱</div>
                <p>Todos los dispositivos</p>
              </div>
              <div className="text-gray-300">
                <div className="text-3xl mb-2">🚫</div>
                <p>Sin anuncios</p>
              </div>
              <div className="text-gray-300">
                <div className="text-3xl mb-2">❌</div>
                <p>Cancela cuando quieras</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
