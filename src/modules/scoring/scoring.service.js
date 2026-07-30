const { Race, RaceResult } = require('../../database/models');

// Simple fixed points table (college-project scope, not a scoring_rules table)
const POINTS_BY_POSITION = { 1: 25, 2: 18, 3: 15, 4: 12, 5: 10, 6: 8, 7: 6, 8: 4, 9: 2, 10: 1 };

async function submitResults(raceId, results) {
  // results: [{ driverId, position }]
  for (const r of results) {
    const points = POINTS_BY_POSITION[r.position] || 0;
    const [existing] = await RaceResult.findOrCreate({
      where: { raceId, driverId: r.driverId },
      defaults: { position: r.position, points },
    });
    await existing.update({ position: r.position, points });
  }
  await Race.update({ isLocked: true }, { where: { id: raceId } });
  return results.length;
}

module.exports = { submitResults, POINTS_BY_POSITION };
