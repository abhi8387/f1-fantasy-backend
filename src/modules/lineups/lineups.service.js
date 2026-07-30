const { sequelize, FantasyTeam, Race, Driver, Lineup, LineupPick } = require('../../database/models');
const ApiError = require('../../utils/ApiError');

const MAX_DRIVERS = 5;

async function getOrCreateTeam(userId) {
  let team = await FantasyTeam.findOne({ where: { userId } });
  if (!team) team = await FantasyTeam.create({ userId });
  return team;
}

async function submitLineup(userId, raceId, driverIds, captainId) {
  if (driverIds.length !== MAX_DRIVERS) {
    throw ApiError.badRequest(`Pick exactly ${MAX_DRIVERS} drivers`);
  }
  if (!driverIds.includes(captainId)) {
    throw ApiError.badRequest('Captain must be one of the picked drivers');
  }

  const race = await Race.findByPk(raceId);
  if (!race) throw ApiError.notFound('Race not found');
  if (race.isLocked) throw ApiError.badRequest('Lineups are locked for this race');
  if (!race.lineupOpensAt || new Date() < race.lineupOpensAt) {
    throw ApiError.badRequest('Lineup selection has not opened yet for this race (opens at Practice 1)');
  }

  const team = await getOrCreateTeam(userId);

  const drivers = await Driver.findAll({ where: { id: driverIds } });
  if (drivers.length !== driverIds.length) throw ApiError.badRequest('Invalid driver selection');

  const totalCost = drivers.reduce((sum, d) => sum + d.price, 0);
  if (totalCost > team.budget) throw ApiError.badRequest('Selection exceeds budget');

  return sequelize.transaction(async (t) => {
    await Lineup.destroy({ where: { teamId: team.id, raceId }, transaction: t });
    const lineup = await Lineup.create({ teamId: team.id, raceId }, { transaction: t });
    await LineupPick.bulkCreate(
      driverIds.map((driverId) => ({
        lineupId: lineup.id,
        driverId,
        isCaptain: driverId === captainId,
      })),
      { transaction: t }
    );
    return Lineup.findByPk(lineup.id, {
      include: [{ model: LineupPick, as: 'picks', include: [{ model: Driver, as: 'driver' }] }],
      transaction: t,
    });
  });
}

function getMyLineup(userId, raceId) {
  return Lineup.findOne({
    where: { raceId },
    include: [
      { model: FantasyTeam, as: 'team', where: { userId } },
      { model: LineupPick, as: 'picks', include: [{ model: Driver, as: 'driver' }] },
    ],
  });
}

module.exports = { getOrCreateTeam, submitLineup, getMyLineup };
