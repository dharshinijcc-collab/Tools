import { GoogleGenerativeAI, SchemaType, type Schema } from '@google/generative-ai';
import { ExtractedSignals } from '@/types/scoring';

/**
 * AI PASS 1 — Signal Extraction
 *
 * The AI's only job here is to read the startup idea and Q&A answers,
 * then output structured categorical signals. It never assigns scores.
 * Scores are determined deterministically by the rule engine in rule-engine.ts.
 */

const SIGNAL_EXTRACTION_PROMPT = `You are a startup analyst. Your ONLY job is to extract factual, observable signals from a startup idea description. You must NOT assign scores, ratings, or judgements.

Read the startup idea and output categorical signals using the exact values specified in the schema.

RULES:
- Use "unknown" when you cannot confidently determine a signal from the provided information
- Be conservative: only mark "existing_buyers: true" if there is clear evidence of paying customers
- Do not infer beyond what is explicitly stated or strongly implied
- "domain_expertise: expert" requires direct evidence the founder has deep, practitioner-level knowledge
- "has_proprietary_data: true" requires evidence of unique, defensible data assets — not just "will collect data"
- "too_early: true" means the market or technology clearly does not exist yet at commercial scale

Output strict JSON matching the schema. No commentary.`;

interface QAContext {
  target_audience?: string;
  problem_solved?: string;
  revenue_model?: string;
  competitors?: string;
  founder_background?: string;
  current_stage?: string;
}

function buildSignalPrompt(ideaText: string, qa?: QAContext | null): string {
  let prompt = `${SIGNAL_EXTRACTION_PROMPT}\n\n--- STARTUP IDEA ---\n${ideaText}`;
  if (qa) {
    const parts: string[] = [];
    if (qa.target_audience?.trim()) parts.push(`Target Customer: ${qa.target_audience.trim()}`);
    if (qa.problem_solved?.trim()) parts.push(`Core Pain Point: ${qa.problem_solved.trim()}`);
    if (qa.revenue_model?.trim()) parts.push(`Revenue Model: ${qa.revenue_model.trim()}`);
    if (qa.competitors?.trim()) parts.push(`Competition: ${qa.competitors.trim()}`);
    if (qa.founder_background?.trim()) parts.push(`Founder Background: ${qa.founder_background.trim()}`);
    if (qa.current_stage?.trim()) parts.push(`Current Stage: ${qa.current_stage.trim()}`);
    if (parts.length > 0) {
      prompt += `\n\n--- FOUNDER CONTEXT ---\n${parts.join('\n')}`;
    }
  }
  return prompt;
}

// Gemini structured output schema for signal extraction
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SIGNAL_SCHEMA: unknown = {
  type: SchemaType.OBJECT,
  properties: {
    // Market / Business
    market_size:                  { type: SchemaType.STRING, enum: ['large', 'medium', 'small', 'unknown'] },
    revenue_model:                { type: SchemaType.STRING, enum: ['subscription', 'usage_based', 'one_time', 'marketplace', 'freemium', 'unknown'] },
    growth_potential:             { type: SchemaType.STRING, enum: ['high', 'medium', 'low', 'unknown'] },
    scalability:                  { type: SchemaType.STRING, enum: ['high', 'moderate', 'low', 'unknown'] },
    exit_potential:               { type: SchemaType.STRING, enum: ['high', 'medium', 'low', 'unknown'] },
    investor_interest_in_space:   { type: SchemaType.STRING, enum: ['high', 'medium', 'low', 'unknown'] },

    // Customer Demand
    pain_severity:     { type: SchemaType.STRING, enum: ['severe', 'moderate', 'mild', 'unknown'] },
    problem_frequency: { type: SchemaType.STRING, enum: ['daily', 'weekly', 'occasional', 'rare', 'unknown'] },
    existing_buyers:   { type: SchemaType.BOOLEAN },
    clear_roi:         { type: SchemaType.BOOLEAN },
    nice_to_have:      { type: SchemaType.BOOLEAN },
    willingness_to_pay:{ type: SchemaType.STRING, enum: ['high', 'medium', 'low', 'unknown'] },

    // Market Timing
    industry_growth:       { type: SchemaType.STRING, enum: ['fast', 'moderate', 'slow', 'declining', 'unknown'] },
    technology_maturity:   { type: SchemaType.STRING, enum: ['ready', 'emerging', 'not_ready', 'unknown'] },
    consumer_adoption:     { type: SchemaType.STRING, enum: ['growing', 'early', 'mass_market', 'unknown'] },
    regulatory_environment:{ type: SchemaType.STRING, enum: ['supportive', 'neutral', 'restrictive', 'unknown'] },
    too_early:             { type: SchemaType.BOOLEAN },

    // Technical Feasibility
    existing_apis_available:    { type: SchemaType.BOOLEAN },
    mvp_complexity:             { type: SchemaType.STRING, enum: ['simple', 'moderate', 'complex', 'research_required', 'unknown'] },
    requires_new_hardware:      { type: SchemaType.BOOLEAN },
    ai_dependency:              { type: SchemaType.STRING, enum: ['core', 'supporting', 'none', 'unknown'] },
    infrastructure_complexity:  { type: SchemaType.STRING, enum: ['low', 'medium', 'high', 'unknown'] },

    // Competitive Moat
    has_proprietary_data: { type: SchemaType.BOOLEAN },
    has_network_effects:  { type: SchemaType.BOOLEAN },
    switching_costs:      { type: SchemaType.STRING, enum: ['high', 'medium', 'low', 'unknown'] },
    differentiation:      { type: SchemaType.STRING, enum: ['strong', 'moderate', 'weak', 'unknown'] },
    competition_level:    { type: SchemaType.STRING, enum: ['low', 'medium', 'high', 'very_high', 'unknown'] },
    easy_to_copy:         { type: SchemaType.BOOLEAN },

    // Founder-Market Fit
    domain_expertise:       { type: SchemaType.STRING, enum: ['expert', 'experienced', 'learning', 'none', 'unknown'] },
    technical_background:   { type: SchemaType.BOOLEAN },
    industry_experience:    { type: SchemaType.STRING, enum: ['deep', 'some', 'none', 'unknown'] },
    execution_track_record: { type: SchemaType.STRING, enum: ['strong', 'some', 'none', 'unknown'] },
    credibility:            { type: SchemaType.STRING, enum: ['high', 'medium', 'low', 'unknown'] },
  },
  required: [
    'market_size', 'revenue_model', 'growth_potential', 'scalability', 'exit_potential', 'investor_interest_in_space',
    'pain_severity', 'problem_frequency', 'existing_buyers', 'clear_roi', 'nice_to_have', 'willingness_to_pay',
    'industry_growth', 'technology_maturity', 'consumer_adoption', 'regulatory_environment', 'too_early',
    'existing_apis_available', 'mvp_complexity', 'requires_new_hardware', 'ai_dependency', 'infrastructure_complexity',
    'has_proprietary_data', 'has_network_effects', 'switching_costs', 'differentiation', 'competition_level', 'easy_to_copy',
    'domain_expertise', 'technical_background', 'industry_experience', 'execution_track_record', 'credibility',
  ],
};

/**
 * Extract signals from a startup idea using AI (Pass 1).
 * Returns structured categorical signals — no scores.
 */
export async function extractSignals(
  geminiClient: GoogleGenerativeAI,
  ideaText: string,
  qa?: QAContext | null,
): Promise<ExtractedSignals> {
  const model = geminiClient.getGenerativeModel({
    model: 'gemini-2.5-flash',
    generationConfig: {
      temperature: 0.1, // Low temperature for factual extraction
      responseMimeType: 'application/json',
      responseSchema: SIGNAL_SCHEMA as Schema,
    },
  });

  const prompt = buildSignalPrompt(ideaText, qa);
  const result = await model.generateContent(prompt);
  const raw = result.response.text();

  if (!raw) throw new Error('Empty response from Gemini (signal extraction)');

  const parsed = JSON.parse(raw) as ExtractedSignals;
  return parsed;
}

/**
 * Count how many Q&A fields the founder answered.
 * Used to calculate base confidence level.
 */
export function countQAAnswered(qa?: QAContext | null): { answered: number; total: number } {
  const total = 6; // target_audience, problem_solved, revenue_model, competitors, founder_background, current_stage
  if (!qa) return { answered: 0, total };
  const answered = [
    qa.target_audience,
    qa.problem_solved,
    qa.revenue_model,
    qa.competitors,
    qa.founder_background,
    qa.current_stage,
  ].filter((v) => v && v.trim().length >= 5).length;
  return { answered, total };
}
