import { useEffect, useRef } from 'react';
import { Download, Code, Copy, X, FileText } from 'lucide-react';
import { exportNote } from '../api/client.js';

export default function ExportMenu({ note, onClose }) {
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [onClose]);

  const downloadFile = async (format) => {
    try {
      const res = await exportNote(note.id, format);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${note.title.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'note'}.${format}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      onClose();
    } catch (err) {
      console.error('Export failed:', err);
    }
  };

  const copyAsHtml = () => {
    if (note.content) {
      navigator.clipboard.writeText(note.content).then(() => {
        onClose();
      });
    }
  };

  return (
    <div
      ref={menuRef}
      style={{
        position: 'absolute',
        top: 'calc(100% + 6px)',
        right: 0,
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 12,
        overflow: 'hidden',
        zIndex: 100,
        boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
        minWidth: 220,
        animation: 'fadeIn 0.15s ease',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 14px',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Export Note
        </span>
        <button
          onClick={onClose}
          style={{ background: 'none', color: 'var(--text-secondary)', display: 'flex', borderRadius: 4 }}
        >
          <X size={14} />
        </button>
      </div>

      {/* Options */}
      <div style={{ padding: '6px' }}>
        <ExportOption
          icon={<Code size={15} />}
          label="Export as XML"
          description="Structured metadata + content"
          onClick={() => downloadFile('xml')}
          color="var(--accent-secondary)"
        />
        <ExportOption
          icon={<FileText size={15} />}
          label="Export as HTML"
          description="Styled standalone webpage"
          onClick={() => downloadFile('html')}
          color="var(--accent-primary)"
        />
        <ExportOption
          icon={<Copy size={15} />}
          label="Copy as HTML"
          description="Copy raw HTML to clipboard"
          onClick={copyAsHtml}
          color="#ffd93d"
        />
      </div>
    </div>
  );
}

function ExportOption({ icon, label, description, onClick, color }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '9px 10px',
        borderRadius: 8,
        background: 'none',
        textAlign: 'left',
        transition: 'background 0.12s',
        cursor: 'pointer',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(108,99,255,0.1)')}
      onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
    >
      <span
        style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          background: `${color}18`,
          border: `1px solid ${color}30`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color,
          flexShrink: 0,
        }}
      >
        {icon}
      </span>
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
          {label}
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
          {description}
        </div>
      </div>
    </button>
  );
}
