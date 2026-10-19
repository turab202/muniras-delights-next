"use client";

import { useEffect, useState } from 'react';

export default function AdminCategoriesPage() {
  const [items, setItems] = useState<any[]>([]);
  const [form, setForm] = useState({ id: '', name: '', slug: '', sort_order: '0' });

  const refresh = async () => {
    const res = await fetch('/api/admin/categories', { credentials: 'include' });
    if (res.status === 401) window.location.href = '/admin/login';
    const data = await res.json();
    setItems(data);
  };

  useEffect(() => { refresh(); }, []);

  const save = async () => {
    await fetch('/api/admin/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ id: form.id ? Number(form.id) : undefined, name: form.name, slug: form.slug || form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'), sort_order: Number(form.sort_order) }),
    });
    setForm({ id: '', name: '', slug: '', sort_order: '0' });
    refresh();
  };

  const del = async (id: number) => {
    await fetch(`/api/admin/categories?id=${id}`, { method: 'DELETE', credentials: 'include' });
    refresh();
  };

  return (
    <div className="min-h-screen bg-[#fff8f0] p-8">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-6 text-3xl font-bold text-accent">Categories</h1>
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            {items.map((item) => (
              <div key={item.id} className="mb-3 flex items-center justify-between rounded-xl border p-4">
                <div>
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-sm text-gray-500">{item.slug}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setForm({ id: String(item.id), name: item.name, slug: item.slug, sort_order: String(item.sort_order) })} className="rounded-lg border px-3 py-2">Edit</button>
                  <button onClick={() => del(item.id)} className="rounded-lg bg-red-600 px-3 py-2 text-white">Delete</button>
                </div>
              </div>
            ))}
          </div>
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-bold text-accent">{form.id ? 'Edit Category' : 'New Category'}</h2>
            <div className="space-y-3">
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Name" className="w-full rounded-lg border px-3 py-2" />
              <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="Slug" className="w-full rounded-lg border px-3 py-2" />
              <input value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: e.target.value })} placeholder="Sort order" type="number" className="w-full rounded-lg border px-3 py-2" />
              <button onClick={save} className="w-full rounded-xl bg-accent px-4 py-3 text-white">Save</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
