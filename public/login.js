// If already logged in, skip straight to the dashboard
if (getToken()) {
  window.location.href = 'dashboard.html';
}

const $ = (id) => document.getElementById(id);

document.querySelectorAll('.tab').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach((b) => b.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach((p) => p.classList.remove('active'));
    btn.classList.add('active');
    $(btn.dataset.tab).classList.add('active');
  });
});

function showMessage(text, isError = true) {
  const el = $('authMessage');
  el.textContent = text;
  el.className = 'message' + (isError ? '' : ' success');
}

$('registerTab').addEventListener('submit', async (e) => {
  e.preventDefault();
  try {
    const data = await api('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        username: $('regUsername').value,
        email: $('regEmail').value,
        password: $('regPassword').value,
      }),
    });
    setToken(data.accessToken);
    window.location.href = 'dashboard.html';
  } catch (err) {
    showMessage(err.message);
  }
});

$('loginTab').addEventListener('submit', async (e) => {
  e.preventDefault();
  try {
    const data = await api('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: $('loginEmail').value, password: $('loginPassword').value }),
    });
    setToken(data.accessToken);
    window.location.href = 'dashboard.html';
  } catch (err) {
    showMessage(err.message);
  }
});
