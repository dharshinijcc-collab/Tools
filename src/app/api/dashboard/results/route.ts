import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { mockDb } from '@/lib/mock-db';

const USE_MOCK_DB = process.env.USE_MOCK_DB === 'true' || !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder');

export async function GET(req: NextRequest) {
  try {
    if (USE_MOCK_DB) {
      const results = mockDb.getResultsByUser('mock-user-id');
      return NextResponse.json({ results });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const admin = createAdminClient();
    const { data: results, error } = await admin
      .from('scoring_results')
      .select('id, idea_text, overall_score, triage_band, unlocked, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ results: results ?? [] });
  } catch (err) {
    console.error('[GET /api/dashboard/results]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
