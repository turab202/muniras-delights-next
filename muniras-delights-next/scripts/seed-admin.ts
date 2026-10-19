import { initializeDatabase, maybeSeedDefaultData, getDatabase } from '../lib/db';
import { createAdminUser } from '../lib/auth';

const username = process.env.ADMIN_USERNAME || 'admin';
const password = process.env.ADMIN_PASSWORD;
const displayName = process.env.ADMIN_NAME || 'Munira Admin';

if (!password || password.length < 12) {
  console.error('Set ADMIN_PASSWORD to a value with at least 12 characters.');
  process.exit(1);
}

initializeDatabase();
maybeSeedDefaultData();

createAdminUser(username, password, displayName);
const existing = getDatabase().prepare('SELECT id FROM admin_users WHERE username = ?').get(username);
console.log(`${existing ? 'Updated' : 'Created'} admin user: ${username}`);
