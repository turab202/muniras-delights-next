import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '../../../../lib/middleware';
import { getDatabase, getSetting, setSetting } from '../../../../lib/db';
import { logAdminActivity } from '../../../../lib/auth';

export async function GET(request: NextRequest) {
  const auth = requireAdmin(request);
  if (auth.authorized === false) return auth.response;

  const db = getDatabase();
  const rows = db.prepare('SELECT key, value FROM settings ORDER BY key').all() as { key: string; value: string }[];
  return NextResponse.json(Object.fromEntries(rows.map((row) => [row.key, row.value])));
}

export async function POST(request: NextRequest) {
  const auth = requireAdmin(request);
  if (auth.authorized === false) return auth.response;

  const payload = await request.json();

  for (const [key, value] of Object.entries(payload)) {
    setSetting(key, String(value));
  }

  logAdminActivity(auth.user.userId, 'update_settings', 'Updated site settings');
  return NextResponse.json({ success: true });
}
