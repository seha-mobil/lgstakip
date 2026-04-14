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
      await addStudent(newStudentName.trim());
      setNewStudentName('');
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
              const lastExam = s.examResults?.[s.examResults.length - 1];
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
                  {lastExam && (
                    <span style={{ fontSize: '11px', fontWeight: 700, fontFamily: 'var(--mono)', marginLeft: 'auto', color: lastExam.lgsPuani >= 450 ? '#3dd68c' : lastExam.lgsPuani >= 400 ? '#84cc16' : 'var(--accent)' }}>
                      {lastExam.lgsPuani.toFixed(2)}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          <button onClick={() => setModalOpen(true)} style={{
            margin: '4px 8px 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px',
            padding: '10px', borderRadius: '9px', background: 'var(--card-bg)', border: '1px dashed var(--border)',
            color: 'var(--text3)', fontSize: '12px', fontWeight: 600, fontFamily: 'var(--font)', cursor: 'pointer'
          }}>
            <i className="fas fa-plus" style={{ fontSize: '10px' }}></i> Yeni Öğrenci
          </button>

          <div style={{ padding: '0 16px 20px' }}>
            <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px', fontFamily: 'var(--mono)' }}>Görünüm Seç</div>
            <div style={{ display: 'flex', gap: '10px' }}>
              {[
                { id: 'gold', color1: '#e8b84b', color2: '#151e32' },
                { id: 'emerald', color1: '#10b981', color2: '#064e3b' },
                { id: 'indigo', color1: '#6366f1', color2: '#1e1b4b' },
                { id: 'rose', color1: '#f43f5e', color2: '#4c0519' }
              ].map(t => (
                <button 
                  key={t.id} 
                  onClick={() => setTheme(t.id as any)}
                  style={{
                    width: '32px', height: '32px', borderRadius: '10px', 
                    background: `linear-gradient(135deg, ${t.color1}, ${t.color2})`,
                    border: theme === t.id ? '2px solid white' : '1px solid rgba(255,255,255,0.1)',
                    cursor: 'pointer', transform: theme === t.id ? 'scale(1.15)' : 'scale(1)',
                    transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)', 
                    boxShadow: theme === t.id ? `0 6px 15px ${t.color1}44` : 'none',
                    padding: 0
                  }}
                  title={t.id.charAt(0).toUpperCase() + t.id.slice(1)}
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
