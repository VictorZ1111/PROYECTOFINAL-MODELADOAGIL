import { Play, Star, Heart } from "lucide-react"

export function FeaturesSection() {
  const features = [
    {
      icon: Play,
      title: "Calidad Premium",
      description: "Películas en alta definición para la mejor experiencia",
    },
    {
      icon: Star,
      title: "Contenido Exclusivo",
      description: "Acceso a los últimos estrenos y clásicos",
    },
    {
      icon: Heart,
      title: "Favoritos",
      description: "Guarda y organiza tus películas preferidas",
    },
  ]

  return (
    <section className="py-20 px-4">
      <div className="container mx-auto">
        <h2 className="text-4xl font-bold text-white text-center mb-12">La mejor experiencia cinematográfica</h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {features.map((feature, index) => (
            <div key={index} className="text-center">
              <div className="bg-red-600/20 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <feature.icon className="h-10 w-10 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
              <p className="text-gray-400">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
