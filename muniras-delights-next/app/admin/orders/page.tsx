"use client";

import { useEffect, useState } from 'react';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);

  const refresh = async () => {
    const res = await fetch('/api/admin/orders', { credentials: 'include' });
    if (res.status === 401) window.location.href = '/admin/login';
    const data = await res.json();
    setOrders(data);
  };

  useEffect(() => { refresh(); }, []);

  const updateStatus = async (id: number, status: string) => {
    await fetch('/api/admin/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ id, status }),
    });
    refresh();
  };

  return (
    <div className="min-h-screen bg-[#fff8f0] p-8">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-6 text-3xl font-bold text-accent">Orders</h1>
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="rounded-2xl border bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="space-y-2">
                  <p className="text-lg font-semibold">{order.order_number}</p>
                  <p className="text-sm text-gray-500">{order.customer_name} • {order.customer_phone}</p>
                  <p className="text-sm text-gray-500">{order.customer_address || 'No address provided'}</p>
                  {(order.customer_email || order.delivery_date) && (
                    <p className="text-sm text-gray-500">
                      {[order.customer_email, order.delivery_date && `Delivery: ${order.delivery_date}`].filter(Boolean).join(' • ')}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-2 text-xs text-gray-600">
                    {(order.items || []).map((item: any) => (
                      <span key={item.id} className="rounded-full border bg-gray-50 px-2 py-1">{item.product_name} × {item.quantity}</span>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col items-start gap-3 md:items-end">
                  <p className="font-semibold">${order.total}</p>
                  <select value={order.status} onChange={(e) => updateStatus(order.id, e.target.value)} className="rounded-lg border px-3 py-2">
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              {order.payment_screenshot_url && (
                <div className="mt-4 overflow-hidden rounded-xl border bg-gray-50 p-3">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-gray-700">Payment Screenshot</p>
                    <a href={order.payment_screenshot_url} target="_blank" rel="noreferrer" className="text-sm font-medium text-accent underline underline-offset-2">
                      Open full size
                    </a>
                  </div>
                  <a href={order.payment_screenshot_url} target="_blank" rel="noreferrer" aria-label="Open payment screenshot full size">
                    <img src={order.payment_screenshot_url} alt="Payment screenshot" className="max-h-96 max-w-full rounded-lg object-contain object-left" />
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
