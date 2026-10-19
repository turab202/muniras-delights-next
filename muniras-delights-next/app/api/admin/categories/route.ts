import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '../../../../lib/middleware';
import { getDatabase } from '../../../../lib/db';
import { logAdminActivity } from '../../../../lib/auth';

const categoryPayload = z.object({
  id: z.number().optional(),
  name: z.string().min(2),
  slug: z.string().min(2),
  sort_order: z.coerce.number().int().min(0).optional(),
});

export async function GET(request: NextRequest) {
  const auth = requireAdmin(request);
  if (auth.authorized === false) return auth.response;

  const rows = getDatabase().prepare('SELECT * FROM categories ORDER BY sort_order ASC, id ASC').all();
  return NextResponse.json(rows);
}

export async function POST(request: NextRequest) {
  const auth = requireAdmin(request);
  if (auth.authorized === false) return auth.response;

  const body = await request.json();
  const parsed = categoryPayload.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid payload' }, { status: 400 });
  }

  const db = getDatabase();
  const data = parsed.data;

  if (data.id) {
    db.prepare('UPDATE categories SET name = ?, slug = ?, sort_order = ? WHERE id = ?').run(data.name, data.slug, data.sort_order ?? 0, data.id);
    logAdminActivity(auth.user.userId, 'update_category', `Updated category ${data.name}`);
  } else {
    db.prepare('INSERT INTO categories (name, slug, sort_order) VALUES (?, ?, ?)').run(data.name, data.slug, data.sort_order ?? 0);
    logAdminActivity(auth.user.userId, 'create_category', `Created category ${data.name}`);
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(request: NextRequest) {
  const auth = requireAdmin(request);
  if (!auth.authorized) return auth.response;

  const { searchParams } = new URL(request.url);
  const id = Number(searchParams.get('id'));
  if (!id) return NextResponse.json({ error: 'Invalid category id' }, { status: 400 });

  const db = getDatabase();
  const productCount = db.prepare('SELECT COUNT(*) as count FROM products WHERE category_id = ?').get(id) as { count: number };
  if (productCount.count > 0) {
    return NextResponse.json({ error: 'Category has products attached. Reassign or delete products first.' }, { status: 400 });
  }

  const category = db.prepare('SELECT name FROM categories WHERE id = ?').get(id) as { name: string } | undefined;
  db.prepare('DELETE FROM categories WHERE id = ?').run(id);
  if (category) logAdminActivity(auth.user.userId, 'delete_category', `Deleted category ${category.name}`);

  return NextResponse.json({ success: true });
}
