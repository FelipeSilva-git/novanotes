import { useState, useEffect, useCallback, useRef } from 'react';
import { getNotes } from '../api/client.js';
import useAppStore from '../store/appStore.js';

export function useNotes() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const selectedFolderId = useAppStore((s) => s.selectedFolderId);
  const selectedTagId = useAppStore((s) => s.selectedTagId);
  const searchQuery = useAppStore((s) => s.searchQuery);
  const setNotes = useAppStore((s) => s.setNotes);
  const notes = useAppStore((s) => s.notes);

  // Debounce search
  const searchTimer = useRef(null);
  const lastSearch = useRef('');

  const fetchNotes = useCallback(
    async (params = {}) => {
      setLoading(true);
      setError(null);
      try {
        const result = await getNotes({
          folder_id: selectedFolderId,
          tag_id: selectedTagId,
          search: searchQuery,
          ...params,
        });
        setNotes(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    [selectedFolderId, selectedTagId, searchQuery, setNotes]
  );

  // Re-fetch when filters change (debounce search)
  useEffect(() => {
    if (searchQuery !== lastSearch.current) {
      lastSearch.current = searchQuery;
      clearTimeout(searchTimer.current);
      searchTimer.current = setTimeout(() => fetchNotes(), 300);
    } else {
      fetchNotes();
    }
    return () => clearTimeout(searchTimer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFolderId, selectedTagId, searchQuery]);

  return {
    notes,
    loading,
    error,
    refetch: fetchNotes,
  };
}
