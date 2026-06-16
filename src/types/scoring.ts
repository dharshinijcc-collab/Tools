import { z } from 'zod';

// ── Dimension detail schema ──────────────────────────────────────────────────

export const DimensionDetailSchema = z.object({
  score: z.number().min(0).max(10),
  teaser: z.string(),
  reason: z.string(),
  risk: z.string(),
  recommendation: z.string(),
});

export type DimensionDetail = z.infer<typeof DimensionDetailSchema>;

// ── Full AI response schema ──────────────────────────────────────────────────

export const ScoringResponseSchema = z.object({
  overall_score: z.number().min(0).max(10),
  triage_band: z.enum(['Strong Pass', 'Promising / Needs Work', 'Not a Fit (Currently)']),
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

// ── Dimension metadata (display labels + weights) ────────────────────────────

export const DIMENSION_META = [
  { key: 'investor_appeal',       label: 'Investor Appeal',       weight: 0.20, icon: '💼' },
  { key: 'customer_demand',       label: 'Customer Demand',       weight: 0.20, icon: '🎯' },
  { key: 'market_timing',         label: 'Market Timing',         weight: 0.15, icon: '⏱️' },
  { key: 'technical_feasibility', label: 'Technical Feasibility', weight: 0.15, icon: '⚙️' },
  { key: 'competitive_moat',      label: 'Competitive Moat',      weight: 0.15, icon: '🏰' },
  { key: 'founder_market_fit',    label: 'Founder-Market Fit',    weight: 0.15, icon: '🧭' },
] as const;

export type DimensionKey = typeof DIMENSION_META[number]['key'];

// ── Triage band helpers ──────────────────────────────────────────────────────

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

// ── Stored result type (from DB / API) ──────────────────────────────────────

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

// ── API response shapes ──────────────────────────────────────────────────────

export interface ScoreApiResponse {
  id: string;
  overall_score: number;
  triage_band: TriageBand;
  dimensions: ScoringResponse['dimensions'];
  unlocked: boolean;
}

// ── User plan types ──────────────────────────────────────────────────────────

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
