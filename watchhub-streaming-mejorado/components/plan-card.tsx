import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, Zap } from "lucide-react"
import type { Plan } from "@/types"

interface PlanCardProps {
  plan: Plan
}

export function PlanCard({ plan }: PlanCardProps) {
  return (
    <Card
      className={`relative bg-gray-800/50 border-gray-700 hover:border-red-500/50 transition-all duration-300 hover:scale-105 ${
        plan.popular ? "border-red-500 shadow-red-500/20 shadow-lg scale-105" : ""
      }`}
    >
      {plan.popular && (
        <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-red-600 text-white">
          <Zap className="h-3 w-3 mr-1" />
          Más Popular
        </Badge>
      )}

      {plan.discount && <Badge className="absolute -top-3 right-4 bg-green-600 text-white">-{plan.discount}%</Badge>}

      <CardHeader className="text-center">
        <CardTitle className="text-2xl text-white">{plan.name}</CardTitle>
        <CardDescription className="text-gray-400">
          {plan.screens} pantalla{plan.screens > 1 ? "s" : ""} | {plan.quality}
        </CardDescription>

        <div className="mt-4">
          {plan.originalPrice && <div className="text-lg text-gray-500 line-through">{plan.originalPrice}/mes</div>}
          <div className="text-4xl font-bold text-red-500">
            {plan.price}
            <span className="text-lg text-gray-400 font-normal">/mes</span>
          </div>
          {plan.discount && (
            <div className="text-sm text-green-400 font-medium">Ahorra {plan.discount}% por tiempo limitado</div>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <ul className="space-y-3">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-center text-gray-300">
              <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
              {feature}
            </li>
          ))}
        </ul>
      </CardContent>

      <CardFooter>
        <Button
          className={`w-full ${
            plan.popular ? "bg-red-600 hover:bg-red-700 shadow-lg" : "bg-gray-700 hover:bg-gray-600"
          } text-white transition-all duration-300`}
        >
          {plan.popular ? "Comenzar Ahora" : "Seleccionar Plan"}
        </Button>
      </CardFooter>
    </Card>
  )
}
