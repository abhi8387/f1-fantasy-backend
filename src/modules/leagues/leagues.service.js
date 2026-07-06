const crypto = require('crypto');
const prisma = require('../../database/prisma');
const ApiError = require('../../utils/ApiError');

async function createLeague(userId, name) {
  const inviteCode = crypto.randomBytes(4).toString('hex').toUpperCase();
  const league = await prisma.league.create({
    data: {
      name,
      inviteCode,
      createdById: userId,
      members: { create: { userId } },
    },
  });
  return league;
}

async function joinLeague(userId, inviteCode) {
  const league = await prisma.league.findUnique({ where: { inviteCode } });
  if (!league) throw ApiError.notFound('Invalid invite code');

  const existing = await prisma.leagueMember.findUnique({
    where: { userId_leagueId: { userId, leagueId: league.id } },
  });
  if (existing) throw ApiError.conflict('You are already in this league');

  await prisma.leagueMember.create({ data: { userId, leagueId: league.id } });
  return league;
}

function getMyLeagues(userId) {
  return prisma.league.findMany({
    where: { members: { some: { userId } } },
    include: { _count: { select: { members: true } } },
  });
}

module.exports = { createLeague, joinLeague, getMyLeagues };
