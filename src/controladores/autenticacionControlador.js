const jwt = require('jsonwebtoken');
const Usuario = require('../modelos/Usuario');
const Rol = require('../modelos/Rol');
const Dispositivo = require('../modelos/Dispositivo');
const configuracion = require('../config/configuracion');
const { respuestaExitosa, respuestaError } = require('../utilidades/respuestas');

const generarToken = (id) => {
  return jwt.sign({ id }, configuracion.jwt.secreto, {
    expiresIn: configuracion.jwt.expiracion
  });
};

const iniciarSesion = async (req, res) => {
  try {
    const { correo, contrasena, tokenDispositivo, plataforma } = req.body;

    const usuario = await Usuario.findOne({
      where: { correo },
      include: [{ model: Rol, as: 'rol' }]
    });

    if (!usuario) {
      return respuestaError(res, 'Credenciales invalidas', 401);
    }

    const contrasenaValida = await usuario.verificarContrasena(contrasena);

    if (!contrasenaValida) {
      return respuestaError(res, 'Credenciales invalidas', 401);
    }

    if (tokenDispositivo) {
      await Dispositivo.findOrCreate({
        where: { tokenDispositivo },
        defaults: {
          tokenDispositivo,
          idUsuario: usuario.id,
          plataforma: plataforma || 'desconocida',
          activo: true
        }
      });
    }

    const token = generarToken(usuario.id);

    const datosUsuario = {
      id: usuario.id,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      correo: usuario.correo,
      rol: usuario.rol?.nombreRol,
      token
    };

    return respuestaExitosa(res, datosUsuario, 'Inicio de sesion exitoso', 200);
  } catch (error) {
    console.error('Error en iniciarSesion:', error);
    return respuestaError(res, 'Error al iniciar sesion', 500);
  }
};

const registrarUsuarioComun = async (req, res) => {
  try {
    const { nombre, apellido, tokenDispositivo, plataforma } = req.body;

    const rolUsuario = await Rol.findOne({ where: { nombreRol: 'usuario' } });

    if (!rolUsuario) {
      return respuestaError(res, 'Rol de usuario no encontrado', 500);
    }

    const nuevoUsuario = await Usuario.create({
      nombre,
      apellido,
      idRol: rolUsuario.id
    });

    if (tokenDispositivo) {
      await Dispositivo.create({
        tokenDispositivo,
        idUsuario: nuevoUsuario.id,
        plataforma: plataforma || 'desconocida',
        activo: true
      });
    }

    const token = generarToken(nuevoUsuario.id);

    const datosUsuario = {
      id: nuevoUsuario.id,
      nombre: nuevoUsuario.nombre,
      apellido: nuevoUsuario.apellido,
      rol: 'usuario',
      token
    };

    return respuestaExitosa(res, datosUsuario, 'Usuario registrado exitosamente', 201);
  } catch (error) {
    console.error('Error en registrarUsuarioComun:', error);
    return respuestaError(res, 'Error al registrar usuario', 500);
  }
};

const obtenerPerfil = async (req, res) => {
  try {
    const datosUsuario = {
      id: req.usuario.id,
      nombre: req.usuario.nombre,
      apellido: req.usuario.apellido,
      correo: req.usuario.correo,
      rol: req.usuario.rol?.nombreRol
    };

    return respuestaExitosa(res, datosUsuario, 'Perfil obtenido exitosamente');
  } catch (error) {
    console.error('Error en obtenerPerfil:', error);
    return respuestaError(res, 'Error al obtener perfil', 500);
  }
};

module.exports = {
  iniciarSesion,
  registrarUsuarioComun,
  obtenerPerfil
};