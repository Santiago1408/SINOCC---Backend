require('dotenv').config();

module.exports = {
  servidor: {
    puerto: process.env.PUERTO || 3000,
    entorno: process.env.ENTORNO || 'desarrollo'
  },
  baseDatos: {
    host: process.env.BD_HOST || 'localhost',
    puerto: process.env.BD_PUERTO || 5432,
    nombre: process.env.BD_NOMBRE || 'sinocc_db',
    usuario: process.env.BD_USUARIO || 'postgres',
    contrasena: process.env.BD_CONTRASENA || '',
    dialecto: 'postgres',
    logging: false
  },
  jwt: {
    secreto: process.env.JWT_SECRETO || 'clave_secreta_por_defecto',
    expiracion: process.env.JWT_EXPIRACION || '7d'
  },
  cors: {
    origenPermitido: process.env.ORIGEN_PERMITIDO || '*'
  }
};
