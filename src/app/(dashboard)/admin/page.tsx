'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Building2, Zap, Activity, ArrowRight, CheckCircle, AlertCircle, TrendingUp, Database, Clock, } from 'lucide-react';
import { cn } from '@/lib/utils';

// Mock admin data
const systemStats = [
  { label: 'Total Users', value: 287, icon: Users, change: 12, color: 'from-blue-500 to-blue-600', },
  { label: 'Departments', value: 18, icon: Building2, change: 0, color: 'from-purple-500 to-purple-600', },
  { label: 'Active Automations', value: 42, icon: Zap, change: 5, color: 'from-yellow-500 to-yellow-600', },
  { label: 'System Health', value: 99.8, icon: Activity, change: 0.2, color: 'from-emerald-500 to-emerald-600', unit: '%', },
];

const recentActivity = [
  { id: '1', action: 'New user created', details: 'Alex Johnson added to Marketing department', timestamp: 'Today at 2:45 PM', severity: 'info', },
  { id: '2', action: 'Workflow created', details: 'New "Content Publishing Pipeline" workflow activated', timestamp: 'Today at 1:30 PM', severity: 'success', },
  { id: '3', action: 'Automation rule modified', details: 'Daily Marketing Report trigger updated', timestamp: 'Today at 11:20 AM', severity: 'info', },
  { id: '4', action: 'System backup completed', details: 'Daily backup of all databases completed successfully', timestamp: 'Today at 6:00 AM', severity: 'success', },
  { id: '5', action: 'Integration status', details: 'Salesforce sync encountered 2 errors, auto-retrying', timestamp: 'Yesterday at 8:30 PM', severity: 'warning', },
];

const integrationStatus = [
  { id: '1', name: 'Salesforce CRM', status: 'connected', lastSync: '2 hours ago', syncRate: '100%', },
  { id: '2', name: 'Microsoft Teams', status: 'connected', lastSync: '30 minutes ago', syncRate: '100%', },
  { id: '3', name: 'Google Analytics', status: 'connected', lastSync: '1 hour ago', syncRate: '100%', },
  { id: '4', name: 'Stripe Payments', status: 'connected', lastSync: '15 minutes ago', syncRate: '100%', },
  { id: '5', name: 'Shopify Store', status: 'warning', lastSync: '4 hours ago', syncRate: '95%', },
  { id: '6', name: 'Slack Integration', status: 'connected', lastSync: 'Just now', syncRate: '100%', },
];

const adminPages = [
  { id: '1', title: 'User Management', description: 'Manage users, roles, and permissions', icon: Users, href: '/admin/users', },
  { id: '2', title: 'Department Settings', description: 'Configure departments and hierarchies', icon: Building2, href: '/admin/departments', },
  { id: '3', title: 'System Configuration', description: 'System settings and configuration options', icon: Activity, href: '#', },
  { id: '4', title: 'Integration Management', description: 'Manage external integrations and connections', icon: Zap, href: '/admin/integrations', },
  { id: '5', title: 'Audit Logs', description: 'View system audit trail and user activity', icon: Clock, href: '#', },
  { id: '6', title: 'Backups & Recovery', description: 'Manage backups and disaster recovery', icon: Database, href: '#', },
];

export default function AdminPage() {
  const StatCard = ({ icon: Icon, label, value, change, color, unit, }: any) => (
    <Card className="bg-white border border-gray-200 rounded-xl shadow-sm">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className={cn('p-3 rounded-lg bg-gradient-to-br', color)}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          <Badge
            variant="outline"
            className={cn(
              'flex items-center gap-1 text-xs',
              change >= 0 ? 'bg-emerald-500/10 text-emerald-700 border-emerald-200' : 'bg-red-500/10 text-red-700 border-red-200'
            )}
          >
            <TrendingUp className="w-3 h-3" />
            {Math.abs(change)}
            {unit ? unit : '%'}
          </Badge>
        </div>
        <h3 className="text-gray-500 text-sm font-medium mb-1">{label}</h3>
        <p className="text-3xl font-bold text-gray-900">
          {value}
          {unit && <span className="text-sm text-gray-500 ml-1">{unit}</span>}
        </p>
      </div>
    </Card>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
        <p className="text-gray-500">
          System administration, user management, and integration configuration.
        </p>
      </div>

      {/* System Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {systemStats.map((stat) => (
          <StatCard
            key={stat.label}
            icon={stat.icon}
            label={stat.label}
            value={stat.value}
            change={stat.change}
            color={stat.color}
            unit={stat.unit}
          />
        ))}
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card className="bg-white border border-gray-200 rounded-xl shadow-sm">
          <div className="border-b border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#09203F]" />
              Recent System Activity
            </h2>
          </div>
          <div className="divide-y divide-gray-200">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start gap-4">
                  <div
                    className={cn(
                      'w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0',
                      activity.severity === 'success' && 'bg-emerald-500/10',
                      activity.severity === 'warning' && 'bg-yellow-500/10',
                      activity.severity === 'info' && 'bg-blue-500/10'
                    )}
                  >
                    {activity.severity === 'success' && (
                      <CheckCircle className="w-5 h-5 text-emerald-600" />
                    )}
                    {activity.severity === 'warning' && (
                      <AlertCircle className="w-5 h-5 text-yellow-600" />
                    )}
                    {activity.severity === 'info' && (
                      <Activity className="w-5 h-5 text-blue-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                    <p className="text-xs text-gray-600 mt-1">{activity.details}</p>
                    <p className="text-xs text-gray-500 mt-2">{activity.timestamp}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Integration Status */}
        <Card className="bg-white border border-gray-200 rounded-xl shadow-sm">
          <div className="border-b border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Zap className="w-5 h-5 text-[#09203F]" />
              Integration Status
            </h2>
          </div>
          <div className="divide-y divide-gray-200">
            {integrationStatus.map((integration) => (
              <div key={integration.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-900">{integration.name}</h3>
                  <Badge
                    variant="outline"
                    className={cn(
                      'text-xs',
                      integration.status === 'connected'
                        ? 'bg-emerald-500/10 text-emerald-700 border-emerald-200'
                        : 'bg-yellow-500/10 text-yellow-700 border-yellow-200'
                    )}
                  >
                    {integration.status}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Last sync: {integration.lastSync}</span>
                  <span className="text-emerald-600">{integration.syncRate}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Quick Links to Admin Pages */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Admin Tools</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {adminPages.map((page) => {
            const Icon = page.icon;
            return (
              <Card
                key={page.id}
                className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md hover:border-[#09203F]/20 transition-all group cursor-pointer"
              >
                <div className="p-6">
                  <div className="p-3 rounded-lg bg-[#09203F]/10 w-fit mb-4">
                    <Icon className="w-6 h-6 text-[#09203F]" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-[#09203F] transition-colors mb-2">
                    {page.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-6">{page.description}</p>
                  <Button
                    variant="ghost"
                    className="w-full bg-gray-50 hover:bg-gray-100 text-gray-900 border border-gray-200 justify-start group/btn"
                    asChild
                  >
                    <a href={page.href}>
                      Access Tool
                      <ArrowRight className="w-4 h-4 ml-auto group-hover/btn:translate-x-1 transition-transform" />
                    </a>
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* System Health Detailed */}
      <Card className="bg-white border border-gray-200 rounded-xl shadow-sm">
        <div className="border-b border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#09203F]" />
            Detailed System Health
          </h2>
        </div>
        <div className="p-6 space-y-6">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-700">API Response Time</span>
              <Badge
                variant="outline"
                className="bg-emerald-500/10 text-emerald-700 border-emerald-200"
              >
                Healthy
              </Badge>
            </div>
            <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
              <div className="bg-emerald-600 h-full" style={{ width: '95%' }} />
            </div>
            <p className="text-xs text-gray-600 mt-2">Average: 125ms</p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-700">Database Performance</span>
              <Badge
                variant="outline"
                className="bg-emerald-500/10 text-emerald-700 border-emerald-200"
              >
                Healthy
              </Badge>
            </div>
            <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
              <div className="bg-emerald-600 h-full" style={{ width: '98%' }} />
            </div>
            <p className="text-xs text-gray-600 mt-2">CPU Usage: 32%</p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-700">Storage Utilization</span>
              <Badge
                variant="outline"
                className="bg-yellow-500/10 text-yellow-700 border-yellow-200"
              >
                Warning
              </Badge>
            </div>
            <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
              <div className="bg-yellow-500 h-full" style={{ width: '78%' }} />
            </div>
            <p className="text-xs text-gray-600 mt-2">750GB of 1TB used</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
