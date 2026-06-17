'use client';

import { TriageBand, TRIAGE_CONFIG } from '@/types/scoring';
import { scoreColor } from '@/lib/score-calculator';

interface ScoreCardProps {
  overallScore: number;
  triageBand: TriageBand;
  ideaText?: string;
  compact?: boolean;
  startupSummary?: string;
  keyStrengths?: string[];
  topRisks?: string[];
  highestScoringDimension?: string;
  lowestScoringDimension?: string;
  mostImportantNextAction?: string;
}

export default function ScoreCard({ overallScore, triageBand, ideaText, compact = false, startupSummary, keyStrengths, topRisks, highestScoringDimension, lowestScoringDimension, mostImportantNextAction }: ScoreCardProps) {
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
              Overall Startup Assessment
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

            {/* Startup Summary */}
            {startupSummary && (
              <div style={{ marginTop: 16, padding: '12px 16px', background: 'var(--primary-muted)', borderRadius: 8, border: '1px solid var(--border)' }}>
                <p style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.5, margin: 0 }}>
                  <strong style={{ color: 'var(--primary)' }}>Executive Summary:</strong> {startupSummary}
                </p>
              </div>
            )}

            {/* Key Strengths */}
            {keyStrengths && keyStrengths.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Key Strengths
                </div>
                <ul style={{ margin: 0, paddingLeft: 20, fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.6 }}>
                  {keyStrengths.map((strength, i) => (
                    <li key={i} style={{ marginBottom: 4 }}>{strength}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Top Risks */}
            {topRisks && topRisks.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Top Risks
                </div>
                <ul style={{ margin: 0, paddingLeft: 20, fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  {topRisks.map((risk, i) => (
                    <li key={i} style={{ marginBottom: 4 }}>{risk}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Dimension Highlights */}
            {(highestScoringDimension || lowestScoringDimension) && (
              <div style={{ marginTop: 16, display: 'flex', gap: 16 }}>
                {highestScoringDimension && (
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      Highest Scoring
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--score-green)' }}>
                      {highestScoringDimension}
                    </div>
                  </div>
                )}
                {lowestScoringDimension && (
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      Lowest Scoring
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--score-red)' }}>
                      {lowestScoringDimension}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Most Important Next Action */}
            {mostImportantNextAction && (
              <div style={{ marginTop: 16, padding: '12px 16px', background: 'linear-gradient(135deg, #FFF8E1 0%, #FFECB3 100%)', borderRadius: 8, border: '1px solid #FFE082' }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#E0A800', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Most Important Next Action
                </div>
                <p style={{ fontSize: 13, color: '#5D4037', lineHeight: 1.5, margin: 0, fontWeight: 500 }}>
                  {mostImportantNextAction}
                </p>
              </div>
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
