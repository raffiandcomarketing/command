'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  CheckSquare,
  GitBranch,
  FileCheck,
  Users,
  TrendingUp,
  Clock,
  AlertCircle,
  Plus,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function DashboardPage() {
  // Mock data for stat cards
  const stats = [
    {
      label: 'Total Tasks',
      value: 142,
      icon: CheckSquare,
      change: 12,
      color: 'from-blue-500 to-blue-600',
    },
    {
      label: 'Active Workflows',
      value: 28,
      icon: GitBranch,
      change: 5,
      color: 'from-emerald-500 to-emerald-600',
    },
    {
      label: 'Pending Approvals',
      value: 7,
      icon: FileCheck,
      change: -2,
      color: 'from-amber-500 to-amber-600',
    },
    {
      label: 'Team Members',
      value: 156,
      icon: Users,
      change: 8,
      color: 'from-purple-500 to-purple-600',
    },
  ];

  // Mock recent activity
  const activities = [
    {
      id: 1,
      user: 'Sarah Mitchell',
      action: 'completed workflow',
      entity: 'Quarterly Review Process',
      timestamp: '2 hours ago',
      status: 'success',
    },
    {
      id: 2,
      user: 'Marcus Chen',
      action: 'requested approval',
      entity: 'Budget Allocation Q2',
      timestamp: '4 hours ago',
      status: 'pending',
    },
    {
      id: 3,
      user: 'Elena Rodriguez',
      action: 'created task',
      entity: 'Visual Merchandising Update',
      timestamp: '6 hours ago',
      status: 'info',
    },
    {
      id: 4,
      user: 'James Wilson',
      action: 'updated department',
      entity: 'Sales Team Structure',
      timestamp: '8 hours ago',
      status: 'success',
    },
    {
      id: 5,
      user: 'Yuki Tanaka',
      action: 'assigned workflow',
      entity: 'Inventory Management',
      timestamp: '10 hours ago',
      status: 'info',
    },
  ];

  // Mock department overview
  const departments = [
    { name: 'Sales', members: 24, tasks: 18, status: 'healthy' },
    { name: 'Marketing', members: 16, tasks: 22, status: 'healthy' },
    { name: 'Operations', members: 32, tasks: 28, status: 'warning' },
    { name: 'Finance', members: 12, tasks: 5, status: 'healthy' },
    { name: 'Human Resources', members: 8, tasks: 12, status: 'healthy' },
    { name: 'IT Systems', members: 14, tasks: 8, status: 'healthy' },
  ];

  const StatCard = ({
    icon: Icon,
    label,
    value,
    change,
    color,
  }: {
    icon: any;
    label: string;
    value: number;
    change: number;
    color: string;
  }) => (
    <Card className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className={cn('p-3 rounded-lg bg-gradient-to-br', color)}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          <Badge
            variant={change >= 0 ? 'success' : 'destructive'}
            className={cn(
              'flex items-center gap-1',
              change >= 0 ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-600'
            )}
          >
            <TrendingUp className="w-3 h-3" />
            {Math.abs(change)}%
          </Badge>
        </div>
        <h3 className="text-gray-500 text-sm font-medium mb-1">{label}</h3>
        <p className="text-3xl font-bold text-gray-900">{value.toLocaleString()}</p>
      </div>
    </Card>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Executive Dashboard</h1>
        <p className="text-gray-500">
          Welcome back, John. Here's your command centre overview.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <StatCard
            key={stat.label}
            icon={stat.icon}
            label={stat.label}
            value={stat.value}
            change={stat.change}
            color={stat.color}
          />
        ))}
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <Card className="bg-white border border-gray-200 rounded-xl shadow-sm">
            <div className="border-b border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#09203F]" />
                Recent Activity
              </h2>
            </div>
            <div className="divide-y divide-gray-200">
              {activities.map((activity) => (
                <div
                  key={activity.id}
                  className="p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={cn(
                        'w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0',
                        activity.status === 'success' && 'bg-emerald-500/10',
                        activity.status === 'pending' && 'bg-amber-500/10',
                        activity.status === 'info' && 'bg-blue-500/10'
                      )}
                    >
                      {activity.status === 'success' && (
                        <CheckSquare className="w-5 h-5 text-emerald-600" />
                      )}
                      {activity.status === 'pending' && (
                        <AlertCircle className="w-5 h-5 text-amber-600" />
                      )}
                      {activity.status === 'info' && (
                        <Plus className="w-5 h-5 text-blue-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">
                        <span className="font-medium">{activity.user}</span>
                        {' ' + activity.action + ' '}
                        <span className="text-[#09203F] font-medium">{activity.entity}</span>
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{activity.timestamp}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Department Overview */}
        <div>
          <Card className="bg-white border border-gray-200 rounded-xl shadow-sm">
            <div className="border-b border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900">Department Overview</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {departments.map((dept) => (
                <div
                  key={dept.name}
                  className="p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-sm font-medium text-gray-900">{dept.name}</h3>
                    <span
                      className={cn(
                        'w-2 h-2 rounded-full flex-shrink-0',
                        dept.status === 'healthy' && 'bg-emerald-500',
                        dept.status === 'warning' && 'bg-amber-500'
                      )}
                    />
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>{dept.members} members</span>
                    <span className="text-gray-300">•</span>
                    <span>{dept.tasks} tasks</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button
            className="bg-gray-100 hover:bg-gray-200 text-gray-900 border border-gray-200 h-12"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Task
          </Button>
          <Button
            className="bg-gray-100 hover:bg-gray-200 text-gray-900 border border-gray-200 h-12"
          >
            <GitBranch className="w-4 h-4 mr-2" />
            Start Workflow
          </Button>
          <Button
            className="bg-gray-100 hover:bg-gray-200 text-gray-900 border border-gray-200 h-12"
          >
            <FileCheck className="w-4 h-4 mr-2" />
            Request Approval
          </Button>
          <Button
            className="bg-[#09203F] hover:bg-[#0a2651] text-white font-medium h-12"
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            View Reports
          </Button>
        </div>
      </div>
    </div>
  );
}
