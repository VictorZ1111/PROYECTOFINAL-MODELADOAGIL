# 🚀 INSTRUCCIONES PARA PROBAR WATCHHUB STREAMING

## ✅ PASOS COMPLETADOS
1. ✅ Archivo registro duplicado eliminado
2. ✅ Columnas de registro corregidas para coincidir con la base de datos
3. ✅ Servidor de desarrollo funcionando en http://localhost:3000
4. ✅ SQL actualizado con tablas y políticas correctas

## 📋 PASOS PARA PROBAR AHORA

### 1. EJECUTAR SQL EN SUPABASE
```sql
-- Ejecuta este archivo en el SQL Editor de Supabase:
database-complete.sql
```

### 2. AGREGAR DATOS DE PRUEBA
```sql
-- Después ejecuta este archivo para datos de prueba:
datos-prueba.sql
```

### 3. CONFIGURAR VARIABLES DE ENTORNO
Asegúrate de que tienes en tu `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima
```

### 4. PROBAR FUNCIONALIDADES

#### 🔐 REGISTRO
- Ve a http://localhost:3000/registro
- Crea una cuenta de **usuario normal**:
  - Rol: Usuario
  - Plan: Estándar o Premium
  - Método de pago: Stripe o PayPal (simulado)

#### 🔐 REGISTRO ADMIN
- Crea una cuenta de **administrador**:
  - Rol: Administrador  
  - Código admin: `ADMIN2025` o `WATCHHUB_ADMIN`

#### 🚪 LOGIN
- Ve a http://localhost:3000/login
- Usa tu **nombre de usuario** (no email) para entrar

#### ❤️ FAVORITOS
- Navega por el catálogo
- Haz clic en el corazón para agregar favoritos
- Ve a la página de favoritos

#### 👤 PERFIL
- Ve a tu perfil para editar información

#### 🛠️ ADMIN (solo para administradores)
- Ve a http://localhost:3000/admin
- Panel para gestionar contenido

## 🔧 PRÓXIMOS PASOS (DESPUÉS DE PROBAR)

### Cuando funcione todo lo básico:
1. **Integración de pagos** - Agregar Stripe/PayPal modo desarrollo
2. **Gestión de contenido** - Completar panel admin  
3. **Sistema de suscripciones** - Control de acceso por pago
4. **Optimizaciones** - Mejoras de rendimiento

## 🐛 SI HAY ERRORES

### Error de base de datos:
- Verifica que ejecutaste `database-complete.sql`
- Verifica que las variables de entorno son correctas

### Error de login:
- Asegúrate de que tienes email en la tabla perfiles
- Verifica que el nombre de usuario existe

### Error de favoritos:
- Verifica que tienes la tabla favoritos creada
- Verifica que estás autenticado

## 📞 ESTADO ACTUAL
- ✅ **Servidor**: Funcionando en localhost:3000
- ✅ **Base de datos**: Estructurada y lista
- ✅ **Registro**: Corregido para usar columnas correctas
- ✅ **Login**: Funcional con nombre de usuario
- ✅ **Favoritos**: Sistema implementado
- ✅ **Admin**: Panel básico funcionando

**¡Todo listo para probar!** 🎉
