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
  const pct = (detail.score / 10) * 100;
  const hasGatedContent = detail.reason && detail.reason.length > 0;

  return (
    <div
      className="card"
      style={{
        padding: '20px 24px',
        animation: `fadeInUp 0.4s ease ${index * 0.07}s both`,
      }}
    >
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 20 }}>{icon}</span>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{label}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>
              Weight: {Math.round(weight * 100)}%
            </div>
          </div>
        </div>
        <div style={{
          width: 44, height: 44, borderRadius: '50%',
          background: color + '18',
          border: `2px solid ${color}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <span style={{ fontSize: 17, fontWeight: 800, color }}>{detail.score}</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="progress-track" style={{ marginBottom: 14 }}>
        <div
          className="progress-fill"
          style={{
            width: `${pct}%`,
            background: `linear-gradient(90deg, ${color}99, ${color})`,
          }}
        />
      </div>

      {/* Teaser — always visible */}
      <p style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500, marginBottom: unlocked && hasGatedContent ? 14 : 0 }}>
        {detail.teaser}
      </p>

      {/* Gated content */}
      {unlocked && hasGatedContent ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, animation: 'fadeIn 0.4s ease' }}>
          <div className="divider" />
          <DetailRow icon="📋" label="Analysis" text={detail.reason} />
          <DetailRow icon="⚠️" label="Risk" text={detail.risk} />
          <DetailRow icon="💡" label="Recommendation" text={detail.recommendation} />
        </div>
      ) : !unlocked && (
        <div style={{ position: 'relative', marginTop: 14 }}>
          {/* Blurred placeholder content */}
          <div className="blur-content" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt labore.
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              Risk: Dolor sit amet consectetur adipiscing elit sed eiusmod tempor.
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              Recommendation: Adipiscing elit sed do eiusmod tempor incididunt.
            </div>
          </div>
          {/* Lock indicator */}
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{
              background: 'rgba(255,255,255,0.85)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              padding: '5px 12px',
              fontSize: 12,
              color: 'var(--text-muted)',
              fontWeight: 600,
              display: 'flex', alignItems: 'center', gap: 5,
            }}>
              🔒 Unlock to view details
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DetailRow({ icon, label, text }: { icon: string; label: string; text: string }) {
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
      <span style={{ fontSize: 14, flexShrink: 0 }}>{icon}</span>
      <div>
        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 2 }}>
          {label}
        </span>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.55 }}>{text}</p>
      </div>
    </div>
  );
}
