'use client';

import { TriageBand, TRIAGE_CONFIG } from '@/types/scoring';
import { scoreColor } from '@/lib/score-calculator';

interface ScoreCardProps {
  overallScore: number;
  triageBand: TriageBand;
  ideaText?: string;
  compact?: boolean;
}

export default function ScoreCard({ overallScore, triageBand, ideaText, compact = false }: ScoreCardProps) {
  const config = TRIAGE_CONFIG[triageBand];
  const radius = compact ? 44 : 60;
  const strokeW = compact ? 7 : 9;
  const circumference = 2 * Math.PI * radius;
  const progress = (overallScore / 10) * circumference;

  return (
    <div className="card animate-scaleIn" style={{
      padding: compact ? '20px 24px' : '32px 36px',
      display: 'flex',
      flexDirection: compact ? 'row' : 'column',
      alignItems: 'center',
      gap: compact ? 24 : 20,
      background: 'linear-gradient(135deg, #fff 0%, #F8FAFF 100%)',
    }}>
      {/* Score circle */}
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <svg
          width={compact ? (radius + strokeW) * 2 : (radius + strokeW) * 2}
          height={compact ? (radius + strokeW) * 2 : (radius + strokeW) * 2}
          style={{ transform: 'rotate(-90deg)' }}
        >
          {/* Track */}
          <circle
            cx={radius + strokeW}
            cy={radius + strokeW}
            r={radius}
            fill="none"
            stroke="var(--border)"
            strokeWidth={strokeW}
          />
          {/* Progress */}
          <circle
            cx={radius + strokeW}
            cy={radius + strokeW}
            r={radius}
            fill="none"
            stroke={config.color}
            strokeWidth={strokeW}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference - progress}
            style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.4,0,0.2,1)' }}
          />
        </svg>
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{
            fontSize: compact ? 26 : 38,
            fontWeight: 800,
            color: config.color,
            lineHeight: 1,
          }}>{overallScore}</span>
          <span style={{ fontSize: compact ? 10 : 12, color: 'var(--text-muted)', fontWeight: 500 }}>/10</span>
        </div>
      </div>

      {/* Band + text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <span
          className="badge band-pill"
          style={{
            background: config.bg,
            color: config.color,
            border: `1px solid ${config.border}`,
            fontSize: compact ? 12 : 13,
            padding: compact ? '4px 10px' : '5px 14px',
            borderRadius: 999,
            fontWeight: 600,
            display: 'inline-block',
            marginBottom: compact ? 4 : 8,
          }}
        >
          {triageBand}
        </span>

        {!compact && (
          <>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
              Overall Score
            </h2>
            {ideaText && (
              <p style={{
                fontSize: 13, color: 'var(--text-secondary)',
                overflow: 'hidden', display: '-webkit-box',
                WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
              }}>
                &quot;{ideaText}&quot;
              </p>
            )}
          </>
        )}
        {compact && (
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
            Overall Score
          </div>
        )}
      </div>
    </div>
  );
}
