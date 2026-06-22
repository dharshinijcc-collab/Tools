'use client';

import { useState } from 'react';

interface LeadGenCardProps {
  resultId: string;
  initialNeedHelp?: boolean | null;
}

export default function LeadGenCard({ resultId, initialNeedHelp = false }: LeadGenCardProps) {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(!!initialNeedHelp);
  const [error, setError] = useState<string | null>(null);

  const handleGetHelp = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/results/${resultId}/help`, {
        method: 'POST',
      });
      if (!res.ok) {
        throw new Error('Failed to submit request');
      }
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="card animate-scaleIn"
      style={{
        padding: '24px 28px',
        background: 'linear-gradient(135deg, #1E3F63 0%, #2E5C8A 100%)',
        color: '#fff',
        borderRadius: 'var(--radius)',
        border: 'none',
        boxShadow: 'var(--shadow-md)',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ flex: 1, minWidth: 260 }}>
          <span style={{
            fontSize: 10,
            fontWeight: 800,
            background: 'rgba(255, 255, 255, 0.2)',
            padding: '2px 8px',
            borderRadius: 999,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            display: 'inline-block',
            marginBottom: 8,
          }}>
            Premium Assistance
          </span>
          <h3 style={{ fontSize: 18, fontWeight: 800, margin: 0, lineHeight: 1.3 }}>
            Need Help Building Your MVP?
          </h3>
          <p style={{ fontSize: 13.5, color: '#E2E8F0', marginTop: 6, marginBottom: 0, lineHeight: 1.5 }}>
            CrestCode provides professional design & development assistance. Partner with our team of experts to launch a high-quality product, fast.
          </p>
        </div>

        <div style={{ alignSelf: 'center' }}>
          {submitted ? (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: 'rgba(255, 255, 255, 0.15)',
              padding: '10px 18px',
              borderRadius: 'var(--radius-sm)',
              fontSize: 13.5,
              fontWeight: 700,
            }}>
              <span>✓ Request Sent</span>
            </div>
          ) : (
            <button
              onClick={handleGetHelp}
              disabled={loading}
              className="btn"
              style={{
                background: '#fff',
                color: 'var(--primary)',
                padding: '12px 24px',
                fontSize: 14.5,
                fontWeight: 700,
                borderRadius: 'var(--radius-sm)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                cursor: 'pointer',
              }}
            >
              {loading ? 'Submitting...' : 'Get Help from CrestCode →'}
            </button>
          )}
        </div>
      </div>

      {error && (
        <div style={{ fontSize: 12, color: '#EF9A9A', fontWeight: 600 }}>
          ⚠️ Error: {error}
        </div>
      )}
    </div>
  );
}
