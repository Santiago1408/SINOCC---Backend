require('dotenv').config();
const { sequelize } = require('../src/config/baseDatos');
const Rol = require('../src/modelos/Rol');
const Usuario = require('../src/modelos/Usuario');
const Zona = require('../src/modelos/Zona');

const inicializarBaseDatos = async () => {
  try {
    console.log('Conectando a la base de datos...');
    await sequelize.authenticate();
    console.log('Conexión establecida');

    console.log('Sincronizando modelos...');
    await sequelize.sync({ force: false });
    console.log('Modelos sincronizados');

    // Crear roles
    const roles = [
      { nombreRol: 'usuario' },
      { nombreRol: 'administrador' },
      { nombreRol: 'superadmin' }
    ];

    for (const rol of roles) {
      await Rol.findOrCreate({
        where: { nombreRol: rol.nombreRol },
        defaults: rol
      });
    }
    console.log('Roles creados/verificados');

    // Crear zonas base
    const zonas = [
      { nombreZona: 'Quillacollo' },
      { nombreZona: 'Sacaba' },
      { nombreZona: 'Zona Centro' }
    ];

    for (const zona of zonas) {
      await Zona.findOrCreate({
        where: { nombreZona: zona.nombreZona },
        defaults: zona
      });
    }
    console.log('Zonas base creadas/verificadas');

    // Crear superadmin
    const rolSuperAdmin = await Rol.findOne({ where: { nombreRol: 'superadmin' } });
    
    const [superadmin, creado] = await Usuario.findOrCreate({
      where: { correo: 'superadmin@sinocc.com' },
      defaults: {
        nombre: 'Super',
        apellido: 'Administrador',
        correo: 'superadmin@sinocc.com',
        contrasena: 'admin123',
        idRol: rolSuperAdmin.id
      }
    });

    if (creado) {
      console.log('SuperAdmin creado:');
      console.log('Correo: superadmin@sinocc.com');
      console.log('Contraseña: admin123');
    } else {
      console.log('SuperAdmin ya existe');
    }

    console.log('\nBase de datos inicializada correctamente');
    process.exit(0);
  } catch (error) {
    console.error('Error al inicializar base de datos:', error);
    process.exit(1);
  }
};

inicializarBaseDatos();