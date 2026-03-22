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
       WHERE f.user_id = ?
       GROUP BY f.id
       ORDER BY f.created_at ASC`
    )
    .all(req.user.id);
  res.json(folders);
});

// POST /api/folders
router.post('/', (req, res) => {
  const { name, color = '#6c63ff' } = req.body;
  if (!name || !name.trim()) return res.status(400).json({ error: 'Nome da pasta é obrigatório' });

  const result = db
    .prepare('INSERT INTO folders (user_id, name, color) VALUES (?, ?, ?)')
    .run(req.user.id, name.trim(), color);

  const folder = db
    .prepare(
      `SELECT f.id, f.name, f.color, f.created_at, COUNT(n.id) as note_count
       FROM folders f LEFT JOIN notes n ON n.folder_id = f.id
       WHERE f.id = ? GROUP BY f.id`
    )
    .get(result.lastInsertRowid);

  res.status(201).json(folder);
});

// PUT /api/folders/:id
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const existing = db.prepare('SELECT * FROM folders WHERE id = ? AND user_id = ?').get(id, req.user.id);
  if (!existing) return res.status(404).json({ error: 'Pasta não encontrada' });

  const { name = existing.name, color = existing.color } = req.body;
  if (!name || !name.trim()) return res.status(400).json({ error: 'Nome da pasta é obrigatório' });

  db.prepare('UPDATE folders SET name = ?, color = ? WHERE id = ? AND user_id = ?').run(
    name.trim(), color, id, req.user.id
  );

  const folder = db
    .prepare(
      `SELECT f.id, f.name, f.color, f.created_at, COUNT(n.id) as note_count
       FROM folders f LEFT JOIN notes n ON n.folder_id = f.id
       WHERE f.id = ? GROUP BY f.id`
    )
    .get(id);

  res.json(folder);
});

// DELETE /api/folders/:id
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const folder = db.prepare('SELECT * FROM folders WHERE id = ? AND user_id = ?').get(id, req.user.id);
  if (!folder) return res.status(404).json({ error: 'Pasta não encontrada' });

  db.prepare('UPDATE notes SET folder_id = NULL WHERE folder_id = ? AND user_id = ?').run(id, req.user.id);
  db.prepare('DELETE FROM folders WHERE id = ?').run(id);

  res.json({ success: true });
});

export default router;
