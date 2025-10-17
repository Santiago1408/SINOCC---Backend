const Zona = require('../modelos/Zona');
const { respuestaExitosa, respuestaError } = require('../utilidades/respuestas');

const crearZona = async (req, res) => {
  try {
    const { nombreZona } = req.body;

    const zonaExistente = await Zona.findOne({ where: { nombreZona } });

    if (zonaExistente) {
      return respuestaError(res, 'La zona ya existe', 400);
    }

    const nuevaZona = await Zona.create({ nombreZona });

    return respuestaExitosa(res, nuevaZona, 'Zona creada exitosamente', 201);
  } catch (error) {
    console.error('Error en crearZona:', error);
    return respuestaError(res, 'Error al crear zona', 500);
  }
};

const listarZonas = async (req, res) => {
  try {
    const zonas = await Zona.findAll({
      order: [['nombreZona', 'ASC']]
    });

    return respuestaExitosa(res, zonas, 'Zonas obtenidas exitosamente');
  } catch (error) {
    console.error('Error en listarZonas:', error);
    return respuestaError(res, 'Error al obtener zonas', 500);
  }
};

const obtenerZona = async (req, res) => {
  try {
    const { id } = req.params;

    const zona = await Zona.findByPk(id);

    if (!zona) {
      return respuestaError(res, 'Zona no encontrada', 404);
    }

    return respuestaExitosa(res, zona, 'Zona obtenida exitosamente');
  } catch (error) {
    console.error('Error en obtenerZona:', error);
    return respuestaError(res, 'Error al obtener zona', 500);
  }
};

const actualizarZona = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombreZona } = req.body;

    const zona = await Zona.findByPk(id);

    if (!zona) {
      return respuestaError(res, 'Zona no encontrada', 404);
    }

    if (nombreZona && nombreZona !== zona.nombreZona) {
      const zonaExistente = await Zona.findOne({ where: { nombreZona } });
      if (zonaExistente) {
        return respuestaError(res, 'El nombre de la zona ya existe', 400);
      }
    }

    await zona.update({ nombreZona });

    return respuestaExitosa(res, zona, 'Zona actualizada exitosamente');
  } catch (error) {
    console.error('Error en actualizarZona:', error);
    return respuestaError(res, 'Error al actualizar zona', 500);
  }
};

const eliminarZona = async (req, res) => {
  try {
    const { id } = req.params;

    const zona = await Zona.findByPk(id);

    if (!zona) {
      return respuestaError(res, 'Zona no encontrada', 404);
    }

    await zona.destroy();

    return respuestaExitosa(res, null, 'Zona eliminada exitosamente');
  } catch (error) {
    console.error('Error en eliminarZona:', error);
    return respuestaError(res, 'Error al eliminar zona', 500);
  }
};

module.exports = {
  crearZona,
  listarZonas,
  obtenerZona,
  actualizarZona,
  eliminarZona
};