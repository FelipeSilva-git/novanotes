# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
```bash
# From /novanotes root — start both servers concurrently
npm run dev

# Backend only (port 3001, auto-restarts on change)
cd backend && npm run dev

# Frontend only (port 5173, HMR)
cd frontend && npm run dev
```

### Install
```bash
npm install            # root (concurrently)
npm run install:all    # backend + frontend
```

### Build & Preview
```bash
cd frontend && npm run build    # outputs to frontend/dist
cd frontend && npm run preview  # serve production build
```

## Architecture

Three-layer stack: React SPA (Vite) → Express REST API → SQLite via better-sqlite3.

**Frontend** (`frontend/src/`):
- `App.jsx` — three-column layout: Sidebar (260px) | NoteList (320px) | NoteEditor (flex)
- `store/appStore.js` — Zustand store: selected note/folder/tag IDs, search query, CRUD actions
- `hooks/` — data-fetching hooks (useNotes, useFolders, useTags) that watch store state and call the API
- `api/client.js` — thin fetch wrapper; all 14 API calls live here
- `components/NoteEditor.jsx` — TipTap editor with 18-button toolbar, 1.5s debounced auto-save, word count
- `components/TagManager.jsx` — inline tag selector with create-on-Enter
- `components/ExportMenu.jsx` — triggers file downloads via Blob from API binary responses

**Backend** (`backend/`):
- `server.js` — Express on port 3001; mounts `/api/notes`, `/api/folders`, `/api/tags`
- `db.js` — initializes SQLite (WAL mode), creates schema, seeds data on first run; exports singleton `db`
- `routes/notes.js` — GET supports `?folder_id`, `?tag_id`, `?search` query params; export endpoint at `GET /api/notes/:id/export?format=xml|html`

**Database schema:**
```
folders (id, name, color, created_at)
tags    (id, name, color, created_at)
notes   (id, title, content[HTML], folder_id→folders, created_at, updated_at)
note_tags (note_id, tag_id)   ← junction table
```

**PWA:** `vite-plugin-pwa` generates `dist/sw.js` (Workbox) and precaches assets. Manifest at `frontend/public/manifest.json`.

**Styling:** All CSS custom properties defined in `src/index.css` (e.g. `--accent-primary: #6c63ff`). TipTap editor styled under `.tiptap` class. Glassmorphism via `.glass` utility class.

## Key Conventions

- ES modules throughout (`import`/`export`) — both backend and frontend use `"type": "module"`
- Icons: `lucide-react` only
- Store mutations go through Zustand actions in `appStore.js`; hooks call the API then update the store
- The SQLite `.db` file is written to `backend/` at runtime (gitignored)
- `content` field stores raw TipTap HTML; export routes render it into standalone XML/HTML documents
