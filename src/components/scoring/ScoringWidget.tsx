'use client';

import { useState, useRef } from 'react';
import { useScoring } from '@/hooks/useScoring';
import { useTrialCount } from '@/hooks/useTrialCount';
import { useAuth } from '@/hooks/useAuth';
import ScoreCard from './ScoreCard';
import DimensionList from './DimensionList';
import SkeletonResult from './SkeletonResult';
import { TriageBand, QAAnswers } from '@/types/scoring';
import Link from 'next/link';

export default function ScoringWidget() {
  const [step, setStep] = useState<'idle' | number>('idle');
  
  // Step 1: About The Idea
  const [customer, setCustomer] = useState('');
  const [problem, setProblem] = useState('');
  const [painScore, setPainScore] = useState(5);
  const [validationLevel, setValidationLevel] = useState<'none' | 'conversations' | 'waitlist' | 'paying_customers'>('none');
  const [marketSizeChoice, setMarketSizeChoice] = useState<'small' | 'medium' | 'large' | 'mass_market'>('medium');
  const [revenueModelChoice, setRevenueModelChoice] = useState<'subscription' | 'transaction_fee' | 'marketplace' | 'licensing' | 'advertising' | 'one_time' | 'other'>('subscription');
  const [whyNow, setWhyNow] = useState('');
  const [competitors, setCompetitors] = useState('');
  const [moat, setMoat] = useState('');

  // Step 2: About The Founder
  const [soloFounder, setSoloFounder] = useState(true);
  const [hasTechnicalCofounder, setHasTechnicalCofounder] = useState(false);
  const [technicalBackground, setTechnicalBackground] = useState<'can_code' | 'used_to_code' | 'no'>('no');
  const [currentStage, setCurrentStage] = useState<'forming' | 'ux_design' | 'prototype' | 'mvp'>('forming');
  const [launchTimeline, setLaunchTimeline] = useState('');
  const [fundingStatus, setFundingStatus] = useState<'bootstrapped' | 'raising' | 'raised'>('bootstrapped');

  // Step 3: Contact
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');

  const resultRef = useRef<HTMLDivElement>(null);
  const { submit, loading, error, result, reset } = useScoring();
  const { trialCount, sessionId, incrementTrialCount } = useTrialCount();
  const { user } = useAuth();

  const handleStart = () => {
    setStep(1);
    reset();
  };

  const handleReset = () => {
    setStep('idle');
    setCustomer('');
    setProblem('');
    setPainScore(5);
    setValidationLevel('none');
    setMarketSizeChoice('medium');
    setRevenueModelChoice('subscription');
    setWhyNow('');
    setCompetitors('');
    setMoat('');
    setSoloFounder(true);
    setHasTechnicalCofounder(false);
    setTechnicalBackground('no');
    setCurrentStage('forming');
    setLaunchTimeline('');
    setFundingStatus('bootstrapped');
    setContactName('');
    setContactEmail('');
    reset();
  };

  const isStep1Valid = 
    customer.trim().length >= 10 &&
    problem.trim().length >= 10 &&
    whyNow.trim().length >= 10 &&
    competitors.trim().length >= 10 &&
    moat.trim().length >= 10;

  const isStep2Valid = launchTimeline.trim().length >= 3;

  const isStep3Valid = 
    contactName.trim().length >= 2 &&
    contactEmail.trim().match(/.+@.+\..+/);

  const handleNext = () => {
    if (step === 1 && isStep1Valid) {
      setStep(2);
    } else if (step === 2 && isStep2Valid) {
      setStep(3);
    }
  };

  const handleBack = () => {
    if (step === 1) {
      setStep('idle');
    } else if (step === 2) {
      setStep(1);
    } else if (step === 3) {
      setStep(2);
    }
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isStep3Valid) return;

    // Build the consolidated description from customer & problem inputs
    const mainIdeaText = `Target Customer: ${customer}\nProblem Solved: ${problem}`;
    const qaData: QAAnswers = {
      customer,
      problem,
      pain_score: painScore,
      validation_level: validationLevel,
      market_size_choice: marketSizeChoice,
      revenue_model_choice: revenueModelChoice,
      why_now: whyNow,
      competitors,
      moat,
      solo_founder: soloFounder,
      has_technical_cofounder: soloFounder ? false : hasTechnicalCofounder,
      technical_background: technicalBackground,
      current_stage: currentStage,
      launch_timeline: launchTimeline,
      funding_status: fundingStatus,
      contact_name: contactName,
      contact_email: contactEmail,
    };

    setStep('idle'); // clear wizard view when loading/submitting

    const res = await submit(mainIdeaText, trialCount, sessionId, qaData);
    if (res && !user && res.unlocked) {
      incrementTrialCount();
    }

    setTimeout(() => {
      resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const progressPercent = typeof step === 'number' ? (step / 3) * 100 : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Active wizard flow */}
      {step !== 'idle' && typeof step === 'number' && (
        <div
          className="card"
          style={{
            padding: '28px 32px',
            background: 'linear-gradient(135deg, #fff 0%, #F8FAFF 100%)',
            border: '1.5px solid var(--border)',
            position: 'relative',
            animation: 'fadeIn 0.3s ease',
          }}
        >
          {/* Progress bar */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>
                Step {step} of 3 &middot; {step === 1 ? 'About The Idea' : step === 2 ? 'About The Founder' : 'Contact Details'}
              </span>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary)' }}>
                {Math.round(progressPercent)}% complete
              </span>
            </div>
            <div style={{ height: 6, background: 'var(--border)', borderRadius: 999, overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width: `${progressPercent}%`,
                  background: 'linear-gradient(90deg, var(--primary) 0%, #5B8FBF 100%)',
                  borderRadius: 999,
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
          </div>

          <form onSubmit={handleFinalSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* STEP 1: ABOUT THE IDEA */}
            {step === 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                <div>
                  <label htmlFor="customer-input" style={{ fontSize: 14, fontWeight: 700, display: 'block', marginBottom: 6 }}>
                    Who is the customer? <span style={{ color: 'var(--score-red)' }}>*</span>
                  </label>
                  <textarea
                    id="customer-input"
                    className="input"
                    value={customer}
                    onChange={(e) => setCustomer(e.target.value)}
                    placeholder="e.g. Small law firms with 5–20 attorneys..."
                    rows={2}
                    required
                  />
                  {customer.trim().length > 0 && customer.trim().length < 10 && (
                    <span style={{ fontSize: 11, color: 'var(--score-red)' }}>Needs at least 10 characters (current: {customer.trim().length})</span>
                  )}
                </div>

                <div>
                  <label htmlFor="problem-input" style={{ fontSize: 14, fontWeight: 700, display: 'block', marginBottom: 6 }}>
                    What problem does it solve? <span style={{ color: 'var(--score-red)' }}>*</span>
                  </label>
                  <textarea
                    id="problem-input"
                    className="input"
                    value={problem}
                    onChange={(e) => setProblem(e.target.value)}
                    placeholder="e.g. Legal teams spend 40% of their time on repetitive manual research..."
                    rows={2}
                    required
                  />
                  {problem.trim().length > 0 && problem.trim().length < 10 && (
                    <span style={{ fontSize: 11, color: 'var(--score-red)' }}>Needs at least 10 characters (current: {problem.trim().length})</span>
                  )}
                </div>

                <div>
                  <label style={{ fontSize: 14, fontWeight: 700, display: 'block', marginBottom: 6 }}>
                    Pain Score (1-10): <span style={{ fontWeight: 600, color: 'var(--primary)' }}>{painScore}</span>
                  </label>
                  <div style={{ display: 'flex', gap: 6, margin: '8px 0' }}>
                    {Array.from({ length: 10 }, (_, i) => i + 1).map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setPainScore(val)}
                        style={{
                          flex: 1,
                          height: 38,
                          borderRadius: 'var(--radius-sm)',
                          border: `1.5px solid ${painScore === val ? 'var(--primary)' : 'var(--border-strong)'}`,
                          background: painScore === val ? 'var(--primary)' : '#fff',
                          color: painScore === val ? '#fff' : 'var(--text-primary)',
                          fontWeight: 700,
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
                  <div>
                    <label style={{ fontSize: 14, fontWeight: 700, display: 'block', marginBottom: 6 }}>
                      Validation Level
                    </label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {[
                        { key: 'none', label: 'None (Just an idea)' },
                        { key: 'conversations', label: 'Conversations with Users' },
                        { key: 'waitlist', label: 'Waitlist / Signups' },
                        { key: 'paying_customers', label: 'Paying Customers' },
                      ].map((item) => (
                        <label key={item.key} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
                          <input
                            type="radio"
                            name="validationLevel"
                            checked={validationLevel === item.key}
                            onChange={() => setValidationLevel(item.key as any)}
                            style={{ accentColor: 'var(--primary)' }}
                          />
                          {item.label}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: 14, fontWeight: 700, display: 'block', marginBottom: 6 }}>
                      Market Size
                    </label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {[
                        { key: 'small', label: 'Small / Niche Market' },
                        { key: 'medium', label: 'Medium-Sized Market' },
                        { key: 'large', label: 'Large Market' },
                        { key: 'mass_market', label: 'Mass Market' },
                      ].map((item) => (
                        <label key={item.key} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
                          <input
                            type="radio"
                            name="marketSizeChoice"
                            checked={marketSizeChoice === item.key}
                            onChange={() => setMarketSizeChoice(item.key as any)}
                            style={{ accentColor: 'var(--primary)' }}
                          />
                          {item.label}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="revenue-model-select" style={{ fontSize: 14, fontWeight: 700, display: 'block', marginBottom: 6 }}>
                    Revenue Model
                  </label>
                  <select
                    id="revenue-model-select"
                    className="input"
                    value={revenueModelChoice}
                    onChange={(e) => setRevenueModelChoice(e.target.value as any)}
                    style={{ height: 46, padding: '0 12px' }}
                  >
                    <option value="subscription">Subscription / SaaS</option>
                    <option value="transaction_fee">Transaction Fee / Commission</option>
                    <option value="marketplace">Marketplace Take-Rate</option>
                    <option value="licensing">Enterprise Licensing</option>
                    <option value="advertising">Advertising / Sponsorship</option>
                    <option value="one_time">One-Time Purchase</option>
                    <option value="other">Other / Multi-modal</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="why-now-input" style={{ fontSize: 14, fontWeight: 700, display: 'block', marginBottom: 6 }}>
                    Why is this the right time (Why Now)? <span style={{ color: 'var(--score-red)' }}>*</span>
                  </label>
                  <textarea
                    id="why-now-input"
                    className="input"
                    value={whyNow}
                    onChange={(e) => setWhyNow(e.target.value)}
                    placeholder="e.g. Recent advancements in LLM reasoning accuracy make vertical SaaS feasible..."
                    rows={2}
                    required
                  />
                  {whyNow.trim().length > 0 && whyNow.trim().length < 10 && (
                    <span style={{ fontSize: 11, color: 'var(--score-red)' }}>Needs at least 10 characters</span>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
                  <div>
                    <label htmlFor="competitors-input" style={{ fontSize: 14, fontWeight: 700, display: 'block', marginBottom: 6 }}>
                      Competitors <span style={{ color: 'var(--score-red)' }}>*</span>
                    </label>
                    <textarea
                      id="competitors-input"
                      className="input"
                      value={competitors}
                      onChange={(e) => setCompetitors(e.target.value)}
                      placeholder="e.g. Incumbents like Westlaw and Casetext; new niche startups..."
                      rows={2}
                      required
                    />
                    {competitors.trim().length > 0 && competitors.trim().length < 10 && (
                      <span style={{ fontSize: 11, color: 'var(--score-red)' }}>Needs at least 10 characters</span>
                    )}
                  </div>

                  <div>
                    <label htmlFor="moat-input" style={{ fontSize: 14, fontWeight: 700, display: 'block', marginBottom: 6 }}>
                      Moat / Differentiation <span style={{ color: 'var(--score-red)' }}>*</span>
                    </label>
                    <textarea
                      id="moat-input"
                      className="input"
                      value={moat}
                      onChange={(e) => setMoat(e.target.value)}
                      placeholder="e.g. Proprietary fine-tuned citation verification model; deep workflow integrations..."
                      rows={2}
                      required
                    />
                    {moat.trim().length > 0 && moat.trim().length < 10 && (
                      <span style={{ fontSize: 11, color: 'var(--score-red)' }}>Needs at least 10 characters</span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: ABOUT THE FOUNDER */}
            {step === 2 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                <div>
                  <label style={{ fontSize: 14, fontWeight: 700, display: 'block', marginBottom: 6 }}>
                    Are you a solo founder?
                  </label>
                  <div style={{ display: 'flex', gap: 12 }}>
                    <button
                      type="button"
                      onClick={() => setSoloFounder(true)}
                      style={{
                        flex: 1,
                        padding: '12px',
                        borderRadius: 'var(--radius-sm)',
                        border: `1.5px solid ${soloFounder ? 'var(--primary)' : 'var(--border-strong)'}`,
                        background: soloFounder ? 'var(--primary-muted)' : '#fff',
                        color: 'var(--text-primary)',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      👤 Solo Founder
                    </button>
                    <button
                      type="button"
                      onClick={() => setSoloFounder(false)}
                      style={{
                        flex: 1,
                        padding: '12px',
                        borderRadius: 'var(--radius-sm)',
                        border: `1.5px solid ${!soloFounder ? 'var(--primary)' : 'var(--border-strong)'}`,
                        background: !soloFounder ? 'var(--primary-muted)' : '#fff',
                        color: 'var(--text-primary)',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      👥 Co-founders / Team
                    </button>
                  </div>
                </div>

                {!soloFounder && (
                  <div style={{ animation: 'fadeIn 0.2s ease' }}>
                    <label style={{ fontSize: 14, fontWeight: 700, display: 'block', marginBottom: 6 }}>
                      Is there a technical co-founder?
                    </label>
                    <div style={{ display: 'flex', gap: 12 }}>
                      <button
                        type="button"
                        onClick={() => setHasTechnicalCofounder(true)}
                        style={{
                          flex: 1,
                          padding: '10px',
                          borderRadius: 'var(--radius-sm)',
                          border: `1.5px solid ${hasTechnicalCofounder ? 'var(--primary)' : 'var(--border-strong)'}`,
                          background: hasTechnicalCofounder ? 'var(--primary-muted)' : '#fff',
                          color: 'var(--text-primary)',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        💻 Yes, they can code
                      </button>
                      <button
                        type="button"
                        onClick={() => setHasTechnicalCofounder(false)}
                        style={{
                          flex: 1,
                          padding: '10px',
                          borderRadius: 'var(--radius-sm)',
                          border: `1.5px solid ${!hasTechnicalCofounder ? 'var(--primary)' : 'var(--border-strong)'}`,
                          background: !hasTechnicalCofounder ? 'var(--primary-muted)' : '#fff',
                          color: 'var(--text-primary)',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        🚫 No tech co-founder
                      </button>
                    </div>
                  </div>
                )}

                <div>
                  <label style={{ fontSize: 14, fontWeight: 700, display: 'block', marginBottom: 6 }}>
                    What is your technical background?
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
                    {[
                      { key: 'can_code', label: '💻 I can code' },
                      { key: 'used_to_code', label: '⏳ I used to code' },
                      { key: 'no', label: '🚫 Non-technical' },
                    ].map((item) => (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => setTechnicalBackground(item.key as any)}
                        style={{
                          padding: '10px',
                          borderRadius: 'var(--radius-sm)',
                          border: `1.5px solid ${technicalBackground === item.key ? 'var(--primary)' : 'var(--border-strong)'}`,
                          background: technicalBackground === item.key ? 'var(--primary-muted)' : '#fff',
                          color: 'var(--text-primary)',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: 14, fontWeight: 700, display: 'block', marginBottom: 6 }}>
                    Current Stage
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10 }}>
                    {[
                      { key: 'forming', label: ' Forming / Idea' },
                      { key: 'ux_design', label: '🎨 UX Design' },
                      { key: 'prototype', label: '⚙️ Prototype' },
                      { key: 'mvp', label: '🚀 Live MVP' },
                    ].map((item) => (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => setCurrentStage(item.key as any)}
                        style={{
                          padding: '10px',
                          borderRadius: 'var(--radius-sm)',
                          border: `1.5px solid ${currentStage === item.key ? 'var(--primary)' : 'var(--border-strong)'}`,
                          background: currentStage === item.key ? 'var(--primary-muted)' : '#fff',
                          color: 'var(--text-primary)',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label htmlFor="launch-timeline-input" style={{ fontSize: 14, fontWeight: 700, display: 'block', marginBottom: 6 }}>
                    Launch Timeline <span style={{ color: 'var(--score-red)' }}>*</span>
                  </label>
                  <input
                    id="launch-timeline-input"
                    type="text"
                    className="input"
                    value={launchTimeline}
                    onChange={(e) => setLaunchTimeline(e.target.value)}
                    placeholder="e.g. 3 months, or launched 2 weeks ago..."
                    required
                  />
                  {launchTimeline.trim().length > 0 && launchTimeline.trim().length < 3 && (
                    <span style={{ fontSize: 11, color: 'var(--score-red)' }}>Needs at least 3 characters</span>
                  )}
                </div>

                <div>
                  <label style={{ fontSize: 14, fontWeight: 700, display: 'block', marginBottom: 6 }}>
                    Funding Status
                  </label>
                  <div style={{ display: 'flex', gap: 12 }}>
                    {[
                      { key: 'bootstrapped', label: '🌱 Bootstrapped' },
                      { key: 'raising', label: '📈 Raising Seed' },
                      { key: 'raised', label: '💰 Funded' },
                    ].map((item) => (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => setFundingStatus(item.key as any)}
                        style={{
                          flex: 1,
                          padding: '12px',
                          borderRadius: 'var(--radius-sm)',
                          border: `1.5px solid ${fundingStatus === item.key ? 'var(--primary)' : 'var(--border-strong)'}`,
                          background: fundingStatus === item.key ? 'var(--primary-muted)' : '#fff',
                          color: 'var(--text-primary)',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: CONTACT INFORMATION */}
            {step === 3 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                <div>
                  <label htmlFor="contact-name-input" style={{ fontSize: 14, fontWeight: 700, display: 'block', marginBottom: 6 }}>
                    Your Name <span style={{ color: 'var(--score-red)' }}>*</span>
                  </label>
                  <input
                    id="contact-name-input"
                    type="text"
                    className="input"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="e.g. John Doe"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="contact-email-input" style={{ fontSize: 14, fontWeight: 700, display: 'block', marginBottom: 6 }}>
                    Email Address <span style={{ color: 'var(--score-red)' }}>*</span>
                  </label>
                  <input
                    id="contact-email-input"
                    type="email"
                    className="input"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="e.g. john@example.com"
                    required
                  />
                </div>
              </div>
            )}

            {/* Navigation buttons */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24, gap: 12 }}>
              <button type="button" className="btn btn-secondary" onClick={handleBack}>
                &larr; Back
              </button>

              {step < 3 ? (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleNext}
                  disabled={step === 1 ? !isStep1Valid : !isStep2Valid}
                  style={{
                    backgroundImage: (step === 1 ? isStep1Valid : isStep2Valid)
                      ? 'linear-gradient(135deg, #2E5C8A 0%, #4A80B5 50%, #2E5C8A 100%)'
                      : 'none',
                    backgroundSize: '200% 100%',
                  }}
                >
                  Next &rarr;
                </button>
              ) : (
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={!isStep3Valid}
                  style={{
                    backgroundImage: isStep3Valid
                      ? 'linear-gradient(135deg, #2E5C8A 0%, #4A80B5 50%, #2E5C8A 100%)'
                      : 'none',
                    backgroundSize: '200% 100%',
                    minWidth: 200,
                  }}
                >
                  ⚡ Validate My Idea
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {/* Start screen / Idle view */}
      {step === 'idle' && !loading && !result && (
        <div
          className="card"
          style={{
            padding: '40px 32px',
            background: 'linear-gradient(135deg, #fff 0%, #F8FAFF 100%)',
            border: '1.5px solid var(--border)',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 20,
            animation: 'fadeIn 0.3s ease',
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--primary-muted) 0%, rgba(46,92,138,0.2) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 28,
            }}
          >
            ✨
          </div>

          <div>
            <h3 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>
              Start Your Startup Idea Validation
            </h3>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', maxWidth: 500, margin: '0 auto', lineHeight: 1.6 }}>
              Answer a few guided questions one-by-one about your concept. Our AI will analyze your product dimensions and output a detailed scorecard instantly.
            </p>
          </div>

          <button
            className="btn btn-primary btn-lg"
            onClick={handleStart}
            style={{
              minWidth: 240,
              backgroundImage: 'linear-gradient(135deg, #2E5C8A 0%, #4A80B5 50%, #2E5C8A 100%)',
              backgroundSize: '200% 100%',
              marginTop: 12,
            }}
          >
            Start Validation Questionnaire &rarr;
          </button>
        </div>
      )}

      {/* Loading state */}
      {loading && <SkeletonResult />}

      {/* Error display */}
      {error && (
        <div className="card" style={{ padding: 20, border: '1.5px solid var(--score-red-border)', background: 'var(--score-red-bg)' }}>
          <p style={{ color: 'var(--score-red)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
            ⚠️ Error: {error}
          </p>
          <button className="btn btn-secondary btn-sm" onClick={handleReset} style={{ marginTop: 12 }}>
            Try Again
          </button>
        </div>
      )}

      {/* Results View */}
      {result && !loading && (
        <div ref={resultRef} style={{ display: 'flex', flexDirection: 'column', gap: 20, animation: 'fadeInUp 0.5s ease' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>
              Your Results
            </h2>
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={handleReset}
                style={{
                  fontSize: 13,
                  color: 'var(--text-secondary)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 500,
                  textDecoration: 'underline',
                }}
              >
                Validate another idea
              </button>
              <Link
                href={`/result/${result.id}`}
                style={{ fontSize: 13, color: 'var(--primary)', textDecoration: 'none', fontWeight: 500 }}
              >
                View full report &rarr;
              </Link>
            </div>
          </div>

          <ScoreCard
            overallScore={result.overall_score}
            startupQualityScore={result.startup_quality_score}
            investorReadinessScore={result.investor_readiness_score}
            triageBand={result.triage_band as TriageBand}
            ideaText={customer && problem ? `For ${customer}, solving: ${problem}` : ''}
            startupSummary={result.startup_summary}
            whyThisScore={result.why_this_score}
            biggestAssumption={result.biggest_assumption}
            missingEvidence={result.missing_evidence}
            whatIncreasedTheScore={result.what_increased_the_score}
            whatReducedTheScore={result.what_reduced_the_score}
            howToImprove={result.how_to_improve}
            investorQuestions={result.investor_questions}
            highestScoringDimension={result.highest_scoring_dimension}
            lowestScoringDimension={result.lowest_scoring_dimension}
          />

          <DimensionList dimensions={result.dimensions} unlocked={true} />
        </div>
      )}
    </div>
  );
}
