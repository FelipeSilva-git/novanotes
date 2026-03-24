import { Plus, FileText, Tag } from 'lucide-react';
import useAppStore from '../store/appStore.js';

function stripHtml(html) {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now - date;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } else if (diffDays === 1) {
    return 'Ontem';
  } else if (diffDays < 7) {
    return date.toLocaleDateString([], { weekday: 'short' });
  } else {
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }
}

export default function NoteList({ onCreateNote, loading }) {
  const notes = useAppStore((s) => s.notes);
  const selectedNoteId = useAppStore((s) => s.selectedNoteId);
  const selectedFolderId = useAppStore((s) => s.selectedFolderId);
  const selectedTagId = useAppStore((s) => s.selectedTagId);
  const searchQuery = useAppStore((s) => s.searchQuery);
  const selectNote = useAppStore((s) => s.selectNote);
  const folders = useAppStore((s) => s.folders);
  const tags = useAppStore((s) => s.tags);

  // Determine panel title
  let panelTitle = 'Todas as Notas';
  if (selectedFolderId) {
    const folder = folders.find((f) => f.id === selectedFolderId);
    panelTitle = folder ? folder.name : 'Pasta';
  } else if (selectedTagId) {
    const tag = tags.find((t) => t.id === selectedTagId);
    panelTitle = tag ? `#${tag.name}` : 'Tag';
  } else if (searchQuery) {
    panelTitle = `Resultados para "${searchQuery}"`;
  }

  return (
    <div
      style={{
        width: 320,
        minWidth: 240,
        height: '100%',
        background: 'var(--bg-tertiary)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '16px 16px 12px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
        }}
      >
        <div>
          <h2
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: 'var(--text-primary)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              maxWidth: 180,
            }}
          >
            {panelTitle}
          </h2>
          <p style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 1 }}>
            {loading ? 'Carregando...' : `${notes.length} nota${notes.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <button
          onClick={onCreateNote}
          title="Nova Nota (Ctrl+N)"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            padding: '7px 12px',
            borderRadius: 8,
            background: 'linear-gradient(135deg, rgba(108,99,255,0.3), rgba(0,212,255,0.2))',
            border: '1px solid rgba(108,99,255,0.4)',
            color: 'var(--accent-primary)',
            fontSize: 12,
            fontWeight: 600,
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(108,99,255,0.5), rgba(0,212,255,0.3))';
            e.currentTarget.style.boxShadow = '0 0 12px var(--accent-glow)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(108,99,255,0.3), rgba(0,212,255,0.2))';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <Plus size={14} />
          Nova
        </button>
      </div>

      {/* Note list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
        {loading && notes.length === 0 && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: 200,
              gap: 12,
              color: 'var(--text-secondary)',
            }}
          >
            <div
              style={{
                width: 24,
                height: 24,
                border: '2px solid rgba(108,99,255,0.3)',
                borderTopColor: 'var(--accent-primary)',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
              }}
            />
            Carregando notas...
          </div>
        )}

        {!loading && notes.length === 0 && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: 240,
              gap: 14,
              color: 'var(--text-secondary)',
              padding: 24,
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 16,
                background: 'rgba(108,99,255,0.1)',
                border: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <FileText size={24} color="var(--accent-primary)" />
            </div>
            <div>
              <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
                Nenhuma nota aqui
              </p>
              <p style={{ fontSize: 12 }}>
                {searchQuery
                  ? 'Tente um termo de busca diferente'
                  : 'Clique em "Nova" para criar sua primeira nota'}
              </p>
            </div>
          </div>
        )}

        {notes.map((note) => {
          const isActive = note.id === selectedNoteId;
          const preview = stripHtml(note.content);

          return (
            <button
              key={note.id}
              onClick={() => selectNote(note.id)}
              style={{
                width: '100%',
                display: 'block',
                textAlign: 'left',
                padding: '12px 14px',
                borderRadius: 10,
                marginBottom: 4,
                background: isActive
                  ? 'rgba(108,99,255,0.18)'
                  : 'rgba(255,255,255,0.025)',
                border: `1px solid ${isActive ? 'rgba(108,99,255,0.45)' : 'rgba(108,99,255,0.08)'}`,
                boxShadow: isActive ? '0 0 14px rgba(108,99,255,0.2)' : 'none',
                transition: 'all 0.15s',
                cursor: 'pointer',
                animation: 'fadeIn 0.2s ease',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                  e.currentTarget.style.borderColor = 'rgba(108,99,255,0.2)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.025)';
                  e.currentTarget.style.borderColor = 'rgba(108,99,255,0.08)';
                }
              }}
            >
              {/* Title row */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: isActive ? 'var(--accent-primary)' : 'var(--text-primary)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    flex: 1,
                    paddingRight: 8,
                  }}
                >
                  {note.title || 'Nota sem título'}
                </span>
                <span style={{ fontSize: 10, color: 'var(--text-secondary)', flexShrink: 0 }}>
                  {formatDate(note.updated_at)}
                </span>
              </div>

              {/* Preview */}
              {preview && (
                <p
                  style={{
                    fontSize: 12,
                    color: 'var(--text-secondary)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    marginBottom: 6,
                    lineHeight: 1.5,
                  }}
                >
                  {preview}
                </p>
              )}

              {/* Folder + tags row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                {note.folder_name && (
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      fontSize: 11,
                      color: note.folder_color || 'var(--accent-primary)',
                      background: `${note.folder_color || '#6c63ff'}18`,
                      padding: '1px 7px',
                      borderRadius: 10,
                      border: `1px solid ${note.folder_color || '#6c63ff'}30`,
                    }}
                  >
                    <span
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        background: note.folder_color,
                        flexShrink: 0,
                      }}
                    />
                    {note.folder_name}
                  </span>
                )}
                {note.tags &&
                  note.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag.id}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 3,
                        fontSize: 11,
                        color: tag.color,
                        background: `${tag.color}18`,
                        padding: '1px 7px',
                        borderRadius: 10,
                        border: `1px solid ${tag.color}30`,
                      }}
                    >
                      <Tag size={9} />
                      {tag.name}
                    </span>
                  ))}
                {note.tags && note.tags.length > 3 && (
                  <span style={{ fontSize: 10, color: 'var(--text-secondary)' }}>
                    +{note.tags.length - 3}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
