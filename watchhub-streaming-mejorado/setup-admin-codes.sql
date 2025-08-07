-- =============================================
-- AGREGAR CÓDIGOS ADMIN Y MEJORAR SISTEMA
-- =============================================

-- 1. Crear tabla para códigos admin (opcional, más seguro)
CREATE TABLE IF NOT EXISTS codigos_admin (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(50) UNIQUE NOT NULL,
    usado BOOLEAN DEFAULT false,
    usado_por UUID REFERENCES auth.users(id),
    fecha_uso TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Insertar códigos admin válidos
INSERT INTO codigos_admin (codigo) VALUES 
('ADMINPROYECTO1'),
('ADMINPROYECTO2')
ON CONFLICT (codigo) DO NOTHING;

-- 3. Habilitar RLS en la tabla
ALTER TABLE codigos_admin ENABLE ROW LEVEL SECURITY;

-- 4. Política para que cualquiera pueda leer códigos (para validar en registro)
CREATE POLICY "Cualquiera puede leer codigos admin"
ON codigos_admin FOR SELECT
TO public
USING (true);

-- 5. Solo el sistema puede actualizar códigos (marcar como usado)
CREATE POLICY "Sistema puede actualizar codigos"
ON codigos_admin FOR UPDATE
TO authenticated
USING (true);

-- 6. Verificar códigos disponibles
SELECT 'Códigos admin disponibles:' as info, codigo, usado FROM codigos_admin ORDER BY id;
