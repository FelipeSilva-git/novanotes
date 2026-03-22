import { useState, useEffect, useCallback } from 'react';
import {
  getFolders,
  createFolder as apiCreateFolder,
  updateFolder as apiUpdateFolder,
  deleteFolder as apiDeleteFolder,
} from '../api/client.js';
import useAppStore from '../store/appStore.js';

export function useFolders() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const setFolders = useAppStore((s) => s.setFolders);
  const addFolder = useAppStore((s) => s.addFolder);
  const updateFolderStore = useAppStore((s) => s.updateFolder);
  const removeFolderStore = useAppStore((s) => s.removeFolder);
  const folders = useAppStore((s) => s.folders);

  const fetchFolders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getFolders();
      setFolders(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [setFolders]);

  useEffect(() => {
    fetchFolders();
  }, [fetchFolders]);

  const createFolder = useCallback(
    async (data) => {
      const folder = await apiCreateFolder(data);
      addFolder(folder);
      return folder;
    },
    [addFolder]
  );

  const updateFolder = useCallback(
    async (id, data) => {
      const folder = await apiUpdateFolder(id, data);
      updateFolderStore(folder);
      return folder;
    },
    [updateFolderStore]
  );

  const deleteFolder = useCallback(
    async (id) => {
      await apiDeleteFolder(id);
      removeFolderStore(id);
    },
    [removeFolderStore]
  );

  return {
    folders,
    loading,
    error,
    createFolder,
    updateFolder,
    deleteFolder,
    refetch: fetchFolders,
  };
}
