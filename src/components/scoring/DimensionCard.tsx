'use client';

import { DimensionDetail } from '@/types/scoring';
import { scoreColor } from '@/lib/score-calculator';

interface DimensionCardProps {
  label: string;
  icon: string;
  weight: number;
  detail: DimensionDetail;
  unlocked: boolean;
  index?: number;
}

export default function DimensionCard({ label, icon, weight, detail, unlocked, index = 0 }: DimensionCardProps) {
  const color = scoreColor(detail.score);
  const pct   = (detail.score / 10) * 100;

  return (
    <div
      className="card"
      style={{
        padding: '0',
        overflow: 'hidden',
        animation: `fadeInUp 0.4s ease ${index * 0.07}s both`,
      }}
    >
      {/* ── Header strip ───────────────────────────────────────────────── */}
      <div style={{
        padding: '18px 24px',
        background: 'linear-gradient(135deg, #fff 0%, #F8FAFF 100%)',
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          {/* Left: icon + label + weight */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{
              fontSize: 22,
              width: 40, height: 40,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: color + '15',
              borderRadius: 10,
              flexShrink: 0,
            }}>{icon}</span>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>{label}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500, marginTop: 1 }}>
                Weight: {Math.round(weight * 100)}% of overall score
              </div>
            </div>
          </div>

          {/* Right: score badge */}
          <div style={{
            textAlign: 'center',
            background: color + '12',
            border: `1.5px solid ${color}`,
            borderRadius: 12,
            padding: '6px 14px',
            minWidth: 70,
          }}>
            <div style={{ fontSize: 22, fontWeight: 800, color, lineHeight: 1 }}>{detail.score}</div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, marginTop: 2 }}>/ 10</div>
          </div>
        </div>

        {/* Score progress bar */}
        <div className="progress-track" style={{ marginBottom: 0 }}>
          <div
            className="progress-fill"
            style={{
              width: `${pct}%`,
              background: `linear-gradient(90deg, ${color}88, ${color})`,
            }}
          />
        </div>
      </div>

      {/* ── Body ───────────────────────────────────────────────────────── */}
      <div style={{ padding: '20px 24px' }}>

        {/* ── Gated content (Why This Score + Improve) ─────────────────── */}
        {unlocked ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18, animation: 'fadeIn 0.4s ease' }}>
            {/* Why This Score */}
            {detail.why_this_score && (
              <div>
                <SectionLabel text={`Why This Scored ${detail.score} / 10`} />
                <p style={{
                  fontSize: 13, color: 'var(--text-secondary)',
                  lineHeight: 1.7, margin: 0,
                  padding: '12px 14px',
                  background: '#F8FAFF',
                  borderRadius: 8,
                  borderLeft: `3px solid ${color}`,
                }}>
                  {detail.why_this_score}
                </p>
              </div>
            )}

            {/* What Increased The Score */}
            {detail.positive_signals && detail.positive_signals.length > 0 && (
              <div>
                <SectionLabel text="What Increased The Score" color="var(--score-green)" />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {detail.positive_signals.map((signal, i) => (
                    <SignalRow key={i} text={signal} type="positive" />
                  ))}
                </div>
              </div>
            )}

            {/* What Reduced The Score */}
            {detail.negative_signals && detail.negative_signals.length > 0 && (
              <div>
                <SectionLabel text="What Reduced The Score" color="var(--score-red)" />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {detail.negative_signals.map((signal, i) => (
                    <SignalRow key={i} text={signal} type="negative" />
                  ))}
                </div>
              </div>
            )}

            {/* How To Improve */}
            {detail.improvement_actions && detail.improvement_actions.length > 0 && (
              <div>
                <SectionLabel text="How To Improve This Score" color="var(--primary)" />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {detail.improvement_actions.map((action, i) => (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'flex-start', gap: 10,
                      padding: '9px 12px',
                      background: 'var(--primary-muted)',
                      borderRadius: 8,
                      border: '1px solid rgba(46,92,138,0.12)',
                    }}>
                      <span style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 700, flexShrink: 0, marginTop: 1 }}>→</span>
                      <span style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.5 }}>{action}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* ── Locked state ──────────────────────────────────────────────── */
          <div style={{ position: 'relative', marginTop: 4 }}>
            <div className="blur-content" style={{ display: 'flex', flexDirection: 'column', gap: 10, pointerEvents: 'none' }}>
              <div style={{ height: 14, background: 'var(--border)', borderRadius: 4, width: '85%' }} />
              <div style={{ height: 12, background: 'var(--border)', borderRadius: 4, width: '72%' }} />
              <div style={{ height: 12, background: 'var(--border)', borderRadius: 4, width: '90%' }} />
              <div style={{ height: 12, background: 'var(--border)', borderRadius: 4, width: '60%' }} />
            </div>
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <div style={{
                background: 'rgba(255,255,255,0.92)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                padding: '6px 14px',
                fontSize: 12, color: 'var(--text-muted)',
                fontWeight: 600,
                display: 'flex', alignItems: 'center', gap: 5,
                boxShadow: 'var(--shadow-sm)',
              }}>
                🔒 Unlock to view full analysis
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Sub-components ──────────────────────────────────────────────────────────────

function SectionLabel({ text, color = 'var(--text-muted)' }: { text: string; color?: string }) {
  return (
    <div style={{
      fontSize: 10, fontWeight: 700, color,
      textTransform: 'uppercase', letterSpacing: '0.08em',
      marginBottom: 10,
    }}>
      {text}
    </div>
  );
}

function SignalRow({ text, type }: { text: string; type: 'positive' | 'negative' }) {
  const isPositive = type === 'positive';
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: 10,
      padding: '8px 12px',
      background: isPositive ? 'rgba(46,125,50,0.05)' : 'rgba(192,57,43,0.05)',
      borderRadius: 8,
      border: `1px solid ${isPositive ? 'rgba(46,125,50,0.12)' : 'rgba(192,57,43,0.12)'}`,
    }}>
      <span style={{
        fontSize: 13,
        color: isPositive ? '#2E7D32' : '#C0392B',
        fontWeight: 700, flexShrink: 0, marginTop: 1,
      }}>
        {isPositive ? '✓' : '⚠'}
      </span>
      <span style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.5, fontWeight: 500 }}>
        {text}
      </span>
    </div>
  );
}
