import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

import authRouter from './routes/auth.js';
import notesRouter from './routes/notes.js';
import foldersRouter from './routes/folders.js';
import tagsRouter from './routes/tags.js';
import { requireAuth } from './middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import net from 'net';

const app = express();
const PREFERRED_PORT = Number(process.env.PORT) || 5173;

function findFreePort(startPort) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.listen(startPort, () => {
      const { port } = server.address();
      server.close(() => resolve(port));
    });
    server.on('error', () => resolve(findFreePort(startPort + 1)));
  });
}

app.use(cors({ origin: '*' }));
app.use(express.json());

// Public routes
app.use('/api/auth', authRouter);

// Protected routes
app.use('/api/notes', requireAuth, notesRouter);
app.use('/api/folders', requireAuth, foldersRouter);
app.use('/api/tags', requireAuth, tagsRouter);

// Serve frontend static files (when built)
import { existsSync } from 'fs';
const distPath = join(__dirname, '../frontend/dist');
if (existsSync(distPath)) {
  app.use(express.static(distPath, { maxAge: '1h', setHeaders: (res, path) => {
    if (path.endsWith('.html')) res.setHeader('Cache-Control', 'no-cache');
  }}));
  app.get('*', (req, res) => {
    res.setHeader('Cache-Control', 'no-cache');
    res.sendFile(join(distPath, 'index.html'));
  });
}

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

findFreePort(PREFERRED_PORT).then((port) => {
  app.listen(port, () => {
    console.log(`NovaNotes rodando em http://localhost:${port}`);
  });
});
