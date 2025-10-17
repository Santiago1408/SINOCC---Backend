require('dotenv').config();
const { sequelize } = require('../src/config/baseDatos');
const Rol = require('../src/modelos/Rol');
const Usuario = require('../src/modelos/Usuario');

const inicializarRoles = async () => {
  try {
    await sequelize.authenticate();
    console.log('Conexion a la base de datos establecida');

    const rolesExistentes = await Rol.count();
    
    if (rolesExistentes > 0) {
      console.log('Los roles ya han sido inicializados');
      process.exit(0);
    }

    const roles = [
      { nombreRol: 'usuario' },
      { nombreRol: 'administrador' },
      { nombreRol: 'superadmin' }
    ];

    await Rol.bulkCreate(roles);
    console.log('Roles creados exitosamente');

    const rolSuperAdmin = await Rol.findOne({ where: { nombreRol: 'superadmin' } });

    await Usuario.create({
      nombre: 'Super',
      apellido: 'Administrador',
      correo: 'superadmin@sinocc.com',
      contrasena: 'admin123',
      idRol: rolSuperAdmin.id
    });

    console.log('Usuario superadmin creado exitosamente');
    console.log('Correo: superadmin@sinocc.com');
    console.log('Contrasena: admin123');
    console.log('IMPORTANTE: Cambia esta contrasena inmediatamente en produccion');

    process.exit(0);
  } catch (error) {
    console.error('Error al inicializar roles:', error);
    process.exit(1);
  }
};

inicializarRoles();