if (!requireAuth()) throw new Error('redirecting');
renderNav('');

const $ = (id) => document.getElementById(id);
const params = new URLSearchParams(window.location.search);
const raceId = Number(params.get('raceId'));
const sessionKey = params.get('sessionKey');
const MAX_DRIVERS = 5;

let selectedDriverIds = [];
let selectedCaptainId = null;

async function init() {
  if (!raceId || !sessionKey) {
    $('driverPicks').innerHTML = '<p class="muted">No race selected. Go back to Races.</p>';
    return;
  }

  const team = await api('/lineups/team/me').catch(() => ({ budget: 90 }));
  $('budgetInfo').textContent = `Your budget: ${team.budget} points`;

  let drivers = await api(`/races/${sessionKey}/drivers`);
  if (drivers.length === 0) {
    await api(`/races/${sessionKey}/drivers/sync`, { method: 'POST' }).catch(() => null);
    drivers = await api(`/races/${sessionKey}/drivers`);
  }

  if (drivers.length === 0) {
    $('driverPicks').innerHTML = '<p class="muted">No driver data available yet for this race weekend.</p>';
    return;
  }

  drivers.sort((a, b) => b.price - a.price);

  const picksDiv = $('driverPicks');
  picksDiv.innerHTML = '';
  drivers.forEach((d) => {
    const row = document.createElement('div');
    row.className = 'driver-pick';
    row.innerHTML = `
      <input type="checkbox" class="driverCheck" value="${d.id}" data-price="${d.price}" />
      <input type="radio" name="captain" class="captainRadio" value="${d.id}" disabled />
      <span>#${d.driverNumber} ${d.fullName} (${d.teamName}) - <b>${d.price}</b> pts</span>
    `;
    picksDiv.appendChild(row);
  });

  picksDiv.querySelectorAll('.driverCheck').forEach((cb) => {
    cb.addEventListener('change', () => {
      const checked = [...picksDiv.querySelectorAll('.driverCheck:checked')];
      if (checked.length > MAX_DRIVERS) {
        cb.checked = false;
        return;
      }
      selectedDriverIds = checked.map((c) => Number(c.value));
      const totalCost = checked.reduce((sum, c) => sum + Number(c.dataset.price), 0);
      $('budgetInfo').textContent = `Your budget: ${team.budget} points | Selected cost: ${totalCost}${totalCost > team.budget ? ' (OVER BUDGET)' : ''}`;

      picksDiv.querySelectorAll('.captainRadio').forEach((r) => {
        r.disabled = !selectedDriverIds.includes(Number(r.value));
        if (r.disabled) r.checked = false;
      });
    });
  });

  picksDiv.querySelectorAll('.captainRadio').forEach((r) => {
    r.addEventListener('change', () => { selectedCaptainId = Number(r.value); });
  });
}

$('submitLineupBtn').addEventListener('click', async () => {
  const msg = $('lineupMessage');
  try {
    if (selectedDriverIds.length !== MAX_DRIVERS) throw new Error(`Pick exactly ${MAX_DRIVERS} drivers`);
    if (!selectedCaptainId) throw new Error('Choose a captain');
    await api('/lineups', {
      method: 'POST',
      body: JSON.stringify({ raceId, driverIds: selectedDriverIds, captainId: selectedCaptainId }),
    });
    msg.textContent = 'Lineup saved!';
    msg.className = 'message success';
  } catch (err) {
    msg.textContent = err.message;
    msg.className = 'message';
  }
});

init();
