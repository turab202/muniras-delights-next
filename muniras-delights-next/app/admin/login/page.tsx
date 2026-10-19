"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('ChangeMe123!');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const response = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ username, password }),
    });

    const result = await response.json();
    setLoading(false);

    if (!response.ok) {
      setError(result.error || 'Login failed');
      return;
    }

    router.push('/admin');
    router.refresh();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#fff8f0] p-6">
      <form onSubmit={submit} className="w-full max-w-md rounded-3xl border bg-white p-8 shadow-lg">
        <div className="mb-8 text-center">
          <div className="text-4xl font-script text-accent">Munira&apos;s</div>
          <p className="mt-2 text-sm uppercase tracking-[0.2em] text-gray-500">Admin Login</p>
        </div>

        <label className="mb-2 block text-sm font-medium text-gray-700">Username</label>
        <input value={username} onChange={(e) => setUsername(e.target.value)} className="mb-4 w-full rounded-xl border px-3 py-2" />

        <label className="mb-2 block text-sm font-medium text-gray-700">Password</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mb-4 w-full rounded-xl border px-3 py-2" />

        {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

        <button disabled={loading} className="w-full rounded-xl bg-accent px-4 py-3 font-semibold text-white disabled:opacity-60">
          {loading ? 'Signing in...' : 'Login'}
        </button>
      </form>
    </div>
  );
}
