import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '../../../../lib/middleware';
import { getDatabase, initializeDatabase, maybeSeedDefaultData } from '../../../../lib/db';
import { logAdminActivity } from '../../../../lib/auth';

const productPayload = z.object({
  id: z.number().optional(),
  name: z.string().min(2),
  slug: z.string().min(2),
  description: z.string().min(10),
  price: z.coerce.number().min(0),
  category_id: z.coerce.number().nullable().optional(),
  image_url: z.string().optional().default(''),
  is_featured: z.coerce.boolean().optional(),
  is_available: z.coerce.boolean().optional(),
  is_promo: z.coerce.boolean().optional(),
});

export async function GET(request: NextRequest) {
  const auth = requireAdmin(request);
  if (auth.authorized === false) return auth.response;

  initializeDatabase();
  maybeSeedDefaultData();
  const db = getDatabase();
  const rows = db.prepare(`SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON c.id = p.category_id ORDER BY p.updated_at DESC`).all() as any[];
  return NextResponse.json(rows);
}

export async function POST(request: NextRequest) {
  const auth = requireAdmin(request);
  if (auth.authorized === false) return auth.response;

  const body = await request.json();
  const parsed = productPayload.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid payload' }, { status: 400 });
  }

  const db = getDatabase();
  const payload = parsed.data;

  const isFeatured = payload.is_featured ? 1 : 0;
  const isAvailable = payload.is_available === false ? 0 : 1;
  const isPromo = payload.is_promo ? 1 : 0;

  const existing = payload.id ? db.prepare('SELECT id FROM products WHERE id = ?').get(payload.id) : null;
  if (payload.id && !existing) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }

  if (payload.id) {
    db.prepare(`UPDATE products SET slug = ?, name = ?, description = ?, price = ?, category_id = ?, image_url = ?, is_featured = ?, is_available = ?, is_promo = ?, updated_at = datetime('now') WHERE id = ?`).run(
      payload.slug, payload.name, payload.description, Number(payload.price), payload.category_id ?? null, payload.image_url || '', isFeatured, isAvailable, isPromo, payload.id
    );
    logAdminActivity(auth.user.userId, 'update_product', `Updated product ${payload.name}`);
  } else {
    db.prepare(`INSERT INTO products (slug, name, description, price, category_id, image_url, is_featured, is_available, is_promo, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`).run(
      payload.slug, payload.name, payload.description, Number(payload.price), payload.category_id ?? null, payload.image_url || '', isFeatured, isAvailable, isPromo
    );
    logAdminActivity(auth.user.userId, 'create_product', `Created product ${payload.name}`);
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(request: NextRequest) {
  const auth = requireAdmin(request);
  if (!auth.authorized) return auth.response;

  const { searchParams } = new URL(request.url);
  const id = Number(searchParams.get('id'));
  if (!id) return NextResponse.json({ error: 'Invalid product id' }, { status: 400 });

  const db = getDatabase();
  const product = db.prepare('SELECT name FROM products WHERE id = ?').get(id) as { name: string } | undefined;
  if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

  db.prepare('DELETE FROM products WHERE id = ?').run(id);
  logAdminActivity(auth.user.userId, 'delete_product', `Deleted product ${product.name}`);
  return NextResponse.json({ success: true });
}
