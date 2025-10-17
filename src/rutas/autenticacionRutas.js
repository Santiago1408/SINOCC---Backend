const express = require('express');
const router = express.Router();
const { iniciarSesion, registrarUsuarioComun, obtenerPerfil } = require('../controladores/autenticacionControlador');
const { validarLogin } = require('../middlewares/validaciones');
const { verificarToken } = require('../middlewares/autenticacion');

router.post('/login', validarLogin, iniciarSesion);

router.post('/registro', registrarUsuarioComun);

router.get('/perfil', verificarToken, obtenerPerfil);

module.exports = router;