import test from 'node:test';
import assert from 'node:assert/strict';
import { initializeDatabase, getDatabase } from '../lib/db';
import { changeAdminPassword, createAdminUser, ensureDefaultAdminUser, verifyAdminCredentials, createSessionToken, verifySessionToken, listAdminUsers, logAdminActivity } from '../lib/auth';

test('database initializes and creates the expected tables', () => {
  initializeDatabase();
  const db = getDatabase();

  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name IN ('products', 'categories', 'orders', 'admin_users', 'settings')").all() as { name: string }[];

  assert.equal(tables.length >= 5, true);
});

test('admin credentials hash and validate correctly', () => {
  const username = 'admin-test';
  const password = 'Passw0rd!';

  const created = createAdminUser(username, password, 'Test Admin');
  assert.equal(created.username, username);

  const updated = createAdminUser(username, 'NewPass!23', 'Updated Admin');
  assert.equal(updated.username, username);

  const valid = verifyAdminCredentials(username, password);
  const updatedValid = verifyAdminCredentials(username, 'NewPass!23');
  const invalid = verifyAdminCredentials(username, 'wrong-password');

  assert.equal(valid, false);
  assert.equal(updatedValid, true);
  assert.equal(invalid, false);
});

test('admin can change password only after verifying the current password', () => {
  const username = 'password-change-test';
  const user = createAdminUser(username, 'OldPassword!123', 'Password Test');

  assert.equal(changeAdminPassword(user.id, 'wrong-current-password', 'NewPassword!456'), false);
  assert.equal(verifyAdminCredentials(username, 'OldPassword!123'), true);

  assert.equal(changeAdminPassword(user.id, 'OldPassword!123', 'NewPassword!456'), true);
  assert.equal(verifyAdminCredentials(username, 'OldPassword!123'), false);
  assert.equal(verifyAdminCredentials(username, 'NewPassword!456'), true);
});

test('session tokens are signed and verified', () => {
  const token = createSessionToken(42, 'admin-test');
  const payload = verifySessionToken(token);

  assert.ok(payload);
  assert.equal(payload.userId, 42);
  assert.equal(payload.username, 'admin-test');
});

test('bootstrap creates a default admin when no admin exists', () => {
  const db = getDatabase();
  db.prepare('DELETE FROM admin_users').run();

  const created = ensureDefaultAdminUser();

  assert.ok(created);
  assert.equal(verifyAdminCredentials('admin', 'ChangeMe123!'), true);
});

test('listAdminUsers includes additional admin accounts', () => {
  createAdminUser('second-admin', 'StrongPass!123', 'Second Admin');

  const users = listAdminUsers();
  assert.ok(users.some((user) => user.username === 'second-admin'));
});

test('admin activity is recorded with a timestamp', () => {
  const user = createAdminUser('activity-test', 'StrongPass!123', 'Activity Test');

  logAdminActivity(user.id, 'admin_login', 'Admin logged in');

  const activity = getDatabase()
    .prepare('SELECT admin_user_id, action, details, created_at FROM admin_activity WHERE admin_user_id = ? AND action = ? ORDER BY id DESC LIMIT 1')
    .get(user.id, 'admin_login') as { admin_user_id: number; action: string; details: string; created_at: string };

  assert.equal(activity.admin_user_id, user.id);
  assert.equal(activity.action, 'admin_login');
  assert.equal(activity.details, 'Admin logged in');
  assert.ok(activity.created_at);
});
