import { GoogleGenerativeAI, SchemaType, type Schema } from '@google/generative-ai';
import { ExtractedSignals, QAAnswers } from '@/types/scoring';

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
- Estimate "moat_strength" ('strong' | 'moderate' | 'weak') based on Moat and Competitors description.
- Estimate "why_now_strength" ('strong' | 'moderate' | 'weak') based on Why Now description.

Output strict JSON matching the schema. No commentary.`;

function buildSignalPrompt(ideaText: string, qa?: QAAnswers | null): string {
  let prompt = `${SIGNAL_EXTRACTION_PROMPT}\n\n--- STARTUP IDEA ---\n${ideaText}`;
  if (qa) {
    prompt += `\n\n--- FOUNDER ANSWERS ---\n`;
    prompt += `- Target Customer: ${qa.customer}\n`;
    prompt += `- Core Problem: ${qa.problem}\n`;
    prompt += `- Pain Score (1-10): ${qa.pain_score}\n`;
    prompt += `- Validation Level: ${qa.validation_level}\n`;
    prompt += `- Market Size Choice: ${qa.market_size_choice}\n`;
    prompt += `- Revenue Model Choice: ${qa.revenue_model_choice}\n`;
    prompt += `- Why Now: ${qa.why_now}\n`;
    prompt += `- Competitors: ${qa.competitors}\n`;
    prompt += `- Moat / Differentiation: ${qa.moat}\n`;
    prompt += `- Solo Founder: ${qa.solo_founder ? 'Yes' : 'No'}\n`;
    if (!qa.solo_founder) {
      prompt += `- Technical Co-founder Present: ${qa.has_technical_cofounder ? 'Yes' : 'No'}\n`;
    }
    prompt += `- Technical Background: ${qa.technical_background}\n`;
    prompt += `- Current Stage: ${qa.current_stage}\n`;
    prompt += `- Launch Timeline: ${qa.launch_timeline}\n`;
    prompt += `- Funding Status: ${qa.funding_status}\n`;
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

    // NEW EXTRACTED SIGNALS
    moat_strength:               { type: SchemaType.STRING, enum: ['weak', 'moderate', 'strong'] },
    why_now_strength:            { type: SchemaType.STRING, enum: ['strong', 'moderate', 'weak'] },
    validation_level:            { type: SchemaType.STRING, enum: ['none', 'conversations', 'waitlist', 'paying_customers'] },
    pain_score:                  { type: SchemaType.INTEGER },
    technical_background_choice: { type: SchemaType.STRING, enum: ['can_code', 'used_to_code', 'no'] },
    founder_count:               { type: SchemaType.STRING, enum: ['solo', 'team'] },
    has_technical_cofounder:     { type: SchemaType.BOOLEAN },
    funding_status:              { type: SchemaType.STRING, enum: ['bootstrapped', 'raising', 'raised'] },
    current_stage:               { type: SchemaType.STRING, enum: ['forming', 'ux_design', 'prototype', 'mvp'] },
    market_size_choice:          { type: SchemaType.STRING, enum: ['small', 'medium', 'large', 'mass_market'] },
    revenue_model_choice:        { type: SchemaType.STRING, enum: ['subscription', 'transaction_fee', 'marketplace', 'licensing', 'advertising', 'one_time', 'other'] },
  },
  required: [
    'market_size', 'revenue_model', 'growth_potential', 'scalability', 'exit_potential', 'investor_interest_in_space',
    'pain_severity', 'problem_frequency', 'existing_buyers', 'clear_roi', 'nice_to_have', 'willingness_to_pay',
    'industry_growth', 'technology_maturity', 'consumer_adoption', 'regulatory_environment', 'too_early',
    'existing_apis_available', 'mvp_complexity', 'requires_new_hardware', 'ai_dependency', 'infrastructure_complexity',
    'has_proprietary_data', 'has_network_effects', 'switching_costs', 'differentiation', 'competition_level', 'easy_to_copy',
    'domain_expertise', 'technical_background', 'industry_experience', 'execution_track_record', 'credibility',
    'moat_strength', 'why_now_strength', 'validation_level', 'pain_score', 'technical_background_choice',
    'founder_count', 'has_technical_cofounder', 'funding_status', 'current_stage', 'market_size_choice', 'revenue_model_choice'
  ],
};

/**
 * Extract signals from a startup idea using AI (Pass 1).
 * Returns structured categorical signals — no scores.
 */
export async function extractSignals(
  geminiClient: GoogleGenerativeAI,
  ideaText: string,
  qa?: QAAnswers | null,
): Promise<ExtractedSignals> {
  const model = geminiClient.getGenerativeModel({
    model: 'gemini-1.5-flash',
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
export function countQAAnswered(qa?: QAAnswers | null): { answered: number; total: number } {
  const total = 14;
  if (!qa) return { answered: 0, total };
  
  let answered = 0;
  if (qa.customer?.trim().length >= 3) answered++;
  if (qa.problem?.trim().length >= 3) answered++;
  if (qa.pain_score !== undefined && qa.pain_score >= 1) answered++;
  if (qa.validation_level) answered++;
  if (qa.market_size_choice) answered++;
  if (qa.revenue_model_choice) answered++;
  if (qa.why_now?.trim().length >= 3) answered++;
  if (qa.competitors?.trim().length >= 3) answered++;
  if (qa.moat?.trim().length >= 3) answered++;
  if (qa.solo_founder !== undefined) answered++;
  if (!qa.solo_founder && qa.has_technical_cofounder !== undefined) {
    answered++;
  } else if (qa.solo_founder) {
    answered++;
  }
  if (qa.technical_background) answered++;
  if (qa.current_stage) answered++;
  if (qa.launch_timeline?.trim().length >= 3) answered++;
  if (qa.funding_status) answered++;

  return { answered, total };
}
