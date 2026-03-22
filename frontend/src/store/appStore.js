import { create } from 'zustand';

const useAppStore = create((set) => ({
  // ── Auth ───────────────────────────────────────────────────
  user: JSON.parse(localStorage.getItem('novanotes_user') || 'null'),
  token: localStorage.getItem('novanotes_token') || null,

  setAuth: (user, token) => {
    localStorage.setItem('novanotes_token', token);
    localStorage.setItem('novanotes_user', JSON.stringify(user));
    set({ user, token });
  },
  logout: () => {
    localStorage.removeItem('novanotes_token');
    localStorage.removeItem('novanotes_user');
    set({
      user: null,
      token: null,
      notes: [],
      folders: [],
      tags: [],
      selectedNoteId: null,
      selectedFolderId: null,
      selectedTagId: null,
      searchQuery: '',
    });
  },

  // ── State ──────────────────────────────────────────────────
  notes: [],
  folders: [],
  tags: [],
  selectedNoteId: null,
  selectedFolderId: null,
  selectedTagId: null,
  searchQuery: '',
  isEditing: false,
  sidebarWidth: 260,

  // ── Filter / selection actions ─────────────────────────────
  selectNote: (id) => set({ selectedNoteId: id, isEditing: id !== null }),
  selectFolder: (id) => set({ selectedFolderId: id, selectedTagId: null, selectedNoteId: null }),
  selectTag: (id) => set({ selectedTagId: id, selectedFolderId: null, selectedNoteId: null }),
  setSearch: (q) => set({ searchQuery: q }),
  setEditing: (val) => set({ isEditing: val }),
  setSidebarWidth: (w) => set({ sidebarWidth: w }),

  // ── Bulk setters ───────────────────────────────────────────
  setNotes: (notes) => set({ notes }),
  setFolders: (folders) => set({ folders }),
  setTags: (tags) => set({ tags }),

  // ── Notes CRUD ─────────────────────────────────────────────
  addNote: (note) => set((state) => ({ notes: [note, ...state.notes] })),
  updateNote: (updatedNote) =>
    set((state) => ({ notes: state.notes.map((n) => (n.id === updatedNote.id ? updatedNote : n)) })),
  removeNote: (id) =>
    set((state) => ({
      notes: state.notes.filter((n) => n.id !== id),
      selectedNoteId: state.selectedNoteId === id ? null : state.selectedNoteId,
    })),

  // ── Folders CRUD ───────────────────────────────────────────
  addFolder: (folder) => set((state) => ({ folders: [...state.folders, folder] })),
  updateFolder: (updatedFolder) =>
    set((state) => ({ folders: state.folders.map((f) => (f.id === updatedFolder.id ? updatedFolder : f)) })),
  removeFolder: (id) =>
    set((state) => ({
      folders: state.folders.filter((f) => f.id !== id),
      selectedFolderId: state.selectedFolderId === id ? null : state.selectedFolderId,
    })),

  // ── Tags CRUD ──────────────────────────────────────────────
  addTag: (tag) => set((state) => ({ tags: [...state.tags, tag] })),
  updateTag: (updatedTag) =>
    set((state) => ({ tags: state.tags.map((t) => (t.id === updatedTag.id ? updatedTag : t)) })),
  removeTag: (id) =>
    set((state) => ({
      tags: state.tags.filter((t) => t.id !== id),
      selectedTagId: state.selectedTagId === id ? null : state.selectedTagId,
    })),
}));

export default useAppStore;
