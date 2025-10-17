# Guía de Instalación y Configuración - SINOCC Backend

## Descripción del Sistema

SINOCC es un sistema de notificación de cierre de calles que permite a los administradores de obras públicas registrar cierres programados y enviar notificaciones push a los usuarios 24 horas antes del cierre.

### Características Principales

- Sistema de autenticación con JWT
- Tres niveles de usuarios: Usuario, Administrador y SuperAdmin
- Gestión completa de cierres de calles con ubicaciones geográficas
- Sistema de notificaciones push programadas usando Expo
- Gestión de zonas para organizar los cierres
- API RESTful completa

## Requisitos Previos

- Node.js (versión 14 o superior)
- PostgreSQL (versión 12 o superior)
- NPM o Yarn

## Instalación Paso a Paso

### 1. Clonar o Descargar el Proyecto

Crea la estructura de carpetas según el proyecto y coloca todos los archivos en sus ubicaciones correspondientes.

### 2. Instalar Dependencias

```bash
npm install
```

### 3. Configurar la Base de Datos

Crea una base de datos en PostgreSQL:

```sql
CREATE DATABASE sinocc_db;
```

Ejecuta el script SQL que te proporcioné (sinocc.sql) para crear las tablas:

```bash
psql -U postgres -d sinocc_db -f sinocc.sql
```

### 4. Configurar Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto basándote en el archivo `.env` de ejemplo:

```env
PUERTO=3000
ENTORNO=desarrollo

BD_HOST=localhost
BD_PUERTO=5432
BD_NOMBRE=sinocc_db
BD_USUARIO=postgres
BD_CONTRASENA=tu_contrasena_postgres

JWT_SECRETO=clave_secreta_muy_segura_cambiar_en_produccion
JWT_EXPIRACION=7d

ORIGEN_PERMITIDO=*
```

**IMPORTANTE:** Cambia `JWT_SECRETO` por una clave segura y única.

### 5. Inicializar Roles y SuperAdmin

Ejecuta el script de inicialización:

```bash
node scripts/inicializarRoles.js
```

Este script creará:
- Los tres roles: usuario, administrador, superadmin
- Un usuario SuperAdmin con las credenciales:
  - Correo: `superadmin@sinocc.com`
  - Contraseña: `admin123`

**ADVERTENCIA:** Cambia esta contraseña inmediatamente después del primer inicio de sesión.

### 6. Iniciar el Servidor

Para desarrollo:
```bash
npm run dev
```

Para producción:
```bash
npm start
```

El servidor se iniciará en `http://localhost:3000`

## Estructura del Proyecto

```
sinocc-backend/
├── src/
│   ├── config/              # Configuraciones del sistema
│   │   ├── baseDatos.js     # Conexión a PostgreSQL
│   │   └── configuracion.js # Variables de configuración
│   ├── middlewares/         # Middlewares de Express
│   │   ├── autenticacion.js # Verificación de tokens y roles
│   │   └── validaciones.js  # Validaciones con express-validator
│   ├── modelos/            # Modelos de Sequelize
│   │   ├── Usuario.js
│   │   ├── Rol.js
│   │   ├── Zona.js
│   │   ├── Cierre.js
│   │   ├── UbicacionCierre.js
│   │   ├── Dispositivo.js
│   │   └── Notificacion.js
│   ├── controladores/      # Lógica de negocio
│   │   ├── autenticacionControlador.js
│   │   ├── usuarioControlador.js
│   │   ├── cierreControlador.js
│   │   ├── zonaControlador.js
│   │   └── notificacionControlador.js
│   ├── rutas/             # Definición de rutas
│   │   ├── autenticacionRutas.js
│   │   ├── usuarioRutas.js
│   │   ├── cierreRutas.js
│   │   ├── zonaRutas.js
│   │   └── notificacionRutas.js
│   ├── servicios/         # Servicios adicionales
│   │   ├── notificacionServicio.js
│   │   └── programadorTareas.js
│   └── utilidades/        # Funciones auxiliares
│       └── respuestas.js
├── scripts/               # Scripts de inicialización
│   └── inicializarRoles.js
├── .env                   # Variables de entorno
├── .gitignore
├── package.json
└── servidor.js           # Punto de entrada de la aplicación
```

## Endpoints de la API

### Autenticación (`/api/auth`)

#### Registro de Usuario Común
```http
POST /api/auth/registro
Content-Type: application/json

{
  "nombre": "Juan",
  "apellido": "Pérez",
  "tokenDispositivo": "ExponentPushToken[xxx]",
  "plataforma": "android"
}
```

#### Inicio de Sesión
```http
POST /api/auth/login
Content-Type: application/json

{
  "correo": "usuario@ejemplo.com",
  "contrasena": "contraseña123",
  "tokenDispositivo": "ExponentPushToken[xxx]",
  "plataforma": "ios"
}
```

#### Obtener Perfil
```http
GET /api/auth/perfil
Authorization: Bearer {token}
```

### Usuarios (`/api/usuarios`)

#### Crear Administrador (Solo SuperAdmin)
```http
POST /api/usuarios/administrador
Authorization: Bearer {token_superadmin}
Content-Type: application/json

{
  "nombre": "Carlos",
  "apellido": "González",
  "correo": "admin@sinocc.com",
  "contrasena": "admin123"
}
```

#### Listar Usuarios (Solo SuperAdmin)
```http
GET /api/usuarios?rol=administrador
Authorization: Bearer {token_superadmin}
```

#### Obtener Usuario por ID (Solo SuperAdmin)
```http
GET /api/usuarios/{id}
Authorization: Bearer {token_superadmin}
```

#### Actualizar Usuario (Solo SuperAdmin)
```http
PUT /api/usuarios/{id}
Authorization: Bearer {token_superadmin}
Content-Type: application/json

{
  "nombre": "Carlos Actualizado",
  "correo": "nuevo@correo.com"
}
```

#### Eliminar Usuario (Solo SuperAdmin)
```http
DELETE /api/usuarios/{id}
Authorization: Bearer {token_superadmin}
```

### Zonas (`/api/zonas`)

#### Crear Zona (Solo Administradores)
```http
POST /api/zonas
Authorization: Bearer {token_admin}
Content-Type: application/json

{
  "nombreZona": "Zona Sur"
}
```

#### Listar Zonas (Público)
```http
GET /api/zonas
```

#### Obtener Zona por ID (Público)
```http
GET /api/zonas/{id}
```

#### Actualizar Zona (Solo Administradores)
```http
PUT /api/zonas/{id}
Authorization: Bearer {token_admin}
Content-Type: application/json

{
  "nombreZona": "Zona Sur Actualizada"
}
```

#### Eliminar Zona (Solo Administradores)
```http
DELETE /api/zonas/{id}
Authorization: Bearer {token_admin}
```

### Cierres (`/api/cierres`)

#### Crear Cierre (Solo Administradores)
```http
POST /api/cierres
Authorization: Bearer {token_admin}
Content-Type: application/json

{
  "categoria": "Obras",
  "lugarCierre": "Avenida América entre calles Potosí y Sucre",
  "idZona": 1,
  "fechaInicio": "2025-10-20",
  "fechaFin": "2025-10-25",
  "descripcion": "Reparación de pavimento",
  "ubicaciones": [
    {
      "latitud": -17.3935,
      "longitud": -66.1570
    },
    {
      "latitud": -17.3945,
      "longitud": -66.1580
    }
  ]
}
```

#### Listar Cierres (Público)
```http
GET /api/cierres?estado=true&zona=1&activos=true
```

#### Obtener Cierres Activos (Público)
```http
GET /api/cierres/activos
```

#### Obtener Cierre por ID (Público)
```http
GET /api/cierres/{id}
```

#### Actualizar Cierre (Solo Administradores)
```http
PUT /api/cierres/{id}
Authorization: Bearer {token_admin}
Content-Type: application/json

{
  "descripcion": "Descripción actualizada",
  "estado": false
}
```

#### Eliminar Cierre (Solo Administradores)
```http
DELETE /api/cierres/{id}
Authorization: Bearer {token_admin}
```

### Notificaciones (`/api/notificaciones`)

#### Registrar Dispositivo
```http
POST /api/notificaciones/dispositivo
Content-Type: application/json

{
  "tokenDispositivo": "ExponentPushToken[xxxxxx]",
  "plataforma": "android"
}
```

#### Desactivar Dispositivo
```http
POST /api/notificaciones/dispositivo/desactivar
Content-Type: application/json

{
  "tokenDispositivo": "ExponentPushToken[xxxxxx]"
}
```

#### Listar Dispositivos Activos (Requiere Autenticación)
```http
GET /api/notificaciones/dispositivos
Authorization: Bearer {token}
```

## Sistema de Roles y Permisos

### Usuario
- Registrarse en la aplicación
- Ver lista de cierres
- Ver cierres activos
- Ver detalles de cierres
- Recibir notificaciones push
- Ver su propio perfil

### Administrador
- Todos los permisos de Usuario
- Crear, actualizar y eliminar cierres
- Crear, actualizar y eliminar zonas

### SuperAdmin
- Todos los permisos de Administrador
- Crear administradores
- Ver, actualizar y eliminar usuarios
- Gestión completa del sistema

## Sistema de Notificaciones

### Funcionamiento

1. Cuando se crea un cierre, automáticamente se genera una notificación programada.
2. La notificación se programa para enviarse 24 horas antes de la fecha de inicio del cierre.
3. El sistema ejecuta una tarea programada diariamente a las 9:00 AM (hora de Bolivia).
4. La tarea verifica si hay notificaciones pendientes para ese día.
5. Si hay notificaciones, se envían a todos los dispositivos activos registrados.

### Configuración del Programador

El programador está configurado en `src/servicios/programadorTareas.js` y usa la zona horaria `America/La_Paz`. Puedes modificar la hora de envío cambiando el patrón cron:

```javascript
// Formato: 'minuto hora * * *'
cron.schedule('0 9 * * *', async () => {
  // Se ejecuta a las 9:00 AM todos los días
});
```

### Tokens de Expo Push Notifications

Para recibir notificaciones, los dispositivos deben:
1. Registrar su token de Expo al hacer login o registro
2. El token debe ser válido y generado por Expo
3. El dispositivo debe estar marcado como activo

## Características de Seguridad

### Hash de Contraseñas
- Las contraseñas se hashean automáticamente con bcrypt usando hooks de Sequelize
- Salt rounds: 10
- Las contraseñas nunca se almacenan en texto plano

### JWT
- Los tokens tienen una expiración configurable (por defecto 7 días)
- Se verifica la validez del token en cada petición protegida
- Los tokens incluyen el ID del usuario

### Validaciones
- Todas las entradas se validan con express-validator
- Se normalizan los correos electrónicos
- Se validan formatos de fecha
- Se validan relaciones entre entidades

## Manejo de Errores

El sistema devuelve respuestas consistentes con el siguiente formato:

**Respuesta Exitosa:**
```json
{
  "exito": true,
  "mensaje": "Operación exitosa",
  "datos": { }
}
```

**Respuesta de Error:**
```json
{
  "exito": false,
  "mensaje": "Descripción del error",
  "errores": []
}
```

## Códigos de Estado HTTP

- `200 OK`: Operación exitosa
- `201 Created`: Recurso creado exitosamente
- `400 Bad Request`: Datos de entrada inválidos
- `401 Unauthorized`: No autenticado o token inválido
- `403 Forbidden`: No tiene permisos para esta operación
- `404 Not Found`: Recurso no encontrado
- `500 Internal Server Error`: Error del servidor

## Consideraciones Importantes

1. **Seguridad del SuperAdmin**: Cambia las credenciales del superadmin inmediatamente después de la instalación.

2. **JWT_SECRETO**: Usa una clave larga y segura en producción.

3. **CORS**: En producción, configura `ORIGEN_PERMITIDO` con el dominio específico de tu aplicación móvil.

4. **Base de Datos**: Asegúrate de hacer respaldos regulares de la base de datos.

5. **Tokens de Dispositivos**: Los tokens de Expo deben renovarse periódicamente desde la aplicación móvil.

6. **Zona Horaria**: El programador usa la zona horaria de Bolivia (`America/La_Paz`). Cámbiala según tu ubicación.

7. **Sincronización de Sequelize**: El código usa `sequelize.sync({ alter: false })`. En desarrollo puedes usar `alter: true` para sincronizar cambios en los modelos.

## Solución de Problemas Comunes

### Error de Conexión a la Base de Datos
- Verifica que PostgreSQL esté ejecutándose
- Confirma las credenciales en el archivo `.env`
- Verifica que la base de datos existe

### Tokens Inválidos
- Verifica que el token se envíe en el header `Authorization: Bearer {token}`
- Confirma que el token no haya expirado
- Verifica que JWT_SECRETO sea el mismo que se usó para generar el token

### Notificaciones no se Envían
- Verifica que los tokens de Expo sean válidos
- Confirma que hay dispositivos activos registrados
- Revisa los logs del servidor para errores

### Validaciones Fallando
- Verifica que todos los campos requeridos estén presentes
- Confirma que los formatos de fecha sean correctos (YYYY-MM-DD)
- Verifica que las ubicaciones tengan latitud y longitud válidas

## Próximos Pasos

1. Integra el backend con tu aplicación móvil React Native
2. Configura un servidor en producción (AWS, Heroku, DigitalOcean, etc.)
3. Configura SSL/TLS para conexiones seguras
4. Implementa logs más robustos con Winston o similar
5. Considera agregar tests unitarios y de integración
6. Implementa rate limiting para prevenir abuso de la API

## Soporte

Para reportar problemas o hacer preguntas sobre el backend, documenta:
- Versión de Node.js
- Versión de PostgreSQL
- Mensaje de error completo
- Pasos para reproducir el problema