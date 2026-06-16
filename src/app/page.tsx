import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ScoringWidget from '@/components/scoring/ScoringWidget';
import { DIMENSION_META } from '@/types/scoring';

const HOW_IT_WORKS = [
  { step: '1', title: 'Describe your idea', desc: 'Write a clear description of your startup idea — what it does, who it serves, and why now.' },
  { step: '2', title: 'AI analyzes 6 dimensions', desc: 'Our GPT-4.1 Mini model evaluates investor appeal, customer demand, timing, feasibility, moat, and founder fit.' },
  { step: '3', title: 'Get your score + breakdown', desc: 'See your weighted score, triage band, and actionable insights per dimension within seconds.' },
];

export default function HomePage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <main style={{ flex: 1 }}>
        {/* ── Hero ─────────────────────────────────────────────── */}
        <section style={{
          background: 'linear-gradient(180deg, #EEF4FB 0%, var(--bg-base) 100%)',
          padding: '72px 24px 64px',
          textAlign: 'center',
        }}>
          <div style={{ maxWidth: 700, margin: '0 auto' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: 'rgba(46,92,138,0.1)', border: '1px solid rgba(46,92,138,0.2)',
              borderRadius: 999, padding: '5px 14px', fontSize: 12, fontWeight: 600,
              color: 'var(--primary)', marginBottom: 20,
            }}>
              ⚡ AI-Powered Startup Analysis
            </div>

            <h1 style={{
              fontSize: 'clamp(32px, 6vw, 58px)',
              fontWeight: 900,
              lineHeight: 1.1,
              letterSpacing: '-0.03em',
              color: 'var(--text-primary)',
              marginBottom: 20,
            }}>
              Know your startup&apos;s odds{' '}
              <span className="text-gradient">before you build</span>
            </h1>

            <p style={{
              fontSize: 'clamp(16px, 2.5vw, 20px)',
              color: 'var(--text-secondary)',
              lineHeight: 1.6,
              marginBottom: 40,
              maxWidth: 560,
              margin: '0 auto 40px',
            }}>
              Score your startup idea across 6 investor-grade dimensions in under 60 seconds. 
              Get real analysis, not generic advice.
            </p>

            {/* Trust badges */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 20, flexWrap: 'wrap', marginBottom: 48 }}>
              {['⚡ Results in 30s', '🔒 2 free reports', '🎯 6 scoring dimensions', '📊 Weighted scoring'].map((b) => (
                <span key={b} style={{
                  fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)',
                  display: 'flex', alignItems: 'center', gap: 4,
                }}>{b}</span>
              ))}
            </div>
          </div>
        </section>

        {/* ── Scoring Widget ────────────────────────────────────── */}
        <section style={{ padding: '0 24px', marginTop: -24, marginBottom: 64 }}>
          <div style={{ maxWidth: 800, margin: '0 auto' }}>
            <ScoringWidget />
          </div>
        </section>

        {/* ── How it works ─────────────────────────────────────── */}
        <section id="how-it-works" style={{ background: '#fff', padding: '80px 24px' }}>
          <div className="container-page">
            <div style={{ textAlign: 'center', marginBottom: 48 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>
                How it works
              </div>
              <h2 style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                From idea to insight in seconds
              </h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24 }}>
              {HOW_IT_WORKS.map((s) => (
                <div key={s.step} className="card" style={{ padding: '28px 24px', textAlign: 'center' }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--primary) 0%, #5B8FBF 100%)',
                    color: '#fff', fontSize: 20, fontWeight: 800,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 16px',
                  }}>{s.step}</div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>{s.title}</h3>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Dimension explainer ───────────────────────────────── */}
        <section style={{ padding: '80px 24px', background: 'var(--bg-base)' }}>
          <div className="container-page">
            <div style={{ textAlign: 'center', marginBottom: 48 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>
                The 6 dimensions
              </div>
              <h2 style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                What we evaluate
              </h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 18 }}>
              {DIMENSION_META.map((dim) => (
                <div key={dim.key} className="card card-hover" style={{ padding: '22px 24px', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                  <span style={{ fontSize: 24, flexShrink: 0 }}>{dim.icon}</span>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>{dim.label}</span>
                      <span style={{
                        fontSize: 10, fontWeight: 700, color: 'var(--primary)',
                        background: 'var(--primary-muted)', borderRadius: 999,
                        padding: '1px 7px',
                      }}>{Math.round(dim.weight * 100)}%</span>
                    </div>
                    <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                      {getDimensionDesc(dim.key)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

function getDimensionDesc(key: string): string {
  const descs: Record<string, string> = {
    investor_appeal: 'VC fundability, addressable market size, and long-term defensibility of the business model.',
    customer_demand: 'Pain severity, willingness to pay, and evidence of existing demand for a solution.',
    market_timing: 'Tailwinds, regulatory environment, trend alignment, and why now is the right moment.',
    technical_feasibility: 'Buildability with current tech, complexity, team requirements, and time to MVP.',
    competitive_moat: 'Barriers to entry, network effects, switching costs, and differentiation from alternatives.',
    founder_market_fit: 'Domain expertise, credibility, distribution edge, and execution capability of the founders.',
  };
  return descs[key] ?? '';
}
