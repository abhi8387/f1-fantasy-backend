const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./User');

const League = sequelize.define('League', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  inviteCode: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  createdBy: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  }
}, {
  timestamps: true
});

module.exports = League;