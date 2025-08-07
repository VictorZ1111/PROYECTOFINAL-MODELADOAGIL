-- =============================================
-- SQL PARA INSERTAR DATOS DE PRUEBA
-- Ejecutar DESPUÉS de crear las tablas
-- =============================================

-- 1. INSERTAR PLANES DE PRUEBA
INSERT INTO planes (id, nombre, precio, max_peliculas, descripcion) VALUES
(1, 'Estándar', 9.99, 5, 'Perfecto para uso personal'),
(2, 'Premium', 19.99, 10, 'Para los amantes del cine')
ON CONFLICT (id) DO NOTHING;

-- 2. INSERTAR CONTENIDO DE PRUEBA
INSERT INTO contenidos (id, titulo, descripcion, tipo, genero, año, duracion, imagen_url, calificacion, trending, destacado) VALUES
(1, 'Acción Extrema', 'Una película llena de adrenalina con efectos especiales impresionantes.', 'movie', 'Acción', 2024, '2h 15min', '/images/accion-extrema.png', 4.8, true, true),
(2, 'Misterios Urbanos', 'Una serie de suspenso que te mantendrá al borde del asiento.', 'series', 'Thriller', 2024, '3 temporadas', '/images/misterios-urbanos.png', 4.6, false, true),
(3, 'Naturaleza Salvaje', 'Explora los rincones más remotos de nuestro planeta.', 'movie', 'Naturaleza', 2024, '1h 45min', '/images/naturaleza-salvaje.png', 4.9, true, true),
(4, 'Comedia Central', 'Risas garantizadas con esta divertida serie familiar.', 'series', 'Comedia', 2024, '2 temporadas', '/images/comedia-central.png', 4.4, true, false),
(5, 'Ciencia Ficción', 'Un viaje épico a través del espacio y el tiempo.', 'movie', 'Sci-Fi', 2024, '2h 30min', '/images/ciencia-ficcion.png', 4.7, false, true)
ON CONFLICT (id) DO NOTHING;

-- 3. VERIFICAR QUE TODO ESTÉ FUNCIONANDO
SELECT 'Planes creados:' as info, COUNT(*) as total FROM planes;
SELECT 'Contenidos creados:' as info, COUNT(*) as total FROM contenidos;
SELECT 'Perfiles registrados:' as info, COUNT(*) as total FROM perfiles;

-- 4. MOSTRAR ESTRUCTURA DE LAS TABLAS
SELECT 'Columnas en perfiles:' as tabla, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'perfiles' 
ORDER BY ordinal_position;

SELECT 'Columnas en contenidos:' as tabla, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'contenidos' 
ORDER BY ordinal_position;
