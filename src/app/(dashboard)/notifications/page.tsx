'use client';

import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, CheckSquare, FileCheck, AlertCircle, GitBranch, Settings, Trash2, Filter, } from 'lucide-react';
import { cn } from '@/lib/utils';

// Mock notification data
const mockNotifications = [
  { id: '1', title: 'Task Assigned', message: 'You have been assigned "Review Q1 Marketing Budget" by Sarah Mitchell', type: 'task', timestamp: '2 hours ago', isRead: false, icon: CheckSquare, },
  { id: '2', title: 'Approval Pending', message: 'Your approval is needed for Budget Increase Request - Digital Advertising', type: 'approval', timestamp: '3 hours ago', isRead: false, icon: FileCheck, },
  { id: '3', title: 'Workflow Completed', message: 'Content Publishing workflow has completed successfully', type: 'workflow', timestamp: '5 hours ago', isRead: true, icon: GitBranch, },
  { id: '4', title: 'Alert: Low Stock', message: 'Inventory level for luxury watch cases is below threshold', type: 'alert', timestamp: '6 hours ago', isRead: true, icon: AlertCircle, },
  { id: '5', title: 'Task Completed', message: 'Marcus Chen completed "Update Inventory System"', type: 'task', timestamp: '8 hours ago', isRead: true, icon: CheckSquare, },
  { id: '6', title: 'Approval Required', message: 'Conference Attendance Approval is waiting for your decision', type: 'approval', timestamp: '1 day ago', isRead: true, icon: FileCheck, },
  { id: '7', title: 'System Maintenance', message: 'Scheduled system maintenance will occur on 2026-04-15 from 2-3 AM', type: 'system', timestamp: '1 day ago', isRead: true, icon: AlertCircle, },
  { id: '8', title: 'KPI Alert', message: 'Website conversion rate has dropped below warning threshold', type: 'alert', timestamp: '2 days ago', isRead: true, icon: AlertCircle, },
  { id: '9', title: 'Workflow Started', message: 'Leave Request workflow initiated for Lisa Anderson', type: 'workflow', timestamp: '2 days ago', isRead: true, icon: GitBranch, },
  { id: '10', title: 'New Comment', message: 'James Wilson commented on "Campaign Performance Analysis"', type: 'task', timestamp: '3 days ago', isRead: true, icon: CheckSquare, },
];

const NotificationItem = ({ notification }: { notification: (typeof mockNotifications)[0] }) => {
  const Icon = notification.icon;

  const typeColors = {
    task: 'bg-blue-500/10 text-blue-600',
    approval: 'bg-purple-500/10 text-purple-600',
    workflow: 'bg-emerald-500/10 text-emerald-600',
    alert: 'bg-red-500/10 text-red-600',
    system: 'bg-gray-500/10 text-gray-600',
  };

  return (
    <div
      className={cn(
        'p-6 border-b border-gray-200 last:border-0 hover:bg-gray-50 transition-colors',
        !notification.isRead && 'bg-[#09203F]/5'
      )}
    >
      <div className="flex items-start gap-4">
        <div className={cn('p-3 rounded-lg flex-shrink-0', typeColors[notification.type])}>
          <Icon className="w-5 h-5" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="font-medium text-gray-900">{notification.title}</h3>
              <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
            </div>
            {!notification.isRead && (
              <div className="w-2 h-2 rounded-full bg-[#09203F] flex-shrink-0 mt-2" />
            )}
          </div>
          <p className="text-xs text-gray-500 mt-3">{notification.timestamp}</p>
        </div>
      </div>
    </div>
  );
};

export default function NotificationsPage() {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [notifications, setNotifications] = useState(mockNotifications);

  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.isRead).length;
  }, [notifications]);

  const filters = ['all', 'unread', 'tasks', 'approvals', 'alerts', 'system'];

  const filtered = useMemo(() => {
    return notifications.filter((notification) => {
      if (selectedFilter === 'all') return true;
      if (selectedFilter === 'unread') return !notification.isRead;
      if (selectedFilter === 'tasks') return notification.type === 'task';
      if (selectedFilter === 'approvals') return notification.type === 'approval';
      if (selectedFilter === 'alerts') return notification.type === 'alert';
      if (selectedFilter === 'system') return notification.type === 'system';
      return true;
    });
  }, [notifications, selectedFilter]);

  const handleMarkAllRead = () => {
    setNotifications(
      notifications.map((n) => ({ ...n, isRead: true }))
    );
  };

  const handleDelete = (id: string) => {
    setNotifications(notifications.filter((n) => n.id !== id));
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Notifications</h1>
          <p className="text-gray-500">
            Stay updated with all your task, approval, and system notifications.
          </p>
        </div>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            className="bg-white border-gray-200 text-gray-900 hover:border-[#09203F]/50"
            onClick={handleMarkAllRead}
          >
            Mark all as read
          </Button>
        )}
      </div>

      {/* Unread Badge */}
      {unreadCount > 0 && (
        <Card className="bg-[#09203F]/5 border border-[#09203F]/20 rounded-xl">
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-[#09203F]" />
              <span className="text-sm text-gray-900">
                You have <span className="font-bold">{unreadCount}</span> unread notification
                {unreadCount > 1 ? 's' : ''}
              </span>
            </div>
            <Button
              size="sm"
              className="bg-[#09203F] hover:bg-[#0a2651] text-white font-medium"
              onClick={handleMarkAllRead}
            >
              Mark as read
            </Button>
          </div>
        </Card>
      )}

      {/* Filter Buttons */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <Filter className="w-5 h-5 text-gray-500" />
          <p className="text-sm font-medium text-gray-700">Filter</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => (
            <Button
              key={filter}
              variant={selectedFilter === filter ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedFilter(filter)}
              className={cn(
                'capitalize',
                selectedFilter === filter
                  ? 'bg-[#09203F] text-white'
                  : 'bg-white border-gray-200 text-gray-700 hover:border-[#09203F]/50'
              )}
            >
              {filter === 'all' && 'All Notifications'}
              {filter === 'unread' && `Unread (${unreadCount})`}
              {filter === 'tasks' && 'Tasks'}
              {filter === 'approvals' && 'Approvals'}
              {filter === 'alerts' && 'Alerts'}
              {filter === 'system' && 'System'}
            </Button>
          ))}
        </div>
      </div>

      {/* Notifications List */}
      <Card className="bg-white border border-gray-200 rounded-xl shadow-sm">
        {filtered.length > 0 ? (
          <div>
            {filtered.map((notification) => (
              <div key={notification.id} className="relative group">
                <NotificationItem notification={notification} />
                <button
                  onClick={() => handleDelete(notification.id)}
                  className="absolute right-6 top-6 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-4 h-4 text-gray-500 hover:text-red-600" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">No notifications</p>
            <p className="text-gray-400 text-sm">You're all caught up!</p>
          </div>
        )}
      </Card>

      {/* Notification Settings Link */}
      <div className="text-center">
        <Button
          variant="ghost"
          className="text-gray-500 hover:text-gray-900"
        >
          <Settings className="w-4 h-4 mr-2" />
          Manage notification preferences
        </Button>
      </div>
    </div>
  );
}
