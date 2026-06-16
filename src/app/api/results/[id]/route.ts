import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { mockDb } from '@/lib/mock-db';
import { ScoringResponse } from '@/types/scoring';

const USE_MOCK_DB = process.env.USE_MOCK_DB === 'true' || !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder');

/** Strip gated fields (reason, risk, recommendation) from dimensions */
function stripGatedFields(response: ScoringResponse): ScoringResponse {
  const stripped = { ...response, dimensions: { ...response.dimensions } };
  for (const key of Object.keys(stripped.dimensions) as Array<keyof typeof stripped.dimensions>) {
    stripped.dimensions[key] = {
      score: stripped.dimensions[key].score,
      teaser: stripped.dimensions[key].teaser,
      // These are intentionally stripped
      reason: '',
      risk: '',
      recommendation: '',
    };
  }
  return stripped;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

    // Server-side gating: strip detail fields if not unlocked
    const safeResponse = isUnlocked ? result.response : stripGatedFields(result.response as ScoringResponse);

    return NextResponse.json({
      id: result.id,
      idea_text: result.idea_text,
      overall_score: result.overall_score,
      triage_band: result.triage_band,
      dimensions: safeResponse.dimensions,
      unlocked: isUnlocked,
      created_at: result.created_at,
    });
  } catch (err) {
    console.error('[GET /api/results/[id]]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
