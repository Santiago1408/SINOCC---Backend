CREATE TABLE "roles" (
  "id" SERIAL PRIMARY KEY,
  "nombreRol" VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE "usuarios" (
  "id" SERIAL PRIMARY KEY,
  "nombre" VARCHAR(100) NOT NULL,
  "apellido" VARCHAR(100),
  "correo" VARCHAR(100) UNIQUE,
  "contrasena" VARCHAR(255),
  "idRol" INT,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "modifiedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "zonas" (
  "id" SERIAL PRIMARY KEY,
  "nombreZona" VARCHAR(100) UNIQUE NOT NULL
);

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
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "modifiedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "ubicacionesCierre" (
  "id" SERIAL PRIMARY KEY,
  "idCierre" INT,
  "latitud" DECIMAL(10,7) NOT NULL,
  "longitud" DECIMAL(10,7) NOT NULL
);

CREATE TABLE "dispositivos" (
  "id" SERIAL PRIMARY KEY,
  "tokenDispositivo" TEXT UNIQUE NOT NULL,
  "idUsuario" INT,
  "plataforma" VARCHAR(50),
  "activo" BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "notificaciones" (
  "id" SERIAL PRIMARY KEY,
  "idCierre" INT,
  "titulo" VARCHAR(255) NOT NULL,
  "mensaje" TEXT NOT NULL,
  "fechaEnvio" DATE NOT NULL,
  "enviado" BOOLEAN DEFAULT false,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE "usuarios" ADD FOREIGN KEY ("idRol") REFERENCES "roles" ("id") ON DELETE SET NULL;
ALTER TABLE "cierres" ADD FOREIGN KEY ("idZona") REFERENCES "zonas" ("id") ON DELETE SET NULL;
ALTER TABLE "ubicacionesCierre" ADD FOREIGN KEY ("idCierre") REFERENCES "cierres" ("id") ON DELETE CASCADE;
ALTER TABLE "dispositivos" ADD FOREIGN KEY ("idUsuario") REFERENCES "usuarios" ("id") ON DELETE SET NULL;
ALTER TABLE "notificaciones" ADD FOREIGN KEY ("idCierre") REFERENCES "cierres" ("id") ON DELETE CASCADE;
