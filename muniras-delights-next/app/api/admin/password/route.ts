import { NextRequest, NextResponse } from 'next/server';
import { changeAdminPassword, logAdminActivity } from '../../../../lib/auth';
import { requireAdmin } from '../../../../lib/middleware';

export async function POST(request: NextRequest) {
  const auth = requireAdmin(request);
  if (auth.authorized === false) return auth.response;

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (typeof payload !== 'object' || payload === null || Array.isArray(payload)) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { currentPassword, newPassword, confirmPassword } = payload as {
    currentPassword?: unknown;
    newPassword?: unknown;
    confirmPassword?: unknown;
  };
  if (typeof currentPassword !== 'string' || typeof newPassword !== 'string' || typeof confirmPassword !== 'string') {
    return NextResponse.json({ error: 'Complete all password fields' }, { status: 400 });
  }
  if (newPassword.length < 12) {
    return NextResponse.json({ error: 'New password must be at least 12 characters' }, { status: 400 });
  }
  if (Buffer.byteLength(newPassword, 'utf8') > 72) {
    return NextResponse.json({ error: 'New password must be 72 bytes or fewer' }, { status: 400 });
  }
  if (newPassword !== confirmPassword) {
    return NextResponse.json({ error: 'New passwords do not match' }, { status: 400 });
  }

  if (!changeAdminPassword(auth.user.userId, currentPassword, newPassword)) {
    return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 });
  }

  logAdminActivity(auth.user.userId, 'change_admin_password', 'Admin changed their password');
  return NextResponse.json({ success: true });
}