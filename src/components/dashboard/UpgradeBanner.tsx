import Link from 'next/link';

export default function UpgradeBanner() {
  return (
    <div style={{
      background: 'linear-gradient(135deg, #1E3F63 0%, var(--primary) 50%, #4A7AB5 100%)',
      borderRadius: 'var(--radius)',
      padding: '24px 28px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 20,
      flexWrap: 'wrap',
    }}>
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.7)', marginBottom: 4 }}>
          ✨ Trial limit reached
        </div>
        <div style={{ fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 4 }}>
          Upgrade to Pro for unlimited reports
        </div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)' }}>
          Unlock detailed analysis, risks & recommendations for every idea.
        </div>
      </div>
      <Link
        href="/account"
        id="dashboard-upgrade-btn"
        style={{
          background: '#fff',
          color: 'var(--primary)',
          fontWeight: 700,
          fontSize: 14,
          padding: '12px 24px',
          borderRadius: 8,
          textDecoration: 'none',
          flexShrink: 0,
          transition: 'transform 0.15s, box-shadow 0.15s',
          display: 'inline-block',
        }}
      >
        Upgrade to Pro →
      </Link>
    </div>
  );
}
