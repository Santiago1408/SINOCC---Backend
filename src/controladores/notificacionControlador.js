const Dispositivo = require('../modelos/Dispositivo');
const { respuestaExitosa, respuestaError } = require('../utilidades/respuestas');

const registrarDispositivo = async (req, res) => {
  try {
    const { tokenDispositivo, plataforma } = req.body;
    const idUsuario = req.usuario ? req.usuario.id : null;

    const [dispositivo, creado] = await Dispositivo.findOrCreate({
      where: { tokenDispositivo },
      defaults: {
        tokenDispositivo,
        idUsuario,
        plataforma: plataforma || 'desconocida',
        activo: true
      }
    });

    if (!creado) {
      await dispositivo.update({
        idUsuario,
        plataforma: plataforma || dispositivo.plataforma,
        activo: true
      });
    }

    return respuestaExitosa(
      res,
      dispositivo,
      creado ? 'Dispositivo registrado exitosamente' : 'Dispositivo actualizado exitosamente',
      creado ? 201 : 200
    );
  } catch (error) {
    console.error('Error en registrarDispositivo:', error);
    return respuestaError(res, 'Error al registrar dispositivo', 500);
  }
};

const desactivarDispositivo = async (req, res) => {
  try {
    const { tokenDispositivo } = req.body;

    const dispositivo = await Dispositivo.findOne({ where: { tokenDispositivo } });

    if (!dispositivo) {
      return respuestaError(res, 'Dispositivo no encontrado', 404);
    }

    await dispositivo.update({ activo: false });

    return respuestaExitosa(res, null, 'Dispositivo desactivado exitosamente');
  } catch (error) {
    console.error('Error en desactivarDispositivo:', error);
    return respuestaError(res, 'Error al desactivar dispositivo', 500);
  }
};

const listarDispositivosActivos = async (req, res) => {
  try {
    const dispositivos = await Dispositivo.findAll({
      where: { activo: true }
    });

    return respuestaExitosa(res, dispositivos, 'Dispositivos activos obtenidos exitosamente');
  } catch (error) {
    console.error('Error en listarDispositivosActivos:', error);
    return respuestaError(res, 'Error al obtener dispositivos activos', 500);
  }
};

module.exports = {
  registrarDispositivo,
  desactivarDispositivo,
  listarDispositivosActivos
};