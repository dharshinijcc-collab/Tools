import { TriageBand } from '@/types/scoring';

interface CoreDimensions {
  investor_appeal: { score: number };
  customer_demand: { score: number };
  market_timing: { score: number };
  technical_feasibility: { score: number };
  competitive_moat: { score: number };
  founder_market_fit: { score: number };
}

/**
 * Compute Startup Quality Score (out of 10)
 * Formula: 0.35 * Customer Demand + 0.30 * Competitive Moat + 0.20 * Technical Feasibility + 0.15 * Founder-Market Fit
 */
export function computeStartupQualityScore(dimensions: CoreDimensions): number {
  const raw =
    dimensions.customer_demand.score * 0.35 +
    dimensions.competitive_moat.score * 0.30 +
    dimensions.technical_feasibility.score * 0.20 +
    dimensions.founder_market_fit.score * 0.15;
  return Math.min(10, Math.max(0, Math.round(raw * 10) / 10));
}

/**
 * Compute Investor Readiness Score (out of 10)
 * Formula: 0.40 * Investor Appeal + 0.30 * Market Timing + 0.15 * Founder-Market Fit + 0.15 * Customer Demand
 * Plus adjustments for stage and validation level
 */
export function computeInvestorReadinessScore(
  dimensions: CoreDimensions,
  validationLevel: 'none' | 'conversations' | 'waitlist' | 'paying_customers' | undefined,
  currentStage: 'forming' | 'ux_design' | 'prototype' | 'mvp' | undefined,
): number {
  let score =
    dimensions.investor_appeal.score * 0.40 +
    dimensions.market_timing.score * 0.30 +
    dimensions.founder_market_fit.score * 0.15 +
    dimensions.customer_demand.score * 0.15;

  // Validation adjustments
  if (validationLevel === 'none') {
    score -= 1.5;
  } else if (validationLevel === 'paying_customers') {
    score += 1.5;
  }

  // Stage adjustments
  if (currentStage === 'forming') {
    score -= 1.5;
  } else if (currentStage === 'mvp') {
    score += 1.0;
  }

  return Math.min(10, Math.max(0, Math.round(score * 10) / 10));
}

/**
 * Compute overall score from dimension scores using weighted formula.
 */
export function computeOverallScore(dimensions: CoreDimensions): number {
  // Let's compute average of quality and readiness as overall score (rounded to integer for DB)
  const quality = computeStartupQualityScore(dimensions);
  const readiness = computeInvestorReadinessScore(dimensions, undefined, undefined);
  return Math.round((quality + readiness) / 2);
}

/**
 * Derive triage band from overall score.
 */
export function computeTriageBand(scoreOrQuality: number, readiness?: number): TriageBand {
  const score = readiness !== undefined ? (scoreOrQuality + readiness) / 2 : scoreOrQuality;
  if (score >= 7.5) return 'Strong Pass';
  if (score >= 4.5) return 'Promising / Needs Work';
  return 'Not a Fit (Currently)';
}

/**
 * Score color for UI rendering.
 */
export function scoreColor(score: number): string {
  if (score >= 7.5) return '#2E7D32';
  if (score >= 4.5) return '#E0A800';
  return '#C0392B';
}

