import { useState, useEffect, useRef } from 'react';
import { BookOpen, Server, Globe, Users, Shield, Monitor, Terminal, CheckCircle, ArrowUp } from 'lucide-react';

const sections = [
  {
    id: 'intro',
    icon: <BookOpen size={20} />,
    title: 'O que é o NovaNotes?',
    content: (
      <>
        <p>O <strong>NovaNotes</strong> é um sistema de notas pessoal e corporativo que roda como um <strong>servidor local</strong> na sua máquina. Após a instalação, ele fica acessível pelo navegador — tanto no seu computador quanto em qualquer dispositivo conectado à mesma rede (Wi-Fi ou cabo).</p>
        <div className="manual-highlight">
          <strong>Ideal para:</strong>
          <ul>
            <li>Uso pessoal — suas notas ficam no seu computador, sem nuvem</li>
            <li>Empresas — todos os funcionários na rede interna acessam o mesmo sistema</li>
            <li>Escolas e laboratórios — acesso compartilhado sem internet</li>
          </ul>
        </div>
      </>
    ),
  },
  {
    id: 'como-funciona',
    icon: <Server size={20} />,
    title: 'Como funciona?',
    content: (
      <>
        <p>Quando você inicia o NovaNotes, ele cria um <strong>servidor web</strong> no seu computador. Esse servidor:</p>
        <ol>
          <li><strong>Escolhe uma porta automaticamente</strong> — geralmente a 5173, mas se estiver ocupada, encontra a próxima disponível</li>
          <li><strong>Serve a interface</strong> — o app completo roda no navegador, sem precisar instalar nada nos outros dispositivos</li>
          <li><strong>Armazena os dados localmente</strong> — tudo fica salvo em um banco de dados SQLite no seu computador</li>
        </ol>
        <div className="manual-highlight">
          <strong>Importante:</strong> O computador onde o NovaNotes está instalado precisa estar ligado para que o sistema funcione. Ele é o servidor.
        </div>
      </>
    ),
  },
  {
    id: 'instalacao',
    icon: <Terminal size={20} />,
    title: 'Instalação',
    content: (
      <>
        <p>Siga os passos abaixo para instalar o NovaNotes:</p>
        <div className="manual-steps">
          <div className="manual-step">
            <span className="step-number">1</span>
            <div>
              <strong>Instale o Node.js</strong>
              <p>Baixe e instale o Node.js (versão 18 ou superior) em <code>nodejs.org</code></p>
            </div>
          </div>
          <div className="manual-step">
            <span className="step-number">2</span>
            <div>
              <strong>Baixe o NovaNotes</strong>
              <p>Clone ou baixe o projeto do repositório</p>
              <code className="manual-code">git clone https://github.com/FelipeSilva-git/novanotes.git</code>
            </div>
          </div>
          <div className="manual-step">
            <span className="step-number">3</span>
            <div>
              <strong>Instale as dependências</strong>
              <code className="manual-code">cd novanotes && npm run install:all</code>
            </div>
          </div>
          <div className="manual-step">
            <span className="step-number">4</span>
            <div>
              <strong>Faça o build do frontend</strong>
              <code className="manual-code">cd frontend && npm run build</code>
            </div>
          </div>
          <div className="manual-step">
            <span className="step-number">5</span>
            <div>
              <strong>Inicie o servidor</strong>
              <code className="manual-code">cd backend && node server.js</code>
              <p>O terminal vai mostrar em qual porta o servidor está rodando.</p>
            </div>
          </div>
        </div>
      </>
    ),
  },
  {
    id: 'acessando',
    icon: <Globe size={20} />,
    title: 'Acessando o sistema',
    content: (
      <>
        <p>Após iniciar o servidor, você verá uma mensagem como:</p>
        <code className="manual-code">NovaNotes rodando em http://localhost:5173</code>

        <h4>No computador servidor</h4>
        <p>Abra o navegador e acesse:</p>
        <code className="manual-code">http://localhost:5173</code>

        <h4>Em outros dispositivos na mesma rede</h4>
        <p>Primeiro, descubra o IP do computador servidor:</p>
        <div className="manual-steps">
          <div className="manual-step">
            <span className="step-number">
              <Monitor size={14} />
            </span>
            <div>
              <strong>Windows:</strong> Abra o Prompt de Comando e digite <code>ipconfig</code>. Procure por "Endereço IPv4" (ex: <code>192.168.1.100</code>)
            </div>
          </div>
          <div className="manual-step">
            <span className="step-number">
              <Terminal size={14} />
            </span>
            <div>
              <strong>Linux/Mac:</strong> Abra o Terminal e digite <code>hostname -I</code> ou <code>ifconfig</code>
            </div>
          </div>
        </div>
        <p>Depois, nos outros dispositivos (celulares, tablets, outros PCs), acesse:</p>
        <code className="manual-code">http://[IP-DO-SERVIDOR]:5173</code>
        <p>Exemplo: <code>http://192.168.1.100:5173</code></p>

        <div className="manual-highlight">
          <strong>Dica:</strong> Todos na mesma rede Wi-Fi ou rede cabeada da empresa podem acessar usando o IP do servidor. Cada pessoa cria sua própria conta com usuário e senha.
        </div>
      </>
    ),
  },
  {
    id: 'rede-empresa',
    icon: <Users size={20} />,
    title: 'Uso em empresas',
    content: (
      <>
        <p>O NovaNotes é perfeito para redes internas corporativas:</p>
        <ul>
          <li><strong>Sem internet necessária</strong> — funciona 100% na rede local (LAN)</li>
          <li><strong>Multi-usuário</strong> — cada funcionário cria sua conta e tem suas notas privadas</li>
          <li><strong>Dados no servidor</strong> — todas as notas ficam no computador servidor, facilitando backups</li>
          <li><strong>Sem custos de nuvem</strong> — não precisa de servidores externos ou assinaturas</li>
        </ul>

        <h4>Configuração recomendada para empresas</h4>
        <div className="manual-steps">
          <div className="manual-step">
            <span className="step-number">1</span>
            <div>
              <strong>Escolha um computador dedicado</strong>
              <p>Pode ser qualquer PC que fique ligado durante o expediente. Não precisa ser potente.</p>
            </div>
          </div>
          <div className="manual-step">
            <span className="step-number">2</span>
            <div>
              <strong>Configure IP fixo</strong>
              <p>No roteador da empresa, configure um IP fixo para o computador servidor. Assim o endereço de acesso nunca muda.</p>
            </div>
          </div>
          <div className="manual-step">
            <span className="step-number">3</span>
            <div>
              <strong>Inicie automaticamente</strong>
              <p>Use o PM2 para manter o servidor rodando e reiniciando automaticamente:</p>
              <code className="manual-code">npm install -g pm2{'\n'}cd backend && pm2 start server.js --name novanotes{'\n'}pm2 save && pm2 startup</code>
            </div>
          </div>
          <div className="manual-step">
            <span className="step-number">4</span>
            <div>
              <strong>Compartilhe o link</strong>
              <p>Envie o endereço (ex: <code>http://192.168.1.100:5173</code>) para os funcionários. Eles acessam pelo navegador e criam suas contas.</p>
            </div>
          </div>
        </div>
      </>
    ),
  },
  {
    id: 'seguranca',
    icon: <Shield size={20} />,
    title: 'Segurança e backup',
    content: (
      <>
        <h4>Segurança</h4>
        <ul>
          <li>As senhas são criptografadas com <strong>bcrypt</strong></li>
          <li>A autenticação usa <strong>tokens JWT</strong> com validade de 30 dias</li>
          <li>O sistema só é acessível dentro da rede local — não fica exposto na internet</li>
        </ul>

        <h4>Backup</h4>
        <p>Todos os dados ficam em um único arquivo:</p>
        <code className="manual-code">backend/novanotes.db</code>
        <p>Para fazer backup, basta copiar esse arquivo para um local seguro (pendrive, HD externo, etc). Para restaurar, substitua o arquivo e reinicie o servidor.</p>

        <div className="manual-highlight">
          <strong>Dica de backup automático:</strong> Agende uma cópia diária do arquivo <code>novanotes.db</code> usando o Agendador de Tarefas (Windows) ou cron (Linux).
        </div>
      </>
    ),
  },
  {
    id: 'solucao-problemas',
    icon: <CheckCircle size={20} />,
    title: 'Solução de problemas',
    content: (
      <>
        <div className="manual-faq">
          <h4>Não consigo acessar de outro dispositivo</h4>
          <ul>
            <li>Verifique se ambos estão na mesma rede Wi-Fi/cabo</li>
            <li>No Windows, o Firewall pode bloquear a porta. Adicione uma exceção para a porta do NovaNotes</li>
            <li>Confira se digitou o IP correto do servidor</li>
          </ul>
        </div>

        <div className="manual-faq">
          <h4>A porta mudou depois de reiniciar</h4>
          <p>O NovaNotes busca automaticamente uma porta livre. Para fixar uma porta específica, inicie com:</p>
          <code className="manual-code">PORT=5173 node server.js</code>
        </div>

        <div className="manual-faq">
          <h4>O servidor parou quando fechei o terminal</h4>
          <p>Use o PM2 para manter rodando em segundo plano:</p>
          <code className="manual-code">pm2 start server.js --name novanotes</code>
        </div>

        <div className="manual-faq">
          <h4>Tela branca ou erro no navegador</h4>
          <ul>
            <li>Limpe o cache do navegador (Ctrl+Shift+Delete)</li>
            <li>Tente uma aba anônima (Ctrl+Shift+N)</li>
            <li>Verifique se o servidor está rodando no terminal</li>
          </ul>
        </div>
      </>
    ),
  },
];

export default function Manual({ onClose }) {
  const [progress, setProgress] = useState(0);
  const [activeSection, setActiveSection] = useState('intro');
  const contentRef = useRef(null);
  const sectionRefs = useRef({});

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    const handleScroll = () => {
      const pct = Math.round((el.scrollTop / (el.scrollHeight - el.clientHeight)) * 100) || 0;
      setProgress(Math.min(pct, 100));

      // Find active section
      let current = 'intro';
      for (const s of sections) {
        const ref = sectionRefs.current[s.id];
        if (ref && ref.offsetTop - el.scrollTop < 200) {
          current = s.id;
        }
      }
      setActiveSection(current);
    };
    el.addEventListener('scroll', handleScroll);
    return () => el.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id) => {
    const ref = sectionRefs.current[id];
    if (ref) ref.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const scrollToTop = () => {
    contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      {/* Progress bar */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 3, background: 'var(--border)', zIndex: 100 }}>
        <div style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg, var(--accent-primary), var(--accent-secondary))', transition: 'width 0.2s', boxShadow: '0 0 10px var(--accent-glow)' }} />
      </div>

      {/* Sidebar nav */}
      <nav style={{ width: 260, minWidth: 200, borderRight: '1px solid var(--border)', background: 'var(--bg-secondary)', padding: '20px 0', display: 'flex', flexDirection: 'column', flexShrink: 0, overflow: 'hidden' }}>
        <div style={{ padding: '0 20px 20px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, #6c63ff, #00d4ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 16px rgba(108,99,255,0.5)' }}>
              <BookOpen size={16} color="#fff" />
            </div>
            <span style={{ fontSize: 16, fontWeight: 700, background: 'linear-gradient(135deg, #6c63ff, #00d4ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Manual</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ flex: 1, height: 6, borderRadius: 3, background: 'var(--border)', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg, var(--accent-primary), var(--accent-secondary))', transition: 'width 0.3s', borderRadius: 3 }} />
            </div>
            <span style={{ fontSize: 11, color: 'var(--accent-primary)', fontWeight: 700, minWidth: 32 }}>{progress}%</span>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 10px' }}>
          {sections.map((s) => (
            <button
              key={s.id}
              onClick={() => scrollTo(s.id)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 12px',
                borderRadius: 8,
                background: activeSection === s.id ? 'rgba(108,99,255,0.18)' : 'transparent',
                color: activeSection === s.id ? 'var(--accent-primary)' : 'var(--text-secondary)',
                fontSize: 13,
                fontWeight: activeSection === s.id ? 600 : 400,
                textAlign: 'left',
                transition: 'all 0.15s',
                marginBottom: 2,
                border: 'none',
                cursor: 'pointer',
              }}
            >
              {s.icon}
              {s.title}
            </button>
          ))}
        </div>

        {onClose && (
          <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border)' }}>
            <button
              onClick={onClose}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                padding: '8px',
                borderRadius: 8,
                background: 'linear-gradient(135deg, rgba(108,99,255,0.3), rgba(0,212,255,0.2))',
                border: '1px solid rgba(108,99,255,0.4)',
                color: 'var(--accent-primary)',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              Ir para o NovaNotes
            </button>
          </div>
        )}
      </nav>

      {/* Content */}
      <main ref={contentRef} className="manual-content" style={{ flex: 1, overflowY: 'auto', padding: '40px 60px 80px', maxWidth: 800, scrollBehavior: 'smooth' }}>
        <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8, background: 'linear-gradient(135deg, #6c63ff, #00d4ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Manual de Instalação e Uso
        </h1>
        <p style={{ fontSize: 15, color: 'var(--text-secondary)', marginBottom: 40 }}>
          Tudo o que você precisa saber para instalar, configurar e usar o NovaNotes na sua rede.
        </p>

        {sections.map((s) => (
          <section
            key={s.id}
            ref={(el) => (sectionRefs.current[s.id] = el)}
            style={{ marginBottom: 48 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(108,99,255,0.12)', border: '1px solid rgba(108,99,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)' }}>
                {s.icon}
              </div>
              <h2 style={{ fontSize: 22, fontWeight: 700 }}>{s.title}</h2>
            </div>
            <div className="manual-body">{s.content}</div>
          </section>
        ))}
      </main>

      {/* Scroll to top */}
      {progress > 15 && (
        <button
          onClick={scrollToTop}
          style={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            width: 44,
            height: 44,
            borderRadius: 12,
            background: 'var(--accent-primary)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 4px 20px var(--accent-glow)',
            transition: 'all 0.2s',
            zIndex: 50,
          }}
        >
          <ArrowUp size={20} />
        </button>
      )}

      <style>{`
        .manual-body p { font-size: 14px; line-height: 1.8; color: var(--text-secondary); margin-bottom: 12px; }
        .manual-body strong { color: var(--text-primary); }
        .manual-body ul, .manual-body ol { padding-left: 20px; margin-bottom: 14px; }
        .manual-body li { font-size: 14px; line-height: 1.8; color: var(--text-secondary); margin-bottom: 6px; }
        .manual-body h4 { font-size: 16px; font-weight: 700; color: var(--text-primary); margin: 20px 0 8px; }
        .manual-body code { background: rgba(108,99,255,0.12); color: var(--accent-secondary); padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 13px; }
        .manual-code { display: block; background: var(--code-bg, rgba(0,0,0,0.3)); border: 1px solid var(--border); border-radius: 8px; padding: 12px 16px; font-family: monospace; font-size: 13px; color: var(--accent-secondary); margin: 10px 0 14px; line-height: 1.7; white-space: pre-wrap; word-break: break-all; }
        .manual-highlight { background: rgba(108,99,255,0.08); border: 1px solid rgba(108,99,255,0.2); border-radius: 10px; padding: 16px 20px; margin: 14px 0; }
        .manual-highlight strong { color: var(--accent-primary); }
        .manual-steps { display: flex; flex-direction: column; gap: 12px; margin: 14px 0; }
        .manual-step { display: flex; gap: 14px; align-items: flex-start; background: rgba(255,255,255,0.03); border: 1px solid var(--border); border-radius: 10px; padding: 14px 16px; }
        .manual-step .step-number { width: 28px; height: 28px; border-radius: 8px; background: rgba(108,99,255,0.2); color: var(--accent-primary); display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; flex-shrink: 0; }
        .manual-step p { margin: 4px 0 0; }
        .manual-faq { background: rgba(255,255,255,0.02); border: 1px solid var(--border); border-radius: 10px; padding: 16px 20px; margin-bottom: 12px; }
        .manual-faq h4 { margin-top: 0; }
      `}</style>
    </div>
  );
}
