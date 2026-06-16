'use client';

import Link from 'next/link';
import { TriageBand, TRIAGE_CONFIG } from '@/types/scoring';
import { scoreColor } from '@/lib/score-calculator';

interface IdeaCardProps {
  id: string;
  idea_text: string;
  overall_score: number;
  triage_band: TriageBand;
  unlocked: boolean;
  created_at: string;
}

export default function IdeaCard({ id, idea_text, overall_score, triage_band, unlocked, created_at }: IdeaCardProps) {
  const config = TRIAGE_CONFIG[triage_band];
  const color = scoreColor(overall_score);
  const date = new Date(created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <Link href={`/dashboard/${id}`} style={{ textDecoration: 'none' }}>
      <div className="card card-interactive" style={{ padding: '18px 22px', display: 'flex', alignItems: 'center', gap: 16 }}>
        {/* Score badge */}
        <div style={{
          width: 52, height: 52, borderRadius: '50%',
          background: color + '15',
          border: `2.5px solid ${color}`,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <span style={{ fontSize: 18, fontWeight: 800, color, lineHeight: 1 }}>{overall_score}</span>
          <span style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 500 }}>/10</span>
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{
            fontSize: 14, fontWeight: 500, color: 'var(--text-primary)',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            marginBottom: 6,
          }}>
            {idea_text}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{
              fontSize: 11, fontWeight: 600, padding: '2px 8px',
              borderRadius: 999, border: `1px solid ${config.border}`,
              background: config.bg, color: config.color,
            }}>
              {triage_band}
            </span>
            {!unlocked && (
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>🔒 Locked</span>
            )}
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{date}</span>
          </div>
        </div>

        {/* Arrow */}
        <span style={{ color: 'var(--text-muted)', fontSize: 18, flexShrink: 0 }}>›</span>
      </div>
    </Link>
  );
}
