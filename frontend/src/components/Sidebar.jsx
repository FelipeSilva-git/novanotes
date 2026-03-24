import { useState } from 'react';
import {
  FileText,
  Folder,
  Tag,
  Plus,
  Search,
  Settings,
  ChevronDown,
  ChevronRight,
  Trash2,
  Check,
  X,
  LogOut,
  User,
  Sun,
  Moon,
} from 'lucide-react';
import useAppStore from '../store/appStore.js';

const TAG_COLORS = [
  '#6c63ff', '#00d4ff', '#ff6b6b', '#ffd93d',
  '#6bcb77', '#ff9f43', '#a29bfe', '#fd79a8',
];

function ColorDot({ color, size = 10 }) {
  return (
    <span
      style={{
        display: 'inline-block',
        width: size,
        height: size,
        borderRadius: '50%',
        background: color,
        flexShrink: 0,
        boxShadow: `0 0 6px ${color}80`,
      }}
    />
  );
}

function InlineCreateForm({ placeholder, onConfirm, onCancel, colorOptions = TAG_COLORS }) {
  const [name, setName] = useState('');
  const [color, setColor] = useState(colorOptions[0]);
  const [showColors, setShowColors] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onConfirm({ name: name.trim(), color });
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        padding: '8px 10px',
        background: 'rgba(108,99,255,0.08)',
        borderRadius: 8,
        border: '1px solid rgba(108,99,255,0.25)',
        margin: '4px 0',
        animation: 'fadeIn 0.2s ease',
      }}
    >
      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <button
          type="button"
          onClick={() => setShowColors((v) => !v)}
          style={{
            background: 'none',
            padding: 2,
            borderRadius: 4,
            flexShrink: 0,
          }}
        >
          <ColorDot color={color} size={12} />
        </button>
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={placeholder}
          style={{
            flex: 1,
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(108,99,255,0.25)',
            borderRadius: 6,
            padding: '4px 8px',
            color: 'var(--text-primary)',
            fontSize: 13,
          }}
        />
        <button
          type="submit"
          style={{
            background: 'rgba(108,99,255,0.3)',
            color: 'var(--accent-primary)',
            borderRadius: 6,
            padding: '4px 6px',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Check size={13} />
        </button>
        <button
          type="button"
          onClick={onCancel}
          style={{
            background: 'rgba(255,77,109,0.15)',
            color: 'var(--danger)',
            borderRadius: 6,
            padding: '4px 6px',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <X size={13} />
        </button>
      </div>
      {showColors && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', paddingLeft: 4 }}>
          {colorOptions.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => { setColor(c); setShowColors(false); }}
              style={{
                background: 'none',
                padding: 2,
                borderRadius: '50%',
                border: c === color ? '2px solid white' : '2px solid transparent',
              }}
            >
              <ColorDot color={c} size={14} />
            </button>
          ))}
        </div>
      )}
    </form>
  );
}

export default function Sidebar({ onCreateFolder, onDeleteFolder, onCreateTag, onDeleteTag, onOpenSettings }) {
  const user = useAppStore((s) => s.user);
  const logout = useAppStore((s) => s.logout);
  const theme = useAppStore((s) => s.theme);
  const setTheme = useAppStore((s) => s.setTheme);
  const selectedNoteId = useAppStore((s) => s.selectedNoteId);
  const selectedFolderId = useAppStore((s) => s.selectedFolderId);
  const selectedTagId = useAppStore((s) => s.selectedTagId);
  const searchQuery = useAppStore((s) => s.searchQuery);
  const folders = useAppStore((s) => s.folders);
  const tags = useAppStore((s) => s.tags);
  const notes = useAppStore((s) => s.notes);
  const selectFolder = useAppStore((s) => s.selectFolder);
  const selectTag = useAppStore((s) => s.selectTag);
  const setSearch = useAppStore((s) => s.setSearch);
  const selectNote = useAppStore((s) => s.selectNote);

  const [foldersOpen, setFoldersOpen] = useState(true);
  const [tagsOpen, setTagsOpen] = useState(true);
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [showCreateTag, setShowCreateTag] = useState(false);

  const handleAllNotes = () => {
    selectFolder(null);
    selectTag(null);
    selectNote(null);
  };

  const handleCreateFolder = async (data) => {
    await onCreateFolder(data);
    setShowCreateFolder(false);
  };

  const handleCreateTag = async (data) => {
    await onCreateTag(data);
    setShowCreateTag(false);
  };

  return (
    <aside
      style={{
        width: 260,
        minWidth: 200,
        maxWidth: 320,
        height: '100%',
        background: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        userSelect: 'none',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background grid pattern */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'linear-gradient(rgba(108,99,255,0.04) 1px, transparent 1px),' +
            'linear-gradient(90deg, rgba(108,99,255,0.04) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Logo */}
        <div
          style={{
            padding: '20px 18px 14px',
            borderBottom: '1px solid var(--border)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: 'linear-gradient(135deg, #6c63ff, #00d4ff)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 16px rgba(108,99,255,0.5)',
                flexShrink: 0,
              }}
            >
              <FileText size={16} color="#fff" />
            </div>
            <span
              style={{
                fontSize: 18,
                fontWeight: 700,
                background: 'linear-gradient(135deg, #6c63ff, #00d4ff)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                letterSpacing: '-0.3px',
              }}
              className="glow-text"
            >
              NovaNotes
            </span>
          </div>

          {/* Search */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              padding: '7px 10px',
              transition: 'border-color 0.2s',
            }}
            onFocus={(e) => e.currentTarget.style.borderColor = 'var(--border-hover)'}
            onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
          >
            <Search size={14} color="var(--text-secondary)" />
            <input
              type="text"
              placeholder="Buscar notas..."
              value={searchQuery}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                flex: 1,
                fontSize: 13,
                color: 'var(--text-primary)',
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearch('')}
                style={{ background: 'none', color: 'var(--text-secondary)', display: 'flex' }}
              >
                <X size={13} />
              </button>
            )}
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, overflowY: 'auto', padding: '10px 10px' }}>
          {/* All Notes */}
          <button
            onClick={handleAllNotes}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: 9,
              padding: '8px 10px',
              borderRadius: 8,
              background:
                !selectedFolderId && !selectedTagId
                  ? 'rgba(108,99,255,0.18)'
                  : 'transparent',
              color:
                !selectedFolderId && !selectedTagId
                  ? 'var(--accent-primary)'
                  : 'var(--text-secondary)',
              transition: 'background 0.15s, color 0.15s',
              fontSize: 13,
              fontWeight: 500,
              marginBottom: 4,
              textAlign: 'left',
            }}
          >
            <FileText size={15} />
            Todas as Notas
            <span
              style={{
                marginLeft: 'auto',
                fontSize: 11,
                background: 'rgba(108,99,255,0.25)',
                color: 'var(--accent-primary)',
                borderRadius: 10,
                padding: '1px 7px',
              }}
            >
              {notes.length}
            </span>
          </button>

          {/* Folders section */}
          <div style={{ marginTop: 8 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '4px 8px',
                marginBottom: 2,
                borderRadius: 6,
              }}
            >
              <button
                onClick={() => setFoldersOpen((v) => !v)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  background: 'none',
                  color: 'var(--text-secondary)',
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  flex: 1,
                  textAlign: 'left',
                }}
              >
                {foldersOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                Pastas
              </button>
              <button
                onClick={() => setShowCreateFolder(true)}
                title="Nova pasta"
                style={{
                  background: 'none',
                  color: 'var(--text-secondary)',
                  display: 'flex',
                  borderRadius: 4,
                  padding: 2,
                  transition: 'color 0.15s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent-primary)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
              >
                <Plus size={14} />
              </button>
            </div>

            {foldersOpen && (
              <div style={{ paddingLeft: 4 }}>
                {showCreateFolder && (
                  <InlineCreateForm
                    placeholder="Nome da pasta..."
                    onConfirm={handleCreateFolder}
                    onCancel={() => setShowCreateFolder(false)}
                  />
                )}
                {folders.map((folder) => (
                  <div
                    key={folder.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      borderRadius: 8,
                      background:
                        selectedFolderId === folder.id
                          ? 'rgba(108,99,255,0.15)'
                          : 'transparent',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={(e) => {
                      if (selectedFolderId !== folder.id)
                        e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                    }}
                    onMouseLeave={(e) => {
                      if (selectedFolderId !== folder.id)
                        e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <button
                      onClick={() => selectFolder(folder.id)}
                      style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '7px 10px',
                        background: 'none',
                        color:
                          selectedFolderId === folder.id
                            ? 'var(--text-primary)'
                            : 'var(--text-secondary)',
                        fontSize: 13,
                        textAlign: 'left',
                      }}
                    >
                      <ColorDot color={folder.color} />
                      <Folder size={14} />
                      <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {folder.name}
                      </span>
                      <span style={{ fontSize: 11, color: 'var(--text-secondary)', marginLeft: 'auto' }}>
                        {folder.note_count}
                      </span>
                    </button>
                    <button
                      onClick={() => onDeleteFolder(folder.id)}
                      title="Excluir pasta"
                      style={{
                        background: 'none',
                        color: 'transparent',
                        padding: '7px 8px',
                        display: 'flex',
                        transition: 'color 0.15s',
                        borderRadius: 6,
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--danger)')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = 'transparent')}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
                {folders.length === 0 && !showCreateFolder && (
                  <p style={{ fontSize: 12, color: 'var(--text-secondary)', padding: '4px 10px', fontStyle: 'italic' }}>
                    Nenhuma pasta ainda
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Tags section */}
          <div style={{ marginTop: 12 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '4px 8px',
                marginBottom: 2,
              }}
            >
              <button
                onClick={() => setTagsOpen((v) => !v)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  background: 'none',
                  color: 'var(--text-secondary)',
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  flex: 1,
                  textAlign: 'left',
                }}
              >
                {tagsOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                Tags
              </button>
              <button
                onClick={() => setShowCreateTag(true)}
                title="Nova tag"
                style={{
                  background: 'none',
                  color: 'var(--text-secondary)',
                  display: 'flex',
                  borderRadius: 4,
                  padding: 2,
                  transition: 'color 0.15s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent-primary)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
              >
                <Plus size={14} />
              </button>
            </div>

            {tagsOpen && (
              <div style={{ paddingLeft: 4 }}>
                {showCreateTag && (
                  <InlineCreateForm
                    placeholder="Nome da tag..."
                    onConfirm={handleCreateTag}
                    onCancel={() => setShowCreateTag(false)}
                  />
                )}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, padding: '4px 6px' }}>
                  {tags.map((tag) => (
                    <button
                      key={tag.id}
                      onClick={() => selectTag(selectedTagId === tag.id ? null : tag.id)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 5,
                        padding: '3px 10px 3px 8px',
                        borderRadius: 20,
                        background:
                          selectedTagId === tag.id
                            ? tag.color + '40'
                            : 'rgba(255,255,255,0.06)',
                        border: `1px solid ${selectedTagId === tag.id ? tag.color : 'transparent'}`,
                        color:
                          selectedTagId === tag.id ? tag.color : 'var(--text-secondary)',
                        fontSize: 12,
                        fontWeight: 500,
                        transition: 'all 0.15s',
                        cursor: 'pointer',
                      }}
                    >
                      <Tag size={11} />
                      {tag.name}
                      <span style={{ fontSize: 10, opacity: 0.7 }}>{tag.note_count}</span>
                    </button>
                  ))}
                  {tags.length === 0 && !showCreateTag && (
                    <p style={{ fontSize: 12, color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                      Nenhuma tag ainda
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </nav>

        {/* Bottom: user + actions */}
        <div
          style={{
            padding: '12px 14px',
            borderTop: '1px solid var(--border)',
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
          }}
        >
          {/* User info */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 8px',
              borderRadius: 8,
              background: 'rgba(108,99,255,0.08)',
              border: '1px solid rgba(108,99,255,0.15)',
            }}
          >
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #6c63ff, #00d4ff)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <User size={13} color="#fff" />
            </div>
            <span
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: 'var(--text-primary)',
                flex: 1,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {user?.username}
            </span>
          </div>

          {/* Settings + Logout row */}
          <div style={{ display: 'flex', gap: 4 }}>
            <button
              onClick={onOpenSettings}
              title="Configurações"
              style={{
                flex: 1,
                background: 'none',
                color: 'var(--text-secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                borderRadius: 8,
                padding: '7px 8px',
                fontSize: 12,
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--text-primary)';
                e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--text-secondary)';
                e.currentTarget.style.background = 'none';
              }}
            >
              <Settings size={14} />
              Ajustes
            </button>
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              title={theme === 'dark' ? 'Tema claro' : 'Tema escuro'}
              style={{
                background: 'none',
                color: 'var(--text-secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 8,
                padding: '7px 8px',
                fontSize: 12,
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--text-primary)';
                e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--text-secondary)';
                e.currentTarget.style.background = 'none';
              }}
            >
              {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
            </button>
            <button
              onClick={() => { if (window.confirm('Sair da sua conta?')) logout(); }}
              title="Sair"
              style={{
                flex: 1,
                background: 'none',
                color: 'var(--text-secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                borderRadius: 8,
                padding: '7px 8px',
                fontSize: 12,
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#ff6b6b';
                e.currentTarget.style.background = 'rgba(255,107,107,0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--text-secondary)';
                e.currentTarget.style.background = 'none';
              }}
            >
              <LogOut size={14} />
              Sair
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
