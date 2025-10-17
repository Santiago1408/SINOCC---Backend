const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/baseDatos');
const Cierre = require('./Cierre');

const Notificacion = sequelize.define('Notificacion', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  idCierre: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'cierres',
      key: 'id'
    }
  },
  titulo: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  mensaje: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  fechaEnvio: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  enviado: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'createdAt'
  }
}, {
  tableName: 'notificaciones',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: false
});

Notificacion.belongsTo(Cierre, { foreignKey: 'idCierre', as: 'cierre', onDelete: 'CASCADE' });

module.exports = Notificacion;