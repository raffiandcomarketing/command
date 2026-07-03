'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/toast';
import { api } from '@/lib/client/api';
import { formatDate } from '@/lib/utils';
import { Search, Plus, CheckSquare, LayoutGrid, List, Filter, AlertCircle, Trash2, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TaskRow {
  id: string;
  title: string;
  description: string | null;
  status: 'PENDING' | 'IN_PROGRESS' | 'REVIEW' | 'COMPLETED' | 'CANCELLED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT' | 'CRITICAL';
  dueDate: string | null;
  assignee: { id: string; name: string } | null;
  creator: { id: string; name: string } | null;
  department: { id: string; name: string } | null;
}

interface Pagination {
  total: number;
  page: number;
  pageSize: number;
  pages: number;
}

const STATUSES = ['PENDING', 'IN_PROGRESS', 'REVIEW', 'COMPLETED', 'CANCELLED'] as const;
const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT', 'CRITICAL'] as const;

const statusColors: Record<string, string> = {
  PENDING: 'bg-stone-500/10 text-stone-700 border-stone-200',
  IN_PROGRESS: 'bg-blue-500/10 text-blue-700 border-blue-200',
  REVIEW: 'bg-purple-500/10 text-purple-700 border-purple-200',
  COMPLETED: 'bg-emerald-500/10 text-emerald-700 border-emerald-200',
  CANCELLED: 'bg-stone-400/10 text-stone-500 border-stone-200',
};

const priorityColors: Record<string, string> = {
  LOW: 'bg-blue-500/10 text-blue-700 border-blue-200',
  MEDIUM: 'bg-yellow-500/10 text-yellow-700 border-yellow-200',
  HIGH: 'bg-red-500/10 text-red-700 border-red-200',
  URGENT: 'bg-red-600/10 text-red-700 border-red-200',
  CRITICAL: 'bg-red-700/10 text-red-800 border-red-200',
};

const label = (s: string) => s.replace(/_/g, ' ').toLowerCase();

interface TaskFormState {
  id?: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  dueDate: string;
  assigneeId: string;
  departmentId: string;
}

const emptyForm: TaskFormState = {
  title: '',
  description: '',
  status: 'PENDING',
  priority: 'MEDIUM',
  dueDate: '',
  assigneeId: '',
  departmentId: '',
};

export default function TasksPage() {
  const { data: session } = useSession();
  const toast = useToast();

  const [tasks, setTasks] = useState<TaskRow[] | null>(null);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [priorityFilter, setPriorityFilter] = useState<string | null>(null);
  const [departmentFilter, setDepartmentFilter] = useState<string | null>(null);

  const [departments, setDepartments] = useState<Array<{ id: string; name: string }>>([]);
  const [users, setUsers] = useState<Array<{ id: string; name: string }>>([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<TaskFormState>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [busyTaskId, setBusyTaskId] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 350);
    return () => clearTimeout(t);
  }, [search]);

  const load = useCallback(async () => {
    try {
      setLoadError(null);
      const params = new URLSearchParams({ page: String(page), pageSize: '20' });
      if (statusFilter) params.set('status', statusFilter);
      if (priorityFilter) params.set('priority', priorityFilter);
      if (departmentFilter) params.set('departmentId', departmentFilter);
      if (debouncedSearch) params.set('search', debouncedSearch);
      const res = await api<{ tasks: TaskRow[]; pagination: Pagination }>(`/api/tasks?${params}`);
      setTasks(res.tasks);
      setPagination(res.pagination);
    } catch (e) {
      setLoadError((e as Error).message);
      setTasks([]);
    }
  }, [page, statusFilter, priorityFilter, departmentFilter, debouncedSearch]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    api<{ departments: Array<{ id: string; name: string }> }>('/api/departments')
      .then((r) => setDepartments(r.departments))
      .catch(() => undefined);
    api<{ users: Array<{ id: string; name: string }> }>('/api/users/options')
      .then((r) => setUsers(r.users))
      .catch(() => undefined);
  }, []);

  const openCreate = () => {
    setForm({ ...emptyForm, assigneeId: session?.user?.id ?? '' });
    setFormError(null);
    setModalOpen(true);
  };

  const openEdit = (task: TaskRow) => {
    setForm({
      id: task.id,
      title: task.title,
      description: task.description ?? '',
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate ? task.dueDate.slice(0, 10) : '',
      assigneeId: task.assignee?.id ?? '',
      departmentId: task.department?.id ?? '',
    });
    setFormError(null);
    setModalOpen(true);
  };

  const submit = async () => {
    if (!form.title.trim()) {
      setFormError('Task title is required');
      return;
    }
    setSaving(true);
    setFormError(null);
    const payload = {
      title: form.title.trim(),
      description: form.description.trim() || null,
      status: form.status,
      priority: form.priority,
      dueDate: form.dueDate || null,
      assigneeId: form.assigneeId || null,
      departmentId: form.departmentId || null,
    };
    try {
      if (form.id) {
        await api(`/api/tasks/${form.id}`, { method: 'PATCH', body: JSON.stringify(payload) });
        toast.success('Task updated');
      } else {
        await api('/api/tasks', { method: 'POST', body: JSON.stringify(payload) });
        toast.success('Task created');
      }
      setModalOpen(false);
      void load();
    } catch (e) {
      setFormError((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const complete = async (task: TaskRow) => {
    setBusyTaskId(task.id);
    try {
      await api(`/api/tasks/${task.id}`, { method: 'PATCH', body: JSON.stringify({ status: 'COMPLETED' }) });
      toast.success(`Completed "${task.title}"`);
      void load();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusyTaskId(null);
    }
  };

  const remove = async (task: TaskRow) => {
    if (!window.confirm(`Delete task "${task.title}"? This cannot be undone.`)) return;
    setBusyTaskId(task.id);
    try {
      await api(`/api/tasks/${task.id}`, { method: 'DELETE' });
      toast.success('Task deleted');
      void load();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusyTaskId(null);
    }
  };

  const FilterChip = ({
    active,
    onClick,
    children,
  }: {
    active: boolean;
    onClick: () => void;
    children: React.ReactNode;
  }) => (
    <Button
      size="sm"
      variant="outline"
      onClick={onClick}
      className={cn(
        active
          ? 'bg-[#09203F] text-white border-[#09203F] hover:bg-[#0a2651]'
          : 'bg-white border-stone-200 text-stone-700 hover:border-[#09203F]/50'
      )}
    >
      {children}
    </Button>
  );

  const TaskActions = ({ task }: { task: TaskRow }) => (
    <div className="flex items-center gap-1">
      {task.status !== 'COMPLETED' && task.status !== 'CANCELLED' && (
        <Button
          size="sm"
          variant="ghost"
          title="Mark completed"
          disabled={busyTaskId === task.id}
          onClick={(e) => {
            e.stopPropagation();
            void complete(task);
          }}
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
        </Button>
      )}
      <Button
        size="sm"
        variant="ghost"
        title="Delete task"
        disabled={busyTaskId === task.id}
        onClick={(e) => {
          e.stopPropagation();
          void remove(task);
        }}
      >
        <Trash2 className="w-4 h-4 text-red-500" />
      </Button>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-semibold text-stone-900 mb-2">Tasks</h1>
          <p className="text-stone-500">Track and manage tasks across your organization.</p>
        </div>
        <Button onClick={openCreate} className="bg-[#0A2245] hover:bg-[#0E2C55] shadow-luxe text-white font-medium">
          <Plus className="w-4 h-4 mr-2" />
          Create Task
        </Button>
      </div>

      {/* Search and View Toggle */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-2 bg-white border border-stone-200 rounded-lg text-stone-900 placeholder-stone-400 focus:outline-none focus:border-[#09203F]"
          />
        </div>

        <div className="flex gap-2 bg-white border border-stone-200 rounded-lg p-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setViewMode('list')}
            className={cn('px-3', viewMode === 'list' ? 'bg-stone-100 text-stone-900' : 'bg-transparent text-stone-400 hover:text-stone-700')}
          >
            <List className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setViewMode('grid')}
            className={cn('px-3', viewMode === 'grid' ? 'bg-stone-100 text-stone-900' : 'bg-transparent text-stone-400 hover:text-stone-700')}
          >
            <LayoutGrid className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-stone-700 mb-3 flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Status
          </label>
          <div className="flex flex-wrap gap-2">
            {STATUSES.map((status) => (
              <FilterChip
                key={status}
                active={statusFilter === status}
                onClick={() => {
                  setPage(1);
                  setStatusFilter(statusFilter === status ? null : status);
                }}
              >
                {label(status)}
              </FilterChip>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-stone-700 mb-3 flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Priority
          </label>
          <div className="flex flex-wrap gap-2">
            {PRIORITIES.map((priority) => (
              <FilterChip
                key={priority}
                active={priorityFilter === priority}
                onClick={() => {
                  setPage(1);
                  setPriorityFilter(priorityFilter === priority ? null : priority);
                }}
              >
                {label(priority)}
              </FilterChip>
            ))}
          </div>
        </div>

        {departments.length > 0 && (
          <div>
            <label className="text-sm font-medium text-stone-700 mb-3 flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Department
            </label>
            <div className="flex flex-wrap gap-2">
              {departments.map((dept) => (
                <FilterChip
                  key={dept.id}
                  active={departmentFilter === dept.id}
                  onClick={() => {
                    setPage(1);
                    setDepartmentFilter(departmentFilter === dept.id ? null : dept.id);
                  }}
                >
                  {dept.name}
                </FilterChip>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Error state */}
      {loadError && (
        <Card className="border-red-200 bg-red-50 p-6 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-800">Could not load tasks</p>
            <p className="text-xs text-red-600 mt-0.5">{loadError}</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => void load()}>
            Retry
          </Button>
        </Card>
      )}

      {/* Loading state */}
      {tasks === null && !loadError && (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-xl" />
          ))}
        </div>
      )}

      {/* Tasks */}
      {tasks !== null && tasks.length > 0 && (
        <>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tasks.map((task) => (
                <Card
                  key={task.id}
                  onClick={() => openEdit(task)}
                  className="bg-white border border-stone-200 rounded-xl shadow-sm hover:shadow-md hover:border-[#09203F]/20 transition-all cursor-pointer"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4 gap-2">
                      <h3 className="text-lg font-semibold text-stone-900 flex-1">{task.title}</h3>
                      <Badge variant="outline" className={statusColors[task.status]}>
                        {label(task.status)}
                      </Badge>
                    </div>

                    {task.description && <p className="text-sm text-stone-500 mb-4 line-clamp-2">{task.description}</p>}

                    <div className="space-y-3 pt-4 border-t border-stone-200">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-stone-500">Assignee</span>
                        <span className="text-stone-900 font-medium">{task.assignee?.name ?? 'Unassigned'}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-stone-500">Department</span>
                        <span className="text-stone-900 font-medium">{task.department?.name ?? '—'}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-stone-500">Due Date</span>
                        <span className="text-stone-900 font-medium">{task.dueDate ? formatDate(task.dueDate) : '—'}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-stone-500">Priority</span>
                        <Badge variant="outline" className={priorityColors[task.priority]}>
                          {label(task.priority)}
                        </Badge>
                      </div>
                    </div>
                    <div className="pt-3 flex justify-end">
                      <TaskActions task={task} />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="bg-white border border-stone-200 rounded-xl shadow-sm">
              <div className="border-b border-stone-200 p-6">
                <h2 className="text-lg font-semibold text-stone-900">All Tasks ({pagination?.total ?? tasks.length})</h2>
              </div>
              <div>
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => openEdit(task)}
                    className="flex items-center justify-between p-4 border-b border-stone-200 last:border-0 hover:bg-stone-50 transition-colors cursor-pointer"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3">
                        <CheckSquare className="w-5 h-5 text-[#09203F] flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="font-medium text-stone-900 truncate">{task.title}</p>
                          {task.description && <p className="text-sm text-stone-500 mt-1 truncate">{task.description}</p>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 ml-4 flex-shrink-0">
                      <Badge variant="outline" className={statusColors[task.status]}>
                        {label(task.status)}
                      </Badge>
                      <Badge variant="outline" className={priorityColors[task.priority]}>
                        {label(task.priority)}
                      </Badge>
                      <div className="w-32 text-right hidden md:block">
                        <p className="text-sm text-stone-500 truncate">{task.assignee?.name ?? 'Unassigned'}</p>
                      </div>
                      <div className="w-24 text-right hidden md:block">
                        <p className="text-sm text-stone-500">{task.dueDate ? formatDate(task.dueDate) : '—'}</p>
                      </div>
                      <TaskActions task={task} />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-3">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                Previous
              </Button>
              <span className="text-sm text-stone-500">
                Page {pagination.page} of {pagination.pages}
              </span>
              <Button variant="outline" size="sm" disabled={page >= pagination.pages} onClick={() => setPage((p) => p + 1)}>
                Next
              </Button>
            </div>
          )}
        </>
      )}

      {/* Empty state */}
      {tasks !== null && tasks.length === 0 && !loadError && (
        <div className="text-center py-12">
          <CheckSquare className="w-12 h-12 text-stone-300 mx-auto mb-4" />
          <p className="text-stone-500 mb-2">No tasks found</p>
          <p className="text-stone-400 text-sm mb-4">
            {debouncedSearch || statusFilter || priorityFilter || departmentFilter
              ? 'Try adjusting your filters, or create a new task.'
              : 'Create your first task to get started.'}
          </p>
          <Button onClick={openCreate} className="bg-[#0A2245] hover:bg-[#0E2C55] shadow-luxe text-white">
            <Plus className="w-4 h-4 mr-2" />
            Create Task
          </Button>
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal
        open={modalOpen}
        onOpenChange={(open) => {
          setModalOpen(open);
          if (!open) setFormError(null);
        }}
        title={form.id ? 'Edit Task' : 'Create New Task'}
        size="lg"
      >
        <div className="space-y-5">
          {formError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <span className="text-sm font-medium text-red-800">{formError}</span>
            </div>
          )}

          <Input
            label="Task Title *"
            placeholder="Enter task title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-4 py-2 rounded-lg bg-white border border-stone-300 text-stone-900 min-h-20 resize-none focus:outline-none focus:border-[#09203F] focus:ring-1 focus:ring-[#09203F]/20"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Status"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              options={STATUSES.map((s) => ({ value: s, label: label(s) }))}
            />
            <Select
              label="Priority"
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: e.target.value })}
              options={PRIORITIES.map((p) => ({ value: p, label: label(p) }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Assignee"
              value={form.assigneeId}
              onChange={(e) => setForm({ ...form, assigneeId: e.target.value })}
              options={[{ value: '', label: 'Unassigned' }, ...users.map((u) => ({ value: u.id, label: u.name }))]}
            />
            <Select
              label="Department"
              value={form.departmentId}
              onChange={(e) => setForm({ ...form, departmentId: e.target.value })}
              options={[{ value: '', label: 'None' }, ...departments.map((d) => ({ value: d.id, label: d.name }))]}
            />
          </div>

          <Input label="Due Date" type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />

          <div className="flex gap-3 pt-2">
            <Button onClick={submit} loading={saving} className="flex-1 bg-[#0A2245] hover:bg-[#0E2C55] shadow-luxe text-white font-medium h-11">
              {form.id ? 'Save Changes' : 'Create Task'}
            </Button>
            <Button onClick={() => setModalOpen(false)} disabled={saving} className="flex-1 bg-stone-100 hover:bg-stone-200 text-stone-900 font-medium h-11">
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
