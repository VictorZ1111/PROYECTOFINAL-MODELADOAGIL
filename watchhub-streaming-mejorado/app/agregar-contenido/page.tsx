"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import { uploadImage, uploadVideo } from "@/lib/storage"
import { useToast } from "@/components/ui/toast-custom"
import { genres } from "@/lib/data"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Upload, Play, X } from "lucide-react"

export default function AgregarContenidoPage() {
  const [formData, setFormData] = useState({
    titulo: "",
    descripcion: "",
    genero: "",
    año: new Date().getFullYear(),
    duracion: "",
    calificacion: 5,
    imagen_url: "",
    video_url: "",
    trending: false,
    destacado: false
  })
  
  // Estados para archivos
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>("")
  const [uploadProgress, setUploadProgress] = useState({
    image: false,
    video: false
  })
  
  const [isLoading, setIsLoading] = useState(false)
  const { showToast, ToastContainer } = useToast()
  const router = useRouter()

  const handleChange = (field: string, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // Manejar selección de imagen
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB máximo
        showToast("La imagen no puede pesar más de 5MB", "error")
        return
      }
      setImageFile(file)
      const preview = URL.createObjectURL(file)
      setImagePreview(preview)
    }
  }

  // Manejar selección de video
  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 500 * 1024 * 1024) { // 500MB máximo
        showToast("El video no puede pesar más de 500MB", "error")
        return
      }
      setVideoFile(file)
    }
  }

  const validateForm = () => {
    if (!formData.titulo.trim()) {
      showToast("El título es obligatorio", "error")
      return false
    }
    if (!formData.descripcion.trim()) {
      showToast("La descripción es obligatoria", "error")
      return false
    }
    if (!formData.genero) {
      showToast("Debe seleccionar un género", "error")
      return false
    }
    if (!formData.duracion.trim()) {
      showToast("La duración es obligatoria", "error")
      return false
    }
    if (formData.calificacion < 1 || formData.calificacion > 10) {
      showToast("La calificación debe estar entre 1 y 10", "error")
      return false
    }
    if (!imageFile) {
      showToast("Debe seleccionar una imagen", "error")
      return false
    }
    if (!videoFile) {
      showToast("Debe seleccionar un video", "error")
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    if (!validateForm()) {
      setIsLoading(false)
      return
    }

    try {
      // Subir imagen
      setUploadProgress(prev => ({ ...prev, image: true }))
      const imageResult = await uploadImage(imageFile!, formData.titulo)
      
      if (!imageResult.success) {
        showToast(`Error al subir imagen: ${imageResult.error}`, "error")
        setIsLoading(false)
        return
      }

      // Subir video  
      setUploadProgress(prev => ({ ...prev, video: true }))
      const videoResult = await uploadVideo(videoFile!, formData.titulo)
      
      if (!videoResult.success) {
        showToast(`Error al subir video: ${videoResult.error}`, "error")
        setIsLoading(false)
        return
      }

      // Guardar en base de datos
      const { error } = await supabase
        .from('contenidos')
        .insert([{
          titulo: formData.titulo.trim(),
          descripcion: formData.descripcion.trim(),
          genero: formData.genero,
          año: formData.año,
          duracion: formData.duracion.trim(),
          calificacion: formData.calificacion,
          imagen_url: imageResult.url,
          video_url: videoResult.url,
          trending: formData.trending,
          destacado: formData.destacado
        }])

      if (error) {
        console.error("Error completo al agregar contenido:", error)
        console.error("Código de error:", error.code)
        console.error("Mensaje de error:", error.message)
        console.error("Detalles:", error.details)
        showToast(`Error al agregar contenido: ${error.message || 'Error desconocido'}`, "error")
      } else {
        showToast("¡Contenido agregado exitosamente!", "success")
        router.push("/admin")
      }
    } catch (err) {
      console.error("Error:", err)
      showToast("Error inesperado al agregar contenido", "error")
    } finally {
      setIsLoading(false)
      setUploadProgress({ image: false, video: false })
    }
  }

  // Filtrar géneros (quitar "Todos")
  const generosDisponibles = genres.filter(g => g !== "Todos")

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Header simplificado solo con logo y slogan */}
      <header className="bg-black/90 backdrop-blur-md border-b border-red-500/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <Play className="h-8 w-8 text-red-500" />
              <h1 className="text-2xl font-bold text-white">WatchHub</h1>
            </div>

            {/* Slogan */}
            <div className="text-white font-semibold text-lg">
              AGREGAR NUEVO CONTENIDO
            </div>
          </div>
        </div>
      </header>

      <ToastContainer />

      <section className="py-12 px-4">
        <div className="container mx-auto max-w-2xl">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => router.push("/admin")}
                  className="text-white hover:bg-gray-700"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                  <CardTitle className="text-2xl text-white flex items-center gap-2">
                    📽️ Agregar Nuevo Contenido
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Completa la información para agregar una nueva película
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Título */}
                <div>
                  <Label htmlFor="titulo" className="text-white text-base font-medium">
                    Título *
                  </Label>
                  <Input
                    id="titulo"
                    type="text"
                    placeholder="Nombre de la película"
                    value={formData.titulo}
                    onChange={(e) => handleChange('titulo', e.target.value)}
                    className="mt-2 bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Género */}
                  <div>
                    <Label className="text-white text-base font-medium">
                      Género *
                    </Label>
                    <Select value={formData.genero} onValueChange={(value) => handleChange('genero', value)}>
                      <SelectTrigger className="mt-2 bg-gray-700 border-gray-600 text-white">
                        <SelectValue placeholder="Selecciona un género" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-700 border-gray-600">
                        {generosDisponibles.map((genero) => (
                          <SelectItem 
                            key={genero} 
                            value={genero}
                            className="text-white hover:bg-gray-600"
                          >
                            {genero}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Año */}
                  <div>
                    <Label htmlFor="año" className="text-white text-base font-medium">
                      Año *
                    </Label>
                    <Input
                      id="año"
                      type="number"
                      min="1900"
                      max={new Date().getFullYear() + 5}
                      value={formData.año}
                      onChange={(e) => {
                        const value = e.target.value
                        if (value === '') {
                          handleChange('año', new Date().getFullYear()) // Año actual por defecto
                        } else {
                          const numValue = parseInt(value)
                          if (!isNaN(numValue)) {
                            handleChange('año', numValue)
                          }
                        }
                      }}
                      className="mt-2 bg-gray-700 border-gray-600 text-white"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Duración */}
                  <div>
                    <Label htmlFor="duracion" className="text-white text-base font-medium">
                      Duración *
                    </Label>
                    <Input
                      id="duracion"
                      type="text"
                      placeholder="120 min o 2h 30min"
                      value={formData.duracion}
                      onChange={(e) => handleChange('duracion', e.target.value)}
                      className="mt-2 bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
                      required
                    />
                  </div>

                  {/* Calificación */}
                  <div>
                    <Label htmlFor="calificacion" className="text-white text-base font-medium">
                      Calificación (1-10) *
                    </Label>
                    <Input
                      id="calificacion"
                      type="number"
                      min="1"
                      max="10"
                      step="0.1"
                      value={formData.calificacion}
                      onChange={(e) => {
                        const value = e.target.value
                        if (value === '') {
                          handleChange('calificacion', 1) // Valor por defecto si está vacío
                        } else {
                          const numValue = parseFloat(value)
                          if (!isNaN(numValue)) {
                            handleChange('calificacion', numValue)
                          }
                        }
                      }}
                      className="mt-2 bg-gray-700 border-gray-600 text-white"
                      required
                    />
                  </div>
                </div>

                {/* Descripción */}
                <div>
                  <Label htmlFor="descripcion" className="text-white text-base font-medium">
                    Descripción *
                  </Label>
                  <Textarea
                    id="descripcion"
                    placeholder="Descripción detallada del contenido..."
                    value={formData.descripcion}
                    onChange={(e) => handleChange('descripcion', e.target.value)}
                    className="mt-2 bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 min-h-[120px]"
                    required
                  />
                </div>

                {/* Subir Imagen */}
                <div>
                  <Label className="text-white text-base font-medium">
                    Imagen de la Película *
                  </Label>
                  <div className="mt-2 space-y-4">
                    <div className="flex items-center space-x-4">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageSelect}
                        className="hidden"
                        id="image-upload"
                      />
                      <label
                        htmlFor="image-upload"
                        className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded cursor-pointer transition-colors"
                      >
                        <Upload className="h-4 w-4" />
                        <span>Seleccionar Imagen</span>
                      </label>
                      {imageFile && (
                        <span className="text-green-400 text-sm">✓ {imageFile.name}</span>
                      )}
                    </div>
                    {imagePreview && (
                      <div className="relative inline-block">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="h-32 w-auto rounded border border-gray-600"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setImageFile(null)
                            setImagePreview("")
                          }}
                          className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Subir Video */}
                <div>
                  <Label className="text-white text-base font-medium">
                    Video de la Película *
                  </Label>
                  <div className="mt-2 space-y-4">
                    <div className="flex items-center space-x-4">
                      <input
                        type="file"
                        accept="video/*"
                        onChange={handleVideoSelect}
                        className="hidden"
                        id="video-upload"
                      />
                      <label
                        htmlFor="video-upload"
                        className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded cursor-pointer transition-colors"
                      >
                        <Play className="h-4 w-4" />
                        <span>Seleccionar Video</span>
                      </label>
                      {videoFile && (
                        <span className="text-green-400 text-sm">✓ {videoFile.name}</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400">
                      Formatos soportados: MP4, WebM, MOV. Máximo 500MB.
                    </p>
                  </div>
                </div>

                {/* Opciones especiales */}
                <div className="space-y-4">
                  <Label className="text-white text-base font-medium">Opciones Especiales</Label>
                  <div className="flex gap-6">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.trending}
                        onChange={(e) => handleChange('trending', e.target.checked)}
                        className="rounded bg-gray-700 border-gray-600"
                      />
                      <span className="text-white">🔥 Trending</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.destacado}
                        onChange={(e) => handleChange('destacado', e.target.checked)}
                        className="rounded bg-gray-700 border-gray-600"
                      />
                      <span className="text-white">⭐ Destacado</span>
                    </label>
                  </div>
                </div>

                {/* Botones de envío y cancelar */}
                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/admin")}
                    className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <span className="flex items-center space-x-2">
                        {uploadProgress.image && !uploadProgress.video && (
                          <>🖼️ Subiendo imagen...</>
                        )}
                        {uploadProgress.video && (
                          <>🎬 Subiendo video...</>
                        )}
                        {!uploadProgress.image && !uploadProgress.video && (
                          <>💾 Guardando...</>
                        )}
                      </span>
                    ) : (
                      "🎬 Agregar Contenido"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  )
}
