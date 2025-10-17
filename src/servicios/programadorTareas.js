const cron = require('node-cron');
const { enviarNotificacionesProgramadas } = require('./notificacionServicio');

const iniciarProgramadorNotificaciones = () => {
  cron.schedule('0 9 * * *', async () => {
    console.log('Ejecutando tarea programada de notificaciones a las 9:00 AM');
    await enviarNotificacionesProgramadas();
  }, {
    timezone: 'America/La_Paz'
  });

  console.log('Programador de notificaciones iniciado - Se ejecutara diariamente a las 9:00 AM');
};

module.exports = {
  iniciarProgramadorNotificaciones
};