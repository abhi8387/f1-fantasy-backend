if (!requireAuth()) throw new Error('redirecting');
renderNav('leagues.html');

const $ = (id) => document.getElementById(id);

$('createLeagueForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  try {
    await api('/leagues', { method: 'POST', body: JSON.stringify({ name: $('leagueName').value }) });
    $('leagueName').value = '';
    loadLeagues();
  } catch (err) {
    alert(err.message);
  }
});

$('joinLeagueForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  try {
    await api('/leagues/join', { method: 'POST', body: JSON.stringify({ inviteCode: $('inviteCode').value }) });
    $('inviteCode').value = '';
    loadLeagues();
  } catch (err) {
    alert(err.message);
  }
});

async function loadLeagues() {
  const leagues = await api('/leagues');
  const container = $('leaguesList');
  container.innerHTML = '';

  leagues.forEach((league) => {
    const div = document.createElement('div');
    div.className = 'league-card';
    div.innerHTML = `
      <h3>${league.name}</h3>
      <p class="muted">Invite code: <b>${league.inviteCode}</b></p>
      <p class="muted">${league._count?.members ?? '?'} members</p>
      <a href="leaderboard.html?leagueId=${league.id}" class="btn-link">View Leaderboard</a>
    `;
    container.appendChild(div);
  });
}

loadLeagues();
