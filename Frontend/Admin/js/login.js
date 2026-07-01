/* ===========================
   LOGIN.JS EMAIL + PASSWORD
=========================== */

if (localStorage.getItem('admin_token')) {
  window.location.href = '/Frontend/admin/dashboard.html';
}

const feedback = document.getElementById('login-feedback');

function setFeedback(msg, type = 'error') {
  feedback.textContent = msg;
  feedback.className = `login-feedback ${type}`;
}

function clearFeedback() {
  feedback.textContent = '';
  feedback.className = 'login-feedback';
}

document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  clearFeedback();

  const email = document.getElementById('input-email').value.trim();
  const password = document.getElementById('input-password').value.trim();
  const btn = document.getElementById('btn-login');

  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Memproses...';

  try {
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: email,
        password: password
      })
    });

    const json = await res.json();

    if (json.success) {
      localStorage.setItem('admin_token', json.token);
      localStorage.setItem('admin_email', json.email);

      setFeedback('Login berhasil! Mengalihkan...', 'success');

      setTimeout(() => {
        window.location.href = '/Frontend/admin/dashboard.html';
      }, 800);
    } else {
      setFeedback(json.message || 'Login gagal.');
    }

  } catch (err) {
    setFeedback('Terjadi kesalahan jaringan. Coba lagi.');
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-unlock"></i> Login';
  }
});