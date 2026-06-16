'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ScoreCard from '@/components/scoring/ScoreCard';
import DimensionList from '@/components/scoring/DimensionList';
import BlurGate from '@/components/scoring/BlurGate';
import SkeletonResult from '@/components/scoring/SkeletonResult';
import { useAuth } from '@/hooks/useAuth';
import { TriageBand, ResultDetailResponse } from '@/types/scoring';

export default function DashboardResultPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [result, setResult] = useState<ResultDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    async function fetch_() {
      const res = await fetch(`/api/results/${id}`);
      if (!res.ok) { setError('Result not found.'); setLoading(false); return; }
      setResult(await res.json());
      setLoading(false);
    }
    fetch_();
  }, [id]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <main style={{ flex: 1, padding: '40px 24px 60px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          {/* Breadcrumb */}
          <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Link href="/dashboard" style={{ fontSize: 13, color: 'var(--primary)', textDecoration: 'none' }}>Dashboard</Link>
            <span style={{ color: 'var(--text-muted)' }}>›</span>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Report</span>
          </div>

          {loading ? (
            <SkeletonResult />
          ) : error ? (
            <div style={{ background: 'var(--score-red-bg)', border: '1px solid var(--score-red-border)', borderRadius: 8, padding: '20px 24px', textAlign: 'center' }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>😕</div>
              <div style={{ fontSize: 14, color: 'var(--score-red)', fontWeight: 600 }}>{error}</div>
              <Link href="/dashboard" className="btn btn-secondary" style={{ marginTop: 16 }}>Back to Dashboard</Link>
            </div>
          ) : result && (
            <>
              <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8, letterSpacing: '-0.02em' }}>
                Idea Analysis Report
              </h1>
              {result.idea_text && (
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 28, fontStyle: 'italic' }}>
                  &quot;{result.idea_text.slice(0, 160)}{result.idea_text.length > 160 ? '…' : ''}&quot;
                </p>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <ScoreCard
                  overallScore={result.overall_score}
                  triageBand={result.triage_band as TriageBand}
                  ideaText={result.idea_text}
                />

                {result.unlocked ? (
                  <DimensionList dimensions={result.dimensions} unlocked={true} />
                ) : (
                  <>
                    <DimensionList dimensions={result.dimensions} unlocked={false} />
                    <BlurGate isSignedIn={!!user} resultId={id} ideaText={result.idea_text} />
                  </>
                )}
              </div>

              <div style={{ marginTop: 32, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <Link href="/dashboard" className="btn btn-secondary">← Back to Dashboard</Link>
                <Link href="/" className="btn btn-outline">Score another idea</Link>
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
