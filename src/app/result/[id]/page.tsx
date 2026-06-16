import { notFound } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ScoreCard from '@/components/scoring/ScoreCard';
import DimensionList from '@/components/scoring/DimensionList';
import BlurGate from '@/components/scoring/BlurGate';
import Link from 'next/link';
import { TriageBand } from '@/types/scoring';

interface ResultPageProps {
  params: Promise<{ id: string }>;
}

async function getResult(id: string) {
  // Use absolute URL for server-side fetch in App Router
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000';
  const res = await fetch(`${baseUrl}/api/results/${id}`, { cache: 'no-store' });
  if (!res.ok) return null;
  return res.json();
}

export default async function ResultPage({ params }: ResultPageProps) {
  const { id } = await params;
  const result = await getResult(id);

  if (!result) return notFound();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <main style={{ flex: 1, padding: '40px 24px 60px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          {/* Breadcrumb */}
          <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Link href="/" style={{ fontSize: 13, color: 'var(--primary)', textDecoration: 'none' }}>Home</Link>
            <span style={{ color: 'var(--text-muted)' }}>›</span>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Result</span>
          </div>

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
                <BlurGate isSignedIn={false} resultId={id} ideaText={result.idea_text} />
              </>
            )}
          </div>

          <div style={{ marginTop: 32, textAlign: 'center' }}>
            <Link href="/" className="btn btn-secondary">
              ← Score another idea
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
