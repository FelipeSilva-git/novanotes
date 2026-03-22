import { useState, useEffect, useCallback } from 'react';
import {
  getTags,
  createTag as apiCreateTag,
  updateTag as apiUpdateTag,
  deleteTag as apiDeleteTag,
} from '../api/client.js';
import useAppStore from '../store/appStore.js';

export function useTags() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const setTags = useAppStore((s) => s.setTags);
  const addTag = useAppStore((s) => s.addTag);
  const updateTagStore = useAppStore((s) => s.updateTag);
  const removeTagStore = useAppStore((s) => s.removeTag);
  const tags = useAppStore((s) => s.tags);

  const fetchTags = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getTags();
      setTags(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [setTags]);

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  const createTag = useCallback(
    async (data) => {
      const tag = await apiCreateTag(data);
      addTag(tag);
      return tag;
    },
    [addTag]
  );

  const updateTag = useCallback(
    async (id, data) => {
      const tag = await apiUpdateTag(id, data);
      updateTagStore(tag);
      return tag;
    },
    [updateTagStore]
  );

  const deleteTag = useCallback(
    async (id) => {
      await apiDeleteTag(id);
      removeTagStore(id);
    },
    [removeTagStore]
  );

  return {
    tags,
    loading,
    error,
    createTag,
    updateTag,
    deleteTag,
    refetch: fetchTags,
  };
}
