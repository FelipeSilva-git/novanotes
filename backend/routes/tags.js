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
       GROUP BY t.id
       ORDER BY t.name ASC`
    )
    .all();
  res.json(tags);
});

// POST /api/tags
router.post('/', (req, res) => {
  const { name, color = '#00d4ff' } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Tag name is required' });
  }

  try {
    const result = db
      .prepare('INSERT INTO tags (name, color) VALUES (?, ?)')
      .run(name.trim().toLowerCase(), color);

    const tag = db
      .prepare(
        `SELECT t.id, t.name, t.color, t.created_at,
                COUNT(nt.note_id) as note_count
         FROM tags t
         LEFT JOIN note_tags nt ON nt.tag_id = t.id
         WHERE t.id = ?
         GROUP BY t.id`
      )
      .get(result.lastInsertRowid);

    res.status(201).json(tag);
  } catch (err) {
    if (err.message && err.message.includes('UNIQUE')) {
      return res.status(409).json({ error: 'Tag name already exists' });
    }
    throw err;
  }
});

// PUT /api/tags/:id
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const existing = db.prepare('SELECT * FROM tags WHERE id = ?').get(id);

  if (!existing) {
    return res.status(404).json({ error: 'Tag not found' });
  }

  const { name = existing.name, color = existing.color } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Tag name is required' });
  }

  try {
    db.prepare('UPDATE tags SET name = ?, color = ? WHERE id = ?').run(
      name.trim().toLowerCase(),
      color,
      id
    );

    const tag = db
      .prepare(
        `SELECT t.id, t.name, t.color, t.created_at,
                COUNT(nt.note_id) as note_count
         FROM tags t
         LEFT JOIN note_tags nt ON nt.tag_id = t.id
         WHERE t.id = ?
         GROUP BY t.id`
      )
      .get(id);

    res.json(tag);
  } catch (err) {
    if (err.message && err.message.includes('UNIQUE')) {
      return res.status(409).json({ error: 'Tag name already exists' });
    }
    throw err;
  }
});

// DELETE /api/tags/:id
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const tag = db.prepare('SELECT * FROM tags WHERE id = ?').get(id);

  if (!tag) {
    return res.status(404).json({ error: 'Tag not found' });
  }

  // Cascade delete note_tags rows
  db.prepare('DELETE FROM note_tags WHERE tag_id = ?').run(id);
  db.prepare('DELETE FROM tags WHERE id = ?').run(id);

  res.json({ success: true });
});

export default router;
