'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getDepartmentBySlug, getDepartmentRoles } from '@/config/departments';
import {
  Users,
  CheckSquare,
  GitBranch,
  FileCheck,
  AlertCircle,
  Clock,
  ArrowRight,
  TrendingUp,
  Zap,
  FileText,
  Settings,
  Plus,
  Crown,
  Megaphone,
  ShoppingCart,
  Store,
  Heart,
  Package,
  Wrench,
  DollarSign,
  Cpu,
  Truck,
  Sparkles,
  Palette,
  Headphones,
  Scale,
  Hammer,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const iconMap: Record<string, any> = {
  Crown,
  Megaphone,
  ShoppingCart,
  Store,
  TrendingUp,
  Heart,
  Package,
  Wrench,
  DollarSign,
  Cpu,
  Truck,
  Sparkles,
  Palette,
  Headphones,
  Scale,
  Hammer,
  Users,
  GitBranch,
};

// Mock data for department activities, tasks, workflows, etc
const mockActivities = [
  {
    id: '1',
    user: 'Sarah Mitchell',
    action: 'completed task',
    entity: 'Q1 Marketing Campaign Review',
    timestamp: 'Today at 2:30 PM',
  },
  {
    id: '2',
    user: 'Marcus Chen',
    action: 'submitted workflow',
    entity: 'Content Publishing',
    timestamp: 'Today at 11:45 AM',
  },
  {
    id: '3',
    user: 'Elena Rodriguez',
    action: 'requested approval',
    entity: 'Budget Allocation',
    timestamp: 'Yesterday',
  },
];

const mockTasks = [
  {
    id: '1',
    title: 'Campaign Performance Analysis',
    status: 'in-progress',
    priority: 'high',
    assignee: 'Sarah Mitchell',
    dueDate: '2026-04-05',
  },
  {
    id: '2',
    title: 'Social Media Content Calendar',
    status: 'pending',
    priority: 'medium',
    assignee: 'James Wilson',
    dueDate: '2026-04-08',
  },
  {
    id: '3',
    title: 'Email Marketing Testing',
    status: 'review',
    priority: 'high',
    assignee: 'Yuki Tanaka',
    dueDate: '2026-04-03',
  },
  {
    id: '4',
    title: 'Website Analytics Report',
    status: 'pending',
    priority: 'medium',
    assignee: 'Marcus Chen',
    dueDate: '2026-04-10',
  },
];

const mockWorkflows = [
  {
    id: '1',
    name: 'Content Publishing',
    status: 'active',
    triggerType: 'Manual',
    steps: 5,
    lastRun: '2 days ago',
  },
  {
    id: '2',
    name: 'Campaign Review Process',
    status: 'active',
    triggerType: 'Scheduled',
    steps: 3,
    lastRun: '5 days ago',
  },
  {
    id: '3',
    name: 'Social Media Approval',
    status: 'active',
    triggerType: 'Event',
    steps: 4,
    lastRun: '1 day ago',
  },
];

const mockKpis = [
  {
    id: '1',
    name: 'Website Traffic',
    value: 45230,
    target: 50000,
    trend: 'up',
    trendPercent: 12,
  },
  {
    id: '2',
    name: 'Conversion Rate',
    value: 3.2,
    target: 4.0,
    trend: 'up',
    trendPercent: 5,
  },
  {
    id: '3',
    name: 'Email Open Rate',
    value: 24.5,
    target: 28.0,
    trend: 'down',
    trendPercent: -2,
  },
  {
    id: '4',
    name: 'Social Engagement',
    value: 8923,
    target: 10000,
    trend: 'up',
    trendPercent: 18,
  },
];

const mockSops = [
  { id: '1', title: 'Content Creation Guidelines', version: '2.1', updated: '2026-03-20' },
  { id: '2', title: 'Email Campaign SOP', version: '1.8', updated: '2026-03-18' },
  { id: '3', title: 'Social Media Posting Standards', version: '3.2', updated: '2026-03-15' },
];

const mockAutomations = [
  {
    id: '1',
    name: 'Daily Marketing Report',
    description: 'Sends daily performance digest',
    trigger: 'Scheduled',
    active: true,
    executions: 45,
    lastTriggered: '2 hours ago',
  },
  {
    id: '2',
    name: 'Content Expiration Alerts',
    description: 'Notifies when content needs refresh',
    trigger: 'Condition',
    active: true,
    executions: 12,
    lastTriggered: '1 day ago',
  },
  {
    id: '3',
    name: 'Campaign Performance Escalation',
    description: 'Escalates underperforming campaigns',
    trigger: 'Event',
    active: false,
    executions: 8,
    lastTriggered: '5 days ago',
  },
];

export default function DepartmentPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const dept = getDepartmentBySlug(slug);
  const roles = getDepartmentRoles(slug);
  const [activeTab, setActiveTab] = useState('overview');

  if (!dept) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Department not found</h2>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  const Icon = iconMap[dept.icon] || Users;

  const StatCard = ({ icon: IconComp, label, value }: any) => (
    <Card className="bg-white border border-gray-200 rounded-xl shadow-sm">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-gray-500 text-sm font-medium">{label}</span>
          <IconComp className="w-5 h-5 text-gray-400" />
        </div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </Card>
  );

  const TaskItem = ({ task }: any) => (
    <div className="flex items-center justify-between p-4 border-b border-gray-200 last:border-0">
      <div className="flex-1">
        <p className="font-medium text-gray-900">{task.title}</p>
        <p className="text-sm text-gray-500 mt-1">{task.assignee}</p>
      </div>
      <div className="flex items-center gap-3">
        <Badge
          className={cn(
            'text-xs',
            task.priority === 'high' && 'bg-red-500/10 text-red-700 border-red-200',
            task.priority === 'medium' && 'bg-yellow-500/10 text-yellow-700 border-yellow-200'
          )}
          variant="outline"
        >
          {task.priority}
        </Badge>
        <Badge
          className={cn(
            'text-xs',
            task.status === 'in-progress' &&
              'bg-blue-500/10 text-blue-700 border-blue-200',
            task.status === 'review' && 'bg-purple-500/10 text-purple-700 border-purple-200',
            task.status === 'pending' && 'bg-gray-500/10 text-gray-700 border-gray-200'
          )}
          variant="outline"
        >
          {task.status}
        </Badge>
      </div>
    </div>
  );

  const WorkflowItem = ({ workflow }: any) => (
    <div className="flex items-center justify-between p-4 border-b border-gray-200 last:border-0">
      <div className="flex-1">
        <p className="font-medium text-gray-900">{workflow.name}</p>
        <p className="text-sm text-gray-500 mt-1">
          {workflow.steps} steps • {workflow.triggerType} trigger
        </p>
      </div>
      <div className="flex items-center gap-3">
        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-700 border-emerald-200">
          {workflow.status}
        </Badge>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Department Header */}
      <div className="space-y-4">
        <div className="flex items-start gap-6">
          <div
            className="p-4 rounded-lg"
            style={{ backgroundColor: dept.color + '15' }}
          >
            <Icon className="w-8 h-8" style={{ color: dept.color }} />
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{dept.name}</h1>
            <p className="text-gray-500">{dept.description}</p>
          </div>
        </div>

        {/* Color accent bar */}
        <div
          className="h-1 rounded-full"
          style={{ backgroundColor: dept.color }}
        />
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={Users} label="Team Members" value={roles.length} />
        <StatCard icon={CheckSquare} label="Active Tasks" value={12} />
        <StatCard icon={GitBranch} label="Open Workflows" value={3} />
        <StatCard icon={FileCheck} label="Pending Approvals" value={2} />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-white border-b border-gray-200 w-full justify-start rounded-none p-0 h-auto">
          <TabsTrigger
            value="overview"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#09203F] data-[state=active]:bg-transparent"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="team"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#09203F] data-[state=active]:bg-transparent"
          >
            Team
          </TabsTrigger>
          <TabsTrigger
            value="workflows"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#09203F] data-[state=active]:bg-transparent"
          >
            Workflows
          </TabsTrigger>
          <TabsTrigger
            value="tasks"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#09203F] data-[state=active]:bg-transparent"
          >
            Tasks
          </TabsTrigger>
          <TabsTrigger
            value="kpis"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#09203F] data-[state=active]:bg-transparent"
          >
            KPIs
          </TabsTrigger>
          <TabsTrigger
            value="sops"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#09203F] data-[state=active]:bg-transparent"
          >
            SOPs
          </TabsTrigger>
          <TabsTrigger
            value="automations"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#09203F] data-[state=active]:bg-transparent"
          >
            Automations
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6 mt-6">
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
                  {mockActivities.map((activity) => (
                    <div
                      key={activity.id}
                      className="p-6 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-[#09203F]/10 flex items-center justify-center flex-shrink-0">
                          <CheckSquare className="w-5 h-5 text-[#09203F]" />
                        </div>
                        <div className="flex-1">
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

            {/* Quick Actions */}
            <div>
              <Card className="bg-white border border-gray-200 rounded-xl shadow-sm">
                <div className="border-b border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
                </div>
                <div className="p-6 space-y-3">
                  <Button className="w-full bg-gray-50 hover:bg-gray-100 text-gray-900 border border-gray-200 justify-start">
                    <Plus className="w-4 h-4 mr-2" />
                    New Task
                  </Button>
                  <Button className="w-full bg-gray-50 hover:bg-gray-100 text-gray-900 border border-gray-200 justify-start">
                    <GitBranch className="w-4 h-4 mr-2" />
                    Start Workflow
                  </Button>
                  <Button className="w-full bg-[#09203F] hover:bg-[#0a2651] text-white font-medium justify-start">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    View Reports
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Team Tab */}
        <TabsContent value="team" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {roles.map((role) => (
              <Card
                key={role.slug}
                className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md hover:border-[#09203F]/20 transition-all group cursor-pointer"
              >
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-[#09203F] mb-2 transition-colors">
                    {role.title}
                  </h3>
                  <p className="text-sm text-gray-500 mb-6">{role.description}</p>
                  <Button
                    variant="ghost"
                    className="w-full bg-gray-50 hover:bg-gray-100 text-gray-900 border border-gray-200"
                    asChild
                  >
                    <a href={`/departments/${slug}/roles/${role.slug}`}>
                      View Role Details
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </a>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Workflows Tab */}
        <TabsContent value="workflows" className="mt-6">
          <Card className="bg-white border border-gray-200 rounded-xl shadow-sm">
            <div className="border-b border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Department Workflows</h2>
                <Button size="sm" className="bg-[#09203F] hover:bg-[#0a2651] text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  New Workflow
                </Button>
              </div>
            </div>
            <div>
              {mockWorkflows.map((workflow) => (
                <WorkflowItem key={workflow.id} workflow={workflow} />
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* Tasks Tab */}
        <TabsContent value="tasks" className="mt-6">
          <Card className="bg-white border border-gray-200 rounded-xl shadow-sm">
            <div className="border-b border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900">Department Tasks</h2>
            </div>
            <div>
              {mockTasks.map((task) => (
                <TaskItem key={task.id} task={task} />
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* KPIs Tab */}
        <TabsContent value="kpis" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {mockKpis.map((kpi) => (
              <Card key={kpi.id} className="bg-white border border-gray-200 rounded-xl shadow-sm">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="font-medium text-gray-900">{kpi.name}</h3>
                    <Badge
                      className={cn(
                        kpi.trend === 'up' && 'bg-emerald-500/10 text-emerald-700',
                        kpi.trend === 'down' && 'bg-red-500/10 text-red-700'
                      )}
                      variant="outline"
                    >
                      {kpi.trend === 'up' ? '+' : '-'}{kpi.trendPercent}%
                    </Badge>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 mb-2">{kpi.value}</p>
                  <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-[#09203F] h-full"
                      style={{ width: `${(kpi.value / kpi.target) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Target: {kpi.target}</p>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* SOPs Tab */}
        <TabsContent value="sops" className="mt-6">
          <Card className="bg-white border border-gray-200 rounded-xl shadow-sm">
            <div className="border-b border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#09203F]" />
                Standard Operating Procedures
              </h2>
            </div>
            <div>
              {mockSops.map((sop) => (
                <div
                  key={sop.id}
                  className="flex items-center justify-between p-6 border-b border-gray-200 last:border-0 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <div>
                    <p className="font-medium text-gray-900">{sop.title}</p>
                    <p className="text-sm text-gray-500 mt-1">v{sop.version}</p>
                  </div>
                  <p className="text-sm text-gray-500">{sop.updated}</p>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* Automations Tab */}
        <TabsContent value="automations" className="mt-6">
          <Card className="bg-white border border-gray-200 rounded-xl shadow-sm">
            <div className="border-b border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-[#09203F]" />
                  Automation Rules
                </h2>
                <Button size="sm" className="bg-[#09203F] hover:bg-[#0a2651] text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  New Rule
                </Button>
              </div>
            </div>
            <div className="divide-y divide-gray-200">
              {mockAutomations.map((auto) => (
                <div key={auto.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{auto.name}</h3>
                      <p className="text-sm text-gray-500 mt-1">{auto.description}</p>
                    </div>
                    <Badge
                      className={cn(
                        auto.active
                          ? 'bg-emerald-500/10 text-emerald-700 border-emerald-200'
                          : 'bg-gray-500/10 text-gray-700 border-gray-200'
                      )}
                      variant="outline"
                    >
                      {auto.active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>{auto.trigger} Trigger</span>
                    <span>•</span>
                    <span>{auto.executions} executions</span>
                    <span>•</span>
                    <span>Last: {auto.lastTriggered}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
