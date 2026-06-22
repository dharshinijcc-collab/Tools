'use client';

import { TriageBand, TRIAGE_CONFIG } from '@/types/scoring';
import { scoreColor } from '@/lib/score-calculator';

interface ScoreCardProps {
  overallScore: number;
  startupQualityScore?: number;
  investorReadinessScore?: number;
  triageBand: TriageBand;
  ideaText?: string;
  compact?: boolean;
  startupSummary?: string;
  whyThisScore?: string;
  biggestAssumption?: string;
  missingEvidence?: string;
  whatIncreasedTheScore?: string[];
  whatReducedTheScore?: string[];
  howToImprove?: string[];
  investorQuestions?: string[];
  highestScoringDimension?: string;
  lowestScoringDimension?: string;
  mostImportantNextAction?: string; // Kept for backwards compatibility
}

export default function ScoreCard({
  overallScore,
  startupQualityScore,
  investorReadinessScore,
  triageBand,
  ideaText,
  compact = false,
  startupSummary,
  whyThisScore,
  biggestAssumption,
  missingEvidence,
  whatIncreasedTheScore,
  whatReducedTheScore,
  howToImprove,
  investorQuestions,
  highestScoringDimension,
  lowestScoringDimension,
  mostImportantNextAction,
}: ScoreCardProps) {
  const config = TRIAGE_CONFIG[triageBand];

  const quality = startupQualityScore !== undefined ? startupQualityScore : overallScore;
  const readiness = investorReadinessScore !== undefined ? investorReadinessScore : overallScore;

  const radius = compact ? 36 : 56;
  const strokeW = compact ? 6 : 8;
  const circumference = 2 * Math.PI * radius;

  const progressQuality = (quality / 10) * circumference;
  const progressReadiness = (readiness / 10) * circumference;

  const getScoreColor = (score: number) => {
    if (score >= 7.5) return 'var(--score-green)';
    if (score >= 4.5) return 'var(--score-amber)';
    return 'var(--score-red)';
  };

  const renderCircle = (score: number, progressOffset: number, label: string) => {
    const sColor = getScoreColor(score);
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <svg
            width={(radius + strokeW) * 2}
            height={(radius + strokeW) * 2}
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
              stroke={sColor}
              strokeWidth={strokeW}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference - progressOffset}
              style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.4,0,0.2,1)' }}
            />
          </svg>
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{
              fontSize: compact ? 22 : 32,
              fontWeight: 800,
              color: sColor,
              lineHeight: 1,
            }}>{score.toFixed(1)}</span>
            <span style={{ fontSize: compact ? 9 : 11, color: 'var(--text-muted)', fontWeight: 500 }}>/10</span>
          </div>
        </div>
        <span style={{ fontSize: compact ? 11 : 13, fontWeight: 700, color: 'var(--text-primary)', textAlign: 'center' }}>
          {label}
        </span>
      </div>
    );
  };

  return (
    <div className="card animate-scaleIn" style={{
      padding: compact ? '20px 24px' : '36px 40px',
      background: 'linear-gradient(135deg, #fff 0%, #F8FAFF 100%)',
      border: '1.5px solid var(--border)',
    }}>
      {/* Top Section: Circles + Triage Band */}
      <div style={{
        display: 'flex',
        flexDirection: compact ? 'row' : 'column',
        alignItems: compact ? 'center' : 'stretch',
        gap: 28,
        width: '100%',
      }}>
        {/* Indicators container */}
        <div style={{
          display: 'flex',
          justifyContent: compact ? 'flex-start' : 'center',
          gap: compact ? 20 : 48,
          flexWrap: 'wrap',
        }}>
          {renderCircle(quality, progressQuality, 'Startup Quality')}
          {renderCircle(readiness, progressReadiness, 'Investor Readiness')}
        </div>

        {/* Info panel */}
        <div style={{ flex: 1, minWidth: 0, marginTop: compact ? 0 : 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: compact ? 'flex-start' : 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 8 }}>
            <span
              className="badge"
              style={{
                background: config.bg,
                color: config.color,
                border: `1.5px solid ${config.border}`,
                fontSize: 12,
                padding: '4px 12px',
                borderRadius: 999,
                fontWeight: 700,
              }}
            >
              📊 {triageBand}
            </span>
          </div>

          {!compact && (
            <>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>
                Overall Startup Assessment
              </h2>
              {ideaText && (
                <p style={{
                  fontSize: 13,
                  color: 'var(--text-secondary)',
                  overflow: 'hidden',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  fontStyle: 'italic',
                  lineHeight: 1.5,
                }}>
                  &quot;{ideaText}&quot;
                </p>
              )}
            </>
          )}
        </div>
      </div>

      {/* Narrative & Details Section */}
      {!compact && (
        <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div className="divider" />

          {/* Executive Summary */}
          {startupSummary && (
            <div style={{
              padding: '16px 20px',
              background: 'var(--primary-muted)',
              borderRadius: 'var(--radius)',
              border: '1px solid rgba(46,92,138,0.15)',
            }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--primary)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                💡 Executive Summary
              </h3>
              <p style={{ fontSize: 13.5, color: 'var(--text-primary)', lineHeight: 1.6, margin: 0 }}>
                {startupSummary}
              </p>
            </div>
          )}

          {/* Why This Score */}
          {whyThisScore && (
            <div>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Why This Score
              </h3>
              <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                {whyThisScore}
              </p>
            </div>
          )}

          {/* Leap of Faith Assumptions */}
          {(biggestAssumption || missingEvidence) && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
              {biggestAssumption && (
                <div style={{
                  padding: '16px 20px',
                  background: 'var(--score-amber-bg)',
                  borderRadius: 'var(--radius)',
                  border: '1.5px solid var(--score-amber-border)',
                }}>
                  <h4 style={{ fontSize: 13, fontWeight: 700, color: '#A07800', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                    ⚠️ Critical Leap-of-Faith Assumption
                  </h4>
                  <p style={{ fontSize: 13, color: '#664D00', lineHeight: 1.5, margin: 0, fontWeight: 500 }}>
                    {biggestAssumption}
                  </p>
                </div>
              )}

              {missingEvidence && (
                <div style={{
                  padding: '16px 20px',
                  background: 'var(--score-red-bg)',
                  borderRadius: 'var(--radius)',
                  border: '1.5px solid var(--score-red-border)',
                }}>
                  <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--score-red)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                    🚨 Most Critical Missing Evidence
                  </h4>
                  <p style={{ fontSize: 13, color: '#7D2217', lineHeight: 1.5, margin: 0, fontWeight: 500 }}>
                    {missingEvidence}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* What Increased & What Reduced Score lists */}
          {((whatIncreasedTheScore && whatIncreasedTheScore.length > 0) ||
            (whatReducedTheScore && whatReducedTheScore.length > 0)) && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
              {whatIncreasedTheScore && whatIncreasedTheScore.length > 0 && (
                <div>
                  <h4 style={{ fontSize: 12, fontWeight: 700, color: 'var(--score-green)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    📈 Key Strengths / Positive Drivers
                  </h4>
                  <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.6 }}>
                    {whatIncreasedTheScore.map((item, i) => (
                      <li key={i} style={{ marginBottom: 6 }}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {whatReducedTheScore && whatReducedTheScore.length > 0 && (
                <div>
                  <h4 style={{ fontSize: 12, fontWeight: 700, color: '#C0392B', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    📉 Risk Gaps / Negative Factors
                  </h4>
                  <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    {whatReducedTheScore.map((item, i) => (
                      <li key={i} style={{ marginBottom: 6 }}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Highest/Lowest scoring dimensions summary */}
          {(highestScoringDimension || lowestScoringDimension) && (
            <div style={{
              display: 'flex',
              gap: 16,
              flexWrap: 'wrap',
              padding: '12px 16px',
              background: '#F1F5F9',
              borderRadius: 'var(--radius-sm)',
            }}>
              {highestScoringDimension && (
                <div style={{ flex: 1, minWidth: 200 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Highest Dimension:</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--score-green)', marginLeft: 6 }}>{highestScoringDimension}</span>
                </div>
              )}
              {lowestScoringDimension && (
                <div style={{ flex: 1, minWidth: 200 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Lowest Dimension:</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--score-red)', marginLeft: 6 }}>{lowestScoringDimension}</span>
                </div>
              )}
            </div>
          )}

          {/* Action roadmap */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20, marginTop: 8 }}>
            {/* How to Improve */}
            {howToImprove && howToImprove.length > 0 && (
              <div style={{
                padding: '20px 24px',
                background: 'linear-gradient(135deg, #FFFDF5 0%, #FFF9E6 100%)',
                borderRadius: 'var(--radius)',
                border: '1.5px solid #FFE082',
              }}>
                <h4 style={{ fontSize: 14, fontWeight: 700, color: '#B38600', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  🎯 Recommended Improvement Roadmap
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {howToImprove.slice(0, 3).map((action, i) => (
                    <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                      <span style={{
                        width: 22,
                        height: 22,
                        borderRadius: '50%',
                        background: '#FFE899',
                        color: '#806000',
                        fontSize: 12,
                        fontWeight: 800,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}>{i + 1}</span>
                      <p style={{ fontSize: 13, color: '#5C4708', lineHeight: 1.5, margin: 0, fontWeight: 500 }}>
                        {action}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Investor Questions */}
            {investorQuestions && investorQuestions.length > 0 && (
              <div style={{
                padding: '20px 24px',
                background: 'linear-gradient(135deg, #F5F9FF 0%, #EDF4FF 100%)',
                borderRadius: 'var(--radius)',
                border: '1.5px solid #B4D3FF',
              }}>
                <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--primary)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  💬 What Investors Will Ask Next
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {investorQuestions.map((q, i) => (
                    <div key={i} style={{
                      padding: '10px 14px',
                      background: '#fff',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid rgba(46,92,138,0.15)',
                      fontSize: 12.5,
                      color: 'var(--text-primary)',
                      lineHeight: 1.4,
                      fontWeight: 500,
                      boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
                    }}>
                      &ldquo;{q}&rdquo;
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Backward compatible next action box */}
          {!howToImprove && mostImportantNextAction && (
            <div style={{
              padding: '16px 20px',
              background: 'linear-gradient(135deg, #FFF8E1 0%, #FFECB3 100%)',
              borderRadius: 'var(--radius)',
              border: '1px solid #FFE082',
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#E0A800', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Most Important Next Action
              </div>
              <p style={{ fontSize: 13, color: '#5D4037', lineHeight: 1.5, margin: 0, fontWeight: 600 }}>
                {mostImportantNextAction}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
