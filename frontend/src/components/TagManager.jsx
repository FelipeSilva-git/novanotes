import { useState, useRef, useEffect } from 'react';
import { X, Plus, Tag } from 'lucide-react';

export default function TagManager({ selectedTags = [], allTags = [], onChange, onCreateTag }) {
  const [inputValue, setInputValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  const filteredTags = allTags.filter(
    (t) =>
      !selectedTags.some((s) => s.id === t.id) &&
      t.name.toLowerCase().includes(inputValue.toLowerCase())
  );

  const exactMatch = allTags.find(
    (t) => t.name.toLowerCase() === inputValue.toLowerCase().trim()
  );

  const canCreate = inputValue.trim().length > 0 && !exactMatch;

  const handleAddTag = (tag) => {
    onChange([...selectedTags, tag]);
    setInputValue('');
    inputRef.current?.focus();
  };

  const handleRemoveTag = (tagId) => {
    onChange(selectedTags.filter((t) => t.id !== tagId));
  };

  const handleCreateTag = async () => {
    if (!canCreate || !onCreateTag) return;
    try {
      const newTag = await onCreateTag({
        name: inputValue.trim().toLowerCase(),
        color: '#' + Math.floor(Math.random() * 0x6fffff + 0x404040).toString(16).padStart(6, '0'),
      });
      if (newTag) {
        onChange([...selectedTags, newTag]);
        setInputValue('');
      }
    } catch {
      // ignore duplicate errors
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredTags.length > 0) {
        handleAddTag(filteredTags[0]);
      } else if (canCreate) {
        handleCreateTag();
      }
    }
    if (e.key === 'Escape') {
      setIsOpen(false);
      setInputValue('');
    }
    if (e.key === 'Backspace' && inputValue === '' && selectedTags.length > 0) {
      handleRemoveTag(selectedTags[selectedTags.length - 1].id);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
        setInputValue('');
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      <div
        onClick={() => { inputRef.current?.focus(); setIsOpen(true); }}
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: 5,
          minHeight: 34,
          background: 'rgba(255,255,255,0.04)',
          border: `1px solid ${isOpen ? 'var(--border-hover)' : 'var(--border)'}`,
          borderRadius: 8,
          padding: '5px 10px',
          cursor: 'text',
          transition: 'border-color 0.2s',
        }}
      >
        <Tag size={13} color="var(--text-secondary)" style={{ flexShrink: 0 }} />

        {selectedTags.map((tag) => (
          <span
            key={tag.id}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              background: `${tag.color}25`,
              border: `1px solid ${tag.color}50`,
              color: tag.color,
              borderRadius: 12,
              padding: '1px 8px 1px 6px',
              fontSize: 12,
              fontWeight: 500,
            }}
          >
            {tag.name}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); handleRemoveTag(tag.id); }}
              style={{
                background: 'none',
                color: tag.color,
                display: 'flex',
                opacity: 0.7,
                padding: 0,
                marginLeft: 1,
              }}
            >
              <X size={11} />
            </button>
          </span>
        ))}

        <input
          ref={inputRef}
          value={inputValue}
          onChange={(e) => { setInputValue(e.target.value); setIsOpen(true); }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={selectedTags.length === 0 ? 'Add tags...' : ''}
          style={{
            border: 'none',
            background: 'none',
            outline: 'none',
            color: 'var(--text-primary)',
            fontSize: 12,
            minWidth: 80,
            flex: 1,
          }}
        />
      </div>

      {/* Dropdown */}
      {isOpen && (filteredTags.length > 0 || canCreate) && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 10,
            overflow: 'hidden',
            zIndex: 50,
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            animation: 'fadeIn 0.15s ease',
          }}
        >
          {filteredTags.slice(0, 8).map((tag) => (
            <button
              key={tag.id}
              type="button"
              onClick={() => handleAddTag(tag)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 12px',
                background: 'none',
                color: 'var(--text-primary)',
                fontSize: 13,
                textAlign: 'left',
                transition: 'background 0.1s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(108,99,255,0.12)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
            >
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  background: tag.color,
                  flexShrink: 0,
                  boxShadow: `0 0 6px ${tag.color}80`,
                }}
              />
              {tag.name}
              <span style={{ fontSize: 10, color: 'var(--text-secondary)', marginLeft: 'auto' }}>
                {tag.note_count} notes
              </span>
            </button>
          ))}
          {canCreate && (
            <button
              type="button"
              onClick={handleCreateTag}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 12px',
                background: 'rgba(108,99,255,0.06)',
                color: 'var(--accent-primary)',
                fontSize: 13,
                textAlign: 'left',
                borderTop: filteredTags.length > 0 ? '1px solid var(--border)' : 'none',
                transition: 'background 0.1s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(108,99,255,0.14)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(108,99,255,0.06)')}
            >
              <Plus size={14} />
              Create tag "{inputValue.trim()}"
            </button>
          )}
        </div>
      )}
    </div>
  );
}
