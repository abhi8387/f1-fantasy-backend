const { DataTypes } = require('sequelize');
const sequelize = require('./sequelize');

const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  username: { type: DataTypes.STRING, allowNull: false, unique: true },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  passwordHash: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.ENUM('USER', 'ADMIN'), allowNull: false, defaultValue: 'USER' },
}, { tableName: 'users' });

const League = sequelize.define('League', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  inviteCode: { type: DataTypes.STRING, allowNull: false, unique: true },
  createdById: { type: DataTypes.INTEGER, allowNull: false },
}, { tableName: 'leagues' });

const LeagueMember = sequelize.define('LeagueMember', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  leagueId: { type: DataTypes.INTEGER, allowNull: false },
  joinedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
}, {
  tableName: 'league_members',
  indexes: [{ unique: true, fields: ['user_id', 'league_id'] }],
});

const Race = sequelize.define('Race', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  sessionKey: { type: DataTypes.INTEGER, allowNull: false, unique: true },
  meetingKey: { type: DataTypes.INTEGER, allowNull: true },
  raceName: { type: DataTypes.STRING, allowNull: false },
  location: { type: DataTypes.STRING, allowNull: false },
  date: { type: DataTypes.DATE, allowNull: false },
  lineupOpensAt: { type: DataTypes.DATE, allowNull: true },
  isLocked: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
}, { tableName: 'races' });

const Driver = sequelize.define('Driver', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  driverNumber: { type: DataTypes.INTEGER, allowNull: false },
  fullName: { type: DataTypes.STRING, allowNull: false },
  teamName: { type: DataTypes.STRING, allowNull: false },
  sessionKey: { type: DataTypes.INTEGER, allowNull: false },
  price: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 10 },
}, {
  tableName: 'drivers',
  indexes: [{ unique: true, fields: ['driver_number', 'session_key'] }],
});

const RaceResult = sequelize.define('RaceResult', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  raceId: { type: DataTypes.INTEGER, allowNull: false },
  driverId: { type: DataTypes.INTEGER, allowNull: false },
  position: { type: DataTypes.INTEGER, allowNull: false },
  points: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
}, {
  tableName: 'race_results',
  indexes: [{ unique: true, fields: ['race_id', 'driver_id'] }],
});

const FantasyTeam = sequelize.define('FantasyTeam', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.INTEGER, allowNull: false, unique: true },
  budget: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 90 },
}, { tableName: 'fantasy_teams' });

const Lineup = sequelize.define('Lineup', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  teamId: { type: DataTypes.INTEGER, allowNull: false },
  raceId: { type: DataTypes.INTEGER, allowNull: false },
}, {
  tableName: 'lineups',
  indexes: [{ unique: true, fields: ['team_id', 'race_id'] }],
});

const LineupPick = sequelize.define('LineupPick', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  lineupId: { type: DataTypes.INTEGER, allowNull: false },
  driverId: { type: DataTypes.INTEGER, allowNull: false },
  isCaptain: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
}, {
  tableName: 'lineup_picks',
  indexes: [{ unique: true, fields: ['lineup_id', 'driver_id'] }],
});

// Associations
User.hasMany(League, { foreignKey: 'createdById', as: 'leaguesCreated', onDelete: 'CASCADE' });
League.belongsTo(User, { foreignKey: 'createdById', as: 'createdBy' });

User.hasMany(LeagueMember, { foreignKey: 'userId', onDelete: 'CASCADE' });
LeagueMember.belongsTo(User, { foreignKey: 'userId' });
League.hasMany(LeagueMember, { foreignKey: 'leagueId', as: 'members', onDelete: 'CASCADE' });
LeagueMember.belongsTo(League, { foreignKey: 'leagueId' });

Race.hasMany(Driver, { foreignKey: 'sessionKey', sourceKey: 'sessionKey', onDelete: 'CASCADE' });
Driver.belongsTo(Race, { foreignKey: 'sessionKey', targetKey: 'sessionKey' });

Race.hasMany(RaceResult, { foreignKey: 'raceId', onDelete: 'CASCADE' });
RaceResult.belongsTo(Race, { foreignKey: 'raceId' });
Driver.hasMany(RaceResult, { foreignKey: 'driverId', as: 'results', onDelete: 'CASCADE' });
RaceResult.belongsTo(Driver, { foreignKey: 'driverId', as: 'driver' });

User.hasOne(FantasyTeam, { foreignKey: 'userId', onDelete: 'CASCADE' });
FantasyTeam.belongsTo(User, { foreignKey: 'userId' });

FantasyTeam.hasMany(Lineup, { foreignKey: 'teamId', onDelete: 'CASCADE' });
Lineup.belongsTo(FantasyTeam, { foreignKey: 'teamId', as: 'team' });
Race.hasMany(Lineup, { foreignKey: 'raceId', onDelete: 'CASCADE' });
Lineup.belongsTo(Race, { foreignKey: 'raceId', as: 'race' });

Lineup.hasMany(LineupPick, { foreignKey: 'lineupId', as: 'picks', onDelete: 'CASCADE' });
LineupPick.belongsTo(Lineup, { foreignKey: 'lineupId', as: 'lineup' });
Driver.hasMany(LineupPick, { foreignKey: 'driverId', as: 'picks', onDelete: 'CASCADE' });
LineupPick.belongsTo(Driver, { foreignKey: 'driverId', as: 'driver' });

module.exports = {
  sequelize,
  User,
  League,
  LeagueMember,
  Race,
  Driver,
  RaceResult,
  FantasyTeam,
  Lineup,
  LineupPick,
};
