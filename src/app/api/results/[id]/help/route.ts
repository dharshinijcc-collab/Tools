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
    if (USE_MOCK_DB) {
      mockDb.updateNeedHelp(id, true);
    } else {
      const admin = createAdminClient();
      const { error } = await admin
        .from('scoring_results')
        .update({ need_help: true })
        .eq('id', id);

      if (error) {
        console.error('[scoring_results need_help update error]', error);
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[POST /api/results/[id]/help]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
