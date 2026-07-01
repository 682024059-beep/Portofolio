/* ===========================
   DASHBOARD.JS
=========================== */

document.addEventListener('DOMContentLoaded', async () => {
  await loadDashboard();
});

async function loadDashboard() {
  const json = await apiGet('/dashboard');
  if (!json || !json.success) return;

  const { stats, recent_messages } = json.data;

  // Stats
  document.getElementById('stat-skills').textContent = stats.skills;
  document.getElementById('stat-exp').textContent    = stats.experience;
  document.getElementById('stat-proj').textContent   = stats.projects;
  document.getElementById('stat-msg').textContent    = stats.messages;

  const unreadBadge = document.getElementById('stat-unread');
  if (stats.unread_messages > 0) {
    unreadBadge.textContent = `(${stats.unread_messages} baru)`;
  }

  // Recent messages
  const container = document.getElementById('messages-list');
  if (!recent_messages || recent_messages.length === 0) {
    container.innerHTML = '<div class="empty-state">Belum ada pesan masuk.</div>';
    return;
  }

  container.innerHTML = recent_messages.map(m => `
    <div class="msg-item ${!m.is_read ? 'msg-unread' : ''}" onclick="markRead(${m.id}, this)">
      <div class="msg-avatar">${(m.sender_name || '?')[0].toUpperCase()}</div>
      <div class="msg-body">
        <div class="msg-from">${escHtml(m.sender_name)}</div>
        <div class="msg-sub">${escHtml(m.subject || '(tanpa subjek)')}</div>
        <div class="msg-time">${fmtDate(m.created_at)}</div>
      </div>
      ${!m.is_read ? '<div class="dot-unread"></div>' : ''}
    </div>
  `).join('');
}

async function markRead(id, el) {
  const json = await apiPut(`/messages/${id}/read`, {});
  if (json && json.success) {
    el.classList.remove('msg-unread');
    el.querySelector('.dot-unread')?.remove();
    const badge = document.getElementById('stat-unread');
    if (badge) {
      const cur = parseInt(badge.textContent.replace(/\D/g,'')) || 0;
      if (cur > 1) badge.textContent = `(${cur - 1} baru)`;
      else badge.textContent = '';
    }
  }
}

function escHtml(str) {
  return (str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
