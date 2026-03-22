import { Router } from 'express';
import db from '../db.js';

const router = Router();

// GET /api/tags
router.get('/', (req, res) => {
  const tags = db
    .prepare(
      `SELECT t.id, t.name, t.color, t.created_at,
              COUNT(nt.note_id) as note_count
       FROM tags t
       LEFT JOIN note_tags nt ON nt.tag_id = t.id
       WHERE t.user_id = ?
       GROUP BY t.id
       ORDER BY t.name ASC`
    )
    .all(req.user.id);
  res.json(tags);
});

// POST /api/tags
router.post('/', (req, res) => {
  const { name, color = '#00d4ff' } = req.body;
  if (!name || !name.trim()) return res.status(400).json({ error: 'Nome da tag é obrigatório' });

  try {
    const result = db
      .prepare('INSERT INTO tags (user_id, name, color) VALUES (?, ?, ?)')
      .run(req.user.id, name.trim().toLowerCase(), color);

    const tag = db
      .prepare(
        `SELECT t.id, t.name, t.color, t.created_at, COUNT(nt.note_id) as note_count
         FROM tags t LEFT JOIN note_tags nt ON nt.tag_id = t.id
         WHERE t.id = ? GROUP BY t.id`
      )
      .get(result.lastInsertRowid);

    res.status(201).json(tag);
  } catch (err) {
    if (err.message && err.message.includes('UNIQUE')) {
      return res.status(409).json({ error: 'Tag já existe' });
    }
    throw err;
  }
});

// PUT /api/tags/:id
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const existing = db.prepare('SELECT * FROM tags WHERE id = ? AND user_id = ?').get(id, req.user.id);
  if (!existing) return res.status(404).json({ error: 'Tag não encontrada' });

  const { name = existing.name, color = existing.color } = req.body;
  if (!name || !name.trim()) return res.status(400).json({ error: 'Nome da tag é obrigatório' });

  try {
    db.prepare('UPDATE tags SET name = ?, color = ? WHERE id = ? AND user_id = ?').run(
      name.trim().toLowerCase(), color, id, req.user.id
    );

    const tag = db
      .prepare(
        `SELECT t.id, t.name, t.color, t.created_at, COUNT(nt.note_id) as note_count
         FROM tags t LEFT JOIN note_tags nt ON nt.tag_id = t.id
         WHERE t.id = ? GROUP BY t.id`
      )
      .get(id);

    res.json(tag);
  } catch (err) {
    if (err.message && err.message.includes('UNIQUE')) {
      return res.status(409).json({ error: 'Tag já existe' });
    }
    throw err;
  }
});

// DELETE /api/tags/:id
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const tag = db.prepare('SELECT * FROM tags WHERE id = ? AND user_id = ?').get(id, req.user.id);
  if (!tag) return res.status(404).json({ error: 'Tag não encontrada' });

  db.prepare('DELETE FROM note_tags WHERE tag_id = ?').run(id);
  db.prepare('DELETE FROM tags WHERE id = ?').run(id);

  res.json({ success: true });
});

export default router;
