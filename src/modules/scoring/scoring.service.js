const prisma = require('../../database/prisma');

// Simple fixed points table (college-project scope, not a scoring_rules table)
const POINTS_BY_POSITION = { 1: 25, 2: 18, 3: 15, 4: 12, 5: 10, 6: 8, 7: 6, 8: 4, 9: 2, 10: 1 };

async function submitResults(raceId, results) {
  // results: [{ driverId, position }]
  for (const r of results) {
    const points = POINTS_BY_POSITION[r.position] || 0;
    await prisma.raceResult.upsert({
      where: { raceId_driverId: { raceId, driverId: r.driverId } },
      update: { position: r.position, points },
      create: { raceId, driverId: r.driverId, position: r.position, points },
    });
  }
  await prisma.race.update({ where: { id: raceId }, data: { isLocked: true } });
  return results.length;
}

module.exports = { submitResults, POINTS_BY_POSITION };
