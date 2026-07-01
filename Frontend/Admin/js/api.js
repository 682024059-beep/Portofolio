/* ===========================
   API.JS — shared fetch helper
=========================== */
const API_BASE = '/api/admin';

function getToken() {
  return localStorage.getItem('admin_token') || '';
}

async function apiFetch(path, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };
  const res = await fetch(API_BASE + path, { ...options, headers });
  const json = await res.json();
  if (res.status === 401) {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_email');
    window.location.href = '/Frontend/admin/login.html';
    return null;
  }
  return json;
}

async function apiGet(path)         { return apiFetch(path); }
async function apiPost(path, body)  { return apiFetch(path, { method: 'POST',   body: JSON.stringify(body) }); }
async function apiPut(path, body)   { return apiFetch(path, { method: 'PUT',    body: JSON.stringify(body) }); }
async function apiDelete(path)      { return apiFetch(path, { method: 'DELETE' }); }

// Multipart upload (for files)
async function apiUpload(path, formData) {
  const token = getToken();
  const res = await fetch(API_BASE + path, {
    method: 'POST',
    headers: token ? { 'Authorization': `Bearer ${token}` } : {},
    body: formData
  });
  const json = await res.json();
  if (res.status === 401) {
    window.location.href = '/Frontend/admin/login.html';
    return null;
  }
  return json;
}
