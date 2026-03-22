import { useState, useRef, useEffect } from 'react';
import { FileText, User, Lock, ArrowRight, Loader, Mail, RefreshCw, CheckCircle } from 'lucide-react';
import { login, register } from '../api/client.js';
import useAppStore from '../store/appStore.js';

const BASE = '/api';

async function verifyCode(email, code) {
  const res = await fetch(`${BASE}/auth/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, code }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Erro ao verificar');
  return data;
}

async function resendCode(email) {
  const res = await fetch(`${BASE}/auth/resend`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Erro ao reenviar');
  return data;
}

// ── Verification screen ───────────────────────────────────────
function VerifyScreen({ email, onVerified }) {
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const refs = useRef([]);

  const code = digits.join('');

  useEffect(() => {
    refs.current[0]?.focus();
  }, []);

  const handleDigit = (i, val) => {
    const ch = val.replace(/\D/g, '').slice(-1);
    const next = [...digits];
    next[i] = ch;
    setDigits(next);
    if (ch && i < 5) refs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) {
      refs.current[i - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setDigits(pasted.split(''));
      refs.current[5]?.focus();
    }
  };

  const handleVerify = async () => {
    if (code.length < 6) return;
    setError('');
    setLoading(true);
    try {
      const data = await verifyCode(email, code);
      onVerified(data);
    } catch (err) {
      setError(err.message);
      setDigits(['', '', '', '', '', '']);
      refs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setError('');
    try {
      await resendCode(email);
      setResent(true);
      setTimeout(() => setResent(false), 4000);
    } catch (err) {
      setError(err.message);
    } finally {
      setResending(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
      {/* Icon */}
      <div style={{ width: 42, height: 42, borderRadius: 12, background: 'linear-gradient(135deg, #6c63ff, #00d4ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10, boxShadow: '0 0 20px rgba(108,99,255,0.5)' }}>
        <Mail size={20} color="#fff" />
      </div>
      <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 4px' }}>Verifique seu email</h2>
      <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '0 0 20px', textAlign: 'center', lineHeight: 1.5 }}>
        Enviamos um código de 6 dígitos para<br />
        <strong style={{ color: 'var(--accent-secondary)' }}>{email}</strong>
      </p>

      {/* Digit inputs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }} onPaste={handlePaste}>
        {digits.map((d, i) => (
          <input
            key={i}
            ref={(el) => (refs.current[i] = el)}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={d}
            onChange={(e) => handleDigit(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            style={{
              width: 42,
              height: 50,
              textAlign: 'center',
              fontSize: 22,
              fontWeight: 700,
              fontFamily: 'monospace',
              background: d ? 'rgba(108,99,255,0.15)' : 'rgba(255,255,255,0.04)',
              border: `2px solid ${d ? 'rgba(108,99,255,0.6)' : 'var(--border)'}`,
              borderRadius: 10,
              color: 'var(--accent-primary)',
              outline: 'none',
              transition: 'all 0.15s',
            }}
            onFocus={(e) => (e.target.style.borderColor = 'var(--accent-primary)')}
            onBlur={(e) => (e.target.style.borderColor = digits[i] ? 'rgba(108,99,255,0.6)' : 'var(--border)')}
          />
        ))}
      </div>

      {/* Error */}
      {error && (
        <div style={{ background: 'rgba(255,107,107,0.12)', border: '1px solid rgba(255,107,107,0.35)', borderRadius: 6, padding: '7px 12px', fontSize: 12, color: '#ff6b6b', marginBottom: 12, width: '100%', textAlign: 'center' }}>
          {error}
        </div>
      )}

      {/* Verify button */}
      <button
        onClick={handleVerify}
        disabled={loading || code.length < 6}
        style={{
          width: '100%',
          padding: '10px',
          borderRadius: 8,
          background: code.length < 6 ? 'rgba(108,99,255,0.2)' : loading ? 'rgba(108,99,255,0.3)' : 'linear-gradient(135deg, #6c63ff, #5a54d4)',
          color: code.length < 6 ? 'var(--text-secondary)' : '#fff',
          fontSize: 13,
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
          transition: 'all 0.2s',
          boxShadow: code.length === 6 && !loading ? '0 0 18px rgba(108,99,255,0.4)' : 'none',
          cursor: code.length < 6 || loading ? 'not-allowed' : 'pointer',
          marginBottom: 14,
        }}
      >
        {loading
          ? <><Loader size={13} style={{ animation: 'spin 1s linear infinite' }} /> Verificando...</>
          : <><CheckCircle size={13} /> Verificar</>}
      </button>

      {/* Resend */}
      <button
        onClick={handleResend}
        disabled={resending}
        style={{ background: 'none', color: resent ? '#6bcb77' : 'var(--text-secondary)', fontSize: 12, display: 'flex', alignItems: 'center', gap: 5, transition: 'color 0.2s' }}
        onMouseEnter={(e) => !resent && (e.currentTarget.style.color = 'var(--accent-primary)')}
        onMouseLeave={(e) => !resent && (e.currentTarget.style.color = 'var(--text-secondary)')}
      >
        {resending
          ? <><Loader size={12} style={{ animation: 'spin 1s linear infinite' }} /> Reenviando...</>
          : resent
            ? <><CheckCircle size={12} /> Código reenviado!</>
            : <><RefreshCw size={12} /> Reenviar código</>}
      </button>
    </div>
  );
}

// ── Main Auth Page ────────────────────────────────────────────
export default function AuthPage() {
  const [mode, setMode] = useState('login');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [pendingEmail, setPendingEmail] = useState(null); // verification screen
  const setAuth = useAppStore((s) => s.setAuth);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        const data = await login(username.trim(), password);
        setAuth(data.user, data.token);
      } else {
        const data = await register(username.trim(), email.trim(), password);
        if (data.pendingVerification) {
          setPendingEmail(data.email);
        }
      }
    } catch (err) {
      // If login returns pendingVerification, redirect to verify screen
      if (err.pendingEmail) {
        setPendingEmail(err.pendingEmail);
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerified = (data) => {
    setAuth(data.user, data.token);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100vw',
        background: 'var(--bg-primary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background grid */}
      <div aria-hidden style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(108,99,255,0.05) 1px, transparent 1px),linear-gradient(90deg, rgba(108,99,255,0.05) 1px, transparent 1px)', backgroundSize: '40px 40px', pointerEvents: 'none' }} />
      <div aria-hidden style={{ position: 'absolute', top: '20%', left: '15%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(108,99,255,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div aria-hidden style={{ position: 'absolute', bottom: '15%', right: '10%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,212,255,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />

      {/* Card */}
      <div
        style={{
          width: '100%',
          maxWidth: 360,
          margin: '0 16px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 16,
          padding: '24px 28px',
          boxShadow: '0 0 60px rgba(108,99,255,0.15), 0 20px 40px rgba(0,0,0,0.5)',
          animation: 'fadeIn 0.3s ease',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {pendingEmail ? (
          <VerifyScreen email={pendingEmail} onVerified={handleVerified} />
        ) : (
          <>
            {/* Logo */}
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: 'linear-gradient(135deg, #6c63ff, #00d4ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px', boxShadow: '0 0 20px rgba(108,99,255,0.5)' }}>
                <FileText size={20} color="#fff" />
              </div>
              <h1 style={{ fontSize: 20, fontWeight: 800, background: 'linear-gradient(135deg, #6c63ff, #00d4ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', margin: '0 0 2px', letterSpacing: '-0.5px' }}>
                NovaNotes
              </h1>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0 }}>
                {mode === 'login' ? 'Entre na sua conta' : 'Crie sua conta'}
              </p>
            </div>

            {/* Tab toggle */}
            <div style={{ display: 'flex', background: 'rgba(0,0,0,0.3)', borderRadius: 8, padding: 3, marginBottom: 16 }}>
              {['login', 'register'].map((m) => (
                <button
                  key={m}
                  onClick={() => { setMode(m); setError(''); }}
                  style={{
                    flex: 1,
                    padding: '6px',
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: 600,
                    background: mode === m ? 'rgba(108,99,255,0.25)' : 'transparent',
                    color: mode === m ? 'var(--accent-primary)' : 'var(--text-secondary)',
                    border: mode === m ? '1px solid rgba(108,99,255,0.4)' : '1px solid transparent',
                    transition: 'all 0.2s',
                  }}
                >
                  {m === 'login' ? 'Entrar' : 'Criar conta'}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {/* Username */}
              <InputRow icon={<User size={14} color="var(--text-secondary)" />}>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Username"
                  autoComplete="username"
                  required
                  style={{ flex: 1, fontSize: 13, color: 'var(--text-primary)', background: 'none' }}
                />
              </InputRow>

              {/* Email — only on register */}
              {mode === 'register' && (
                <InputRow icon={<Mail size={14} color="var(--text-secondary)" />}>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    autoComplete="email"
                    required
                    style={{ flex: 1, fontSize: 13, color: 'var(--text-primary)', background: 'none' }}
                  />
                </InputRow>
              )}

              {/* Password */}
              <InputRow icon={<Lock size={14} color="var(--text-secondary)" />}>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Senha"
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  required
                  style={{ flex: 1, fontSize: 13, color: 'var(--text-primary)', background: 'none' }}
                />
              </InputRow>

              {/* Error */}
              {error && (
                <div style={{ background: 'rgba(255,107,107,0.12)', border: '1px solid rgba(255,107,107,0.35)', borderRadius: 6, padding: '7px 12px', fontSize: 12, color: '#ff6b6b' }}>
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  marginTop: 2,
                  padding: '10px',
                  borderRadius: 8,
                  background: loading ? 'rgba(108,99,255,0.3)' : 'linear-gradient(135deg, #6c63ff, #5a54d4)',
                  color: '#fff',
                  fontSize: 13,
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  transition: 'all 0.2s',
                  boxShadow: loading ? 'none' : '0 0 18px rgba(108,99,255,0.4)',
                  cursor: loading ? 'not-allowed' : 'pointer',
                }}
              >
                {loading
                  ? <><Loader size={13} style={{ animation: 'spin 1s linear infinite' }} />{mode === 'login' ? 'Entrando...' : 'Enviando...'}</>
                  : <>{mode === 'login' ? 'Entrar' : 'Criar conta'}<ArrowRight size={13} /></>}
              </button>
            </form>

            <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-secondary)', marginTop: 14, opacity: 0.6 }}>
              {mode === 'login' ? 'Sem conta? Clique em "Criar conta".' : 'Um código de verificação será enviado por email.'}
            </p>
          </>
        )}
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

function InputRow({ icon, children }) {
  return (
    <div
      style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px', transition: 'border-color 0.2s' }}
      onFocusCapture={(e) => (e.currentTarget.style.borderColor = 'var(--accent-primary)')}
      onBlurCapture={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
    >
      {icon}
      {children}
    </div>
  );
}
