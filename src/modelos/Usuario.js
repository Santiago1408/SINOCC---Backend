const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/baseDatos');
const bcrypt = require('bcrypt');
const Rol = require('./Rol');

const Usuario = sequelize.define('Usuario', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  apellido: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  correo: {
    type: DataTypes.STRING(100),
    allowNull: true,
    unique: true
  },
  contrasena: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  idRol: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'roles',
      key: 'id'
    }
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'createdAt'
  },
  modifiedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'modifiedAt'
  }
}, {
  tableName: 'usuarios',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'modifiedAt',
  hooks: {
    beforeCreate: async (usuario) => {
      if (usuario.contrasena) {
        const sal = await bcrypt.genSalt(10);
        usuario.contrasena = await bcrypt.hash(usuario.contrasena, sal);
      }
    },
    beforeUpdate: async (usuario) => {
      if (usuario.changed('contrasena')) {
        const sal = await bcrypt.genSalt(10);
        usuario.contrasena = await bcrypt.hash(usuario.contrasena, sal);
      }
    }
  }
});

Usuario.prototype.verificarContrasena = async function(contrasenaIngresada) {
  return await bcrypt.compare(contrasenaIngresada, this.contrasena);
};

Usuario.belongsTo(Rol, { foreignKey: 'idRol', as: 'rol' });

module.exports = Usuario;