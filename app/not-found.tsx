export const dynamic = 'force-dynamic';

import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={{ 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      textAlign: 'center',
      padding: '20px'
    }}>
      <h1 style={{ fontSize: '120px', fontWeight: 900, margin: 0, color: 'var(--accent)' }}>404</h1>
      <h2 style={{ fontSize: '24px', marginBottom: '20px' }}>Aradığınız sayfa bulunamadı.</h2>
      <p style={{ color: 'var(--text3)', maxWidth: '500px', marginBottom: '40px' }}>
        Görünüşe göre bu sayfa sınav sonuçları gibi kaybolmuş. Ana sayfaya dönerek takibe devam edebilirsiniz.
      </p>
      <Link 
        href="/" 
        className="glass-card" 
        style={{ 
          padding: '12px 30px', 
          textDecoration: 'none', 
          color: 'var(--accent)',
          fontWeight: 700,
          border: '1px solid var(--accent-glow)'
        }}
      >
        Ana Sayfaya Dön
      </Link>
    </div>
  );
}
