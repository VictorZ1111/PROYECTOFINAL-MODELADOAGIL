-- SCRIPT LIMPIO PARA COMPLETAR POLÍTICAS DE STORAGE
-- Basado en las políticas existentes que ya tienes:
-- ✅ Admins can upload images (INSERT)
-- ✅ Admins can upload videos (INSERT) 
-- ✅ Authenticated users can view videos (SELECT)
-- ✅ Everyone can view images (SELECT)

-- SOLO CREAR LAS POLÍTICAS QUE FALTAN PARA COMPLETAR EL SISTEMA

-- 1. POLÍTICA PARA QUE ADMINS PUEDAN ACTUALIZAR IMÁGENES
CREATE POLICY "Admins can update images"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'images' 
    AND auth.uid() IN (
        SELECT id FROM perfiles WHERE rol = 'admin'
    )
);

-- 2. POLÍTICA PARA QUE ADMINS PUEDAN ELIMINAR IMÁGENES
CREATE POLICY "Admins can delete images"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'images' 
    AND auth.uid() IN (
        SELECT id FROM perfiles WHERE rol = 'admin'
    )
);

-- 3. POLÍTICA PARA QUE ADMINS PUEDAN ACTUALIZAR VIDEOS
CREATE POLICY "Admins can update videos"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'videos' 
    AND auth.uid() IN (
        SELECT id FROM perfiles WHERE rol = 'admin'
    )
);

-- 4. POLÍTICA PARA QUE ADMINS PUEDAN ELIMINAR VIDEOS
CREATE POLICY "Admins can delete videos"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'videos' 
    AND auth.uid() IN (
        SELECT id FROM perfiles WHERE rol = 'admin'
    )
);

-- VERIFICACIÓN FINAL: Ver todas las políticas de Storage
SELECT 
    policyname,
    cmd,
    permissive,
    CASE 
        WHEN cmd = 'SELECT' THEN '👀 Ver'
        WHEN cmd = 'INSERT' THEN '📤 Subir'
        WHEN cmd = 'UPDATE' THEN '✏️ Editar'
        WHEN cmd = 'DELETE' THEN '🗑️ Eliminar'
    END as accion
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage'
ORDER BY 
    CASE 
        WHEN policyname LIKE '%images%' THEN 1 
        WHEN policyname LIKE '%videos%' THEN 2 
        ELSE 3 
    END,
    cmd;
