'use client';

import Link from 'next/link';

interface BlurGateProps {
  isSignedIn: boolean;
  resultId?: string;
  ideaText?: string;
}

export default function BlurGate({ isSignedIn, resultId, ideaText }: BlurGateProps) {
  const signupHref = resultId
    ? `/signup?result=${resultId}${ideaText ? `&idea=${encodeURIComponent(ideaText.slice(0, 100))}` : ''}`
    : '/signup';

  return (
    <div style={{ position: 'relative', marginTop: 32 }}>
      {/* Blurred content placeholder */}
      <div className="blur-content card" style={{ padding: '28px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ height: 16, background: 'var(--border)', borderRadius: 4, width: '70%' }} />
        <div style={{ height: 14, background: 'var(--border)', borderRadius: 4, width: '90%' }} />
        <div style={{ height: 14, background: 'var(--border)', borderRadius: 4, width: '80%' }} />
        <div style={{ height: 14, background: 'var(--border)', borderRadius: 4, width: '60%' }} />
        <div style={{ height: 14, background: 'var(--border)', borderRadius: 4, width: '85%' }} />
      </div>

      {/* Overlay CTA */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(180deg, rgba(247,248,250,0) 0%, rgba(247,248,250,0.95) 100%)',
        borderRadius: 'var(--radius)',
      }}>
        <div style={{
          background: '#fff',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          padding: '28px 36px',
          textAlign: 'center',
          boxShadow: 'var(--shadow-lg)',
          maxWidth: 360,
          width: '100%',
        }}>
          {!isSignedIn ? (
            <>
              <div style={{ fontSize: 32, marginBottom: 12 }}>🔓</div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
                Unlock the full breakdown
              </h3>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 20, lineHeight: 1.55 }}>
                Get detailed analysis, risks, and recommendations for each dimension — free for your first 2 ideas.
              </p>
              <Link href={signupHref} id="blur-gate-signup-btn" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', borderRadius: 8 }}>
                Sign up free — it takes 30 seconds
              </Link>
              <div style={{ marginTop: 12 }}>
                <Link href="/login" style={{ fontSize: 13, color: 'var(--primary)', textDecoration: 'none' }}>
                  Already have an account? Log in
                </Link>
              </div>
            </>
          ) : (
            <>
              <div style={{ fontSize: 32, marginBottom: 12 }}>⭐</div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
                Upgrade to view
              </h3>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 20, lineHeight: 1.55 }}>
                You&apos;ve used your 2 free detailed reports. Upgrade to Pro for unlimited analysis.
              </p>
              <Link href="/account" id="blur-gate-upgrade-btn" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', borderRadius: 8 }}>
                Upgrade to Pro
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
