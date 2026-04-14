'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { loginStudent } from '@/app/actions';

export default function StudentLoginPage() {
  const { id } = useParams();
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const res = await loginStudent(id as string, password);
    if (res.success) {
      router.push(`/student/${id}`);
      router.refresh(); // Refresh to clear the layout protection
    } else {
      setError(res.error || 'Hatalı şifre!');
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'radial-gradient(circle at 50% 50%, #111827 0%, #080c14 100%)',
      padding: '40px 20px', overflowY: 'auto'
    }}>
      <div className="glass-card animate-fade-up" style={{ padding: '32px', maxWidth: '400px', width: '100%', textAlign: 'center' }}>
        <div style={{
          width: '64px', height: '64px', borderRadius: '18px', background: 'var(--accent-dim)',
          color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '24px', margin: '0 auto 24px'
        }}>
          <i className="fas fa-lock"></i>
        </div>
        
        <h1 style={{ fontSize: '22px', fontWeight: 900, marginBottom: '8px' }}>Öğrenci Girişi</h1>
        <p style={{ fontSize: '13px', color: 'var(--text3)', marginBottom: '24px' }}>Devam etmek için lütfen şifrenizi girin.</p>
        
        <form onSubmit={handleLogin}>
          <input 
            type="password" 
            className="input" 
            placeholder="Şifre…" 
            value={password}
            onChange={e => setPassword(e.target.value)}
            autoFocus
            required
            style={{ textAlign: 'center', fontSize: '18px', letterSpacing: '4px', marginBottom: '16px' }}
          />
          
          {error && <div style={{ color: 'var(--red)', fontSize: '12px', marginBottom: '16px', fontWeight: 600 }}>{error}</div>}
          
          <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '12px' }}>
            {loading ? 'Giriş Yapılıyor…' : 'Giriş Yap'}
          </button>
        </form>
        
        <div style={{ marginTop: '24px', fontSize: '11px', color: 'var(--text3)' }}>
          Şifrenizi unuttuysanız lütfen öğretmeninize danışın.
        </div>
      </div>
    </div>
  );
}
