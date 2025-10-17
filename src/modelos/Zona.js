const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/baseDatos');

const Zona = sequelize.define('Zona', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombreZona: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  }
}, {
  tableName: 'zonas',
  timestamps: false
});

module.exports = Zona;