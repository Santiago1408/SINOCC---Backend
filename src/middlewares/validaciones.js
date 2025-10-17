const { body, validationResult } = require('express-validator');
const { respuestaError } = require('../utilidades/respuestas');

const manejarErroresValidacion = (req, res, next) => {
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    return respuestaError(res, 'Errores de validacion', 400, errores.array());
  }
  next();
};

const validarRegistroUsuario = [
  body('nombre')
    .trim()
    .notEmpty().withMessage('El nombre es requerido')
    .isLength({ min: 2, max: 100 }).withMessage('El nombre debe tener entre 2 y 100 caracteres'),
  body('apellido')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('El apellido no puede exceder 100 caracteres'),
  body('correo')
    .trim()
    .notEmpty().withMessage('El correo es requerido')
    .isEmail().withMessage('Debe proporcionar un correo valido')
    .normalizeEmail(),
  body('contrasena')
    .notEmpty().withMessage('La contrasena es requerida')
    .isLength({ min: 6 }).withMessage('La contrasena debe tener al menos 6 caracteres'),
  body('idRol')
    .optional()
    .isInt().withMessage('El ID del rol debe ser un numero entero'),
  manejarErroresValidacion
];

const validarLogin = [
  body('correo')
    .trim()
    .notEmpty().withMessage('El correo es requerido')
    .isEmail().withMessage('Debe proporcionar un correo valido')
    .normalizeEmail(),
  body('contrasena')
    .notEmpty().withMessage('La contrasena es requerida'),
  manejarErroresValidacion
];

const validarCierre = [
  body('categoria')
    .optional()
    .trim()
    .isLength({ max: 20 }).withMessage('La categoria no puede exceder 20 caracteres'),
  body('lugarCierre')
    .trim()
    .notEmpty().withMessage('El lugar del cierre es requerido')
    .isLength({ max: 255 }).withMessage('El lugar del cierre no puede exceder 255 caracteres'),
  body('idZona')
    .optional()
    .isInt().withMessage('El ID de la zona debe ser un numero entero'),
  body('fechaInicio')
    .notEmpty().withMessage('La fecha de inicio es requerida')
    .isDate().withMessage('La fecha de inicio debe ser una fecha valida'),
  body('fechaFin')
    .notEmpty().withMessage('La fecha de fin es requerida')
    .isDate().withMessage('La fecha de fin debe ser una fecha valida')
    .custom((fechaFin, { req }) => {
      if (new Date(fechaFin) < new Date(req.body.fechaInicio)) {
        throw new Error('La fecha de fin debe ser posterior a la fecha de inicio');
      }
      return true;
    }),
  body('descripcion')
    .optional()
    .trim(),
  body('ubicaciones')
    .isArray({ min: 1 }).withMessage('Debe proporcionar al menos una ubicacion')
    .custom((ubicaciones) => {
      for (const ubicacion of ubicaciones) {
        if (!ubicacion.latitud || !ubicacion.longitud) {
          throw new Error('Cada ubicacion debe tener latitud y longitud');
        }
        if (isNaN(ubicacion.latitud) || isNaN(ubicacion.longitud)) {
          throw new Error('Latitud y longitud deben ser numeros validos');
        }
      }
      return true;
    }),
  manejarErroresValidacion
];

const validarZona = [
  body('nombreZona')
    .trim()
    .notEmpty().withMessage('El nombre de la zona es requerido')
    .isLength({ min: 2, max: 100 }).withMessage('El nombre de la zona debe tener entre 2 y 100 caracteres'),
  manejarErroresValidacion
];

const validarDispositivo = [
  body('tokenDispositivo')
    .trim()
    .notEmpty().withMessage('El token del dispositivo es requerido'),
  body('plataforma')
    .optional()
    .trim()
    .isLength({ max: 50 }).withMessage('La plataforma no puede exceder 50 caracteres'),
  manejarErroresValidacion
];

module.exports = {
  validarRegistroUsuario,
  validarLogin,
  validarCierre,
  validarZona,
  validarDispositivo
};