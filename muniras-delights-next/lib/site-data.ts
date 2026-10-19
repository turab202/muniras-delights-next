import { getDatabase } from './db';

export function getCatalogForPublic() {
  const db = getDatabase();

  const categories = db.prepare(`SELECT * FROM categories ORDER BY sort_order ASC, id ASC`).all() as any[];
  const products = db.prepare(`SELECT p.*, c.slug as category_slug, c.name as category_name FROM products p LEFT JOIN categories c ON c.id = p.category_id WHERE p.is_available = 1 ORDER BY p.is_featured DESC, p.updated_at DESC`).all() as any[];

  return {
    categories: categories.map((category) => ({
      id: category.id,
      slug: category.slug,
      name: category.name,
      sort_order: category.sort_order,
    })),
    products: products.map((product) => ({
      id: String(product.id),
      slug: product.slug,
      name: product.name,
      description: product.description,
      price: Number(product.price),
      category: product.category_slug || 'uncategorized',
      image: product.image_url || 'https://images.unsplash.com/photo-1535254973040-607b474cb50d?auto=format&fit=crop&w=800&q=80',
      isFeatured: Boolean(product.is_featured),
      isAvailable: Boolean(product.is_available),
      isPromo: Boolean(product.is_promo),
    })),
  };
}

export function getSettingsForPublic() {
  const db = getDatabase();
  const rows = db.prepare('SELECT key, value FROM settings').all() as { key: string; value: string }[];
  return Object.fromEntries(rows.map((row) => [row.key, row.value]));
}

export function getRecentOrdersForDashboard(limit = 10) {
  const db = getDatabase();
  return db.prepare(`SELECT * FROM orders ORDER BY created_at DESC LIMIT ?`).all(limit) as any[];
}
