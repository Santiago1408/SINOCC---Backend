const { Op } = require('sequelize');
const Cierre = require('../modelos/Cierre');
const UbicacionCierre = require('../modelos/UbicacionCierre');
const Zona = require('../modelos/Zona');
const Notificacion = require('../modelos/Notificacion');
const { respuestaExitosa, respuestaError } = require('../utilidades/respuestas');

const crearCierre = async (req, res) => {
  try {
    const { categoria, lugarCierre, idZona, fechaInicio, fechaFin, descripcion, ubicaciones } = req.body;

    const nuevoCierre = await Cierre.create({
      categoria,
      lugarCierre,
      idZona,
      fechaInicio,
      fechaFin,
      descripcion,
    });

    const ubicacionesCreadas = await Promise.all(
      ubicaciones.map(ubicacion =>
        UbicacionCierre.create({
          idCierre: nuevoCierre.id,
          latitud: ubicacion.latitud,
          longitud: ubicacion.longitud
        })
      )
    );

    const fechaNotificacion = new Date(fechaInicio);
    fechaNotificacion.setDate(fechaNotificacion.getDate() - 1);

    await Notificacion.create({
      idCierre: nuevoCierre.id,
      titulo: `Cierre programado: ${lugarCierre}`,
      mensaje: `Se ha programado el cierre de ${lugarCierre} desde ${fechaInicio} hasta ${fechaFin}. ${descripcion || ''}`,
      fechaEnvio: fechaNotificacion.toISOString().split('T')[0],
      enviado: false
    });

    const cierreCompleto = await Cierre.findByPk(nuevoCierre.id, {
      include: [
        { model: Zona, as: 'zona' },
        { model: UbicacionCierre, as: 'ubicaciones' }
      ]
    });

    return respuestaExitosa(res, cierreCompleto, 'Cierre creado exitosamente', 201);
  } catch (error) {
    console.error('Error en crearCierre:', error);
    return respuestaError(res, 'Error al crear cierre', 500);
  }
};

const listarCierres = async (req, res) => {
  try {
    const { estado, zona, activos } = req.query;

    const condiciones = {};

    if (zona) {
      condiciones.idZona = zona;
    }

    if (activos === 'true') {
      const hoy = new Date().toISOString().split('T')[0];
      condiciones.fechaFin = {
        [Op.gte]: hoy
      };
    }

    const cierres = await Cierre.findAll({
      where: condiciones,
      include: [
        { model: Zona, as: 'zona' },
        { model: UbicacionCierre, as: 'ubicaciones' }
      ],
      order: [['fechaInicio', 'DESC']]
    });

    return respuestaExitosa(res, cierres, 'Cierres obtenidos exitosamente');
  } catch (error) {
    console.error('Error en listarCierres:', error);
    return respuestaError(res, 'Error al obtener cierres', 500);
  }
};

const obtenerCierre = async (req, res) => {
  try {
    const { id } = req.params;

    const cierre = await Cierre.findByPk(id, {
      include: [
        { model: Zona, as: 'zona' },
        { model: UbicacionCierre, as: 'ubicaciones' }
      ]
    });

    if (!cierre) {
      return respuestaError(res, 'Cierre no encontrado', 404);
    }

    return respuestaExitosa(res, cierre, 'Cierre obtenido exitosamente');
  } catch (error) {
    console.error('Error en obtenerCierre:', error);
    return respuestaError(res, 'Error al obtener cierre', 500);
  }
};

const actualizarCierre = async (req, res) => {
  try {
    const { id } = req.params;
    const { categoria, lugarCierre, idZona, fechaInicio, fechaFin, descripcion, estado, ubicaciones } = req.body;

    const cierre = await Cierre.findByPk(id);

    if (!cierre) {
      return respuestaError(res, 'Cierre no encontrado', 404);
    }

    const datosActualizados = {};
    if (categoria !== undefined) datosActualizados.categoria = categoria;
    if (lugarCierre) datosActualizados.lugarCierre = lugarCierre;
    if (idZona !== undefined) datosActualizados.idZona = idZona;
    if (fechaInicio) datosActualizados.fechaInicio = fechaInicio;
    if (fechaFin) datosActualizados.fechaFin = fechaFin;
    if (descripcion !== undefined) datosActualizados.descripcion = descripcion;

    await cierre.update(datosActualizados);

    if (ubicaciones && Array.isArray(ubicaciones)) {
      await UbicacionCierre.destroy({ where: { idCierre: id } });
      
      await Promise.all(
        ubicaciones.map(ubicacion =>
          UbicacionCierre.create({
            idCierre: id,
            latitud: ubicacion.latitud,
            longitud: ubicacion.longitud
          })
        )
      );
    }

    const cierreActualizado = await Cierre.findByPk(id, {
      include: [
        { model: Zona, as: 'zona' },
        { model: UbicacionCierre, as: 'ubicaciones' }
      ]
    });

    return respuestaExitosa(res, cierreActualizado, 'Cierre actualizado exitosamente');
  } catch (error) {
    console.error('Error en actualizarCierre:', error);
    return respuestaError(res, 'Error al actualizar cierre', 500);
  }
};

const eliminarCierre = async (req, res) => {
  try {
    const { id } = req.params;

    const cierre = await Cierre.findByPk(id);

    if (!cierre) {
      return respuestaError(res, 'Cierre no encontrado', 404);
    }

    await cierre.destroy();

    return respuestaExitosa(res, null, 'Cierre eliminado exitosamente');
  } catch (error) {
    console.error('Error en eliminarCierre:', error);
    return respuestaError(res, 'Error al eliminar cierre', 500);
  }
};

const obtenerCierresActivos = async (req, res) => {
  try {
    const hoy = new Date().toISOString().split('T')[0];

    const cierresActivos = await Cierre.findAll({
      where: {
        fechaInicio: {
          [Op.lte]: hoy
        },
        fechaFin: {
          [Op.gte]: hoy
        }
      },
      include: [
        { model: Zona, as: 'zona' },
        { model: UbicacionCierre, as: 'ubicaciones' }
      ]
    });

    return respuestaExitosa(res, cierresActivos, 'Cierres activos obtenidos exitosamente');
  } catch (error) {
    console.error('Error en obtenerCierresActivos:', error);
    return respuestaError(res, 'Error al obtener cierres activos', 500);
  }
};

module.exports = {
  crearCierre,
  listarCierres,
  obtenerCierre,
  actualizarCierre,
  eliminarCierre,
  obtenerCierresActivos
};