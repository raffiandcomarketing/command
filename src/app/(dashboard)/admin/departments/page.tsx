'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Eye, EyeOff } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Department {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  roleCount: number;
  memberCount: number;
}

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '' });

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const response = await fetch('/api/departments');
      const data = await response.json();
      setDepartments(data.departments || []);
    } catch (error) {
      console.error('Failed to fetch departments:', error);
      setDepartments([
        { id: '1', name: 'Sales', description: 'Sales operations', isActive: true, roleCount: 3, memberCount: 12, },
        { id: '2', name: 'Operations', description: 'Operations team', isActive: true, roleCount: 2, memberCount: 8, },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = editingId ? 'PATCH' : 'POST';
      const url = editingId ? `/api/departments/${editingId}` : '/api/departments';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        setFormData({ name: '', description: '' });
        setEditingId(null);
        setShowForm(false);
        fetchDepartments();
      }
    } catch (error) {
      console.error('Failed to save department:', error);
    }
  };

  const handleEdit = (dept: Department) => {
    setFormData({ name: dept.name, description: dept.description });
    setEditingId(dept.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this department?')) return;
    try {
      await fetch(`/api/departments/${id}`, { method: 'DELETE' });
      fetchDepartments();
    } catch (error) {
      console.error('Failed to delete department:', error);
    }
  };

  const handleToggleActive = async (dept: Department) => {
    try {
      await fetch(`/api/departments/${dept.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !dept.isActive }),
      });
      fetchDepartments();
    } catch (error) {
      console.error('Failed to toggle department status:', error);
    }
  };

  if (loading) {
    return <div className="p-8 text-gray-600">Loading departments...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Departments</h1>
        <Button
          onClick={() => { setFormData({ name: '', description: '' }); setEditingId(null); setShowForm(!showForm); }}
          className="bg-[#09203F] hover:bg-[#0a2651] text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Department
        </Button>
      </div>

      {showForm && (
        <Card className="bg-white border border-gray-200 rounded-xl p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Department Name
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
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 bg-white border border-gray-200 rounded text-gray-900 focus:outline-none focus:border-[#09203F]"
                rows={3}
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="bg-[#09203F] hover:bg-[#0a2651] text-white">
                {editingId ? 'Update' : 'Create'} Department
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

      <div className="grid gap-4">
        {departments.map((dept) => (
          <Card
            key={dept.id}
            className="bg-white border border-gray-200 rounded-xl p-6 hover:border-[#09203F]/20 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {dept.name}
                  </h3>
                  <Badge
                    className={
                      dept.isActive
                        ? 'bg-emerald-600 text-white'
                        : 'bg-gray-300 text-gray-700'
                    }
                  >
                    {dept.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <p className="text-gray-600 text-sm mb-4">
                  {dept.description}
                </p>
                <div className="flex gap-6 text-sm">
                  <span className="text-gray-600">
                    <span className="text-[#09203F] font-semibold">
                      {dept.roleCount}
                    </span>{' '}
                    Roles
                  </span>
                  <span className="text-gray-600">
                    <span className="text-[#09203F] font-semibold">
                      {dept.memberCount}
                    </span>{' '}
                    Members
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleToggleActive(dept)}
                  className="p-2 hover:bg-gray-100 rounded transition-colors"
                  title={dept.isActive ? 'Deactivate' : 'Activate'}
                >
                  {dept.isActive ? (
                    <Eye className="w-5 h-5 text-[#09203F]" />
                  ) : (
                    <EyeOff className="w-5 h-5 text-gray-500" />
                  )}
                </button>
                <button
                  onClick={() => handleEdit(dept)}
                  className="p-2 hover:bg-gray-100 rounded transition-colors"
                >
                  <Edit2 className="w-5 h-5 text-[#09203F]" />
                </button>
                <button
                  onClick={() => handleDelete(dept.id)}
                  className="p-2 hover:bg-gray-100 rounded transition-colors"
                >
                  <Trash2 className="w-5 h-5 text-red-600" />
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
