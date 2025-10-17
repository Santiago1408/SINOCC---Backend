const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/baseDatos');
const Usuario = require('./Usuario');

const Dispositivo = sequelize.define('Dispositivo', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  tokenDispositivo: {
    type: DataTypes.TEXT,
    allowNull: false,
    unique: true
  },
  idUsuario: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'usuarios',
      key: 'id'
    }
  },
  plataforma: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'createdAt'
  }
}, {
  tableName: 'dispositivos',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: false
});

Dispositivo.belongsTo(Usuario, { foreignKey: 'idUsuario', as: 'usuario' });

module.exports = Dispositivo;