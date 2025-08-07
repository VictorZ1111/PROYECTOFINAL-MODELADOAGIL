-- =============================================
-- INSERTAR CONTENIDOS DE PRUEBA PARA FAVORITOS
-- =============================================

-- Insertar contenidos que coincidan con los IDs del catálogo
INSERT INTO contenidos (id, titulo, descripcion, tipo, genero, año, duracion, imagen_url, calificacion, trending, destacado) VALUES
(1, 'Acción Extrema', 'Una película llena de adrenalina con efectos especiales impresionantes y secuencias de acción épicas.', 'movie', 'Acción', 2024, '2h 15min', '/images/accion-extrema.png', 4.8, true, true),
(2, 'Misterios Urbanos', 'Una serie de suspenso que te mantendrá al borde del asiento con cada episodio.', 'series', 'Thriller', 2024, '3 temporadas', '/images/misterios-urbanos.png', 4.6, false, true),
(3, 'Naturaleza Salvaje', 'Explora los rincones más remotos de nuestro planeta con imágenes espectaculares.', 'movie', 'Naturaleza', 2024, '1h 45min', '/images/naturaleza-salvaje.png', 4.9, true, true),
(4, 'Comedia Central', 'Risas garantizadas con esta divertida serie familiar llena de momentos memorables.', 'series', 'Comedia', 2024, '2 temporadas', '/images/comedia-central.png', 4.4, true, false),
(5, 'Ciencia Ficción', 'Un viaje épico a través del espacio y el tiempo con tecnología futurista.', 'movie', 'Sci-Fi', 2024, '2h 30min', '/images/ciencia-ficcion.png', 4.7, false, true),
(6, 'Drama Histórico', 'Una emotiva historia basada en hechos reales que marcaron la historia.', 'series', 'Drama', 2024, '1 temporada', '/images/drama-historico.png', 4.5, false, false),
(7, 'Terror Nocturno', 'Una película de terror psicológico que te quitará el sueño por semanas.', 'movie', 'Terror', 2023, '1h 55min', '/images/terror-nocturno.png', 4.3, true, false),
(8, 'Romance Eterno', 'Una hermosa historia de amor que trasciende el tiempo y las adversidades.', 'movie', 'Romance', 2024, '2h 05min', '/images/romance-eterno.png', 4.5, false, false)
ON CONFLICT (id) DO UPDATE SET
titulo = EXCLUDED.titulo,
descripcion = EXCLUDED.descripcion,
tipo = EXCLUDED.tipo,
genero = EXCLUDED.genero,
año = EXCLUDED.año,
duracion = EXCLUDED.duracion,
imagen_url = EXCLUDED.imagen_url,
calificacion = EXCLUDED.calificacion,
trending = EXCLUDED.trending,
destacado = EXCLUDED.destacado;

-- Verificar que se insertaron correctamente
SELECT 'Contenidos insertados:' as info, COUNT(*) as total FROM contenidos;
SELECT 'Lista de contenidos:' as info, id, titulo, tipo FROM contenidos ORDER BY id;
