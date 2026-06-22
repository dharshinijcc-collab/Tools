'use client';

import { useState } from 'react';

interface OutcomeSurveyProps {
  resultId: string;
}

export default function OutcomeSurvey({ resultId }: OutcomeSurveyProps) {
  const [expanded, setExpanded] = useState(false);
  const [launched, setLaunched] = useState(false);
  const [gotFirstUsers, setGotFirstUsers] = useState(false);
  const [payingCustomers, setPayingCustomers] = useState(false);
  const [monthlyRevenue, setMonthlyRevenue] = useState('');
  const [raisedFunding, setRaisedFunding] = useState(false);
  const [shutDown, setShutDown] = useState(false);

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/results/${resultId}/outcome`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          launched,
          got_first_users: gotFirstUsers,
          paying_customers: payingCustomers,
          monthly_revenue: payingCustomers ? (Number(monthlyRevenue) || 0) : 0,
          raised_funding: raisedFunding,
          shut_down: shutDown,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to submit survey');
      }

      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderRadioToggle = (
    label: string,
    value: boolean,
    onChange: (v: boolean) => void
  ) => {
    return (
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
        <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-primary)' }}>{label}</span>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            type="button"
            onClick={() => onChange(true)}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-sm)',
              border: `1.5px solid ${value ? 'var(--primary)' : 'var(--border)'}`,
              background: value ? 'var(--primary-muted)' : '#fff',
              color: 'var(--text-primary)',
              fontSize: 12.5,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Yes
          </button>
          <button
            type="button"
            onClick={() => onChange(false)}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-sm)',
              border: `1.5px solid ${!value ? 'var(--primary)' : 'var(--border)'}`,
              background: !value ? 'var(--primary-muted)' : '#fff',
              color: 'var(--text-primary)',
              fontSize: 12.5,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            No
          </button>
        </div>
      </div>
    );
  };

  return (
    <div
      className="card animate-scaleIn"
      style={{
        padding: '24px 28px',
        background: '#fff',
        border: '1.5px solid var(--border)',
        borderRadius: 'var(--radius)',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        marginTop: 12,
      }}
    >
      {!expanded ? (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ flex: 1, minWidth: 260 }}>
            <h4 style={{ fontSize: 15, fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
              📈 Help validate our scoring model!
            </h4>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
              Where is your startup today? Take the 1-minute Outcome Survey.
            </p>
          </div>
          <button
            onClick={() => setExpanded(true)}
            className="btn btn-secondary btn-sm"
            style={{ fontWeight: 700 }}
          >
            Take Survey
          </button>
        </div>
      ) : submitted ? (
        <div style={{ textAlign: 'center', padding: '12px 0' }}>
          <span style={{ fontSize: 24, display: 'block', marginBottom: 4 }}>🎉</span>
          <h4 style={{ fontSize: 15, fontWeight: 700, color: 'var(--score-green)', margin: 0 }}>
            Thank You!
          </h4>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
            Your feedback helps us continuously improve our validation algorithms.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h4 style={{ fontSize: 15, fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
              1-Minute Outcome Survey
            </h4>
            <button
              type="button"
              onClick={() => setExpanded(false)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                fontSize: 12,
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              Cancel
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {renderRadioToggle('Has the product launched?', launched, setLaunched)}
            {renderRadioToggle('Have you acquired your first users?', gotFirstUsers, setGotFirstUsers)}
            {renderRadioToggle('Do you have paying customers?', payingCustomers, setPayingCustomers)}

            {payingCustomers && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, animation: 'fadeIn 0.2s ease' }}>
                <label htmlFor="revenue-survey-input" style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-primary)' }}>
                  Estimated Monthly Revenue (USD)
                </label>
                <input
                  id="revenue-survey-input"
                  type="number"
                  className="input"
                  value={monthlyRevenue}
                  onChange={(e) => setMonthlyRevenue(e.target.value)}
                  placeholder="e.g. 500"
                  style={{ width: 120, height: 36, padding: '4px 10px', textAlign: 'right' }}
                  required
                />
              </div>
            )}

            {renderRadioToggle('Have you successfully raised funding?', raisedFunding, setRaisedFunding)}
            {renderRadioToggle('Has this startup shut down?', shutDown, setShutDown)}
          </div>

          {error && (
            <div style={{ fontSize: 12, color: 'var(--score-red)', fontWeight: 600 }}>
              ⚠️ Error: {error}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-sm"
              style={{ minWidth: 120 }}
            >
              {loading ? 'Submitting...' : 'Submit Outcomes'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
