-- =====================================================
-- SCRIPT COMPLETO DE BASE DE DATOS SINOCC
-- Incluye: Creación de tablas, roles, zonas y superadmin
-- =====================================================

-- Eliminar tablas si existen (para recrear limpiamente)
DROP TABLE IF EXISTS "notificaciones" CASCADE;
DROP TABLE IF EXISTS "dispositivos" CASCADE;
DROP TABLE IF EXISTS "ubicacionesCierre" CASCADE;
DROP TABLE IF EXISTS "cierres" CASCADE;
DROP TABLE IF EXISTS "zonas" CASCADE;
DROP TABLE IF EXISTS "usuarios" CASCADE;
DROP TABLE IF EXISTS "roles" CASCADE;

-- =====================================================
-- CREACIÓN DE TABLAS
-- =====================================================

-- Tabla de roles
CREATE TABLE "roles" (
  "id" SERIAL PRIMARY KEY,
  "nombreRol" VARCHAR(50) UNIQUE NOT NULL
);

-- Tabla de usuarios
CREATE TABLE "usuarios" (
  "id" SERIAL PRIMARY KEY,
  "nombre" VARCHAR(100) NOT NULL,
  "apellido" VARCHAR(100),
  "correo" VARCHAR(100) UNIQUE,
  "contrasena" VARCHAR(255),
  "idRol" INT,
  "createdAt" TIMESTAMP DEFAULT (CURRENT_TIMESTAMP),
  "modifiedAt" TIMESTAMP DEFAULT (CURRENT_TIMESTAMP)
);

-- Tabla de zonas
CREATE TABLE "zonas" (
  "id" SERIAL PRIMARY KEY,
  "nombreZona" VARCHAR(100) UNIQUE NOT NULL
);

-- Tabla de cierres (actualizada con horas)
CREATE TABLE "cierres" (
  "id" SERIAL PRIMARY KEY,
  "categoria" VARCHAR(20),
  "lugarCierre" VARCHAR(255) NOT NULL,
  "idZona" INT,
  "fechaInicio" DATE,
  "fechaFin" DATE,
  "horaInicio" TIME,
  "horaFin" TIME,
  "descripcion" TEXT,
  "createdAt" TIMESTAMP DEFAULT (CURRENT_TIMESTAMP),
  "modifiedAt" TIMESTAMP DEFAULT (CURRENT_TIMESTAMP)
);

-- Tabla de ubicaciones de cierres
CREATE TABLE "ubicacionesCierre" (
  "id" SERIAL PRIMARY KEY,
  "idCierre" INT,
  "latitud" DECIMAL(10,7) NOT NULL,
  "longitud" DECIMAL(10,7) NOT NULL
);

-- Tabla de dispositivos
CREATE TABLE "dispositivos" (
  "id" SERIAL PRIMARY KEY,
  "tokenDispositivo" TEXT UNIQUE NOT NULL,
  "idUsuario" INT,
  "plataforma" VARCHAR(50),
  "activo" BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMP DEFAULT (CURRENT_TIMESTAMP)
);

-- Tabla de notificaciones
CREATE TABLE "notificaciones" (
  "id" SERIAL PRIMARY KEY,
  "idCierre" INT,
  "titulo" VARCHAR(255) NOT NULL,
  "mensaje" TEXT NOT NULL,
  "fechaEnvio" DATE NOT NULL,
  "enviado" BOOLEAN DEFAULT false,
  "createdAt" TIMESTAMP DEFAULT (CURRENT_TIMESTAMP)
);

-- =====================================================
-- FOREIGN KEYS
-- =====================================================

ALTER TABLE "usuarios" 
  ADD FOREIGN KEY ("idRol") 
  REFERENCES "roles" ("id") 
  ON DELETE SET NULL;

ALTER TABLE "cierres" 
  ADD FOREIGN KEY ("idZona") 
  REFERENCES "zonas" ("id") 
  ON DELETE SET NULL;

ALTER TABLE "ubicacionesCierre" 
  ADD FOREIGN KEY ("idCierre") 
  REFERENCES "cierres" ("id") 
  ON DELETE CASCADE;

ALTER TABLE "dispositivos" 
  ADD FOREIGN KEY ("idUsuario") 
  REFERENCES "usuarios" ("id") 
  ON DELETE SET NULL;

ALTER TABLE "notificaciones" 
  ADD FOREIGN KEY ("idCierre") 
  REFERENCES "cierres" ("id") 
  ON DELETE CASCADE;

-- =====================================================
-- INSERTAR DATOS INICIALES
-- =====================================================

-- Insertar roles
INSERT INTO "roles" ("nombreRol") VALUES 
  ('usuario'),
  ('administrador'),
  ('superadmin');

-- Insertar zonas base
INSERT INTO "zonas" ("nombreZona") VALUES 
  ('Quillacollo'),
  ('Sacaba'),
  ('Zona Centro');

-- Insertar superadmin
-- IMPORTANTE: Esta contraseña es hasheada con bcrypt (salt rounds = 10)
-- Contraseña en texto plano: "admin123"
-- Hash generado: $2b$10$rQ3Z9J8yJ9Y0Z8Z8Z8Z8ZuJ9Y0Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z
-- Nota: Debes generar un nuevo hash o usar el sistema para crear el usuario

-- OPCIÓN 1: Insertar con hash pre-generado (no recomendado para producción)
-- Este hash corresponde a "admin123"
INSERT INTO "usuarios" ("nombre", "apellido", "correo", "contrasena", "idRol") 
VALUES (
  'Super',
  'Administrador',
  'superadmin@sinocc.com',
  '$2b$10$YourHashHere',  -- Reemplazar con hash real
  (SELECT "id" FROM "roles" WHERE "nombreRol" = 'superadmin')
);

-- OPCIÓN 2: Crear el superadmin desde el backend
-- Después de ejecutar este script, ejecuta desde Node.js:
-- node -e "require('./scripts/crearSuperAdmin.js')"

-- =====================================================
-- ÍNDICES PARA MEJOR RENDIMIENTO
-- =====================================================

-- Índice para búsquedas por zona
CREATE INDEX idx_cierres_zona ON "cierres"("idZona");

-- Índice para búsquedas por fechas
CREATE INDEX idx_cierres_fechas ON "cierres"("fechaInicio", "fechaFin");

-- Índice para búsquedas por horas
CREATE INDEX idx_cierres_horas ON "cierres"("horaInicio", "horaFin");

-- Índice para búsquedas de usuarios por correo
CREATE INDEX idx_usuarios_correo ON "usuarios"("correo");

-- Índice para dispositivos activos
CREATE INDEX idx_dispositivos_activo ON "dispositivos"("activo");

-- Índice para notificaciones pendientes
CREATE INDEX idx_notificaciones_pendientes ON "notificaciones"("enviado", "fechaEnvio");

-- =====================================================
-- VERIFICACIÓN
-- =====================================================

-- Ver todas las tablas creadas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Ver roles insertados
SELECT * FROM "roles";

-- Ver zonas insertadas
SELECT * FROM "zonas";

-- Ver estructura de tabla cierres
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'cierres'
ORDER BY ordinal_position;

-- =====================================================
-- SCRIPT COMPLETADO
-- =====================================================
-- Para ejecutar este script:
-- psql "postgresql://usuario:password@host:puerto/database" -f sinocc.sql
-- =====================================================