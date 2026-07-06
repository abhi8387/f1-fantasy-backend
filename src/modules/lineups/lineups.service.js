const prisma = require('../../database/prisma');
const ApiError = require('../../utils/ApiError');

const MAX_DRIVERS = 5;

async function getOrCreateTeam(userId) {
  let team = await prisma.fantasyTeam.findUnique({ where: { userId } });
  if (!team) team = await prisma.fantasyTeam.create({ data: { userId } });
  return team;
}

async function submitLineup(userId, raceId, driverIds, captainId) {
  if (driverIds.length !== MAX_DRIVERS) {
    throw ApiError.badRequest(`Pick exactly ${MAX_DRIVERS} drivers`);
  }
  if (!driverIds.includes(captainId)) {
    throw ApiError.badRequest('Captain must be one of the picked drivers');
  }

  const race = await prisma.race.findUnique({ where: { id: raceId } });
  if (!race) throw ApiError.notFound('Race not found');
  if (race.isLocked) throw ApiError.badRequest('Lineups are locked for this race');
  if (!race.lineupOpensAt || new Date() < race.lineupOpensAt) {
    throw ApiError.badRequest('Lineup selection has not opened yet for this race (opens at Practice 1)');
  }

  const team = await getOrCreateTeam(userId);

  const drivers = await prisma.driver.findMany({ where: { id: { in: driverIds } } });
  if (drivers.length !== driverIds.length) throw ApiError.badRequest('Invalid driver selection');

  const totalCost = drivers.reduce((sum, d) => sum + d.price, 0);
  if (totalCost > team.budget) throw ApiError.badRequest('Selection exceeds budget');

  return prisma.$transaction(async (tx) => {
    await tx.lineup.deleteMany({ where: { teamId: team.id, raceId } });
    const lineup = await tx.lineup.create({
      data: {
        teamId: team.id,
        raceId,
        picks: {
          create: driverIds.map((driverId) => ({
            driverId,
            isCaptain: driverId === captainId,
          })),
        },
      },
      include: { picks: { include: { driver: true } } },
    });
    return lineup;
  });
}

function getMyLineup(userId, raceId) {
  return prisma.lineup.findFirst({
    where: { team: { userId }, raceId },
    include: { picks: { include: { driver: true } } },
  });
}

module.exports = { getOrCreateTeam, submitLineup, getMyLineup };
