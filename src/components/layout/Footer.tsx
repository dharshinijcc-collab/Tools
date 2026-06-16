import Link from 'next/link';

export default function Footer() {
  return (
    <footer style={{
      borderTop: '1px solid var(--border)',
      background: '#fff',
      marginTop: 'auto',
    }}>
      <div className="container-page" style={{ padding: '40px 24px', display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 24 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <div style={{
                width: 28, height: 28,
                background: 'linear-gradient(135deg, var(--primary) 0%, #5B8FBF 100%)',
                borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14, fontWeight: 800, color: '#fff'
              }}>C</div>
              <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)' }}>CrestCode</span>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', maxWidth: 260 }}>
              AI-powered startup idea scoring. Know your odds before you build.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 48, flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Product</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <Link href="/" style={{ fontSize: 13, color: 'var(--text-secondary)', textDecoration: 'none' }}>Score an Idea</Link>
                <Link href="/dashboard" style={{ fontSize: 13, color: 'var(--text-secondary)', textDecoration: 'none' }}>Dashboard</Link>
              </div>
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Account</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <Link href="/signup" style={{ fontSize: 13, color: 'var(--text-secondary)', textDecoration: 'none' }}>Sign up free</Link>
                <Link href="/login" style={{ fontSize: 13, color: 'var(--text-secondary)', textDecoration: 'none' }}>Login</Link>
                <Link href="/account" style={{ fontSize: 13, color: 'var(--text-secondary)', textDecoration: 'none' }}>Account</Link>
              </div>
            </div>
          </div>
        </div>
        <div className="divider" />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>© 2026 CrestCode. All rights reserved.</p>
          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Scores are AI-generated guidance, not investment advice.</p>
        </div>
      </div>
    </footer>
  );
}
