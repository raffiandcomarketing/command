'use client';

import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  Plus,
  CheckSquare,
  LayoutGrid,
  List,
  Filter,
  Calendar,
  User,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Mock task data
const mockTasks = [
  {
    id: '1',
    title: 'Review Q1 Marketing Budget',
    status: 'pending',
    priority: 'high',
    assignee: 'Sarah Mitchell',
    department: 'Marketing',
    dueDate: '2026-04-02',
    description: 'Complete quarterly budget review and approval',
  },
  {
    id: '2',
    title: 'Update Inventory System',
    status: 'in-progress',
    priority: 'urgent',
    assignee: 'Marcus Chen',
    department: 'IT Systems',
    dueDate: '2026-03-31',
    description: 'Implement new inventory tracking features',
  },
  {
    id: '3',
    title: 'Approve Campaign Creative',
    status: 'review',
    priority: 'high',
    assignee: 'Elena Rodriguez',
    department: 'Marketing',
    dueDate: '2026-04-05',
    description: 'Review and approve all campaign creative assets',
  },
  {
    id: '4',
    title: 'Client Onboarding Package',
    status: 'pending',
    priority: 'medium',
    assignee: 'James Wilson',
    department: 'Client Experience',
    dueDate: '2026-04-08',
    description: 'Prepare and send welcome package to new VIP client',
  },
  {
    id: '5',
    title: 'Repair Assessment Report',
    status: 'in-progress',
    priority: 'high',
    assignee: 'Yuki Tanaka',
    department: 'Repairs/Service',
    dueDate: '2026-04-01',
    description: 'Complete damage assessment on luxury watch repairs',
  },
  {
    id: '6',
    title: 'Social Media Content Calendar',
    status: 'completed',
    priority: 'medium',
    assignee: 'Sarah Mitchell',
    department: 'Marketing',
    dueDate: '2026-03-28',
    description: 'Finalize April social media content plan',
  },
  {
    id: '7',
    title: 'Financial Statement Audit',
    status: 'in-progress',
    priority: 'critical',
    assignee: 'David Zhang',
    department: 'Finance/Accounting',
    dueDate: '2026-04-15',
    description: 'Q1 financial audit preparation and documentation',
  },
  {
    id: '8',
    title: 'Employee Training Program',
    status: 'pending',
    priority: 'medium',
    assignee: 'Lisa Anderson',
    department: 'Human Resources',
    dueDate: '2026-04-12',
    description: 'Design and schedule new hire training curriculum',
  },
  {
    id: '9',
    title: 'Vendor Contract Negotiation',
    status: 'review',
    priority: 'high',
    assignee: 'Robert Johnson',
    department: 'Purchasing/Procurement',
    dueDate: '2026-04-03',
    description: 'Negotiate terms for new supplier agreement',
  },
  {
    id: '10',
    title: 'Store Display Redesign',
    status: 'pending',
    priority: 'medium',
    assignee: 'Maria Garcia',
    department: 'Visual Merchandising',
    dueDate: '2026-04-10',
    description: 'Create and implement new window display design',
  },
  {
    id: '11',
    title: 'Customer Complaint Resolution',
    status: 'in-progress',
    priority: 'urgent',
    assignee: 'Thomas Mitchell',
    department: 'Customer Care',
    dueDate: '2026-03-31',
    description: 'Address high-value customer complaint',
  },
  {
    id: '12',
    title: 'Inventory Stock Count',
    status: 'pending',
    priority: 'medium',
    assignee: 'Susan Lee',
    department: 'Inventory/Merchandising',
    dueDate: '2026-04-07',
    description: 'Conduct physical inventory count and reconciliation',
  },
  {
    id: '13',
    title: 'Email Marketing Campaign',
    status: 'review',
    priority: 'medium',
    assignee: 'Alex Turner',
    department: 'Marketing',
    dueDate: '2026-04-02',
    description: 'Create and test email marketing campaign',
  },
  {
    id: '14',
    title: 'Logistics Route Optimization',
    status: 'in-progress',
    priority: 'high',
    assignee: 'Patricia White',
    department: 'Logistics/Shipping',
    dueDate: '2026-04-06',
    description: 'Optimize shipping routes for cost efficiency',
  },
  {
    id: '15',
    title: 'System Security Audit',
    status: 'pending',
    priority: 'critical',
    assignee: 'Kevin Park',
    department: 'IT Systems',
    dueDate: '2026-04-20',
    description: 'Conduct comprehensive security audit and penetration testing',
  },
];

const TaskCard = ({ task, viewMode }: { task: (typeof mockTasks)[0]; viewMode: string }) => {
  const statusColors = {
    pending: 'bg-gray-500/10 text-gray-700 border-gray-200',
    'in-progress': 'bg-blue-500/10 text-blue-700 border-blue-200',
    review: 'bg-purple-500/10 text-purple-700 border-purple-200',
    completed: 'bg-emerald-500/10 text-emerald-700 border-emerald-200',
  };

  const priorityColors = {
    low: 'bg-blue-500/10 text-blue-700 border-blue-200',
    medium: 'bg-yellow-500/10 text-yellow-700 border-yellow-200',
    high: 'bg-red-500/10 text-red-700 border-red-200',
    urgent: 'bg-red-600/10 text-red-700 border-red-200',
    critical: 'bg-red-700/10 text-red-800 border-red-200',
  };

  if (viewMode === 'grid') {
    return (
      <Card className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md hover:border-[#09203F]/20 transition-all cursor-pointer">
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex-1">{task.title}</h3>
            <Badge variant="outline" className={statusColors[task.status]}>
              {task.status}
            </Badge>
          </div>

          <p className="text-sm text-gray-500 mb-4">{task.description}</p>

          <div className="space-y-3 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Assignee</span>
              <span className="text-gray-900 font-medium">{task.assignee}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Department</span>
              <span className="text-gray-900 font-medium">{task.department}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Due Date</span>
              <span className="text-gray-900 font-medium">{task.dueDate}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Priority</span>
              <Badge variant="outline" className={priorityColors[task.priority]}>
                {task.priority}
              </Badge>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-200 last:border-0 hover:bg-gray-50 transition-colors">
      <div className="flex-1">
        <div className="flex items-center gap-3">
          <CheckSquare className="w-5 h-5 text-[#09203F] flex-shrink-0" />
          <div>
            <p className="font-medium text-gray-900">{task.title}</p>
            <p className="text-sm text-gray-500 mt-1">{task.description}</p>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4 ml-4">
        <Badge variant="outline" className={statusColors[task.status]}>
          {task.status}
        </Badge>
        <Badge variant="outline" className={priorityColors[task.priority]}>
          {task.priority}
        </Badge>
        <div className="w-32 text-right">
          <p className="text-sm text-gray-500">{task.assignee}</p>
        </div>
        <div className="w-24 text-right">
          <p className="text-sm text-gray-500">{task.dueDate}</p>
        </div>
      </div>
    </div>
  );
};

export default function TasksPage() {
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [priorityFilter, setPriorityFilter] = useState<string[]>([]);
  const [departmentFilter, setDepartmentFilter] = useState<string[]>([]);

  const statuses = useMemo(() => {
    return ['pending', 'in-progress', 'review', 'completed'];
  }, []);

  const priorities = useMemo(() => {
    return ['low', 'medium', 'high', 'urgent', 'critical'];
  }, []);

  const departments = useMemo(() => {
    return [...new Set(mockTasks.map((t) => t.department))];
  }, []);

  const filtered = useMemo(() => {
    return mockTasks.filter((task) => {
      const matchesSearch = task.title
        .toLowerCase()
        .includes(search.toLowerCase()) ||
        task.description
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesStatus =
        statusFilter.length === 0 || statusFilter.includes(task.status);
      const matchesPriority =
        priorityFilter.length === 0 || priorityFilter.includes(task.priority);
      const matchesDept =
        departmentFilter.length === 0 || departmentFilter.includes(task.department);

      return matchesSearch && matchesStatus && matchesPriority && matchesDept;
    });
  }, [search, statusFilter, priorityFilter, departmentFilter]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Tasks</h1>
          <p className="text-gray-500">
            Track and manage tasks across your organization.
          </p>
        </div>
        <Button className="bg-[#09203F] hover:bg-[#0a2651] text-white font-medium">
          <Plus className="w-4 h-4 mr-2" />
          Create Task
        </Button>
      </div>

      {/* Search and View Toggle */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#09203F]"
          />
        </div>

        <div className="flex gap-2 bg-white border border-gray-200 rounded-lg p-1">
          <Button
            size="sm"
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            onClick={() => setViewMode('list')}
            className={cn(
              'px-3',
              viewMode === 'list'
                ? 'bg-gray-100 text-gray-900'
                : 'bg-transparent text-gray-400 hover:text-gray-700'
            )}
          >
            <List className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant={viewMode === 'grid' ? 'default' : 'ghost'}
            onClick={() => setViewMode('grid')}
            className={cn(
              'px-3',
              viewMode === 'grid'
                ? 'bg-gray-100 text-gray-900'
                : 'bg-transparent text-gray-400 hover:text-gray-700'
            )}
          >
            <LayoutGrid className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Status
          </label>
          <div className="flex flex-wrap gap-2">
            {statuses.map((status) => (
              <Button
                key={status}
                size="sm"
                variant={statusFilter.includes(status) ? 'default' : 'outline'}
                onClick={() => {
                  setStatusFilter((prev) =>
                    prev.includes(status)
                      ? prev.filter((s) => s !== status)
                      : [...prev, status]
                  );
                }}
                className={cn(
                  statusFilter.includes(status)
                    ? 'bg-[#09203F] text-white'
                    : 'bg-white border-gray-200 text-gray-700 hover:border-[#09203F]/50'
                )}
              >
                {status}
              </Button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Priority
          </label>
          <div className="flex flex-wrap gap-2">
            {priorities.map((priority) => (
              <Button
                key={priority}
                size="sm"
                variant={priorityFilter.includes(priority) ? 'default' : 'outline'}
                onClick={() => {
                  setPriorityFilter((prev) =>
                    prev.includes(priority)
                      ? prev.filter((p) => p !== priority)
                      : [...prev, priority]
                  );
                }}
                className={cn(
                  priorityFilter.includes(priority)
                    ? 'bg-[#09203F] text-white'
                    : 'bg-white border-gray-200 text-gray-700 hover:border-[#09203F]/50'
                )}
              >
                {priority}
              </Button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Department
          </label>
          <div className="flex flex-wrap gap-2">
            {departments.map((dept) => (
              <Button
                key={dept}
                size="sm"
                variant={departmentFilter.includes(dept) ? 'default' : 'outline'}
                onClick={() => {
                  setDepartmentFilter((prev) =>
                    prev.includes(dept)
                      ? prev.filter((d) => d !== dept)
                      : [...prev, dept]
                  );
                }}
                className={cn(
                  departmentFilter.includes(dept)
                    ? 'bg-[#09203F] text-white'
                    : 'bg-white border-gray-200 text-gray-700 hover:border-[#09203F]/50'
                )}
              >
                {dept}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Tasks */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((task) => (
            <TaskCard key={task.id} task={task} viewMode="grid" />
          ))}
        </div>
      ) : (
        <Card className="bg-white border border-gray-200 rounded-xl shadow-sm">
          <div className="border-b border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900">
              All Tasks ({filtered.length})
            </h2>
          </div>
          <div>
            {filtered.map((task) => (
              <TaskCard key={task.id} task={task} viewMode="list" />
            ))}
          </div>
        </Card>
      )}

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <CheckSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-2">No tasks found</p>
          <p className="text-gray-400 text-sm">Try adjusting your filters or create a new task</p>
        </div>
      )}
    </div>
  );
}
