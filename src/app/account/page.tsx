'use client';

import { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';

export default function AccountPage() {
  const { user, profile, loading, isPro, freeReportsUsed, upgradeToPro, signOut } = useAuth();
  const [upgrading, setUpgrading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isMock = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder') ?? true;

  const handleUpgrade = async () => {
    setUpgrading(true);
    setError(null);
    try {
      const ok = await upgradeToPro();
      if (ok) {
        setSuccess(true);
      } else {
        setError('Upgrade failed. Please make sure you are signed in.');
      }
    } catch (err) {
      setError('An error occurred during upgrade. Please try again.');
    } finally {
      setUpgrading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <main style={{ flex: 1, padding: '56px 24px 80px' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h1 className="text-gradient-hero" style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 12 }}>
              Simple, transparent pricing
            </h1>
            <p style={{ fontSize: 'clamp(15px, 2vw, 17px)', color: 'var(--text-secondary)', maxWidth: 500, margin: '0 auto' }}>
              Unlock investor-grade analysis and detailed breakdowns for all your startup ideas.
            </p>
          </div>

          {/* Success Banner */}
          {success && (
            <div className="animate-scaleIn" style={{
              background: 'var(--score-green-bg)',
              border: '1.5px solid var(--score-green-border)',
              borderRadius: 'var(--radius)',
              padding: '20px 24px',
              marginBottom: 32,
              textAlign: 'center',
            }}>
              <span style={{ fontSize: 32, display: 'block', marginBottom: 8 }}>🎉</span>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--score-green)', marginBottom: 4 }}>
                Successfully upgraded to Pro!
              </h3>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 16 }}>
                You now have unlimited detailed reports. Go check your results in the dashboard.
              </p>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                <Link href="/dashboard" className="btn btn-primary btn-sm">Go to Dashboard</Link>
                <button onClick={() => setSuccess(false)} className="btn btn-ghost btn-sm">Dismiss</button>
              </div>
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div style={{
              background: 'var(--score-red-bg)',
              border: '1.5px solid var(--score-red-border)',
              borderRadius: 'var(--radius)',
              padding: '16px 20px',
              marginBottom: 32,
              color: 'var(--score-red)',
              fontSize: 14,
              fontWeight: 500,
            }}>
              ⚠️ {error}
            </div>
          )}

          {/* Pricing cards grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 32,
            alignItems: 'stretch',
            marginBottom: 56,
          }}>
            {/* Free Plan */}
            <div className="card" style={{
              padding: '40px 32px',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
            }}>
              {!isPro && user && (
                <span className="badge" style={{
                  position: 'absolute', top: 20, right: 20,
                  background: 'var(--primary-muted)', color: 'var(--primary)',
                }}>
                  Current Plan
                </span>
              )}
              <h3 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
                Free Trial
              </h3>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 24 }}>
                Perfect for testing out your first few startup concepts.
              </p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 32 }}>
                <span style={{ fontSize: 36, fontWeight: 800, color: 'var(--text-primary)' }}>$0</span>
                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>/ forever</span>
              </div>

              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 40, flex: 1 }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13.5, color: 'var(--text-secondary)' }}>
                  <span style={{ color: 'var(--score-green)', fontWeight: 'bold' }}>✓</span> 2 free startup scoring reports
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13.5, color: 'var(--text-secondary)' }}>
                  <span style={{ color: 'var(--score-green)', fontWeight: 'bold' }}>✓</span> Evaluation across 6 core dimensions
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13.5, color: 'var(--text-secondary)' }}>
                  <span style={{ color: 'var(--score-green)', fontWeight: 'bold' }}>✓</span> Overall weighted score & band
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13.5, color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                  ✗ Detailed reason, risk, & recommendation
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13.5, color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                  ✗ Unlimited report generations
                </li>
              </ul>

              {user ? (
                <button disabled className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>
                  {isPro ? 'Included in Pro' : 'Current Plan'}
                </button>
              ) : (
                <Link href="/signup" className="btn btn-outline" style={{ width: '100%', justifyContent: 'center' }}>
                  Sign up free
                </Link>
              )}
            </div>

            {/* Pro Plan */}
            <div className="card card-interactive" style={{
              padding: '40px 32px',
              display: 'flex',
              flexDirection: 'column',
              border: '2px solid var(--primary)',
              boxShadow: 'var(--shadow-md)',
              position: 'relative',
              background: 'linear-gradient(180deg, #FFFFFF 0%, #FAFCFF 100%)',
            }}>
              <span className="badge" style={{
                position: 'absolute', top: 20, right: 20,
                background: 'var(--primary)', color: '#fff',
              }}>
                Popular
              </span>
              {isPro && (
                <span className="badge" style={{
                  position: 'absolute', top: 20, right: 90,
                  background: 'var(--score-green-bg)', color: 'var(--score-green)',
                  border: '1px solid var(--score-green-border)',
                }}>
                  Active
                </span>
              )}
              <h3 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
                Pro Plan
              </h3>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 24 }}>
                For active builders, serial founders, and startup researchers.
              </p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 32 }}>
                <span style={{ fontSize: 36, fontWeight: 800, color: 'var(--text-primary)' }}>$19</span>
                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>/ month</span>
              </div>

              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 40, flex: 1 }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13.5, color: 'var(--text-secondary)' }}>
                  <span style={{ color: 'var(--score-green)', fontWeight: 'bold' }}>✓</span> <strong>Unlimited</strong> idea scoring reports
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13.5, color: 'var(--text-secondary)' }}>
                  <span style={{ color: 'var(--score-green)', fontWeight: 'bold' }}>✓</span> <strong>Unlock detailed analysis</strong> for all dimensions
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13.5, color: 'var(--text-secondary)' }}>
                  <span style={{ color: 'var(--score-green)', fontWeight: 'bold' }}>✓</span> Deep-dive recommendations and risks
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13.5, color: 'var(--text-secondary)' }}>
                  <span style={{ color: 'var(--score-green)', fontWeight: 'bold' }}>✓</span> Save all historical ideas to dashboard
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13.5, color: 'var(--text-secondary)' }}>
                  <span style={{ color: 'var(--score-green)', fontWeight: 'bold' }}>✓</span> Priority processing queue
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13.5, color: 'var(--text-secondary)' }}>
                  <span style={{ color: 'var(--score-green)', fontWeight: 'bold' }}>✓</span> <strong>Export reports</strong> to PDF / Pitch Deck formats
                </li>
              </ul>

              {isPro ? (
                <button disabled className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>
                  ⭐ Active Subscription
                </button>
              ) : (
                <button
                  onClick={handleUpgrade}
                  disabled={upgrading}
                  className="btn btn-primary"
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  {upgrading ? 'Upgrading…' : 'Upgrade to Pro'}
                </button>
              )}
            </div>
          </div>

          {/* Account Details Section */}
          {user && (
            <div className="card" style={{ padding: '32px', background: '#fff' }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 20 }}>
                Account Settings
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: 12, flexWrap: 'wrap', gap: 8 }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)' }}>Email Address</span>
                  <span style={{ fontSize: 14, color: 'var(--text-primary)' }}>{user.email}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: 12, flexWrap: 'wrap', gap: 8 }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)' }}>Subscription Plan</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: isPro ? 'var(--primary)' : 'var(--text-secondary)' }}>
                    {isPro ? '⭐ Pro Plan' : 'Free Trial'}
                  </span>
                </div>
                {!isPro && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: 12, flexWrap: 'wrap', gap: 8 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)' }}>Free Reports Scored</span>
                    <span style={{ fontSize: 14, color: 'var(--text-primary)' }}>{freeReportsUsed} / 2 used</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: 12, flexWrap: 'wrap', gap: 8 }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)' }}>Authentication Mode</span>
                  <span style={{ fontSize: 14, color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                    {isMock ? 'Demo (Mock Local Store)' : 'Production (Supabase)'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
                  <button onClick={signOut} className="btn btn-outline btn-sm" style={{ color: 'var(--score-red)', borderColor: 'var(--score-red)' }}>
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
