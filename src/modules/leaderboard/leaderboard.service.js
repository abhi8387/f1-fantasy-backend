const { League, LeagueMember, User, FantasyTeam, LineupPick, Lineup, Driver, RaceResult } = require('../../database/models');
const ApiError = require('../../utils/ApiError');

async function getLeagueLeaderboard(leagueId) {
  const league = await League.findByPk(leagueId, {
    include: [{ model: LeagueMember, as: 'members', include: [{ model: User }] }],
  });
  if (!league) throw ApiError.notFound('League not found');

  const rows = await Promise.all(
    league.members.map(async (member) => {
      const team = await FantasyTeam.findOne({ where: { userId: member.userId } });
      if (!team) return { userId: member.userId, username: member.User.username, points: 0 };

      const picks = await LineupPick.findAll({
        include: [
          { model: Lineup, as: 'lineup', where: { teamId: team.id } },
          { model: Driver, as: 'driver', include: [{ model: RaceResult, as: 'results' }] },
        ],
      });

      let points = 0;
      for (const pick of picks) {
        const result = pick.driver.results.find((r) => r.raceId === pick.lineup.raceId);
        const driverPoints = result ? result.points : 0;
        points += pick.isCaptain ? driverPoints * 2 : driverPoints;
      }

      return { userId: member.userId, username: member.User.username, points };
    })
  );

  return rows.sort((a, b) => b.points - a.points);
}

module.exports = { getLeagueLeaderboard };
