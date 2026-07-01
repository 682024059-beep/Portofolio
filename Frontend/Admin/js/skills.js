/* ===========================
   SKILLS.JS
=========================== */

let skillsList = [];

document.addEventListener('DOMContentLoaded', async () => {
  await loadSkills();
  initModal();
  document.getElementById('btn-add-skill').addEventListener('click', () => openModal());
});

async function loadSkills() {
  const json = await apiGet('/skills');
  if (!json || !json.success) return;
  skillsList = json.data || [];
  renderSkills();
}

function renderSkills() {
  const tbody = document.getElementById('skills-tbody');
  if (!skillsList.length) {
    tbody.innerHTML = '<tr><td colspan="6" class="empty-state">Belum ada skill. Tambahkan skill pertama kamu!</td></tr>';
    return;
  }
  tbody.innerHTML = skillsList.map((s, i) => `
    <tr>
      <td>${i + 1}</td>
      <td><strong>${escHtml(s.name)}</strong></td>
      <td><span class="badge-category">${escHtml(s.category || '-')}</span></td>
      <td>
        <div style="display:flex; align-items:center; gap:8px;">
          <div class="skill-level-bar" style="width:80px;">
            <div class="skill-level-fill" style="width:${s.level}%;"></div>
          </div>
          <span style="font-size:0.82rem;color:var(--text-light);">${s.level}%</span>
        </div>
      </td>
      <td>${s.sort_order}</td>
      <td>
        <div style="display:flex;gap:6px;">
          <button class="btn btn-ghost btn-icon" onclick="openModal(${s.id})"><i class="fas fa-edit"></i></button>
          <button class="btn btn-danger btn-icon" onclick="deleteSkill(${s.id})"><i class="fas fa-trash"></i></button>
        </div>
      </td>
    </tr>
  `).join('');
}

function initModal() {
  document.getElementById('modal-close').addEventListener('click', closeModal);
  document.getElementById('btn-cancel').addEventListener('click', closeModal);
  document.getElementById('modal-overlay').addEventListener('click', e => {
    if (e.target === e.currentTarget) closeModal();
  });
  document.getElementById('skill-form').addEventListener('submit', saveSkill);
}

function openModal(id = null) {
  const title = document.getElementById('modal-title');
  const form  = document.getElementById('skill-form');
  form.reset();
  document.getElementById('skill-id').value = '';

  if (id) {
    const s = skillsList.find(x => x.id === id);
    if (!s) return;
    title.textContent = 'Edit Skill';
    document.getElementById('skill-id').value = s.id;
    document.getElementById('sk-name').value  = s.name || '';
    document.getElementById('sk-category').value = s.category || '';
    document.getElementById('sk-level').value = s.level ?? 80;
    document.getElementById('sk-icon').value  = s.icon_url || '';
    document.getElementById('sk-order').value = s.sort_order ?? 0;
  } else {
    title.textContent = 'Tambah Skill';
    document.getElementById('sk-level').value = 80;
    document.getElementById('sk-order').value = skillsList.length;
  }
  document.getElementById('modal-overlay').classList.add('open');
}

function closeModal() {
  document.getElementById('modal-overlay').classList.remove('open');
}

async function saveSkill(e) {
  e.preventDefault();
  const btn = e.target.querySelector('[type=submit]');
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Menyimpan...';

  const id   = document.getElementById('skill-id').value;
  const body = {
    name: document.getElementById('sk-name').value,
    category: document.getElementById('sk-category').value,
    level: parseInt(document.getElementById('sk-level').value) || 80,
    icon_url: document.getElementById('sk-icon').value,
    sort_order: parseInt(document.getElementById('sk-order').value) || 0
  };

  const json = id
    ? await apiPut(`/skills/${id}`, body)
    : await apiPost('/skills', body);

  btn.disabled = false;
  btn.innerHTML = '<i class="fas fa-save"></i> Simpan';

  if (json && json.success) {
    showToast(id ? 'Skill berhasil diperbarui!' : 'Skill berhasil ditambahkan!');
    closeModal();
    await loadSkills();
  } else {
    showToast(json?.message || 'Terjadi kesalahan.', 'error');
  }
}

async function deleteSkill(id) {
  confirmDelete('Yakin ingin menghapus skill ini?', async () => {
    const json = await apiDelete(`/skills/${id}`);
    if (json && json.success) {
      showToast('Skill berhasil dihapus.');
      await loadSkills();
    } else {
      showToast(json?.message || 'Gagal menghapus.', 'error');
    }
  });
}

function escHtml(str) {
  return (str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
