'use client';

import { useState, useRef } from 'react';
import { useScoring } from '@/hooks/useScoring';
import { useTrialCount } from '@/hooks/useTrialCount';
import { useAuth } from '@/hooks/useAuth';
import ScoreCard from './ScoreCard';
import DimensionList from './DimensionList';
import BlurGate from './BlurGate';
import SkeletonResult from './SkeletonResult';
import { TriageBand } from '@/types/scoring';
import Link from 'next/link';

interface Question {
  id: string;
  label: string;
  question: string;
  placeholder: string;
  icon: string;
  dimension: string;
  minLength: number;
}

const WIZARD_QUESTIONS: Question[] = [
  {
    id: 'idea_text',
    label: 'The Idea',
    question: 'Describe your startup idea',
    placeholder: 'e.g. An AI-powered legal research assistant that helps small law firms draft briefs in half the time...',
    icon: '💡',
    dimension: 'Core Concept',
    minLength: 10,
  },
  {
    id: 'target_audience',
    label: 'Audience',
    question: 'Who is your primary target customer?',
    placeholder: 'e.g. Small law firms with 5–20 attorneys, or B2B SaaS companies struggling with compliance...',
    icon: '🎯',
    dimension: 'Customer Demand',
    minLength: 10,
  },
  {
    id: 'problem_solved',
    label: 'Problem',
    question: 'What specific pain point does your idea solve?',
    placeholder: 'e.g. Legal teams spend 40% of their time on repetitive research tasks that could be automated...',
    icon: '🔥',
    dimension: 'Customer Demand',
    minLength: 10,
  },
  {
    id: 'revenue_model',
    label: 'Revenue',
    question: 'How do you plan to generate revenue?',
    placeholder: 'e.g. Monthly SaaS subscription of $299/seat, or usage-based pricing per API call...',
    icon: '💰',
    dimension: 'Investor Appeal',
    minLength: 10,
  },
  {
    id: 'competitors',
    label: 'Competitors',
    question: 'Who are your main competitors and what makes you different?',
    placeholder: 'e.g. Westlaw and LexisNexis exist but are expensive and not AI-native. We are 10x cheaper and auto-draft briefs...',
    icon: '🏰',
    dimension: 'Competitive Moat',
    minLength: 10,
  },
  {
    id: 'founder_background',
    label: 'Founder',
    question: 'What is your relevant background or domain expertise?',
    placeholder: 'e.g. I was a practicing attorney for 8 years and have co-founded a legal tech startup before...',
    icon: '🧭',
    dimension: 'Founder-Market Fit',
    minLength: 10,
  },
  {
    id: 'current_stage',
    label: 'Stage',
    question: 'What stage is your idea at right now?',
    placeholder: 'e.g. Pre-idea (just thinking), have an MVP with 3 beta users, or raised a pre-seed and launching next month...',
    icon: '🚀',
    dimension: 'Technical Feasibility',
    minLength: 5,
  },
];

export default function ScoringWidget() {
  const [step, setStep] = useState<'idle' | number>('idle');
  const [answers, setAnswers] = useState<Record<string, string>>({
    idea_text: '',
    target_audience: '',
    problem_solved: '',
    revenue_model: '',
    competitors: '',
    founder_background: '',
    current_stage: '',
  });

  const resultRef = useRef<HTMLDivElement>(null);
  const { submit, loading, error, result, reset } = useScoring();
  const { trialCount, sessionId, canUseTrial, isReady, incrementTrialCount } = useTrialCount();
  const { user } = useAuth();

  const handleStart = () => {
    setStep(0);
    reset();
  };

  const handleReset = () => {
    setStep('idle');
    setAnswers({
      idea_text: '',
      target_audience: '',
      problem_solved: '',
      revenue_model: '',
      competitors: '',
      founder_background: '',
      current_stage: '',
    });
    reset();
  };

  const handleNext = () => {
    if (step === 'idle') return;
    const currentQuestion = WIZARD_QUESTIONS[step];
    const answer = answers[currentQuestion.id] || '';
    if (answer.trim().length < currentQuestion.minLength) return;

    if (step === WIZARD_QUESTIONS.length - 1) {
      handleFinalSubmit();
    } else {
      setStep((s) => (typeof s === 'number' ? s + 1 : 0));
    }
  };

  const handleBack = () => {
    if (step === 'idle') return;
    if (step === 0) {
      setStep('idle');
    } else {
      setStep((s) => (typeof s === 'number' ? s - 1 : 0));
    }
  };

  const handleSkipAndAnalyze = () => {
    if (step === 'idle') return;
    // We must have at least the main idea text filled in (step 0)
    const ideaVal = answers['idea_text'] || '';
    if (ideaVal.trim().length < WIZARD_QUESTIONS[0].minLength) return;
    handleFinalSubmit();
  };

  const handleFinalSubmit = async () => {
    const mainIdeaText = answers['idea_text'] || '';
    const qaData = {
      target_audience: answers['target_audience'] || '',
      problem_solved: answers['problem_solved'] || '',
      revenue_model: answers['revenue_model'] || '',
      competitors: answers['competitors'] || '',
      founder_background: answers['founder_background'] || '',
      current_stage: answers['current_stage'] || '',
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      if (step !== 'idle') {
        const currentQuestion = WIZARD_QUESTIONS[step];
        const answer = answers[currentQuestion.id] || '';
        if (answer.trim().length >= currentQuestion.minLength) {
          handleNext();
        }
      }
    }
  };

  const currentQuestion = typeof step === 'number' ? WIZARD_QUESTIONS[step] : null;
  const currentAnswer = currentQuestion ? answers[currentQuestion.id] || '' : '';
  const isCurrentValid = currentQuestion ? currentAnswer.trim().length >= currentQuestion.minLength : false;
  const progressPercent = typeof step === 'number' ? ((step + 1) / WIZARD_QUESTIONS.length) * 100 : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Active wizard flow */}
      {step !== 'idle' && currentQuestion && (
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
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>
                Step {step + 1} of {WIZARD_QUESTIONS.length} &middot; {currentQuestion.label}
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

          {/* Question info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <span style={{ fontSize: 22 }}>{currentQuestion.icon}</span>
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: 'var(--primary)',
                background: 'var(--primary-muted)',
                borderRadius: 999,
                padding: '2px 10px',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}
            >
              {currentQuestion.dimension}
            </span>
          </div>

          <label
            htmlFor={`wizard-qa-${currentQuestion.id}`}
            style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: 12 }}
          >
            {currentQuestion.question}
          </label>

          <textarea
            id={`wizard-qa-${currentQuestion.id}`}
            className="input"
            value={currentAnswer}
            onChange={(e) => setAnswers({ ...answers, [currentQuestion.id]: e.target.value })}
            onKeyDown={handleKeyDown}
            placeholder={currentQuestion.placeholder}
            rows={4}
            autoFocus
            style={{
              resize: 'vertical',
              minHeight: 100,
              fontFamily: 'inherit',
              border: `1.5px solid ${isCurrentValid ? 'var(--primary)' : 'var(--border-strong)'}`,
            }}
          />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              {isCurrentValid ? '✓ Meets minimum length' : `Min ${currentQuestion.minLength} characters`}
            </span>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              Cmd+Enter to continue
            </span>
          </div>

          {/* Navigation Controls */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 24, gap: 12 }}>
            <button className="btn btn-secondary" onClick={handleBack}>
              &larr; Back
            </button>

            <div style={{ display: 'flex', gap: 12 }}>
              {step > 0 && (
                <button
                  className="btn btn-ghost"
                  onClick={handleSkipAndAnalyze}
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Skip & Analyze
                </button>
              )}

              <button
                className="btn btn-primary"
                onClick={handleNext}
                disabled={!isCurrentValid}
                style={{
                  backgroundImage: !isCurrentValid
                    ? 'none'
                    : 'linear-gradient(135deg, #2E5C8A 0%, #4A80B5 50%, #2E5C8A 100%)',
                  backgroundSize: '200% 100%',
                }}
              >
                {step === WIZARD_QUESTIONS.length - 1 ? '⚡ Analyze My Idea' : 'Next →'}
              </button>
            </div>
          </div>
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
            triageBand={result.triage_band as TriageBand}
            ideaText={answers['idea_text'] || ''}
          />

          <DimensionList dimensions={result.dimensions} unlocked={true} />
        </div>
      )}
    </div>
  );
}
