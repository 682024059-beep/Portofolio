/* ===========================
   PROJECTS.JS
=========================== */

let projList = [];
let pendingFile = null;

document.addEventListener('DOMContentLoaded', async () => {
  await loadProjects();
  initModal();
  initImageUpload();
  document.getElementById('btn-add-proj').addEventListener('click', () => openModal());
});

async function loadProjects() {
  const json = await apiGet('/projects');
  if (!json || !json.success) return;
  projList = json.data || [];
  renderProjects();
}

function renderProjects() {
  const grid = document.getElementById('projects-admin-grid');
  if (!projList.length) {
    grid.innerHTML = '<div class="empty-state" style="grid-column:1/-1">Belum ada proyek. Tambahkan proyek pertama kamu!</div>';
    return;
  }
  grid.innerHTML = projList.map(p => `
    <div class="proj-admin-card">
      ${p.image_url
        ? `<img src="${p.image_url}" class="proj-thumb" alt="${escHtml(p.title)}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';" />
           <div class="proj-thumb-placeholder" style="display:none;"><i class="fas fa-image"></i></div>`
        : `<div class="proj-thumb-placeholder"><i class="fas fa-image"></i></div>`
      }
      <div class="proj-admin-body">
        <div class="proj-admin-title">${escHtml(p.title)}</div>
        ${p.description ? `<div class="proj-admin-desc">${escHtml(p.description)}</div>` : ''}
        ${p.tech_stack ? `
          <div class="proj-tech-tags">
            ${p.tech_stack.split(',').map(t => `<span class="proj-tech-tag">${escHtml(t.trim())}</span>`).join('')}
          </div>` : ''}
      </div>
      <div class="proj-admin-actions">
        <button class="btn btn-ghost btn-icon" style="flex:1;" onclick="openModal(${p.id})"><i class="fas fa-edit"></i> Edit</button>
        <button class="btn btn-danger btn-icon" onclick="deleteProj(${p.id})"><i class="fas fa-trash"></i></button>
      </div>
    </div>
  `).join('');
}

function initModal() {
  document.getElementById('modal-close').addEventListener('click', closeModal);
  document.getElementById('btn-cancel').addEventListener('click', closeModal);
  document.getElementById('modal-overlay').addEventListener('click', e => {
    if (e.target === e.currentTarget) closeModal();
  });
  document.getElementById('proj-form').addEventListener('submit', saveProject);
}

function initImageUpload() {
  const area    = document.getElementById('img-upload-area');
  const input   = document.getElementById('img-file-input');
  const preview = document.getElementById('img-preview');
  const ph      = document.getElementById('img-placeholder');

  area.addEventListener('click', () => input.click());

  input.addEventListener('change', () => {
    const file = input.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { showToast('File max 5MB', 'error'); return; }
    pendingFile = file;
    const reader = new FileReader();
    reader.onload = e => {
      preview.src = e.target.result;
      preview.style.display = 'block';
      ph.style.display = 'none';
    };
    reader.readAsDataURL(file);
  });

  // Drag and drop
  area.addEventListener('dragover', e => { e.preventDefault(); area.style.borderColor = 'var(--primary)'; });
  area.addEventListener('dragleave', () => { area.style.borderColor = ''; });
  area.addEventListener('drop', e => {
    e.preventDefault();
    area.style.borderColor = '';
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      input.files = e.dataTransfer.files;
      input.dispatchEvent(new Event('change'));
    }
  });
}

function openModal(id = null) {
  const title = document.getElementById('modal-title');
  document.getElementById('proj-form').reset();
  document.getElementById('proj-id').value = '';
  document.getElementById('proj-image-url').value = '';
  document.getElementById('proj-image-pid').value = '';
  document.getElementById('img-preview').style.display = 'none';
  document.getElementById('img-placeholder').style.display = 'flex';
  pendingFile = null;

  if (id) {
    const p = projList.find(x => x.id === id);
    if (!p) return;
    title.textContent = 'Edit Proyek';
    document.getElementById('proj-id').value       = p.id;
    document.getElementById('pr-title').value      = p.title || '';
    document.getElementById('pr-desc').value       = p.description || '';
    document.getElementById('pr-tech').value       = p.tech_stack || '';
    document.getElementById('pr-demo').value       = p.demo_url || '';
    document.getElementById('pr-code').value       = p.code_url || '';
    document.getElementById('pr-order').value      = p.sort_order ?? 0;
    document.getElementById('proj-image-url').value = p.image_url || '';
    document.getElementById('proj-image-pid').value = p.image_public_id || '';
    if (p.image_url) {
      document.getElementById('img-preview').src = p.image_url;
      document.getElementById('img-preview').style.display = 'block';
      document.getElementById('img-placeholder').style.display = 'none';
    }
  } else {
    title.textContent = 'Tambah Proyek';
    document.getElementById('pr-order').value = projList.length;
  }
  document.getElementById('modal-overlay').classList.add('open');
}

function closeModal() {
  document.getElementById('modal-overlay').classList.remove('open');
  pendingFile = null;
}

async function saveProject(e) {
  e.preventDefault();
  const btn = e.target.querySelector('[type=submit]');
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Menyimpan...';

  // Upload image first if pending
  let imageUrl  = document.getElementById('proj-image-url').value;
  let imagePid  = document.getElementById('proj-image-pid').value;

  if (pendingFile) {
    const fd = new FormData();
    fd.append('file', pendingFile);
    fd.append('type', 'project');
    const upJson = await apiUpload('/upload', fd);
    if (upJson && upJson.success) {
      imageUrl = upJson.data.url;
      imagePid = upJson.data.public_id;
    } else {
      showToast(upJson?.message || 'Gagal upload gambar.', 'error');
      btn.disabled = false;
      btn.innerHTML = '<i class="fas fa-save"></i> Simpan';
      return;
    }
  }

  const id   = document.getElementById('proj-id').value;
  const body = {
    title: document.getElementById('pr-title').value,
    description: document.getElementById('pr-desc').value,
    tech_stack: document.getElementById('pr-tech').value,
    demo_url: document.getElementById('pr-demo').value,
    code_url: document.getElementById('pr-code').value,
    sort_order: parseInt(document.getElementById('pr-order').value) || 0,
    image_url: imageUrl,
    image_public_id: imagePid
  };

  const json = id
    ? await apiPut(`/projects/${id}`, body)
    : await apiPost('/projects', body);

  btn.disabled = false;
  btn.innerHTML = '<i class="fas fa-save"></i> Simpan';

  if (json && json.success) {
    showToast(id ? 'Proyek diperbarui!' : 'Proyek ditambahkan!');
    closeModal();
    await loadProjects();
  } else {
    showToast(json?.message || 'Terjadi kesalahan.', 'error');
  }
}

async function deleteProj(id) {
  confirmDelete('Yakin ingin menghapus proyek ini?', async () => {
    const json = await apiDelete(`/projects/${id}`);
    if (json && json.success) {
      showToast('Proyek dihapus.');
      await loadProjects();
    } else {
      showToast(json?.message || 'Gagal menghapus.', 'error');
    }
  });
}

function escHtml(str) {
  return (str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
