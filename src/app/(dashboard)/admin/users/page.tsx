'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Plus, Edit2, UserX, UserCheck, Shield, AlertCircle, Users as UsersIcon } from 'lucide-react';
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

interface UserRow {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  lastLoginAt: string | null;
  userDepartments: Array<{
    isPrimary: boolean;
    department: { id: string; name: string };
    role: { id: string; title: string };
  }>;
}

interface DeptOption {
  id: string;
  name: string;
}

interface RoleOption {
  id: string;
  title: string;
  departmentId: string;
}

const ROLES = ['ADMIN', 'EXECUTIVE', 'MANAGER', 'MEMBER', 'VIEWER'];

const roleBadge: Record<string, string> = {
  ADMIN: 'bg-red-500/10 text-red-700 border-red-200',
  EXECUTIVE: 'bg-purple-500/10 text-purple-700 border-purple-200',
  MANAGER: 'bg-blue-500/10 text-blue-700 border-blue-200',
  MEMBER: 'bg-gray-500/10 text-gray-700 border-gray-200',
  VIEWER: 'bg-gray-400/10 text-gray-500 border-gray-200',
};

interface FormState {
  id?: string;
  name: string;
  email: string;
  password: string;
  role: string;
  departmentId: string;
  departmentRoleId: string;
}

const emptyForm: FormState = { name: '', email: '', password: '', role: 'MEMBER', departmentId: '', departmentRoleId: '' };

export default function AdminUsersPage() {
  const { data: session } = useSession();
  const toast = useToast();

  const [users, setUsers] = useState<UserRow[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [departments, setDepartments] = useState<DeptOption[]>([]);
  const [roles, setRoles] = useState<RoleOption[]>([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoadError(null);
      const res = await api<{ users: UserRow[] }>('/api/users?pageSize=100');
      setUsers(res.users);
    } catch (e) {
      setLoadError((e as Error).message);
      setUsers([]);
    }
  }, []);

  useEffect(() => {
    void load();
    api<{ departments: DeptOption[] }>('/api/departments')
      .then((r) => setDepartments(r.departments))
      .catch(() => undefined);
    api<{ roles: RoleOption[] }>('/api/roles')
      .then((r) => setRoles(r.roles))
      .catch(() => undefined);
  }, [load]);

  const deptRoles = roles.filter((r) => r.departmentId === form.departmentId);

  const openCreate = () => {
    setForm(emptyForm);
    setFormError(null);
    setModalOpen(true);
  };

  const openEdit = (u: UserRow) => {
    const primary = u.userDepartments.find((d) => d.isPrimary) ?? u.userDepartments[0];
    setForm({
      id: u.id,
      name: u.name,
      email: u.email,
      password: '',
      role: u.role,
      departmentId: primary?.department.id ?? '',
      departmentRoleId: primary?.role.id ?? '',
    });
    setFormError(null);
    setModalOpen(true);
  };

  const submit = async () => {
    if (!form.name.trim() || !form.email.trim()) {
      setFormError('Name and email are required');
      return;
    }
    if (!form.id && !form.password) {
      setFormError('Password is required for new users');
      return;
    }
    if (form.departmentId && !form.departmentRoleId) {
      setFormError('Pick a role within the selected department');
      return;
    }
    setSaving(true);
    setFormError(null);
    const departmentsPayload = form.departmentId
      ? [{ departmentId: form.departmentId, roleId: form.departmentRoleId, isPrimary: true }]
      : [];
    try {
      if (form.id) {
        await api(`/api/users/${form.id}`, {
          method: 'PATCH',
          body: JSON.stringify({
            name: form.name.trim(),
            email: form.email.trim(),
            role: form.role,
            ...(form.password ? { password: form.password } : {}),
            departments: departmentsPayload,
          }),
        });
        toast.success('User updated');
      } else {
        await api('/api/users', {
          method: 'POST',
          body: JSON.stringify({
            name: form.name.trim(),
            email: form.email.trim(),
            password: form.password,
            role: form.role,
            departments: departmentsPayload,
          }),
        });
        toast.success('User created');
      }
      setModalOpen(false);
      void load();
    } catch (e) {
      setFormError((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (u: UserRow) => {
    setBusyId(u.id);
    try {
      if (u.isActive) {
        await api(`/api/users/${u.id}`, { method: 'DELETE' });
        toast.success(`${u.name} deactivated`);
      } else {
        await api(`/api/users/${u.id}`, { method: 'PATCH', body: JSON.stringify({ isActive: true }) });
        toast.success(`${u.name} reactivated`);
      }
      void load();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Users</h1>
          <p className="text-gray-500">Manage accounts, roles, and department assignments.</p>
        </div>
        <Button onClick={openCreate} className="bg-[#09203F] hover:bg-[#0a2651] text-white font-medium">
          <Plus className="w-4 h-4 mr-2" />
          Add User
        </Button>
      </div>

      {loadError && (
        <Card className="border-red-200 bg-red-50 p-6 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-800">Could not load users</p>
            <p className="text-xs text-red-600 mt-0.5">{loadError}</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => void load()}>
            Retry
          </Button>
        </Card>
      )}

      {users === null && !loadError && (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-xl" />
          ))}
        </div>
      )}

      {users !== null && users.length === 0 && !loadError && (
        <div className="text-center py-16">
          <UsersIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No users found.</p>
        </div>
      )}

      {users !== null && users.length > 0 && (
        <Card className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="border-b border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900">All Users ({users.length})</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {users.map((u) => {
              const primary = u.userDepartments.find((d) => d.isPrimary) ?? u.userDepartments[0];
              return (
                <div key={u.id} className={cn('flex items-center justify-between p-5 hover:bg-gray-50 transition-colors', !u.isActive && 'opacity-60')}>
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-[#09203F]/10 flex items-center justify-center text-sm font-semibold text-[#09203F] flex-shrink-0">
                      {u.name
                        .split(' ')
                        .map((p) => p[0])
                        .slice(0, 2)
                        .join('')
                        .toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium text-gray-900">{u.name}</p>
                        <Badge variant="outline" className={roleBadge[u.role] ?? ''}>
                          <Shield className="w-3 h-3 mr-1" />
                          {u.role.toLowerCase()}
                        </Badge>
                        {!u.isActive && (
                          <Badge variant="outline" className="bg-gray-200 text-gray-500 border-gray-300">
                            inactive
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 truncate">
                        {u.email}
                        {primary && (
                          <span className="text-gray-400">
                            {' '}
                            · {primary.role.title}, {primary.department.name}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button size="sm" variant="ghost" title="Edit user" onClick={() => openEdit(u)}>
                      <Edit2 className="w-4 h-4 text-gray-500" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      title={u.isActive ? 'Deactivate' : 'Reactivate'}
                      disabled={busyId === u.id || u.id === session?.user?.id}
                      onClick={() => void toggleActive(u)}
                    >
                      {u.isActive ? <UserX className="w-4 h-4 text-red-500" /> : <UserCheck className="w-4 h-4 text-emerald-600" />}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Create/Edit modal */}
      <Modal
        open={modalOpen}
        onOpenChange={(open) => {
          setModalOpen(open);
          if (!open) setFormError(null);
        }}
        title={form.id ? 'Edit User' : 'Add User'}
        size="lg"
      >
        <div className="space-y-4">
          {formError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800">{formError}</div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <Input label="Full Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <Input label="Email *" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>

          <Input
            label={form.id ? 'New Password (leave blank to keep)' : 'Password *'}
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="Min 10 chars, upper + lower + number"
            autoComplete="new-password"
          />

          <Select
            label="System Role"
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            options={ROLES.map((r) => ({ value: r, label: r.toLowerCase() }))}
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Department"
              value={form.departmentId}
              onChange={(e) => setForm({ ...form, departmentId: e.target.value, departmentRoleId: '' })}
              options={[{ value: '', label: 'None' }, ...departments.map((d) => ({ value: d.id, label: d.name }))]}
            />
            <Select
              label="Role in Department"
              value={form.departmentRoleId}
              onChange={(e) => setForm({ ...form, departmentRoleId: e.target.value })}
              disabled={!form.departmentId}
              options={[{ value: '', label: form.departmentId ? 'Select role…' : 'Pick a department first' }, ...deptRoles.map((r) => ({ value: r.id, label: r.title }))]}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button onClick={submit} loading={saving} className="flex-1 bg-[#09203F] hover:bg-[#0a2651] text-white">
              {form.id ? 'Save Changes' : 'Create User'}
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
