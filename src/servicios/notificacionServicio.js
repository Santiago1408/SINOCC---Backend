const { Expo } = require('expo-server-sdk');
const Notificacion = require('../modelos/Notificacion');
const Dispositivo = require('../modelos/Dispositivo');
const { Op } = require('sequelize');

const expo = new Expo();

const enviarNotificacionesProgramadas = async () => {
  try {
    const hoy = new Date().toISOString().split('T')[0];

    const notificacionesPendientes = await Notificacion.findAll({
      where: {
        fechaEnvio: hoy,
        enviado: false
      }
    });

    if (notificacionesPendientes.length === 0) {
      console.log('No hay notificaciones pendientes para enviar hoy');
      return;
    }

    const dispositivosActivos = await Dispositivo.findAll({
      where: { activo: true }
    });

    const tokensDispositivos = dispositivosActivos
      .map(d => d.tokenDispositivo)
      .filter(token => Expo.isExpoPushToken(token));

    if (tokensDispositivos.length === 0) {
      console.log('No hay dispositivos activos con tokens validos');
      return;
    }

    for (const notificacion of notificacionesPendientes) {
      const mensajes = tokensDispositivos.map(token => ({
        to: token,
        sound: 'default',
        title: notificacion.titulo,
        body: notificacion.mensaje,
        data: { idCierre: notificacion.idCierre }
      }));

      const chunks = expo.chunkPushNotifications(mensajes);
      const tickets = [];

      for (const chunk of chunks) {
        try {
          const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
          tickets.push(...ticketChunk);
        } catch (error) {
          console.error('Error al enviar chunk de notificaciones:', error);
        }
      }

      await notificacion.update({ enviado: true });
      console.log(`Notificacion ${notificacion.id} enviada a ${tokensDispositivos.length} dispositivos`);
    }

    console.log(`Se enviaron ${notificacionesPendientes.length} notificaciones`);
  } catch (error) {
    console.error('Error en enviarNotificacionesProgramadas:', error);
  }
};

const enviarNotificacionInmediata = async (titulo, mensaje, idCierre = null) => {
  try {
    const dispositivosActivos = await Dispositivo.findAll({
      where: { activo: true }
    });

    const tokensDispositivos = dispositivosActivos
      .map(d => d.tokenDispositivo)
      .filter(token => Expo.isExpoPushToken(token));

    if (tokensDispositivos.length === 0) {
      console.log('No hay dispositivos activos para enviar la notificacion');
      return { exito: false, mensaje: 'No hay dispositivos activos' };
    }

    const mensajes = tokensDispositivos.map(token => ({
      to: token,
      sound: 'default',
      title,
      body: mensaje,
      data: { idCierre }
    }));

    const chunks = expo.chunkPushNotifications(mensajes);
    const tickets = [];

    for (const chunk of chunks) {
      try {
        const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        tickets.push(...ticketChunk);
      } catch (error) {
        console.error('Error al enviar chunk:', error);
      }
    }

    return {
      exito: true,
      mensaje: `Notificacion enviada a ${tokensDispositivos.length} dispositivos`,
      tickets
    };
  } catch (error) {
    console.error('Error en enviarNotificacionInmediata:', error);
    return { exito: false, mensaje: 'Error al enviar notificacion' };
  }
};

module.exports = {
  enviarNotificacionesProgramadas,
  enviarNotificacionInmediata
};