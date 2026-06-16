import { ScoringResponse } from '@/types/scoring';

/**
 * Realistic mock AI response used when USE_MOCK_AI=true or OPENAI_API_KEY is missing.
 * Idea: "An AI-powered legal research assistant for small law firms"
 */
export const MOCK_SCORING_RESPONSE: ScoringResponse = {
  overall_score: 7,
  triage_band: 'Promising / Needs Work',
  dimensions: {
    investor_appeal: {
      score: 7,
      teaser: 'Solid B2B SaaS play with recurring revenue potential.',
      reason:
        'Legal tech is a proven VC category with large TAM. SMB-focused tools trade at lower multiples but show strong retention.',
      risk: 'Enterprise legal AI incumbents may crowd out SMB-focused entrants.',
      recommendation: 'Position around niche practice areas (e.g., immigration, family law) to defensibly own a segment.',
    },
    customer_demand: {
      score: 8,
      teaser: 'Small firms pay to reduce paralegal hours — pain is real.',
      reason:
        'Solo practitioners and small firms spend 30-40% of billable time on research. Willingness to pay is demonstrated by LexisNexis and Westlaw subscriptions.',
      risk: 'Existing tools have high switching costs due to trained workflows.',
      recommendation: 'Lead with a free trial targeting the most painful workflow: case memo generation.',
    },
    market_timing: {
      score: 8,
      teaser: 'LLM capabilities have just hit the accuracy threshold for legal tasks.',
      reason:
        'GPT-4-class models can now pass the bar exam and handle complex reasoning. Courts are establishing AI disclosure rules, creating early-mover advantage.',
      risk: 'Regulatory uncertainty around AI-generated legal advice may slow adoption.',
      recommendation: 'Frame product as "AI research assistant" — not legal advice — to stay compliant.',
    },
    technical_feasibility: {
      score: 7,
      teaser: 'Retrieval-augmented generation over case law is proven tech.',
      reason:
        'RAG pipelines on legal corpora are well-understood. Major legal databases (CourtListener, PACER) offer API access. MVP is achievable in 3-4 months.',
      risk: 'Hallucination in legal citations is a critical liability risk.',
      recommendation: 'Implement citation verification as a first-class feature with confidence scores.',
    },
    competitive_moat: {
      score: 5,
      teaser: 'Network effects are limited; data moat is the key differentiator.',
      reason:
        'No strong network effects inherent to the model. Moat must be built through proprietary training data, integrations with practice management software, and brand trust.',
      risk: 'Harvey, Clio, and Thomson Reuters are all targeting this space with more capital.',
      recommendation: 'Partner with bar associations for distribution and credibility before well-funded competitors lock them in.',
    },
    founder_market_fit: {
      score: 6,
      teaser: 'Domain expertise or a legal co-founder is essential to win here.',
      reason:
        'Legal workflows are deeply nuanced. Founders without JD credentials face trust barriers from potential customers. Technical expertise alone is insufficient.',
      risk: 'Without credibility signals (bar membership, law firm partnerships), sales cycles will be long.',
      recommendation: 'Hire a practicing attorney as a co-founder or advisory board member before launch.',
    },
  },
};

/**
 * Generate a slightly varied mock response for different idea texts.
 * Used to simulate different results per-idea in mock mode.
 */
export function generateMockResponse(ideaText: string): ScoringResponse {
  // Simple deterministic variance based on idea length
  const variance = ideaText.length % 3;
  const scoreShift = variance - 1; // -1, 0, or +1

  const clamp = (n: number) => Math.min(10, Math.max(0, n));

  const base = MOCK_SCORING_RESPONSE;
  const dims = base.dimensions;

  const ia = clamp(dims.investor_appeal.score + scoreShift);
  const cd = clamp(dims.customer_demand.score + scoreShift);
  const mt = clamp(dims.market_timing.score);
  const tf = clamp(dims.technical_feasibility.score - scoreShift);
  const cm = clamp(dims.competitive_moat.score + scoreShift);
  const fmf = clamp(dims.founder_market_fit.score);

  const overall = Math.round(ia * 0.20 + cd * 0.20 + mt * 0.15 + tf * 0.15 + cm * 0.15 + fmf * 0.15);
  const triage_band =
    overall >= 8 ? 'Strong Pass' :
    overall >= 5 ? 'Promising / Needs Work' :
    'Not a Fit (Currently)';

  return {
    ...base,
    overall_score: overall,
    triage_band,
    dimensions: {
      ...dims,
      investor_appeal: { ...dims.investor_appeal, score: ia },
      customer_demand: { ...dims.customer_demand, score: cd },
      technical_feasibility: { ...dims.technical_feasibility, score: tf },
      competitive_moat: { ...dims.competitive_moat, score: cm },
    },
  };
}
