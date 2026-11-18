import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getServerSecretKey, AUTHORITATIVE_SUPABASE_URL } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const id = body?.id;

    if (!id || typeof id !== 'string') {
      return NextResponse.json({ ok: false, error: 'Product ID is required' }, { status: 400 });
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || AUTHORITATIVE_SUPABASE_URL;
    const key = getServerSecretKey();

    const client = createClient(url, key, {
      auth: { persistSession: false },
    });

    const { error } = await client.from('products').delete().eq('id', id);
    if (error) {
      console.error('[API /api/products/delete] Supabase error:', error);
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, id });
  } catch (err: any) {
    console.error('[API /api/products/delete] Exception:', err);
    return NextResponse.json({ ok: false, error: err?.message || 'Internal server error' }, { status: 500 });
  }
}
