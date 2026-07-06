const prisma = require('../../database/prisma');
const ApiError = require('../../utils/ApiError');

async function getLeagueLeaderboard(leagueId) {
  const league = await prisma.league.findUnique({
    where: { id: leagueId },
    include: { members: { include: { user: true } } },
  });
  if (!league) throw ApiError.notFound('League not found');

  const rows = await Promise.all(
    league.members.map(async (member) => {
      const team = await prisma.fantasyTeam.findUnique({ where: { userId: member.userId } });
      if (!team) return { userId: member.userId, username: member.user.username, points: 0 };

      const picks = await prisma.lineupPick.findMany({
        where: { lineup: { teamId: team.id } },
        include: { driver: { include: { results: true } }, lineup: true },
      });

      let points = 0;
      for (const pick of picks) {
        const result = pick.driver.results.find((r) => r.raceId === pick.lineup.raceId);
        const driverPoints = result ? result.points : 0;
        points += pick.isCaptain ? driverPoints * 2 : driverPoints;
      }

      return { userId: member.userId, username: member.user.username, points };
    })
  );

  return rows.sort((a, b) => b.points - a.points);
}

module.exports = { getLeagueLeaderboard };
