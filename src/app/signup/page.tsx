'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useAuth } from '@/hooks/useAuth';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const { mockSignup } = useAuth();

  const isMock = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder') ?? true;

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (isMock) {
      // Mock signup flow
      await new Promise(r => setTimeout(r, 800));
      mockSignup(email);
      setSuccess(true);
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/api/auth/callback`,
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    // Merge anon trial if exists
    const anonSessionId = localStorage.getItem('crestcode_anon_session_id');
    if (anonSessionId) {
      await fetch('/api/auth/merge-trial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ anon_session_id: anonSessionId }),
      });
    }

    setSuccess(true);
    setLoading(false);
  };

  const handleGoogleSignup = async () => {
    if (isMock) {
      setError('Google OAuth requires Supabase configuration. See .env.example for setup instructions.');
      return;
    }
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/api/auth/callback` },
    });
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
        <div style={{ width: '100%', maxWidth: 420 }}>
          <div className="card" style={{ padding: '40px 36px' }}>
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <div style={{
                width: 48, height: 48, borderRadius: 12,
                background: 'linear-gradient(135deg, var(--primary) 0%, #5B8FBF 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 24, fontWeight: 800, color: '#fff',
                margin: '0 auto 16px',
              }}>C</div>
              <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 6 }}>
                Create your account
              </h1>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                Get 2 free detailed idea reports
              </p>
            </div>

            {success ? (
              <div style={{
                background: 'var(--score-green-bg)', border: '1px solid var(--score-green-border)',
                borderRadius: 8, padding: '16px 20px', textAlign: 'center',
              }}>
                <div style={{ fontSize: 24, marginBottom: 8 }}>✉️</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--score-green)', marginBottom: 4 }}>
                  {isMock ? 'Mock signup successful!' : 'Check your email!'}
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>
                  {isMock ? 'In production, a confirmation email would be sent.' : 'Click the confirmation link to activate your account.'}
                </div>
                {isMock && (
                  <Link href="/dashboard" className="btn btn-primary btn-sm">Go to Dashboard →</Link>
                )}
              </div>
            ) : (
              <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {/* Google OAuth */}
                <button
                  type="button"
                  onClick={handleGoogleSignup}
                  id="signup-google-btn"
                  style={{
                    width: '100%', padding: '12px 16px',
                    border: '1.5px solid var(--border-strong)', borderRadius: 8,
                    background: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 600,
                    color: 'var(--text-primary)', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', gap: 8, transition: 'background 0.15s',
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div className="divider" style={{ flex: 1 }} />
                  <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>or</span>
                  <div className="divider" style={{ flex: 1 }} />
                </div>

                <div>
                  <label htmlFor="signup-email" style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: 6 }}>Email</label>
                  <input
                    id="signup-email"
                    type="email"
                    className="input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    disabled={loading}
                  />
                </div>
                <div>
                  <label htmlFor="signup-password" style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: 6 }}>Password</label>
                  <input
                    id="signup-password"
                    type="password"
                    className="input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    required
                    minLength={6}
                    disabled={loading}
                  />
                </div>

                {error && (
                  <div style={{ background: 'var(--score-red-bg)', border: '1px solid var(--score-red-border)', borderRadius: 6, padding: '10px 14px', fontSize: 13, color: 'var(--score-red)' }}>
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  id="signup-submit-btn"
                  className="btn btn-primary"
                  disabled={loading}
                  style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}
                >
                  {loading ? 'Creating account…' : 'Create free account'}
                </button>
              </form>
            )}

            {!success && (
              <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-muted)', marginTop: 20 }}>
                Already have an account?{' '}
                <Link href="/login" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>
                  Log in
                </Link>
              </p>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
