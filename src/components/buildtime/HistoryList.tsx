'use client';

import { EstimationResult } from '@/types/buildtime';

interface HistoryListProps {
  estimates: EstimationResult[];
  onSelect: (estimate: EstimationResult) => void;
  onDelete: (id: string) => void;
}

export default function HistoryList({ estimates, onSelect, onDelete }: HistoryListProps) {
  return (
    <div className="card" style={{ padding: '28px 32px', animation: 'fadeIn 0.25s ease' }}>
      <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 20 }}>
        📋 Calculation History
      </h3>

      {estimates.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-secondary)' }}>
          <span style={{ fontSize: 40, display: 'block', marginBottom: 12 }}>📂</span>
          <p style={{ fontSize: 14 }}>No calculations saved yet. Build an estimate to see history.</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th style={{ paddingBottom: 12, fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Project</th>
                <th style={{ paddingBottom: 12, fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Type</th>
                <th style={{ paddingBottom: 12, fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Complexity</th>
                <th style={{ paddingBottom: 12, fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Est. Weeks</th>
                <th style={{ paddingBottom: 12, fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Created</th>
                <th style={{ paddingBottom: 12, fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {estimates.map((est) => (
                <tr key={est.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '14px 0', fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
                    {est.projectName}
                  </td>
                  <td style={{ padding: '14px 0', fontSize: 13, color: 'var(--text-secondary)' }}>
                    {est.productType}
                  </td>
                  <td style={{ padding: '14px 0' }}>
                    <span style={{
                      fontSize: 10, fontWeight: 700, borderRadius: 4, padding: '2px 8px',
                      background: est.scopeComplexity === 'Complex' ? 'var(--score-red-bg)' : est.scopeComplexity === 'Moderate' ? 'var(--score-amber-bg)' : 'var(--score-green-bg)',
                      color: est.scopeComplexity === 'Complex' ? 'var(--score-red)' : est.scopeComplexity === 'Moderate' ? 'var(--score-amber)' : 'var(--score-green)',
                    }}>
                      {est.scopeComplexity}
                    </span>
                  </td>
                  <td style={{ padding: '14px 0', fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
                    {est.timelineWeeksMin} &ndash; {est.timelineWeeksMax}
                  </td>
                  <td style={{ padding: '14px 0', fontSize: 12, color: 'var(--text-secondary)' }}>
                    {new Date(est.createdAt).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '14px 0', textAlign: 'right' }}>
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => onSelect(est)}
                      style={{ color: 'var(--primary)', fontWeight: 700, marginRight: 8 }}
                    >
                      View Report
                    </button>
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => onDelete(est.id)}
                      style={{ color: 'var(--score-red)' }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
