const API = '/api/v1';

function getToken() { return localStorage.getItem('token'); }
function setToken(t) { localStorage.setItem('token', t); }
function clearToken() { localStorage.removeItem('token'); }

async function api(path, options = {}) {
  const res = await fetch(API + path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
      ...(options.headers || {}),
    },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok || body.success === false) {
    throw new Error(body.message || `Request failed (${res.status})`);
  }
  return body.data;
}

// Call at the top of every protected page. Redirects to login if no token.
function requireAuth() {
  if (!getToken()) {
    window.location.href = 'index.html';
    return false;
  }
  return true;
}

function renderNav(active) {
  const el = document.getElementById('nav');
  if (!el) return;
  const links = [
    { href: 'dashboard.html', label: 'Races' },
    { href: 'leagues.html', label: 'Leagues' },
  ];
  el.innerHTML = `
    <div class="nav-inner">
      <a href="dashboard.html" class="brand">🏁 F1 Fantasy</a>
      <nav>
        ${links.map((l) => `<a href="${l.href}" class="${active === l.href ? 'active' : ''}">${l.label}</a>`).join('')}
      </nav>
      <button id="navLogoutBtn">Logout</button>
    </div>
  `;
  document.getElementById('navLogoutBtn').addEventListener('click', async () => {
    try { await api('/auth/logout', { method: 'POST' }); } catch (e) {}
    clearToken();
    window.location.href = 'index.html';
  });
}
