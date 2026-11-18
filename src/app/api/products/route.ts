import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { rowToProduct, getServerSecretKey, AUTHORITATIVE_SUPABASE_URL } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function GET() {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || AUTHORITATIVE_SUPABASE_URL;
    const key = getServerSecretKey();

    const client = createClient(url, key, {
      auth: { persistSession: false },
    });

    const { data, error } = await client
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[API /api/products] Supabase select error:', error);
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    const products = Array.isArray(data) ? data.map(rowToProduct) : [];
    return NextResponse.json({ ok: true, products }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Surrogate-Control': 'no-store',
      },
    });
  } catch (err: any) {
    console.error('[API /api/products] Exception:', err);
    return NextResponse.json({ ok: false, error: err?.message || 'Internal server error' }, { status: 500 });
  }
}
