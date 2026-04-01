'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Mail, Shield } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  members?: Array<{ department: { id: string; name: string } }>;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [departments, setDepartments] = useState<Array<{ id: string; name: string }>>([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'USER',
    departmentIds: [] as string[],
  });

  useEffect(() => {
    fetchUsers();
    fetchDepartments();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users');
      const data = await response.json();
      setUsers(data.users || []);
    } catch (error) {
      setUsers([
        { id: '1', name: 'Admin User', email: 'admin@example.com', role: 'ADMIN', },
        { id: '2', name: 'John Doe', email: 'john@example.com', role: 'USER', },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await fetch('/api/departments');
      const data = await response.json();
      setDepartments(data.departments || []);
    } catch (error) {
      console.error('Failed to fetch departments:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = editingId ? 'PATCH' : 'POST';
      const url = editingId ? `/api/users/${editingId}` : '/api/users';
      const body = editingId
        ? { ...formData, password: formData.password || undefined }
        : formData;
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (response.ok) {
        setFormData({ name: '', email: '', password: '', role: 'USER', departmentIds: [], });
        setEditingId(null);
        setShowForm(false);
        fetchUsers();
      }
    } catch (error) {
      console.error('Failed to save user:', error);
    }
  };

  const handleEdit = (user: User) => {
    const deptIds = user.members?.map((m) => m.department.id) || [];
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
      departmentIds: deptIds,
    });
    setEditingId(user.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      await fetch(`/api/users/${id}`, { method: 'DELETE' });
      fetchUsers();
    } catch (error) {
      console.error('Failed to delete user:', error);
    }
  };

  const toggleDepartment = (deptId: string) => {
    setFormData((prev) => ({
      ...prev,
      departmentIds: prev.departmentIds.includes(deptId)
        ? prev.departmentIds.filter((id) => id !== deptId)
        : [...prev.departmentIds, deptId],
    }));
  };

  if (loading) {
    return <div className="p-8 text-gray-600">Loading users...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Users</h1>
        <Button
          onClick={() => {
            setFormData({ name: '', email: '', password: '', role: 'USER', departmentIds: [], });
            setEditingId(null);
            setShowForm(!showForm);
          }}
          className="bg-[#09203F] hover:bg-[#0a2651] text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          New User
        </Button>
      </div>

      {showForm && (
        <Card className="bg-white border border-gray-200 rounded-xl p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 bg-white border border-gray-200 rounded text-gray-900 focus:outline-none focus:border-[#09203F]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 bg-white border border-gray-200 rounded text-gray-900 focus:outline-none focus:border-[#09203F]"
                  required
                />
              </div>
            </div>

            {!editingId && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-2 bg-white border border-gray-200 rounded text-gray-900 focus:outline-none focus:border-[#09203F]"
                  required={!editingId}
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-4 py-2 bg-white border border-gray-200 rounded text-gray-900 focus:outline-none focus:border-[#09203F]"
              >
                <option value="USER">User</option>
                <option value="MANAGER">Manager</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Departments
              </label>
              <div className="space-y-2">
                {departments.map((dept) => (
                  <label key={dept.id} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.departmentIds.includes(dept.id)}
                      onChange={() => toggleDepartment(dept.id)}
                      className="w-4 h-4 rounded border-gray-300 bg-white accent-[#09203F]"
                    />
                    <span className="text-sm text-gray-700">{dept.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <Button type="submit" className="bg-[#09203F] hover:bg-[#0a2651] text-white">
                {editingId ? 'Update' : 'Create'} User
              </Button>
              <Button
                type="button"
                onClick={() => setShowForm(false)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-900"
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                Name
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                Email
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                Role
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                Departments
              </th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <span className="text-gray-900 font-medium">{user.name}</span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail className="w-4 h-4" />
                    {user.email}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <Badge
                    className={
                      user.role === 'ADMIN'
                        ? 'bg-red-600 text-white'
                        : user.role === 'MANAGER'
                          ? 'bg-[#09203F] text-white'
                          : 'bg-gray-200 text-gray-900'
                    }
                  >
                    <Shield className="w-3 h-3 mr-1 inline" />
                    {user.role}
                  </Badge>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-1">
                    {user.members?.map((m) => (
                      <Badge key={m.department.id} className="bg-gray-100 text-gray-900">
                        {m.department.name}
                      </Badge>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => handleEdit(user)}
                    className="p-2 hover:bg-gray-200 rounded transition-colors inline-block"
                  >
                    <Edit2 className="w-4 h-4 text-[#09203F]" />
                  </button>
                  <button
                    onClick={() => handleDelete(user.id)}
                    className="p-2 hover:bg-gray-200 rounded transition-colors inline-block"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
