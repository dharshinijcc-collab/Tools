import { GoogleGenerativeAI, SchemaType, type Schema } from '@google/generative-ai';
import { ExtractedSignals } from '@/types/scoring';
import { RuleEngineOutput } from '@/lib/rule-engine';

let client: GoogleGenerativeAI | null = null;

export function getGeminiClient(): GoogleGenerativeAI {
  if (!client) {
    client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  }
  return client;
}

interface QAAnswers {
  target_audience?: string;
  problem_solved?: string;
  revenue_model?: string;
  competitors?: string;
  founder_background?: string;
  current_stage?: string;
}

/**
 * AI PASS 2 — Narrative Generation
 *
 * The rule engine has already computed scores. The AI's job here is purely
 * to explain WHY those scores make sense, given the detected signals.
 * The AI does NOT re-score — it acts as an analyst narrating predetermined findings.
 *
 * Each dimension gets:
 *   - why_this_score: 150–300 word explanation
 *   - improvement_actions: 3–5 concrete next steps
 *
 * Overall assessment:
 *   - startup_summary, key_strengths, top_risks,
 *     highest_scoring_dimension, lowest_scoring_dimension,
 *     most_important_next_action
 */

function formatSignalsForPrompt(signals: ExtractedSignals): string {
  return `Detected Signals:
  Market Size: ${signals.market_size}
  Revenue Model: ${signals.revenue_model}
  Growth Potential: ${signals.growth_potential}
  Scalability: ${signals.scalability}
  Exit Potential: ${signals.exit_potential}
  Investor Interest in Space: ${signals.investor_interest_in_space}
  Pain Severity: ${signals.pain_severity}
  Problem Frequency: ${signals.problem_frequency}
  Existing Buyers: ${signals.existing_buyers}
  Clear ROI: ${signals.clear_roi}
  Nice-to-Have: ${signals.nice_to_have}
  Willingness to Pay: ${signals.willingness_to_pay}
  Industry Growth: ${signals.industry_growth}
  Technology Maturity: ${signals.technology_maturity}
  Consumer Adoption: ${signals.consumer_adoption}
  Regulatory Environment: ${signals.regulatory_environment}
  Too Early: ${signals.too_early}
  Existing APIs Available: ${signals.existing_apis_available}
  MVP Complexity: ${signals.mvp_complexity}
  Requires New Hardware: ${signals.requires_new_hardware}
  Infrastructure Complexity: ${signals.infrastructure_complexity}
  Has Proprietary Data: ${signals.has_proprietary_data}
  Has Network Effects: ${signals.has_network_effects}
  Switching Costs: ${signals.switching_costs}
  Differentiation: ${signals.differentiation}
  Competition Level: ${signals.competition_level}
  Easy to Copy: ${signals.easy_to_copy}
  Domain Expertise: ${signals.domain_expertise}
  Technical Background: ${signals.technical_background}
  Industry Experience: ${signals.industry_experience}
  Execution Track Record: ${signals.execution_track_record}
  Credibility: ${signals.credibility}`;
}

function formatRuleResultsForPrompt(rules: RuleEngineOutput): string {
  const dims = [
    ['Investor Appeal', rules.investor_appeal],
    ['Customer Demand', rules.customer_demand],
    ['Market Timing', rules.market_timing],
    ['Technical Feasibility', rules.technical_feasibility],
    ['Competitive Moat', rules.competitive_moat],
    ['Founder-Market Fit', rules.founder_market_fit],
  ] as const;

  return dims.map(([label, result]) => {
    const pos = result.positive_signals.join(', ') || 'none';
    const neg = result.negative_signals.join(', ') || 'none';
    return `${label}: ${result.score}/10\n  Positive factors: ${pos}\n  Negative factors: ${neg}`;
  }).join('\n\n');
}

/**
 * Build the narrative prompt for AI Pass 2.
 * The AI receives scores + signals and must explain, not judge.
 */
export function buildNarrativePrompt(
  ideaText: string,
  signals: ExtractedSignals,
  ruleResults: RuleEngineOutput,
  qa?: QAAnswers | null,
): string {
  const qaSection = qa ? (() => {
    const parts: string[] = [];
    if (qa.target_audience?.trim()) parts.push(`Target Customer: ${qa.target_audience.trim()}`);
    if (qa.problem_solved?.trim()) parts.push(`Core Pain Point: ${qa.problem_solved.trim()}`);
    if (qa.revenue_model?.trim()) parts.push(`Revenue Model: ${qa.revenue_model.trim()}`);
    if (qa.competitors?.trim()) parts.push(`Competition: ${qa.competitors.trim()}`);
    if (qa.founder_background?.trim()) parts.push(`Founder Background: ${qa.founder_background.trim()}`);
    if (qa.current_stage?.trim()) parts.push(`Current Stage: ${qa.current_stage.trim()}`);
    return parts.length > 0 ? `\n\n--- FOUNDER CONTEXT ---\n${parts.join('\n')}` : '';
  })() : '';

  return `You are a senior venture capital analyst writing an investor-grade due diligence report.

A scoring engine has already assigned precise scores to this startup idea based on detected signals.
Your ONLY job is to EXPLAIN these scores in clear, specific, investor-grade language.

CRITICAL RULES:
- DO NOT change, dispute, or re-assign any score. The scores are final.
- Every explanation must reference the specific signals that caused the score.
- Avoid generic phrases: "good potential", "promising", "interesting concept", "needs validation".
- Each why_this_score must be 150–300 words. Be specific about WHY — not just WHAT.
- improvement_actions must be concrete and actionable, not vague advice.
- Reference real market dynamics, competitor names, industry specifics where relevant.
- Good: "The market scores high because businesses are already spending $X on similar tools and the sector is growing at Y%."
- Bad: "The market looks promising."

--- STARTUP IDEA ---
${ideaText}${qaSection}

--- COMPUTED SCORES (DO NOT CHANGE THESE) ---
${formatRuleResultsForPrompt(ruleResults)}

--- EXTRACTED SIGNALS ---
${formatSignalsForPrompt(signals)}

For each dimension, write:
1. why_this_score: A detailed 150–300 word explanation referencing the specific signals above
2. improvement_actions: 3–5 concrete, specific next steps to increase this score
3. evaluation_criteria: 4–5 factor labels that describe what was evaluated

For the overall assessment, write:
- startup_summary: 2–3 sentence executive summary of the startup's overall viability
- key_strengths: 3–5 specific strengths identified from the signals
- top_risks: 3–5 specific risks or gaps
- highest_scoring_dimension: The dimension with the best score and one sentence why
- lowest_scoring_dimension: The dimension with the worst score and one sentence why
- most_important_next_action: The single highest-leverage action the founder can take now

Return strict JSON only — no markdown, no commentary.`;
}

// Schema for AI Pass 2 (narrative only — no score fields in dimensions)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const narrativeDimensionSchema: unknown = {
  type: SchemaType.OBJECT,
  properties: {
    evaluation_criteria:  { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
    why_this_score:       { type: SchemaType.STRING },
    improvement_actions:  { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
  },
  required: ['evaluation_criteria', 'why_this_score', 'improvement_actions'],
};

export const NARRATIVE_RESPONSE_SCHEMA: unknown = {
  type: SchemaType.OBJECT,
  properties: {
    startup_summary:              { type: SchemaType.STRING },
    key_strengths:                { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
    top_risks:                    { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
    highest_scoring_dimension:    { type: SchemaType.STRING },
    lowest_scoring_dimension:     { type: SchemaType.STRING },
    most_important_next_action:   { type: SchemaType.STRING },
    dimensions: {
      type: SchemaType.OBJECT,
      properties: {
        investor_appeal:       narrativeDimensionSchema,
        customer_demand:       narrativeDimensionSchema,
        market_timing:         narrativeDimensionSchema,
        technical_feasibility: narrativeDimensionSchema,
        competitive_moat:      narrativeDimensionSchema,
        founder_market_fit:    narrativeDimensionSchema,
      },
      required: [
        'investor_appeal', 'customer_demand', 'market_timing',
        'technical_feasibility', 'competitive_moat', 'founder_market_fit',
      ],
    },
  },
  required: [
    'startup_summary', 'key_strengths', 'top_risks',
    'highest_scoring_dimension', 'lowest_scoring_dimension',
    'most_important_next_action', 'dimensions',
  ],
};

export interface NarrativeResponse {
  startup_summary: string;
  key_strengths: string[];
  top_risks: string[];
  highest_scoring_dimension: string;
  lowest_scoring_dimension: string;
  most_important_next_action: string;
  dimensions: Record<string, {
    evaluation_criteria: string[];
    why_this_score: string;
    improvement_actions: string[];
  }>;
}

/**
 * Call Gemini for Pass 2: narrative generation only.
 * Receives pre-computed scores, returns explanations.
 */
export async function generateNarrative(
  geminiClient: GoogleGenerativeAI,
  ideaText: string,
  signals: ExtractedSignals,
  ruleResults: RuleEngineOutput,
  qa?: QAAnswers | null,
): Promise<NarrativeResponse> {
  const model = geminiClient.getGenerativeModel({
    model: 'gemini-2.5-flash',
    generationConfig: {
      temperature: 0.6, // Higher temp for richer prose
      responseMimeType: 'application/json',
      responseSchema: NARRATIVE_RESPONSE_SCHEMA as Schema,
    },
  });

  const prompt = buildNarrativePrompt(ideaText, signals, ruleResults, qa);
  const result = await model.generateContent(prompt);
  const raw = result.response.text();

  if (!raw) throw new Error('Empty response from Gemini (narrative generation)');
  return JSON.parse(raw) as NarrativeResponse;
}

// ── Legacy export kept for backward compatibility ─────────────────────────────
// The old SYSTEM_PROMPT and buildEnrichedPrompt are no longer used by the hybrid
// flow but kept so any code that still imports them does not break at compile time.

export const SYSTEM_PROMPT = ''; // Replaced by two-pass hybrid system
export const RESPONSE_SCHEMA = NARRATIVE_RESPONSE_SCHEMA; // alias

export function buildEnrichedPrompt(ideaText: string, qaAnswers?: QAAnswers | null): string {
  // No longer used in the hybrid flow — kept for compatibility
  return `${ideaText} ${JSON.stringify(qaAnswers ?? {})}`;
}
