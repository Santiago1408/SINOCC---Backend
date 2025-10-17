const Usuario = require('../modelos/Usuario');
const Rol = require('../modelos/Rol');
const { respuestaExitosa, respuestaError } = require('../utilidades/respuestas');

const crearAdministrador = async (req, res) => {
  try {
    const { nombre, apellido, correo, contrasena } = req.body;

    const usuarioExistente = await Usuario.findOne({ where: { correo } });

    if (usuarioExistente) {
      return respuestaError(res, 'El correo ya esta registrado', 400);
    }

    const rolAdmin = await Rol.findOne({ where: { nombreRol: 'administrador' } });

    if (!rolAdmin) {
      return respuestaError(res, 'Rol de administrador no encontrado', 500);
    }

    const nuevoAdmin = await Usuario.create({
      nombre,
      apellido,
      correo,
      contrasena,
      idRol: rolAdmin.id
    });

    const datosAdmin = {
      id: nuevoAdmin.id,
      nombre: nuevoAdmin.nombre,
      apellido: nuevoAdmin.apellido,
      correo: nuevoAdmin.correo,
      rol: 'administrador'
    };

    return respuestaExitosa(res, datosAdmin, 'Administrador creado exitosamente', 201);
  } catch (error) {
    console.error('Error en crearAdministrador:', error);
    return respuestaError(res, 'Error al crear administrador', 500);
  }
};

const listarUsuarios = async (req, res) => {
  try {
    const { rol } = req.query;

    const condiciones = {};
    
    if (rol) {
      const rolBuscado = await Rol.findOne({ where: { nombreRol: rol } });
      if (rolBuscado) {
        condiciones.idRol = rolBuscado.id;
      }
    }

    const usuarios = await Usuario.findAll({
      where: condiciones,
      include: [{ model: Rol, as: 'rol' }],
      attributes: { exclude: ['contrasena'] }
    });

    return respuestaExitosa(res, usuarios, 'Usuarios obtenidos exitosamente');
  } catch (error) {
    console.error('Error en listarUsuarios:', error);
    return respuestaError(res, 'Error al obtener usuarios', 500);
  }
};

const obtenerUsuario = async (req, res) => {
  try {
    const { id } = req.params;

    const usuario = await Usuario.findByPk(id, {
      include: [{ model: Rol, as: 'rol' }],
      attributes: { exclude: ['contrasena'] }
    });

    if (!usuario) {
      return respuestaError(res, 'Usuario no encontrado', 404);
    }

    return respuestaExitosa(res, usuario, 'Usuario obtenido exitosamente');
  } catch (error) {
    console.error('Error en obtenerUsuario:', error);
    return respuestaError(res, 'Error al obtener usuario', 500);
  }
};

const actualizarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, apellido, correo, contrasena } = req.body;

    const usuario = await Usuario.findByPk(id);

    if (!usuario) {
      return respuestaError(res, 'Usuario no encontrado', 404);
    }

    if (correo && correo !== usuario.correo) {
      const correoExistente = await Usuario.findOne({ where: { correo } });
      if (correoExistente) {
        return respuestaError(res, 'El correo ya esta registrado', 400);
      }
    }

    const datosActualizados = {};
    if (nombre) datosActualizados.nombre = nombre;
    if (apellido) datosActualizados.apellido = apellido;
    if (correo) datosActualizados.correo = correo;
    if (contrasena) datosActualizados.contrasena = contrasena;

    await usuario.update(datosActualizados);

    const usuarioActualizado = await Usuario.findByPk(id, {
      include: [{ model: Rol, as: 'rol' }],
      attributes: { exclude: ['contrasena'] }
    });

    return respuestaExitosa(res, usuarioActualizado, 'Usuario actualizado exitosamente');
  } catch (error) {
    console.error('Error en actualizarUsuario:', error);
    return respuestaError(res, 'Error al actualizar usuario', 500);
  }
};

const eliminarUsuario = async (req, res) => {
  try {
    const { id } = req.params;

    const usuario = await Usuario.findByPk(id);

    if (!usuario) {
      return respuestaError(res, 'Usuario no encontrado', 404);
    }

    await usuario.destroy();

    return respuestaExitosa(res, null, 'Usuario eliminado exitosamente');
  } catch (error) {
    console.error('Error en eliminarUsuario:', error);
    return respuestaError(res, 'Error al eliminar usuario', 500);
  }
};

module.exports = {
  crearAdministrador,
  listarUsuarios,
  obtenerUsuario,
  actualizarUsuario,
  eliminarUsuario
};