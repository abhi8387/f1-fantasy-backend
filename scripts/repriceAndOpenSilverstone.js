// One-off maintenance script: re-price existing drivers with the new talent
// tier formula, and force-open the Silverstone race lineup window for manual
// testing (it already happened, so it'd normally be locked/read-only).
require('dotenv').config();
const { sequelize, Driver, Race } = require('../src/database/models');

const TEAM_TIER_PRICE = {
  'Red Bull Racing': 22,
  Ferrari: 22,
  Mercedes: 20,
  McLaren: 20,
  'Aston Martin': 15,
  Alpine: 13,
  Williams: 11,
  RB: 11,
  'Racing Bulls': 11,
  'Haas F1 Team': 10,
  'Kick Sauber': 9,
};
const STAR_DRIVERS = ['HAMILTON', 'VERSTAPPEN', 'LECLERC', 'NORRIS', 'ALONSO', 'RUSSELL', 'PIASTRI', 'PEREZ'];
const MAX_PRICE = 30;

function computeDriverPrice(fullName, teamName) {
  const base = TEAM_TIER_PRICE[teamName] || 10;
  const isStar = STAR_DRIVERS.some((name) => fullName.toUpperCase().includes(name));
  return Math.min(MAX_PRICE, base + (isStar ? 5 : 0));
}

async function main() {
  const drivers = await Driver.findAll();
  for (const d of drivers) {
    const price = computeDriverPrice(d.fullName, d.teamName);
    if (price !== d.price) {
      await d.update({ price });
    }
  }
  console.log(`Repriced ${drivers.length} drivers`);

  const silverstone = await Race.findOne({ where: { location: 'Silverstone' } });
  if (silverstone) {
    await silverstone.update({
      lineupOpensAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      isLocked: false,
    });
    console.log(`Force-opened Silverstone (race id ${silverstone.id}) for testing`);
  } else {
    console.log('No Silverstone race found - sync 2026 races first');
  }
}

main().finally(() => sequelize.close());
