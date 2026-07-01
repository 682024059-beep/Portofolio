/* ===========================
   PROFILES.JS
=========================== */

document.addEventListener('DOMContentLoaded', async () => {
  await loadProfile();
  initPhotoUpload();
  initColorPicker();
  initProfileForm();
});

async function loadProfile() {
  const json = await apiGet('/profile');
  if (!json || !json.success || !json.data) return;
  const p = json.data;

  // Fill form fields
  const fields = {
    'f-name': p.name, 'f-tagline': p.tagline, 'f-bio': p.bio,
    'f-email': p.email, 'f-phone': p.phone, 'f-location': p.location,
    'f-github': p.github_url, 'f-linkedin': p.linkedin_url,
    'f-instagram': p.instagram_url, 'f-resume': p.resume_url
  };
  for (const [id, val] of Object.entries(fields)) {
    const el = document.getElementById(id);
    if (el) el.value = val || '';
  }

  // Photo
  if (p.photo_url) {
    document.getElementById('photo-preview').src = p.photo_url;
  }

  // Background color
  if (p.background_color) {
    document.getElementById('bg-color-input').value = p.background_color;
    document.querySelectorAll('.color-opt').forEach(b => {
      b.classList.toggle('active', b.dataset.color === p.background_color);
    });
  }
}

function initColorPicker() {
  document.querySelectorAll('.color-opt').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.color-opt').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById('bg-color-input').value = btn.dataset.color;
    });
  });
}

function initPhotoUpload() {
  const wrap    = document.getElementById('photo-preview-wrap');
  const overlay = document.getElementById('photo-overlay');
  const input   = document.getElementById('photo-input');
  const btnUp   = document.getElementById('btn-upload-photo');
  const preview = document.getElementById('photo-preview');

  const triggerPick = () => input.click();
  if (wrap) wrap.addEventListener('click', triggerPick);
  if (overlay) overlay.addEventListener('click', triggerPick);
  if (btnUp)   btnUp.addEventListener('click', (e) => { e.stopPropagation(); triggerPick(); });

  if (input) {
    input.addEventListener('change', async () => {
      const file = input.files[0];
      if (!file) return;
      if (file.size > 5 * 1024 * 1024) { showToast('File terlalu besar (max 5MB)', 'error'); return; }

      // Preview
      const reader = new FileReader();
      reader.onload = e => { preview.src = e.target.result; };
      reader.readAsDataURL(file);

      btnUp.disabled = true;
      btnUp.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Mengupload...';

      const fd = new FormData();
      fd.append('file', file);
      fd.append('type', 'profile');
      const json = await apiUpload('/upload', fd);
      btnUp.disabled = false;
      btnUp.innerHTML = '<i class="fas fa-upload"></i> Upload Foto Baru';

      if (json && json.success) {
        preview.src = json.data.url;
        // Save to profile
        await apiPut('/profile', {
          photo_url: json.data.url,
          photo_public_id: json.data.public_id
        });
        showToast('Foto profil berhasil diperbarui!');
      } else {
        showToast(json?.message || 'Gagal upload foto.', 'error');
      }
    });
  }
}

function initProfileForm() {
  document.getElementById('profile-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('[type=submit]');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Menyimpan...';

    const body = {
      name: document.getElementById('f-name').value,
      tagline: document.getElementById('f-tagline').value,
      bio: document.getElementById('f-bio').value,
      email: document.getElementById('f-email').value,
      phone: document.getElementById('f-phone').value,
      location: document.getElementById('f-location').value,
      github_url: document.getElementById('f-github').value,
      linkedin_url: document.getElementById('f-linkedin').value,
      instagram_url: document.getElementById('f-instagram').value,
      resume_url: document.getElementById('f-resume').value,
      background_color: document.getElementById('bg-color-input').value
    };

    const json = await apiPut('/profile', body);
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-save"></i> Simpan Perubahan';

    if (json && json.success) {
      showToast('Profil berhasil disimpan!');
    } else {
      showToast(json?.message || 'Gagal menyimpan profil.', 'error');
    }
  });
}
