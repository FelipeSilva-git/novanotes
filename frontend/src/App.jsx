import { useEffect, useCallback } from 'react';
import useAppStore from './store/appStore.js';
import { useNotes } from './hooks/useNotes.js';
import { useFolders } from './hooks/useFolders.js';
import { useTags } from './hooks/useTags.js';
import { createNote } from './api/client.js';

import Sidebar from './components/Sidebar.jsx';
import NoteList from './components/NoteList.jsx';
import NoteEditor from './components/NoteEditor.jsx';

export default function App() {
  const selectNote = useAppStore((s) => s.selectNote);
  const addNote = useAppStore((s) => s.addNote);
  const removeNote = useAppStore((s) => s.removeNote);
  const selectedFolderId = useAppStore((s) => s.selectedFolderId);
  const tags = useAppStore((s) => s.tags);

  const { notes, loading: notesLoading, refetch: refetchNotes } = useNotes();
  const {
    folders,
    createFolder,
    deleteFolder,
  } = useFolders();
  const {
    createTag,
    deleteTag,
    refetch: refetchTags,
  } = useTags();

  // Keyboard shortcut: Ctrl+N = new note
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        handleCreateNote();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFolderId]);

  const handleCreateNote = useCallback(async () => {
    try {
      const note = await createNote({
        title: 'Untitled Note',
        content: '',
        folder_id: selectedFolderId || null,
        tag_ids: [],
      });
      addNote(note);
      selectNote(note.id);
    } catch (err) {
      console.error('Failed to create note:', err);
    }
  }, [selectedFolderId, addNote, selectNote]);

  const handleNoteUpdated = useCallback(
    (updatedNote) => {
      // Notes list is kept in sync via store; refetch for accurate tag counts
      // Only refetch if tags may have changed (lightweight)
      refetchNotes();
    },
    [refetchNotes]
  );

  const handleNoteDeleted = useCallback(
    (noteId) => {
      removeNote(noteId);
      selectNote(null);
    },
    [removeNote, selectNote]
  );

  const handleCreateFolder = useCallback(
    async (data) => {
      await createFolder(data);
    },
    [createFolder]
  );

  const handleDeleteFolder = useCallback(
    async (id) => {
      if (!window.confirm('Delete this folder? Notes inside will be moved to "No folder".')) return;
      await deleteFolder(id);
      refetchNotes();
    },
    [deleteFolder, refetchNotes]
  );

  const handleCreateTag = useCallback(
    async (data) => {
      const tag = await createTag(data);
      await refetchTags();
      return tag;
    },
    [createTag, refetchTags]
  );

  const handleDeleteTag = useCallback(
    async (id) => {
      if (!window.confirm('Delete this tag? It will be removed from all notes.')) return;
      await deleteTag(id);
      refetchNotes();
    },
    [deleteTag, refetchNotes]
  );

  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        width: '100vw',
        overflow: 'hidden',
        background: 'var(--bg-primary)',
      }}
    >
      <Sidebar
        onCreateFolder={handleCreateFolder}
        onDeleteFolder={handleDeleteFolder}
        onCreateTag={handleCreateTag}
        onDeleteTag={handleDeleteTag}
      />

      <NoteList
        onCreateNote={handleCreateNote}
        loading={notesLoading}
      />

      <NoteEditor
        onNoteUpdated={handleNoteUpdated}
        onNoteDeleted={handleNoteDeleted}
        onCreateTag={handleCreateTag}
        allTags={tags}
      />
    </div>
  );
}
