const express = require('express');
const router = express.Router();
const {
  crearZona,
  listarZonas,
  obtenerZona,
  actualizarZona,
  eliminarZona
} = require('../controladores/zonaControlador');
const { validarZona } = require('../middlewares/validaciones');
const { verificarToken, esAdministrador } = require('../middlewares/autenticacion');

router.post('/', verificarToken, esAdministrador, validarZona, crearZona);

router.get('/', listarZonas);

router.get('/:id', obtenerZona);

router.put('/:id', verificarToken, esAdministrador, validarZona, actualizarZona);

router.delete('/:id', verificarToken, esAdministrador, eliminarZona);

module.exports = router;