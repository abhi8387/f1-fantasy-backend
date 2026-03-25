const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./User');
const League = require('./League');

const LeagueMember = sequelize.define('LeagueMember', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },
  leagueId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: League,
      key: 'id'
    }
  }
}, {
  timestamps: true
});

module.exports = LeagueMember;