require('dotenv').config();
const { sequelize } = require('../src/config/baseDatos');
const Zona = require('../src/modelos/Zona');

const inicializarZonas = async () => {
  try {
    await sequelize.authenticate();
    console.log('Conexion a la base de datos establecida');

    const zonasBase = [
      { nombreZona: 'Quillacollo' },
      { nombreZona: 'Sacaba' },
      { nombreZona: 'Zona Centro' }
    ];

    for (const zonaData of zonasBase) {
      const [zona, creada] = await Zona.findOrCreate({
        where: { nombreZona: zonaData.nombreZona },
        defaults: zonaData
      });

      if (creada) {
        console.log(`Zona "${zona.nombreZona}" creada exitosamente`);
      } else {
        console.log(`Zona "${zona.nombreZona}" ya existe`);
      }
    }

    console.log('Proceso de inicializacion de zonas completado');
    process.exit(0);
  } catch (error) {
    console.error('Error al inicializar zonas:', error);
    process.exit(1);
  }
};

inicializarZonas();