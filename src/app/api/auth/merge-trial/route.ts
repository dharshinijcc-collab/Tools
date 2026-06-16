import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { mockDb } from '@/lib/mock-db';

const USE_MOCK_DB = process.env.USE_MOCK_DB === 'true' || !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder');

const RequestSchema = z.object({
  anon_session_id: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = RequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'anon_session_id is required' }, { status: 400 });
    }

    const { anon_session_id } = parsed.data;

    if (USE_MOCK_DB) {
      // Mock merge
      const merged = mockDb.mergeAnonResults(anon_session_id, 'mock-user-id');
      return NextResponse.json({ merged, free_reports_used: Math.min(merged, 2) });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const admin = createAdminClient();

    // Count anon results to merge
    const { data: anonResults } = await admin
      .from('scoring_results')
      .select('id, unlocked')
      .eq('anon_session_id', anon_session_id)
      .is('user_id', null);

    const mergeCount = anonResults?.length ?? 0;

    if (mergeCount > 0) {
      // Assign anon results to the new user
      await admin
        .from('scoring_results')
        .update({ user_id: user.id })
        .eq('anon_session_id', anon_session_id)
        .is('user_id', null);
    }

    // Update free_reports_used (capped at 2)
    const { data: profile } = await admin.from('users').select('free_reports_used').eq('id', user.id).single();
    const currentUsed = profile?.free_reports_used ?? 0;
    const newUsed = Math.min(currentUsed + mergeCount, 2);

    await admin.from('users').update({ free_reports_used: newUsed }).eq('id', user.id);

    return NextResponse.json({ merged: mergeCount, free_reports_used: newUsed });
  } catch (err) {
    console.error('[POST /api/auth/merge-trial]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
