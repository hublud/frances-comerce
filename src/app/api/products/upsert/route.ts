import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { productToRow, getServerSecretKey, AUTHORITATIVE_SUPABASE_URL } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const product = await req.json();

    if (!product || !product.id || !product.name) {
      return NextResponse.json({ ok: false, error: 'Valid product payload is required' }, { status: 400 });
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || AUTHORITATIVE_SUPABASE_URL;
    const key = getServerSecretKey();

    const client = createClient(url, key, {
      auth: { persistSession: false },
    });

    const row = productToRow(product);
    const { error } = await client.from('products').upsert(row);

    if (error) {
      console.error('[API /api/products/upsert] Supabase error:', error);
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, product });
  } catch (err: any) {
    console.error('[API /api/products/upsert] Exception:', err);
    return NextResponse.json({ ok: false, error: err?.message || 'Internal server error' }, { status: 500 });
  }
}
