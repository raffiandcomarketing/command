'use client';

import { useCallback, useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, ChevronDown, AlertCircle, Users } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/toast';
import { api } from '@/lib/client/api';
import { cn } from '@/lib/utils';

interface RoleRow {
  id: string;
  title: string;
  description: string | null;
  departmentId: string;
  isActive: boolean;
  department: { id: string; name: string };
  _count: { userDepartments: number };
}

interface Dept {
  id: string;
  name: string;
}

export default function AdminRolesPage() {
  const toast = useToast();
  const [roles, setRoles] = useState<RoleRow[] | null>(null);
  const [departments, setDepartments] = useState<Dept[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<{ id?: string; title: string; description: string; departmentId: string }>({
    title: '',
    description: '',
    departmentId: '',
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoadError(null);
      const [r, d] = await Promise.all([
        api<{ roles: RoleRow[] }>('/api/roles'),
        api<{ departments: Dept[] }>('/api/departments'),
      ]);
      setRoles(r.roles);
      setDepartments(d.departments);
    } catch (e) {
      setLoadError((e as Error).message);
      setRoles([]);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const submit = async () => {
    if (!form.title.trim() || !form.departmentId) {
      setFormError('Title and department are required');
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      if (form.id) {
        await api(`/api/roles/${form.id}`, {
          method: 'PATCH',
          body: JSON.stringify({ title: form.title.trim(), description: form.description.trim() || null }),
        });
        toast.success('Role updated');
      } else {
        await api('/api/roles', {
          method: 'POST',
          body: JSON.stringify({
            title: form.title.trim(),
            description: form.description.trim() || undefined,
            departmentId: form.departmentId,
          }),
        });
        toast.success('Role created');
      }
      setModalOpen(false);
      void load();
    } catch (e) {
      setFormError((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (role: RoleRow) => {
    if (!window.confirm(`Delete role "${role.title}"?`)) return;
    try {
      await api(`/api/roles/${role.id}`, { method: 'DELETE' });
      toast.success('Role deleted');
      void load();
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const byDept = departments.map((d) => ({
    dept: d,
    roles: (roles ?? []).filter((r) => r.departmentId === d.id),
  }));

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Roles</h1>
          <p className="text-gray-500">Department role structure used for assignments and RBAC.</p>
        </div>
        <Button
          onClick={() => {
            setForm({ title: '', description: '', departmentId: departments[0]?.id ?? '' });
            setFormError(null);
            setModalOpen(true);
          }}
          className="bg-[#09203F] hover:bg-[#0a2651] text-white font-medium"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Role
        </Button>
      </div>

      {loadError && (
        <Card className="border-red-200 bg-red-50 p-6 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-800">Could not load roles</p>
            <p className="text-xs text-red-600 mt-0.5">{loadError}</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => void load()}>
            Retry
          </Button>
        </Card>
      )}

      {roles === null && !loadError && (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-14 rounded-xl" />
          ))}
        </div>
      )}

      <div className="space-y-3">
        {byDept.map(({ dept, roles: deptRoles }) => (
          <Card key={dept.id} className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <button
              onClick={() => setExpanded(expanded === dept.id ? null : dept.id)}
              className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <h3 className="font-semibold text-gray-900">{dept.name}</h3>
                <Badge variant="outline" className="bg-gray-100 text-gray-600 border-gray-200">
                  {deptRoles.length} role{deptRoles.length === 1 ? '' : 's'}
                </Badge>
              </div>
              <ChevronDown className={cn('w-5 h-5 text-gray-400 transition-transform', expanded === dept.id && 'rotate-180')} />
            </button>
            {expanded === dept.id && (
              <div className="border-t border-gray-100 divide-y divide-gray-50">
                {deptRoles.length === 0 && <p className="p-5 text-sm text-gray-400">No roles in this department yet.</p>}
                {deptRoles.map((r) => (
                  <div key={r.id} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50/60">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{r.title}</p>
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {r._count.userDepartments} member{r._count.userDepartments === 1 ? '' : 's'}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setForm({ id: r.id, title: r.title, description: r.description ?? '', departmentId: r.departmentId });
                          setFormError(null);
                          setModalOpen(true);
                        }}
                      >
                        <Edit2 className="w-4 h-4 text-gray-500" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => void remove(r)}>
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        ))}
      </div>

      <Modal
        open={modalOpen}
        onOpenChange={(open) => {
          setModalOpen(open);
          if (!open) setFormError(null);
        }}
        title={form.id ? 'Edit Role' : 'Add Role'}
        size="md"
      >
        <div className="space-y-4">
          {formError && <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800">{formError}</div>}
          <Input label="Title *" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g., Senior Sales Associate" />
          {!form.id && (
            <Select
              label="Department *"
              value={form.departmentId}
              onChange={(e) => setForm({ ...form, departmentId: e.target.value })}
              options={departments.map((d) => ({ value: d.id, label: d.name }))}
            />
          )}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg min-h-16 resize-none focus:outline-none focus:ring-2 focus:ring-[#09203F]/20"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Button onClick={submit} loading={saving} className="flex-1 bg-[#09203F] hover:bg-[#0a2651] text-white">
              {form.id ? 'Save Changes' : 'Create Role'}
            </Button>
            <Button variant="outline" onClick={() => setModalOpen(false)} disabled={saving} className="flex-1">
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
