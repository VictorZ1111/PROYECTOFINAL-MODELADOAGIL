"use client"

import { useEffect, useState, Suspense } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, Save, Trash2, Upload, X, Play, TrendingUp, Star } from "lucide-react"
import { supabase } from "@/lib/supabaseClient"
import { uploadImage, uploadVideo } from "@/lib/storage"
import { genres } from "@/lib/data"
import type { Content } from "@/types"
import { useToast } from "@/components/ui/toast-custom"

function EditarContenidoPageContent() {
  const params = useParams()
  const router = useRouter()
  const { showToast, ToastContainer } = useToast()
  const [content, setContent] = useState<Content | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  
  // Estados del formulario
  const [formData, setFormData] = useState({
    titulo: "",
    descripcion: "",
    genero: "",
    año: "",
    duracion: "",
    calificacion: "",
    trending: false,
    destacado: false
  })

  // Estados para duración
  const [duracionHoras, setDuracionHoras] = useState("0")
  const [duracionMinutos, setDuracionMinutos] = useState("0")
  
  // Estados para archivos
  const [newImage, setNewImage] = useState<File | null>(null)
  const [newVideo, setNewVideo] = useState<File | null>(null)
  const [imageUploadProgress, setImageUploadProgress] = useState(0)
  const [videoUploadProgress, setVideoUploadProgress] = useState(0)
  const [imagePreview, setImagePreview] = useState<string>("")

  useEffect(() => {
    if (params.id) {
      fetchContent(params.id as string)
    }
  }, [params.id])

  const fetchContent = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('contenidos')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        console.error('Error fetching content:', error)
        return
      }

      console.log('Datos cargados desde BD:', data)
      setContent(data)
      
      // Convertir duración de minutos a horas y minutos
      const totalMinutos = parseInt(data.duracion) || 0
      const horas = Math.floor(totalMinutos / 60)
      const minutos = totalMinutos % 60
      
      setFormData({
        titulo: data.titulo || "",
        descripcion: data.descripcion || "",
        genero: data.genero || "",
        año: data.año?.toString() || "",
        duracion: data.duracion?.toString() || "",
        calificacion: data.calificacion?.toString() || "",
        trending: data.trending || false,
        destacado: data.destacado || false
      })
      
      setDuracionHoras(horas.toString())
      setDuracionMinutos(minutos.toString())
      setImagePreview(data.imagen_url || "")
      console.log('FormData después de cargar:', {
        titulo: data.titulo || "",
        descripcion: data.descripcion || "",
        genero: data.genero || "",
        año: data.año?.toString() || "",
        duracion: data.duracion?.toString() || "",
        calificacion: data.calificacion?.toString() || ""
      })
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleCheckboxChange = (name: 'trending' | 'destacado') => {
    setFormData(prev => ({
      ...prev,
      [name]: !prev[name]
    }))
  }

  const handleDuracionChange = (tipo: 'horas' | 'minutos', valor: string) => {
    if (tipo === 'horas') {
      setDuracionHoras(valor)
    } else {
      setDuracionMinutos(valor)
    }
    
    // Calcular duración total en minutos
    const horas = tipo === 'horas' ? parseInt(valor) || 0 : parseInt(duracionHoras) || 0
    const minutos = tipo === 'minutos' ? parseInt(valor) || 0 : parseInt(duracionMinutos) || 0
    const totalMinutos = (horas * 60) + minutos
    
    setFormData(prev => ({
      ...prev,
      duracion: totalMinutos.toString()
    }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setNewImage(file)
      // Crear preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setNewVideo(file)
    }
  }

  const removeImage = () => {
    setNewImage(null)
    setImagePreview((content as any)?.imagen_url || "")
  }

  const removeVideo = () => {
    setNewVideo(null)
  }

  const handleSave = async () => {
    if (!content) return

    setSaving(true)
    try {
      let imageUrl = (content as any).imagen_url
      let videoUrl = (content as any).video_url

      // Subir nueva imagen si existe
      if (newImage) {
        const uploadResult = await uploadImage(
          newImage, 
          `contenido-${content.id}-${Date.now()}`,
          (progress) => setImageUploadProgress(progress)
        )
        if (uploadResult.success && uploadResult.url) {
          imageUrl = uploadResult.url
        }
      }

      // Subir nuevo video si existe
      if (newVideo) {
        const uploadResult = await uploadVideo(
          newVideo,
          `video-${content.id}-${Date.now()}`,
          (progress) => setVideoUploadProgress(progress)
        )
        if (uploadResult.success && uploadResult.url) {
          videoUrl = uploadResult.url
        }
      }

      // Actualizar contenido en la base de datos
      console.log('Datos a actualizar:', {
        titulo: formData.titulo,
        descripcion: formData.descripcion,
        genero: formData.genero,
        año: parseInt(formData.año) || null,
        duracion: formData.duracion, // Mantener como string si así está en la DB
        calificacion: parseFloat(formData.calificacion) || null,
        trending: formData.trending,
        destacado: formData.destacado,
        imagen_url: imageUrl,
        video_url: videoUrl
      })

      const { error } = await supabase
        .from('contenidos')
        .update({
          titulo: formData.titulo,
          descripcion: formData.descripcion,
          genero: formData.genero,
          año: parseInt(formData.año) || null,
          duracion: formData.duracion, // Mantener como string
          calificacion: parseFloat(formData.calificacion) || null,
          trending: formData.trending,
          destacado: formData.destacado,
          imagen_url: imageUrl,
          video_url: videoUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', content.id)

      if (error) {
        console.error('Error updating content:', error)
        console.error('Error details:', error.message, error.details, error.hint)
        showToast(`Error al actualizar el contenido: ${error.message}`, 'error')
        return
      }

      console.log('Contenido actualizado con éxito')
      showToast('Contenido actualizado exitosamente', 'success')
      
      // Recargar los datos actualizados
      await fetchContent(content.id.toString())
      
      setTimeout(() => {
        router.push('/admin')
      }, 1500)
    } catch (error) {
      console.error('Error:', error)
      showToast('Error al guardar los cambios', 'error')
    } finally {
      setSaving(false)
      setImageUploadProgress(0)
      setVideoUploadProgress(0)
    }
  }

  const handleDelete = async () => {
    if (!content) return
    
    if (!confirm('¿Estás seguro de que quieres eliminar este contenido? Esta acción no se puede deshacer.')) {
      return
    }

    setDeleting(true)
    try {
      const { error } = await supabase
        .from('contenidos')
        .delete()
        .eq('id', content.id)

      if (error) {
        console.error('Error deleting content:', error)
        showToast('Error al eliminar el contenido', 'error')
        return
      }

      showToast('Contenido eliminado exitosamente', 'success')
      setTimeout(() => {
        router.push('/admin')
      }, 1500)
    } catch (error) {
      console.error('Error:', error)
      showToast('Error al eliminar el contenido', 'error')
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-xl">Cargando contenido...</p>
        </div>
      </div>
    )
  }

  if (!content) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-red-600 mb-4">Contenido no encontrado</h1>
          <Link href="/admin">
            <Button className="bg-red-600 hover:bg-red-700">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al panel admin
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header simplificado solo con logo */}
      <header className="bg-black/90 backdrop-blur-md border-b border-red-500/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-center items-center">
            {/* Logo centrado */}
            <div className="flex items-center space-x-2">
              <Play className="h-8 w-8 text-red-500" />
              <h1 className="text-2xl font-bold text-white">WatchHub</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Formulario de edición */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Información del contenido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="titulo" className="text-white">Título</Label>
                <Input
                  id="titulo"
                  name="titulo"
                  value={formData.titulo}
                  onChange={handleInputChange}
                  className="bg-gray-700 border-gray-600 text-white"
                  placeholder="Nombre de la película"
                />
              </div>

              <div>
                <Label htmlFor="descripcion" className="text-white">Sinopsis</Label>
                <Textarea
                  id="descripcion"
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleInputChange}
                  className="bg-gray-700 border-gray-600 text-white"
                  placeholder="Sinopsis de la película"
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="genero" className="text-white">Género</Label>
                  <select
                    id="genero"
                    name="genero"
                    value={formData.genero}
                    onChange={handleInputChange}
                    className="w-full bg-gray-700 border border-gray-600 text-white rounded-md px-3 py-2 mt-1"
                  >
                    <option value="">Seleccionar género</option>
                    {genres.filter(g => g !== "Todos").map(genre => (
                      <option key={genre} value={genre}>{genre}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="año" className="text-white">Año</Label>
                  <Input
                    id="año"
                    name="año"
                    type="number"
                    value={formData.año}
                    onChange={handleInputChange}
                    className="bg-gray-700 border-gray-600 text-white"
                    placeholder="2024"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="duracion" className="text-white">Duración</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    <div className="flex items-center space-x-1">
                      <select
                        value={duracionHoras}
                        onChange={(e) => handleDuracionChange('horas', e.target.value)}
                        className="bg-gray-700 border border-gray-600 text-white rounded-md px-2 py-2 w-16"
                      >
                        {Array.from({ length: 24 }, (_, i) => (
                          <option key={i} value={i}>{i}</option>
                        ))}
                      </select>
                      <span className="text-gray-400 text-sm">h</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <select
                        value={duracionMinutos}
                        onChange={(e) => handleDuracionChange('minutos', e.target.value)}
                        className="bg-gray-700 border border-gray-600 text-white rounded-md px-2 py-2 w-16"
                      >
                        {Array.from({ length: 60 }, (_, i) => (
                          <option key={i} value={i}>{i}</option>
                        ))}
                      </select>
                      <span className="text-gray-400 text-sm">min</span>
                    </div>
                  </div>
                </div>
                <div>
                  <Label htmlFor="calificacion" className="text-white">Rating (1-10)</Label>
                  <Input
                    id="calificacion"
                    name="calificacion"
                    type="number"
                    step="0.1"
                    min="1"
                    max="10"
                    value={formData.calificacion}
                    onChange={handleInputChange}
                    className="bg-gray-700 border-gray-600 text-white"
                    placeholder="8.5"
                  />
                </div>
              </div>

              {/* Campos de estado */}
              <div className="space-y-4">
                <Label className="text-white text-base font-medium">Estado del contenido</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3 p-3 bg-gray-700/50 rounded-lg border border-gray-600">
                    <Checkbox
                      id="trending"
                      checked={formData.trending}
                      onCheckedChange={() => handleCheckboxChange('trending')}
                      className="border-gray-400 data-[state=checked]:bg-orange-600 data-[state=checked]:border-orange-600"
                    />
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="h-4 w-4 text-orange-500" />
                      <Label htmlFor="trending" className="text-white text-sm cursor-pointer">
                        Tendencia
                      </Label>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-3 bg-gray-700/50 rounded-lg border border-gray-600">
                    <Checkbox
                      id="destacado"
                      checked={formData.destacado}
                      onCheckedChange={() => handleCheckboxChange('destacado')}
                      className="border-gray-400 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                    />
                    <div className="flex items-center space-x-2">
                      <Star className="h-4 w-4 text-purple-500" />
                      <Label htmlFor="destacado" className="text-white text-sm cursor-pointer">
                        Destacado
                      </Label>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Preview y archivos */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Archivos multimedia</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Preview de imagen */}
              <div>
                <Label className="text-white mb-2 block">Imagen actual</Label>
                <div className="relative">
                  <img
                    src={imagePreview || "/placeholder.jpg"}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-lg border border-gray-600"
                  />
                  {newImage && (
                    <Badge className="absolute top-2 right-2 bg-green-600">
                      Nueva imagen
                    </Badge>
                  )}
                </div>
              </div>

              {/* Cambiar imagen */}
              <div>
                <Label htmlFor="image" className="text-white">Nueva imagen</Label>
                <div className="flex items-center space-x-2">
                  <input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="image"
                    className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded cursor-pointer transition-colors"
                  >
                    <Upload className="h-4 w-4" />
                    <span>Seleccionar archivo</span>
                  </label>
                  {newImage && (
                    <>
                      <span className="text-green-400 text-sm">✓ {newImage.name}</span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={removeImage}
                        className="border-gray-600 text-gray-300"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
                {imageUploadProgress > 0 && (
                  <div className="mt-2">
                    <div className="bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full transition-all"
                        style={{ width: `${imageUploadProgress}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-400 mt-1">Subiendo imagen: {imageUploadProgress}%</p>
                  </div>
                )}
              </div>

              {/* Cambiar video */}
              <div>
                <Label htmlFor="video" className="text-white">Nuevo video</Label>
                <div className="flex items-center space-x-2">
                  <input
                    id="video"
                    type="file"
                    accept="video/*"
                    onChange={handleVideoChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="video"
                    className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded cursor-pointer transition-colors"
                  >
                    <Play className="h-4 w-4" />
                    <span>Seleccionar archivo</span>
                  </label>
                  {newVideo && (
                    <>
                      <span className="text-green-400 text-sm">✓ {newVideo.name}</span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={removeVideo}
                        className="border-gray-600 text-gray-300"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
                {videoUploadProgress > 0 && (
                  <div className="mt-2">
                    <div className="bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${videoUploadProgress}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-400 mt-1">Subiendo video: {videoUploadProgress}%</p>
                  </div>
                )}
              </div>

              {/* Video actual */}
              {(content as any).video_url && (
                <div>
                  <Label className="text-white mb-2 block">Video actual</Label>
                  <video
                    src={(content as any).video_url}
                    controls
                    className="w-full h-32 bg-gray-900 rounded border border-gray-600"
                  >
                    Tu navegador no soporta video.
                  </video>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Botones de acción */}
        <div className="flex justify-between mt-8">
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleting}
            className="bg-red-600 hover:bg-red-700"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {deleting ? "Eliminando..." : "Eliminar contenido"}
          </Button>

          <div className="flex space-x-4">
            <Button
              variant="outline"
              onClick={() => router.push('/admin')}
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-green-600 hover:bg-green-700"
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? "Guardando..." : "Guardar cambios"}
            </Button>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  )
}

export default function EditarContenidoPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-white text-xl">Cargando editor...</div>
      </div>
    }>
      <EditarContenidoPageContent />
    </Suspense>
  )
}
