'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, ChevronDown } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Role {
  id: string;
  name: string;
  departmentId: string;
  departmentName: string;
  permissions: string[];
  memberCount: number;
}

interface Department {
  id: string;
  name: string;
  roles: Role[];
}

export default function RolesPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedDept, setExpandedDept] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    departmentId: '',
    permissions: [] as string[],
  });

  const allPermissions = [
    'view_tasks',
    'create_tasks',
    'edit_tasks',
    'delete_tasks',
    'view_reports',
    'create_reports',
    'manage_users',
    'manage_roles',
  ];

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const response = await fetch('/api/departments');
      const data = await response.json();
      const depts: Department[] = (data.departments || []).map((d: any) => ({
        ...d,
        roles: [],
      }));
      setDepartments(depts);
    } catch (error) {
      console.error('Failed to fetch departments:', error);
      setDepartments([
        {
          id: '1',
          name: 'Sales',
          roles: [
            {
              id: 'role1',
              name: 'Sales Manager',
              departmentId: '1',
              departmentName: 'Sales',
              permissions: ['view_tasks', 'create_tasks', 'edit_tasks'],
              memberCount: 3,
            },
          ],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.departmentId) {
      alert('Please select a department');
      return;
    }
    setFormData({ name: '', departmentId: '', permissions: [] });
    setEditingId(null);
    setShowForm(false);
    fetchDepartments();
  };

  const handleEdit = (role: Role) => {
    setFormData({
      name: role.name,
      departmentId: role.departmentId,
      permissions: role.permissions,
    });
    setEditingId(role.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this role?')) return;
    fetchDepartments();
  };

  const togglePermission = (permission: string) => {
    setFormData((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter((p) => p !== permission)
        : [...prev.permissions, permission],
    }));
  };

  if (loading) {
    return <div className="p-8 text-gray-600">Loading roles...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Roles & Permissions</h1>
        <Button
          onClick={() => {
            setFormData({ name: '', departmentId: '', permissions: [] });
            setEditingId(null);
            setShowForm(!showForm);
          }}
          className="bg-[#09203F] hover:bg-[#0a2651] text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Role
        </Button>
      </div>

      {showForm && (
        <Card className="bg-white border border-gray-200 rounded-xl p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role Name
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
                Department
              </label>
              <select
                value={formData.departmentId}
                onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                className="w-full px-4 py-2 bg-white border border-gray-200 rounded text-gray-900 focus:outline-none focus:border-[#09203F]"
                required
              >
                <option value="">Select a department</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Permissions
              </label>
              <div className="grid grid-cols-2 gap-3">
                {allPermissions.map((perm) => (
                  <label key={perm} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.permissions.includes(perm)}
                      onChange={() => togglePermission(perm)}
                      className="w-4 h-4 rounded border-gray-300 bg-white accent-[#09203F]"
                    />
                    <span className="text-sm text-gray-700">
                      {perm.replace(/_/g, ' ')}
                    </span>
                  </label>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="bg-[#09203F] hover:bg-[#0a2651] text-white">
                {editingId ? 'Update' : 'Create'} Role
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

      <div className="space-y-4">
        {departments.map((dept) => (
          <Card key={dept.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <button
              onClick={() => setExpandedDept(expandedDept === dept.id ? null : dept.id)}
              className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <h3 className="text-lg font-semibold text-gray-900">
                {dept.name}
              </h3>
              <ChevronDown
                className={`w-5 h-5 text-[#09203F] transition-transform ${
                  expandedDept === dept.id ? 'rotate-180' : ''
                }`}
              />
            </button>

            {expandedDept === dept.id && (
              <div className="border-t border-gray-200 p-6 space-y-3">
                {dept.roles.length === 0 ? (
                  <p className="text-gray-600 text-sm">No roles in this department</p>
                ) : (
                  dept.roles.map((role) => (
                    <div
                      key={role.id}
                      className="flex items-start justify-between p-3 bg-gray-50 rounded border border-gray-200"
                    >
                      <div>
                        <h4 className="font-medium text-gray-900">{role.name}</h4>
                        <p className="text-xs text-gray-600 mt-1">
                          {role.memberCount} members
                        </p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {role.permissions.map((perm) => (
                            <span
                              key={perm}
                              className="inline-block px-2 py-1 bg-white text-xs text-gray-700 rounded"
                            >
                              {perm}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(role)}
                          className="p-2 hover:bg-white rounded transition-colors"
                        >
                          <Edit2 className="w-4 h-4 text-[#09203F]" />
                        </button>
                        <button
                          onClick={() => handleDelete(role.id)}
                          className="p-2 hover:bg-white rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
