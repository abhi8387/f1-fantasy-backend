const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Race = sequelize.define('Race', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  sessionKey: {
    type: DataTypes.INTEGER,
    unique: true,
    allowNull: false
  },
  raceName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  location: {
    type: DataTypes.STRING,
    allowNull: false
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  isLocked: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  timestamps: true
});

module.exports = Race;