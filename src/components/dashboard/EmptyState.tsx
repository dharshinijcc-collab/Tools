import Link from 'next/link';

export default function EmptyState() {
  return (
    <div style={{
      textAlign: 'center',
      padding: '60px 24px',
      background: '#fff',
      borderRadius: 'var(--radius)',
      border: '1px dashed var(--border-strong)',
    }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>💡</div>
      <h3 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
        No ideas scored yet
      </h3>
      <p style={{ fontSize: 14, color: 'var(--text-secondary)', maxWidth: 320, margin: '0 auto 24px' }}>
        Head back to the homepage and score your first startup idea. It only takes 30 seconds.
      </p>
      <Link href="/" id="empty-state-cta-btn" className="btn btn-primary">
        Score your first idea
      </Link>
    </div>
  );
}
