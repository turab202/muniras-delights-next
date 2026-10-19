"use client";

import { useEffect, useState } from 'react';

export default function AdminProductsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ id: '', name: '', slug: '', description: '', price: '0', category_id: '', image_url: '', is_featured: false, is_available: true, is_promo: false });

  const refresh = async () => {
    const res = await fetch('/api/admin/products', { credentials: 'include' });
    if (res.status === 401) {
      window.location.href = '/admin/login';
      return;
    }
    const data = await res.json();
    setItems(data);
    setLoading(false);
  };

  useEffect(() => { refresh(); }, []);

  const save = async () => {
    const payload = {
      id: form.id ? Number(form.id) : undefined,
      name: form.name,
      slug: form.slug || form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description: form.description,
      price: Number(form.price),
      category_id: form.category_id ? Number(form.category_id) : null,
      image_url: form.image_url,
      is_featured: form.is_featured,
      is_available: form.is_available,
      is_promo: form.is_promo,
    };

    const response = await fetch('/api/admin/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      setForm({ id: '', name: '', slug: '', description: '', price: '0', category_id: '', image_url: '', is_featured: false, is_available: true, is_promo: false });
      refresh();
    }
  };

  const del = async (id: number) => {
    await fetch(`/api/admin/products?id=${id}`, { method: 'DELETE', credentials: 'include' });
    refresh();
  };

  return (
    <div className="min-h-screen bg-[#fff8f0] p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-accent">Products</h1>
          <a href="/admin" className="rounded-lg border px-4 py-2">Back to dashboard</a>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            {loading ? <p>Loading...</p> : items.map((item) => (
              <div key={item.id} className="mb-4 flex items-center justify-between rounded-xl border p-4">
                <div>
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-sm text-gray-500">{item.category_name || 'Uncategorized'} • ${item.price}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setForm({ id: String(item.id), name: item.name, slug: item.slug, description: item.description, price: String(item.price), category_id: item.category_id ? String(item.category_id) : '', image_url: item.image_url || '', is_featured: Boolean(item.is_featured), is_available: Boolean(item.is_available), is_promo: Boolean(item.is_promo) })} className="rounded-lg border px-3 py-2">Edit</button>
                  <button onClick={() => del(item.id)} className="rounded-lg bg-red-600 px-3 py-2 text-white">Delete</button>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-bold text-accent">{form.id ? 'Edit Product' : 'New Product'}</h2>
            <div className="space-y-3">
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Name" className="w-full rounded-lg border px-3 py-2" />
              <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="Slug" className="w-full rounded-lg border px-3 py-2" />
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description" className="w-full rounded-lg border px-3 py-2" rows={4} />
              <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="Price" className="w-full rounded-lg border px-3 py-2" />
              <input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="Image URL" className="w-full rounded-lg border px-3 py-2" />
              <label className="flex items-center gap-2"><input type="checkbox" checked={form.is_available} onChange={() => setForm({ ...form, is_available: !form.is_available })} /> Available</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={form.is_featured} onChange={() => setForm({ ...form, is_featured: !form.is_featured })} /> Featured</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={form.is_promo} onChange={() => setForm({ ...form, is_promo: !form.is_promo })} /> Promotion</label>
              <button onClick={save} className="w-full rounded-xl bg-accent px-4 py-3 text-white">Save</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
