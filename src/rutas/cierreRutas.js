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
const { verificarToken, esAdministrador } = require('../middlewares/autenticacion');

router.post('/', verificarToken, esAdministrador, validarCierre, crearCierre);

router.get('/', listarCierres);

router.get('/activos', obtenerCierresActivos);

router.get('/:id', obtenerCierre);

router.put('/:id', verificarToken, esAdministrador, actualizarCierre);

router.delete('/:id', verificarToken, esAdministrador, eliminarCierre);

module.exports = router;