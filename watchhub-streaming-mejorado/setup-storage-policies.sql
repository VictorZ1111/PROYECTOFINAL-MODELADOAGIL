-- Script para configurar Storage Buckets y Políticas
-- Ejecutar en Supabase SQL Editor

-- 1. Crear buckets si no existen
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('images', 'images', true),
  ('videos', 'videos', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Políticas para bucket IMAGES
-- Eliminar políticas existentes si hay conflicto
DROP POLICY IF EXISTS "Allow authenticated users to upload images" ON storage.objects;
DROP POLICY IF EXISTS "Allow public to view images" ON storage.objects;

-- Crear nuevas políticas para images
CREATE POLICY "Allow authenticated users to upload images" 
ON storage.objects 
FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'images');

CREATE POLICY "Allow public to view images" 
ON storage.objects 
FOR SELECT 
TO public 
USING (bucket_id = 'images');

-- 3. Políticas para bucket VIDEOS
-- Eliminar políticas existentes si hay conflicto
DROP POLICY IF EXISTS "Allow authenticated users to upload videos" ON storage.objects;
DROP POLICY IF EXISTS "Allow public to view videos" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to update videos" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to delete videos" ON storage.objects;

-- Crear nuevas políticas para videos
CREATE POLICY "Allow authenticated users to upload videos" 
ON storage.objects 
FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'videos');

CREATE POLICY "Allow public to view videos" 
ON storage.objects 
FOR SELECT 
TO public 
USING (bucket_id = 'videos');

CREATE POLICY "Allow authenticated users to update videos" 
ON storage.objects 
FOR UPDATE 
TO authenticated 
USING (bucket_id = 'videos');

CREATE POLICY "Allow authenticated users to delete videos" 
ON storage.objects 
FOR DELETE 
TO authenticated 
USING (bucket_id = 'videos');

-- 4. Verificar que los buckets estén creados
SELECT * FROM storage.buckets WHERE id IN ('images', 'videos');

-- 5. Verificar que las políticas estén activas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'objects' AND schemaname = 'storage';
