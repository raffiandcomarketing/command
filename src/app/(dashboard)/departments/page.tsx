'use client';

import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getAllDepartments } from '@/config/departments';
import {
  Search,
  Users,
  GitBranch,
  ArrowRight,
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
  Users: Users,
  GitBranch,
};

// Mock data for department stats
const departmentStats: Record<string, { teamMembers: number; workflows: number }> = {
  'executive-leadership': { teamMembers: 8, workflows: 12 },
  marketing: { teamMembers: 24, workflows: 18 },
  ecommerce: { teamMembers: 16, workflows: 14 },
  'retail-operations': { teamMembers: 42, workflows: 22 },
  sales: { teamMembers: 32, workflows: 16 },
  'client-experience': { teamMembers: 20, workflows: 15 },
  'inventory-merchandising': { teamMembers: 28, workflows: 19 },
  'repairs-service': { teamMembers: 18, workflows: 11 },
  'purchasing-procurement': { teamMembers: 12, workflows: 13 },
  'finance-accounting': { teamMembers: 14, workflows: 10 },
  'human-resources': { teamMembers: 10, workflows: 14 },
  'it-systems': { teamMembers: 16, workflows: 17 },
  'logistics-shipping': { teamMembers: 26, workflows: 15 },
  'events-activations': { teamMembers: 14, workflows: 12 },
  'visual-merchandising': { teamMembers: 12, workflows: 11 },
  'customer-care': { teamMembers: 22, workflows: 13 },
  'legal-compliance': { teamMembers: 8, workflows: 9 },
  'facilities-maintenance': { teamMembers: 20, workflows: 14 },
};

export default function DepartmentsPage() {
  const departments = getAllDepartments();
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    return departments.filter((dept) =>
      dept.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  const DepartmentCard = ({ dept }: { dept: (typeof departments)[0] }) => {
    const stats = departmentStats[dept.slug];
    const Icon = iconMap[dept.icon] || Users;

    return (
      <Card className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md hover:border-[#09203F]/20 transition-all group cursor-pointer">
        <div className="p-6 h-full flex flex-col">
          <div className="flex items-start justify-between mb-4">
            <div
              className="p-3 rounded-lg"
              style={{ backgroundColor: dept.color + '15' }}
            >
              <Icon className="w-6 h-6" style={{ color: dept.color }} />
            </div>
            <Badge className="bg-gray-100 text-gray-700 border-gray-200">
              {stats.teamMembers} team
            </Badge>
          </div>

          <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-[#09203F] transition-colors">
            {dept.name}
          </h3>
          <p className="text-sm text-gray-500 mb-6 flex-1">{dept.description}</p>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Team Members
              </span>
              <span className="font-medium text-gray-900">{stats.teamMembers}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500 flex items-center gap-2">
                <GitBranch className="w-4 h-4" />
                Active Workflows
              </span>
              <span className="font-medium text-gray-900">{stats.workflows}</span>
            </div>

            <Button
              variant="ghost"
              className={cn(
                'w-full mt-4 group/btn',
                'bg-gray-50 hover:bg-gray-100 text-gray-900 border border-gray-200'
              )}
              asChild
            >
              <a href={`/departments/${dept.slug}`}>
                View Department
                <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
              </a>
            </Button>
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Departments</h1>
        <p className="text-gray-500">
          Manage and oversee all {departments.length} departments across your organization.
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search departments..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#09203F]"
        />
      </div>

      {/* Departments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((dept) => (
          <DepartmentCard key={dept.slug} dept={dept} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-2">No departments found</p>
          <p className="text-gray-400 text-sm">Try adjusting your search criteria</p>
        </div>
      )}
    </div>
  );
}
