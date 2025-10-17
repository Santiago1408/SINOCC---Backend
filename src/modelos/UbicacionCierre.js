const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/baseDatos');
const Cierre = require('./Cierre');

const UbicacionCierre = sequelize.define('UbicacionCierre', {
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
  latitud: {
    type: DataTypes.DECIMAL(10, 7),
    allowNull: false
  },
  longitud: {
    type: DataTypes.DECIMAL(10, 7),
    allowNull: false
  }
}, {
  tableName: 'ubicacionesCierre',
  timestamps: false
});

UbicacionCierre.belongsTo(Cierre, { foreignKey: 'idCierre', as: 'cierre', onDelete: 'CASCADE' });
Cierre.hasMany(UbicacionCierre, { foreignKey: 'idCierre', as: 'ubicaciones' });

module.exports = UbicacionCierre;