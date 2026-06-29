'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type AdminUser = {
    id: string;
    name: string | null;
    email: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
};

type UserForm = {
    name: string;
    email: string;
    password: string;
    isActive: boolean;
};

const emptyForm: UserForm = {
    name: '',
    email: '',
    password: '',
    isActive: true,
};

export default function AdminUsers({ users: initialUsers }: { users: AdminUser[] }) {
    const [users, setUsers] = useState<AdminUser[]>(initialUsers);
    const [form, setForm] = useState<UserForm>(emptyForm);
    const [editingUserId, setEditingUserId] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const router = useRouter();

    const resetForm = () => {
        setForm(emptyForm);
        setEditingUserId(null);
    };

    const startEdit = (user: AdminUser) => {
        setEditingUserId(user.id);
        setForm({
            name: user.name ?? '',
            email: user.email,
            password: '',
            isActive: user.isActive,
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const response = await fetch(editingUserId ? `/api/admin/users/${editingUserId}` : '/api/admin/users', {
                method: editingUserId ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(form),
            });

            if (!response.ok) {
                throw new Error(editingUserId ? 'Failed to update account' : 'Failed to create account');
            }

            const savedUser = await response.json();
            setUsers(prevUsers => editingUserId
                ? prevUsers.map(user => user.id === editingUserId ? savedUser : user)
                : [savedUser, ...prevUsers]
            );
            resetForm();
            router.refresh();
        } catch (error) {
            console.error('Failed to save admin account:', error);
        } finally {
            setSaving(false);
        }
    };

    const toggleActive = async (user: AdminUser) => {
        try {
            const response = await fetch(`/api/admin/users/${user.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: user.name ?? '',
                    email: user.email,
                    isActive: !user.isActive,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to toggle account state');
            }

            const savedUser = await response.json();
            setUsers(prevUsers => prevUsers.map(existingUser => existingUser.id === user.id ? savedUser : existingUser));
            router.refresh();
        } catch (error) {
            console.error('Failed to toggle account state:', error);
        }
    };

    return (
        <div className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4 bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-md">
                <div className="flex items-center justify-between gap-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {editingUserId ? 'Edit Admin Account' : 'Create Admin Account'}
                    </h3>
                    {editingUserId && (
                        <button
                            type="button"
                            onClick={resetForm}
                            className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                        >
                            Cancel edit
                        </button>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Name
                    </label>
                    <input
                        type="text"
                        value={form.name}
                        onChange={(event) => setForm({ ...form, name: event.target.value })}
                        className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white px-4 py-2"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Email
                    </label>
                    <input
                        type="email"
                        required
                        value={form.email}
                        onChange={(event) => setForm({ ...form, email: event.target.value })}
                        className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white px-4 py-2"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Password {editingUserId ? '(leave blank to keep current)' : ''}
                    </label>
                    <input
                        type="password"
                        required={!editingUserId}
                        value={form.password}
                        onChange={(event) => setForm({ ...form, password: event.target.value })}
                        className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white px-4 py-2"
                    />
                </div>

                <label className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                    <input
                        type="checkbox"
                        checked={form.isActive}
                        onChange={(event) => setForm({ ...form, isActive: event.target.checked })}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    Account active
                </label>

                <div className="flex flex-col sm:flex-row gap-4 pt-2">
                    <button
                        type="submit"
                        disabled={saving}
                        className="w-full sm:w-auto bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
                    >
                        {editingUserId ? 'Update Account' : 'Create Account'}
                    </button>
                    <button
                        type="button"
                        onClick={resetForm}
                        className="w-full sm:w-auto bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                    >
                        Reset
                    </button>
                </div>
            </form>

            <div className="grid gap-4">
                {users.map((user) => (
                    <div key={user.id} className="bg-white dark:bg-gray-800 p-4 sm:p-5 rounded-lg shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                                {user.name || 'Unnamed account'}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-300">{user.email}</p>
                            <p className={`mt-1 text-sm ${user.isActive ? 'text-green-600' : 'text-red-600'}`}>
                                {user.isActive ? 'Active' : 'Disabled'}
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => startEdit(user)}
                                className="px-4 py-2 rounded-lg text-blue-600 hover:text-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/20 transition-colors"
                            >
                                Edit
                            </button>
                            <button
                                onClick={() => toggleActive(user)}
                                className={`px-4 py-2 rounded-lg transition-colors ${user.isActive ? 'text-red-600 hover:text-red-800 hover:bg-red-100 dark:hover:bg-red-900/20' : 'text-green-600 hover:text-green-800 hover:bg-green-100 dark:hover:bg-green-900/20'}`}
                            >
                                {user.isActive ? 'Disable' : 'Enable'}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}