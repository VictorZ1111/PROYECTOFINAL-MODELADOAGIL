-- ==================================================
-- SCRIPT DE DIAGNÓSTICO SIMPLIFICADO - WATCHHUB
-- Ejecutar en Supabase SQL Editor
-- ==================================================

-- 1. VER ESTRUCTURA COMPLETA DE LA TABLA CONTENIDOS
SELECT 
    column_name,
    data_type,
    character_maximum_length,
    is_nullable,
    column_default,
    ordinal_position
FROM information_schema.columns 
WHERE table_name = 'contenidos' 
ORDER BY ordinal_position;

-- 2. VER POLÍTICAS RLS DE LA TABLA CONTENIDOS
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'contenidos';

-- 3. VERIFICAR SI RLS ESTÁ HABILITADO EN CONTENIDOS
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'contenidos';

-- 4. VER DATOS EXISTENTES EN CONTENIDOS (primeras 3 filas)
SELECT 
    id,
    titulo,
    genero,
    año,
    created_at
FROM contenidos 
LIMIT 3;

-- 5. VERIFICAR USUARIO ACTUAL Y SUS PERMISOS
SELECT 
    auth.uid() as user_id,
    auth.role() as user_role;

-- 6. VER BUCKETS DE STORAGE
SELECT 
    id,
    name,
    public,
    created_at
FROM storage.buckets 
ORDER BY created_at;

-- 7. CONTAR ARCHIVOS EN STORAGE
SELECT 
    bucket_id,
    COUNT(*) as total_archivos
FROM storage.objects 
GROUP BY bucket_id;
