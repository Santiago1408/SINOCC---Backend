const express = require('express');
const router = express.Router();
const {
  registrarDispositivo,
  desactivarDispositivo,
  listarDispositivosActivos
} = require('../controladores/notificacionControlador');
const { validarDispositivo } = require('../middlewares/validaciones');
const { verificarToken } = require('../middlewares/autenticacion');

router.post('/dispositivo', validarDispositivo, registrarDispositivo);

router.post('/dispositivo/desactivar', desactivarDispositivo);

router.get('/dispositivos', verificarToken, listarDispositivosActivos);

module.exports = router;