const express = require('express');
const cors = require('cors');
const configuracion = require('./src/config/configuracion');
const { sequelize, probarConexion } = require('./src/config/baseDatos');
const { iniciarProgramadorNotificaciones } = require('./src/servicios/programadorTareas');

const autenticacionRutas = require('./src/rutas/autenticacionRutas');
const usuarioRutas = require('./src/rutas/usuarioRutas');
const cierreRutas = require('./src/rutas/cierreRutas');
const zonaRutas = require('./src/rutas/zonaRutas');
const notificacionRutas = require('./src/rutas/notificacionRutas');

const app = express();

app.use(cors({
  origin: configuracion.cors.origenPermitido
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', autenticacionRutas);
app.use('/api/usuarios', usuarioRutas);
app.use('/api/cierres', cierreRutas);
app.use('/api/zonas', zonaRutas);
app.use('/api/notificaciones', notificacionRutas);

app.get('/', (req, res) => {
  res.json({
    mensaje: 'API SINOCC - Sistema de Notificacion de Cierre de Calles',
    version: '1.0.0',
    estado: 'Activo'
  });
});

app.use((req, res) => {
  res.status(404).json({
    exito: false,
    mensaje: 'Ruta no encontrada'
  });
});

app.use((err, req, res, next) => {
  console.error('Error no controlado:', err);
  res.status(500).json({
    exito: false,
    mensaje: 'Error interno del servidor',
    error: configuracion.servidor.entorno === 'desarrollo' ? err.message : undefined
  });
});

const iniciarServidor = async () => {
  try {
    await probarConexion();
    
    await sequelize.sync({ alter: false });
    console.log('Modelos sincronizados con la base de datos');

    iniciarProgramadorNotificaciones();

    app.listen(configuracion.servidor.puerto, () => {
      console.log(`Servidor ejecutandose en puerto ${configuracion.servidor.puerto}`);
      console.log(`Entorno: ${configuracion.servidor.entorno}`);
    });
  } catch (error) {
    console.error('Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

iniciarServidor();

module.exports = app;