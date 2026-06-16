'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import IdeaCard from '@/components/dashboard/IdeaCard';
import UpgradeBanner from '@/components/dashboard/UpgradeBanner';
import EmptyState from '@/components/dashboard/EmptyState';
import { useAuth } from '@/hooks/useAuth';
import { TriageBand } from '@/types/scoring';

interface DashboardResult {
  id: string;
  idea_text: string;
  overall_score: number;
  triage_band: TriageBand;
  unlocked: boolean;
  created_at: string;
}

export default function DashboardPage() {
  const { user, profile, loading: authLoading, trialExhausted } = useAuth();
  const [results, setResults] = useState<DashboardResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchResults() {
      try {
        const res = await fetch('/api/dashboard/results');
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        setResults(data.results ?? []);
      } catch {
        setError('Failed to load your ideas. Please refresh.');
      } finally {
        setLoading(false);
      }
    }
    fetchResults();
  }, []);

  const isMock = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder') ?? true;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <main style={{ flex: 1, padding: '40px 24px 60px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: 4 }}>
                Your Ideas
              </h1>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
                {isMock ? 'Demo mode — connect Supabase to persist your ideas' : `${profile?.plan === 'pro' ? '⭐ Pro' : 'Free'} plan · ${profile?.free_reports_used ?? 0}/2 reports used`}
              </p>
            </div>
            <Link href="/" id="new-idea-btn" className="btn btn-primary">
              + New Idea
            </Link>
          </div>

          {/* Upgrade banner */}
          {trialExhausted && !isMock && (
            <div style={{ marginBottom: 24 }}>
              <UpgradeBanner />
            </div>
          )}

          {/* Results list */}
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[...Array(3)].map((_, i) => (
                <div key={i} className="card skeleton" style={{ height: 80 }} />
              ))}
            </div>
          ) : error ? (
            <div style={{ background: 'var(--score-red-bg)', border: '1px solid var(--score-red-border)', borderRadius: 8, padding: '16px 20px', fontSize: 13, color: 'var(--score-red)' }}>
              {error}
            </div>
          ) : results.length === 0 ? (
            <EmptyState />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {results.map((r) => (
                <IdeaCard key={r.id} {...r} />
              ))}
            </div>
          )}

          {/* Mock notice */}
          {isMock && results.length === 0 && (
            <div style={{ marginTop: 20, background: 'var(--score-amber-bg)', border: '1px solid var(--score-amber-border)', borderRadius: 8, padding: '14px 18px', fontSize: 13, color: '#7A5A00' }}>
              💡 <strong>Demo mode:</strong> Score an idea on the homepage to see it appear here. Connect Supabase for persistence.
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
