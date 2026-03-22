import { Router } from 'express';
import db from '../db.js';

const router = Router();

function getTagsForNote(noteId) {
  return db
    .prepare(
      `SELECT t.id, t.name, t.color FROM tags t
       INNER JOIN note_tags nt ON nt.tag_id = t.id
       WHERE nt.note_id = ?`
    )
    .all(noteId);
}

function setTagsForNote(noteId, tagIds) {
  db.prepare('DELETE FROM note_tags WHERE note_id = ?').run(noteId);
  const insert = db.prepare('INSERT OR IGNORE INTO note_tags (note_id, tag_id) VALUES (?, ?)');
  for (const tagId of tagIds) {
    insert.run(noteId, tagId);
  }
}

// GET /api/notes
router.get('/', (req, res) => {
  const { folder_id, tag_id, search } = req.query;
  const userId = req.user.id;

  let query = `
    SELECT DISTINCT n.id, n.title, n.content, n.folder_id,
           f.name as folder_name, f.color as folder_color,
           n.created_at, n.updated_at
    FROM notes n
    LEFT JOIN folders f ON f.id = n.folder_id
  `;
  const conditions = ['n.user_id = ?'];
  const params = [userId];

  if (tag_id) {
    query += ` INNER JOIN note_tags nt ON nt.note_id = n.id`;
    conditions.push('nt.tag_id = ?');
    params.push(tag_id);
  }

  if (folder_id) {
    conditions.push('n.folder_id = ?');
    params.push(folder_id);
  }

  if (search) {
    conditions.push('(n.title LIKE ? OR n.content LIKE ?)');
    params.push(`%${search}%`, `%${search}%`);
  }

  query += ' WHERE ' + conditions.join(' AND ');
  query += ' ORDER BY n.updated_at DESC';

  const notes = db.prepare(query).all(...params);
  const result = notes.map((note) => ({ ...note, tags: getTagsForNote(note.id) }));
  res.json(result);
});

// GET /api/notes/:id
router.get('/:id', (req, res) => {
  const note = db
    .prepare(
      `SELECT n.id, n.title, n.content, n.folder_id,
              f.name as folder_name, f.color as folder_color,
              n.created_at, n.updated_at
       FROM notes n
       LEFT JOIN folders f ON f.id = n.folder_id
       WHERE n.id = ? AND n.user_id = ?`
    )
    .get(req.params.id, req.user.id);

  if (!note) return res.status(404).json({ error: 'Nota não encontrada' });

  note.tags = getTagsForNote(note.id);
  res.json(note);
});

// POST /api/notes
router.post('/', (req, res) => {
  const { title = 'Untitled Note', content = '', folder_id = null, tag_ids = [] } = req.body;
  const now = new Date().toISOString();

  const result = db
    .prepare(
      'INSERT INTO notes (user_id, title, content, folder_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)'
    )
    .run(req.user.id, title, content, folder_id || null, now, now);

  const noteId = result.lastInsertRowid;
  setTagsForNote(noteId, tag_ids);

  const note = db
    .prepare(
      `SELECT n.id, n.title, n.content, n.folder_id,
              f.name as folder_name, f.color as folder_color,
              n.created_at, n.updated_at
       FROM notes n
       LEFT JOIN folders f ON f.id = n.folder_id
       WHERE n.id = ?`
    )
    .get(noteId);
  note.tags = getTagsForNote(noteId);

  res.status(201).json(note);
});

// PUT /api/notes/:id
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const existing = db.prepare('SELECT * FROM notes WHERE id = ? AND user_id = ?').get(id, req.user.id);
  if (!existing) return res.status(404).json({ error: 'Nota não encontrada' });

  const {
    title = existing.title,
    content = existing.content,
    folder_id = existing.folder_id,
    tag_ids,
  } = req.body;

  const now = new Date().toISOString();
  db.prepare(
    'UPDATE notes SET title = ?, content = ?, folder_id = ?, updated_at = ? WHERE id = ? AND user_id = ?'
  ).run(title, content, folder_id || null, now, id, req.user.id);

  if (Array.isArray(tag_ids)) setTagsForNote(id, tag_ids);

  const note = db
    .prepare(
      `SELECT n.id, n.title, n.content, n.folder_id,
              f.name as folder_name, f.color as folder_color,
              n.created_at, n.updated_at
       FROM notes n
       LEFT JOIN folders f ON f.id = n.folder_id
       WHERE n.id = ?`
    )
    .get(id);
  note.tags = getTagsForNote(id);
  res.json(note);
});

// DELETE /api/notes/:id
router.delete('/:id', (req, res) => {
  const note = db.prepare('SELECT id FROM notes WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
  if (!note) return res.status(404).json({ error: 'Nota não encontrada' });
  db.prepare('DELETE FROM notes WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// GET /api/notes/:id/export?format=xml|html
router.get('/:id/export', (req, res) => {
  const { id } = req.params;
  const { format = 'html' } = req.query;

  const note = db
    .prepare(
      `SELECT n.id, n.title, n.content, n.folder_id,
              f.name as folder_name, n.created_at, n.updated_at
       FROM notes n
       LEFT JOIN folders f ON f.id = n.folder_id
       WHERE n.id = ? AND n.user_id = ?`
    )
    .get(id, req.user.id);

  if (!note) return res.status(404).json({ error: 'Nota não encontrada' });

  const tags = getTagsForNote(id);

  if (format === 'xml') {
    const escapeXml = (str) =>
      String(str || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');

    const tagsXml = tags
      .map((t) => `    <tag color="${escapeXml(t.color)}">${escapeXml(t.name)}</tag>`)
      .join('\n');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<note>
  <id>${note.id}</id>
  <title>${escapeXml(note.title)}</title>
  <folder>${escapeXml(note.folder_name || '')}</folder>
  <created_at>${escapeXml(note.created_at)}</created_at>
  <updated_at>${escapeXml(note.updated_at)}</updated_at>
  <tags>
${tagsXml}
  </tags>
  <content><![CDATA[${note.content}]]></content>
</note>`;

    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Content-Disposition', `attachment; filename="note-${id}.xml"`);
    return res.send(xml);
  }

  // HTML export
  const tagPills = tags
    .map(
      (t) =>
        `<span style="background:${t.color};color:#fff;padding:2px 10px;border-radius:12px;font-size:12px;margin-right:6px;">${t.name}</span>`
    )
    .join('');

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${note.title} — NovaNotes Export</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0f0f1a; color: #e8e8ff; padding: 48px 24px; line-height: 1.7; }
    .wrapper { max-width: 780px; margin: 0 auto; background: #1e1e3a; border-radius: 16px; padding: 48px; border: 1px solid rgba(108,99,255,0.2); }
    h1.note-title { font-size: 2rem; font-weight: 700; color: #e8e8ff; margin-bottom: 8px; text-shadow: 0 0 20px rgba(108,99,255,0.5); }
    .meta { font-size: 13px; color: #9090b8; margin-bottom: 16px; }
    .tags { margin-bottom: 32px; }
    .content h1, .content h2, .content h3 { color: #e8e8ff; margin: 24px 0 12px; }
    .content p { margin-bottom: 12px; color: #c8c8e8; }
    .content ul, .content ol { padding-left: 24px; margin-bottom: 12px; color: #c8c8e8; }
    .content blockquote { border-left: 3px solid #6c63ff; padding-left: 16px; color: #9090b8; font-style: italic; margin: 16px 0; }
    .content code { background: rgba(108,99,255,0.2); padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 0.9em; }
    .content pre { background: rgba(0,0,0,0.4); padding: 16px; border-radius: 8px; overflow-x: auto; margin: 16px 0; }
    .content pre code { background: none; padding: 0; }
    .content a { color: #6c63ff; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid rgba(108,99,255,0.2); font-size: 12px; color: #9090b8; text-align: center; }
  </style>
</head>
<body>
  <div class="wrapper">
    <h1 class="note-title">${note.title}</h1>
    <div class="meta">${note.folder_name ? `Pasta: ${note.folder_name} &nbsp;|&nbsp; ` : ''}Criado: ${new Date(note.created_at).toLocaleDateString('pt-BR')} &nbsp;|&nbsp; Atualizado: ${new Date(note.updated_at).toLocaleDateString('pt-BR')}</div>
    <div class="tags">${tagPills}</div>
    <div class="content">${note.content}</div>
    <div class="footer">Exportado do NovaNotes</div>
  </div>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html');
  res.setHeader('Content-Disposition', `attachment; filename="note-${id}.html"`);
  return res.send(html);
});

export default router;
