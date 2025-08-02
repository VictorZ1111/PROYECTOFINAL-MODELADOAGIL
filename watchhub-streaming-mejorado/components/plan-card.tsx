import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, Zap, Film } from "lucide-react"

interface PlanCardProps {
  plan: {
    id: number
    nombre: string
    precio: number
    max_peliculas: number
    descripcion: string
  }
  popular?: boolean
}

export function PlanCard({ plan, popular = false }: PlanCardProps) {
  return (
    <Card
      className={`relative bg-gray-800/50 border-gray-700 hover:border-red-500/50 transition-all duration-300 hover:scale-105 
        w-full h-full min-h-[400px] flex flex-col`}
    >
      <CardHeader className="text-center flex-grow-0">
        <CardTitle className="text-2xl text-white">{plan.nombre}</CardTitle>
        <CardDescription className="text-gray-400">
          <div className="flex items-center justify-center gap-2">
            <Film className="h-4 w-4" />
            {plan.max_peliculas === 0 ? "Ilimitadas" : plan.max_peliculas} películas
          </div>
        </CardDescription>

        <div className="mt-4">
          <div className="text-4xl font-bold text-red-500">
            ${plan.precio}
            <span className="text-lg text-gray-400 font-normal">/mes</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-grow">
        <div className="text-gray-300 text-center mb-4">
          {plan.descripcion}
        </div>
        
        <ul className="space-y-3">
          <li className="flex items-center text-gray-300">
            <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
            {plan.max_peliculas === 0 ? "Acceso ilimitado" : `Hasta ${plan.max_peliculas} películas`}
          </li>
          <li className="flex items-center text-gray-300">
            <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
            Calidad HD
          </li>
        </ul>
      </CardContent>

      <CardFooter className="mt-auto">
        <Button
          className="w-full bg-gray-700 hover:bg-gray-600 text-white transition-colors"
        >
          Seleccionar Plan
        </Button>
      </CardFooter>
    </Card>
  )
}
