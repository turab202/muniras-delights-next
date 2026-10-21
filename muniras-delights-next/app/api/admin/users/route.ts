import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createAdminUser, listAdminUsers, logAdminActivity } from '../../../../lib/auth';
import { requireAdmin } from '../../../../lib/middleware';

const adminUserSchema = z.object({
  username: z.string().trim().min(3, 'Username must be at least 3 characters'),
  display_name: z.string().trim().min(2, 'Display name is required'),
  password: z.string().min(12, 'Password must be at least 12 characters'),
});

export async function GET(request: NextRequest) {
  const auth = requireAdmin(request);
  if (!auth.authorized) return auth.response;

  return NextResponse.json({ users: listAdminUsers() });
}

export async function POST(request: NextRequest) {
  const auth = requireAdmin(request);
  if (!auth.authorized) return auth.response;

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const parsed = adminUserSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid admin data' }, { status: 400 });
  }

  const { username, display_name, password } = parsed.data;

  const existing = listAdminUsers().find((user) => user.username.toLowerCase() === username.toLowerCase());
  if (existing) {
    return NextResponse.json({ error: 'An admin with that username already exists' }, { status: 409 });
  }

  const user = createAdminUser(username, password, display_name);
  logAdminActivity(auth.user.userId, 'create_admin_user', `Created admin account ${user.username}`);

  return NextResponse.json({ success: true, user: { id: user.id, username: user.username, display_name: user.display_name } });
}
