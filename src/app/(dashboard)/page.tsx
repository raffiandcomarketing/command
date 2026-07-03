'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/toast';
import { api } from '@/lib/client/api';
import { formatRelativeTime } from '@/lib/utils';
import {
  CheckSquare,
  GitBranch,
  FileCheck,
  Users,
  TrendingUp,
  Plus,
  ChevronRight,
  Diamond,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface DashboardData {
  stats: {
    openTasks: number;
    pendingApprovals: number;
    activeUsers: number;
    activeWorkflows: number;
    pipelineValue: number;
    salesValue30d: number;
  };
  recentDeals: Array<{
    id: string;
    title: string;
    value: number;
    stage: string;
    contact: { name: string } | null;
  }>;
  departments: Array<{ id: string; name: string; slug: string; members: number; openTasks: number }>;
}

interface Activity {
  id: string;
  type: string;
  description: string;
  createdAt: string;
  user: { id: string; name: string; avatar: string | null };
}

const STAGE_LABELS: Record<string, string> = {
  LEAD: 'Lead',
  OPPORTUNITY: 'Opportunity',
  SALE: 'Closed sale',
};

export default function DashboardPage() {
  const { data: session } = useSession();
  const toast = useToast();

  const [data, setData] = useState<DashboardData | null>(null);
  const [activities, setActivities] = useState<Activity[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [taskForm, setTaskForm] = useState({ title: '', description: '', priority: 'MEDIUM', dueDate: '' });
  const [formError, setFormError] = useState<string | null>(null);

  const userRole = session?.user?.role;
  const userName = session?.user?.name || 'User';
  const dashboardTitle = userRole === 'ADMIN' || userRole === 'EXECUTIVE' ? 'Executive Dashboard' : 'Dashboard';

  const load = useCallback(async () => {
    try {
      setLoadError(null);
      const [d, a] = await Promise.all([
        api<DashboardData>('/api/dashboard'),
        api<{ activities: Activity[] }>('/api/activity?pageSize=6'),
      ]);
      setData(d);
      setActivities(a.activities);
    } catch (e) {
      setLoadError((e as Error).message);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleCreateTask = async () => {
    if (!taskForm.title.trim()) {
      setFormError('Task title is required');
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      await api('/api/tasks', {
        method: 'POST',
        body: JSON.stringify({
          title: taskForm.title.trim(),
          description: taskForm.description.trim() || undefined,
          priority: taskForm.priority,
          dueDate: taskForm.dueDate || undefined,
        }),
      });
      toast.success('Task created');
      setTaskForm({ title: '', description: '', priority: 'MEDIUM', dueDate: '' });
      setIsModalOpen(false);
      void load();
    } catch (e) {
      // Real error surfaced - the old build showed success even on failure.
      setFormError((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const stats = data
    ? [
        { label: 'Open Tasks', value: data.stats.openTasks, icon: CheckSquare, accentColor: '#09203F', href: '/tasks' },
        { label: 'Pending Approvals', value: data.stats.pendingApprovals, icon: FileCheck, accentColor: '#D97706', href: '/approvals' },
        { label: 'Active Workflows', value: data.stats.activeWorkflows, icon: GitBranch, accentColor: '#059669', href: '/workflows' },
        { label: 'Team Members', value: data.stats.activeUsers, icon: Users, accentColor: '#7C3AED', href: '/admin/users' },
      ]
    : [];

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-br from-white via-ivory-50 to-ivory-100 border border-stone-200/70 rounded-2xl p-10 mb-2 shadow-luxe">
        <div className="flex items-start justify-between">
          <div>
            <p className="eyebrow mb-3">Raffi Jewellers</p>
            <h1 className="text-5xl font-semibold text-stone-900 mb-4">{dashboardTitle}</h1>
            <div className="rule-gold mb-4" />
            <p className="text-stone-600 text-base">
              Welcome back, <span className="font-semibold text-[#09203F]">{userName}</span>. Here&apos;s your command
              centre overview.
            </p>
          </div>
          <div className="hidden lg:flex items-center justify-center w-16 h-16 rounded-2xl border border-gold-200 bg-white shadow-luxe">
            <Diamond className="w-8 h-8 text-gold-600" />
          </div>
        </div>
      </div>

      {loadError && (
        <Card className="border-red-200 bg-red-50 p-6 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-800">Could not load dashboard data</p>
            <p className="text-xs text-red-600 mt-0.5">{loadError}</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => void load()}>
            Retry
          </Button>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {!data && !loadError
          ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-36 rounded-xl" />)
          : stats.map((stat) => (
              <Link key={stat.label} href={stat.href}>
                <Card className="bg-white border border-stone-200 rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300 cursor-pointer">
                  <div className="h-1" style={{ backgroundColor: stat.accentColor }} />
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 rounded-lg" style={{ backgroundColor: `${stat.accentColor}10` }}>
                        <stat.icon className="w-5 h-5" style={{ color: stat.accentColor }} />
                      </div>
                    </div>
                    <h3 className="text-stone-500 text-sm font-medium mb-1">{stat.label}</h3>
                    <p className="text-3xl font-bold text-stone-900">{stat.value.toLocaleString()}</p>
                  </div>
                </Card>
              </Link>
            ))}
      </div>

      {/* Pipeline summary */}
      {data && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-white border border-stone-200 rounded-xl shadow-sm p-6">
            <h3 className="text-stone-500 text-sm font-medium mb-1">Open Pipeline Value</h3>
            <p className="text-3xl font-bold text-[#09203F]">
              ${data.stats.pipelineValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </p>
            <p className="text-xs text-stone-500 mt-1">Leads and opportunities in the CRM</p>
          </Card>
          <Card className="bg-white border border-stone-200 rounded-xl shadow-sm p-6">
            <h3 className="text-stone-500 text-sm font-medium mb-1">Sales Closed (30 days)</h3>
            <p className="text-3xl font-bold text-emerald-700">
              ${data.stats.salesValue30d.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </p>
            <p className="text-xs text-stone-500 mt-1">Deals moved to sale in the last 30 days</p>
          </Card>
        </div>
      )}

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="bg-white border border-stone-200 rounded-xl shadow-sm overflow-hidden">
            <div className="border-b border-stone-200 p-6 bg-gradient-to-r from-stone-50 to-white">
              <h2 className="text-lg font-semibold text-stone-900 flex items-center gap-2">
                <div className="w-1 h-6 bg-[#09203F] rounded-full" />
                Recent Activity
              </h2>
            </div>
            {!activities ? (
              <div className="p-6 space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 rounded-lg" />
                ))}
              </div>
            ) : activities.length === 0 ? (
              <div className="p-10 text-center">
                <p className="text-sm text-stone-500">
                  No activity yet. Actions like creating tasks, deals, and approvals will appear here.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-stone-100">
                {activities.map((activity) => (
                  <div key={activity.id} className="p-5 hover:bg-stone-50/50 transition-colors">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 border bg-blue-50 border-blue-200">
                        <Plus className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-stone-900">
                          <span className="font-medium">{activity.user?.name ?? 'Someone'}</span>{' '}
                          <span className="text-stone-700">{activity.description}</span>
                        </p>
                        <p className="text-xs text-stone-500 mt-1">{formatRelativeTime(activity.createdAt)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          <Card className="bg-white border border-stone-200 rounded-xl shadow-sm overflow-hidden">
            <div className="border-b border-stone-200 p-6 bg-gradient-to-r from-stone-50 to-white">
              <h2 className="text-lg font-semibold text-stone-900 flex items-center gap-2">
                <div className="w-1 h-6 bg-[#09203F] rounded-full" />
                Departments
              </h2>
            </div>
            <div className="divide-y divide-stone-100">
              {!data
                ? Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="p-4">
                      <Skeleton className="h-10 rounded-lg" />
                    </div>
                  ))
                : data.departments.slice(0, 5).map((dept) => (
                    <Link
                      key={dept.id}
                      href={`/departments/${dept.slug}`}
                      className="block p-4 hover:bg-stone-50/50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-1">
                        <h3 className="text-sm font-medium text-stone-900">{dept.name}</h3>
                        <ChevronRight className="w-4 h-4 text-stone-400" />
                      </div>
                      <div className="flex items-center gap-4 text-xs text-stone-500">
                        <span>{dept.members} members</span>
                        <span className="text-stone-300">•</span>
                        <span>{dept.openTasks} open tasks</span>
                      </div>
                    </Link>
                  ))}
            </div>
          </Card>

          <Card className="bg-white border border-stone-200 rounded-xl shadow-sm overflow-hidden">
            <div className="border-b border-stone-200 p-6 bg-gradient-to-r from-stone-50 to-white">
              <h2 className="text-lg font-semibold text-stone-900 flex items-center gap-2">
                <div className="w-1 h-6 bg-[#09203F] rounded-full" />
                Recent Deals
              </h2>
            </div>
            <div className="divide-y divide-stone-100">
              {!data ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="p-4">
                    <Skeleton className="h-10 rounded-lg" />
                  </div>
                ))
              ) : data.recentDeals.length === 0 ? (
                <div className="p-6 text-center">
                  <p className="text-sm text-stone-500">No deals yet.</p>
                  <Link href="/crm" className="text-sm text-[#09203F] font-medium hover:underline">
                    Add your first deal →
                  </Link>
                </div>
              ) : (
                data.recentDeals.map((deal) => (
                  <Link key={deal.id} href="/crm" className="block p-4 hover:bg-stone-50/50 transition-colors">
                    <div className="flex items-start justify-between mb-1">
                      <h3 className="text-sm font-medium text-stone-900 truncate pr-2">{deal.title}</h3>
                      <ChevronRight className="w-4 h-4 text-stone-400 flex-shrink-0" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-stone-500">
                        {deal.contact?.name ?? 'No contact'} · {STAGE_LABELS[deal.stage] ?? deal.stage}
                      </span>
                      <span className="text-sm font-semibold text-[#09203F]">${deal.value.toLocaleString()}</span>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-stone-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button
            onClick={() => setIsModalOpen(true)}
            className="bg-white hover:bg-stone-50 text-stone-900 border border-stone-300 h-12 font-medium"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Task
          </Button>
          <Link href="/workflows" className="contents">
            <Button className="bg-white hover:bg-stone-50 text-stone-900 border border-stone-300 h-12 font-medium w-full">
              <GitBranch className="w-4 h-4 mr-2" />
              Start Workflow
            </Button>
          </Link>
          <Link href="/approvals?new=1" className="contents">
            <Button className="bg-white hover:bg-stone-50 text-stone-900 border border-stone-300 h-12 font-medium w-full">
              <FileCheck className="w-4 h-4 mr-2" />
              Request Approval
            </Button>
          </Link>
          <Link href="/kpis" className="contents">
            <Button className="bg-[#0A2245] hover:bg-[#0E2C55] shadow-luxe text-white font-medium h-12 w-full">
              <TrendingUp className="w-4 h-4 mr-2" />
              View KPIs
            </Button>
          </Link>
        </div>
      </div>

      {/* New Task Modal */}
      <Modal
        open={isModalOpen}
        onOpenChange={(open) => {
          setIsModalOpen(open);
          if (!open) setFormError(null);
        }}
        title="Create New Task"
        description="Add a new task to your command centre"
        size="lg"
      >
        <div className="space-y-6">
          {formError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <span className="text-sm font-medium text-red-800">{formError}</span>
            </div>
          )}

          <Input
            label="Task Title *"
            placeholder="Enter task title"
            value={taskForm.title}
            onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
            required
          />

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">Description</label>
            <textarea
              placeholder="Enter task description (optional)"
              value={taskForm.description}
              onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
              className={cn(
                'w-full px-4 py-2 rounded-lg bg-white border border-stone-300 text-stone-900 placeholder-stone-400 transition-colors duration-200 min-h-24 resize-none',
                'focus:outline-none focus:border-[#09203F] focus:ring-1 focus:ring-[#09203F]/20'
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">Priority</label>
              <select
                value={taskForm.priority}
                onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                className={cn(
                  'w-full px-4 py-2 rounded-lg bg-white border border-stone-300 text-stone-900',
                  'focus:outline-none focus:border-[#09203F] focus:ring-1 focus:ring-[#09203F]/20'
                )}
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>

            <Input
              label="Due Date"
              type="date"
              value={taskForm.dueDate}
              onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleCreateTask}
              loading={saving}
              className="flex-1 bg-[#0A2245] hover:bg-[#0E2C55] shadow-luxe text-white font-medium h-11"
            >
              Create Task
            </Button>
            <Button
              onClick={() => setIsModalOpen(false)}
              disabled={saving}
              className="flex-1 bg-stone-100 hover:bg-stone-200 text-stone-900 font-medium h-11"
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
