# NovaNotes — Documentação Completa

## Visão Geral

NovaNotes é um app de anotações futurista full-stack com autenticação JWT, workspaces isolados por usuário, editor rich text TipTap, organização por pastas e tags, exportação e suporte PWA.

---

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Frontend | React 18 + Vite |
| Editor | TipTap 2 |
| Estado | Zustand |
| Backend | Node.js + Express |
| Banco | SQLite via better-sqlite3 |
| Auth | JWT (jsonwebtoken + bcryptjs) |
| PWA | vite-plugin-pwa (Workbox) |
| Ícones | lucide-react |

---

## Estrutura de Pastas

```
novanotes/
├── backend/
│   ├── server.js               # Entry point Express (porta 3001)
│   ├── db.js                   # Schema SQLite + seed por usuário
│   ├── middleware/
│   │   └── auth.js             # Middleware JWT (requireAuth)
│   └── routes/
│       ├── auth.js             # /api/auth — register, login, me
│       ├── notes.js            # /api/notes — CRUD + export
│       ├── folders.js          # /api/folders — CRUD
│       └── tags.js             # /api/tags — CRUD
└── frontend/
    ├── vite.config.js          # Vite + PWA + proxy /api → 3001
    ├── public/
    │   └── manifest.json       # PWA manifest
    └── src/
        ├── main.jsx
        ├── App.jsx             # Layout 3 colunas + guard de auth
        ├── index.css           # Tema dark futurista (CSS vars)
        ├── api/
        │   └── client.js       # Fetch wrapper com Bearer token
        ├── store/
        │   └── appStore.js     # Zustand: auth + notes/folders/tags
        ├── hooks/
        │   ├── useNotes.js
        │   ├── useFolders.js
        │   └── useTags.js
        └── components/
            ├── AuthPage.jsx    # Login / Registro
            ├── Sidebar.jsx     # Pastas, tags, busca, user, logout
            ├── NoteList.jsx    # Lista filtrada de notas
            ├── NoteEditor.jsx  # Editor TipTap + autosave
            ├── TagManager.jsx  # Seletor de tags inline
            ├── ExportMenu.jsx  # Download XML/HTML
            └── SettingsModal.jsx # Config + rotas da API
```

---

## Banco de Dados

### Schema

```sql
CREATE TABLE users (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  username     TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at   TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE folders (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  color      TEXT NOT NULL DEFAULT '#6c63ff',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE tags (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  color      TEXT NOT NULL DEFAULT '#00d4ff',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(user_id, name)
);

CREATE TABLE notes (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title      TEXT NOT NULL DEFAULT 'Untitled Note',
  content    TEXT NOT NULL DEFAULT '',        -- HTML do TipTap
  folder_id  INTEGER REFERENCES folders(id) ON DELETE SET NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE note_tags (
  note_id INTEGER NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
  tag_id  INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (note_id, tag_id)
);
```

### Isolamento por workspace

Cada `user_id` é independente. Ao registrar, o sistema executa `seedUserWorkspace(userId)` que cria automaticamente:
- 2 pastas: **Personal** e **Work**
- 3 tags: **important**, **todo**, **idea**
- 2 notas de exemplo com conteúdo real

---

## Autenticação

### Fluxo

```
POST /api/auth/register  →  cria user + seed + retorna { token, user }
POST /api/auth/login     →  valida senha + retorna { token, user }
GET  /api/auth/me        →  retorna dados do user autenticado
```

- Senha armazenada com **bcryptjs** (salt 10)
- Token **JWT** com expiração de 30 dias
- Token guardado em `localStorage` (`novanotes_token`)
- Todo request protegido envia `Authorization: Bearer <token>`
- Token expirado/inválido → 401 → frontend limpa storage e recarrega

### Variável de ambiente

```bash
JWT_SECRET=sua-chave-secreta-aqui  # padrão: 'novanotes-jwt-secret-change-in-prod'
```

---

## API Reference

> **Base URL:** `http://<host>:5173` (via proxy Vite) ou `http://<host>:3001` (direto, se a porta estiver aberta)
>
> Todas as rotas exceto `/api/auth/*` exigem header `Authorization: Bearer <token>`

### Auth

| Método | Rota | Body | Descrição |
|--------|------|------|-----------|
| POST | `/api/auth/register` | `{ username, password }` | Cria conta e workspace |
| POST | `/api/auth/login` | `{ username, password }` | Retorna token JWT |
| GET | `/api/auth/me` | — | Dados do usuário logado |

### Notas

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/notes` | Lista notas do usuário |
| GET | `/api/notes?search=texto` | Busca por título ou conteúdo |
| GET | `/api/notes?folder_id=1` | Filtra por pasta |
| GET | `/api/notes?tag_id=2` | Filtra por tag |
| GET | `/api/notes/:id` | Nota específica com tags |
| POST | `/api/notes` | Cria nota |
| PUT | `/api/notes/:id` | Atualiza nota |
| DELETE | `/api/notes/:id` | Deleta nota |
| GET | `/api/notes/:id/export?format=html` | Exporta como HTML completo |
| GET | `/api/notes/:id/export?format=xml` | Exporta como XML com metadados |

**Body POST/PUT:**
```json
{
  "title": "Título da nota",
  "content": "<p>HTML do TipTap</p>",
  "folder_id": 1,
  "tag_ids": [1, 2]
}
```

### Pastas

| Método | Rota | Body | Descrição |
|--------|------|------|-----------|
| GET | `/api/folders` | — | Lista pastas com contagem de notas |
| POST | `/api/folders` | `{ name, color }` | Cria pasta |
| PUT | `/api/folders/:id` | `{ name, color }` | Atualiza pasta |
| DELETE | `/api/folders/:id` | — | Deleta pasta (notas ficam sem pasta) |

### Tags

| Método | Rota | Body | Descrição |
|--------|------|------|-----------|
| GET | `/api/tags` | — | Lista tags com contagem de notas |
| POST | `/api/tags` | `{ name, color }` | Cria tag |
| PUT | `/api/tags/:id` | `{ name, color }` | Atualiza tag |
| DELETE | `/api/tags/:id` | — | Deleta tag e remove de todas as notas |

### Exemplos com curl

```bash
# Registrar
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"joao","password":"1234"}'

# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"joao","password":"1234"}'

# Listar notas (com token)
TOKEN="eyJhbGci..."
curl http://localhost:3001/api/notes \
  -H "Authorization: Bearer $TOKEN"

# Buscar
curl "http://localhost:3001/api/notes?search=projeto" \
  -H "Authorization: Bearer $TOKEN"

# Exportar HTML
curl "http://localhost:3001/api/notes/1/export?format=html" \
  -H "Authorization: Bearer $TOKEN" -o nota.html
```

### Exemplos com JavaScript

```js
// Login e buscar notas
const { token } = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username: 'joao', password: '1234' })
}).then(r => r.json());

const notes = await fetch('/api/notes', {
  headers: { 'Authorization': `Bearer ${token}` }
}).then(r => r.json());

// Criar nota
const note = await fetch('/api/notes', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    title: 'Minha nota',
    content: '<p>Conteúdo</p>',
    folder_id: 1,
    tag_ids: [1, 2]
  })
}).then(r => r.json());
```

---

## Como Rodar

### Instalação

```bash
cd /home/ubuntu/novanotes
npm install            # instala concurrently (root)
npm run install:all    # instala deps do backend e frontend
```

### Desenvolvimento

```bash
# Rodar tudo junto (a partir do root)
npm run dev

# Separado
cd backend  && npm run dev   # porta 3001 (node --watch)
cd frontend && npm run dev   # porta 5173 (HMR)

# Com host externo (aceita conexões externas)
cd frontend && npm run dev -- --host
```

### Produção

```bash
cd frontend && npm run build   # gera frontend/dist
NODE_ENV=production node backend/server.js  # serve frontend + API na 3001
```

---

## Funcionalidades do Editor

O TipTap suporta (com atalhos de teclado):

| Funcionalidade | Atalho |
|---|---|
| Negrito | `Ctrl+B` |
| Itálico | `Ctrl+I` |
| Sublinhado | `Ctrl+U` |
| Tachado | `Ctrl+Shift+S` |
| Título H1/H2/H3 | Toolbar |
| Lista com marcadores | `Ctrl+Shift+8` |
| Lista numerada | `Ctrl+Shift+7` |
| Lista de tarefas | Toolbar |
| Bloco de código | Toolbar |
| Citação | Toolbar |
| Link | Toolbar (abre dialog) |
| Highlight | Toolbar |
| Desfazer/Refazer | `Ctrl+Z` / `Ctrl+Y` |
| Nova nota | `Ctrl+N` |

**Autosave:** 1,5 segundos após última alteração.

---

## PWA

O app é instalável como PWA (Progressive Web App):

- Service worker gerado pelo Workbox via `vite-plugin-pwa`
- Manifest em `frontend/public/manifest.json`
- Tema: `#0f0f1a` | Display: `standalone`
- Precache de todos os assets estáticos
- Para instalar: abrir no Chrome → ícone de instalação na barra de endereço

---

## Tema Visual

Variáveis CSS definidas em `src/index.css`:

```css
--bg-primary:      #0f0f1a   /* fundo principal */
--bg-secondary:    #141428   /* sidebar */
--bg-tertiary:     #1a1a35
--bg-card:         #1e1e3a   /* cards e modais */
--accent-primary:  #6c63ff   /* roxo neon */
--accent-secondary:#00d4ff   /* ciano neon */
--accent-glow:     rgba(108,99,255,0.3)
--text-primary:    #e8e8ff
--text-secondary:  #9090b8
--border:          rgba(108,99,255,0.2)
--border-hover:    rgba(108,99,255,0.5)
--danger:          #ff4d6d
```

Classes utilitárias: `.glass`, `.glow-text`, `.neon-border`

---

## Portas

| Serviço | Porta | Observação |
|---------|-------|-----------|
| Frontend (Vite dev) | 5173 | Proxy `/api/*` → 3001 |
| Backend (Express) | 3001 | Pode ficar privado se usar o proxy |

> Se o backend estiver na porta 3001 sem estar aberta no firewall, use sempre as rotas via `:5173/api/*` — o Vite faz o proxy internamente.
