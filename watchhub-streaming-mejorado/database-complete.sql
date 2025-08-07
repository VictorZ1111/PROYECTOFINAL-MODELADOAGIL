-- =============================================
-- SQL COMPLETO PARA WATCHHUB STREAMING
-- Ejecutar en Supabase SQL Editor
-- =============================================

-- CREAR TABLAS
-- =============================================

-- 1. TABLA PLANES
CREATE TABLE IF NOT EXISTS planes (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    precio DECIMAL(10,2) NOT NULL,
    max_peliculas INTEGER NOT NULL,
    descripcion TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. TABLA PERFILES
CREATE TABLE IF NOT EXISTS perfiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    nombre VARCHAR(100) NOT NULL,
    nombre_usuario VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255),
    rol VARCHAR(20) DEFAULT 'usuario' CHECK (rol IN ('usuario', 'admin')),
    plan_id INTEGER REFERENCES planes(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. TABLA CONTENIDOS
CREATE TABLE IF NOT EXISTS contenidos (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(200) NOT NULL,
    descripcion TEXT,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('movie', 'series')),
    genero VARCHAR(50),
    año INTEGER,
    duracion VARCHAR(50),
    imagen_url TEXT,
    calificacion DECIMAL(3,1),
    trending BOOLEAN DEFAULT false,
    destacado BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. TABLA FAVORITOS
CREATE TABLE IF NOT EXISTS favoritos (
    id SERIAL PRIMARY KEY,
    usuario_id UUID REFERENCES perfiles(id) ON DELETE CASCADE,
    contenido_id INTEGER REFERENCES contenidos(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(usuario_id, contenido_id)
);

-- POLÍTICAS DE SEGURIDAD
-- =============================================

-- Habilitar RLS en todas las tablas
ALTER TABLE planes ENABLE ROW LEVEL SECURITY;
ALTER TABLE perfiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE contenidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE favoritos ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS PARA PLANES
DROP POLICY IF EXISTS "Usuarios pueden ver planes" ON planes;
DROP POLICY IF EXISTS "Solo admins gestionan planes" ON planes;

CREATE POLICY "Usuarios pueden ver planes" ON planes
    FOR SELECT USING (true);

CREATE POLICY "Solo admins gestionan planes" ON planes
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM perfiles 
            WHERE perfiles.id = auth.uid() 
            AND perfiles.rol = 'admin'
        )
    );

-- POLÍTICAS PARA PERFILES
DROP POLICY IF EXISTS "Ver propio perfil" ON perfiles;
DROP POLICY IF EXISTS "Actualizar propio perfil" ON perfiles;
DROP POLICY IF EXISTS "Crear perfil en registro" ON perfiles;
DROP POLICY IF EXISTS "Admins ven todos los perfiles" ON perfiles;
DROP POLICY IF EXISTS "Admins gestionan perfiles" ON perfiles;

CREATE POLICY "Ver propio perfil" ON perfiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Actualizar propio perfil" ON perfiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Crear perfil en registro" ON perfiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins ven todos los perfiles" ON perfiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM perfiles p2 
            WHERE p2.id = auth.uid() 
            AND p2.rol = 'admin'
        )
    );

CREATE POLICY "Admins gestionan perfiles" ON perfiles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM perfiles p2 
            WHERE p2.id = auth.uid() 
            AND p2.rol = 'admin'
        )
    );

-- POLÍTICAS PARA CONTENIDOS
DROP POLICY IF EXISTS "Usuarios ven contenido" ON contenidos;
DROP POLICY IF EXISTS "Solo admins gestionan contenido" ON contenidos;

CREATE POLICY "Usuarios ven contenido" ON contenidos
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Solo admins gestionan contenido" ON contenidos
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM perfiles 
            WHERE perfiles.id = auth.uid() 
            AND perfiles.rol = 'admin'
        )
    );

-- POLÍTICAS PARA FAVORITOS
DROP POLICY IF EXISTS "Ver propios favoritos" ON favoritos;
DROP POLICY IF EXISTS "Agregar propios favoritos" ON favoritos;
DROP POLICY IF EXISTS "Eliminar propios favoritos" ON favoritos;
DROP POLICY IF EXISTS "Admins ven todos los favoritos" ON favoritos;

CREATE POLICY "Ver propios favoritos" ON favoritos
    FOR SELECT USING (auth.uid() = usuario_id);

CREATE POLICY "Agregar propios favoritos" ON favoritos
    FOR INSERT WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Eliminar propios favoritos" ON favoritos
    FOR DELETE USING (auth.uid() = usuario_id);

CREATE POLICY "Admins ven todos los favoritos" ON favoritos
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM perfiles 
            WHERE perfiles.id = auth.uid() 
            AND perfiles.rol = 'admin'
        )
    );

-- VERIFICACIÓN FINAL
SELECT 'Database setup completed successfully!' as status;

-- =============================================
-- 4. POLÍTICAS COMPLETAS DE SEGURIDAD - PLANES
-- =============================================
-- Eliminar políticas existentes si las hay
DROP POLICY IF EXISTS "Planes visibles para todos" ON planes;
DROP POLICY IF EXISTS "Solo admins pueden gestionar planes" ON planes;

-- Crear políticas para planes
CREATE POLICY "Planes visibles para todos" ON planes
    FOR SELECT USING (activo = true);

CREATE POLICY "Solo admins pueden gestionar planes" ON planes
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM perfiles 
            WHERE perfiles.id = auth.uid() 
            AND perfiles.rol = 'admin'
        )
    );

-- =============================================
-- 5. POLÍTICAS COMPLETAS DE SEGURIDAD - PERFILES
-- =============================================
-- Eliminar políticas existentes
DROP POLICY IF EXISTS "Usuarios pueden ver su propio perfil" ON perfiles;
DROP POLICY IF EXISTS "Usuarios pueden actualizar su propio perfil" ON perfiles;
DROP POLICY IF EXISTS "Cualquiera puede crear perfil" ON perfiles;
DROP POLICY IF EXISTS "Admins pueden ver todos los perfiles" ON perfiles;

-- Crear políticas para perfiles
CREATE POLICY "Usuarios pueden ver su propio perfil" ON perfiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Usuarios pueden actualizar su propio perfil" ON perfiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Cualquiera puede crear perfil" ON perfiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins pueden ver todos los perfiles" ON perfiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM perfiles p2 
            WHERE p2.id = auth.uid() 
            AND p2.rol = 'admin'
        )
    );

-- =============================================
-- 6. POLÍTICAS COMPLETAS DE SEGURIDAD - CONTENIDOS
-- =============================================
-- Eliminar políticas existentes
DROP POLICY IF EXISTS "Contenidos visibles para todos" ON contenidos;
DROP POLICY IF EXISTS "Contenidos visibles para usuarios autenticados" ON contenidos;
DROP POLICY IF EXISTS "Solo admins pueden gestionar contenidos" ON contenidos;

-- Crear políticas para contenidos
CREATE POLICY "Contenidos visibles para usuarios autenticados" ON contenidos
    FOR SELECT USING (auth.role() = 'authenticated' AND activo = true);

CREATE POLICY "Solo admins pueden gestionar contenidos" ON contenidos
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM perfiles 
            WHERE perfiles.id = auth.uid() 
            AND perfiles.rol = 'admin'
        )
    );

-- =============================================
-- 7. POLÍTICAS COMPLETAS DE SEGURIDAD - FAVORITOS
-- =============================================
-- Eliminar políticas existentes
DROP POLICY IF EXISTS "Ver propios favoritos" ON favoritos;
DROP POLICY IF EXISTS "Usuarios pueden ver sus propios favoritos" ON favoritos;
DROP POLICY IF EXISTS "Agregar favoritos" ON favoritos;
DROP POLICY IF EXISTS "Usuarios pueden agregar sus propios favoritos" ON favoritos;
DROP POLICY IF EXISTS "Eliminar favoritos" ON favoritos;
DROP POLICY IF EXISTS "Usuarios pueden eliminar sus propios favoritos" ON favoritos;

-- Crear políticas para favoritos
CREATE POLICY "Usuarios pueden ver sus propios favoritos" ON favoritos
    FOR SELECT USING (auth.uid() = usuario_id);

CREATE POLICY "Usuarios pueden agregar sus propios favoritos" ON favoritos
    FOR INSERT WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Usuarios pueden eliminar sus propios favoritos" ON favoritos
    FOR DELETE USING (auth.uid() = usuario_id);

-- =============================================
-- 8. ACTUALIZAR CONTENIDOS EXISTENTES CON TRENDING/DESTACADO
-- =============================================
-- Solo actualizar si los registros existen
UPDATE contenidos SET 
    trending = true, 
    destacado = true,
    titulo = 'Acción Extrema',
    descripcion = 'Una película llena de adrenalina con efectos especiales impresionantes y secuencias de acción épicas.',
    tipo = 'movie',
    genero = 'Acción',
    año = 2024,
    duracion = '2h 15min',
    imagen_url = '/images/accion-extrema.png',
    calificacion = 4.8
WHERE id = 1;

UPDATE contenidos SET 
    trending = false, 
    destacado = true,
    titulo = 'Misterios Urbanos',
    descripcion = 'Una serie de suspenso que te mantendrá al borde del asiento con cada episodio.',
    tipo = 'series',
    genero = 'Thriller',
    año = 2024,
    duracion = '3 temporadas',
    imagen_url = '/images/misterios-urbanos.png',
    calificacion = 4.6
WHERE id = 2;

UPDATE contenidos SET 
    trending = true, 
    destacado = true,
    titulo = 'Naturaleza Salvaje',
    descripcion = 'Explora los rincones más remotos de nuestro planeta con imágenes espectaculares.',
    tipo = 'movie',
    genero = 'Naturaleza',
    año = 2024,
    duracion = '1h 45min',
    imagen_url = '/images/naturaleza-salvaje.png',
    calificacion = 4.9
WHERE id = 3;

UPDATE contenidos SET 
    trending = true, 
    destacado = false,
    titulo = 'Comedia Central',
    descripcion = 'Risas garantizadas con esta divertida serie familiar llena de momentos memorables.',
    tipo = 'series',
    genero = 'Comedia',
    año = 2024,
    duracion = '2 temporadas',
    imagen_url = '/images/comedia-central.png',
    calificacion = 4.4
WHERE id = 4;

UPDATE contenidos SET 
    trending = false, 
    destacado = true,
    titulo = 'Ciencia Ficción',
    descripcion = 'Un viaje épico a través del espacio y el tiempo con tecnología futurista.',
    tipo = 'movie',
    genero = 'Sci-Fi',
    año = 2024,
    duracion = '2h 30min',
    imagen_url = '/images/ciencia-ficcion.png',
    calificacion = 4.7
WHERE id = 5;

UPDATE contenidos SET 
    trending = false, 
    destacado = false,
    titulo = 'Drama Histórico',
    descripcion = 'Una emotiva historia basada en hechos reales que marcaron la historia.',
    tipo = 'series',
    genero = 'Drama',
    año = 2024,
    duracion = '1 temporada',
    imagen_url = '/images/drama-historico.png',
    calificacion = 4.5
WHERE id = 6;

UPDATE contenidos SET 
    trending = true, 
    destacado = false,
    titulo = 'Terror Nocturno',
    descripcion = 'Una película de terror psicológico que te quitará el sueño por semanas.',
    tipo = 'movie',
    genero = 'Terror',
    año = 2023,
    duracion = '1h 55min',
    imagen_url = '/images/terror-nocturno.png',
    calificacion = 4.3
WHERE id = 7;

UPDATE contenidos SET 
    trending = false, 
    destacado = false,
    titulo = 'Romance Eterno',
    descripcion = 'Una hermosa historia de amor que trasciende el tiempo y las adversidades.',
    tipo = 'movie',
    genero = 'Romance',
    año = 2024,
    duracion = '2h 05min',
    imagen_url = '/images/romance-eterno.png',
    calificacion = 4.5
WHERE id = 8;

-- =============================================
-- 9. INSERTAR CONTENIDOS SOLO SI NO EXISTEN
-- =============================================
INSERT INTO contenidos (id, titulo, descripcion, tipo, genero, año, duracion, imagen_url, calificacion, trending, destacado, activo) 
SELECT 1, 'Acción Extrema', 'Una película llena de adrenalina con efectos especiales impresionantes y secuencias de acción épicas.', 'movie', 'Acción', 2024, '2h 15min', '/images/accion-extrema.png', 4.8, true, true, true
WHERE NOT EXISTS (SELECT 1 FROM contenidos WHERE id = 1);

INSERT INTO contenidos (id, titulo, descripcion, tipo, genero, año, duracion, imagen_url, calificacion, trending, destacado, activo) 
SELECT 2, 'Misterios Urbanos', 'Una serie de suspenso que te mantendrá al borde del asiento con cada episodio.', 'series', 'Thriller', 2024, '3 temporadas', '/images/misterios-urbanos.png', 4.6, false, true, true
WHERE NOT EXISTS (SELECT 1 FROM contenidos WHERE id = 2);

INSERT INTO contenidos (id, titulo, descripcion, tipo, genero, año, duracion, imagen_url, calificacion, trending, destacado, activo) 
SELECT 3, 'Naturaleza Salvaje', 'Explora los rincones más remotos de nuestro planeta con imágenes espectaculares.', 'movie', 'Naturaleza', 2024, '1h 45min', '/images/naturaleza-salvaje.png', 4.9, true, true, true
WHERE NOT EXISTS (SELECT 1 FROM contenidos WHERE id = 3);

INSERT INTO contenidos (id, titulo, descripcion, tipo, genero, año, duracion, imagen_url, calificacion, trending, destacado, activo) 
SELECT 4, 'Comedia Central', 'Risas garantizadas con esta divertida serie familiar llena de momentos memorables.', 'series', 'Comedia', 2024, '2 temporadas', '/images/comedia-central.png', 4.4, true, false, true
WHERE NOT EXISTS (SELECT 1 FROM contenidos WHERE id = 4);

INSERT INTO contenidos (id, titulo, descripcion, tipo, genero, año, duracion, imagen_url, calificacion, trending, destacado, activo) 
SELECT 5, 'Ciencia Ficción', 'Un viaje épico a través del espacio y el tiempo con tecnología futurista.', 'movie', 'Sci-Fi', 2024, '2h 30min', '/images/ciencia-ficcion.png', 4.7, false, true, true
WHERE NOT EXISTS (SELECT 1 FROM contenidos WHERE id = 5);

INSERT INTO contenidos (id, titulo, descripcion, tipo, genero, año, duracion, imagen_url, calificacion, trending, destacado, activo) 
SELECT 6, 'Drama Histórico', 'Una emotiva historia basada en hechos reales que marcaron la historia.', 'series', 'Drama', 2024, '1 temporada', '/images/drama-historico.png', 4.5, false, false, true
WHERE NOT EXISTS (SELECT 1 FROM contenidos WHERE id = 6);

INSERT INTO contenidos (id, titulo, descripcion, tipo, genero, año, duracion, imagen_url, calificacion, trending, destacado, activo) 
SELECT 7, 'Terror Nocturno', 'Una película de terror psicológico que te quitará el sueño por semanas.', 'movie', 'Terror', 2023, '1h 55min', '/images/terror-nocturno.png', 4.3, true, false, true
WHERE NOT EXISTS (SELECT 1 FROM contenidos WHERE id = 7);

INSERT INTO contenidos (id, titulo, descripcion, tipo, genero, año, duracion, imagen_url, calificacion, trending, destacado, activo) 
SELECT 8, 'Romance Eterno', 'Una hermosa historia de amor que trasciende el tiempo y las adversidades.', 'movie', 'Romance', 2024, '2h 05min', '/images/romance-eterno.png', 4.5, false, false, true
WHERE NOT EXISTS (SELECT 1 FROM contenidos WHERE id = 8);

-- =============================================
-- 10. INSERTAR PLANES SI NO EXISTEN
-- =============================================
INSERT INTO planes (id, nombre, precio, max_peliculas, descripcion, activo) 
SELECT 1, 'Estándar', 9.99, 5, 'Perfecto para uso personal', true
WHERE NOT EXISTS (SELECT 1 FROM planes WHERE id = 1);

INSERT INTO planes (id, nombre, precio, max_peliculas, descripcion, activo) 
SELECT 2, 'Premium', 19.99, 10, 'Para los amantes del cine', true
WHERE NOT EXISTS (SELECT 1 FROM planes WHERE id = 2);

-- =============================================
-- 11. VERIFICAR RESULTADOS
-- =============================================
SELECT 'Script ejecutado correctamente' as mensaje;
SELECT 'Tablas en la base de datos:' as info, table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;
SELECT 'Total contenidos:' as info, COUNT(*) as total FROM contenidos;
SELECT 'Total planes:' as info, COUNT(*) as total FROM planes;
SELECT 'Columnas en perfiles:' as info, column_name FROM information_schema.columns WHERE table_name = 'perfiles' ORDER BY ordinal_position;
SELECT 'Columnas en contenidos:' as info, column_name FROM information_schema.columns WHERE table_name = 'contenidos' ORDER BY ordinal_position;
