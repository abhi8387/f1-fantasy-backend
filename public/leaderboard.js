if (!requireAuth()) throw new Error('redirecting');
renderNav('leagues.html');

const $ = (id) => document.getElementById(id);
const params = new URLSearchParams(window.location.search);
const leagueId = Number(params.get('leagueId'));

async function loadLeaderboard() {
  if (!leagueId) {
    $('leaderboardPanel').innerHTML = '<p class="muted">No league selected.</p>';
    return;
  }
  const board = await api(`/leaderboard/${leagueId}`);
  const rows = board
    .map((r, i) => `<tr><td>${i + 1}</td><td>${r.username}</td><td>${r.points}</td></tr>`)
    .join('');

  $('leaderboardPanel').innerHTML = `
    <table>
      <thead><tr><th>#</th><th>User</th><th>Points</th></tr></thead>
      <tbody>${rows || '<tr><td colspan="3" class="muted">No scores yet</td></tr>'}</tbody>
    </table>
  `;
}

loadLeaderboard();
