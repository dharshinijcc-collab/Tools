import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { mockDb } from '@/lib/mock-db';

const USE_MOCK_DB = process.env.USE_MOCK_DB === 'true' || !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder');

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const body = await req.json();
    const { launched, got_first_users, paying_customers, monthly_revenue, raised_funding, shut_down } = body;

    let originalScore = 7.0;

    // Load original result to get score
    if (USE_MOCK_DB) {
      const result = mockDb.getResult(id);
      if (result) originalScore = result.overall_score;
      
      mockDb.saveOutcomeSurvey({
        id: Math.random().toString(36).substring(7),
        result_id: id,
        original_score: originalScore,
        launched: !!launched,
        got_first_users: !!got_first_users,
        paying_customers: !!paying_customers,
        monthly_revenue: Number(monthly_revenue) || 0,
        raised_funding: !!raised_funding,
        shut_down: !!shut_down,
        created_at: new Date().toISOString(),
      });
    } else {
      const admin = createAdminClient();
      const { data: result } = await admin.from('scoring_results').select('overall_score').eq('id', id).single();
      if (result) originalScore = result.overall_score;

      const { error } = await admin.from('outcome_surveys').insert({
        result_id: id,
        original_score: originalScore,
        launched: !!launched,
        got_first_users: !!got_first_users,
        paying_customers: !!paying_customers,
        monthly_revenue: Number(monthly_revenue) || 0,
        raised_funding: !!raised_funding,
        shut_down: !!shut_down,
      });

      if (error) {
        console.error('[outcome_surveys insert error]', error);
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[POST /api/results/[id]/outcome]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
