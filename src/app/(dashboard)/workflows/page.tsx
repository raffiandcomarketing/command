'use client';

import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Search,
  Plus,
  GitBranch,
  Clock,
  Zap,
  CheckCircle,
  AlertCircle,
  Copy,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Mock workflow data
const mockWorkflows = [
  {
    id: '1',
    name: 'Purchase Approval Workflow',
    description: 'Multi-level approval process for purchases over $5000',
    department: 'Finance',
    status: 'active',
    triggerType: 'Manual',
    steps: 5,
    lastRun: '2 hours ago',
    createdDate: '2026-01-15',
    executions: 128,
  },
  {
    id: '2',
    name: 'Leave Request Process',
    description: 'Employee leave request submission and approval',
    department: 'Human Resources',
    status: 'active',
    triggerType: 'Event',
    steps: 3,
    lastRun: '1 day ago',
    createdDate: '2025-12-10',
    executions: 234,
  },
  {
    id: '3',
    name: 'Content Publishing Pipeline',
    description: 'Review, approval, and scheduling of published content',
    department: 'Marketing',
    status: 'active',
    triggerType: 'Manual',
    steps: 6,
    lastRun: '30 minutes ago',
    createdDate: '2025-11-20',
    executions: 456,
  },
  {
    id: '4',
    name: 'Inventory Reorder Automation',
    description: 'Automatic reorder when stock falls below threshold',
    department: 'Inventory',
    status: 'active',
    triggerType: 'Scheduled',
    steps: 4,
    lastRun: 'Today at 6:00 AM',
    createdDate: '2025-10-05',
    executions: 89,
  },
  {
    id: '5',
    name: 'Client Onboarding Workflow',
    description: 'Complete new client setup and document collection',
    department: 'Client Experience',
    status: 'active',
    triggerType: 'Event',
    steps: 7,
    lastRun: '3 days ago',
    createdDate: '2025-09-12',
    executions: 42,
  },
  {
    id: '6',
    name: 'Repair Intake Process',
    description: 'Device intake, assessment, and repair tracking',
    department: 'Repairs/Service',
    status: 'active',
    triggerType: 'Manual',
    steps: 5,
    lastRun: '4 hours ago',
    createdDate: '2025-08-30',
    executions: 156,
  },
  {
    id: '7',
    name: 'Quarterly Business Review',
    description: 'Scheduled quarterly reviews and reporting',
    department: 'Executive',
    status: 'archived',
    triggerType: 'Scheduled',
    steps: 4,
    lastRun: 'Archived',
    createdDate: '2025-06-01',
    executions: 4,
  },
  {
    id: '8',
    name: 'Event Registration Portal',
    description: 'Customer event registration and confirmation',
    department: 'Events',
    status: 'completed',
    triggerType: 'Event',
    steps: 3,
    lastRun: '2026-03-20',
    createdDate: '2026-02-01',
    executions: 187,
  },
];

const WorkflowCard = ({ workflow }: { workflow: (typeof mockWorkflows)[0] }) => {
  const statusColors = {
    active: 'bg-emerald-500/10 text-emerald-700 border-emerald-200',
    archived: 'bg-gray-500/10 text-gray-700 border-gray-200',
    completed: 'bg-blue-500/10 text-blue-700 border-blue-200',
  };

  const triggerIcons = {
    Manual: Plus,
    Scheduled: Clock,
    Event: Zap,
    Webhook: AlertCircle,
  };

  const TriggerIcon = triggerIcons[workflow.triggerType as keyof typeof triggerIcons] || Plus;

  return (
    <Card className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md hover:border-[#09203F]/20 transition-all">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-semibold text-gray-900">{workflow.name}</h3>
              <Badge variant="outline" className={statusColors[workflow.status]}>
                {workflow.status}
              </Badge>
            </div>
            <p className="text-sm text-gray-500">{workflow.description}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Department</p>
              <p className="text-gray-900 font-medium">{workflow.department}</p>
            </div>
            <div>
              <p className="text-gray-500">Trigger Type</p>
              <div className="flex items-center gap-2 mt-1">
                <TriggerIcon className="w-4 h-4 text-[#09203F]" />
                <p className="text-gray-900 font-medium">{workflow.triggerType}</p>
              </div>
            </div>
            <div>
              <p className="text-gray-500">Steps</p>
              <p className="text-gray-900 font-medium">{workflow.steps}</p>
            </div>
            <div>
              <p className="text-gray-500">Last Run</p>
              <p className="text-gray-900 font-medium">{workflow.lastRun}</p>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500 mb-3">
              Created {workflow.createdDate} • {workflow.executions} executions
            </p>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-900"
              >
                <GitBranch className="w-4 h-4 mr-2" />
                View
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="bg-gray-50 hover:bg-gray-100 text-gray-900 border border-gray-200"
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default function WorkflowsPage() {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const departmentFilter = useMemo(() => {
    return ['All', ...new Set(mockWorkflows.map((w) => w.department))];
  }, []);

  const [selectedDept, setSelectedDept] = useState('All');

  const filtered = useMemo(() => {
    return mockWorkflows.filter((workflow) => {
      const matchesSearch = workflow.name
        .toLowerCase()
        .includes(search.toLowerCase()) ||
        workflow.description
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesDept =
        selectedDept === 'All' || workflow.department === selectedDept;

      let matchesTab = true;
      if (activeTab === 'active') matchesTab = workflow.status === 'active';
      if (activeTab === 'completed') matchesTab = workflow.status === 'completed';
      if (activeTab === 'templates') matchesTab = workflow.status === 'archived';

      return matchesSearch && matchesDept && matchesTab;
    });
  }, [search, selectedDept, activeTab]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Workflows</h1>
          <p className="text-gray-500">
            Build and manage automated workflows for your departments.
          </p>
        </div>
        <Button className="bg-[#09203F] hover:bg-[#0a2651] text-white font-medium">
          <Plus className="w-4 h-4 mr-2" />
          Create Workflow
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search workflows..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#09203F]"
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          {departmentFilter.map((dept) => (
            <Button
              key={dept}
              variant={selectedDept === dept ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedDept(dept)}
              className={cn(
                selectedDept === dept
                  ? 'bg-[#09203F] text-white'
                  : 'bg-white border-gray-200 text-gray-700 hover:border-[#09203F]/50'
              )}
            >
              {dept}
            </Button>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-white border-b border-gray-200 w-full justify-start rounded-none p-0 h-auto">
          <TabsTrigger
            value="all"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#09203F] data-[state=active]:bg-transparent"
          >
            All Workflows
          </TabsTrigger>
          <TabsTrigger
            value="active"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#09203F] data-[state=active]:bg-transparent"
          >
            Active
          </TabsTrigger>
          <TabsTrigger
            value="completed"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#09203F] data-[state=active]:bg-transparent"
          >
            Completed
          </TabsTrigger>
          <TabsTrigger
            value="templates"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#09203F] data-[state=active]:bg-transparent"
          >
            Templates
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filtered.map((workflow) => (
              <WorkflowCard key={workflow.id} workflow={workflow} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="active" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filtered.map((workflow) => (
              <WorkflowCard key={workflow.id} workflow={workflow} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="completed" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filtered.map((workflow) => (
              <WorkflowCard key={workflow.id} workflow={workflow} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="templates" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filtered.map((workflow) => (
              <WorkflowCard key={workflow.id} workflow={workflow} />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <GitBranch className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-2">No workflows found</p>
          <p className="text-gray-400 text-sm">Try adjusting your filters or create a new workflow</p>
        </div>
      )}
    </div>
  );
}
