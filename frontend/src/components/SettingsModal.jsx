import { useState } from 'react';
import { X, Copy, Check, Code2, Globe, BookOpen } from 'lucide-react';

function CodeBlock({ method, path, desc, baseUrl }) {
  const [copied, setCopied] = useState(false);
  const fullUrl = `${baseUrl}${path}`;

  const copy = () => {
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const methodColor = {
    GET: '#6bcb77',
    POST: '#00d4ff',
    PUT: '#ffd93d',
    DELETE: '#ff6b6b',
  }[method] ?? '#a29bfe';

  return (
    <div
      style={{
        background: 'rgba(0,0,0,0.3)',
        border: '1px solid var(--border)',
        borderRadius: 10,
        padding: '12px 14px',
        marginBottom: 10,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            fontFamily: 'monospace',
            color: methodColor,
            background: methodColor + '20',
            padding: '2px 8px',
            borderRadius: 6,
            flexShrink: 0,
          }}
        >
          {method}
        </span>
        <code
          style={{
            flex: 1,
            fontSize: 12,
            color: 'var(--text-primary)',
            fontFamily: 'monospace',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {path}
        </code>
        <button
          onClick={copy}
          title="Copy URL"
          style={{
            background: 'none',
            color: copied ? '#6bcb77' : 'var(--text-secondary)',
            display: 'flex',
            padding: 4,
            borderRadius: 6,
            transition: 'color 0.2s',
            flexShrink: 0,
          }}
        >
          {copied ? <Check size={13} /> : <Copy size={13} />}
        </button>
      </div>
      <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0 }}>{desc}</p>
    </div>
  );
}

export default function SettingsModal({ onClose }) {
  const [activeTab, setActiveTab] = useState('api');

  // Use the same origin as the frontend — Vite proxies /api to the backend
  const apiBase = window.location.origin;

  const endpoints = [
    {
      method: 'GET',
      path: '/api/notes',
      desc: 'Retorna todas as notas em JSON. Suporta ?search=texto, ?folder_id=1, ?tag_id=2',
    },
    {
      method: 'GET',
      path: '/api/notes/:id',
      desc: 'Retorna uma nota específica pelo ID, incluindo suas tags.',
    },
    {
      method: 'GET',
      path: '/api/notes/:id/export?format=json',
      desc: 'Exporta a nota em JSON puro (sem HTML).',
    },
    {
      method: 'GET',
      path: '/api/notes/:id/export?format=html',
      desc: 'Exporta a nota como documento HTML completo e autossuficiente.',
    },
    {
      method: 'GET',
      path: '/api/notes/:id/export?format=xml',
      desc: 'Exporta a nota como XML com metadados (título, pasta, tags, datas).',
    },
    {
      method: 'GET',
      path: '/api/folders',
      desc: 'Lista todas as pastas com contagem de notas.',
    },
    {
      method: 'GET',
      path: '/api/tags',
      desc: 'Lista todas as tags com contagem de notas.',
    },
    {
      method: 'POST',
      path: '/api/notes',
      desc: 'Cria uma nova nota. Body JSON: { title, content, folder_id, tag_ids[] }',
    },
    {
      method: 'PUT',
      path: '/api/notes/:id',
      desc: 'Atualiza uma nota existente. Body JSON: { title, content, folder_id, tag_ids[] }',
    },
    {
      method: 'DELETE',
      path: '/api/notes/:id',
      desc: 'Deleta uma nota pelo ID.',
    },
  ];

  const exampleFetch = `// Buscar todas as notas
const res = await fetch('${apiBase}/api/notes');
const notes = await res.json();

// Buscar nota específica
const res = await fetch('${apiBase}/api/notes/1');
const note = await res.json();

// Buscar com filtro de texto
const res = await fetch('${apiBase}/api/notes?search=react');
const results = await res.json();

// Criar nota
const res = await fetch('${apiBase}/api/notes', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'Minha nota',
    content: '<p>Conteúdo</p>',
    folder_id: 1,
    tag_ids: [1, 2]
  })
});
const newNote = await res.json();`;

  const tabs = [
    { id: 'api', label: 'API Access', icon: <Globe size={14} /> },
    { id: 'code', label: 'Exemplos', icon: <Code2 size={14} /> },
    { id: 'about', label: 'Sobre', icon: <BookOpen size={14} /> },
  ];

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(6px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        animation: 'fadeIn 0.15s ease',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 620,
          maxHeight: '80vh',
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 16,
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 0 60px rgba(108,99,255,0.2), 0 24px 48px rgba(0,0,0,0.6)',
          animation: 'slideIn 0.2s ease',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '18px 22px 0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
          }}
        >
          <div>
            <h2
              style={{
                fontSize: 17,
                fontWeight: 700,
                color: 'var(--text-primary)',
                margin: 0,
              }}
            >
              Configurações
            </h2>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '2px 0 0' }}>
              NovaNotes v1.0
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.06)',
              color: 'var(--text-secondary)',
              borderRadius: 8,
              padding: 6,
              display: 'flex',
              transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,77,109,0.2)';
              e.currentTarget.style.color = '#ff4d6d';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
              e.currentTarget.style.color = 'var(--text-secondary)';
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Tabs */}
        <div
          style={{
            display: 'flex',
            gap: 4,
            padding: '14px 22px 0',
            borderBottom: '1px solid var(--border)',
            flexShrink: 0,
          }}
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 14px',
                borderRadius: '8px 8px 0 0',
                background:
                  activeTab === tab.id ? 'rgba(108,99,255,0.15)' : 'transparent',
                color:
                  activeTab === tab.id ? 'var(--accent-primary)' : 'var(--text-secondary)',
                fontSize: 13,
                fontWeight: activeTab === tab.id ? 600 : 400,
                borderBottom: activeTab === tab.id ? '2px solid var(--accent-primary)' : '2px solid transparent',
                transition: 'all 0.15s',
                marginBottom: -1,
              }}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 22px' }}>
          {activeTab === 'api' && (
            <div>
              {/* Base URL */}
              <div
                style={{
                  background: 'rgba(108,99,255,0.08)',
                  border: '1px solid rgba(108,99,255,0.3)',
                  borderRadius: 10,
                  padding: '12px 16px',
                  marginBottom: 20,
                }}
              >
                <p style={{ fontSize: 11, color: 'var(--text-secondary)', margin: '0 0 6px', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.06em' }}>
                  Base URL
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <code style={{ fontSize: 14, color: 'var(--accent-secondary)', fontFamily: 'monospace', flex: 1 }}>
                    {apiBase}
                  </code>
                  <CopyButton text={apiBase} />
                </div>
              </div>

              <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 14 }}>
                Todas as rotas retornam JSON. Não há autenticação — a API é acessível na rede local.
              </p>

              {endpoints.map((ep) => (
                <CodeBlock key={ep.method + ep.path} {...ep} baseUrl={apiBase} />
              ))}
            </div>
          )}

          {activeTab === 'code' && (
            <div>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>
                Exemplos prontos para usar no console do navegador ou em qualquer cliente HTTP.
              </p>
              <div
                style={{
                  position: 'relative',
                  background: 'rgba(0,0,0,0.4)',
                  border: '1px solid var(--border)',
                  borderRadius: 10,
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderBottom: '1px solid var(--border)',
                    background: 'rgba(108,99,255,0.08)',
                  }}
                >
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                    JavaScript / fetch
                  </span>
                  <CopyButton text={exampleFetch} />
                </div>
                <pre
                  style={{
                    margin: 0,
                    padding: '16px',
                    fontSize: 12,
                    color: 'var(--text-primary)',
                    fontFamily: 'monospace',
                    lineHeight: 1.7,
                    overflowX: 'auto',
                    whiteSpace: 'pre',
                  }}
                >
                  {exampleFetch}
                </pre>
              </div>

              <div
                style={{
                  marginTop: 16,
                  background: 'rgba(0,0,0,0.3)',
                  border: '1px solid var(--border)',
                  borderRadius: 10,
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    padding: '10px 14px',
                    borderBottom: '1px solid var(--border)',
                    background: 'rgba(108,99,255,0.08)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                    curl (terminal)
                  </span>
                  <CopyButton text={`curl ${apiBase}/api/notes | python3 -m json.tool`} />
                </div>
                <pre
                  style={{
                    margin: 0,
                    padding: '16px',
                    fontSize: 12,
                    color: 'var(--text-primary)',
                    fontFamily: 'monospace',
                    lineHeight: 1.7,
                    overflowX: 'auto',
                  }}
                >
{`# Listar todas as notas
curl ${apiBase}/api/notes

# Nota específica
curl ${apiBase}/api/notes/1

# Busca por texto
curl "${apiBase}/api/notes?search=react"

# Exportar como HTML
curl "${apiBase}/api/notes/1/export?format=html" -o nota.html

# Exportar como XML
curl "${apiBase}/api/notes/1/export?format=xml" -o nota.xml`}
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'about' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div
                style={{
                  background: 'rgba(108,99,255,0.08)',
                  border: '1px solid rgba(108,99,255,0.2)',
                  borderRadius: 12,
                  padding: '20px',
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 16,
                    background: 'linear-gradient(135deg, #6c63ff, #00d4ff)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 14px',
                    boxShadow: '0 0 24px rgba(108,99,255,0.5)',
                  }}
                >
                  <BookOpen size={26} color="#fff" />
                </div>
                <h3 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 6px', background: 'linear-gradient(135deg, #6c63ff, #00d4ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                  NovaNotes
                </h3>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0 }}>
                  Versão 1.0.0
                </p>
              </div>

              {[
                { label: 'Frontend', value: 'React 18 + Vite + TipTap' },
                { label: 'Backend', value: 'Node.js + Express' },
                { label: 'Banco de dados', value: 'SQLite via better-sqlite3' },
                { label: 'PWA', value: 'Workbox (vite-plugin-pwa)' },
                { label: 'API porta', value: '3001' },
                { label: 'Frontend porta', value: '5173' },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '10px 14px',
                    background: 'rgba(255,255,255,0.03)',
                    borderRadius: 8,
                    border: '1px solid var(--border)',
                  }}
                >
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{label}</span>
                  <span style={{ fontSize: 13, color: 'var(--text-primary)', fontFamily: 'monospace' }}>{value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };
  return (
    <button
      onClick={copy}
      title="Copiar"
      style={{
        background: 'none',
        color: copied ? '#6bcb77' : 'var(--text-secondary)',
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        fontSize: 12,
        padding: '3px 6px',
        borderRadius: 6,
        transition: 'color 0.2s',
        flexShrink: 0,
      }}
    >
      {copied ? <Check size={13} /> : <Copy size={13} />}
      {copied ? 'Copiado!' : 'Copiar'}
    </button>
  );
}
