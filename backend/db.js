import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const db = new Database(join(__dirname, 'novanotes.db'));

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS folders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    color TEXT NOT NULL DEFAULT '#6c63ff',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    color TEXT NOT NULL DEFAULT '#00d4ff',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL DEFAULT 'Untitled Note',
    content TEXT NOT NULL DEFAULT '',
    folder_id INTEGER REFERENCES folders(id) ON DELETE SET NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS note_tags (
    note_id INTEGER NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
    tag_id INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (note_id, tag_id)
  );
`);

// Seed data — only if tables are empty
const folderCount = db.prepare('SELECT COUNT(*) as cnt FROM folders').get();
if (folderCount.cnt === 0) {
  const insertFolder = db.prepare(
    'INSERT INTO folders (name, color) VALUES (?, ?)'
  );
  const insertTag = db.prepare('INSERT INTO tags (name, color) VALUES (?, ?)');
  const insertNote = db.prepare(
    'INSERT INTO notes (title, content, folder_id) VALUES (?, ?, ?)'
  );
  const insertNoteTag = db.prepare(
    'INSERT INTO note_tags (note_id, tag_id) VALUES (?, ?)'
  );

  const personalFolder = insertFolder.run('Personal', '#6c63ff');
  const workFolder = insertFolder.run('Work', '#00d4ff');

  const importantTag = insertTag.run('important', '#ff6b6b');
  const todoTag = insertTag.run('todo', '#ffd93d');
  const ideaTag = insertTag.run('idea', '#6bcb77');

  const note1 = insertNote.run(
    'Welcome to NovaNotes',
    `<h1>Welcome to NovaNotes</h1><p>NovaNotes is your futuristic, distraction-free note-taking app. Here's what you can do:</p><ul><li><p>Organize notes into <strong>folders</strong></p></li><li><p>Tag notes with <strong>custom tags</strong></p></li><li><p>Write rich content with the <strong>TipTap editor</strong></p></li><li><p>Export notes as <strong>HTML or XML</strong></p></li></ul><p>Start by creating a new note with the <strong>New Note</strong> button or pressing <code>Ctrl+N</code>.</p>`,
    personalFolder.lastInsertRowid
  );

  const note2 = insertNote.run(
    'Project Ideas',
    `<h2>Ideas to Explore</h2><ul data-type="taskList"><li data-checked="false" data-type="taskItem"><label><input type="checkbox"><span></span></label><div><p>Build a CLI tool for NovaNotes sync</p></div></li><li data-checked="false" data-type="taskItem"><label><input type="checkbox"><span></span></label><div><p>Add end-to-end encryption for notes</p></div></li><li data-checked="true" data-type="taskItem"><label><input type="checkbox" checked><span></span></label><div><p>Implement PWA offline support</p></div></li></ul><blockquote><p>The best ideas are the ones you actually write down.</p></blockquote>`,
    workFolder.lastInsertRowid
  );

  insertNoteTag.run(note1.lastInsertRowid, importantTag.lastInsertRowid);
  insertNoteTag.run(note2.lastInsertRowid, todoTag.lastInsertRowid);
  insertNoteTag.run(note2.lastInsertRowid, ideaTag.lastInsertRowid);
}

export default db;
