import Link from "next/link"
import { Play } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-black border-t border-gray-800 py-8 px-4">
      <div className="container mx-auto text-center">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <Play className="h-6 w-6 text-red-500" />
          <span className="text-xl font-bold text-white">WatchHub</span>
        </div>
        <p className="text-gray-400 text-sm">© 2025 WatchHub Streaming. Todos los derechos reservados.</p>
        <div className="flex justify-center space-x-6 mt-4 text-sm text-gray-400">
          <Link href="/terminos" className="hover:text-red-400 transition-colors">
            Términos de Servicio
          </Link>
          <Link href="/privacidad" className="hover:text-red-400 transition-colors">
            Política de Privacidad
          </Link>
          <Link href="/soporte" className="hover:text-red-400 transition-colors">
            Soporte
          </Link>
        </div>
      </div>
    </footer>
  )
}
