const crypto = require('crypto');
const { Sequelize } = require('sequelize');
const { League, LeagueMember } = require('../../database/models');
const ApiError = require('../../utils/ApiError');

async function createLeague(userId, name) {
  const inviteCode = crypto.randomBytes(4).toString('hex').toUpperCase();
  const league = await League.create({ name, inviteCode, createdById: userId });
  await LeagueMember.create({ userId, leagueId: league.id });
  return league;
}

async function joinLeague(userId, inviteCode) {
  const league = await League.findOne({ where: { inviteCode } });
  if (!league) throw ApiError.notFound('Invalid invite code');

  const existing = await LeagueMember.findOne({ where: { userId, leagueId: league.id } });
  if (existing) throw ApiError.conflict('You are already in this league');

  await LeagueMember.create({ userId, leagueId: league.id });
  return league;
}

async function getMyLeagues(userId) {
  const memberships = await LeagueMember.findAll({ where: { userId }, attributes: ['leagueId'] });
  const leagueIds = memberships.map((m) => m.leagueId);
  if (leagueIds.length === 0) return [];

  const leagues = await League.findAll({
    where: { id: leagueIds },
    attributes: {
      include: [[Sequelize.fn('COUNT', Sequelize.col('members.id')), 'memberCount']],
    },
    include: [{ model: LeagueMember, as: 'members', attributes: [] }],
    group: ['League.id'],
  });

  return leagues.map((l) => {
    const plain = l.get({ plain: true });
    return { ...plain, _count: { members: Number(plain.memberCount) } };
  });
}

module.exports = { createLeague, joinLeague, getMyLeagues };
