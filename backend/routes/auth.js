import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db, { seedUserWorkspace } from '../db.js';
import { JWT_SECRET, requireAuth } from '../middleware/auth.js';
import { sendVerificationEmail } from '../email.js';

const router = Router();

function generateCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function codeExpiry() {
  return new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 min
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Username, email e senha são obrigatórios' });
  }
  if (username.length < 3) {
    return res.status(400).json({ error: 'Username deve ter pelo menos 3 caracteres' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Email inválido' });
  }
  if (password.length < 4) {
    return res.status(400).json({ error: 'Senha deve ter pelo menos 4 caracteres' });
  }

  const existingUsername = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
  if (existingUsername) return res.status(409).json({ error: 'Username já está em uso' });

  const existingEmail = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existingEmail) return res.status(409).json({ error: 'Email já cadastrado' });

  const hash = bcrypt.hashSync(password, 10);
  const code = generateCode();
  const expires = codeExpiry();

  const result = db
    .prepare(
      'INSERT INTO users (username, email, password_hash, verified, verification_code, verification_expires, created_at) VALUES (?, ?, ?, 0, ?, ?, ?)'
    )
    .run(username, email.toLowerCase(), hash, code, expires, new Date().toISOString());

  try {
    await sendVerificationEmail(email, username, code);
  } catch (err) {
    console.error('Erro ao enviar email:', err.message);
    // Delete the user so they can try again
    db.prepare('DELETE FROM users WHERE id = ?').run(result.lastInsertRowid);
    return res.status(500).json({ error: 'Não foi possível enviar o email de verificação. Verifique as configurações de SMTP.' });
  }

  res.status(201).json({ pendingVerification: true, email: email.toLowerCase() });
});

// POST /api/auth/verify
router.post('/verify', (req, res) => {
  const { email, code } = req.body;
  if (!email || !code) return res.status(400).json({ error: 'Email e código são obrigatórios' });

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase());
  if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });
  if (user.verified) return res.status(400).json({ error: 'Conta já verificada' });

  if (user.verification_code !== String(code).trim()) {
    return res.status(400).json({ error: 'Código incorreto' });
  }
  if (new Date(user.verification_expires) < new Date()) {
    return res.status(400).json({ error: 'Código expirado. Solicite um novo.' });
  }

  db.prepare(
    'UPDATE users SET verified = 1, verification_code = NULL, verification_expires = NULL WHERE id = ?'
  ).run(user.id);

  seedUserWorkspace(user.id);

  const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '30d' });
  res.json({ token, user: { id: user.id, username: user.username, email: user.email } });
});

// POST /api/auth/resend
router.post('/resend', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email é obrigatório' });

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase());
  if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });
  if (user.verified) return res.status(400).json({ error: 'Conta já verificada' });

  const code = generateCode();
  const expires = codeExpiry();

  db.prepare(
    'UPDATE users SET verification_code = ?, verification_expires = ? WHERE id = ?'
  ).run(code, expires, user.id);

  try {
    await sendVerificationEmail(email, user.username, code);
  } catch (err) {
    console.error('Erro ao reenviar email:', err.message);
    return res.status(500).json({ error: 'Falha ao enviar email. Tente novamente.' });
  }

  res.json({ sent: true });
});

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username e senha são obrigatórios' });
  }

  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: 'Credenciais inválidas' });
  }
  if (!user.verified) {
    return res.status(403).json({
      error: 'Conta não verificada. Verifique seu email.',
      pendingVerification: true,
      email: user.email,
    });
  }

  const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '30d' });
  res.json({ token, user: { id: user.id, username: user.username, email: user.email } });
});

// GET /api/auth/me
router.get('/me', requireAuth, (req, res) => {
  const user = db
    .prepare('SELECT id, username, email, created_at FROM users WHERE id = ?')
    .get(req.user.id);
  if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });
  res.json(user);
});

export default router;
