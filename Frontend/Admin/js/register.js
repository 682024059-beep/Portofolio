/* ===========================
   REGISTER.JS EMAIL + PASSWORD
=========================== */

if (localStorage.getItem('admin_token')) {
  window.location.href = '/Frontend/admin/dashboard.html';
}

const feedback = document.getElementById('register-feedback');

function setFeedback(msg, type = 'error') {
  feedback.textContent = msg;
  feedback.className = `login-feedback ${type}`;
}

function clearFeedback() {
  feedback.textContent = '';
  feedback.className = 'login-feedback';
}

document.getElementById('register-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  clearFeedback();

  const email = document.getElementById('input-email').value.trim();
  const password = document.getElementById('input-password').value.trim();
  const confirmPassword = document.getElementById('input-confirm-password').value.trim();

  const btn = document.getElementById('btn-register');

  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Memproses...';

  try {
    const res = await fetch('/api/admin/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: email,
        password: password,
        confirm_password: confirmPassword
      })
    });

    const json = await res.json();

    if (json.success) {
      setFeedback('Register berhasil! Mengalihkan ke login...', 'success');

      setTimeout(() => {
        window.location.href = '/admin';
      }, 1000);
    } else {
      setFeedback(json.message || 'Register gagal.');
    }

  } catch (err) {
    setFeedback('Terjadi kesalahan jaringan. Coba lagi.');
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-user-plus"></i> Register';
  }
});