const express = require('express');
const router = express.Router();
const {
  crearCierre,
  listarCierres,
  obtenerCierre,
  actualizarCierre,
  eliminarCierre,
  obtenerCierresActivos
} = require('../controladores/cierreControlador');
const { validarCierre } = require('../middlewares/validaciones');
const { verificarToken, verificarRol } = require('../middlewares/autenticacion');

// Crear verificador que acepta administrador y superadmin
const puedeGestionarCierres = verificarRol('administrador', 'superadmin');

// Crear cierre - Admin y SuperAdmin
router.post('/', verificarToken, puedeGestionarCierres, validarCierre, crearCierre);

// Listar cierres - Público
router.get('/', listarCierres);

// Obtener cierres activos - Público
router.get('/activos', obtenerCierresActivos);

// Obtener cierre por ID - Público
router.get('/:id', obtenerCierre);

// Actualizar cierre - Admin y SuperAdmin
router.put('/:id', verificarToken, puedeGestionarCierres, actualizarCierre);

// Eliminar cierre - Admin y SuperAdmin
router.delete('/:id', verificarToken, puedeGestionarCierres, eliminarCierre);

module.exports = router;