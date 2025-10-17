const respuestaExitosa = (res, datos = null, mensaje = 'Operacion exitosa', codigo = 200) => {
  return res.status(codigo).json({
    exito: true,
    mensaje,
    datos
  });
};

const respuestaError = (res, mensaje = 'Error en el servidor', codigo = 500, errores = null) => {
  return res.status(codigo).json({
    exito: false,
    mensaje,
    errores
  });
};

module.exports = {
  respuestaExitosa,
  respuestaError
};