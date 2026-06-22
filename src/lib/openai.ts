import { GoogleGenerativeAI, SchemaType, type Schema } from '@google/generative-ai';
import { ExtractedSignals, QAAnswers } from '@/types/scoring';
import { RuleEngineOutput } from '@/lib/rule-engine';

let client: GoogleGenerativeAI | null = null;

export function getGeminiClient(): GoogleGenerativeAI {
  if (!client) {
    client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  }
  return client;
}

/**
 * AI PASS 2 — Narrative Generation
 *
 * The rule engine has already computed scores. The AI's job here is purely
 * to explain WHY those scores make sense, given the detected signals.
 * The AI does NOT re-score — it acts as an analyst narrating predetermined findings.
 */

function formatSignalsForPrompt(signals: ExtractedSignals): string {
  return `Detected Signals:
  Market Size Choice: ${signals.market_size_choice}
  Revenue Model Choice: ${signals.revenue_model_choice}
  Why Now Strength: ${signals.why_now_strength}
  Moat Strength: ${signals.moat_strength}
  Validation Level: ${signals.validation_level}
  Pain Score: ${signals.pain_score}
  Founder Count: ${signals.founder_count}
  Has Technical Co-founder: ${signals.has_technical_cofounder}
  Technical Background Choice: ${signals.technical_background_choice}
  Current Stage: ${signals.current_stage}
  Funding Status: ${signals.funding_status}
  Market Size (extracted): ${signals.market_size}
  Revenue Model (extracted): ${signals.revenue_model}
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
 */
export function buildNarrativePrompt(
  ideaText: string,
  signals: ExtractedSignals,
  ruleResults: RuleEngineOutput,
  qa?: QAAnswers | null,
): string {
  const qaSection = qa ? (() => {
    const parts: string[] = [];
    parts.push(`Target Customer: ${qa.customer}`);
    parts.push(`Core Problem: ${qa.problem}`);
    parts.push(`Pain Score (1-10): ${qa.pain_score}`);
    parts.push(`Validation Level: ${qa.validation_level}`);
    parts.push(`Market Size Choice: ${qa.market_size_choice}`);
    parts.push(`Revenue Model Choice: ${qa.revenue_model_choice}`);
    parts.push(`Why Now: ${qa.why_now}`);
    parts.push(`Competition: ${qa.competitors}`);
    parts.push(`Moat / Differentiation: ${qa.moat}`);
    parts.push(`Solo Founder: ${qa.solo_founder ? 'Yes' : 'No'}`);
    if (!qa.solo_founder) {
      parts.push(`Technical Co-founder Present: ${qa.has_technical_cofounder ? 'Yes' : 'No'}`);
    }
    parts.push(`Technical Background: ${qa.technical_background}`);
    parts.push(`Current Stage: ${qa.current_stage}`);
    parts.push(`Launch Timeline: ${qa.launch_timeline}`);
    parts.push(`Funding Status: ${qa.funding_status}`);
    return `\n\n--- FOUNDER CONTEXT ---\n${parts.join('\n')}`;
  })() : '';

  return `You are a senior venture capital analyst writing an investor-grade due diligence report.

A scoring engine has already assigned precise scores to this startup idea based on detected signals.
Your ONLY job is to EXPLAIN these scores in clear, specific, investor-grade language.

CRITICAL RULES:
- DO NOT change, dispute, or re-assign any score. The scores are final.
- Every explanation must reference the specific signals that caused the score.
- Avoid generic phrases: "good potential", "promising", "interesting concept".
- Each why_this_score must be 150–300 words. Be specific about WHY — not just WHAT.
- Reference real market dynamics, competitor names, industry specifics where relevant.
- You must identify the "biggest_assumption" (the primary unvalidated leap-of-faith assumption).
- You must identify the "missing_evidence" (the single most critical missing proof point).
- For overall "how_to_improve", provide exactly 3 specific, highly-actionable next actions.
- For overall "investor_questions", provide exactly 3 specific questions that investors will ask next.

--- STARTUP IDEA ---
${ideaText}${qaSection}

--- COMPUTED SCORES (DO NOT CHANGE THESE) ---
${formatRuleResultsForPrompt(ruleResults)}

--- EXTRACTED SIGNALS ---
${formatSignalsForPrompt(signals)}

For each dimension in the dimensions object, write:
1. why_this_score: A detailed 150–300 word explanation referencing the specific signals above
2. improvement_actions: 3–5 concrete, specific next steps to increase this score
3. evaluation_criteria: 4–5 factor labels that describe what was evaluated

For the overall assessment, write:
- startup_summary: 2–3 sentence executive summary of the startup's overall viability
- why_this_score: 150-250 word detailed explanation of the overall score (addressing the balance between Startup Quality and Investor Readiness)
- biggest_assumption: The single largest unvalidated assumption this business relies on (e.g. "Solo law firms will trust AI-generated briefs without manual lawyer review.")
- missing_evidence: The most critical missing proof point (e.g. "No evidence that founders can acquire customers at a cost lower than the contract value.")
- what_increased_the_score: 3-5 specific strengths identified from the signals
- what_reduced_the_score: 3-5 specific risks or gaps
- how_to_improve: exactly 3 specific next actions the founder can take now
- investor_questions: exactly 3 specific questions that investors will likely ask next

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
    why_this_score:               { type: SchemaType.STRING },
    biggest_assumption:           { type: SchemaType.STRING },
    missing_evidence:             { type: SchemaType.STRING },
    what_increased_the_score:     { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
    what_reduced_the_score:       { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
    how_to_improve:               { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
    investor_questions:           { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
    highest_scoring_dimension:    { type: SchemaType.STRING },
    lowest_scoring_dimension:     { type: SchemaType.STRING },
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
    'startup_summary', 'why_this_score', 'biggest_assumption', 'missing_evidence',
    'what_increased_the_score', 'what_reduced_the_score', 'how_to_improve',
    'investor_questions', 'highest_scoring_dimension', 'lowest_scoring_dimension', 'dimensions',
  ],
};

export interface NarrativeResponse {
  startup_summary: string;
  why_this_score: string;
  biggest_assumption: string;
  missing_evidence: string;
  what_increased_the_score: string[];
  what_reduced_the_score: string[];
  how_to_improve: string[];
  investor_questions: string[];
  highest_scoring_dimension: string;
  lowest_scoring_dimension: string;
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
    model: 'gemini-1.5-flash',
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
