'use client';

import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  Plus,
  Zap,
  Clock,
  Zap as EventIcon,
  GitBranch,
  ToggleRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Mock automation rules - condensed
const mockAutomations = [
  { id: '1', name: 'Daily Marketing Report', description: 'Sends daily performance digest to marketing team', category: 'Scheduled', department: 'Marketing', active: true, trigger: 'Every day at 9:00 AM', executions: 45, lastTriggered: '2 hours ago', },
  { id: '2', name: 'Overdue Task Escalation', description: 'Escalates tasks that are overdue by 2 days', category: 'Condition-based', department: 'All', active: true, trigger: 'When task is 2 days overdue', executions: 156, lastTriggered: '1 day ago', },
  { id: '3', name: 'KPI Alert Trigger', description: 'Notifies when KPI falls below warning threshold', category: 'Condition-based', department: 'Executive', active: true, trigger: 'When KPI < warning threshold', executions: 23, lastTriggered: '3 hours ago', },
  { id: '4', name: 'Welcome Email Campaign', description: 'Automatically sends welcome email to new clients', category: 'Event-based', department: 'Client Experience', active: true, trigger: 'On new client registration', executions: 87, lastTriggered: '6 hours ago', },
  { id: '5', name: 'Low Stock Notification', description: 'Alerts inventory team when stock level drops', category: 'Condition-based', department: 'Inventory', active: true, trigger: 'When stock < minimum threshold', executions: 203, lastTriggered: '30 minutes ago', },
  { id: '6', name: 'Approval Routing Rule', description: 'Routes approvals to correct manager based on amount', category: 'Event-based', department: 'Finance', active: true, trigger: 'On new approval request', executions: 342, lastTriggered: '15 minutes ago', },
  { id: '7', name: 'Weekly Inventory Count', description: 'Schedules weekly inventory count tasks', category: 'Scheduled', department: 'Inventory', active: true, trigger: 'Every Monday at 8:00 AM', executions: 18, lastTriggered: '1 week ago', },
  { id: '8', name: 'Customer Survey Request', description: 'Automatically sends survey to customers post-purchase', category: 'Event-based', department: 'Customer Care', active: true, trigger: 'On order completion', executions: 234, lastTriggered: '4 hours ago', },
  { id: '9', name: 'Contractor Payment Reminder', description: 'Reminds to process vendor payments on schedule', category: 'Scheduled', department: 'Finance', active: false, trigger: 'Every 15th and 30th at 10:00 AM', executions: 12, lastTriggered: 'Inactive', },
  { id: '10', name: 'Sales Lead Assignment', description: 'Auto-assigns new leads to sales team based on territory', category: 'Event-based', department: 'Sales', active: true, trigger: 'On new lead creation', executions: 456, lastTriggered: '10 minutes ago', },
  { id: '11', name: 'Slack Status Sync', description: 'Syncs task status updates to Slack channels', category: 'Webhook', department: 'All', active: true, trigger: 'On task status change', executions: 567, lastTriggered: 'Just now', },
  { id: '12', name: 'Monthly Reconciliation Prep', description: 'Prepares data for monthly financial reconciliation', category: 'Scheduled', department: 'Finance', active: true, trigger: 'First business day of month', executions: 12, lastTriggered: 'Next: 2026-05-01', },
];

const AutomationCard = ({ automation }: { automation: (typeof mockAutomations)[0] }) => {
  const categoryIcons = { Scheduled: Clock, 'Event-based': EventIcon, 'Condition-based': GitBranch, Webhook: Zap, };
  const CategoryIcon = categoryIcons[automation.category as keyof typeof categoryIcons] || Zap;

  return (
    <Card className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md hover:border-[#09203F]/20 transition-all">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-semibold text-gray-900">{automation.name}</h3>
              <ToggleRight className={cn('w-5 h-5 cursor-pointer', automation.active ? 'text-emerald-600' : 'text-gray-400')} />
            </div>
            <p className="text-sm text-gray-500">{automation.description}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="pt-4 border-t border-gray-200">
            <div className="flex items-center gap-2 mb-3">
              <CategoryIcon className="w-4 h-4 text-[#09203F]" />
              <p className="text-sm text-gray-600">{automation.trigger}</p>
            </div>

            <div className="grid grid-cols-3 gap-3 text-sm">
              <div>
                <p className="text-gray-500">Category</p>
                <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200 mt-1">
                  {automation.category}
                </Badge>
              </div>
              <div>
                <p className="text-gray-500">Department</p>
                <p className="text-gray-900 font-medium mt-1">{automation.department}</p>
              </div>
              <div>
                <p className="text-gray-500">Executions</p>
                <p className="text-gray-900 font-medium mt-1">{automation.executions}</p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500">Last triggered: {automation.lastTriggered}</p>
            <div className="flex gap-2 mt-3">
              <Button size="sm" className="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-900">
                Edit
              </Button>
              <Button size="sm" className="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-900">
                Details
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default function AutomationsPage() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = useMemo(() => {
    const cats = mockAutomations.map((a) => a.category);
    return ['All', ...new Set(cats)];
  }, []);

  const filtered = useMemo(() => {
    return mockAutomations.filter((automation) => {
      const matchesSearch = automation.name.toLowerCase().includes(search.toLowerCase()) ||
        automation.description.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || automation.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [search, selectedCategory]);

  const activeCount = useMemo(() => {
    return mockAutomations.filter((a) => a.active).length;
  }, []);

  const inactiveCount = useMemo(() => {
    return mockAutomations.filter((a) => !a.active).length;
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Automations</h1>
          <p className="text-gray-500">
            Create and manage automation rules to streamline operations.
          </p>
        </div>
        <Button className="bg-[#09203F] hover:bg-[#0a2651] text-white font-medium">
          <Plus className="w-4 h-4 mr-2" />
          Create Rule
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white border border-gray-200 rounded-xl shadow-sm">
          <div className="p-6">
            <p className="text-gray-500 text-sm font-medium mb-2">Total Rules</p>
            <p className="text-3xl font-bold text-gray-900">{mockAutomations.length}</p>
          </div>
        </Card>
        <Card className="bg-white border border-gray-200 rounded-xl shadow-sm">
          <div className="p-6">
            <p className="text-gray-500 text-sm font-medium mb-2">Active Rules</p>
            <p className="text-3xl font-bold text-emerald-600">{activeCount}</p>
          </div>
        </Card>
        <Card className="bg-white border border-gray-200 rounded-xl shadow-sm">
          <div className="p-6">
            <p className="text-gray-500 text-sm font-medium mb-2">Inactive Rules</p>
            <p className="text-3xl font-bold text-gray-500">{inactiveCount}</p>
          </div>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search automations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#09203F]"
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          {categories.map((cat) => (
            <Button
              key={cat}
              variant={selectedCategory === cat ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                selectedCategory === cat
                  ? 'bg-[#09203F] text-white'
                  : 'bg-white border-gray-200 text-gray-700 hover:border-[#09203F]/50'
              )}
            >
              {cat}
            </Button>
          ))}
        </div>
      </div>

      {/* Automations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filtered.map((automation) => (
          <AutomationCard key={automation.id} automation={automation} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <Zap className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-2">No automations found</p>
          <p className="text-gray-400 text-sm">Try adjusting your filters or create a new rule</p>
        </div>
      )}
    </div>
  );
}
