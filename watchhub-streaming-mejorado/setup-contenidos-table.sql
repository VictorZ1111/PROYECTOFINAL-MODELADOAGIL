-- Script para verificar y corregir tabla contenidos
-- Ejecutar en Supabase SQL Editor

-- 1. Ver la estructura actual de la tabla contenidos
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'contenidos' 
ORDER BY ordinal_position;

-- 2. Si la tabla no existe, crearla con estructura correcta
CREATE TABLE IF NOT EXISTS contenidos (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  
  -- Información básica (usando nombres en español para coincidir con el código)
  titulo TEXT NOT NULL,
  descripcion TEXT,
  genero TEXT,
  año INTEGER,
  duracion TEXT,
  calificacion DECIMAL(3,1),
  
  -- URLs de archivos
  imagen_url TEXT,
  video_url TEXT,
  
  -- Opciones especiales
  trending BOOLEAN DEFAULT false,
  destacado BOOLEAN DEFAULT false,
  
  -- Campos adicionales para compatibilidad
  title TEXT GENERATED ALWAYS AS (titulo) STORED,
  description TEXT GENERATED ALWAYS AS (descripcion) STORED,
  year INTEGER GENERATED ALWAYS AS (año) STORED,
  rating DECIMAL(3,1) GENERATED ALWAYS AS (calificacion) STORED,
  genre TEXT GENERATED ALWAYS AS (genero) STORED,
  duration TEXT GENERATED ALWAYS AS (duracion) STORED,
  image_url TEXT GENERATED ALWAYS AS (imagen_url) STORED,
  featured BOOLEAN GENERATED ALWAYS AS (destacado) STORED,
  image TEXT GENERATED ALWAYS AS (imagen_url) STORED,
  type TEXT DEFAULT 'Película'
);

-- 3. Habilitar RLS en la tabla
ALTER TABLE contenidos ENABLE ROW LEVEL SECURITY;

-- 4. Eliminar políticas existentes si hay conflicto
DROP POLICY IF EXISTS "Allow authenticated users to insert contenidos" ON contenidos;
DROP POLICY IF EXISTS "Allow public to view contenidos" ON contenidos;
DROP POLICY IF EXISTS "Allow authenticated users to update contenidos" ON contenidos;
DROP POLICY IF EXISTS "Allow authenticated users to delete contenidos" ON contenidos;

-- 5. Crear políticas para la tabla contenidos
-- Permitir a usuarios autenticados insertar contenido
CREATE POLICY "Allow authenticated users to insert contenidos" 
ON contenidos 
FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- Permitir a todos ver el contenido
CREATE POLICY "Allow public to view contenidos" 
ON contenidos 
FOR SELECT 
TO public 
USING (true);

-- Permitir a usuarios autenticados actualizar contenido
CREATE POLICY "Allow authenticated users to update contenidos" 
ON contenidos 
FOR UPDATE 
TO authenticated 
USING (true);

-- Permitir a usuarios autenticados eliminar contenido
CREATE POLICY "Allow authenticated users to delete contenidos" 
ON contenidos 
FOR DELETE 
TO authenticated 
USING (true);

-- 6. Verificar que las políticas estén activas
SELECT schemaname, tablename, policyname, permissive, roles, cmd 
FROM pg_policies 
WHERE tablename = 'contenidos';

-- 7. Probar inserción de datos de prueba (comentado por seguridad)
/*
INSERT INTO contenidos (titulo, descripcion, genero, año, duracion, calificacion, trending, destacado)
VALUES ('Película de Prueba', 'Esta es una descripción de prueba', 'Acción', 2024, '120 min', 8.5, false, false);
*/
