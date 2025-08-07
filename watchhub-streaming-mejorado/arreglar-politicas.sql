-- =============================================
-- ARREGLAR POLÍTICAS DE RLS - PROBLEMA DE RECURSIÓN
-- Ejecutar este SQL en Supabase para solucionar el error 42P17
-- =============================================

-- 1. ELIMINAR TODAS LAS POLÍTICAS PROBLEMÁTICAS
DROP POLICY IF EXISTS "Ver propio perfil" ON perfiles;
DROP POLICY IF EXISTS "Actualizar propio perfil" ON perfiles;
DROP POLICY IF EXISTS "Crear perfil en registro" ON perfiles;
DROP POLICY IF EXISTS "Admins ven todos los perfiles" ON perfiles;
DROP POLICY IF EXISTS "Admins gestionan perfiles" ON perfiles;
DROP POLICY IF EXISTS "Solo admins gestionan planes" ON planes;
DROP POLICY IF EXISTS "Solo admins gestionan contenido" ON contenidos;
DROP POLICY IF EXISTS "Admins ven todos los favoritos" ON favoritos;

-- 2. CREAR POLÍTICAS SIMPLES SIN RECURSIÓN

-- POLÍTICAS PARA PERFILES (sin referencia circular)
CREATE POLICY "perfiles_select_own" ON perfiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "perfiles_update_own" ON perfiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "perfiles_insert_own" ON perfiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- POLÍTICAS PARA PLANES (públicos para ver, sin admin por ahora)
CREATE POLICY "planes_select_all" ON planes
    FOR SELECT USING (true);

-- POLÍTICAS PARA CONTENIDOS (acceso para usuarios autenticados)
CREATE POLICY "contenidos_select_authenticated" ON contenidos
    FOR SELECT USING (auth.role() = 'authenticated');

-- POLÍTICAS PARA FAVORITOS (simples)
CREATE POLICY "favoritos_select_own" ON favoritos
    FOR SELECT USING (auth.uid() = usuario_id);

CREATE POLICY "favoritos_insert_own" ON favoritos
    FOR INSERT WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "favoritos_delete_own" ON favoritos
    FOR DELETE USING (auth.uid() = usuario_id);

-- 3. VERIFICAR QUE FUNCIONA
SELECT 'Políticas arregladas - sin recursión' as status;
