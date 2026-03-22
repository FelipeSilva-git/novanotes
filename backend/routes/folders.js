import { Router } from 'express';
import db from '../db.js';

const router = Router();

// GET /api/folders
router.get('/', (req, res) => {
  const folders = db
    .prepare(
      `SELECT f.id, f.name, f.color, f.created_at,
              COUNT(n.id) as note_count
       FROM folders f
       LEFT JOIN notes n ON n.folder_id = f.id
       GROUP BY f.id
       ORDER BY f.created_at ASC`
    )
    .all();
  res.json(folders);
});

// POST /api/folders
router.post('/', (req, res) => {
  const { name, color = '#6c63ff' } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Folder name is required' });
  }

  const result = db
    .prepare('INSERT INTO folders (name, color) VALUES (?, ?)')
    .run(name.trim(), color);

  const folder = db
    .prepare(
      `SELECT f.id, f.name, f.color, f.created_at,
              COUNT(n.id) as note_count
       FROM folders f
       LEFT JOIN notes n ON n.folder_id = f.id
       WHERE f.id = ?
       GROUP BY f.id`
    )
    .get(result.lastInsertRowid);

  res.status(201).json(folder);
});

// PUT /api/folders/:id
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const existing = db.prepare('SELECT * FROM folders WHERE id = ?').get(id);

  if (!existing) {
    return res.status(404).json({ error: 'Folder not found' });
  }

  const { name = existing.name, color = existing.color } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Folder name is required' });
  }

  db.prepare('UPDATE folders SET name = ?, color = ? WHERE id = ?').run(
    name.trim(),
    color,
    id
  );

  const folder = db
    .prepare(
      `SELECT f.id, f.name, f.color, f.created_at,
              COUNT(n.id) as note_count
       FROM folders f
       LEFT JOIN notes n ON n.folder_id = f.id
       WHERE f.id = ?
       GROUP BY f.id`
    )
    .get(id);

  res.json(folder);
});

// DELETE /api/folders/:id
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const folder = db.prepare('SELECT * FROM folders WHERE id = ?').get(id);

  if (!folder) {
    return res.status(404).json({ error: 'Folder not found' });
  }

  // Nullify folder_id for notes in this folder
  db.prepare('UPDATE notes SET folder_id = NULL WHERE folder_id = ?').run(id);
  db.prepare('DELETE FROM folders WHERE id = ?').run(id);

  res.json({ success: true });
});

export default router;
