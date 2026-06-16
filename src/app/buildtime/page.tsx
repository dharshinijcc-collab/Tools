'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

// ─── Types ───────────────────────────────────────────────────────────────────

type ProjectType = 'website' | 'web app' | 'admin panel' | 'mobile app' | 'AI tool' | 'SaaS product';
type DeadlineType = 'fixed' | 'flexible';
type ReadinessType = 'ready' | 'draft' | 'none';
type TeamType = 'solo' | 'freelancer' | 'internal' | 'agency';

interface FormInputs {
  projectType: ProjectType;
  targetAudience: string;
  description: string;
  platforms: { web: boolean; ios: boolean; android: boolean; desktop: boolean };
  mustHaveFeatures: string[];
  phase2Features: string[];
  targetLaunchDate: string;
  deadlineType: DeadlineType;
  readiness: ReadinessType;
  needLogin: boolean;
  needAdminPanel: boolean;
  needPayments: boolean;
  needThirdPartyApis: boolean;
  needAiOcr: boolean;
  needFileUpload: boolean;
  specialNeeds: { security: boolean; speed: boolean; compliance: boolean; reporting: boolean };
  teamType: TeamType;
  blockers: { designs: boolean; apis: boolean; compliance: boolean; migration: boolean };
  extraNotes: string;
}

interface EstimateResult {
  id: string;
  timestamp: string;
  inputs: FormInputs;
  minWeeks: number;
  maxWeeks: number;
  feasibility: 'Realistic' | 'Tight' | 'Unrealistic';
  feasibilityStyle: { color: string; bg: string; border: string };
  complexity: 'Simple' | 'Moderate' | 'Complex';
  complexityStyle: { color: string; bg: string; border: string };
  reasons: string[];
  mvpScope: string[];
  phase2Scope: string[];
  suggestions: string[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

const INITIAL_INPUTS: FormInputs = {
  projectType: 'web app',
  targetAudience: '',
  description: '',
  platforms: { web: true, ios: false, android: false, desktop: false },
  mustHaveFeatures: [],
  phase2Features: [],
  targetLaunchDate: '',
  deadlineType: 'flexible',
  readiness: 'draft',
  needLogin: false,
  needAdminPanel: false,
  needPayments: false,
  needThirdPartyApis: false,
  needAiOcr: false,
  needFileUpload: false,
  specialNeeds: { security: false, speed: false, compliance: false, reporting: false },
  teamType: 'internal',
  blockers: { designs: false, apis: false, compliance: false, migration: false },
  extraNotes: '',
};

const TOTAL_STEPS = 5;
const STEP_LABELS = [
  'Project Basics',
  'Scope & Platforms',
  'Timeline',
  'Complexity',
  'Team & Dependencies',
];

// ─── Estimation Logic ─────────────────────────────────────────────────────────

function calculateEstimate(inputs: FormInputs): EstimateResult {
  let minW = 4;
  let maxW = 7;

  switch (inputs.projectType) {
    case 'website':      minW = 2;  maxW = 4;  break;
    case 'web app':      minW = 6;  maxW = 10; break;
    case 'admin panel':  minW = 4;  maxW = 7;  break;
    case 'mobile app':   minW = 8;  maxW = 13; break;
    case 'AI tool':      minW = 6;  maxW = 11; break;
    case 'SaaS product': minW = 8;  maxW = 14; break;
  }

  const reasons: string[] = [];
  const mvpScope: string[] = [`Core ${inputs.projectType} architecture & routing`];
  const phase2Scope: string[] = [];
  const suggestions: string[] = [];

  // Platforms
  const activePlatforms = Object.entries(inputs.platforms).filter(([, v]) => v).map(([k]) => k);
  if (activePlatforms.length > 1) {
    const extra = (activePlatforms.length - 1) * 0.35;
    minW = minW * (1 + extra);
    maxW = maxW * (1 + extra);
    reasons.push(`Multi-platform delivery (${activePlatforms.join(', ')}) adds parallel build pipelines (+${Math.round(extra * 100)}%)`);
  }

  // Feature additions
  if (inputs.needLogin)          { minW += 1;   maxW += 2;   reasons.push('User auth, roles & password security (+1–2 wk)'); mvpScope.push('Secure login & registration'); }
  if (inputs.needAdminPanel)     { minW += 1.5; maxW += 3;   reasons.push('Custom admin portal build (+1.5–3 wk)'); mvpScope.push('Basic admin data console'); }
  if (inputs.needPayments)       { minW += 1.5; maxW += 2.5; reasons.push('Stripe checkout & subscription logic (+1.5–2.5 wk)'); mvpScope.push('Stripe billing flow'); }
  if (inputs.needThirdPartyApis) { minW += 1;   maxW += 2;   reasons.push('Third-party API integration & webhook syncing (+1–2 wk)'); }
  if (inputs.needAiOcr)          { minW += 2;   maxW += 4;   reasons.push('AI/LLM prompt pipelines or OCR processing (+2–4 wk)'); mvpScope.push('AI prompt pipeline'); }
  if (inputs.needFileUpload)     { minW += 0.5; maxW += 1.5; reasons.push('Cloud file upload & storage pipeline (+0.5–1.5 wk)'); }

  // Special needs
  if (inputs.specialNeeds.security)    { minW += 1.5; maxW += 3;   reasons.push('Security hardening & threat audit (+1.5–3 wk)'); }
  if (inputs.specialNeeds.speed)       { minW += 0.5; maxW += 1.5; reasons.push('CDN tuning & rendering performance (+0.5–1.5 wk)'); }
  if (inputs.specialNeeds.compliance)  { minW += 2;   maxW += 3.5; reasons.push('GDPR/HIPAA/SOC2 compliance implementation (+2–3.5 wk)'); }
  if (inputs.specialNeeds.reporting)   { minW += 1;   maxW += 2;   reasons.push('Custom reports, charts & PDF exports (+1–2 wk)'); phase2Scope.push('PDF exports & scheduled email reports'); }

  // Design readiness
  if (inputs.readiness === 'none')  { minW += 2; maxW += 4; reasons.push('Full discovery: wireframing & design spec creation (+2–4 wk)'); suggestions.push('Commission finalized Figma designs before starting development — saves 2–4 weeks of iteration.'); }
  if (inputs.readiness === 'draft') { minW += 1; maxW += 2; reasons.push('Design refinement & final spec approval (+1–2 wk)'); suggestions.push('Finalize your draft designs before handing off to engineers to avoid mid-sprint changes.'); }
  if (inputs.readiness === 'ready') { suggestions.push('Having finalized designs speeds up front-end delivery significantly.'); }

  // Blockers
  const blockerCount = Object.values(inputs.blockers).filter(Boolean).length;
  if (blockerCount > 0) {
    minW += blockerCount * 0.7;
    maxW += blockerCount * 1.5;
    reasons.push(`${blockerCount} dependency blocker${blockerCount > 1 ? 's' : ''} require resolution buffer (+${(blockerCount * 0.7).toFixed(1)}–${(blockerCount * 1.5).toFixed(1)} wk)`);
  }

  // Team type
  if (inputs.teamType === 'solo')      { minW *= 1.25; maxW *= 1.35; reasons.push('Solo builder pace adds sequential delivery overhead (+25–35%)'); }
  if (inputs.teamType === 'agency')    { minW *= 0.9;  maxW *= 0.95; suggestions.push('Agencies move faster with parallel workstreams — plan regular sprint reviews.'); }
  if (inputs.teamType === 'freelancer'){ minW *= 1.1;  maxW *= 1.2;  reasons.push('Contract freelancer coordination adds overhead (+10–20%)'); }

  // Phase 2 standard suggestions
  if (inputs.needPayments)    { phase2Scope.push('Automated invoicing, refunds & coupon codes'); suggestions.push('Start with basic Stripe checkout — postpone subscription management to Phase 2.'); }
  if (inputs.needAdminPanel)  { phase2Scope.push('Admin analytics dashboard & audit logging'); suggestions.push('Use Supabase Studio as your admin panel in Phase 1 instead of building a custom one.'); }
  if (inputs.platforms.ios || inputs.platforms.android) { suggestions.push('Launch as a web app first. Ship mobile binaries only after validating the product with real users.'); }
  if (suggestions.length === 0) suggestions.push('Stay laser-focused on the core user problem. Ship the smallest useful version first.');

  // User-specified features
  inputs.mustHaveFeatures.forEach(f => mvpScope.push(f));
  inputs.phase2Features.forEach(f => phase2Scope.push(f));

  // Feasibility
  const minFinal = Math.max(1, Math.round(minW));
  const maxFinal = Math.max(2, Math.round(maxW));
  let feasibility: EstimateResult['feasibility'] = 'Realistic';
  let feasibilityStyle = { color: 'var(--score-green)', bg: 'var(--score-green-bg)', border: 'var(--score-green-border)' };

  if (inputs.targetLaunchDate) {
    const diff = (new Date(inputs.targetLaunchDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 7);
    if (diff < minFinal)                { feasibility = 'Unrealistic'; feasibilityStyle = { color: 'var(--score-red)', bg: 'var(--score-red-bg)', border: 'var(--score-red-border)' }; suggestions.unshift('⚠️ Your target date is shorter than the minimum build time. Prune scope or shift the deadline.'); }
    else if (diff <= maxFinal)          { feasibility = 'Tight'; feasibilityStyle = { color: 'var(--score-amber)', bg: 'var(--score-amber-bg)', border: 'var(--score-amber-border)' }; suggestions.unshift('⏱ Timeline is tight. Ruthlessly cut non-essential features from Phase 1.'); }
  }

  // Complexity
  let complexity: EstimateResult['complexity'] = 'Moderate';
  let complexityStyle = { color: 'var(--score-amber)', bg: 'var(--score-amber-bg)', border: 'var(--score-amber-border)' };
  if (minFinal < 6)  { complexity = 'Simple';  complexityStyle = { color: 'var(--score-green)', bg: 'var(--score-green-bg)', border: 'var(--score-green-border)' }; }
  if (minFinal > 11) { complexity = 'Complex'; complexityStyle = { color: 'var(--score-red)', bg: 'var(--score-red-bg)', border: 'var(--score-red-border)' }; }

  return {
    id: Math.random().toString(36).slice(2, 9),
    timestamp: new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }),
    inputs: { ...inputs },
    minWeeks: minFinal,
    maxWeeks: maxFinal,
    feasibility,
    feasibilityStyle,
    complexity,
    complexityStyle,
    reasons,
    mvpScope: [...new Set(mvpScope)],
    phase2Scope: phase2Scope.length > 0 ? [...new Set(phase2Scope)] : ['Advanced analytics & reporting', 'Custom billing configurations', 'Compliance certification integration'],
    suggestions,
  };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SelectionCard({
  icon, title, desc, selected, onClick,
}: { icon: string; title: string; desc?: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: '16px',
        borderRadius: 'var(--radius)',
        border: selected ? '1.5px solid var(--primary)' : '1.5px solid var(--border)',
        background: selected ? 'var(--primary-muted)' : '#fff',
        textAlign: 'left',
        cursor: 'pointer',
        transition: 'all 0.15s ease',
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
      }}
    >
      <span style={{ fontSize: 22 }}>{icon}</span>
      <span style={{ fontSize: 13, fontWeight: 700, color: selected ? 'var(--primary)' : 'var(--text-primary)' }}>{title}</span>
      {desc && <span style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.4 }}>{desc}</span>}
    </button>
  );
}

function ToggleCard({
  label, desc, checked, onClick,
}: { label: string; desc?: string; checked: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: '14px 16px',
        borderRadius: 'var(--radius)',
        border: checked ? '1.5px solid var(--primary)' : '1.5px solid var(--border)',
        background: checked ? 'var(--primary-muted)' : '#fff',
        textAlign: 'left',
        cursor: 'pointer',
        transition: 'all 0.15s ease',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 10,
      }}
    >
      <div style={{
        width: 18, height: 18, borderRadius: 4, flexShrink: 0, marginTop: 1,
        border: checked ? '1.5px solid var(--primary)' : '1.5px solid var(--border-strong)',
        background: checked ? 'var(--primary)' : '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {checked && <span style={{ color: '#fff', fontSize: 11, lineHeight: 1 }}>✓</span>}
      </div>
      <div>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', display: 'block' }}>{label}</span>
        {desc && <span style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.4, display: 'block', marginTop: 2 }}>{desc}</span>}
      </div>
    </button>
  );
}

function Chip({ label, onRemove, variant = 'primary' }: { label: string; onRemove: () => void; variant?: 'primary' | 'secondary' }) {
  const isPrimary = variant === 'primary';
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '4px 10px', borderRadius: 999, fontSize: 12, fontWeight: 600,
      background: isPrimary ? 'var(--primary-muted)' : 'var(--bg-base)',
      color: isPrimary ? 'var(--primary)' : 'var(--text-secondary)',
      border: isPrimary ? '1px solid rgba(46,92,138,0.2)' : '1px solid var(--border)',
    }}>
      {label}
      <button onClick={onRemove} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, color: 'inherit', padding: 0, lineHeight: 1 }}>✕</button>
    </span>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function BuildTimeEstimatorPage() {
  const [view, setView] = useState<'idle' | 'wizard' | 'results'>('idle');
  const [step, setStep] = useState(0); // 0-indexed, 0 to TOTAL_STEPS-1
  const [inputs, setInputs] = useState<FormInputs>(INITIAL_INPUTS);
  const [result, setResult] = useState<EstimateResult | null>(null);
  const [history, setHistory] = useState<EstimateResult[]>([]);
  const [featureInput, setFeatureInput] = useState('');
  const [phase2Input, setPhase2Input] = useState('');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('bte_history_v2');
      if (saved) setHistory(JSON.parse(saved));
    } catch { /* ignore */ }
  }, []);

  const saveHistory = (r: EstimateResult) => {
    const updated = [r, ...history.filter(h => h.id !== r.id)].slice(0, 8);
    setHistory(updated);
    localStorage.setItem('bte_history_v2', JSON.stringify(updated));
  };

  const handleStart = () => {
    setInputs(INITIAL_INPUTS);
    setStep(0);
    setResult(null);
    setView('wizard');
  };

  const handleBack = () => {
    if (step === 0) setView('idle');
    else setStep(s => s - 1);
  };

  const handleNext = () => {
    if (step < TOTAL_STEPS - 1) setStep(s => s + 1);
    else handleSubmit();
  };

  const handleSubmit = () => {
    const r = calculateEstimate(inputs);
    setResult(r);
    saveHistory(r);
    setView('results');
  };

  const handleReset = () => {
    setView('idle');
    setStep(0);
    setResult(null);
    setInputs(INITIAL_INPUTS);
  };

  const handleNewEstimate = () => {
    setInputs(INITIAL_INPUTS);
    setStep(0);
    setResult(null);
    setView('wizard');
  };

  const addFeature = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === 'Enter' || e.key === ',') && featureInput.trim()) {
      e.preventDefault();
      const f = featureInput.replace(/,$/, '').trim();
      if (f && !inputs.mustHaveFeatures.includes(f)) setInputs(i => ({ ...i, mustHaveFeatures: [...i.mustHaveFeatures, f] }));
      setFeatureInput('');
    }
  };
  const addPhase2 = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === 'Enter' || e.key === ',') && phase2Input.trim()) {
      e.preventDefault();
      const f = phase2Input.replace(/,$/, '').trim();
      if (f && !inputs.phase2Features.includes(f)) setInputs(i => ({ ...i, phase2Features: [...i.phase2Features, f] }));
      setPhase2Input('');
    }
  };

  const progressPercent = view === 'wizard' ? ((step + 1) / TOTAL_STEPS) * 100 : 0;

  // ── Idle / Landing ─────────────────────────────────────────────────────────
  if (view === 'idle') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <main style={{ flex: 1, background: 'var(--bg-base)', padding: '48px 24px' }}>
          <div className="container-page" style={{ maxWidth: 800 }}>

            {/* Hero */}
            <div style={{ textAlign: 'center', marginBottom: 48 }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: 'var(--primary-muted)', border: '1px solid rgba(46,92,138,0.2)',
                borderRadius: 999, padding: '5px 14px', fontSize: 12, fontWeight: 600,
                color: 'var(--primary)', marginBottom: 20,
              }}>
                ⏱️ Software Project Scoping
              </div>
              <h1 style={{ fontSize: 'clamp(28px, 5vw, 46px)', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1.15, letterSpacing: '-0.02em', marginBottom: 16 }}>
                Estimate how long your product<br />
                <span className="text-gradient">will take to build</span>
              </h1>
              <p style={{ fontSize: 16, color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: 540, margin: '0 auto 32px' }}>
                Answer a short set of guided questions. Get a realistic timeline range, scope recommendations, and actionable suggestions to launch faster.
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap', marginBottom: 40 }}>
                {['⚡ Results in 2 min', '🎯 Rule-based logic', '✂️ MVP recommendations', '🔒 No signup needed'].map(b => (
                  <span key={b} style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>{b}</span>
                ))}
              </div>
              <button
                className="btn btn-primary btn-lg"
                onClick={handleStart}
                style={{ minWidth: 240, backgroundImage: 'linear-gradient(135deg, #2E5C8A 0%, #4A80B5 50%, #2E5C8A 100%)', backgroundSize: '200% 100%' }}
              >
                Start Build Estimator →
              </button>
            </div>

            {/* Benefit cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20, marginBottom: 48 }}>
              {[
                { icon: '📊', title: 'Rule-Based Engine', desc: 'Applies platform factors, design readiness, compliance weights, and deadline pressure — not a generic hours counter.' },
                { icon: '✂️', title: 'MVP Recommendations', desc: 'Tells you exactly which features to cut or postpone to launch weeks earlier without compromising core value.' },
                { icon: '📅', title: 'Deadline Feasibility', desc: 'Checks whether your target launch date is realistic, tight, or unrealistic based on your actual scope.' },
              ].map(c => (
                <div key={c.title} className="card" style={{ padding: '24px' }}>
                  <div style={{ fontSize: 22, marginBottom: 10 }}>{c.icon}</div>
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>{c.title}</h3>
                  <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{c.desc}</p>
                </div>
              ))}
            </div>

            {/* Previous estimates */}
            {history.length > 0 && (
              <div className="card" style={{ padding: '24px 28px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>Previous Estimates</h3>
                  <button onClick={() => { setHistory([]); localStorage.removeItem('bte_history_v2'); }} style={{ fontSize: 12, color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>Clear</button>
                </div>
                <div style={{ display: 'grid', gap: 8 }}>
                  {history.map(h => (
                    <button
                      key={h.id}
                      onClick={() => { setResult(h); setInputs(h.inputs); setView('results'); }}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '12px 14px', borderRadius: 'var(--radius-sm)',
                        border: '1.5px solid var(--border)', background: '#fff',
                        cursor: 'pointer', transition: 'all 0.15s',
                      }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--primary)'; (e.currentTarget as HTMLElement).style.background = 'var(--primary-muted)'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLElement).style.background = '#fff'; }}
                    >
                      <div style={{ textAlign: 'left' }}>
                        <span style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', textTransform: 'capitalize' }}>{h.inputs.projectType}</span>
                        <span style={{ display: 'block', fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{h.timestamp}</span>
                      </div>
                      <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--primary)' }}>{h.minWeeks}–{h.maxWeeks} wk</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // ── Wizard ─────────────────────────────────────────────────────────────────
  if (view === 'wizard') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <main style={{ flex: 1, background: 'var(--bg-base)', padding: '48px 24px' }}>
          <div className="container-page" style={{ maxWidth: 720 }}>
            <div
              className="card"
              style={{
                padding: '32px 36px',
                background: 'linear-gradient(135deg, #fff 0%, #F8FAFF 100%)',
                border: '1.5px solid var(--border)',
                animation: 'fadeIn 0.3s ease',
              }}
            >
              {/* Progress */}
              <div style={{ marginBottom: 28 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>
                    Step {step + 1} of {TOTAL_STEPS} · {STEP_LABELS[step]}
                  </span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary)' }}>
                    {Math.round(progressPercent)}% complete
                  </span>
                </div>
                <div className="progress-track">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${progressPercent}%`,
                      background: 'linear-gradient(90deg, var(--primary) 0%, #5B8FBF 100%)',
                    }}
                  />
                </div>
              </div>

              {/* ── Step 1: Project Basics ────────────────────────────────── */}
              {step === 0 && (
                <div style={{ animation: 'fadeIn 0.3s ease' }}>
                  <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>What are you building?</h2>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 24, lineHeight: 1.5 }}>
                    Select the type of product you want to ship.
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10, marginBottom: 28 }}>
                    {([
                      ['website',     '🌐', 'Website',       'Marketing page or portfolio'],
                      ['web app',     '💻', 'Web App',        'Custom dashboard & logic'],
                      ['admin panel', '⚙️', 'Admin Panel',    'Internal data management'],
                      ['mobile app',  '📱', 'Mobile App',     'iOS & Android native build'],
                      ['AI tool',     '🤖', 'AI Tool',        'LLM-powered product'],
                      ['SaaS product','🚀', 'SaaS Platform',  'Subscription-based product'],
                    ] as const).map(([val, icon, title, desc]) => (
                      <SelectionCard key={val} icon={icon} title={title} desc={desc}
                        selected={inputs.projectType === val}
                        onClick={() => setInputs(i => ({ ...i, projectType: val }))}
                      />
                    ))}
                  </div>

                  <div style={{ marginBottom: 20 }}>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>Who is it for?</label>
                    <input
                      className="input"
                      value={inputs.targetAudience}
                      onChange={e => setInputs(i => ({ ...i, targetAudience: e.target.value }))}
                      placeholder="e.g. Sales managers, e-commerce founders, students..."
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>Brief description</label>
                    <textarea
                      className="input"
                      rows={3}
                      value={inputs.description}
                      onChange={e => setInputs(i => ({ ...i, description: e.target.value }))}
                      placeholder="e.g. A tool that automatically tracks focus sessions and saves productivity logs locally..."
                      style={{ resize: 'vertical', minHeight: 80 }}
                    />
                  </div>
                </div>
              )}

              {/* ── Step 2: Scope & Platforms ─────────────────────────────── */}
              {step === 1 && (
                <div style={{ animation: 'fadeIn 0.3s ease' }}>
                  <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>Scope & Platforms</h2>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 24, lineHeight: 1.5 }}>
                    Which platforms does this project need to run on?
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 10, marginBottom: 28 }}>
                    {([
                      ['web',     '🌐', 'Web Browser'],
                      ['ios',     '🍏', 'iOS App'],
                      ['android', '🤖', 'Android App'],
                      ['desktop', '💻', 'Desktop App'],
                    ] as const).map(([key, icon, label]) => (
                      <SelectionCard key={key} icon={icon} title={label}
                        selected={inputs.platforms[key]}
                        onClick={() => setInputs(i => ({ ...i, platforms: { ...i.platforms, [key]: !i.platforms[key] } }))}
                      />
                    ))}
                  </div>

                  <div style={{ marginBottom: 20 }}>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>Must-have features (MVP)</label>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8 }}>Type a feature name and press Enter or comma to add it as a tag.</p>
                    <input
                      className="input"
                      value={featureInput}
                      onChange={e => setFeatureInput(e.target.value)}
                      onKeyDown={addFeature}
                      placeholder="e.g. Real-time chat, Google Maps, PDF export..."
                    />
                    {inputs.mustHaveFeatures.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
                        {inputs.mustHaveFeatures.map(f => (
                          <Chip key={f} label={f} variant="primary" onRemove={() => setInputs(i => ({ ...i, mustHaveFeatures: i.mustHaveFeatures.filter(x => x !== f) }))} />
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>Features for Phase 2</label>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8 }}>Anything useful but not critical for launch day.</p>
                    <input
                      className="input"
                      value={phase2Input}
                      onChange={e => setPhase2Input(e.target.value)}
                      onKeyDown={addPhase2}
                      placeholder="e.g. Push notifications, multi-currency, dark mode..."
                    />
                    {inputs.phase2Features.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
                        {inputs.phase2Features.map(f => (
                          <Chip key={f} label={f} variant="secondary" onRemove={() => setInputs(i => ({ ...i, phase2Features: i.phase2Features.filter(x => x !== f) }))} />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ── Step 3: Timeline ──────────────────────────────────────── */}
              {step === 2 && (
                <div style={{ animation: 'fadeIn 0.3s ease' }}>
                  <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>Timeline & Readiness</h2>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 24, lineHeight: 1.5 }}>
                    When do you need to launch, and how ready is your design?
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>Target launch date</label>
                      <input type="date" className="input" value={inputs.targetLaunchDate} onChange={e => setInputs(i => ({ ...i, targetLaunchDate: e.target.value }))} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>Deadline type</label>
                      <div style={{ display: 'flex', gap: 8, height: 46 }}>
                        {([['fixed', '🔒 Fixed'], ['flexible', '🟢 Flexible']] as const).map(([v, label]) => (
                          <button
                            key={v} type="button"
                            onClick={() => setInputs(i => ({ ...i, deadlineType: v }))}
                            style={{
                              flex: 1, borderRadius: 'var(--radius-sm)', fontSize: 12, fontWeight: 700, cursor: 'pointer',
                              border: inputs.deadlineType === v ? '1.5px solid var(--primary)' : '1.5px solid var(--border-strong)',
                              background: inputs.deadlineType === v ? 'var(--primary-muted)' : '#fff',
                              color: inputs.deadlineType === v ? 'var(--primary)' : 'var(--text-secondary)',
                              transition: 'all 0.15s',
                            }}
                          >{label}</button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>Are design & requirements ready?</label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {([
                        ['ready', '✅ Yes — finalized Figma mockups & requirements docs', 'Reduces front-end discovery time significantly.'],
                        ['draft', '✏️ Draft wireframes or partial specs exist', 'Some alignment still needed before building.'],
                        ['none',  '❌ No — starting from scratch', 'Requires a full discovery & design phase first.'],
                      ] as const).map(([val, label, sub]) => (
                        <button
                          key={val} type="button"
                          onClick={() => setInputs(i => ({ ...i, readiness: val }))}
                          style={{
                            padding: '14px 16px', borderRadius: 'var(--radius)',
                            border: inputs.readiness === val ? '1.5px solid var(--primary)' : '1.5px solid var(--border)',
                            background: inputs.readiness === val ? 'var(--primary-muted)' : '#fff',
                            textAlign: 'left', cursor: 'pointer', transition: 'all 0.15s',
                            display: 'flex', alignItems: 'center', gap: 12,
                          }}
                        >
                          <div style={{
                            width: 16, height: 16, borderRadius: '50%', flexShrink: 0,
                            border: inputs.readiness === val ? '4px solid var(--primary)' : '1.5px solid var(--border-strong)',
                            background: '#fff',
                          }} />
                          <div>
                            <span style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{label}</span>
                            <span style={{ display: 'block', fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{sub}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ── Step 4: Complexity & Integrations ────────────────────── */}
              {step === 3 && (
                <div style={{ animation: 'fadeIn 0.3s ease' }}>
                  <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>Integrations & Complexity</h2>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 24, lineHeight: 1.5 }}>
                    Which modules does your product need? Select everything that applies.
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 8, marginBottom: 24 }}>
                    {[
                      { key: 'needLogin',          label: '🔑 Login / Signup',           desc: 'User accounts, roles & password auth' },
                      { key: 'needAdminPanel',      label: '⚙️ Admin Panel',               desc: 'Custom internal data management console' },
                      { key: 'needPayments',        label: '💳 Payment Integration',       desc: 'Stripe checkouts, paywalls & invoices' },
                      { key: 'needThirdPartyApis',  label: '🔌 Third-Party APIs',          desc: 'Twilio, Sendgrid, CRM or custom APIs' },
                      { key: 'needAiOcr',           label: '🤖 AI / OCR Features',         desc: 'LLM prompts, embeddings or OCR parsing' },
                      { key: 'needFileUpload',      label: '📁 File Upload / Storage',     desc: 'Cloud file uploads via AWS S3 or similar' },
                    ].map(item => (
                      <ToggleCard key={item.key} label={item.label} desc={item.desc}
                        checked={(inputs as any)[item.key]}
                        onClick={() => setInputs(i => ({ ...i, [item.key]: !(i as any)[item.key] }))}
                      />
                    ))}
                  </div>

                  <div style={{ borderTop: '1px solid var(--border)', paddingTop: 20 }}>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 10 }}>Any special requirements?</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 8 }}>
                      {[
                        { key: 'security',   label: '🛡️ High Security / Audit Hardening' },
                        { key: 'speed',      label: '⚡ CDN & Performance Optimization' },
                        { key: 'compliance', label: '⚖️ GDPR / HIPAA / SOC2 Compliance' },
                        { key: 'reporting',  label: '📊 Reports, Charts & PDF Exports' },
                      ].map(item => (
                        <ToggleCard key={item.key} label={item.label}
                          checked={(inputs.specialNeeds as any)[item.key]}
                          onClick={() => setInputs(i => ({ ...i, specialNeeds: { ...i.specialNeeds, [item.key]: !(i.specialNeeds as any)[item.key] } }))}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ── Step 5: Team & Dependencies ──────────────────────────── */}
              {step === 4 && (
                <div style={{ animation: 'fadeIn 0.3s ease' }}>
                  <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>Team & Dependencies</h2>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 24, lineHeight: 1.5 }}>
                    Tell us about your build team and any active blockers.
                  </p>

                  <div style={{ marginBottom: 24 }}>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 10 }}>Who is building this?</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 8 }}>
                      {([
                        ['solo',       '🙋',  'Solo Developer',  'One coder doing everything'],
                        ['freelancer', '👥',  'Freelancers',     '1–2 contractors'],
                        ['internal',   '🏢',  'Internal Team',   'Small core dev squad'],
                        ['agency',     '🚀',  'Agency / Studio', 'Outsourced build team'],
                      ] as const).map(([val, icon, title, desc]) => (
                        <SelectionCard key={val} icon={icon} title={title} desc={desc}
                          selected={inputs.teamType === val}
                          onClick={() => setInputs(i => ({ ...i, teamType: val }))}
                        />
                      ))}
                    </div>
                  </div>

                  <div style={{ marginBottom: 20 }}>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>Any active blockers?</label>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 10 }}>Select anything you are currently waiting on before development can proceed fully.</p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 8 }}>
                      {[
                        { key: 'designs',    label: 'Waiting on designs or wireframes' },
                        { key: 'apis',       label: 'Waiting on API credentials / access' },
                        { key: 'compliance', label: 'Regulatory approval pending' },
                        { key: 'migration',  label: 'Legacy data migration required' },
                      ].map(item => (
                        <ToggleCard key={item.key} label={item.label}
                          checked={(inputs.blockers as any)[item.key]}
                          onClick={() => setInputs(i => ({ ...i, blockers: { ...i.blockers, [item.key]: !(i.blockers as any)[item.key] } }))}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>Extra notes (optional)</label>
                    <textarea
                      className="input"
                      rows={2}
                      value={inputs.extraNotes}
                      onChange={e => setInputs(i => ({ ...i, extraNotes: e.target.value }))}
                      placeholder="Anything else that might affect the timeline..."
                      style={{ resize: 'vertical', minHeight: 64 }}
                    />
                  </div>
                </div>
              )}

              {/* Navigation bar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 32 }}>
                <button className="btn btn-secondary" onClick={handleBack} style={{ fontSize: 14 }}>← Back</button>
                <button
                  className="btn btn-primary"
                  onClick={handleNext}
                  style={{ backgroundImage: 'linear-gradient(135deg, #2E5C8A 0%, #4A80B5 50%, #2E5C8A 100%)', backgroundSize: '200% 100%' }}
                >
                  {step === TOTAL_STEPS - 1 ? '⚡ Generate Estimate' : 'Continue →'}
                </button>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // ── Results ────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <main style={{ flex: 1, background: 'var(--bg-base)', padding: '48px 24px' }}>
        <div className="container-page" style={{ maxWidth: 900 }}>

          {result && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24, animation: 'fadeInUp 0.5s ease' }}>

              {/* Header row */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)' }}>Your Estimate Report</h2>
                <div style={{ display: 'flex', gap: 12 }}>
                  <button onClick={handleNewEstimate} style={{ fontSize: 13, color: 'var(--text-secondary)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500, textDecoration: 'underline' }}>
                    New estimate
                  </button>
                  <button onClick={() => { setStep(0); setView('wizard'); }} style={{ fontSize: 13, color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500, textDecoration: 'underline' }}>
                    Edit inputs →
                  </button>
                </div>
              </div>

              {/* Primary Timeline Card */}
              <div className="card" style={{
                padding: '32px 36px',
                background: 'linear-gradient(135deg, #fff 0%, #F8FAFF 100%)',
                borderTop: '4px solid var(--primary)',
                position: 'relative',
              }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'flex-start' }}>
                  {/* Timeline */}
                  <div style={{ flex: '1 1 220px' }}>
                    <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>Estimated Timeline</span>
                    <div style={{ fontSize: 'clamp(36px, 6vw, 52px)', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1.05, marginTop: 4 }}>
                      {result.minWeeks}–{result.maxWeeks}
                      <span style={{ fontSize: 20, fontWeight: 600, color: 'var(--text-secondary)', marginLeft: 6 }}>weeks</span>
                    </div>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      {result.minWeeks * 5}–{result.maxWeeks * 5} engineering work days
                    </span>
                  </div>

                  {/* Badges */}
                  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-start' }}>
                    {[
                      { label: 'Deadline Feasibility', value: result.feasibility, style: result.feasibilityStyle },
                      { label: 'Scope Complexity', value: result.complexity, style: result.complexityStyle },
                    ].map(b => (
                      <div
                        key={b.label}
                        style={{
                          padding: '12px 20px', borderRadius: 'var(--radius)',
                          background: b.style.bg,
                          border: `1.5px solid ${b.style.border}`,
                          textAlign: 'center', minWidth: 130,
                        }}
                      >
                        <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 4 }}>{b.label}</div>
                        <div style={{ fontSize: 16, fontWeight: 800, color: b.style.color }}>{b.value}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Effort Drivers */}
                {result.reasons.length > 0 && (
                  <div style={{ marginTop: 24, borderTop: '1px solid var(--border)', paddingTop: 20 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>Top effort drivers</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {result.reasons.map((r, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13, color: 'var(--text-secondary)' }}>
                          <span style={{ color: 'var(--primary)', marginTop: 1 }}>•</span>
                          <span style={{ lineHeight: 1.5 }}>{r}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* MVP / Phase 2 split */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
                {/* MVP */}
                <div className="card" style={{ padding: '24px 28px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--score-green-bg)', border: '1.5px solid var(--score-green-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>✓</div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)' }}>Recommended MVP</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Ship this first to validate fast</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {result.mvpScope.map((item, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '8px 10px', borderRadius: 'var(--radius-sm)', background: 'var(--score-green-bg)', border: '1px solid var(--score-green-border)' }}>
                        <span style={{ color: 'var(--score-green)', fontSize: 11, marginTop: 1, fontWeight: 700 }}>✓</span>
                        <span style={{ fontSize: 12, color: 'var(--text-primary)', lineHeight: 1.4 }}>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Phase 2 */}
                <div className="card" style={{ padding: '24px 28px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--primary-muted)', border: '1.5px solid rgba(46,92,138,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>🚀</div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)' }}>Phase 2 Scope</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Build these after launch</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {result.phase2Scope.map((item, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '8px 10px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-base)', border: '1px solid var(--border)' }}>
                        <span style={{ color: 'var(--primary)', fontSize: 11, marginTop: 1, fontWeight: 700 }}>→</span>
                        <span style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.4 }}>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Suggestions / Insight card */}
              <div className="card" style={{
                padding: '24px 28px',
                background: 'linear-gradient(135deg, #0F1C2E 0%, #1a2e47 100%)',
                border: '1.5px solid rgba(46,92,138,0.3)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                  <span style={{ fontSize: 18 }}>💡</span>
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#fff' }}>How to launch faster</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {result.suggestions.map((s, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, paddingLeft: 12, borderLeft: '2.5px solid var(--primary)' }}>
                      <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', lineHeight: 1.6 }}>{s}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
