'use client';

import { updateStudent } from '@/app/actions';

export default function RemoveTargetButton({ studentId }: { studentId: string }) {
  const handleRemove = async () => {
    if (confirm('Hedef lise hedefinizi tamamen kaldırmak istediğinize emin misiniz?')) {
      await updateStudent(studentId, { targetLiseName: null, targetLisePuan: null });
    }
  };

  return (
    <button 
      onClick={handleRemove}
      style={{
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.1)',
        color: 'var(--text3)',
        width: '24px',
        height: '24px',
        borderRadius: '6px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        fontSize: '11px',
        transition: 'all 0.2s'
      }}
      title="Hedefi Kaldır"
      onMouseOver={e => {
        e.currentTarget.style.background = 'rgba(240, 90, 90, 0.1)';
        e.currentTarget.style.color = 'var(--red)';
        e.currentTarget.style.borderColor = 'rgba(240, 90, 90, 0.3)';
      }}
      onMouseOut={e => {
        e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
        e.currentTarget.style.color = 'var(--text3)';
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
      }}
    >
      <i className="fas fa-times"></i>
    </button>
  );
}
