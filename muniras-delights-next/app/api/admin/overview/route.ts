import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '../../../../lib/middleware';
import { getDatabase } from '../../../../lib/db';

export async function GET(request: NextRequest) {
  const auth = requireAdmin(request);
  if (!auth.authorized) {
    return auth.response;
  }

  const db = getDatabase();
  const totalOrders = db.prepare('SELECT COUNT(*) as count FROM orders').get() as { count: number };
  const totalProducts = db.prepare('SELECT COUNT(*) as count FROM products').get() as { count: number };
  const totalCategories = db.prepare('SELECT COUNT(*) as count FROM categories').get() as { count: number };
  const revenue = db.prepare('SELECT COALESCE(SUM(total), 0) AS total FROM orders WHERE status != "cancelled"').get() as { total: number };
  const recentOrders = db.prepare('SELECT * FROM orders ORDER BY created_at DESC LIMIT 6').all() as any[];
  const activity = db.prepare('SELECT * FROM admin_activity ORDER BY created_at DESC LIMIT 8').all() as any[];

  return NextResponse.json({
    overview: {
      totalOrders: totalOrders.count,
      totalProducts: totalProducts.count,
      totalCategories: totalCategories.count,
      revenue: Number(revenue.total || 0),
    },
    recentOrders,
    activity,
  });
}
