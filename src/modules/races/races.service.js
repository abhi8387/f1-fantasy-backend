const axios = require('axios');
const { Op } = require('sequelize');
const { Race, Driver, RaceResult } = require('../../database/models');
const env = require('../../config/env');
const logger = require('../../config/logger');
const formatIST = require('../../utils/formatIST');
const ApiError = require('../../utils/ApiError');

// Team competitiveness tier -> base price. Rough real-world proxy, not an
// official valuation. Star drivers get a premium on top regardless of team.
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

async function findPracticeOneStart(meetingKey) {
  if (!meetingKey) return null;
  try {
    const { data } = await axios.get(`${env.OPENF1_BASE_URL}/sessions`, {
      params: { meeting_key: meetingKey, session_name: 'Practice 1' },
    });
    return data[0] ? new Date(data[0].date_start) : null;
  } catch (err) {
    logger.warn('Failed to fetch Practice 1 session', { meetingKey, error: err.message });
    return null;
  }
}

async function syncRaces(year = 2024) {
  const { data } = await axios.get(`${env.OPENF1_BASE_URL}/sessions`, {
    params: { session_type: 'Race', year },
  });

  let count = 0;
  for (const session of data) {
    if (session.session_name !== 'Race') continue;
    const existing = await Race.findOne({ where: { sessionKey: session.session_key } });
    if (existing) continue;

    const lineupOpensAt = await findPracticeOneStart(session.meeting_key);

    await Race.create({
      sessionKey: session.session_key,
      meetingKey: session.meeting_key,
      raceName: session.session_name,
      location: session.location,
      date: new Date(session.date_start),
      lineupOpensAt,
    });
    count++;
  }
  logger.info(`Synced ${count} new races`);
  return count;
}

async function syncDrivers(sessionKey) {
  const { data } = await axios.get(`${env.OPENF1_BASE_URL}/drivers`, {
    params: { session_key: sessionKey },
  });

  let count = 0;
  for (const d of data) {
    const existing = await Driver.findOne({
      where: { driverNumber: d.driver_number, sessionKey: Number(sessionKey) },
    });
    if (existing) continue;
    await Driver.create({
      driverNumber: d.driver_number,
      fullName: d.full_name,
      teamName: d.team_name,
      sessionKey: Number(sessionKey),
      price: computeDriverPrice(d.full_name, d.team_name),
    });
    count++;
  }
  logger.info(`Synced ${count} new drivers for session ${sessionKey}`);
  return count;
}

function getRaces() {
  const currentYear = new Date().getFullYear();
  return Race.findAll({
    where: {
      date: {
        [Op.gte]: new Date(`${currentYear}-01-01`),
        [Op.lt]: new Date(`${currentYear + 1}-01-01`),
      },
    },
    order: [['date', 'ASC']],
  });
}

function getResults(raceId) {
  return RaceResult.findAll({
    where: { raceId },
    include: [{ model: Driver, as: 'driver' }],
    order: [['position', 'ASC']],
  });
}

function getDrivers(sessionKey) {
  return Driver.findAll({ where: { sessionKey: Number(sessionKey) } });
}

async function getCountdown(raceId) {
  const race = await Race.findByPk(raceId);
  if (!race) throw ApiError.notFound('Race not found');

  const now = new Date();
  const opensAt = race.lineupOpensAt;
  const isOpen = Boolean(opensAt && now >= opensAt && !race.isLocked);
  const msUntilOpen = opensAt ? Math.max(0, opensAt.getTime() - now.getTime()) : null;

  return {
    raceId: race.id,
    raceName: race.raceName,
    location: race.location,
    raceDateIST: formatIST(race.date),
    lineupOpensAtIST: formatIST(opensAt),
    isLocked: race.isLocked,
    isOpen,
    msUntilOpen,
  };
}

module.exports = { syncRaces, syncDrivers, getRaces, getDrivers, getCountdown, getResults };
