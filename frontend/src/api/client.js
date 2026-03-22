const BASE = '/api';

function getToken() {
  return localStorage.getItem('novanotes_token');
}

async function request(path, options = {}) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, { ...options, headers });

  if (res.status === 401) {
    localStorage.removeItem('novanotes_token');
    localStorage.removeItem('novanotes_user');
    window.location.reload();
    return;
  }

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(error.error || `Request failed: ${res.status}`);
  }

  const contentType = res.headers.get('content-type') || '';
  if (
    contentType.includes('application/xml') ||
    contentType.includes('text/html') ||
    contentType.includes('text/plain')
  ) {
    return res;
  }

  return res.json();
}

// ── Auth ────────────────────────────────────────────────────────
export function login(username, password) {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
}

export function register(username, email, password) {
  return request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ username, email, password }),
  });
}

export function getMe() {
  return request('/auth/me');
}

// ── Notes ──────────────────────────────────────────────────────
export function getNotes(params = {}) {
  const qs = new URLSearchParams();
  if (params.folder_id) qs.set('folder_id', params.folder_id);
  if (params.tag_id) qs.set('tag_id', params.tag_id);
  if (params.search) qs.set('search', params.search);
  const query = qs.toString() ? `?${qs}` : '';
  return request(`/notes${query}`);
}

export function getNote(id) {
  return request(`/notes/${id}`);
}

export function createNote(data) {
  return request('/notes', { method: 'POST', body: JSON.stringify(data) });
}

export function updateNote(id, data) {
  return request(`/notes/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}

export function deleteNote(id) {
  return request(`/notes/${id}`, { method: 'DELETE' });
}

export function exportNote(id, format) {
  return request(`/notes/${id}/export?format=${format}`);
}

// ── Folders ────────────────────────────────────────────────────
export function getFolders() {
  return request('/folders');
}

export function createFolder(data) {
  return request('/folders', { method: 'POST', body: JSON.stringify(data) });
}

export function updateFolder(id, data) {
  return request(`/folders/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}

export function deleteFolder(id) {
  return request(`/folders/${id}`, { method: 'DELETE' });
}

// ── Tags ───────────────────────────────────────────────────────
export function getTags() {
  return request('/tags');
}

export function createTag(data) {
  return request('/tags', { method: 'POST', body: JSON.stringify(data) });
}

export function updateTag(id, data) {
  return request(`/tags/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}

export function deleteTag(id) {
  return request(`/tags/${id}`, { method: 'DELETE' });
}
