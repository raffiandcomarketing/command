'use client';

import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Filter, Download, Calendar, } from 'lucide-react';
import { cn } from '@/lib/utils';

// Mock KPI data
const mockKpis = [
  { id: '1', name: 'Website Traffic', unit: 'visits', value: 45230, target: 50000, department: 'Marketing', trend: 'up', trendPercent: 12, period: 'Monthly', status: 'healthy', },
  { id: '2', name: 'Conversion Rate', unit: '%', value: 3.2, target: 4.0, department: 'Ecommerce', trend: 'up', trendPercent: 5, period: 'Monthly', status: 'warning', },
  { id: '3', name: 'Email Open Rate', unit: '%', value: 24.5, target: 28.0, department: 'Marketing', trend: 'down', trendPercent: -2, period: 'Monthly', status: 'warning', },
  { id: '4', name: 'Customer Satisfaction', unit: 'NPS', value: 72, target: 80, department: 'Client Experience', trend: 'up', trendPercent: 8, period: 'Monthly', status: 'healthy', },
  { id: '5', name: 'Average Order Value', unit: '$', value: 485, target: 500, department: 'Sales', trend: 'up', trendPercent: 3, period: 'Monthly', status: 'healthy', },
  { id: '6', name: 'Inventory Turnover', unit: 'rate', value: 6.2, target: 8.0, department: 'Inventory', trend: 'down', trendPercent: -4, period: 'Quarterly', status: 'warning', },
  { id: '7', name: 'Task Completion Rate', unit: '%', value: 92, target: 95, department: 'Operations', trend: 'stable', trendPercent: 0, period: 'Weekly', status: 'healthy', },
  { id: '8', name: 'Approval Time (avg)', unit: 'hours', value: 4.5, target: 2.0, department: 'Finance', trend: 'up', trendPercent: -15, period: 'Monthly', status: 'critical', },
  { id: '9', name: 'Cost per Acquisition', unit: '$', value: 42, target: 35, department: 'Marketing', trend: 'down', trendPercent: -8, period: 'Monthly', status: 'warning', },
  { id: '10', name: 'Employee Productivity', unit: 'tasks/day', value: 7.3, target: 8.0, department: 'Operations', trend: 'up', trendPercent: 6, period: 'Weekly', status: 'healthy', },
  { id: '11', name: 'Return Rate', unit: '%', value: 2.1, target: 1.5, department: 'Customer Care', trend: 'down', trendPercent: -3, period: 'Monthly', status: 'warning', },
  { id: '12', name: 'Repair Satisfaction', unit: '%', value: 94, target: 95, department: 'Repairs/Service', trend: 'up', trendPercent: 2, period: 'Monthly', status: 'healthy', },
];

const KpiGaugeCard = ({ kpi }: { kpi: (typeof mockKpis)[0] }) => {
  const percentage = (kpi.value / kpi.target) * 100;

  return (
    <Card className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md hover:border-[#09203F]/20 transition-all">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{kpi.name}</h3>
            <p className="text-sm text-gray-500 mt-1">{kpi.department}</p>
          </div>
          <Badge
            className={cn(
              'text-xs font-medium',
              kpi.status === 'healthy' && 'bg-emerald-500/10 text-emerald-700 border-emerald-200',
              kpi.status === 'warning' && 'bg-yellow-500/10 text-yellow-700 border-yellow-200',
              kpi.status === 'critical' && 'bg-red-500/10 text-red-700 border-red-200'
            )}
            variant="outline"
          >
            {kpi.status}
          </Badge>
        </div>

        {/* Gauge/Progress */}
        <div className="space-y-4">
          <div>
            <div className="w-full bg-gray-200 h-3 rounded-full overflow-hidden">
              <div
                className="bg-[#09203F] h-full transition-all"
                style={{ width: `${Math.min(percentage, 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>0</span>
              <span>{kpi.value}</span>
              <span>{kpi.target} (target)</span>
            </div>
          </div>

          {/* Values */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
            <div>
              <p className="text-xs text-gray-500 mb-1">Current</p>
              <p className="text-lg font-bold text-gray-900">
                {kpi.value}
                <span className="text-xs text-gray-400 ml-1">{kpi.unit}</span>
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Target</p>
              <p className="text-lg font-bold text-gray-900">
                {kpi.target}
                <span className="text-xs text-gray-400 ml-1">{kpi.unit}</span>
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Trend</p>
              <div className="flex items-center gap-1">
                {kpi.trend === 'up' && (
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                )}
                {kpi.trend === 'down' && (
                  <TrendingDown className="w-4 h-4 text-red-600" />
                )}
                <span
                  className={cn(
                    'text-sm font-bold',
                    (kpi.trend === 'up' || kpi.trendPercent === 0) && 'text-emerald-600',
                    kpi.trend === 'down' && kpi.trendPercent < 0 && 'text-red-600'
                  )}
                >
                  {kpi.trend === 'stable' ? '—' : `${kpi.trendPercent > 0 ? '+' : ''}${kpi.trendPercent}%`}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500">{kpi.period} Report</p>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default function KpisPage() {
  const [selectedDept, setSelectedDept] = useState('All');

  const departments = useMemo(() => {
    const depts = mockKpis.map((k) => k.department);
    return ['All', ...new Set(depts)];
  }, []);

  const filtered = useMemo(() => {
    return mockKpis.filter((kpi) => {
      return selectedDept === 'All' || kpi.department === selectedDept;
    });
  }, [selectedDept]);

  const stats = useMemo(() => {
    return {
      healthy: filtered.filter((k) => k.status === 'healthy').length,
      warning: filtered.filter((k) => k.status === 'warning').length,
      critical: filtered.filter((k) => k.status === 'critical').length,
    };
  }, [filtered]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">KPIs & Reports</h1>
          <p className="text-gray-500">
            Monitor key performance indicators across your organization.
          </p>
        </div>
        <Button variant="outline" className="bg-white border-gray-200 text-gray-900">
          <Download className="w-4 h-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-white border border-gray-200 rounded-xl shadow-sm">
          <div className="p-6">
            <p className="text-gray-500 text-sm font-medium mb-2">Total KPIs</p>
            <p className="text-3xl font-bold text-gray-900">{filtered.length}</p>
          </div>
        </Card>
        <Card className="bg-white border border-gray-200 rounded-xl shadow-sm">
          <div className="p-6">
            <p className="text-gray-500 text-sm font-medium mb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Healthy
            </p>
            <p className="text-3xl font-bold text-emerald-600">{stats.healthy}</p>
          </div>
        </Card>
        <Card className="bg-white border border-gray-200 rounded-xl shadow-sm">
          <div className="p-6">
            <p className="text-gray-500 text-sm font-medium mb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-yellow-500" />
              Warning
            </p>
            <p className="text-3xl font-bold text-yellow-600">{stats.warning}</p>
          </div>
        </Card>
        <Card className="bg-white border border-gray-200 rounded-xl shadow-sm">
          <div className="p-6">
            <p className="text-gray-500 text-sm font-medium mb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              Critical
            </p>
            <p className="text-3xl font-bold text-red-600">{stats.critical}</p>
          </div>
        </Card>
      </div>

      {/* Department Filter */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Filter className="w-5 h-5 text-gray-500" />
          <p className="text-sm font-medium text-gray-700">Filter by Department</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {departments.map((dept) => (
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

      {/* KPIs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((kpi) => (
          <KpiGaugeCard key={kpi.id} kpi={kpi} />
        ))}
      </div>

      {/* Reports Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-[#09203F]" />
          Recent Reports
        </h2>
        <Card className="bg-white border border-gray-200 rounded-xl shadow-sm">
          <div className="divide-y divide-gray-200">
            {[
              { id: '1', name: 'March 2026 Performance Review', date: '2026-03-31', status: 'Complete', },
              { id: '2', name: 'Q1 2026 Executive Summary', date: '2026-03-31', status: 'Complete', },
              { id: '3', name: 'Department KPI Analysis', date: '2026-03-28', status: 'Complete', },
              { id: '4', name: 'Weekly Performance Digest', date: '2026-03-25', status: 'Complete', },
            ].map((report) => (
              <div
                key={report.id}
                className="flex items-center justify-between p-6 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <div>
                  <p className="font-medium text-gray-900">{report.name}</p>
                  <p className="text-sm text-gray-500 mt-1">{report.date}</p>
                </div>
                <Button
                  size="sm"
                  className="bg-gray-50 hover:bg-gray-100 text-gray-900"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
