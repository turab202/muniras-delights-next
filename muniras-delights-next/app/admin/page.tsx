"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    async function loadDashboard() {
      const res = await fetch('/api/admin/overview', { credentials: 'include' });
      if (res.status === 401) {
        router.replace('/admin/login');
        return;
      }

      if (!res.ok) {
        setLoading(false);
        return;
      }

      const payload = await res.json();
      setData(payload);
      setLoading(false);
    }

    loadDashboard();
  }, [router]);

  const logout = async () => {
    await fetch('/api/admin/logout', { method: 'POST', credentials: 'include' });
    router.push('/admin/login');
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading dashboard...</div>;
  }

  return (
    <div className="min-h-screen bg-[#fff8f0] text-gray-800">
      <aside className="fixed inset-y-0 left-0 w-72 border-r bg-white p-6">
        <div className="text-3xl font-script text-accent">Munira&apos;s</div>
        <nav className="mt-8 space-y-2">
          <a href="/admin" className="block rounded-lg bg-[#f7cac9] px-4 py-3 font-semibold text-accent">Overview</a>
          <a href="/admin/products" className="block rounded-lg px-4 py-3 hover:bg-gray-100">Products</a>
          <a href="/admin/categories" className="block rounded-lg px-4 py-3 hover:bg-gray-100">Categories</a>
          <a href="/admin/orders" className="block rounded-lg px-4 py-3 hover:bg-gray-100">Orders</a>
          <a href="/admin/settings" className="block rounded-lg px-4 py-3 hover:bg-gray-100">Settings</a>
        </nav>
      </aside>

      <main className="ml-72 p-8">
        <header className="flex items-center justify-between border-b pb-6">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-gray-500">Dashboard</p>
            <h1 className="mt-2 text-3xl font-bold text-accent">Overview</h1>
          </div>
          <button onClick={logout} className="rounded-lg border px-4 py-2 font-medium hover:bg-gray-50">Logout</button>
        </header>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Total Orders" value={data?.overview?.totalOrders ?? 0} />
          <StatCard label="Revenue" value={`$${data?.overview?.revenue ?? 0}`} />
          <StatCard label="Products" value={data?.overview?.totalProducts ?? 0} />
          <StatCard label="Categories" value={data?.overview?.totalCategories ?? 0} />
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-bold text-accent">Recent Orders</h2>
            <div className="space-y-3">
              {(data?.recentOrders ?? []).map((order: any) => (
                <div key={order.id} className="flex items-center justify-between rounded-xl border p-3">
                  <div>
                    <p className="font-semibold">{order.customer_name}</p>
                    <p className="text-sm text-gray-500">{order.order_number}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">${order.total}</p>
                    <p className="text-xs uppercase tracking-wide text-gray-500">{order.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-bold text-accent">Admin Activity</h2>
            <div className="space-y-3">
              {(data?.activity ?? []).map((entry: any) => (
                <div key={entry.id} className="rounded-xl border p-3">
                  <p className="font-semibold">{entry.action}</p>
                  <p className="text-sm text-gray-500">{entry.details || 'No details'}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">
      <p className="text-sm uppercase tracking-[0.2em] text-gray-500">{label}</p>
      <p className="mt-3 text-3xl font-bold text-accent">{value}</p>
    </div>
  );
}
