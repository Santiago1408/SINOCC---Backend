const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/baseDatos');
const Zona = require('./Zona');

const Cierre = sequelize.define('Cierre', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  categoria: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  lugarCierre: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  idZona: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'zonas',
      key: 'id'
    }
  },
  fechaInicio: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  fechaFin: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true
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
  tableName: 'cierres',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'modifiedAt'
});

Cierre.belongsTo(Zona, { foreignKey: 'idZona', as: 'zona' });

module.exports = Cierre;