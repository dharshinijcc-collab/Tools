import { z } from 'zod';

// ── Extracted Signals (AI Pass 1) ─────────────────────────────────────────────
// Flat signal object extracted by AI from the startup idea text.
// These are categorical/boolean values — AI never assigns scores directly.

export interface ExtractedSignals {
  // Market / Business
  market_size: 'large' | 'medium' | 'small' | 'unknown';
  revenue_model: 'subscription' | 'usage_based' | 'one_time' | 'marketplace' | 'freemium' | 'unknown';
  growth_potential: 'high' | 'medium' | 'low' | 'unknown';
  scalability: 'high' | 'moderate' | 'low' | 'unknown';
  exit_potential: 'high' | 'medium' | 'low' | 'unknown';
  investor_interest_in_space: 'high' | 'medium' | 'low' | 'unknown';

  // Customer Demand
  pain_severity: 'severe' | 'moderate' | 'mild' | 'unknown';
  problem_frequency: 'daily' | 'weekly' | 'occasional' | 'rare' | 'unknown';
  existing_buyers: boolean;
  clear_roi: boolean;
  nice_to_have: boolean;
  willingness_to_pay: 'high' | 'medium' | 'low' | 'unknown';

  // Market Timing
  industry_growth: 'fast' | 'moderate' | 'slow' | 'declining' | 'unknown';
  technology_maturity: 'ready' | 'emerging' | 'not_ready' | 'unknown';
  consumer_adoption: 'growing' | 'early' | 'mass_market' | 'unknown';
  regulatory_environment: 'supportive' | 'neutral' | 'restrictive' | 'unknown';
  too_early: boolean;

  // Technical Feasibility
  existing_apis_available: boolean;
  mvp_complexity: 'simple' | 'moderate' | 'complex' | 'research_required' | 'unknown';
  requires_new_hardware: boolean;
  ai_dependency: 'core' | 'supporting' | 'none' | 'unknown';
  infrastructure_complexity: 'low' | 'medium' | 'high' | 'unknown';

  // Competitive Moat
  has_proprietary_data: boolean;
  has_network_effects: boolean;
  switching_costs: 'high' | 'medium' | 'low' | 'unknown';
  differentiation: 'strong' | 'moderate' | 'weak' | 'unknown';
  competition_level: 'low' | 'medium' | 'high' | 'very_high' | 'unknown';
  easy_to_copy: boolean;

  // Founder-Market Fit
  domain_expertise: 'expert' | 'experienced' | 'learning' | 'none' | 'unknown';
  technical_background: boolean;
  industry_experience: 'deep' | 'some' | 'none' | 'unknown';
  execution_track_record: 'strong' | 'some' | 'none' | 'unknown';
  credibility: 'high' | 'medium' | 'low' | 'unknown';
}

// ── Scoring Factor (Rule Engine output per factor) ────────────────────────────
// Represents a single factor in the rule table that was evaluated.

export interface ScoringFactor {
  label: string;           // Human-readable factor name e.g. "Large Addressable Market"
  points: number;          // Points contributed (+2, -1 etc.)
  detected: boolean;       // Whether this factor was triggered for this idea
  signal_key: string;      // Which signal triggered this (for debugging)
}

// ── Dimension Rule Result (output of rule engine for one dimension) ────────────

export interface DimensionRuleResult {
  score: number;                     // 0–10 computed from rule table
  confidence: number;                // 0–100 based on signals available
  factors: ScoringFactor[];          // All factors evaluated (detected + not)
  active_factors: ScoringFactor[];   // Only factors that fired (detected=true)
  positive_signals: string[];        // Labels of positive factors that fired
  negative_signals: string[];        // Labels of negative factors that fired
}

// ── Dimension detail schema ───────────────────────────────────────────────────
// This is the full DimensionDetail shape stored in DB and returned from API.
// scoring_factors contains the rule-engine breakdown for the "How We Calculated This" UI.

export const DimensionDetailSchema = z.object({
  score: z.number().min(0).max(10),
  confidence: z.number().min(0).max(100),
  evaluation_criteria: z.array(z.string()),
  why_this_score: z.string(),
  positive_signals: z.array(z.string()),
  negative_signals: z.array(z.string()),
  improvement_actions: z.array(z.string()),
  scoring_factors: z.array(z.object({
    label: z.string(),
    points: z.number(),
    detected: z.boolean(),
    signal_key: z.string(),
  })).optional(),
});

export type DimensionDetail = z.infer<typeof DimensionDetailSchema>;

// ── Full AI response schema ───────────────────────────────────────────────────

export const ScoringResponseSchema = z.object({
  overall_score: z.number().min(0).max(10),
  triage_band: z.enum(['Strong Pass', 'Promising / Needs Work', 'Not a Fit (Currently)']),
  confidence_level: z.number().min(0).max(100),
  startup_summary: z.string(),
  key_strengths: z.array(z.string()),
  top_risks: z.array(z.string()),
  highest_scoring_dimension: z.string(),
  lowest_scoring_dimension: z.string(),
  most_important_next_action: z.string(),
  dimensions: z.object({
    investor_appeal: DimensionDetailSchema,
    customer_demand: DimensionDetailSchema,
    market_timing: DimensionDetailSchema,
    technical_feasibility: DimensionDetailSchema,
    competitive_moat: DimensionDetailSchema,
    founder_market_fit: DimensionDetailSchema,
  }),
});

export type ScoringResponse = z.infer<typeof ScoringResponseSchema>;

// ── Dimension metadata (display labels + weights) ─────────────────────────────

export const DIMENSION_META = [
  { key: 'investor_appeal',       label: 'Investor Appeal',       weight: 0.20, icon: '💼' },
  { key: 'customer_demand',       label: 'Customer Demand',       weight: 0.20, icon: '🎯' },
  { key: 'market_timing',         label: 'Market Timing',         weight: 0.15, icon: '⏱️' },
  { key: 'technical_feasibility', label: 'Technical Feasibility', weight: 0.15, icon: '⚙️' },
  { key: 'competitive_moat',      label: 'Competitive Moat',      weight: 0.15, icon: '🏰' },
  { key: 'founder_market_fit',    label: 'Founder-Market Fit',    weight: 0.15, icon: '🧭' },
] as const;

export type DimensionKey = typeof DIMENSION_META[number]['key'];

// ── Triage band helpers ───────────────────────────────────────────────────────

export type TriageBand = ScoringResponse['triage_band'];

export const TRIAGE_CONFIG: Record<TriageBand, { color: string; bg: string; border: string; label: string }> = {
  'Strong Pass': {
    color: '#2E7D32',
    bg: '#E8F5E9',
    border: '#A5D6A7',
    label: 'Strong Pass',
  },
  'Promising / Needs Work': {
    color: '#E0A800',
    bg: '#FFF8E1',
    border: '#FFE082',
    label: 'Promising / Needs Work',
  },
  'Not a Fit (Currently)': {
    color: '#C0392B',
    bg: '#FFEBEE',
    border: '#EF9A9A',
    label: 'Not a Fit (Currently)',
  },
};

// ── Stored result type (from DB / API) ────────────────────────────────────────

export interface StoredResult {
  id: string;
  user_id: string | null;
  idea_text: string;
  response: ScoringResponse;
  overall_score: number;
  triage_band: TriageBand;
  unlocked: boolean;
  created_at: string;
}

export interface ResultDetailResponse {
  id: string;
  idea_text: string;
  overall_score: number;
  triage_band: TriageBand;
  dimensions: ScoringResponse['dimensions'];
  unlocked: boolean;
  created_at: string;
}

// ── API response shapes ───────────────────────────────────────────────────────

export interface ScoreApiResponse {
  id: string;
  overall_score: number;
  triage_band: TriageBand;
  confidence_level: number;
  startup_summary: string;
  key_strengths: string[];
  top_risks: string[];
  highest_scoring_dimension: string;
  lowest_scoring_dimension: string;
  most_important_next_action: string;
  dimensions: ScoringResponse['dimensions'];
  unlocked: boolean;
}

// ── User plan types ───────────────────────────────────────────────────────────

export type Plan = 'free' | 'pro';

export interface UserProfile {
  id: string;
  plan: Plan;
  free_reports_used: number;
  created_at: string;
}

export interface QAAnswers {
  target_audience: string;
  problem_solved: string;
  revenue_model: string;
  competitors: string;
  founder_background: string;
  current_stage: string;
}
