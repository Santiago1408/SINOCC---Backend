const { Op } = require('sequelize');
const Cierre = require('../modelos/Cierre');
const UbicacionCierre = require('../modelos/UbicacionCierre');
const Zona = require('../modelos/Zona');
const Notificacion = require('../modelos/Notificacion');
const { respuestaExitosa, respuestaError } = require('../utilidades/respuestas');

const crearCierre = async (req, res) => {
  try {
    const { 
      categoria, 
      lugarCierre, 
      idZona, 
      fechaInicio, 
      fechaFin, 
      horaInicio,
      horaFin,
      descripcion, 
      ubicaciones 
    } = req.body;

    // Crear el cierre con los nuevos campos
    const nuevoCierre = await Cierre.create({
      categoria,
      lugarCierre,
      idZona,
      fechaInicio: fechaInicio || null,
      fechaFin: fechaFin || null,
      horaInicio: horaInicio || null,
      horaFin: horaFin || null,
      descripcion
    });

    // Crear las ubicaciones asociadas
    const ubicacionesCreadas = await Promise.all(
      ubicaciones.map(ubicacion =>
        UbicacionCierre.create({
          idCierre: nuevoCierre.id,
          latitud: ubicacion.latitud,
          longitud: ubicacion.longitud
        })
      )
    );

    // Calcular fecha de notificación
    let fechaNotificacion;
    
    if (fechaInicio) {
      // Si hay fecha de inicio, notificar 24 horas antes
      fechaNotificacion = new Date(fechaInicio);
      fechaNotificacion.setDate(fechaNotificacion.getDate() - 1);
    } else {
      // Si solo hay horas, notificar el mismo día actual
      fechaNotificacion = new Date();
    }

    // Crear la notificación programada
    await Notificacion.create({
      idCierre: nuevoCierre.id,
      titulo: `Cierre programado: ${lugarCierre}`,
      mensaje: generarMensajeNotificacion(nuevoCierre),
      fechaEnvio: fechaNotificacion.toISOString().split('T')[0],
      enviado: false
    });

    // Obtener el cierre completo con relaciones
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

// Función auxiliar para generar mensaje de notificación
const generarMensajeNotificacion = (cierre) => {
  let mensaje = `Se ha programado el cierre de ${cierre.lugarCierre}`;
  
  if (cierre.fechaInicio && cierre.fechaFin) {
    mensaje += ` desde ${cierre.fechaInicio} hasta ${cierre.fechaFin}`;
  }
  
  if (cierre.horaInicio && cierre.horaFin) {
    mensaje += ` de ${cierre.horaInicio} a ${cierre.horaFin}`;
  }
  
  if (cierre.descripcion) {
    mensaje += `. ${cierre.descripcion}`;
  }
  
  return mensaje;
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
    const { 
      categoria, 
      lugarCierre, 
      idZona, 
      fechaInicio, 
      fechaFin, 
      horaInicio,
      horaFin,
      descripcion, 
      ubicaciones 
    } = req.body;

    const cierre = await Cierre.findByPk(id);

    if (!cierre) {
      return respuestaError(res, 'Cierre no encontrado', 404);
    }

    // Construir objeto de actualización
    const datosActualizados = {};
    if (categoria !== undefined) datosActualizados.categoria = categoria;
    if (lugarCierre) datosActualizados.lugarCierre = lugarCierre;
    if (idZona !== undefined) datosActualizados.idZona = idZona;
    if (fechaInicio !== undefined) datosActualizados.fechaInicio = fechaInicio || null;
    if (fechaFin !== undefined) datosActualizados.fechaFin = fechaFin || null;
    if (horaInicio !== undefined) datosActualizados.horaInicio = horaInicio || null;
    if (horaFin !== undefined) datosActualizados.horaFin = horaFin || null;
    if (descripcion !== undefined) datosActualizados.descripcion = descripcion;

    await cierre.update(datosActualizados);

    // Actualizar ubicaciones si se proporcionaron
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
    const ahora = new Date();
    const horaActual = `${ahora.getHours().toString().padStart(2, '0')}:${ahora.getMinutes().toString().padStart(2, '0')}:${ahora.getSeconds().toString().padStart(2, '0')}`;

    // Buscar cierres que estén activos AHORA
    const cierresActivos = await Cierre.findAll({
      where: {
        [Op.or]: [
          // Caso 1: Cierre por fechas (sin horas)
          {
            fechaInicio: {
              [Op.lte]: hoy
            },
            fechaFin: {
              [Op.gte]: hoy
            },
            horaInicio: null,
            horaFin: null
          },
          // Caso 2: Cierre por horas del día actual (sin fechas)
          {
            fechaInicio: null,
            fechaFin: null,
            horaInicio: {
              [Op.lte]: horaActual
            },
            horaFin: {
              [Op.gte]: horaActual
            }
          },
          // Caso 3: Cierre combinado (fechas + horas)
          {
            fechaInicio: {
              [Op.lte]: hoy
            },
            fechaFin: {
              [Op.gte]: hoy
            },
            horaInicio: {
              [Op.ne]: null
            },
            horaFin: {
              [Op.ne]: null
            }
          }
        ]
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