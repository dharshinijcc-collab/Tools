import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getGeminiClient, generateNarrative } from '@/lib/openai';
import { extractSignals, countQAAnswered } from '@/lib/signal-extractor';
import { runRuleEngine, computeOverallConfidence } from '@/lib/rule-engine';
import { ScoringResponse } from '@/types/scoring';
import { generateMockResponse } from '@/lib/mock-data';
import { mockDb } from '@/lib/mock-db';
import { computeOverallScore, computeTriageBand } from '@/lib/score-calculator';

const USE_MOCK_AI = process.env.USE_MOCK_AI === 'true' || !process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'placeholder-gemini-key';
const USE_MOCK_DB = process.env.USE_MOCK_DB === 'true' || !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder');

const QAAnswersSchema = z.object({
  target_audience:    z.string().optional(),
  problem_solved:     z.string().optional(),
  revenue_model:      z.string().optional(),
  competitors:        z.string().optional(),
  founder_background: z.string().optional(),
  current_stage:      z.string().optional(),
}).optional();

const RequestSchema = z.object({
  idea_text:       z.string().min(10, 'Please describe your idea in at least 10 characters.').max(2000, 'Idea description is too long (max 2000 characters).'),
  trial_count:     z.number().int().min(0).optional(),
  anon_session_id: z.string().optional(),
  qa_answers:      QAAnswersSchema,
});

// Simple in-memory cache to avoid duplicate AI calls for identical ideas
const recentCache: Map<string, { id: string; createdAt: number }> = new Map();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = RequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 },
      );
    }

    const { idea_text, trial_count = 0, anon_session_id, qa_answers } = parsed.data;
    const cacheKey = idea_text.trim().toLowerCase().slice(0, 200);

    // ── Auth check ────────────────────────────────────────────────────────────
    let userId: string | null = null;
    let userPlan: 'free' | 'pro' = 'free';
    let freeReportsUsed = trial_count;
    let unlocked = false;

    if (!USE_MOCK_DB) {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        userId = user.id;
        const admin = createAdminClient();
        const { data: profile } = await admin
          .from('users')
          .select('plan, free_reports_used')
          .eq('id', userId)
          .single();
        if (profile) {
          userPlan = profile.plan;
          freeReportsUsed = profile.free_reports_used;
        }
      }
    }

    // ── Unlock eligibility ────────────────────────────────────────────────────
    unlocked = true;

    // ── Duplicate check (same session) ────────────────────────────────────────
    const cached = recentCache.get(cacheKey);
    if (cached && Date.now() - cached.createdAt < CACHE_TTL_MS) {
      return NextResponse.json({ id: cached.id, cached: true });
    }

    // ── Build AI response ─────────────────────────────────────────────────────
    let aiResponse: ScoringResponse;

    if (USE_MOCK_AI) {
      // Mock mode: simulate delay then return mock data with scoring_factors
      await new Promise((r) => setTimeout(r, 800));
      aiResponse = generateMockResponse(idea_text);
    } else {
      // ── HYBRID TWO-PASS ARCHITECTURE ─────────────────────────────────────
      const gemini = getGeminiClient();

      // PASS 1: AI extracts categorical signals (no scores)
      const signals = await extractSignals(gemini, idea_text, qa_answers);

      // RULE ENGINE: Deterministic scoring from signals
      const ruleResults = runRuleEngine(signals);

      // PASS 2: AI narrates the rule-computed scores
      const narrative = await generateNarrative(gemini, idea_text, signals, ruleResults, qa_answers);

      // QA completeness for confidence calculation
      const { answered: qaAnswered, total: qaTotal } = countQAAnswered(qa_answers);
      const overallConfidence = computeOverallConfidence(ruleResults, qaAnswered, qaTotal);

      // Merge rule scores + narrative into final ScoringResponse
      aiResponse = {
        overall_score: 0, // computed below
        triage_band: 'Promising / Needs Work', // computed below
        confidence_level: overallConfidence,
        startup_summary:              narrative.startup_summary,
        key_strengths:                narrative.key_strengths,
        top_risks:                    narrative.top_risks,
        highest_scoring_dimension:    narrative.highest_scoring_dimension,
        lowest_scoring_dimension:     narrative.lowest_scoring_dimension,
        most_important_next_action:   narrative.most_important_next_action,
        dimensions: {
          investor_appeal: {
            score:               ruleResults.investor_appeal.score,
            confidence:          ruleResults.investor_appeal.confidence,
            evaluation_criteria: narrative.dimensions.investor_appeal?.evaluation_criteria ?? [],
            why_this_score:      narrative.dimensions.investor_appeal?.why_this_score ?? '',
            positive_signals:    ruleResults.investor_appeal.positive_signals,
            negative_signals:    ruleResults.investor_appeal.negative_signals,
            improvement_actions: narrative.dimensions.investor_appeal?.improvement_actions ?? [],
            scoring_factors:     ruleResults.investor_appeal.factors,
          },
          customer_demand: {
            score:               ruleResults.customer_demand.score,
            confidence:          ruleResults.customer_demand.confidence,
            evaluation_criteria: narrative.dimensions.customer_demand?.evaluation_criteria ?? [],
            why_this_score:      narrative.dimensions.customer_demand?.why_this_score ?? '',
            positive_signals:    ruleResults.customer_demand.positive_signals,
            negative_signals:    ruleResults.customer_demand.negative_signals,
            improvement_actions: narrative.dimensions.customer_demand?.improvement_actions ?? [],
            scoring_factors:     ruleResults.customer_demand.factors,
          },
          market_timing: {
            score:               ruleResults.market_timing.score,
            confidence:          ruleResults.market_timing.confidence,
            evaluation_criteria: narrative.dimensions.market_timing?.evaluation_criteria ?? [],
            why_this_score:      narrative.dimensions.market_timing?.why_this_score ?? '',
            positive_signals:    ruleResults.market_timing.positive_signals,
            negative_signals:    ruleResults.market_timing.negative_signals,
            improvement_actions: narrative.dimensions.market_timing?.improvement_actions ?? [],
            scoring_factors:     ruleResults.market_timing.factors,
          },
          technical_feasibility: {
            score:               ruleResults.technical_feasibility.score,
            confidence:          ruleResults.technical_feasibility.confidence,
            evaluation_criteria: narrative.dimensions.technical_feasibility?.evaluation_criteria ?? [],
            why_this_score:      narrative.dimensions.technical_feasibility?.why_this_score ?? '',
            positive_signals:    ruleResults.technical_feasibility.positive_signals,
            negative_signals:    ruleResults.technical_feasibility.negative_signals,
            improvement_actions: narrative.dimensions.technical_feasibility?.improvement_actions ?? [],
            scoring_factors:     ruleResults.technical_feasibility.factors,
          },
          competitive_moat: {
            score:               ruleResults.competitive_moat.score,
            confidence:          ruleResults.competitive_moat.confidence,
            evaluation_criteria: narrative.dimensions.competitive_moat?.evaluation_criteria ?? [],
            why_this_score:      narrative.dimensions.competitive_moat?.why_this_score ?? '',
            positive_signals:    ruleResults.competitive_moat.positive_signals,
            negative_signals:    ruleResults.competitive_moat.negative_signals,
            improvement_actions: narrative.dimensions.competitive_moat?.improvement_actions ?? [],
            scoring_factors:     ruleResults.competitive_moat.factors,
          },
          founder_market_fit: {
            score:               ruleResults.founder_market_fit.score,
            confidence:          ruleResults.founder_market_fit.confidence,
            evaluation_criteria: narrative.dimensions.founder_market_fit?.evaluation_criteria ?? [],
            why_this_score:      narrative.dimensions.founder_market_fit?.why_this_score ?? '',
            positive_signals:    ruleResults.founder_market_fit.positive_signals,
            negative_signals:    ruleResults.founder_market_fit.negative_signals,
            improvement_actions: narrative.dimensions.founder_market_fit?.improvement_actions ?? [],
            scoring_factors:     ruleResults.founder_market_fit.factors,
          },
        },
      };
    }

    // Re-compute overall score to ensure formula consistency
    const overallScore = computeOverallScore(aiResponse.dimensions);
    const triageBand = computeTriageBand(overallScore);
    aiResponse.overall_score = overallScore;
    aiResponse.triage_band = triageBand;

    const resultId = uuidv4();
    const now = new Date().toISOString();

    // ── Persist result ────────────────────────────────────────────────────────
    if (USE_MOCK_DB) {
      mockDb.saveResult({
        id: resultId,
        user_id: userId || 'mock-user-id',
        idea_text,
        response: aiResponse,
        overall_score: overallScore,
        triage_band: triageBand,
        unlocked,
        created_at: now,
        // @ts-expect-error — extended field for mock only
        anon_session_id: anon_session_id ?? null,
      });
    } else {
      const admin = createAdminClient();
      await admin.from('scoring_results').insert({
        id: resultId,
        user_id: userId,
        anon_session_id: anon_session_id ?? null,
        idea_text,
        response: aiResponse,
        overall_score: overallScore,
        triage_band: triageBand,
        unlocked,
      });

      // Increment free_reports_used for authenticated free users
      if (userId && userPlan === 'free' && unlocked) {
        await admin.from('users').update({
          free_reports_used: freeReportsUsed + 1,
        }).eq('id', userId);
      }
    }

    // Cache the result ID
    recentCache.set(cacheKey, { id: resultId, createdAt: Date.now() });
    // Prune old cache entries
    for (const [k, v] of recentCache.entries()) {
      if (Date.now() - v.createdAt > CACHE_TTL_MS) recentCache.delete(k);
    }

    return NextResponse.json({
      id: resultId,
      overall_score: overallScore,
      triage_band: triageBand,
      confidence_level: aiResponse.confidence_level,
      startup_summary: aiResponse.startup_summary,
      key_strengths: aiResponse.key_strengths,
      top_risks: aiResponse.top_risks,
      highest_scoring_dimension: aiResponse.highest_scoring_dimension,
      lowest_scoring_dimension: aiResponse.lowest_scoring_dimension,
      most_important_next_action: aiResponse.most_important_next_action,
      dimensions: aiResponse.dimensions,
      unlocked,
      free_reports_used: unlocked && !userId ? trial_count + 1 : freeReportsUsed,
    });
  } catch (err) {
    console.error('[POST /api/score]', err);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 },
    );
  }
}
