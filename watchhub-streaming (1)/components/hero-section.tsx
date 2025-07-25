import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Play } from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative py-20 px-4 text-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 to-purple-600/20"></div>
      <div className="relative z-10 container mx-auto">
        <h2 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
          Tu entretenimiento
          <span className="block text-red-500">sin límites</span>
        </h2>
        <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
          Miles de películas, series y documentales en alta calidad. Disfruta donde quieras, cuando quieras.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link href="/planes">
            <Button size="lg" className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 text-lg">
              <Play className="mr-2 h-5 w-5" />
              Comenzar Gratis
            </Button>
          </Link>
          <Link href="/planes">
            <Button
              variant="outline"
              size="lg"
              className="border-white text-white hover:bg-white hover:text-black px-8 py-3 text-lg bg-transparent"
            >
              Ver Planes
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
