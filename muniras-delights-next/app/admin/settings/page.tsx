"use client";

import { useEffect, useState } from 'react';

export default function AdminSettingsPage() {
  const [form, setForm] = useState<Record<string, string>>({});
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordMessage, setPasswordMessage] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [adminUsers, setAdminUsers] = useState<Array<{ id: number; username: string; display_name: string; created_at: string }>>([]);
  const [newAdminForm, setNewAdminForm] = useState({ username: '', display_name: '', password: '' });
  const [adminMessage, setAdminMessage] = useState('');
  const [isCreatingAdmin, setIsCreatingAdmin] = useState(false);

  const refresh = async () => {
    const res = await fetch('/api/admin/settings', { credentials: 'include' });
    if (res.status === 401) window.location.href = '/admin/login';
    const data = await res.json();
    setForm(data);

    const usersRes = await fetch('/api/admin/users', { credentials: 'include' });
    if (usersRes.ok) {
      const usersData = await usersRes.json();
      setAdminUsers(usersData.users ?? []);
    }
  };

  useEffect(() => { refresh(); }, []);

  const save = async () => {
    await fetch('/api/admin/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(form),
    });
  };

  const changePassword = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPasswordMessage('');
    setIsChangingPassword(true);

    try {
      const response = await fetch('/api/admin/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(passwordForm),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Could not change password');

      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setPasswordMessage('Password changed successfully.');
    } catch (error) {
      setPasswordMessage(error instanceof Error ? error.message : 'Could not change password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const createAdmin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAdminMessage('');
    setIsCreatingAdmin(true);

    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(newAdminForm),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Could not create administrator');

      setNewAdminForm({ username: '', display_name: '', password: '' });
      setAdminMessage('New admin account created successfully.');
      await refresh();
    } catch (error) {
      setAdminMessage(error instanceof Error ? error.message : 'Could not create administrator');
    } finally {
      setIsCreatingAdmin(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fff8f0] p-8">
      <div className="mx-auto max-w-3xl rounded-2xl border bg-white p-6 shadow-sm">
        <h1 className="mb-6 text-3xl font-bold text-accent">Business Settings</h1>
        <div className="space-y-3">
          <input value={form.business_name || ''} onChange={(e) => setForm({ ...form, business_name: e.target.value })} placeholder="Business name" className="w-full rounded-lg border px-3 py-2" />
          <input value={form.phone || ''} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Phone" className="w-full rounded-lg border px-3 py-2" />
          <input value={form.email || ''} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email" className="w-full rounded-lg border px-3 py-2" />
          <input value={form.address || ''} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Address" className="w-full rounded-lg border px-3 py-2" />
          <input value={form.opening_hours || ''} onChange={(e) => setForm({ ...form, opening_hours: e.target.value })} placeholder="Opening Hours" className="w-full rounded-lg border px-3 py-2" />
          <input value={form.currency || ''} onChange={(e) => setForm({ ...form, currency: e.target.value })} placeholder="Currency" className="w-full rounded-lg border px-3 py-2" />
          <button onClick={save} className="rounded-xl bg-accent px-4 py-3 text-white">Save Settings</button>
        </div>

        <section className="mt-8 border-t pt-6" aria-labelledby="admins-heading">
          <h2 id="admins-heading" className="mb-2 text-xl font-semibold text-accent">Admin Accounts</h2>
          <p className="mb-4 text-sm text-gray-600">Create another administrator for the dashboard.</p>

          <div className="mb-4 space-y-2 rounded-xl border bg-gray-50 p-3">
            {adminUsers.length === 0 ? (
              <p className="text-sm text-gray-500">No other admins yet.</p>
            ) : (
              adminUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between rounded-lg bg-white px-3 py-2">
                  <div>
                    <p className="font-medium text-gray-800">{user.display_name}</p>
                    <p className="text-sm text-gray-500">@{user.username}</p>
                  </div>
                  <span className="text-xs uppercase tracking-wide text-accent">Active</span>
                </div>
              ))
            )}
          </div>

          <form onSubmit={createAdmin} className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Username
              <input
                required
                minLength={3}
                value={newAdminForm.username}
                onChange={(event) => setNewAdminForm({ ...newAdminForm, username: event.target.value })}
                className="mt-1 w-full rounded-lg border px-3 py-2"
              />
            </label>
            <label className="block text-sm font-medium text-gray-700">
              Display name
              <input
                required
                minLength={2}
                value={newAdminForm.display_name}
                onChange={(event) => setNewAdminForm({ ...newAdminForm, display_name: event.target.value })}
                className="mt-1 w-full rounded-lg border px-3 py-2"
              />
            </label>
            <label className="block text-sm font-medium text-gray-700">
              Password
              <input
                type="password"
                required
                minLength={12}
                value={newAdminForm.password}
                onChange={(event) => setNewAdminForm({ ...newAdminForm, password: event.target.value })}
                className="mt-1 w-full rounded-lg border px-3 py-2"
              />
            </label>
            {adminMessage && <p className="text-sm text-gray-700">{adminMessage}</p>}
            <button
              type="submit"
              disabled={isCreatingAdmin}
              className="rounded-xl bg-accent px-4 py-3 text-white disabled:opacity-60"
            >
              {isCreatingAdmin ? 'Creating admin...' : 'Add admin'}
            </button>
          </form>
        </section>

        <section className="mt-8 border-t pt-6" aria-labelledby="password-heading">
          <h2 id="password-heading" className="mb-2 text-xl font-semibold text-accent">Change Admin Password</h2>
          <p className="mb-4 text-sm text-gray-600">Use at least 12 characters. Your current password is required.</p>
          <form onSubmit={changePassword} className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Current password
              <input
                type="password"
                autoComplete="current-password"
                required
                value={passwordForm.currentPassword}
                onChange={(event) => setPasswordForm({ ...passwordForm, currentPassword: event.target.value })}
                className="mt-1 w-full rounded-lg border px-3 py-2"
              />
            </label>
            <label className="block text-sm font-medium text-gray-700">
              New password
              <input
                type="password"
                autoComplete="new-password"
                minLength={12}
                maxLength={72}
                required
                value={passwordForm.newPassword}
                onChange={(event) => setPasswordForm({ ...passwordForm, newPassword: event.target.value })}
                className="mt-1 w-full rounded-lg border px-3 py-2"
              />
            </label>
            <label className="block text-sm font-medium text-gray-700">
              Confirm new password
              <input
                type="password"
                autoComplete="new-password"
                minLength={12}
                maxLength={72}
                required
                value={passwordForm.confirmPassword}
                onChange={(event) => setPasswordForm({ ...passwordForm, confirmPassword: event.target.value })}
                className="mt-1 w-full rounded-lg border px-3 py-2"
              />
            </label>
            {passwordMessage && <p role="status" className="text-sm text-gray-700">{passwordMessage}</p>}
            <button
              type="submit"
              disabled={isChangingPassword}
              className="rounded-xl bg-accent px-4 py-3 text-white disabled:opacity-60"
            >
              {isChangingPassword ? 'Changing password...' : 'Change Password'}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
