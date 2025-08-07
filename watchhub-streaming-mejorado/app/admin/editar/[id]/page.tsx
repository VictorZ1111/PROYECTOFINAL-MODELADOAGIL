"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Save, Trash2, Upload, X } from "lucide-react"
import { supabase } from "@/lib/supabaseClient"
import { uploadImage, uploadVideo } from "@/lib/storage"
import type { Content } from "@/types"

export default function EditarContenidoPage() {
  const params = useParams()
  const router = useRouter()
  const [content, setContent] = useState<Content | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  
  // Estados del formulario
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    genre: "",
    year: "",
    duration: "",
    rating: ""
  })
  
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

      setContent(data)
      setFormData({
        title: data.title || "",
        description: data.description || "",
        genre: data.genre || "",
        year: data.year?.toString() || "",
        duration: data.duration?.toString() || "",
        rating: data.rating?.toString() || ""
      })
      setImagePreview(data.image_url || "")
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
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
    setImagePreview(content?.image_url || "")
  }

  const removeVideo = () => {
    setNewVideo(null)
  }

  const handleSave = async () => {
    if (!content) return

    setSaving(true)
    try {
      let imageUrl = content.image_url
      let videoUrl = content.video_url

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
      const { error } = await supabase
        .from('contenidos')
        .update({
          title: formData.title,
          description: formData.description,
          genre: formData.genre,
          year: parseInt(formData.year) || null,
          duration: parseInt(formData.duration) || null,
          rating: parseFloat(formData.rating) || null,
          image_url: imageUrl,
          video_url: videoUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', content.id)

      if (error) {
        console.error('Error updating content:', error)
        alert('Error al actualizar el contenido')
        return
      }

      alert('Contenido actualizado exitosamente')
      router.push('/admin')
    } catch (error) {
      console.error('Error:', error)
      alert('Error al guardar los cambios')
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
        alert('Error al eliminar el contenido')
        return
      }

      alert('Contenido eliminado exitosamente')
      router.push('/admin')
    } catch (error) {
      console.error('Error:', error)
      alert('Error al eliminar el contenido')
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
      {/* Header */}
      <div className="bg-black/50 backdrop-blur-sm border-b border-gray-800 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/admin">
            <Button variant="ghost" className="text-white hover:text-red-600">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al panel admin
            </Button>
          </Link>
          <h1 className="text-xl font-bold">Editar Contenido</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Formulario de edición */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Información del contenido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title" className="text-white">Título</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="bg-gray-700 border-gray-600 text-white"
                  placeholder="Nombre de la película"
                />
              </div>

              <div>
                <Label htmlFor="description" className="text-white">Descripción</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="bg-gray-700 border-gray-600 text-white"
                  placeholder="Descripción de la película"
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="genre" className="text-white">Género</Label>
                  <Input
                    id="genre"
                    name="genre"
                    value={formData.genre}
                    onChange={handleInputChange}
                    className="bg-gray-700 border-gray-600 text-white"
                    placeholder="Acción, Drama, etc."
                  />
                </div>
                <div>
                  <Label htmlFor="year" className="text-white">Año</Label>
                  <Input
                    id="year"
                    name="year"
                    type="number"
                    value={formData.year}
                    onChange={handleInputChange}
                    className="bg-gray-700 border-gray-600 text-white"
                    placeholder="2024"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="duration" className="text-white">Duración (min)</Label>
                  <Input
                    id="duration"
                    name="duration"
                    type="number"
                    value={formData.duration}
                    onChange={handleInputChange}
                    className="bg-gray-700 border-gray-600 text-white"
                    placeholder="120"
                  />
                </div>
                <div>
                  <Label htmlFor="rating" className="text-white">Rating</Label>
                  <Input
                    id="rating"
                    name="rating"
                    type="number"
                    step="0.1"
                    value={formData.rating}
                    onChange={handleInputChange}
                    className="bg-gray-700 border-gray-600 text-white"
                    placeholder="8.5"
                  />
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
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                  {newImage && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={removeImage}
                      className="border-gray-600 text-gray-300"
                    >
                      <X className="h-4 w-4" />
                    </Button>
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
                  <Input
                    id="video"
                    type="file"
                    accept="video/*"
                    onChange={handleVideoChange}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                  {newVideo && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={removeVideo}
                      className="border-gray-600 text-gray-300"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                {newVideo && (
                  <p className="text-sm text-green-400 mt-1">
                    Nuevo video seleccionado: {newVideo.name}
                  </p>
                )}
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
              {content.video_url && (
                <div>
                  <Label className="text-white mb-2 block">Video actual</Label>
                  <video
                    src={content.video_url}
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
  )
}
