import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken } from './auth';

export function requireAdmin(request: NextRequest): { authorized: true; user: { userId: number; username: string; exp: number } } | { authorized: false; response: NextResponse } {
  const token = request.cookies.get('munira_admin_session')?.value;
  const payload = token ? verifySessionToken(token) : null;

  if (!payload) {
    return { authorized: false, response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }

  return { authorized: true, user: payload };
}
