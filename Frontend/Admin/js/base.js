/* ===========================
   BASE.JS — shared admin functions
=========================== */

// === AUTH CHECK ===
(function checkAuth() {
  const token = localStorage.getItem('admin_token');
  const isLoginPage = window.location.pathname.includes('login.html');
  if (!token && !isLoginPage) {
    window.location.href = '/Frontend/admin/login.html';
  }
  if (token && isLoginPage) {
    window.location.href = '/Frontend/admin/dashboard.html';
  }
})();

// === TOPBAR EMAIL ===
document.addEventListener('DOMContentLoaded', () => {
  const emailEl = document.getElementById('topbar-email');
  if (emailEl) {
    emailEl.textContent = localStorage.getItem('admin_email') || 'admin';
  }

  // Sidebar toggle
  const sidebar   = document.getElementById('sidebar');
  const overlay   = document.getElementById('overlay');
  const hamburger = document.getElementById('hamburger-btn');
  const sideClose = document.getElementById('sidebar-close');

  if (hamburger && sidebar && overlay) {
    hamburger.addEventListener('click', () => {
      sidebar.classList.add('open');
      overlay.classList.add('open');
    });
  }
  if (sideClose && sidebar && overlay) {
    sideClose.addEventListener('click', () => {
      sidebar.classList.remove('open');
      overlay.classList.remove('open');
    });
  }
  if (overlay) {
    overlay.addEventListener('click', () => {
      sidebar.classList.remove('open');
      overlay.classList.remove('open');
    });
  }

  // Logout
  const logoutBtn = document.getElementById('btn-logout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      await apiPost('/logout', {}).catch(() => {});
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_email');
      window.location.href = '/Frontend/admin/login.html';
    });
  }
});

// === TOAST ===
function showToast(msg, type = 'success') {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.className = `toast show ${type}`;
  // add icon
  const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️';
  toast.textContent = `${icon} ${msg}`;
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => {
    toast.classList.remove('show');
  }, 3200);
}

// === CONFIRM DELETE ===
function confirmDelete(msg, onConfirm) {
  if (window.confirm(msg || 'Yakin ingin menghapus data ini?')) {
    onConfirm();
  }
}

// === FORMAT DATE ===
function fmtDate(str) {
  if (!str) return '-';
  try {
    return new Date(str).toLocaleDateString('id-ID', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  } catch { return str; }
}
