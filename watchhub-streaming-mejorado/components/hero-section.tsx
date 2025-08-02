import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Play } from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative py-32 px-4 text-center overflow-hidden min-h-[70vh] flex items-center">
      {/* Fondo con gif - aquí es donde debes agregar tu gif */}
      <div className="absolute inset-0">
        {/* Para agregar tu gif, cambia esta ruta por la de tu gif */}
        <div 
          className="w-full h-full bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('/FONDO.gif')"  // AQUÍ CAMBIA LA RUTA A TU GIF
          }}
        ></div>
        {/* Overlay para mejor legibilidad del texto */}
        <div className="absolute inset-0 bg-black/50"></div>
      </div>
      
      <div className="relative z-10 container mx-auto">
        <h2 className="text-6xl md:text-8xl font-bold text-white mb-8 leading-tight">
          Tu entretenimiento
          <span className="block text-red-500 mt-4">sin límites</span>
        </h2>
        <p className="text-2xl text-gray-200 mb-8 max-w-3xl mx-auto font-medium">
          ¡Sumérgete en un universo infinito de historias!
        </p>
        {/* Slogan adicional */}
        <p className="text-lg text-gray-300 max-w-2xl mx-auto italic">
          "Donde cada momento se convierte en una aventura extraordinaria"
        </p>
      </div>
    </section>
  )
}
