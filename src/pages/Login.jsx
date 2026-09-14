import { useState } from 'react';
import { useAuth } from '../hooks/useAuth.jsx';

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async e => {
    e.preventDefault(); setErr(''); setLoading(true);
    try { await login(email, pass); window.location.href = '/'; }
    catch (ex) { setErr(ex.response?.data?.error || 'Error al iniciar sesión'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#eef1f5 0%,#dde3ec 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div style={{ background: 'white', borderRadius: '20px', boxShadow: '0 8px 40px rgba(0,0,0,0.10)', padding: '40px 36px', width: '100%', maxWidth: '380px' }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ fontSize: '56px', lineHeight: 1, marginBottom: '10px' }}>🦩</div>
          <h1 style={{ fontSize: '20px', fontWeight: 900, color: '#1e3a5f', margin: 0, letterSpacing: '1px' }}>LOS FLAMENCOS</h1>
          <p style={{ fontSize: '12px', color: '#888', margin: '4px 0 0' }}>Avícola y Miscelánea</p>
        </div>
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {err && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', fontSize: '12px', padding: '10px 14px', borderRadius: '8px' }}>{err}</div>}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#374151', marginBottom: '5px' }}>Correo electrónico</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="correo@dominio.com"
              style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #d1d5db', borderRadius: '10px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
              onFocus={e => e.target.style.borderColor = '#1e3a5f'} onBlur={e => e.target.style.borderColor = '#d1d5db'} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#374151', marginBottom: '5px' }}>Contraseña</label>
            <input type="password" value={pass} onChange={e => setPass(e.target.value)} required
              style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #d1d5db', borderRadius: '10px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
              onFocus={e => e.target.style.borderColor = '#1e3a5f'} onBlur={e => e.target.style.borderColor = '#d1d5db'} />
          </div>
          <button type="submit" disabled={loading}
            style={{ background: loading ? '#93a3b8' : '#1e3a5f', color: 'white', fontWeight: 700, fontSize: '14px', padding: '12px', borderRadius: '10px', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', marginTop: '4px' }}>
            {loading ? 'Ingresando...' : 'Ingresar al Sistema'}
          </button>
        </form>
      </div>
    </div>
  );
}
