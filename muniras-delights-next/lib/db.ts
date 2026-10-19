import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';

const dbDir = path.join(process.cwd(), 'data');
const dbPath = path.join(dbDir, 'muniras-delights.db');

if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const database = new Database(dbPath);
database.pragma('journal_mode = WAL');

database.exec(`
  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    price REAL NOT NULL DEFAULT 0,
    category_id INTEGER,
    image_url TEXT,
    is_featured INTEGER NOT NULL DEFAULT 0,
    is_available INTEGER NOT NULL DEFAULT 1,
    is_promo INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY(category_id) REFERENCES categories(id) ON DELETE SET NULL
  );

  CREATE TABLE IF NOT EXISTS admin_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    display_name TEXT NOT NULL,
    is_active INTEGER NOT NULL DEFAULT 1,
    last_login TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_number TEXT NOT NULL UNIQUE,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_address TEXT,
    customer_email TEXT,
    delivery_date TEXT,
    payment_method TEXT NOT NULL DEFAULT 'bank_transfer',
    payment_screenshot_url TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    subtotal REAL NOT NULL DEFAULT 0,
    total REAL NOT NULL DEFAULT 0,
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    product_id INTEGER,
    product_name TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price REAL NOT NULL DEFAULT 0,
    total_price REAL NOT NULL DEFAULT 0,
    FOREIGN KEY(order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE SET NULL
  );

  CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT NOT NULL UNIQUE,
    value TEXT NOT NULL,
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS admin_activity (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    admin_user_id INTEGER,
    action TEXT NOT NULL,
    details TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY(admin_user_id) REFERENCES admin_users(id) ON DELETE SET NULL
  );
`);

export function initializeDatabase() {
  const orderColumns = database.prepare('PRAGMA table_info(orders)').all() as Array<{ name: string }>;
  const existingCols = new Set(orderColumns.map((column) => column.name));

  for (const columnName of ['customer_email', 'payment_screenshot_url']) {
    if (!existingCols.has(columnName)) {
      database.exec(`ALTER TABLE orders ADD COLUMN ${columnName} TEXT`);
    }
  }

  return database;
}

export function getDatabase() {
  return database;
}

export function seedDefaultSettings() {
  const defaults = [
    { key: 'business_name', value: 'Munira\'s Delights' },
    { key: 'business_tagline', value: 'Baking Happiness for Every Occasion' },
    { key: 'phone', value: '+251 911 234 567' },
    { key: 'email', value: 'hello@munirasdelights.com' },
    { key: 'address', value: 'Jemo 3, Around Seid Yassin Mesjid' },
    { key: 'opening_hours', value: 'Mon-Sat: 9:00 AM - 9:00 PM' },
    { key: 'currency', value: 'ETB' },
    { key: 'delivery_minimum', value: '500' },
    { key: 'hero_title', value: 'Munira\'s Delights' },
    { key: 'hero_subtitle', value: 'Baking Happiness for Every Occasion' },
  ];

  for (const item of defaults) {
    database.prepare(`INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)`).run(item.key, item.value);
  }
}

export function getSetting(key: string, fallback: string = '') {
  const row = database.prepare('SELECT value FROM settings WHERE key = ?').get(key) as { value: string } | undefined;
  return row?.value ?? fallback;
}

export function setSetting(key: string, value: string) {
  database.prepare(`INSERT INTO settings (key, value, updated_at) VALUES (?, ?, datetime('now'))
    ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = datetime('now')`).run(key, value);
}

export function maybeSeedDefaultData() {
  seedDefaultSettings();

  const categoryCount = database.prepare('SELECT COUNT(*) as count FROM categories').get() as { count: number };
  if (categoryCount.count === 0) {
    database.prepare('INSERT INTO categories (slug, name, sort_order) VALUES (?, ?, ?)').run('cakes', 'Cakes', 1);
    database.prepare('INSERT INTO categories (slug, name, sort_order) VALUES (?, ?, ?)').run('pastries', 'Pastries', 2);
    database.prepare('INSERT INTO categories (slug, name, sort_order) VALUES (?, ?, ?)').run('catering', 'Catering', 3);
    database.prepare('INSERT INTO categories (slug, name, sort_order) VALUES (?, ?, ?)').run('icecream', 'Ice Cream', 4);
  }

  const productCount = database.prepare('SELECT COUNT(*) as count FROM products').get() as { count: number };
  if (productCount.count === 0) {
    const cakeId = database.prepare('SELECT id FROM categories WHERE slug = ?').get('cakes') as { id: number } | undefined;
    if (cakeId) {
      database.prepare(`INSERT INTO products (slug, name, description, price, category_id, image_url, is_featured, is_available, is_promo) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
        'royal-rose-wedding-cake',
        'Royal Rose Wedding Cake',
        'Three-tier vanilla sponge with edible rose petals and gold leaf.',
        150,
        cakeId.id,
        'https://images.unsplash.com/photo-1535254973040-607b474cb50d?auto=format&fit=crop&w=800&q=80',
        1,
        1,
        0
      );
    }
  }
}

export function getPath() {
  return dbPath;
}

export { database };
