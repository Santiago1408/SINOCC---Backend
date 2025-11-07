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
  
  // Fechas son opcionales
  body('fechaInicio')
    .optional({ nullable: true })
    .isDate().withMessage('La fecha de inicio debe ser una fecha valida'),
  
  body('fechaFin')
    .optional({ nullable: true })
    .isDate().withMessage('La fecha de fin debe ser una fecha valida')
    .custom((fechaFin, { req }) => {
      // Solo validar si ambas fechas están presentes
      if (fechaFin && req.body.fechaInicio && new Date(fechaFin) < new Date(req.body.fechaInicio)) {
        throw new Error('La fecha de fin debe ser posterior o igual a la fecha de inicio');
      }
      return true;
    }),
  
  // Horas son opcionales
  body('horaInicio')
    .optional({ nullable: true })
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/)
    .withMessage('La hora de inicio debe tener formato HH:MM o HH:MM:SS'),
  
  body('horaFin')
    .optional({ nullable: true })
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/)
    .withMessage('La hora de fin debe tener formato HH:MM o HH:MM:SS')
    .custom((horaFin, { req }) => {
      // Si hay horas pero no hay fechas, la hora fin debe ser después de hora inicio
      if (horaFin && req.body.horaInicio && !req.body.fechaInicio && !req.body.fechaFin) {
        if (horaFin <= req.body.horaInicio) {
          throw new Error('La hora de fin debe ser posterior a la hora de inicio');
        }
      }
      return true;
    }),
  
  // Validación personalizada: al menos fechas O horas deben estar presentes
  body('fechaInicio').custom((value, { req }) => {
    const tieneFechas = req.body.fechaInicio || req.body.fechaFin;
    const tieneHoras = req.body.horaInicio || req.body.horaFin;
    
    if (!tieneFechas && !tieneHoras) {
      throw new Error('Debe proporcionar al menos fechas (inicio/fin) o horas (inicio/fin)');
    }
    
    // Si hay fechas, ambas deben estar presentes
    if ((req.body.fechaInicio && !req.body.fechaFin) || (!req.body.fechaInicio && req.body.fechaFin)) {
      throw new Error('Si proporciona fechas, debe incluir tanto fecha de inicio como fecha de fin');
    }
    
    // Si hay horas, ambas deben estar presentes
    if ((req.body.horaInicio && !req.body.horaFin) || (!req.body.horaInicio && req.body.horaFin)) {
      throw new Error('Si proporciona horas, debe incluir tanto hora de inicio como hora de fin');
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