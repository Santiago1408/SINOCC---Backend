const jwt = require('jsonwebtoken');
const configuracion = require('../config/configuracion');
const { respuestaError } = require('../utilidades/respuestas');
const Usuario = require('../modelos/Usuario');
const Rol = require('../modelos/Rol');

const verificarToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return respuestaError(res, 'No se proporciono token de autenticacion', 401);
    }

    const decodificado = jwt.verify(token, configuracion.jwt.secreto);
    
    const usuario = await Usuario.findByPk(decodificado.id, {
      include: [{ model: Rol, as: 'rol' }]
    });

    if (!usuario) {
      return respuestaError(res, 'Usuario no encontrado', 404);
    }

    req.usuario = usuario;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return respuestaError(res, 'Token invalido', 401);
    }
    if (error.name === 'TokenExpiredError') {
      return respuestaError(res, 'Token expirado', 401);
    }
    return respuestaError(res, 'Error al verificar token', 500);
  }
};

const verificarRol = (...rolesPermitidos) => {
  return (req, res, next) => {
    if (!req.usuario) {
      return respuestaError(res, 'Usuario no autenticado', 401);
    }

    const nombreRol = req.usuario.rol?.nombreRol;

    if (!nombreRol || !rolesPermitidos.includes(nombreRol)) {
      return respuestaError(res, 'No tienes permisos para acceder a este recurso', 403);
    }

    next();
  };
};

const esSuperAdmin = verificarRol('superadmin');
const esAdministrador = verificarRol('administrador', 'superadmin');

module.exports = {
  verificarToken,
  verificarRol,
  esSuperAdmin,
  esAdministrador
};