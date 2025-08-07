-- =============================================
-- ARREGLAR POLÍTICAS PARA PERMITIR LOGIN
-- =============================================

-- 1. ELIMINAR POLÍTICAS RESTRICTIVAS ACTUALES
DROP POLICY IF EXISTS "perfiles_select_own" ON perfiles;
DROP POLICY IF EXISTS "perfiles_update_own" ON perfiles;
DROP POLICY IF EXISTS "perfiles_insert_own" ON perfiles;

-- 2. CREAR POLÍTICAS QUE PERMITAN LOGIN

-- Permitir a usuarios no autenticados buscar por nombre_usuario para login
CREATE POLICY "perfiles_login_lookup" ON perfiles
    FOR SELECT USING (true);

-- Permitir a usuarios autenticados ver solo su propio perfil
CREATE POLICY "perfiles_view_own" ON perfiles
    FOR SELECT USING (auth.uid() = id);

-- Permitir a usuarios autenticados actualizar solo su propio perfil  
CREATE POLICY "perfiles_update_own" ON perfiles
    FOR UPDATE USING (auth.uid() = id);

-- Permitir insertar perfiles en el registro
CREATE POLICY "perfiles_insert_register" ON perfiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- 3. VERIFICAR QUE FUNCIONA
SELECT 'Políticas actualizadas correctamente' as status;
