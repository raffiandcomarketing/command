'use client';

import { useCallback, useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/toast';
import { api } from '@/lib/client/api';
import { formatRelativeTime } from '@/lib/utils';
import { Bell, CheckSquare, FileCheck, AlertCircle, GitBranch, Trash2, CheckCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'INFO' | 'WARNING' | 'ALERT' | 'TASK' | 'APPROVAL' | 'WORKFLOW' | 'SYSTEM' | 'ESCALATION';
  link: string | null;
  isRead: boolean;
  createdAt: string;
}

const typeMeta: Record<string, { color: string; icon: React.ComponentType<{ className?: string }> }> = {
  TASK: { color: 'bg-blue-500/10 text-blue-600', icon: CheckSquare },
  APPROVAL: { color: 'bg-purple-500/10 text-purple-600', icon: FileCheck },
  WORKFLOW: { color: 'bg-emerald-500/10 text-emerald-600', icon: GitBranch },
  ALERT: { color: 'bg-red-500/10 text-red-600', icon: AlertCircle },
  WARNING: { color: 'bg-amber-500/10 text-amber-600', icon: AlertCircle },
  ESCALATION: { color: 'bg-red-600/10 text-red-700', icon: AlertCircle },
  SYSTEM: { color: 'bg-gray-500/10 text-gray-600', icon: AlertCircle },
  INFO: { color: 'bg-blue-500/10 text-blue-600', icon: Bell },
};

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'unread', label: 'Unread' },
  { key: 'TASK', label: 'Tasks' },
  { key: 'APPROVAL', label: 'Approvals' },
  { key: 'ALERT', label: 'Alerts' },
  { key: 'SYSTEM', label: 'System' },
];

export default function NotificationsPage() {
  const toast = useToast();
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [notifications, setNotifications] = useState<Notification[] | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadError, setLoadError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoadError(null);
      const res = await api<{ notifications: Notification[]; unreadCount: number }>('/api/notifications?pageSize=100');
      setNotifications(res.notifications);
      setUnreadCount(res.unreadCount);
    } catch (e) {
      setLoadError((e as Error).message);
      setNotifications([]);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = (notifications ?? []).filter((n) => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'unread') return !n.isRead;
    return n.type === selectedFilter;
  });

  const markAllRead = async () => {
    try {
      const res = await api<{ count: number }>('/api/notifications/read', {
        method: 'PATCH',
        body: JSON.stringify({ markAllAsRead: true }),
      });
      toast.success(`Marked ${res.count} notification${res.count === 1 ? '' : 's'} as read`);
      void load();
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const markRead = async (n: Notification) => {
    if (n.isRead) return;
    try {
      await api('/api/notifications/read', { method: 'PATCH', body: JSON.stringify({ notificationIds: [n.id] }) });
      void load();
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const remove = async (n: Notification) => {
    try {
      await api(`/api/notifications/${n.id}`, { method: 'DELETE' });
      setNotifications((prev) => (prev ? prev.filter((x) => x.id !== n.id) : prev));
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Notifications</h1>
          <p className="text-gray-500">Stay updated with all your task, approval, and system notifications.</p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" className="bg-white border-gray-200 text-gray-900 hover:border-[#09203F]/50" onClick={() => void markAllRead()}>
            <CheckCheck className="w-4 h-4 mr-2" />
            Mark all read ({unreadCount})
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Button
            key={f.key}
            size="sm"
            variant="outline"
            onClick={() => setSelectedFilter(f.key)}
            className={cn(
              selectedFilter === f.key
                ? 'bg-[#09203F] text-white border-[#09203F] hover:bg-[#0a2651]'
                : 'bg-white border-gray-200 text-gray-700 hover:border-[#09203F]/50'
            )}
          >
            {f.label}
            {f.key === 'unread' && unreadCount > 0 && <span className="ml-1.5 text-xs">({unreadCount})</span>}
          </Button>
        ))}
      </div>

      {loadError && (
        <Card className="border-red-200 bg-red-50 p-6 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-800">Could not load notifications</p>
            <p className="text-xs text-red-600 mt-0.5">{loadError}</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => void load()}>
            Retry
          </Button>
        </Card>
      )}

      {notifications === null && !loadError && (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      )}

      {notifications !== null && filtered.length === 0 && !loadError && (
        <div className="text-center py-16">
          <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">
            {selectedFilter === 'all'
              ? 'No notifications yet. Task assignments, approval decisions, and alerts will appear here.'
              : 'Nothing here for this filter.'}
          </p>
        </div>
      )}

      {filtered.length > 0 && (
        <Card className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          {filtered.map((n) => {
            const meta = typeMeta[n.type] ?? typeMeta.INFO;
            const Icon = meta.icon;
            return (
              <div
                key={n.id}
                onClick={() => void markRead(n)}
                className={cn(
                  'p-6 border-b border-gray-200 last:border-0 hover:bg-gray-50 transition-colors cursor-pointer',
                  !n.isRead && 'bg-[#09203F]/5'
                )}
              >
                <div className="flex items-start gap-4">
                  <div className={cn('p-3 rounded-lg flex-shrink-0', meta.color)}>
                    <Icon className="w-5 h-5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-medium text-gray-900">{n.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{n.message}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {!n.isRead && <div className="w-2 h-2 rounded-full bg-[#09203F] mt-2" />}
                        <button
                          title="Delete notification"
                          onClick={(e) => {
                            e.stopPropagation();
                            void remove(n);
                          }}
                          className="p-1.5 rounded text-gray-300 hover:text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-3">{formatRelativeTime(n.createdAt)}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </Card>
      )}
    </div>
  );
}
