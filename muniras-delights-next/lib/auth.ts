import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import { getDatabase } from './db';

const SESSION_SECRET = process.env.AUTH_SECRET || (process.env.NODE_ENV === 'production' ? null : 'munira-local-dev-secret');

export interface AdminUser {
  id: number;
  username: string;
  display_name: string;
  password_hash: string;
  is_active: number;
}

export function createAdminUser(username: string, password: string, displayName: string) {
  const db = getDatabase();
  const normalizedUsername = username.trim();
  const normalizedDisplayName = displayName.trim();
  const passwordHash = bcrypt.hashSync(password, 10);

  db.prepare(`
    INSERT INTO admin_users (username, password_hash, display_name, is_active, created_at)
    VALUES (?, ?, ?, 1, datetime('now'))
    ON CONFLICT(username) DO UPDATE SET
      password_hash = excluded.password_hash,
      display_name = excluded.display_name,
      is_active = 1
  `).run(normalizedUsername, passwordHash, normalizedDisplayName);

  return db.prepare('SELECT * FROM admin_users WHERE username = ?').get(normalizedUsername) as AdminUser;
}

export function verifyAdminCredentials(username: string, password: string) {
  const user = getDatabase().prepare('SELECT * FROM admin_users WHERE username = ? AND is_active = 1').get(username.trim()) as AdminUser | undefined;
  if (!user) return false;
  return bcrypt.compareSync(password, user.password_hash);
}

export function changeAdminPassword(userId: number, currentPassword: string, newPassword: string) {
  const db = getDatabase();
  const user = db.prepare('SELECT password_hash FROM admin_users WHERE id = ? AND is_active = 1').get(userId) as { password_hash: string } | undefined;
  if (!user || !bcrypt.compareSync(currentPassword, user.password_hash)) return false;

  const passwordHash = bcrypt.hashSync(newPassword, 10);
  db.prepare('UPDATE admin_users SET password_hash = ? WHERE id = ?').run(passwordHash, userId);
  return true;
}

export function getAdminUserByUsername(username: string) {
  return getDatabase().prepare('SELECT * FROM admin_users WHERE username = ? AND is_active = 1').get(username.trim()) as AdminUser | undefined;
}

export function createSessionToken(userId: number, username: string) {
  if (!SESSION_SECRET) throw new Error('AUTH_SECRET must be configured in production');

  const payload = { userId, username, exp: Math.floor(Date.now() / 1000) + 60 * 60 * 12 };
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto.createHmac('sha256', SESSION_SECRET).update(`${header}.${body}`).digest('base64url');

  return `${header}.${body}.${signature}`;
}

export function verifySessionToken(token: string) {
  if (!SESSION_SECRET || !token || !token.includes('.')) return null;

  const parts = token.split('.');
  if (parts.length !== 3) return null;

  const [header, payload, signature] = parts;
  const expected = crypto.createHmac('sha256', SESSION_SECRET).update(`${header}.${payload}`).digest('base64url');

  if (crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as { userId: number; username: string; exp: number };
    if (decoded.exp * 1000 < Date.now()) return null;
    return decoded;
  }

  return null;
}

export function getAdminUserById(id: number) {
  return getDatabase().prepare('SELECT * FROM admin_users WHERE id = ? AND is_active = 1').get(id) as AdminUser | undefined;
}

export function logAdminActivity(adminUserId: number | null, action: string, details?: string) {
  getDatabase().prepare('INSERT INTO admin_activity (admin_user_id, action, details, created_at) VALUES (?, ?, ?, datetime("now"))').run(adminUserId, action, details || null);
}
