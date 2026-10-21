import { NextRequest, NextResponse } from 'next/server';
import { adminLoginSchema } from '../../../../lib/api';
import { verifyAdminCredentials, getAdminUserByUsername, createSessionToken, logAdminActivity, ensureDefaultAdminUser } from '../../../../lib/auth';
import { initializeDatabase, maybeSeedDefaultData } from '../../../../lib/db';

export async function POST(request: NextRequest) {
  try {
    initializeDatabase();
    maybeSeedDefaultData();
    ensureDefaultAdminUser();

    const body = await request.json();
    const parsed = adminLoginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid input' }, { status: 400 });
    }

    const { username, password } = parsed.data;
    const valid = verifyAdminCredentials(username, password);
    if (!valid) {
      return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
    }

    const adminUser = getAdminUserByUsername(username);
    if (!adminUser) {
      return NextResponse.json({ error: 'Admin account not found' }, { status: 401 });
    }

    if (process.env.NODE_ENV === 'production' && !process.env.AUTH_SECRET) {
      return NextResponse.json({ error: 'Admin authentication is not configured' }, { status: 503 });
    }

    const token = createSessionToken(adminUser.id, adminUser.username);
    const response = NextResponse.json({ success: true });
    response.cookies.set('munira_admin_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 12,
    });

    logAdminActivity(adminUser.id, 'admin_login', 'Admin logged in');
    return response;
  } catch (error) {
    console.error('Admin login failed:', error);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
