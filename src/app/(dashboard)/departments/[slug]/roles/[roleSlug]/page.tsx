'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  getDepartmentBySlug,
  getRoleBySlug,
  getDepartmentRoles,
} from '@/config/departments';
import {
  Users,
  CheckSquare,
  GitBranch,
  FileCheck,
  Clock,
  ArrowRight,
  ArrowLeft,
  TrendingUp,
  Zap,
  FileText,
  AlertCircle,
  Plus,
  LogOut,
  Calendar,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Mock data for role-specific information
const mockTasks = [
  {
    id: '1',
    title: 'Review Q1 Marketing Budget',
    status: 'in-progress',
    priority: 'high',
    dueDate: '2026-04-02',
    assignee: 'You',
  },
  {
    id: '2',
    title: 'Approve Campaign Creative Assets',
    status: 'pending',
    priority: 'urgent',
    dueDate: '2026-03-31',
    assignee: 'You',
  },
  {
    id: '3',
    title: 'Sign Off on Content Calendar',
    status: 'pending',
    priority: 'high',
    dueDate: '2026-04-05',
    assignee: 'You',
  },
  {
    id: '4',
    title: 'Monthly Performance Review',
    status: 'completed',
    priority: 'medium',
    dueDate: '2026-03-28',
    assignee: 'You',
  },
];

const mockApprovals = [
  {
    id: '1',
    title: 'Budget Increase Request - Digital Advertising',
    requester: 'Sarah Mitchell',
    amount: '$25,000',
    status: 'pending',
    submitted: '2026-03-30',
    priority: 'high',
  },
  {
    id: '2',
    title: 'New Hire Onboarding - Marketing Coordinator',
    requester: 'James Wilson',
    status: 'pending',
    submitted: '2026-03-29',
    priority: 'medium',
  },
  {
    id: '3',
    title: 'Conference Attendance Approval',
    requester: 'Yuki Tanaka',
    status: 'approved',
    submitted: '2026-03-25',
    priority: 'low',
  },
];

const mockWorkflows = [
  {
    id: '1',
    name: 'Content Publishing Approval',
    description: 'Multi-step approval for published content',
    status: 'active',
    executions: 34,
  },
  {
    id: '2',
    name: 'Campaign Launch Process',
    description: 'End-to-end campaign workflow',
    status: 'active',
    executions: 12,
  },
  {
    id: '3',
    name: 'Budget Review Cycle',
    description: 'Quarterly budget planning workflow',
    status: 'active',
    executions: 4,
  },
];

const mockSops = [
  {
    id: '1',
    title: 'Content Approval SOP',
    version: '2.3',
    updated: '2026-03-20',
    pages: 8,
  },
  {
    id: '2',
    title: 'Approval Authority Limits',
    version: '1.5',
    updated: '2026-03-15',
    pages: 3,
  },
  {
    id: '3',
    title: 'Decision Making Framework',
    version: '3.1',
    updated: '2026-02-28',
    pages: 12,
  },
];

const mockAutomations = [
  {
    id: '1',
    name: 'Weekly Status Report',
    trigger: 'Scheduled',
    frequency: 'Every Monday 9 AM',
    active: true,
    lastRun: 'Today at 9:00 AM',
  },
  {
    id: '2',
    name: 'Escalate Overdue Tasks',
    trigger: 'Condition',
    frequency: 'When tasks are 2 days overdue',
    active: true,
    lastRun: '2 days ago',
  },
  {
    id: '3',
    name: 'Send Approval Reminders',
    trigger: 'Scheduled',
    frequency: 'Daily at 10 AM',
    active: true,
    lastRun: 'Today at 10:00 AM',
  },
];

const mockAudit = [
  {
    id: '1',
    action: 'Approved Budget Allocation',
    entity: 'Budget Allocation Request #2026-001',
    timestamp: 'Today at 2:45 PM',
    details: 'Approved $50,000 allocation for Q2 marketing',
  },
  {
    id: '2',
    action: 'Completed Task',
    entity: 'Q1 Marketing Review',
    timestamp: 'Today at 1:30 PM',
    details: 'Marked task as complete',
  },
  {
    id: '3',
    action: 'Created Workflow',
    entity: 'New Campaign Launch Process',
    timestamp: 'Yesterday at 11:00 AM',
    details: 'Created new workflow with 5 steps',
  },
  {
    id: '4',
    action: 'Modified Document',
    entity: 'Content Guidelines v2.4',
    timestamp: '2 days ago',
    details: 'Updated content approval thresholds',
  },
];

const mockUpcomingDeadlines = [
  { id: '1', title: 'Campaign Launch', dueDate: '2026-04-01', priority: 'critical' },
  { id: '2', title: 'Budget Approval', dueDate: '2026-04-05', priority: 'high' },
  { id: '3', title: 'Quarterly Review', dueDate: '2026-04-10', priority: 'medium' },
];

export default function RolePage() {
  const params = useParams();
  const router = useRouter();
  const departmentSlug = params.slug as string;
  const roleSlug = params.roleSlug as string;

  const dept = getDepartmentBySlug(departmentSlug);
  const role = getRoleBySlug(departmentSlug, roleSlug);
  const [activeTab, setActiveTab] = useState('overview');

  if (!dept || !role) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Role not found</h2>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  const StatCard = ({ icon: Icon, label, value }: any) => (
    <Card className="bg-white border border-gray-200 rounded-xl shadow-sm">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-gray-500 text-sm font-medium">{label}</span>
          <Icon className="w-5 h-5 text-gray-400" />
        </div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </Card>
  );

  const TaskItem = ({ task }: any) => (
    <div className="flex items-center justify-between p-4 border-b border-gray-200 last:border-0">
      <div className="flex-1">
        <p className="font-medium text-gray-900">{task.title}</p>
        <p className="text-sm text-gray-500 mt-1">Due: {task.dueDate}</p>
      </div>
      <div className="flex items-center gap-3">
        <Badge
          className={cn(
            'text-xs',
            task.priority === 'urgent' && 'bg-red-600/10 text-red-700 border-red-200',
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
            task.status === 'pending' && 'bg-gray-500/10 text-gray-700 border-gray-200',
            task.status === 'completed' &&
              'bg-emerald-500/10 text-emerald-700 border-emerald-200'
          )}
          variant="outline"
        >
          {task.status}
        </Badge>
      </div>
    </div>
  );

  const ApprovalItem = ({ approval }: any) => (
    <div className="flex items-start justify-between p-4 border-b border-gray-200 last:border-0 hover:bg-gray-50 transition-colors">
      <div className="flex-1">
        <p className="font-medium text-gray-900">{approval.title}</p>
        <p className="text-sm text-gray-500 mt-1">
          From {approval.requester} • {approval.submitted}
        </p>
        {approval.amount && (
          <p className="text-sm text-[#09203F] mt-1 font-medium">{approval.amount}</p>
        )}
      </div>
      <div className="flex items-center gap-3">
        {approval.status === 'pending' && (
          <>
            <Button
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Approve
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="bg-red-500/10 text-red-700 border-red-200 hover:bg-red-500/20"
            >
              Reject
            </Button>
          </>
        )}
        {approval.status === 'approved' && (
          <Badge className="bg-emerald-500/10 text-emerald-700 border-emerald-200" variant="outline">
            Approved
          </Badge>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="p-0">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back
        </Button>
        <span>•</span>
        <a href={`/departments/${departmentSlug}`} className="hover:text-[#09203F]">
          {dept.name}
        </a>
        <span>•</span>
        <span className="text-gray-700">{role.title}</span>
      </div>

      {/* Role Header */}
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{role.title}</h1>
            <p className="text-gray-500">{role.description}</p>
          </div>
          <Badge
            className="bg-white text-gray-900 border-gray-200 h-fit"
            style={{ borderColor: dept.color + '40' }}
          >
            {dept.name}
          </Badge>
        </div>

        {/* Color accent bar */}
        <div
          className="h-1 rounded-full"
          style={{ backgroundColor: dept.color }}
        />
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={CheckSquare} label="Assigned Tasks" value={4} />
        <StatCard icon={FileCheck} label="Pending Approvals" value={2} />
        <StatCard icon={GitBranch} label="Owned Workflows" value={3} />
        <StatCard icon={AlertCircle} label="Task Due Soon" value={2} />
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
            value="tasks"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#09203F] data-[state=active]:bg-transparent"
          >
            Tasks
          </TabsTrigger>
          <TabsTrigger
            value="workflows"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#09203F] data-[state=active]:bg-transparent"
          >
            Workflows
          </TabsTrigger>
          <TabsTrigger
            value="approvals"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#09203F] data-[state=active]:bg-transparent"
          >
            Approvals
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
          <TabsTrigger
            value="audit"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#09203F] data-[state=active]:bg-transparent"
          >
            Audit Log
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Upcoming Deadlines */}
            <div className="lg:col-span-2">
              <Card className="bg-white border border-gray-200 rounded-xl shadow-sm">
                <div className="border-b border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-[#09203F]" />
                    Upcoming Deadlines
                  </h2>
                </div>
                <div>
                  {mockUpcomingDeadlines.map((deadline) => (
                    <div
                      key={deadline.id}
                      className="flex items-center justify-between p-6 border-b border-gray-200 last:border-0 hover:bg-gray-50 transition-colors"
                    >
                      <div>
                        <p className="font-medium text-gray-900">{deadline.title}</p>
                        <p className="text-sm text-gray-500 mt-1">Due {deadline.dueDate}</p>
                      </div>
                      <Badge
                        className={cn(
                          deadline.priority === 'critical' &&
                            'bg-red-600/10 text-red-700 border-red-200',
                          deadline.priority === 'high' &&
                            'bg-red-500/10 text-red-700 border-red-200',
                          deadline.priority === 'medium' &&
                            'bg-yellow-500/10 text-yellow-700 border-yellow-200'
                        )}
                        variant="outline"
                      >
                        {deadline.priority}
                      </Badge>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Key Metrics */}
            <div>
              <Card className="bg-white border border-gray-200 rounded-xl shadow-sm">
                <div className="border-b border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900">Key Metrics</h3>
                </div>
                <div className="p-6 space-y-6">
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Task Completion Rate</p>
                    <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full"
                        style={{ width: '75%' }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-2">75% (3 of 4)</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Approval Response Time</p>
                    <p className="text-lg font-bold text-gray-900">2.4 hours</p>
                    <p className="text-xs text-gray-500 mt-1">Average response</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Tasks Tab */}
        <TabsContent value="tasks" className="mt-6">
          <Card className="bg-white border border-gray-200 rounded-xl shadow-sm">
            <div className="border-b border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Assigned Tasks</h2>
                <Button size="sm" className="bg-[#09203F] hover:bg-[#0a2651] text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  New Task
                </Button>
              </div>
            </div>
            <div>
              {mockTasks.map((task) => (
                <TaskItem key={task.id} task={task} />
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* Workflows Tab */}
        <TabsContent value="workflows" className="mt-6">
          <Card className="bg-white border border-gray-200 rounded-xl shadow-sm">
            <div className="border-b border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900">Owned Workflows</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {mockWorkflows.map((workflow) => (
                <div
                  key={workflow.id}
                  className="p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-medium text-gray-900">{workflow.name}</h3>
                      <p className="text-sm text-gray-500 mt-1">{workflow.description}</p>
                    </div>
                    <Badge
                      className="bg-emerald-500/10 text-emerald-700 border-emerald-200"
                      variant="outline"
                    >
                      {workflow.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500">{workflow.executions} total executions</p>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* Approvals Tab */}
        <TabsContent value="approvals" className="mt-6">
          <Card className="bg-white border border-gray-200 rounded-xl shadow-sm">
            <div className="border-b border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900">Pending Approvals</h2>
            </div>
            <div>
              {mockApprovals.map((approval) => (
                <ApprovalItem key={approval.id} approval={approval} />
              ))}
            </div>
          </Card>
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
            <div className="divide-y divide-gray-200">
              {mockSops.map((sop) => (
                <div
                  key={sop.id}
                  className="flex items-center justify-between p-6 border-b border-gray-200 last:border-0 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <div>
                    <p className="font-medium text-gray-900">{sop.title}</p>
                    <p className="text-sm text-gray-500 mt-1">v{sop.version} • {sop.pages} pages</p>
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
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Zap className="w-5 h-5 text-[#09203F]" />
                Role Automations
              </h2>
            </div>
            <div className="divide-y divide-gray-200">
              {mockAutomations.map((auto) => (
                <div key={auto.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{auto.name}</h3>
                      <p className="text-sm text-gray-500 mt-1">{auto.frequency}</p>
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
                  <p className="text-xs text-gray-500">Last run: {auto.lastRun}</p>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* Audit Log Tab */}
        <TabsContent value="audit" className="mt-6">
          <Card className="bg-white border border-gray-200 rounded-xl shadow-sm">
            <div className="border-b border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900">Audit Trail</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {mockAudit.map((entry) => (
                <div key={entry.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#09203F]/10 flex items-center justify-center flex-shrink-0">
                      <CheckSquare className="w-5 h-5 text-[#09203F]" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{entry.action}</p>
                      <p className="text-sm text-gray-500 mt-1">{entry.entity}</p>
                      <p className="text-xs text-gray-500 mt-2">{entry.details}</p>
                      <p className="text-xs text-gray-400 mt-1">{entry.timestamp}</p>
                    </div>
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
