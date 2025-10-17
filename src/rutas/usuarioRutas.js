const express = require('express');
const router = express.Router();
const {
  crearAdministrador,
  listarUsuarios,
  obtenerUsuario,
  actualizarUsuario,
  eliminarUsuario
} = require('../controladores/usuarioControlador');
const { validarRegistroUsuario } = require('../middlewares/validaciones');
const { verificarToken, esSuperAdmin } = require('../middlewares/autenticacion');

router.post('/administrador', verificarToken, esSuperAdmin, validarRegistroUsuario, crearAdministrador);

router.get('/', verificarToken, esSuperAdmin, listarUsuarios);

router.get('/:id', verificarToken, esSuperAdmin, obtenerUsuario);

router.put('/:id', verificarToken, esSuperAdmin, actualizarUsuario);

router.delete('/:id', verificarToken, esSuperAdmin, eliminarUsuario);

module.exports = router;