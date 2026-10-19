import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '../../../../lib/middleware';
import { getDatabase } from '../../../../lib/db';
import { logAdminActivity } from '../../../../lib/auth';

export async function GET(request: NextRequest) {
  const auth = requireAdmin(request);
  if (auth.authorized === false) return auth.response;

  const db = getDatabase();
  const rows = db.prepare('SELECT * FROM orders ORDER BY created_at DESC').all() as any[];
  const enriched = rows.map((order) => ({
    ...order,
    items: db.prepare('SELECT * FROM order_items WHERE order_id = ? ORDER BY id ASC').all(order.id) as any[],
  }));
  return NextResponse.json(enriched);
}

export async function POST(request: NextRequest) {
  const auth = requireAdmin(request);
  if (auth.authorized === false) return auth.response;

  const body = await request.json();

  const db = getDatabase();
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(body.id) as any;
  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

  const allowedStatus = ['pending', 'processing', 'completed', 'cancelled'];
  if (!allowedStatus.includes(body.status)) return NextResponse.json({ error: 'Invalid status' }, { status: 400 });

  db.prepare('UPDATE orders SET status = ?, updated_at = datetime("now") WHERE id = ?').run(body.status, body.id);
  logAdminActivity(auth.user.userId, 'update_order_status', `Order ${order.order_number} set to ${body.status}`);
  return NextResponse.json({ success: true });
}
