import fs from 'node:fs/promises';
import path from 'node:path';
import { getDatabase } from './db';
import { MENU_ITEMS } from '../constants';

export async function savePaymentScreenshot(file: File) {
  const uploadDir = path.join(process.cwd(), 'public', 'uploads');
  await fs.mkdir(uploadDir, { recursive: true });

  const safeName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
  const target = path.join(uploadDir, safeName);
  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(target, buffer);

  return `/uploads/${safeName}`;
}

export function persistOrder(order: any, screenshotUrl?: string) {
  const db = getDatabase();
  const customer = order.customer || {};
  const items = Array.isArray(order.items) ? order.items : [];

  const orderNumber = `MD-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
  const total = Number(order.total || 0);
  const subtotal = Number(order.subtotal || total);

  const result = db.prepare(`
    INSERT INTO orders (
      order_number,
      customer_name,
      customer_phone,
      customer_address,
      customer_email,
      delivery_date,
      payment_method,
      payment_screenshot_url,
      status,
      subtotal,
      total,
      notes,
      created_at,
      updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
  `).run(
    orderNumber,
    String(customer.name || 'Customer').trim(),
    String(customer.phone || '').trim(),
    String(customer.address || '').trim(),
    String(customer.email || '').trim() || null,
    String(customer.deliveryDate || '').trim() || null,
    String(order.paymentMethod || 'bank_transfer').trim(),
    screenshotUrl || null,
    'pending',
    subtotal,
    total,
    order.notes || null
  );

  const orderId = Number(result.lastInsertRowid);

  for (const item of items) {
    const itemId = String(item.id ?? item.itemId ?? '');
    const quantity = Number(item.quantity ?? item.qty ?? 1);
    const product = MENU_ITEMS.find((menuItem) => menuItem.id === itemId);
    const unitPrice = Number(product?.price ?? 0);
    const productName = typeof product?.name === 'string' ? product.name : product?.name?.en || itemId;

    db.prepare(`
      INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price, total_price)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(orderId, product ? Number(product.id) : null, productName, quantity, unitPrice, unitPrice * quantity);
  }

  return { orderId, orderNumber };
}
