/* ===========================
   EXPERIENCE.JS
=========================== */

let expList = [];

document.addEventListener('DOMContentLoaded', async () => {
  await loadExp();
  initModal();
  document.getElementById('btn-add-exp').addEventListener('click', () => openModal());
});

async function loadExp() {
  const json = await apiGet('/experience');
  if (!json || !json.success) return;
  expList = json.data || [];
  renderExp();
}

function renderExp() {
  const container = document.getElementById('exp-list');
  if (!expList.length) {
    container.innerHTML = '<div class="card empty-state">Belum ada pengalaman. Tambahkan pengalaman pertama kamu!</div>';
    return;
  }
  container.innerHTML = '<div class="exp-list">' + expList.map(e => `
    <div class="exp-card">
      <div class="exp-icon"><i class="fas fa-briefcase"></i></div>
      <div class="exp-body">
        <div class="exp-title">${escHtml(e.title)}</div>
        <div class="exp-company"><i class="fas fa-building"></i> ${escHtml(e.company)}</div>
        ${e.period ? `<div class="exp-period"><i class="fas fa-calendar"></i> ${escHtml(e.period)}</div>` : ''}
        ${e.description ? `<div class="exp-desc">${escHtml(e.description)}</div>` : ''}
      </div>
      <div class="exp-actions">
        <button class="btn btn-ghost btn-icon" onclick="openModal(${e.id})"><i class="fas fa-edit"></i></button>
        <button class="btn btn-danger btn-icon" onclick="deleteExp(${e.id})"><i class="fas fa-trash"></i></button>
      </div>
    </div>
  `).join('') + '</div>';
}

function initModal() {
  document.getElementById('modal-close').addEventListener('click', closeModal);
  document.getElementById('btn-cancel').addEventListener('click', closeModal);
  document.getElementById('modal-overlay').addEventListener('click', e => {
    if (e.target === e.currentTarget) closeModal();
  });
  document.getElementById('exp-form').addEventListener('submit', saveExp);
}

function openModal(id = null) {
  const title = document.getElementById('modal-title');
  document.getElementById('exp-form').reset();
  document.getElementById('exp-id').value = '';

  if (id) {
    const e = expList.find(x => x.id === id);
    if (!e) return;
    title.textContent = 'Edit Pengalaman';
    document.getElementById('exp-id').value   = e.id;
    document.getElementById('ex-title').value   = e.title || '';
    document.getElementById('ex-company').value = e.company || '';
    document.getElementById('ex-period').value  = e.period || '';
    document.getElementById('ex-desc').value    = e.description || '';
    document.getElementById('ex-order').value   = e.sort_order ?? 0;
  } else {
    title.textContent = 'Tambah Pengalaman';
    document.getElementById('ex-order').value = expList.length;
  }
  document.getElementById('modal-overlay').classList.add('open');
}

function closeModal() {
  document.getElementById('modal-overlay').classList.remove('open');
}

async function saveExp(e) {
  e.preventDefault();
  const btn = e.target.querySelector('[type=submit]');
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Menyimpan...';

  const id   = document.getElementById('exp-id').value;
  const body = {
    title: document.getElementById('ex-title').value,
    company: document.getElementById('ex-company').value,
    period: document.getElementById('ex-period').value,
    description: document.getElementById('ex-desc').value,
    sort_order: parseInt(document.getElementById('ex-order').value) || 0
  };

  const json = id
    ? await apiPut(`/experience/${id}`, body)
    : await apiPost('/experience', body);

  btn.disabled = false;
  btn.innerHTML = '<i class="fas fa-save"></i> Simpan';

  if (json && json.success) {
    showToast(id ? 'Pengalaman diperbarui!' : 'Pengalaman ditambahkan!');
    closeModal();
    await loadExp();
  } else {
    showToast(json?.message || 'Terjadi kesalahan.', 'error');
  }
}

async function deleteExp(id) {
  confirmDelete('Yakin ingin menghapus pengalaman ini?', async () => {
    const json = await apiDelete(`/experience/${id}`);
    if (json && json.success) {
      showToast('Pengalaman dihapus.');
      await loadExp();
    } else {
      showToast(json?.message || 'Gagal menghapus.', 'error');
    }
  });
}

function escHtml(str) {
  return (str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
