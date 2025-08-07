-- =============================================
-- VERIFICAR POR QUE NO FUNCIONA EL LOGIN
-- =============================================

-- 1. Verificar que el usuario existe
SELECT 'Usuario albertgz:' as info, id, nombre_usuario, email, rol 
FROM perfiles 
WHERE nombre_usuario = 'albertgz';

-- 2. Verificar políticas activas
SELECT 'Políticas en perfiles:' as info, schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'perfiles';

-- 3. Probar consulta sin RLS (como admin)
SET ROLE postgres;
SELECT 'Sin RLS:' as info, nombre_usuario, email FROM perfiles WHERE nombre_usuario = 'albertgz';
RESET ROLE;

-- 4. Verificar si hay conflictos con mayúsculas
SELECT 'Búsqueda case insensitive:' as info, nombre_usuario, email 
FROM perfiles 
WHERE LOWER(nombre_usuario) = 'albertgz';
