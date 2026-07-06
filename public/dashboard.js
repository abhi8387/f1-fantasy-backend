if (!requireAuth()) throw new Error('redirecting');
renderNav('dashboard.html');

const $ = (id) => document.getElementById(id);

$('syncRacesBtn').addEventListener('click', async () => {
  try {
    const data = await api('/races/sync?year=2026', { method: 'POST' });
    alert(`Synced ${data.synced} new races`);
    loadRaces();
  } catch (err) {
    alert(err.message);
  }
});

async function loadRaces() {
  const races = await api('/races');
  const container = $('racesList');
  container.innerHTML = '';

  for (const race of races) {
    const isPast = new Date(race.date) < new Date();
    const div = document.createElement('div');
    div.className = 'race-card';

    if (isPast) {
      const results = await api(`/races/${race.id}/results`).catch(() => []);
      const rows = results
        .map((r) => `<tr><td>${r.position}</td><td>${r.driver.fullName}</td><td>${r.points}</td></tr>`)
        .join('');
      div.innerHTML = `
        <h3>${race.location}</h3>
        <span class="badge closed">COMPLETED</span>
        ${
          results.length
            ? `<table><thead><tr><th>Pos</th><th>Driver</th><th>Pts</th></tr></thead><tbody>${rows}</tbody></table>`
            : '<p class="muted">Results not entered yet.</p>'
        }
        ${race.isLocked === false ? `<a href="lineup.html?raceId=${race.id}&sessionKey=${race.sessionKey}" class="btn-link">Build Lineup (test mode)</a>` : ''}
      `;
    } else {
      const countdown = await api(`/races/${race.id}/countdown`).catch(() => null);
      const openBadge = countdown?.isOpen
        ? '<span class="badge open">LINEUPS OPEN</span>'
        : '<span class="badge closed">LOCKED</span>';
      div.innerHTML = `
        <h3>${race.location}</h3>
        <p class="muted">Race: ${countdown?.raceDateIST || '-'}</p>
        <p class="muted">Lineups open: ${countdown?.lineupOpensAtIST || 'unknown'}</p>
        ${openBadge}
        <br/><br/>
        ${
          countdown?.isOpen
            ? `<a href="lineup.html?raceId=${race.id}&sessionKey=${race.sessionKey}" class="btn-link">Build Lineup</a>`
            : `<button disabled>Locked until Practice 1</button>`
        }
      `;
    }
    container.appendChild(div);
  }
}

loadRaces();
