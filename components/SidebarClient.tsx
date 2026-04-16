'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { addStudent } from '@/app/actions';
import { useTheme } from '@/components/ThemeProvider';

export default function SidebarClient({ initialStudents }: { initialStudents: any[] }) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [isModalOpen, setModalOpen] = useState(false);
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentPassword, setNewStudentPassword] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(false);
  // ... rest of the code ...

  useEffect(() => {
    // Default collapse on mobile
    if (window.innerWidth <= 768) {
      setIsCollapsed(true);
    }
  }, []);

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newStudentName.trim()) {
      await addStudent(newStudentName.trim(), newStudentPassword.trim() || undefined);
      setNewStudentName('');
      setNewStudentPassword('');
      setModalOpen(false);
    }
  };

  return (
    <>
      <button onClick={() => setIsCollapsed(false)} style={{
        position: 'fixed', top: '16px', left: '16px', zIndex: 40,
        opacity: isCollapsed ? 1 : 0, pointerEvents: isCollapsed ? 'auto' : 'none',
        width: '42px', height: '42px', background: 'var(--card-bg)', border: '1px solid var(--border)',
        borderRadius: '10px', color: 'var(--text)', display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.3s', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
      }}>
        <i className="fas fa-chevron-right"></i>
      </button>

      {!isCollapsed && (
        <div className="mobile-overlay" onClick={() => setIsCollapsed(true)} 
          style={{ opacity: isCollapsed ? 0 : 1, pointerEvents: isCollapsed ? 'none' : 'auto' }} 
        />
      )}

      <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
        <button onClick={() => setIsCollapsed(true)} style={{
          position: 'absolute', top: '24px', right: '16px', background: 'transparent',
          border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: '16px', zIndex: 10
        }}>
          <i className="fas fa-chevron-left"></i>
        </button>

        {/* Glow behind Sidebar header */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '200px',
          background: 'radial-gradient(ellipse at 50% -10%, var(--accent-dim) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />

        <div style={{ padding: '22px 20px 18px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '38px', height: '38px',
              background: 'var(--accent-dim)',
              border: '1px solid var(--accent-glow)',
              borderRadius: '10px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--accent)', fontSize: '15px'
            }}>
              <i className="fas fa-graduation-cap"></i>
            </div>
            <div style={{ lineHeight: 1 }}>
              <h1 style={{ fontSize: '16px', fontWeight: 800, letterSpacing: '-0.4px', color: 'var(--text)' }}>
                LGS Takip
              </h1>
              <span style={{ fontSize: '10px', fontWeight: 500, color: 'var(--text3)', letterSpacing: '2px', textTransform: 'uppercase', fontFamily: 'var(--mono)' }}>
                Deneme Çizelgesi
              </span>
            </div>
          </div>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px', padding: '10px 12px', borderBottom: '1px solid var(--border)' }}>
          <Link href="/" style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '10px 12px', borderRadius: '8px',
            background: pathname === '/' ? 'var(--accent-dim)' : 'transparent',
            color: pathname === '/' ? 'var(--accent)' : 'var(--text3)',
            border: pathname === '/' ? '1px solid var(--accent-glow)' : '1px solid transparent',
            fontSize: '13px', fontWeight: 600, textDecoration: 'none', transition: 'all 0.2s'
          }}>
            <i className="fas fa-th-large" style={{ width: '16px', textAlign: 'center' }}></i> Ana Sayfa
          </Link>
          <Link href="/compare" style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '10px 12px', borderRadius: '8px',
            background: pathname === '/compare' ? 'var(--accent-dim)' : 'transparent',
            color: pathname === '/compare' ? 'var(--accent)' : 'var(--text3)',
            border: pathname === '/compare' ? '1px solid var(--accent-glow)' : '1px solid transparent',
            fontSize: '13px', fontWeight: 600, textDecoration: 'none', transition: 'all 0.2s'
          }}>
            <i className="fas fa-chart-bar" style={{ width: '16px', textAlign: 'center' }}></i> Karşılaştırma
          </Link>
          <Link href="/pomodoro" style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '10px 12px', borderRadius: '8px',
            background: pathname === '/pomodoro' ? 'var(--accent-dim)' : 'transparent',
            color: pathname === '/pomodoro' ? 'var(--accent)' : 'var(--text3)',
            border: pathname === '/pomodoro' ? '1px solid var(--accent-glow)' : '1px solid transparent',
            fontSize: '13px', fontWeight: 600, textDecoration: 'none', transition: 'all 0.2s'
          }}>
            <i className="fas fa-stopwatch" style={{ width: '16px', textAlign: 'center' }}></i> Odaklan
          </Link>
          {/* Ders Planı - Only active when a student is selected */}
          {pathname.includes('/student/') ? (
            <Link href={`/student/${pathname.split('/')[2]}/ders-plani`} style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '10px 12px', borderRadius: '8px',
              background: pathname.includes('/ders-plani') ? 'var(--accent-dim)' : 'transparent',
              color: pathname.includes('/ders-plani') ? 'var(--accent)' : 'var(--text3)',
              border: pathname.includes('/ders-plani') ? '1px solid var(--accent-glow)' : '1px solid transparent',
              fontSize: '13px', fontWeight: 600, textDecoration: 'none', transition: 'all 0.2s'
            }}>
              <i className="fas fa-calendar-check" style={{ width: '16px', textAlign: 'center' }}></i> Ders Planı
            </Link>
          ) : (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '10px 12px', borderRadius: '8px',
              color: 'var(--text3)', opacity: 0.4, cursor: 'not-allowed',
              fontSize: '13px', fontWeight: 600
            }} title="Önce bir öğrenci seçmelisiniz">
              <i className="fas fa-calendar-check" style={{ width: '16px', textAlign: 'center' }}></i> Ders Planı
            </div>
          )}
        </nav>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '12px 18px 8px', fontSize: '10px', fontWeight: 700, color: 'var(--text3)',
            textTransform: 'uppercase', letterSpacing: '1.5px', fontFamily: 'var(--mono)'
          }}>
            Öğrenciler
            <span style={{
              background: 'rgba(0,0,0,0.3)', color: 'var(--text3)', border: '1px solid var(--border)',
              padding: '1px 7px', borderRadius: '20px', fontSize: '10px', fontFamily: 'var(--mono)'
            }}>{initialStudents.length}</span>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '0 8px' }}>
            {initialStudents.map(s => {
              const isActive = pathname.startsWith(`/student/${s.id}`);
              const avgScore = s.examResults.length > 0 
                ? (s.examResults.reduce((acc: number, e: any) => acc + e.lgsPuani, 0) / s.examResults.length) 
                : 0;

              return (
                <Link href={`/student/${s.id}`} key={s.id} style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '10px 12px', borderRadius: '9px', textDecoration: 'none',
                  background: isActive ? 'var(--accent-dim)' : 'transparent',
                  border: isActive ? '1px solid var(--accent-glow)' : '1px solid transparent',
                  marginBottom: '2px', transition: 'all 0.18s'
                }}>
                  <div style={{ width: '9px', height: '9px', borderRadius: '50%', background: s.color, flexShrink: 0 }}></div>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: isActive ? 'var(--text)' : 'var(--text2)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {s.name}
                  </span>
                  {avgScore > 0 && (
                    <span style={{ fontSize: '11px', fontWeight: 700, fontFamily: 'var(--mono)', marginLeft: 'auto', color: avgScore >= 450 ? '#3dd68c' : avgScore >= 400 ? '#84cc16' : 'var(--accent)' }}>
                      {avgScore.toFixed(2).replace('.', ',')}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          <button onClick={() => setModalOpen(true)} style={{
            margin: '4px 8px 4px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px',
            padding: '10px', borderRadius: '9px', background: 'var(--card-bg)', border: '1px dashed var(--border)',
            color: 'var(--text3)', fontSize: '12px', fontWeight: 600, fontFamily: 'var(--font)', cursor: 'pointer', width: 'calc(100% - 16px)'
          }}>
            <i className="fas fa-plus" style={{ fontSize: '10px' }}></i> Yeni Öğrenci
          </button>

          <div style={{ padding: '0 16px 20px' }}>
            <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px', fontFamily: 'var(--mono)' }}>Görünüm Seç</div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {[
                { id: 'gold', color1: '#0a0f1d', color2: '#1a2d42', name: 'Midnight' },
                { id: 'emerald', color1: '#041a1a', color2: '#10b981', name: 'Emerald' },
                { id: 'indigo', color1: '#08081a', color2: '#6366f1', name: 'Indigo' },
                { id: 'rose', color1: '#1a080c', color2: '#f43f5e', name: 'Rose' },
                { id: 'platinum', color1: '#f8fafc', color2: '#64748b', name: 'Platinum' },
                { id: 'black', color1: '#000000', color2: '#ffffff', name: 'Black' }
              ].map(t => (
                <button 
                  key={t.id} 
                  onClick={() => setTheme(t.id as any)}
                  style={{
                    width: '30px', height: '30px', borderRadius: '8px', 
                    background: `linear-gradient(135deg, ${t.color1}, ${t.color2})`,
                    border: theme === t.id ? (t.id === 'platinum' ? '2px solid #64748b' : '2px solid white') : '1px solid rgba(255,255,255,0.1)',
                    cursor: 'pointer', transform: theme === t.id ? 'scale(1.1)' : 'scale(1)',
                    transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)', 
                    boxShadow: theme === t.id ? `0 4px 12px ${t.color2}44` : 'none',
                    padding: 0
                  }}
                  title={t.name}
                />
              ))}
            </div>
          </div>
        </div>
      </aside>

      {/* Modal - Add Student */}
      {isModalOpen && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 60, background: 'rgba(0,0,0,0.65)',
          backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
        }} onClick={() => setModalOpen(false)}>
          <div className="glass-card animate-fade-up" style={{ padding: '24px', maxWidth: '420px', width: '100%' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 800 }}>Yeni Öğrenci Ekle</h3>
              <button onClick={() => setModalOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: '16px' }}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form onSubmit={handleAddStudent}>
              <label className="input-label">Öğrenci Adı</label>
              <input type="text" className="input" autoFocus required value={newStudentName} onChange={e => setNewStudentName(e.target.value)} style={{ marginBottom: '16px' }} placeholder="Adı girin…" />
              
              <label className="input-label">Giriş Şifresi (Opsiyonel)</label>
              <input type="password" className="input" value={newStudentPassword} onChange={e => setNewStudentPassword(e.target.value)} style={{ marginBottom: '16px' }} placeholder="Boş bırakırsanız '123456' olur" />

              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="button" className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setModalOpen(false)}>İptal</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>Ekle</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
