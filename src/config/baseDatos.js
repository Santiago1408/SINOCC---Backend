const { Sequelize } = require('sequelize');
const configuracion = require('./configuracion');

const sequelize = new Sequelize(
  configuracion.baseDatos.nombre,
  configuracion.baseDatos.usuario,
  configuracion.baseDatos.contrasena,
  {
    host: configuracion.baseDatos.host,
    port: configuracion.baseDatos.puerto,
    dialect: configuracion.baseDatos.dialecto,
    logging: configuracion.baseDatos.logging,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

const probarConexion = async () => {
  try {
    await sequelize.authenticate();
    console.log('Conexion a la base de datos establecida correctamente');
  } catch (error) {
    console.error('No se pudo conectar a la base de datos:', error);
  }
};

module.exports = { sequelize, probarConexion };