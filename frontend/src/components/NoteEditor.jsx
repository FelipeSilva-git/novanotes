import { useState, useEffect, useRef, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import Highlight from '@tiptap/extension-highlight';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';

import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  CheckSquare,
  Quote,
  Code,
  Link as LinkIcon,
  Highlighter,
  Undo,
  Redo,
  Trash2,
  Download,
  Save,
  FileText,
  ChevronDown,
} from 'lucide-react';

import useAppStore from '../store/appStore.js';
import { getNote, updateNote, deleteNote } from '../api/client.js';
import TagManager from './TagManager.jsx';
import ExportMenu from './ExportMenu.jsx';

function ToolbarButton({ onClick, isActive, title, children, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`toolbar-btn${isActive ? ' is-active' : ''}`}
      style={{ opacity: disabled ? 0.4 : 1 }}
    >
      {children}
    </button>
  );
}

function wordCount(html) {
  if (!html) return 0;
  const text = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  if (!text) return 0;
  return text.split(' ').length;
}

export default function NoteEditor({ onNoteUpdated, onNoteDeleted, onCreateTag, allTags }) {
  const selectedNoteId = useAppStore((s) => s.selectedNoteId);
  const folders = useAppStore((s) => s.folders);
  const updateNoteStore = useAppStore((s) => s.updateNote);

  const [note, setNote] = useState(null);
  const [title, setTitle] = useState('');
  const [folderId, setFolderId] = useState(null);
  const [selectedTags, setSelectedTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(''); // '', 'saved', 'saving'
  const [showExport, setShowExport] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');

  const autoSaveTimer = useRef(null);
  const exportRef = useRef(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  // TipTap editor
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: { HTMLAttributes: { class: 'code-block' } },
      }),
      Underline,
      Link.configure({ openOnClick: false, autolink: true }),
      Image,
      Placeholder.configure({ placeholder: 'Comece a escrever sua nota...' }),
      Highlight.configure({ multicolor: true }),
      TextStyle,
      Color,
      TaskList,
      TaskItem.configure({ nested: true }),
    ],
    content: '',
    onUpdate: ({ editor }) => {
      scheduleSave(editor.getHTML());
    },
  });

  // Load note when selection changes
  useEffect(() => {
    if (!selectedNoteId) {
      setNote(null);
      setTitle('');
      setFolderId(null);
      setSelectedTags([]);
      editor?.commands.setContent('', false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    getNote(selectedNoteId)
      .then((data) => {
        if (cancelled || !editor) return;
        setNote(data);
        setTitle(data.title || '');
        setFolderId(data.folder_id || null);
        setSelectedTags(data.tags || []);
        // Use setTimeout to avoid DOM conflicts with React render cycle
        setTimeout(() => {
          if (!cancelled && editor && !editor.isDestroyed) {
            editor.commands.setContent(data.content || '', false);
          }
        }, 0);
        setSaveStatus('');
      })
      .catch(console.error)
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedNoteId]);

  const doSave = useCallback(
    async (overrideContent) => {
      if (!note || !isMounted.current) return;
      const content = overrideContent ?? editor?.getHTML() ?? '';
      setSaveStatus('saving');
      setSaving(true);
      try {
        const updated = await updateNote(note.id, {
          title,
          content,
          folder_id: folderId,
          tag_ids: selectedTags.map((t) => t.id),
        });
        if (!isMounted.current) return;
        setNote(updated);
        updateNoteStore(updated);
        setSaveStatus('saved');
        if (onNoteUpdated) onNoteUpdated(updated);
        setTimeout(() => {
          if (isMounted.current) setSaveStatus('');
        }, 2000);
      } catch (err) {
        console.error('Save failed:', err);
        setSaveStatus('');
      } finally {
        if (isMounted.current) setSaving(false);
      }
    },
    [note, title, folderId, selectedTags, editor, updateNoteStore, onNoteUpdated]
  );

  const scheduleSave = useCallback(
    (content) => {
      clearTimeout(autoSaveTimer.current);
      setSaveStatus('');
      autoSaveTimer.current = setTimeout(() => {
        doSave(content);
      }, 1500);
    },
    [doSave]
  );

  // Save on title/folder/tag change
  useEffect(() => {
    if (!note) return;
    clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => doSave(), 1500);
    return () => clearTimeout(autoSaveTimer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, folderId, selectedTags]);

  const handleDelete = async () => {
    if (!note) return;
    try {
      await deleteNote(note.id);
      if (onNoteDeleted) onNoteDeleted(note.id);
    } catch (err) {
      console.error('Delete failed:', err);
    }
    setShowDeleteConfirm(false);
  };

  const handleSetLink = () => {
    if (!linkUrl.trim()) {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
    } else {
      editor.chain().focus().extendMarkRange('link').setLink({ href: linkUrl }).run();
    }
    setShowLinkDialog(false);
    setLinkUrl('');
  };

  if (!selectedNoteId) {
    return (
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 20,
          background: 'var(--bg-primary)',
          color: 'var(--text-secondary)',
        }}
      >
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: 20,
            background: 'rgba(108,99,255,0.08)',
            border: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <FileText size={32} color="var(--accent-primary)" style={{ opacity: 0.6 }} />
        </div>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>
            Nenhuma nota selecionada
          </p>
          <p style={{ fontSize: 13 }}>
            Selecione uma nota da lista ou pressione{' '}
            <kbd
              style={{
                background: 'rgba(108,99,255,0.15)',
                border: '1px solid var(--border)',
                borderRadius: 4,
                padding: '1px 6px',
                fontSize: 12,
                color: 'var(--accent-primary)',
              }}
            >
              Ctrl+N
            </kbd>{' '}
            para criar uma nova
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg-primary)',
          color: 'var(--text-secondary)',
          gap: 12,
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
        Carregando nota...
      </div>
    );
  }

  const words = wordCount(editor?.getHTML());

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: 'var(--bg-primary)',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* ── Header ── */}
      <div
        style={{
          padding: '14px 24px 10px',
          borderBottom: '1px solid var(--border)',
          flexShrink: 0,
        }}
      >
        {/* Title */}
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Título da nota..."
          style={{
            width: '100%',
            fontSize: 22,
            fontWeight: 700,
            color: 'var(--text-primary)',
            background: 'transparent',
            border: 'none',
            outline: 'none',
            marginBottom: 10,
            letterSpacing: '-0.3px',
          }}
        />

        {/* Meta row: folder + tags */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Folder select */}
          <div style={{ position: 'relative', minWidth: 140 }}>
            <select
              value={folderId || ''}
              onChange={(e) => setFolderId(e.target.value ? Number(e.target.value) : null)}
              style={{
                appearance: 'none',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                color: folderId
                  ? folders.find((f) => f.id === folderId)?.color || 'var(--text-primary)'
                  : 'var(--text-secondary)',
                padding: '5px 28px 5px 10px',
                fontSize: 12,
                cursor: 'pointer',
                width: '100%',
                transition: 'border-color 0.2s',
              }}
              onFocus={(e) => (e.target.style.borderColor = 'var(--border-hover)')}
              onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
            >
              <option value="">Sem pasta</option>
              {folders.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
            <ChevronDown
              size={12}
              color="var(--text-secondary)"
              style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
            />
          </div>

          {/* Tag manager */}
          <div style={{ flex: 1, minWidth: 200 }}>
            <TagManager
              selectedTags={selectedTags}
              allTags={allTags}
              onChange={setSelectedTags}
              onCreateTag={onCreateTag}
            />
          </div>
        </div>
      </div>

      {/* ── Toolbar ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          padding: '6px 16px',
          borderBottom: '1px solid var(--border)',
          flexShrink: 0,
          flexWrap: 'wrap',
          background: 'var(--bg-secondary)',
        }}
      >
        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleBold().run()}
          isActive={editor?.isActive('bold')}
          title="Negrito (Ctrl+B)"
        >
          <Bold size={14} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleItalic().run()}
          isActive={editor?.isActive('italic')}
          title="Itálico (Ctrl+I)"
        >
          <Italic size={14} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleUnderline().run()}
          isActive={editor?.isActive('underline')}
          title="Sublinhado (Ctrl+U)"
        >
          <UnderlineIcon size={14} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleStrike().run()}
          isActive={editor?.isActive('strike')}
          title="Tachado"
        >
          <Strikethrough size={14} />
        </ToolbarButton>

        <div className="toolbar-separator" />

        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
          isActive={editor?.isActive('heading', { level: 1 })}
          title="Título 1"
        >
          <Heading1 size={14} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
          isActive={editor?.isActive('heading', { level: 2 })}
          title="Título 2"
        >
          <Heading2 size={14} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
          isActive={editor?.isActive('heading', { level: 3 })}
          title="Título 3"
        >
          <Heading3 size={14} />
        </ToolbarButton>

        <div className="toolbar-separator" />

        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
          isActive={editor?.isActive('bulletList')}
          title="Lista com marcadores"
        >
          <List size={14} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
          isActive={editor?.isActive('orderedList')}
          title="Lista numerada"
        >
          <ListOrdered size={14} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleTaskList().run()}
          isActive={editor?.isActive('taskList')}
          title="Lista de tarefas"
        >
          <CheckSquare size={14} />
        </ToolbarButton>

        <div className="toolbar-separator" />

        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleBlockquote().run()}
          isActive={editor?.isActive('blockquote')}
          title="Citação"
        >
          <Quote size={14} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleCodeBlock().run()}
          isActive={editor?.isActive('codeBlock')}
          title="Bloco de código"
        >
          <Code size={14} />
        </ToolbarButton>

        <div className="toolbar-separator" />

        <ToolbarButton
          onClick={() => {
            const existing = editor?.getAttributes('link').href || '';
            setLinkUrl(existing);
            setShowLinkDialog(true);
          }}
          isActive={editor?.isActive('link')}
          title="Link"
        >
          <LinkIcon size={14} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleHighlight({ color: '#ffd93d' }).run()}
          isActive={editor?.isActive('highlight')}
          title="Destaque"
        >
          <Highlighter size={14} />
        </ToolbarButton>

        {/* Color picker */}
        <label
          title="Cor do texto"
          className="toolbar-btn"
          style={{ position: 'relative', cursor: 'pointer', overflow: 'hidden' }}
        >
          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)' }}>A</span>
          <input
            type="color"
            defaultValue="#6c63ff"
            onChange={(e) => editor?.chain().focus().setColor(e.target.value).run()}
            style={{
              position: 'absolute',
              opacity: 0,
              width: 1,
              height: 1,
              top: 0,
              left: 0,
            }}
          />
        </label>

        <div className="toolbar-separator" />

        <ToolbarButton
          onClick={() => editor?.chain().focus().undo().run()}
          disabled={!editor?.can().undo()}
          title="Desfazer (Ctrl+Z)"
        >
          <Undo size={14} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor?.chain().focus().redo().run()}
          disabled={!editor?.can().redo()}
          title="Refazer (Ctrl+Y)"
        >
          <Redo size={14} />
        </ToolbarButton>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 6, position: 'relative' }} ref={exportRef}>
          <button
            onClick={() => { clearTimeout(autoSaveTimer.current); doSave(); }}
            disabled={saving}
            title="Salvar (Ctrl+S)"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              padding: '5px 12px',
              borderRadius: 7,
              background: 'rgba(108,99,255,0.2)',
              border: '1px solid rgba(108,99,255,0.4)',
              color: 'var(--accent-primary)',
              fontSize: 12,
              fontWeight: 600,
              transition: 'all 0.15s',
              opacity: saving ? 0.6 : 1,
            }}
          >
            <Save size={13} />
            {saving ? 'Salvando...' : 'Salvar'}
          </button>

          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowExport((v) => !v)}
              title="Exportar"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                padding: '5px 12px',
                borderRadius: 7,
                background: 'rgba(0,212,255,0.1)',
                border: '1px solid rgba(0,212,255,0.3)',
                color: 'var(--accent-secondary)',
                fontSize: 12,
                fontWeight: 600,
                transition: 'all 0.15s',
              }}
            >
              <Download size={13} />
              Exportar
            </button>
            {showExport && note && (
              <ExportMenu note={note} onClose={() => setShowExport(false)} />
            )}
          </div>

          <button
            onClick={() => setShowDeleteConfirm(true)}
            title="Excluir nota"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 30,
              height: 30,
              borderRadius: 7,
              background: 'rgba(255,77,109,0.1)',
              border: '1px solid rgba(255,77,109,0.3)',
              color: 'var(--danger)',
              transition: 'all 0.15s',
            }}
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* ── Editor ── */}
      <EditorContent
        editor={editor}
        style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
      />

      {/* ── Status bar ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '5px 24px',
          borderTop: '1px solid var(--border)',
          background: 'var(--bg-secondary)',
          flexShrink: 0,
          fontSize: 11,
          color: 'var(--text-secondary)',
        }}
      >
        <span>{words} palavra{words !== 1 ? 's' : ''}</span>
        <span
          style={{
            color:
              saveStatus === 'saved'
                ? 'var(--success)'
                : saveStatus === 'saving'
                ? 'var(--accent-secondary)'
                : 'transparent',
            transition: 'color 0.3s',
            fontWeight: 500,
          }}
        >
          {saveStatus === 'saved'
            ? 'Salvo'
            : saveStatus === 'saving'
            ? 'Salvando...'
            : 'Todas as alterações salvas'}
        </span>
        <span>
          {note?.updated_at
            ? `Última edição ${new Date(note.updated_at).toLocaleString('pt-BR')}`
            : ''}
        </span>
      </div>

      {/* ── Link dialog ── */}
      {showLinkDialog && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 200,
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowLinkDialog(false); }}
        >
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 14,
              padding: 24,
              minWidth: 340,
              boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
              animation: 'fadeIn 0.2s ease',
            }}
          >
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14, color: 'var(--text-primary)' }}>
              Inserir Link
            </h3>
            <input
              autoFocus
              type="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSetLink(); if (e.key === 'Escape') setShowLinkDialog(false); }}
              placeholder="https://example.com"
              style={{
                width: '100%',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                padding: '8px 12px',
                color: 'var(--text-primary)',
                fontSize: 13,
                marginBottom: 14,
              }}
            />
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowLinkDialog(false)}
                style={{
                  padding: '7px 16px',
                  borderRadius: 8,
                  background: 'rgba(255,255,255,0.06)',
                  color: 'var(--text-secondary)',
                  fontSize: 13,
                  border: '1px solid var(--border)',
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleSetLink}
                style={{
                  padding: '7px 16px',
                  borderRadius: 8,
                  background: 'rgba(108,99,255,0.3)',
                  border: '1px solid rgba(108,99,255,0.5)',
                  color: 'var(--accent-primary)',
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                {linkUrl ? 'Aplicar' : 'Remover'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete confirmation ── */}
      {showDeleteConfirm && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 200,
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowDeleteConfirm(false); }}
        >
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid rgba(255,77,109,0.3)',
              borderRadius: 14,
              padding: 28,
              minWidth: 320,
              boxShadow: '0 24px 64px rgba(0,0,0,0.6), 0 0 32px rgba(255,77,109,0.1)',
              animation: 'fadeIn 0.2s ease',
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                background: 'rgba(255,77,109,0.15)',
                border: '1px solid rgba(255,77,109,0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 16,
              }}
            >
              <Trash2 size={22} color="var(--danger)" />
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
              Excluir nota?
            </h3>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 20 }}>
              "{note?.title || 'Sem título'}" será excluída permanentemente. Esta ação não pode ser desfeita.
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                style={{
                  padding: '8px 18px',
                  borderRadius: 8,
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-secondary)',
                  fontSize: 13,
                  fontWeight: 500,
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                style={{
                  padding: '8px 18px',
                  borderRadius: 8,
                  background: 'rgba(255,77,109,0.25)',
                  border: '1px solid rgba(255,77,109,0.5)',
                  color: 'var(--danger)',
                  fontSize: 13,
                  fontWeight: 700,
                  boxShadow: '0 0 12px rgba(255,77,109,0.2)',
                }}
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
