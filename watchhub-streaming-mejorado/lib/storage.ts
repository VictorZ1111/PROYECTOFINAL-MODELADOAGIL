import { supabase } from './supabaseClient'

export interface UploadResult {
  success: boolean
  url?: string
  error?: string
}

// Subir imagen
export async function uploadImage(
  file: File, 
  movieTitle: string, 
  onProgress?: (progress: number) => void
): Promise<UploadResult> {
  try {
    // Crear nombre único del archivo
    const fileExt = file.name.split('.').pop()
    const fileName = `${movieTitle.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.${fileExt}`
    
    // Simular progreso si se proporciona callback
    if (onProgress) {
      onProgress(25)
    }
    
    // Subir archivo
    const { data, error } = await supabase.storage
      .from('images')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (onProgress) {
      onProgress(75)
    }

    if (error) {
      return { success: false, error: error.message }
    }

    // Obtener URL pública
    const { data: { publicUrl } } = supabase.storage
      .from('images')
      .getPublicUrl(fileName)

    if (onProgress) {
      onProgress(100)
    }

    return { success: true, url: publicUrl }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

// Subir video
export async function uploadVideo(
  file: File, 
  movieTitle: string, 
  onProgress?: (progress: number) => void
): Promise<UploadResult> {
  try {
    const fileExt = file.name.split('.').pop()
    const fileName = `${movieTitle.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.${fileExt}`
    
    if (onProgress) {
      onProgress(10)
    }
    
    const { data, error } = await supabase.storage
      .from('videos')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (onProgress) {
      onProgress(80)
    }

    if (error) {
      return { success: false, error: error.message }
    }

    const { data: { publicUrl } } = supabase.storage
      .from('videos')
      .getPublicUrl(fileName)

    if (onProgress) {
      onProgress(100)
    }

    return { success: true, url: publicUrl }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

// Eliminar archivo
export async function deleteFile(bucket: 'images' | 'videos', fileName: string): Promise<boolean> {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([fileName])

    return !error
  } catch (error) {
    return false
  }
}
