import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { mockDb } from '@/lib/mock-db';
import { ScoringResponse } from '@/types/scoring';

const USE_MOCK_DB = process.env.USE_MOCK_DB === 'true' || !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder');

/**
 * Strip gated fields from dimension details for locked results.
 * Keeps score, confidence, and scoring_factors visible (teaser-level),
 * but removes why_this_score, improvement_actions so users must unlock
 * to read the full analysis narrative.
 */
function stripGatedFields(response: ScoringResponse): ScoringResponse {
  const stripped = { ...response, dimensions: { ...response.dimensions } };
  for (const key of Object.keys(stripped.dimensions) as Array<keyof typeof stripped.dimensions>) {
    const dim = stripped.dimensions[key];
    stripped.dimensions[key] = {
      score:               dim.score,
      confidence:          dim.confidence,
      evaluation_criteria: dim.evaluation_criteria,
      // Visible even when locked — shows the factor breakdown
      positive_signals:    dim.positive_signals,
      negative_signals:    dim.negative_signals,
      scoring_factors:     dim.scoring_factors,
      // Gated — requires unlock
      why_this_score:      '',
      improvement_actions: [],
    };
  }
  return stripped;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    let result;
    let userPlan: 'free' | 'pro' = 'free';
    let userId: string | null = null;

    if (USE_MOCK_DB) {
      result = mockDb.getResult(id);
    } else {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      userId = user?.id ?? null;

      if (userId) {
        const admin = createAdminClient();
        const { data: profile } = await admin.from('users').select('plan').eq('id', userId).single();
        if (profile) userPlan = profile.plan;
      }

      const admin = createAdminClient();
      const { data, error } = await admin.from('scoring_results').select('*').eq('id', id).single();
      if (error || !data) {
        return NextResponse.json({ error: 'Result not found' }, { status: 404 });
      }
      result = data;
    }

    if (!result) {
      return NextResponse.json({ error: 'Result not found' }, { status: 404 });
    }

    // Determine effective unlock status
    const isUnlocked = result.unlocked || userPlan === 'pro';

    // Server-side gating: strip narrative fields if not unlocked
    const safeResponse = isUnlocked
      ? result.response
      : stripGatedFields(result.response as ScoringResponse);

    return NextResponse.json({
      id:            result.id,
      idea_text:     result.idea_text,
      overall_score: result.overall_score,
      triage_band:   result.triage_band,
      // Return full response fields for the overview card
      confidence_level:             safeResponse.confidence_level,
      startup_summary:              isUnlocked ? safeResponse.startup_summary : '',
      key_strengths:                isUnlocked ? safeResponse.key_strengths : [],
      top_risks:                    isUnlocked ? safeResponse.top_risks : [],
      highest_scoring_dimension:    isUnlocked ? safeResponse.highest_scoring_dimension : '',
      lowest_scoring_dimension:     isUnlocked ? safeResponse.lowest_scoring_dimension : '',
      most_important_next_action:   isUnlocked ? safeResponse.most_important_next_action : '',
      dimensions:    safeResponse.dimensions,
      unlocked:      isUnlocked,
      created_at:    result.created_at,
    });
  } catch (err) {
    console.error('[GET /api/results/[id]]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
