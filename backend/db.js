import 'dotenv/config';
import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const db = new Database(join(__dirname, 'novanotes.db'));

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id                  INTEGER PRIMARY KEY AUTOINCREMENT,
    username            TEXT NOT NULL UNIQUE,
    email               TEXT NOT NULL UNIQUE,
    password_hash       TEXT NOT NULL,
    verified            INTEGER NOT NULL DEFAULT 0,
    verification_code   TEXT,
    verification_expires TEXT,
    created_at          TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS folders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    color TEXT NOT NULL DEFAULT '#6c63ff',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    color TEXT NOT NULL DEFAULT '#00d4ff',
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(user_id, name)
  );

  CREATE TABLE IF NOT EXISTS notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
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

export default db;

// Helper: seed a fresh workspace for a new user
export function seedUserWorkspace(userId) {
  const insertFolder = db.prepare('INSERT INTO folders (user_id, name, color) VALUES (?, ?, ?)');
  const insertTag = db.prepare('INSERT INTO tags (user_id, name, color) VALUES (?, ?, ?)');
  const insertNote = db.prepare(
    'INSERT INTO notes (user_id, title, content, folder_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)'
  );
  const insertNoteTag = db.prepare('INSERT INTO note_tags (note_id, tag_id) VALUES (?, ?)');

  const now = new Date().toISOString();

  const personalFolder = insertFolder.run(userId, 'Personal', '#6c63ff');
  const workFolder = insertFolder.run(userId, 'Work', '#00d4ff');

  const importantTag = insertTag.run(userId, 'important', '#ff6b6b');
  const todoTag = insertTag.run(userId, 'todo', '#ffd93d');
  const ideaTag = insertTag.run(userId, 'idea', '#6bcb77');

  const note1 = insertNote.run(
    userId,
    'Bem-vindo ao NovaNotes',
    `<h1>Bem-vindo ao NovaNotes</h1><p>Este é o seu workspace pessoal. Aqui você pode:</p><ul><li><p>Organizar notas em <strong>pastas</strong></p></li><li><p>Marcar notas com <strong>tags personalizadas</strong></p></li><li><p>Escrever conteúdo rico com o editor <strong>TipTap</strong></p></li><li><p>Exportar notas como <strong>HTML ou XML</strong></p></li></ul><p>Crie uma nova nota com o botão <strong>Nova Nota</strong> ou pressionando <code>Ctrl+N</code>.</p>`,
    personalFolder.lastInsertRowid,
    now, now
  );

  const note2 = insertNote.run(
    userId,
    'Ideias de Projeto',
    `<h2>Ideias para Explorar</h2><ul data-type="taskList"><li data-checked="false" data-type="taskItem"><label><input type="checkbox"><span></span></label><div><p>Criar uma CLI para sincronizar notas</p></div></li><li data-checked="false" data-type="taskItem"><label><input type="checkbox"><span></span></label><div><p>Adicionar criptografia ponta a ponta</p></div></li><li data-checked="true" data-type="taskItem"><label><input type="checkbox" checked><span></span></label><div><p>Implementar suporte offline com PWA</p></div></li></ul><blockquote><p>As melhores ideias são as que você realmente anota.</p></blockquote>`,
    workFolder.lastInsertRowid,
    now, now
  );

  insertNoteTag.run(note1.lastInsertRowid, importantTag.lastInsertRowid);
  insertNoteTag.run(note2.lastInsertRowid, todoTag.lastInsertRowid);
  insertNoteTag.run(note2.lastInsertRowid, ideaTag.lastInsertRowid);
}
