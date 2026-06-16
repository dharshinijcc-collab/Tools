import { TriageBand } from '@/types/scoring';

/**
 * Compute overall score from dimension scores using weighted formula.
 */
export function computeOverallScore(dimensions: {
  investor_appeal: { score: number };
  customer_demand: { score: number };
  market_timing: { score: number };
  technical_feasibility: { score: number };
  competitive_moat: { score: number };
  founder_market_fit: { score: number };
}): number {
  return Math.round(
    dimensions.investor_appeal.score * 0.20 +
    dimensions.customer_demand.score * 0.20 +
    dimensions.market_timing.score * 0.15 +
    dimensions.technical_feasibility.score * 0.15 +
    dimensions.competitive_moat.score * 0.15 +
    dimensions.founder_market_fit.score * 0.15
  );
}

/**
 * Derive triage band from overall score.
 */
export function computeTriageBand(score: number): TriageBand {
  if (score >= 8) return 'Strong Pass';
  if (score >= 5) return 'Promising / Needs Work';
  return 'Not a Fit (Currently)';
}

/**
 * Score color for UI rendering.
 */
export function scoreColor(score: number): string {
  if (score >= 8) return '#2E7D32';
  if (score >= 5) return '#E0A800';
  return '#C0392B';
}
