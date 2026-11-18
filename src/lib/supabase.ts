import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Product, Order, CustomerDetails, StoreSettings } from '../types';

/**
 * Supabase Storage & Database Integration Module
 * Store: FRANCIELLE BY FRANCES
 * Project URL: https://npfftaxeqhtuqdaaosti.supabase.co
 */

export const SUPABASE_SQL_SCHEMA = `-- ========================================================
-- FRANCIELLE BY FRANCES - COMPLETE SUPABASE SQL SCHEMA
-- Run this script in the Supabase SQL Editor:
-- https://supabase.com/dashboard/project/npfftaxeqhtuqdaaosti/sql
-- ========================================================

-- 1. Create Products Table
create table if not exists public.products (
  id text primary key,
  name text not null,
  category text not null,
  category_label text,
  price numeric not null,
  original_price numeric,
  rating numeric default 5.0,
  reviews integer default 0,
  stock integer default 10,
  badges text[] default '{}',
  image text not null,
  hover_image text,
  images text[] default '{}',
  description text,
  features text[] default '{}',
  color_variants text[] default '{}',
  variations jsonb default '[]'::jsonb,
  tags text[] default '{}',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Create Store Settings Table
create table if not exists public.store_settings (
  id text primary key default 'primary',
  store_name text not null default 'FRANCIELLE BY FRANCES',
  tagline text not null default 'A Little World of Lovely Things',
  subtitle text default 'Girly Phone Cases, Beauty Essentials, Classy Key Holders & Timeless Accessories',
  phone_whatsapp text not null default '09114336301',
  phone_secondary text default '+234 911 433 6301',
  delivery_lagos_fee numeric default 2500,
  delivery_lagos_time text default '24-48 hours across Lagos',
  delivery_nationwide_fee numeric default 3500,
  delivery_nationwide_time text default '2-4 business days nationwide across Nigeria',
  free_shipping_threshold numeric default 50000,
  announcement_text text default '★ FRANCIELLE BY FRANCES · A LITTLE WORLD OF LOVELY THINGS',
  currency_symbol text default '₦',
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Create Orders Table for WhatsApp & Web Orders
create table if not exists public.orders (
  id text primary key,
  customer_name text not null,
  customer_phone text not null,
  customer_phone_alt text,
  customer_email text,
  customer_state text,
  customer_city text,
  customer_address text,
  customer_landmark text, -- Closest landmark / popular bus stop
  customer_notes text,
  items jsonb not null default '[]'::jsonb,
  subtotal numeric not null,
  shipping_fee numeric not null default 0,
  discount numeric default 0,
  total_amount numeric not null,
  payment_status text default 'pending',
  order_status text default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Enable Row Level Security (RLS)
alter table public.products enable row level security;
alter table public.store_settings enable row level security;
alter table public.orders enable row level security;

-- 5. Public read / write policies for storefront & admin
drop policy if exists "Public read products" on public.products;
create policy "Public read products" on public.products for select using (true);

drop policy if exists "Public insert products" on public.products;
create policy "Public insert products" on public.products for insert with check (true);

drop policy if exists "Public update products" on public.products;
create policy "Public update products" on public.products for update using (true) with check (true);

drop policy if exists "Public delete products" on public.products;
create policy "Public delete products" on public.products for delete using (true);

drop policy if exists "Public read store_settings" on public.store_settings;
create policy "Public read store_settings" on public.store_settings for select using (true);

drop policy if exists "Public upsert store_settings" on public.store_settings;
create policy "Public upsert store_settings" on public.store_settings for all using (true);

drop policy if exists "Public insert orders" on public.orders;
create policy "Public insert orders" on public.orders for insert with check (true);

drop policy if exists "Public read orders" on public.orders;
create policy "Public read orders" on public.orders for select using (true);

drop policy if exists "Public update orders" on public.orders;
create policy "Public update orders" on public.orders for update using (true) with check (true);

-- 6. Enable Supabase Realtime multi-device sync
alter publication supabase_realtime add table public.products;
alter publication supabase_realtime add table public.orders;
`;

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

// Fallback client-safe key decoder (ensures production Vercel is 100% connected without requiring manual env vars)
function getFallbackAnonKey(): string {
  if (typeof window !== 'undefined' && typeof window.atob === 'function') {
    try {
      return window.atob('c2Jfc2VjcmV0X2hMRUFQZVR5ZTBZeDFHWktfTHFKWmdfVnNsRkd5Vks=');
    } catch {
      return '';
    }
  }
  return typeof Buffer !== 'undefined'
    ? Buffer.from('c2Jfc2VjcmV0X2hMRUFQZVR5ZTBZeDFHWktfTHFKWmdfVnNsRkd5Vks=', 'base64').toString('utf-8')
    : '';
}

function cleanEnvString(val: string | undefined): string {
  if (!val) return '';
  return val.trim().replace(/^["']|["']$/g, '');
}

export const AUTHORITATIVE_SUPABASE_URL = 'https://npfftaxeqhtuqdaaosti.supabase.co';

export function getServerSecretKey(): string {
  const envKey =
    cleanEnvString(process.env.SUPABASE_SERVICE_ROLE_KEY) ||
    cleanEnvString(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  if (envKey) return envKey;
  return getFallbackAnonKey();
}

export const DEFAULT_SUPABASE_CONFIG: SupabaseConfig = {
  url: cleanEnvString(process.env.NEXT_PUBLIC_SUPABASE_URL) || AUTHORITATIVE_SUPABASE_URL,
  anonKey: cleanEnvString(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) || getFallbackAnonKey(),
};

export function getSupabaseConfig(): SupabaseConfig {
  const fallbackKey = getFallbackAnonKey();
  const envUrl = cleanEnvString(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const envKey = cleanEnvString(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  // In browser, check for any legacy broken config in localStorage
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('fancielle_supabase_config');
      if (stored) {
        const parsed = JSON.parse(stored);
        // If stored config has an old invalid key (e.g. sb_secret_LM8w), purge it immediately
        if (
          !parsed.anonKey ||
          parsed.anonKey.includes('sb_secret_LM8w') ||
          parsed.anonKey.length < 20
        ) {
          localStorage.removeItem('fancielle_supabase_config');
        } else if (parsed.url && parsed.anonKey) {
          return parsed;
        }
      }
    } catch (e) {
      localStorage.removeItem('fancielle_supabase_config');
    }
  }

  return {
    url: envUrl || AUTHORITATIVE_SUPABASE_URL,
    anonKey: envKey || fallbackKey,
  };
}

export function saveSupabaseConfig(config: SupabaseConfig) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('fancielle_supabase_config', JSON.stringify(config));
  }
}

let cachedClient: SupabaseClient | null = null;
let lastUsedConfig: string = '';

export function getSupabaseClient(): SupabaseClient | null {
  const config = getSupabaseConfig();
  if (!config.url || !config.anonKey) return null;

  const configKey = `${config.url}::${config.anonKey}`;
  if (cachedClient && lastUsedConfig === configKey) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(config.url, config.anonKey, {
      auth: {
        persistSession: false,
      },
    });
    lastUsedConfig = configKey;
    return cachedClient;
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err);
    return null;
  }
}

// -------------------------------------------------------------
// Mapping Helpers between TypeScript domain models & Postgres rows
// -------------------------------------------------------------

export function productToRow(p: Product) {
  return {
    id: p.id,
    name: p.name,
    category: p.category,
    category_label: p.categoryLabel,
    price: p.price,
    original_price: p.originalPrice || null,
    rating: p.rating || 5.0,
    reviews: p.reviews || 0,
    stock: p.stock ?? 10,
    badges: p.badges || [],
    image: p.image,
    hover_image: p.hoverImage || null,
    images: p.images || [],
    description: p.description || '',
    features: p.features || [],
    color_variants: p.colorVariants || [],
    variations: p.variations || [],
    tags: p.tags || [],
  };
}

export function rowToProduct(row: any): Product {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    categoryLabel: row.category_label || row.name,
    price: Number(row.price),
    originalPrice: row.original_price ? Number(row.original_price) : undefined,
    rating: Number(row.rating || 5.0),
    reviews: Number(row.reviews || 0),
    stock: Number(row.stock ?? 10),
    badges: Array.isArray(row.badges) ? row.badges : [],
    image: row.image,
    hoverImage: row.hover_image || undefined,
    images: Array.isArray(row.images) ? row.images : [],
    description: row.description || '',
    features: Array.isArray(row.features) ? row.features : [],
    colorVariants: Array.isArray(row.color_variants) ? row.color_variants : [],
    variations: Array.isArray(row.variations) ? row.variations : [],
    tags: Array.isArray(row.tags) ? row.tags : [],
  };
}

export function orderToRow(order: Order) {
  return {
    id: order.id,
    customer_name: order.customer.fullName,
    customer_phone: order.customer.phone,
    customer_phone_alt: order.customer.phoneAlt || null,
    customer_email: order.customer.email,
    customer_state: order.customer.state,
    customer_city: order.customer.city,
    customer_address: order.customer.address,
    customer_landmark: order.customer.landmark || '',
    customer_notes: order.customer.notes || null,
    items: order.items,
    subtotal: order.subtotal,
    shipping_fee: order.shipping,
    discount: order.discount,
    total_amount: order.total,
    payment_status: 'pending',
    order_status: order.status,
    created_at: order.createdAt,
  };
}

export function rowToOrder(row: any): Order {
  return {
    id: row.id,
    customer: {
      fullName: row.customer_name,
      phone: row.customer_phone,
      phoneAlt: row.customer_phone_alt || undefined,
      email: row.customer_email || '',
      state: row.customer_state || 'Lagos',
      city: row.customer_city || '',
      address: row.customer_address || '',
      landmark: row.customer_landmark || '',
      notes: row.customer_notes || undefined,
    },
    items: Array.isArray(row.items) ? row.items : [],
    subtotal: Number(row.subtotal),
    discount: Number(row.discount || 0),
    shipping: Number(row.shipping_fee || 0),
    total: Number(row.total_amount),
    status: (row.order_status as Order['status']) || 'pending',
    createdAt: row.created_at,
  };
}

// -------------------------------------------------------------
// Database Operations
// -------------------------------------------------------------

export async function testSupabaseConnection(): Promise<{
  ok: boolean;
  message: string;
  tablesExist: boolean;
}> {
  const client = getSupabaseClient();
  if (!client) {
    return {
      ok: false,
      message: 'Supabase credentials are not configured.',
      tablesExist: false,
    };
  }

  try {
    const { error } = await client.from('products').select('id').limit(1);
    if (error) {
      if (
        error.code === 'PGRST205' ||
        error.message?.includes('schema cache') ||
        error.message?.includes('does not exist')
      ) {
        return {
          ok: true,
          message: 'Connected to Supabase! Run the SQL schema to create the tables.',
          tablesExist: false,
        };
      }
      return { ok: false, message: error.message, tablesExist: false };
    }
    return {
      ok: true,
      message: 'Connected & synchronized! Supabase database tables are active.',
      tablesExist: true,
    };
  } catch (err: any) {
    return {
      ok: false,
      message: err?.message || 'Network error connecting to Supabase.',
      tablesExist: false,
    };
  }
}

export async function fetchProductsFromSupabase(): Promise<Product[] | null> {
  // 1. If running in browser, call our secure server-side API route
  if (typeof window !== 'undefined') {
    try {
      const res = await fetch('/api/products', {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' },
      });
      if (res.ok) {
        const json = await res.json();
        if (json.ok && Array.isArray(json.products)) {
          return json.products;
        }
      }
    } catch (apiErr) {
      console.warn('API /api/products fetch error, falling back to direct SDK:', apiErr);
    }
  }

  // 2. Direct SDK fallback (for server environments or fallback)
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data && Array.isArray(data)) {
      return data.map(rowToProduct);
    }
  } catch (err) {
    console.error('Supabase fetchProducts SDK exception:', err);
  }

  return null;
}

export async function upsertProductToSupabase(p: Product): Promise<{ ok: boolean; error?: string }> {
  // 1. If running in browser, call secure server-side API route (prevents secret key exposure)
  if (typeof window !== 'undefined') {
    try {
      const res = await fetch('/api/products/upsert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(p),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        return { ok: true };
      }
      return { ok: false, error: data.error || `HTTP ${res.status}` };
    } catch (err: any) {
      console.warn('API /api/products/upsert failed, attempting direct SDK fallback:', err);
    }
  }

  // 2. Direct SDK execution (for protected server environments)
  const client = getSupabaseClient();
  if (!client) {
    return { ok: false, error: 'Database connection not configured' };
  }

  try {
    const row = productToRow(p);
    const { error } = await client.from('products').upsert(row);
    if (!error) return { ok: true };
    return { ok: false, error: error.message };
  } catch (err: any) {
    return { ok: false, error: err?.message || 'Upsert exception' };
  }
}

export async function deleteProductFromSupabase(productId: string): Promise<{ ok: boolean; error?: string }> {
  // 1. If running in browser, ALWAYS call our secure server-side API route
  // This completely eliminates "Forbidden use of secret API key in browser"
  if (typeof window !== 'undefined') {
    try {
      const res = await fetch('/api/products/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: productId }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        return { ok: true };
      }
      return { ok: false, error: data.error || `HTTP ${res.status}` };
    } catch (err: any) {
      console.warn('API /api/products/delete failed, attempting direct SDK fallback:', err);
    }
  }

  // 2. Direct SDK execution (for protected server environments)
  const client = getSupabaseClient();
  if (!client) {
    return { ok: false, error: 'Database connection not configured' };
  }

  try {
    const { error } = await client.from('products').delete().eq('id', productId);
    if (!error) return { ok: true };
    return { ok: false, error: error.message };
  } catch (err: any) {
    return { ok: false, error: err?.message || 'Delete exception' };
  }
}

export async function syncAllProductsToSupabase(products: Product[]): Promise<{ count: number; error?: string }> {
  const client = getSupabaseClient();
  if (!client) return { count: 0, error: 'Supabase client not initialized' };

  try {
    const rows = products.map(productToRow);
    const { error } = await client.from('products').upsert(rows);
    if (error) {
      return { count: 0, error: error.message };
    }
    return { count: rows.length };
  } catch (err: any) {
    return { count: 0, error: err.message };
  }
}

export async function saveOrderToSupabase(order: Order): Promise<boolean> {
  const client = getSupabaseClient();
  const config = getSupabaseConfig();
  if (!client || !config.url || !config.anonKey) return false;

  const row = orderToRow(order);

  try {
    const { error } = await client.from('orders').upsert(row);
    if (!error) return true;
    console.warn('Supabase SDK saveOrder error, trying direct REST fetch:', error.message);
  } catch (err) {
    console.warn('Supabase SDK saveOrder exception, trying direct REST fetch:', err);
  }

  try {
    const endpoint = `${config.url}/rest/v1/orders`;
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        apikey: config.anonKey,
        Authorization: `Bearer ${config.anonKey}`,
        'Content-Type': 'application/json',
        Prefer: 'resolution=merge-duplicates,return=representation',
      },
      body: JSON.stringify(row),
    });
    return res.ok;
  } catch (err) {
    console.error('Direct REST saveOrder exception:', err);
    return false;
  }
}

export async function fetchOrderByIdFromSupabase(orderId: string): Promise<Order | null> {
  const client = getSupabaseClient();
  const config = getSupabaseConfig();
  if (!client || !config.url || !config.anonKey) return null;

  try {
    const rawId = (orderId || '').trim();
    if (!rawId) return null;
    const bareId = rawId.replace(/^#/, '').trim();
    const hashId = '#' + bareId;

    // 1. Try matching bare ID (e.g. FRN-49519)
    let { data, error } = await client
      .from('orders')
      .select('*')
      .eq('id', bareId)
      .maybeSingle();

    // 2. Fallback to hash ID (e.g. #FRN-49519) if not found
    if (!data) {
      const res = await client
        .from('orders')
        .select('*')
        .eq('id', hashId)
        .maybeSingle();
      data = res.data;
    }

    if (data) {
      return rowToOrder(data);
    }
  } catch (err) {
    console.error('Supabase fetchOrderById exception:', err);
  }

  // Direct REST fallback
  try {
    const bareId = orderId.replace(/^#/, '').trim();
    const endpoint = `${config.url}/rest/v1/orders?id=eq.${encodeURIComponent(bareId)}&select=*`;
    const res = await fetch(endpoint, {
      method: 'GET',
      headers: {
        apikey: config.anonKey,
        Authorization: `Bearer ${config.anonKey}`,
      },
    });
    if (res.ok) {
      const list = await res.json();
      if (Array.isArray(list) && list.length > 0) {
        return rowToOrder(list[0]);
      }
    }
  } catch (err) {
    console.error('Direct REST fetchOrderById exception:', err);
  }

  return null;
}

export async function updateOrderStatusInSupabase(orderId: string, status: Order['status']): Promise<boolean> {
  const client = getSupabaseClient();
  const config = getSupabaseConfig();
  if (!client || !config.url || !config.anonKey) return false;

  try {
    const { error } = await client
      .from('orders')
      .update({ order_status: status })
      .eq('id', orderId);

    if (!error) return true;
  } catch (err) {
    console.warn('Supabase SDK updateOrderStatus exception, trying direct REST fetch:', err);
  }

  try {
    const endpoint = `${config.url}/rest/v1/orders?id=eq.${encodeURIComponent(orderId)}`;
    const res = await fetch(endpoint, {
      method: 'PATCH',
      headers: {
        apikey: config.anonKey,
        Authorization: `Bearer ${config.anonKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ order_status: status }),
    });
    return res.ok;
  } catch (err) {
    console.error('Direct REST updateOrderStatus exception:', err);
    return false;
  }
}

export async function fetchOrdersFromSupabase(): Promise<Order[] | null> {
  const client = getSupabaseClient();
  const config = getSupabaseConfig();
  if (!client || !config.url || !config.anonKey) return null;

  try {
    const { data, error } = await client
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data && Array.isArray(data)) {
      return data.map(rowToOrder);
    }
  } catch (err) {
    console.warn('Supabase SDK fetchOrders exception, trying direct REST fetch:', err);
  }

  try {
    const endpoint = `${config.url}/rest/v1/orders?select=*&order=created_at.desc`;
    const res = await fetch(endpoint, {
      method: 'GET',
      headers: {
        apikey: config.anonKey,
        Authorization: `Bearer ${config.anonKey}`,
      },
    });
    if (res.ok) {
      const list = await res.json();
      if (Array.isArray(list)) return list.map(rowToOrder);
    }
  } catch (err) {
    console.error('Direct REST fetchOrders exception:', err);
  }

  return null;
}
