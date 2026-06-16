'use client';

import { EstimationResult } from '@/types/buildtime';

interface ResultsDashboardProps {
  result: EstimationResult;
  onReset: () => void;
}

export default function ResultsDashboard({ result, onReset }: ResultsDashboardProps) {
  // Confidence level colors
  const confColor = result.confidenceLevel === 'High' ? 'var(--score-green)' : result.confidenceLevel === 'Medium' ? 'var(--score-amber)' : 'var(--score-red)';
  const confBg = result.confidenceLevel === 'High' ? 'var(--score-green-bg)' : result.confidenceLevel === 'Medium' ? 'var(--score-amber-bg)' : 'var(--score-red-bg)';
  const confBorder = result.confidenceLevel === 'High' ? 'var(--score-green-border)' : result.confidenceLevel === 'Medium' ? 'var(--score-amber-border)' : 'var(--score-red-border)';

  // Scope complexity colors
  const compColor = result.scopeComplexity === 'Simple' ? 'var(--score-green)' : result.scopeComplexity === 'Moderate' ? 'var(--score-amber)' : 'var(--score-red)';
  const compBg = result.scopeComplexity === 'Simple' ? 'var(--score-green-bg)' : result.scopeComplexity === 'Moderate' ? 'var(--score-amber-bg)' : 'var(--score-red-bg)';

  const handleExportJson = () => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(result, null, 2)
    )}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute('download', `${result.projectName.toLowerCase().replace(/\s+/g, '-')}-estimate.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28, animation: 'fadeInUp 0.4s ease' }}>
      
      {/* Top Banner and Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span style={{
              fontSize: 11, fontWeight: 700, color: 'var(--primary)',
              background: 'var(--primary-muted)', borderRadius: 999,
              padding: '2px 10px', textTransform: 'uppercase', letterSpacing: '0.06em'
            }}>
              {result.productType}
            </span>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              Estimated on {new Date(result.createdAt).toLocaleDateString()}
            </span>
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            {result.projectName} &mdash; Scoping Estimate
          </h2>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn btn-secondary" onClick={handleExportJson}>
            💾 Export JSON Spec
          </button>
          <button className="btn btn-primary" onClick={onReset}>
            ⚡ Estimate New Project
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
        
        {/* Card 1: Timeline */}
        <div className="card" style={{ padding: '24px 28px', borderLeft: '5px solid var(--primary)' }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Development Timeline
          </span>
          <div style={{ fontSize: 28, fontWeight: 950, color: 'var(--text-primary)', margin: '8px 0 4px' }}>
            {result.timelineWeeksMin} &ndash; {result.timelineWeeksMax} Weeks
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
            Calendar span based on inputs.
          </p>
        </div>

        {/* Card 2: Person Weeks */}
        <div className="card" style={{ padding: '24px 28px', borderLeft: '5px solid var(--primary-light)' }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Total Effort (Volume)
          </span>
          <div style={{ fontSize: 28, fontWeight: 950, color: 'var(--text-primary)', margin: '8px 0 4px' }}>
            {result.totalPersonWeeks} Person-Weeks
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
            Approx. {result.totalPersonWeeks * 40} total development hours.
          </p>
        </div>

        {/* Card 3: Confidence Score */}
        <div className="card" style={{ padding: '24px 28px', borderLeft: `5px solid ${confColor}` }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Confidence Level
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '8px 0 4px' }}>
            <span style={{ fontSize: 28, fontWeight: 950, color: confColor }}>
              {result.confidenceLevel}
            </span>
            <span style={{
              fontSize: 12, fontWeight: 700, color: confColor, background: confBg,
              border: `1px solid ${confBorder}`, padding: '2px 8px', borderRadius: 999
            }}>
              {result.confidenceScore}%
            </span>
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
            Grows as scopes and designs finalize.
          </p>
        </div>

        {/* Card 4: Complexity Level */}
        <div className="card" style={{ padding: '24px 28px', borderLeft: `5px solid ${compColor}` }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Scope Complexity
          </span>
          <div style={{ fontSize: 28, fontWeight: 950, color: compColor, margin: '8px 0 4px' }}>
            {result.scopeComplexity}
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
            Calculated architecture size.
          </p>
        </div>
      </div>

      {/* Main Breakdown Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 24, alignItems: 'flex-start' }} className="responsive-grid">
        
        {/* Left Side: Module breakdown list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="card" style={{ padding: '28px 32px' }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 20 }}>
              📦 Module-by-Module Scoping Detail
            </h3>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    <th style={{ paddingBottom: 12, fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Module</th>
                    <th style={{ paddingBottom: 12, fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Category</th>
                    <th style={{ paddingBottom: 12, fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Complexity</th>
                    <th style={{ paddingBottom: 12, fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', textAlign: 'right' }}>Est. Hours</th>
                  </tr>
                </thead>
                <tbody>
                  {result.moduleBreakdown.map((item) => (
                    <tr key={item.moduleId} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '14px 0', fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
                        {item.moduleName}
                      </td>
                      <td style={{ padding: '14px 0', fontSize: 13, color: 'var(--text-secondary)' }}>
                        {item.category}
                      </td>
                      <td style={{ padding: '14px 0' }}>
                        <span style={{
                          fontSize: 10, fontWeight: 700, borderRadius: 4, padding: '2px 8px',
                          background: item.complexity === 'Complex' ? 'var(--score-red-bg)' : item.complexity === 'Moderate' ? 'var(--score-amber-bg)' : 'var(--score-green-bg)',
                          color: item.complexity === 'Complex' ? 'var(--score-red)' : item.complexity === 'Moderate' ? 'var(--score-amber)' : 'var(--score-green)',
                        }}>
                          {item.complexity}
                        </span>
                      </td>
                      <td style={{ padding: '14px 0', fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', textAlign: 'right' }}>
                        {item.adjustedHours} hrs
                      </td>
                    </tr>
                  ))}
                  {result.moduleBreakdown.length === 0 && (
                    <tr>
                      <td colSpan={4} style={{ padding: '24px 0', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        No feature modules selected. Estimates default to generic app base.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* MVP cuts & Phase 2 Recommendations */}
          <div className="card" style={{ padding: '28px 32px' }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 20 }}>
              ✂️ Recommended MVP Scoping Trade-offs
            </h3>

            {result.mvpCuts.length === 0 && result.phase2Features.length === 0 ? (
              <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                Your selected scope is already highly lean and optimized for a Minimum Viable Product.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {result.mvpCuts.length > 0 && (
                  <div>
                    <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--score-amber)', marginBottom: 8 }}>
                      Recommended MVP Cuts (To build faster):
                    </h4>
                    <ul style={{ paddingLeft: 18, fontSize: 13, color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {result.mvpCuts.map((cut, i) => (
                        <li key={i}>{cut}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {result.phase2Features.length > 0 && (
                  <div>
                    <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--primary)', marginBottom: 8 }}>
                      Move to Phase 2 (Suggested postponements):
                    </h4>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>
                      These features are usually best implemented after verifying primary customer demand:
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {result.phase2Features.map((feat, i) => (
                        <span key={i} style={{ fontSize: 11, fontWeight: 600, background: 'var(--primary-muted)', color: 'var(--primary)', padding: '4px 10px', borderRadius: 999 }}>
                          {feat}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Assumptions, Risks, Suggested Team */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          
          {/* Suggested Team */}
          <div className="card" style={{ padding: '24px 28px' }}>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 14 }}>
              👥 Suggested Team Composition
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {result.suggestedTeam.map((team, idx) => (
                <div key={idx} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  background: 'var(--bg-base)', border: '1px solid var(--border)',
                  padding: '8px 12px', borderRadius: 8, fontSize: 13, fontWeight: 600, color: 'var(--text-primary)'
                }}>
                  👤 {team}
                </div>
              ))}
            </div>
          </div>

          {/* Scope Risks */}
          <div className="card" style={{ padding: '24px 28px' }}>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 14 }}>
              ⚠️ Top Scope Risks & Uncertainty Factors
            </h3>
            {result.scopeRisks.length === 0 ? (
              <p style={{ fontSize: 13, color: 'var(--score-green)' }}>
                ✓ Clean roadmap. No high-risk uncertainty elements flagged!
              </p>
            ) : (
              <ul style={{ paddingLeft: 18, fontSize: 13, color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {result.scopeRisks.map((risk, idx) => (
                  <li key={idx} style={{ lineHeight: 1.4 }}>
                    <span style={{ color: 'var(--score-red)', fontWeight: 600 }}>Risk:</span> {risk}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Assumptions */}
          <div className="card" style={{ padding: '24px 28px' }}>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 14 }}>
              📋 Scoping Assumptions & Parameters
            </h3>
            <ul style={{ paddingLeft: 18, fontSize: 13, color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {result.assumptions.map((ass, idx) => (
                <li key={idx} style={{ lineHeight: 1.4 }}>{ass}</li>
              ))}
            </ul>
          </div>

          {/* Note */}
          <div style={{
            fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.4, textAlign: 'center',
            background: 'var(--primary-muted)', padding: '12px 16px', borderRadius: 8,
            border: '1px dashed rgba(46,92,138,0.3)'
          }}>
            ℹ️ <strong>Disclaimer:</strong> This calculation is an intelligence scoping estimation based on standard development sprint metrics. It is not an engineering guarantee.
          </div>
        </div>
      </div>
    </div>
  );
}
