import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getGeminiClient, generateNarrative } from '@/lib/openai';
import { extractSignals, countQAAnswered } from '@/lib/signal-extractor';
import { runRuleEngine, computeOverallConfidence } from '@/lib/rule-engine';
import { ScoringResponse, ExtractedSignals } from '@/types/scoring';
import { generateMockResponse } from '@/lib/mock-data';
import { mockDb } from '@/lib/mock-db';
import { computeOverallScore, computeTriageBand, computeStartupQualityScore, computeInvestorReadinessScore } from '@/lib/score-calculator';
import { RuleEngineOutput } from '@/lib/rule-engine';

const USE_MOCK_AI = process.env.USE_MOCK_AI === 'true' || !process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'placeholder-gemini-key';
const USE_MOCK_DB = process.env.USE_MOCK_DB === 'true' || !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder');

const QAAnswersSchema = z.object({
  customer: z.string().optional(),
  problem: z.string().optional(),
  pain_score: z.number().optional(),
  validation_level: z.enum(['none', 'conversations', 'waitlist', 'paying_customers']).optional(),
  market_size_choice: z.enum(['small', 'medium', 'large', 'mass_market']).optional(),
  revenue_model_choice: z.enum(['subscription', 'transaction_fee', 'marketplace', 'licensing', 'advertising', 'one_time', 'other']).optional(),
  why_now: z.string().optional(),
  competitors: z.string().optional(),
  moat: z.string().optional(),
  solo_founder: z.boolean().optional(),
  has_technical_cofounder: z.boolean().optional(),
  technical_background: z.enum(['can_code', 'used_to_code', 'no']).optional(),
  current_stage: z.enum(['forming', 'ux_design', 'prototype', 'mvp']).optional(),
  launch_timeline: z.string().optional(),
  funding_status: z.enum(['bootstrapped', 'raising', 'raised']).optional(),
  contact_name: z.string().optional(),
  contact_email: z.string().optional(),
  need_help: z.boolean().optional(),
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
    let signals: ExtractedSignals;
    let ruleResults: RuleEngineOutput;

    if (USE_MOCK_AI) {
      // Mock mode: simulate delay then return mock data with scoring_factors
      await new Promise((r) => setTimeout(r, 800));
      aiResponse = generateMockResponse(idea_text);
      
      // Seed mock values for signals & rule engine output so they can be saved to DB
      signals = {
        market_size: 'large',
        revenue_model: 'subscription',
        growth_potential: 'high',
        scalability: 'high',
        exit_potential: 'high',
        investor_interest_in_space: 'high',
        pain_severity: 'severe',
        problem_frequency: 'daily',
        existing_buyers: false,
        clear_roi: true,
        nice_to_have: false,
        willingness_to_pay: 'high',
        industry_growth: 'fast',
        technology_maturity: 'ready',
        consumer_adoption: 'growing',
        regulatory_environment: 'supportive',
        too_early: false,
        existing_apis_available: true,
        mvp_complexity: 'moderate',
        requires_new_hardware: false,
        ai_dependency: 'core',
        infrastructure_complexity: 'medium',
        has_proprietary_data: false,
        has_network_effects: false,
        switching_costs: 'medium',
        differentiation: 'moderate',
        competition_level: 'high',
        easy_to_copy: false,
        domain_expertise: 'experienced',
        technical_background: true,
        industry_experience: 'some',
        execution_track_record: 'some',
        credibility: 'medium',
        moat_strength: 'moderate',
        why_now_strength: 'strong',
        validation_level: qa_answers?.validation_level || 'none',
        pain_score: qa_answers?.pain_score || 7,
        technical_background_choice: qa_answers?.technical_background || 'no',
        founder_count: qa_answers?.solo_founder ? 'solo' : 'team',
        has_technical_cofounder: qa_answers?.has_technical_cofounder || false,
        funding_status: qa_answers?.funding_status || 'bootstrapped',
        current_stage: qa_answers?.current_stage || 'forming',
        market_size_choice: qa_answers?.market_size_choice || 'large',
        revenue_model_choice: qa_answers?.revenue_model_choice || 'subscription',
      };
      ruleResults = runRuleEngine(signals);
    } else {
      // ── HYBRID TWO-PASS ARCHITECTURE ─────────────────────────────────────
      const gemini = getGeminiClient();

      // We compile our frontend answers block and merge it in
      const fullQaAnswers = qa_answers ? {
        customer: qa_answers.customer || '',
        problem: qa_answers.problem || '',
        pain_score: qa_answers.pain_score || 5,
        validation_level: qa_answers.validation_level || 'none',
        market_size_choice: qa_answers.market_size_choice || 'medium',
        revenue_model_choice: qa_answers.revenue_model_choice || 'subscription',
        why_now: qa_answers.why_now || '',
        competitors: qa_answers.competitors || '',
        moat: qa_answers.moat || '',
        solo_founder: qa_answers.solo_founder !== undefined ? qa_answers.solo_founder : true,
        has_technical_cofounder: qa_answers.has_technical_cofounder !== undefined ? qa_answers.has_technical_cofounder : false,
        technical_background: qa_answers.technical_background || 'no',
        current_stage: qa_answers.current_stage || 'forming',
        launch_timeline: qa_answers.launch_timeline || '',
        funding_status: qa_answers.funding_status || 'bootstrapped',
        contact_name: qa_answers.contact_name || '',
        contact_email: qa_answers.contact_email || '',
      } : null;

      // PASS 1: AI extracts categorical signals (no scores)
      signals = await extractSignals(gemini, idea_text, fullQaAnswers);

      // Map manual form answers back to signals for guaranteed deterministic rule evaluation
      if (fullQaAnswers) {
        signals.validation_level = fullQaAnswers.validation_level;
        signals.pain_score = fullQaAnswers.pain_score;
        signals.technical_background_choice = fullQaAnswers.technical_background;
        signals.founder_count = fullQaAnswers.solo_founder ? 'solo' : 'team';
        signals.has_technical_cofounder = fullQaAnswers.has_technical_cofounder;
        signals.funding_status = fullQaAnswers.funding_status;
        signals.current_stage = fullQaAnswers.current_stage;
        signals.market_size_choice = fullQaAnswers.market_size_choice;
        signals.revenue_model_choice = fullQaAnswers.revenue_model_choice;
      }

      // RULE ENGINE: Deterministic scoring from signals
      ruleResults = runRuleEngine(signals);

      // PASS 2: AI narrates the rule-computed scores
      const narrative = await generateNarrative(gemini, idea_text, signals, ruleResults, fullQaAnswers);

      // QA completeness for confidence calculation
      const { answered: qaAnswered, total: qaTotal } = countQAAnswered(fullQaAnswers);
      const overallConfidence = computeOverallConfidence(ruleResults, qaAnswered, qaTotal);

      // Merge rule scores + narrative into final ScoringResponse
      aiResponse = {
        overall_score: 0, // computed below
        startup_quality_score: 0, // computed below
        investor_readiness_score: 0, // computed below
        triage_band: 'Promising / Needs Work', // computed below
        confidence_level: overallConfidence,
        startup_summary:              narrative.startup_summary,
        why_this_score:               narrative.why_this_score,
        biggest_assumption:           narrative.biggest_assumption,
        missing_evidence:             narrative.missing_evidence,
        what_increased_the_score:     narrative.what_increased_the_score,
        what_reduced_the_score:       narrative.what_reduced_the_score,
        how_to_improve:               narrative.how_to_improve,
        investor_questions:           narrative.investor_questions,
        highest_scoring_dimension:    narrative.highest_scoring_dimension,
        lowest_scoring_dimension:     narrative.lowest_scoring_dimension,
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

    // Re-compute overall score and split scores to ensure formula consistency
    const qualityScore = computeStartupQualityScore(aiResponse.dimensions);
    const readinessScore = computeInvestorReadinessScore(
      aiResponse.dimensions,
      qa_answers?.validation_level,
      qa_answers?.current_stage
    );
    const overallScore = Math.round((qualityScore + readinessScore) / 2);
    const triageBand = computeTriageBand(qualityScore, readinessScore);

    aiResponse.overall_score = overallScore;
    aiResponse.startup_quality_score = qualityScore;
    aiResponse.investor_readiness_score = readinessScore;
    aiResponse.triage_band = triageBand;

    const resultId = uuidv4();
    const now = new Date().toISOString();

    const trainingData = {
      raw_answers: qa_answers ?? null,
      extracted_signals: signals,
      scoring_factors: Object.fromEntries(
        Object.entries(ruleResults).map(([k, v]) => [k, v.factors])
      ),
      dimension_scores: Object.fromEntries(
        Object.entries(ruleResults).map(([k, v]) => [k, v.score])
      ),
      startup_quality_score: qualityScore,
      investor_readiness_score: readinessScore,
      narrative: {
        startup_summary: aiResponse.startup_summary,
        why_this_score: aiResponse.why_this_score,
        biggest_assumption: aiResponse.biggest_assumption,
        missing_evidence: aiResponse.missing_evidence,
        what_increased_the_score: aiResponse.what_increased_the_score,
        what_reduced_the_score: aiResponse.what_reduced_the_score,
        how_to_improve: aiResponse.how_to_improve,
        investor_questions: aiResponse.investor_questions,
      },
    };

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
        need_help: false,
        ...trainingData,
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
        need_help: qa_answers?.need_help ?? false,
        ...trainingData,
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
      startup_quality_score: qualityScore,
      investor_readiness_score: readinessScore,
      triage_band: triageBand,
      confidence_level: aiResponse.confidence_level,
      startup_summary: aiResponse.startup_summary,
      why_this_score: aiResponse.why_this_score,
      biggest_assumption: aiResponse.biggest_assumption,
      missing_evidence: aiResponse.missing_evidence,
      what_increased_the_score: aiResponse.what_increased_the_score,
      what_reduced_the_score: aiResponse.what_reduced_the_score,
      how_to_improve: aiResponse.how_to_improve,
      investor_questions: aiResponse.investor_questions,
      highest_scoring_dimension: aiResponse.highest_scoring_dimension,
      lowest_scoring_dimension: aiResponse.lowest_scoring_dimension,
      dimensions: aiResponse.dimensions,
      unlocked,
      free_reports_used: unlocked && !userId ? trial_count + 1 : freeReportsUsed,
    });
  } catch (err: any) {
    console.error('[POST /api/score]', err);
    return NextResponse.json(
      { error: `Server Error: ${err?.message || String(err)}` },
      { status: 500 },
    );
  }
}
