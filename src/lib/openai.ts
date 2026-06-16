import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';

let client: GoogleGenerativeAI | null = null;

export function getGeminiClient(): GoogleGenerativeAI {
  if (!client) {
    client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  }
  return client;
}

export const SYSTEM_PROMPT = `You are CrestCode's startup idea analyst. Given a startup idea description (and optionally additional founder context), analyze it across six dimensions: Investor Appeal, Customer Demand, Market Timing, Technical Feasibility, Competitive Moat, and Founder-Market Fit. For each, return a score (0-10), a one-sentence teaser (max 15 words, reads as a complete thought), a 2-sentence reason, a 1-sentence risk, and a 1-sentence recommendation. Calculate overall_score using the weighted formula provided and assign a triage_band. Return strict JSON matching the provided schema only — no markdown, no commentary.

Weighted formula:
overall_score = round(investor_appeal * 0.20 + customer_demand * 0.20 + market_timing * 0.15 + technical_feasibility * 0.15 + competitive_moat * 0.15 + founder_market_fit * 0.15)

triage_band values:
- "Strong Pass" if overall_score >= 8
- "Promising / Needs Work" if overall_score 5-7
- "Not a Fit (Currently)" if overall_score <= 4

Scoring guidance:
- Use the founder context (target audience, revenue model, competitive landscape, founder background, current stage) to produce highly specific, actionable analysis rather than generic observations.
- If founder context is not provided for a dimension, infer from the idea description and note assumptions.
- Be honest and direct — founders need real signal, not inflated scores.`;

interface QAAnswers {
  target_audience?: string;
  problem_solved?: string;
  revenue_model?: string;
  competitors?: string;
  founder_background?: string;
  current_stage?: string;
}

/**
 * Builds a rich analysis prompt using the idea text and optional Q&A answers.
 * The Q&A answers provide additional founder context for more accurate scoring.
 */
export function buildEnrichedPrompt(ideaText: string, qaAnswers?: QAAnswers | null): string {
  let prompt = `${SYSTEM_PROMPT}\n\n--- STARTUP IDEA ---\n${ideaText}`;

  if (qaAnswers) {
    const sections: string[] = [];

    if (qaAnswers.target_audience?.trim()) {
      sections.push(`Target Customer: ${qaAnswers.target_audience.trim()}`);
    }
    if (qaAnswers.problem_solved?.trim()) {
      sections.push(`Core Pain Point: ${qaAnswers.problem_solved.trim()}`);
    }
    if (qaAnswers.revenue_model?.trim()) {
      sections.push(`Revenue Model: ${qaAnswers.revenue_model.trim()}`);
    }
    if (qaAnswers.competitors?.trim()) {
      sections.push(`Competition & Differentiation: ${qaAnswers.competitors.trim()}`);
    }
    if (qaAnswers.founder_background?.trim()) {
      sections.push(`Founder Background: ${qaAnswers.founder_background.trim()}`);
    }
    if (qaAnswers.current_stage?.trim()) {
      sections.push(`Current Stage: ${qaAnswers.current_stage.trim()}`);
    }

    if (sections.length > 0) {
      prompt += `\n\n--- FOUNDER CONTEXT (use this to improve scoring accuracy) ---\n${sections.join('\n')}`;
    }
  }

  return prompt;
}

// Schema definition for Gemini structured output.
// We use `unknown` cast to work around the strict discriminated union in
// @google/generative-ai's Schema type (SchemaType enum vs. literal subtypes).
// The runtime shape is correct and accepted by the Gemini API.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const dimensionSchemaRaw: unknown = {
  type: SchemaType.OBJECT,
  properties: {
    score: { type: SchemaType.NUMBER },
    teaser: { type: SchemaType.STRING },
    reason: { type: SchemaType.STRING },
    risk: { type: SchemaType.STRING },
    recommendation: { type: SchemaType.STRING },
  },
  required: ['score', 'teaser', 'reason', 'risk', 'recommendation'],
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const RESPONSE_SCHEMA: unknown = {
  type: SchemaType.OBJECT,
  properties: {
    overall_score: { type: SchemaType.NUMBER },
    triage_band: {
      type: SchemaType.STRING,
      enum: ['Strong Pass', 'Promising / Needs Work', 'Not a Fit (Currently)'],
    },
    dimensions: {
      type: SchemaType.OBJECT,
      properties: {
        investor_appeal: dimensionSchemaRaw,
        customer_demand: dimensionSchemaRaw,
        market_timing: dimensionSchemaRaw,
        technical_feasibility: dimensionSchemaRaw,
        competitive_moat: dimensionSchemaRaw,
        founder_market_fit: dimensionSchemaRaw,
      },
      required: [
        'investor_appeal',
        'customer_demand',
        'market_timing',
        'technical_feasibility',
        'competitive_moat',
        'founder_market_fit',
      ],
    },
  },
  required: ['overall_score', 'triage_band', 'dimensions'],
};
