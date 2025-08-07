-- =============================================
-- INSERTAR PLANES REQUERIDOS URGENTE
-- El error es porque no existen los planes con id 1 y 2
-- =============================================

-- Insertar los planes que el registro necesita
INSERT INTO planes (id, nombre, precio, max_peliculas, descripcion) VALUES
(1, 'Estándar', 9.99, 5, 'Perfecto para uso personal'),
(2, 'Premium', 19.99, 10, 'Para los amantes del cine')
ON CONFLICT (id) DO UPDATE SET
nombre = EXCLUDED.nombre,
precio = EXCLUDED.precio,
max_peliculas = EXCLUDED.max_peliculas,
descripcion = EXCLUDED.descripcion;

-- Verificar que se insertaron
SELECT 'Planes insertados:' as info, id, nombre, precio FROM planes ORDER BY id;
