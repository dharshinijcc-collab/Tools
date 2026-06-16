import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { type Schema } from '@google/generative-ai';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getGeminiClient, RESPONSE_SCHEMA, buildEnrichedPrompt } from '@/lib/openai';
import { ScoringResponseSchema } from '@/types/scoring';
import { generateMockResponse } from '@/lib/mock-data';
import { mockDb } from '@/lib/mock-db';
import { computeOverallScore, computeTriageBand } from '@/lib/score-calculator';

const USE_MOCK_AI = process.env.USE_MOCK_AI === 'true' || !process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'placeholder-gemini-key';
const USE_MOCK_DB = process.env.USE_MOCK_DB === 'true' || !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder');

const QAAnswersSchema = z.object({
  target_audience: z.string().optional(),
  problem_solved: z.string().optional(),
  revenue_model: z.string().optional(),
  competitors: z.string().optional(),
  founder_background: z.string().optional(),
  current_stage: z.string().optional(),
}).optional();

const RequestSchema = z.object({
  idea_text: z.string().min(10, 'Please describe your idea in at least 10 characters.').max(2000, 'Idea description is too long (max 2000 characters).'),
  trial_count: z.number().int().min(0).optional(),
  anon_session_id: z.string().optional(),
  qa_answers: QAAnswersSchema,
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
        { status: 400 }
      );
    }

    const { idea_text, trial_count = 0, anon_session_id, qa_answers } = parsed.data;
    const cacheKey = idea_text.trim().toLowerCase().slice(0, 200);

    // ── Auth check ─────────────────────────────────────────────────────────
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

    // ── Unlock eligibility ─────────────────────────────────────────────────
    unlocked = true;

    // ── Duplicate check (same session) ─────────────────────────────────────
    const cached = recentCache.get(cacheKey);
    if (cached && Date.now() - cached.createdAt < CACHE_TTL_MS) {
      return NextResponse.json({ id: cached.id, cached: true });
    }

    // ── Call AI ────────────────────────────────────────────────────────────
    let aiResponse;
    if (USE_MOCK_AI) {
      // Simulate network delay
      await new Promise((r) => setTimeout(r, 800));
      aiResponse = generateMockResponse(idea_text);
    } else {
      const gemini = getGeminiClient();
      const model = gemini.getGenerativeModel({ 
        model: 'gemini-2.5-flash',
        generationConfig: {
          temperature: 0.4,
          responseMimeType: 'application/json',
          responseSchema: RESPONSE_SCHEMA as Schema,
        },
      });

      // Build enriched prompt using Q&A answers if provided
      const prompt = buildEnrichedPrompt(idea_text, qa_answers);
      const result = await model.generateContent(prompt);
      const raw = result.response.text();
      
      if (!raw) throw new Error('Empty response from Gemini');

      const validated = ScoringResponseSchema.safeParse(JSON.parse(raw));
      if (!validated.success) throw new Error('Invalid AI response schema');
      aiResponse = validated.data;
    }

    // Re-compute score to ensure formula consistency
    const overallScore = computeOverallScore(aiResponse.dimensions);
    const triageBand = computeTriageBand(overallScore);
    aiResponse.overall_score = overallScore;
    aiResponse.triage_band = triageBand;

    const resultId = uuidv4();
    const now = new Date().toISOString();

    // ── Persist result ─────────────────────────────────────────────────────
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
      dimensions: aiResponse.dimensions,
      unlocked,
      free_reports_used: unlocked && !userId ? trial_count + 1 : freeReportsUsed,
    });
  } catch (err) {
    console.error('[POST /api/score]', err);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
