const API = '/api';

// === INIT ===
document.addEventListener('DOMContentLoaded', async () => {
  initNavbar();
  initBgSwitcher();
  await loadPortfolio();
  initContactForm();
});

// === LOAD ALL PORTFOLIO DATA ===
async function loadPortfolio() {
  try {
    const res = await fetch(`${API}/portfolio`);
    const json = await res.json();
    if (!json.success) return;
    const { profile, skills, experience, projects } = json.data;
    renderProfile(profile);
    renderSkills(skills);
    renderExperience(experience);
    renderProjects(projects);
  } catch (e) {
    console.error('Failed to load portfolio data:', e);
  }
}

// === RENDER PROFILE ===
function renderProfile(p) {
  if (!p) return;

  // Apply background color
  if (p.background_color) {
    document.body.style.backgroundColor = p.background_color;
    document.documentElement.style.setProperty('--bg', p.background_color);
    // also update alt
    document.documentElement.style.setProperty('--bg-alt', lightenColor(p.background_color));
    // sync active button
    document.querySelectorAll('.bg-color-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.color === p.background_color);
    });
  }

  // Nav logo
  if (p.name) {
    document.getElementById('nav-logo').textContent = p.name.split(' ')[0] + '.';
    document.title = `Portofolio - ${p.name}`;
    document.getElementById('footer-text').textContent = `© ${new Date().getFullYear()} ${p.name}. All Rights Reserved.`;
  }

  // Hero
  if (p.photo_url) {
    document.getElementById('hero-photo').src = p.photo_url;
    document.getElementById('about-photo').src = p.photo_url;
  }
  setText('hero-name', p.name);
  setText('hero-tagline', p.tagline);
  setText('about-tagline', p.tagline);
  setText('about-bio', p.bio);

  // About details
  const details = [];
  if (p.email) details.push({ icon: 'fas fa-envelope', text: p.email });
  if (p.phone) details.push({ icon: 'fas fa-phone', text: p.phone });
  if (p.location) details.push({ icon: 'fas fa-map-marker-alt', text: p.location });
  document.getElementById('about-details').innerHTML = details.map(d =>
    `<div class="about-detail-item"><i class="${d.icon}"></i><span>${d.text}</span></div>`
  ).join('');

  // Social links
  const socials = [];
  if (p.github_url && p.github_url !== '#') socials.push({ icon: 'fab fa-github', url: p.github_url, title: 'GitHub' });
  if (p.linkedin_url && p.linkedin_url !== '#') socials.push({ icon: 'fab fa-linkedin', url: p.linkedin_url, title: 'LinkedIn' });
  if (p.instagram_url && p.instagram_url !== '#') socials.push({ icon: 'fab fa-instagram', url: p.instagram_url, title: 'Instagram' });
  document.getElementById('about-social').innerHTML = socials.map(s =>
    `<a href="${s.url}" target="_blank" class="social-link" title="${s.title}"><i class="${s.icon}"></i></a>`
  ).join('');

  // Contact info
  const contactDetails = [];
  if (p.email) contactDetails.push({ icon: 'fas fa-envelope', text: p.email });
  if (p.phone) contactDetails.push({ icon: 'fas fa-phone', text: p.phone });
  if (p.location) contactDetails.push({ icon: 'fas fa-map-marker-alt', text: p.location });
  document.getElementById('contact-details').innerHTML = contactDetails.map(d =>
    `<div class="contact-detail-item"><i class="${d.icon}"></i><span>${d.text}</span></div>`
  ).join('') + (socials.length ? `<div style="margin-top:20px; display:flex; gap:10px;">` +
    socials.map(s => `<a href="${s.url}" target="_blank" class="social-link" title="${s.title}"><i class="${s.icon}"></i></a>`).join('') +
    `</div>` : '');
}

// === RENDER SKILLS ===
function renderSkills(skills) {
  const grid = document.getElementById('skills-grid');
  if (!skills || !skills.length) {
    grid.innerHTML = '<div class="loading-state">Belum ada skill.</div>'; return;
  }
  const icons = { 'python': '🐍', 'flask': '🌶️', 'sql': '🗄️', 'database': '🗄️',
    'javascript': '⚡', 'html': '🌐', 'css': '🎨', 'git': '🔧', 'github': '🔧', 'default': '💡' };
  grid.innerHTML = skills.map(s => {
    const key = Object.keys(icons).find(k => s.name.toLowerCase().includes(k)) || 'default';
    const icon = s.icon_url
      ? `<img src="${s.icon_url}" alt="${s.name}" style="width:40px;height:40px;object-fit:contain;" />`
      : `<span>${icons[key]}</span>`;
    return `
      <div class="skill-card">
        <div class="skill-icon">${icon}</div>
        <div class="skill-name">${s.name}</div>
        <div class="skill-category">${s.category || ''}</div>
        <div class="skill-bar-wrap">
          <div class="skill-bar" style="width:${s.level || 80}%"></div>
        </div>
        <div class="skill-level">${s.level || 80}%</div>
      </div>`;
  }).join('');
}

// === RENDER EXPERIENCE ===
function renderExperience(experience) {
  const list = document.getElementById('experience-list');
  if (!experience || !experience.length) {
    list.innerHTML = '<div class="loading-state">Belum ada pengalaman.</div>'; return;
  }
  list.innerHTML = experience.map(e => `
    <div class="timeline-item">
      <div class="timeline-dot"><i class="fas fa-briefcase"></i></div>
      <div class="timeline-content">
        <div class="timeline-period">${e.period || ''}</div>
        <div class="timeline-title">${e.title}</div>
        <div class="timeline-company">${e.company}</div>
        <p class="timeline-desc">${e.description || ''}</p>
      </div>
    </div>`).join('');
}

// === RENDER PROJECTS ===
function renderProjects(projects) {
  const grid = document.getElementById('projects-grid');
  if (!projects || !projects.length) {
    grid.innerHTML = '<div class="loading-state">Belum ada proyek.</div>'; return;
  }
  grid.innerHTML = projects.map(p => {
    const tags = p.tech_stack ? p.tech_stack.split(',').map(t =>
      `<span class="project-tag">${t.trim()}</span>`).join('') : '';
    const imgContent = p.image_url
      ? `<img src="${p.image_url}" alt="${p.title}" style="width:100%;height:100%;object-fit:cover;" />`
      : `<i class="fas fa-code" style="font-size:2.5rem;color:white;"></i>`;
    const demoBtn = p.demo_url && p.demo_url !== '#'
      ? `<a href="${p.demo_url}" target="_blank" class="project-link project-link-demo"><i class="fas fa-external-link-alt"></i> Demo</a>` : '';
    const codeBtn = p.code_url && p.code_url !== '#'
      ? `<a href="${p.code_url}" target="_blank" class="project-link project-link-code"><i class="fab fa-github"></i> Code</a>` : '';
    return `
      <div class="project-card">
        <div class="project-img">${imgContent}</div>
        <div class="project-body">
          <div class="project-title">${p.title}</div>
          <p class="project-desc">${p.description || ''}</p>
          <div class="project-tags">${tags}</div>
          <div class="project-links">${demoBtn}${codeBtn}</div>
        </div>
      </div>`;
  }).join('');
}

// === CONTACT FORM ===
function initContactForm() {
  const form = document.getElementById('contact-form');
  const feedback = document.getElementById('form-feedback');
  const btn = document.getElementById('submit-btn');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Mengirim...';
    feedback.className = 'form-feedback';
    feedback.style.display = 'none';

    try {
      const res = await fetch(`${API}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: document.getElementById('c-name').value,
          email: document.getElementById('c-email').value,
          subject: document.getElementById('c-subject').value,
          message: document.getElementById('c-message').value
        })
      });
      const json = await res.json();
      feedback.textContent = json.message;
      feedback.className = `form-feedback ${json.success ? 'success' : 'error'}`;
      if (json.success) form.reset();
    } catch (err) {
      feedback.textContent = 'Gagal mengirim pesan. Coba lagi.';
      feedback.className = 'form-feedback error';
    } finally {
      btn.disabled = false;
      btn.innerHTML = '<i class="fas fa-paper-plane"></i> Kirim Pesan';
    }
  });
}

// === NAVBAR ===
function initNavbar() {
  const navbar = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('nav-links');
  const links = navLinks.querySelectorAll('.nav-link');

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
    updateActiveLink();
  });

  hamburger.addEventListener('click', () => navLinks.classList.toggle('open'));
  links.forEach(l => l.addEventListener('click', () => navLinks.classList.remove('open')));

  function updateActiveLink() {
    const sections = ['home','about','skills','experience','projects','contact'];
    let current = 'home';
    sections.forEach(id => {
      const el = document.getElementById(id);
      if (el && window.scrollY >= el.offsetTop - 120) current = id;
    });
    links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === `#${current}`));
  }
}

// === BG SWITCHER ===
function initBgSwitcher() {
  const toggle = document.getElementById('bg-toggle');
  const panel = document.getElementById('bg-panel');
  const buttons = document.querySelectorAll('.bg-color-btn');

  toggle.addEventListener('click', () => panel.classList.toggle('open'));
  document.addEventListener('click', e => {
    if (!e.target.closest('#bg-switcher')) panel.classList.remove('open');
  });

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const color = btn.dataset.color;
      document.body.style.backgroundColor = color;
      document.documentElement.style.setProperty('--bg', color);
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });
}

// === HELPERS ===
function setText(id, value) {
  const el = document.getElementById(id);
  if (el && value) el.textContent = value;
}

function lightenColor(hex) {
  // simple: return white with low opacity blended
  return hex + '80';
}