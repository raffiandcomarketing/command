'use client';

import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  FileCheck,
  ThumbsUp,
  ThumbsDown,
  Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Mock approval data
const mockApprovals = [
  {
    id: '1',
    title: 'Budget Increase Request - Digital Advertising',
    type: 'Purchase',
    requester: 'Sarah Mitchell',
    department: 'Marketing',
    priority: 'high',
    submitted: '2026-03-30',
    amount: '$25,000',
    description: 'Request for Q2 digital advertising budget increase due to campaign performance',
    status: 'pending',
  },
  {
    id: '2',
    title: 'New Hire Onboarding - Marketing Coordinator',
    type: 'Access',
    requester: 'James Wilson',
    department: 'Human Resources',
    priority: 'medium',
    submitted: '2026-03-29',
    description: 'Approve onboarding access and permissions for new Marketing Coordinator position',
    status: 'pending',
  },
  {
    id: '3',
    title: 'Expense Reimbursement - Trade Show',
    type: 'Expense',
    requester: 'Elena Rodriguez',
    department: 'Events/Activations',
    priority: 'medium',
    submitted: '2026-03-28',
    amount: '$3,500',
    description: 'Reimbursement for luxury trade show booth and promotional materials',
    status: 'pending',
  },
  {
    id: '4',
    title: 'Conference Attendance Approval',
    type: 'General',
    requester: 'Yuki Tanaka',
    department: 'Marketing',
    priority: 'low',
    submitted: '2026-03-25',
    description: 'Approval for Q2 digital marketing conference attendance',
    status: 'approved',
  },
  {
    id: '5',
    title: 'Vendor Contract Update',
    type: 'Document',
    requester: 'Marcus Chen',
    department: 'Purchasing/Procurement',
    priority: 'high',
    submitted: '2026-03-27',
    description: 'Updated contract terms with primary luxury goods supplier',
    status: 'pending',
  },
  {
    id: '6',
    title: 'System Access - New Department',
    type: 'Access',
    requester: 'David Zhang',
    department: 'IT Systems',
    priority: 'medium',
    submitted: '2026-03-26',
    description: 'Grant administrative access to new department systems',
    status: 'approved',
  },
  {
    id: '7',
    title: 'Workflow Authorization Request',
    type: 'Workflow',
    requester: 'Patricia White',
    department: 'Logistics/Shipping',
    priority: 'high',
    submitted: '2026-03-24',
    description: 'Authorization for automated purchase orders above $10,000',
    status: 'rejected',
  },
  {
    id: '8',
    title: 'Leave Request - 2 Weeks',
    type: 'Leave',
    requester: 'Lisa Anderson',
    department: 'Human Resources',
    priority: 'medium',
    submitted: '2026-03-23',
    description: 'Vacation leave request for summer holiday period',
    status: 'approved',
  },
  {
    id: '9',
    title: 'Procurement Order - Store Fixtures',
    type: 'Purchase',
    requester: 'Maria Garcia',
    department: 'Visual Merchandising',
    priority: 'high',
    submitted: '2026-03-22',
    amount: '$45,000',
    description: 'Luxury display fixtures for flagship store renovation',
    status: 'pending',
  },
  {
    id: '10',
    title: 'Data Access Request',
    type: 'Access',
    requester: 'Thomas Mitchell',
    department: 'Customer Care',
    priority: 'medium',
    submitted: '2026-03-21',
    description: 'Request for customer analytics database access',
    status: 'approved',
  },
];

const ApprovalCard = ({ approval }: { approval: (typeof mockApprovals)[0] }) => {
  const typeColors = {
    Purchase: 'bg-emerald-500/10 text-emerald-700 border-emerald-200',
    Expense: 'bg-blue-500/10 text-blue-700 border-blue-200',
    Leave: 'bg-purple-500/10 text-purple-700 border-purple-200',
    Workflow: 'bg-yellow-500/10 text-yellow-700 border-yellow-200',
    Document: 'bg-pink-500/10 text-pink-700 border-pink-200',
    Access: 'bg-orange-500/10 text-orange-700 border-orange-200',
    General: 'bg-gray-500/10 text-gray-700 border-gray-200',
  };

  const priorityColors = {
    low: 'bg-blue-500/10 text-blue-700 border-blue-200',
    medium: 'bg-yellow-500/10 text-yellow-700 border-yellow-200',
    high: 'bg-red-500/10 text-red-700 border-red-200',
  };

  const statusColors = {
    pending: 'bg-gray-500/10 text-gray-700 border-gray-200',
    approved: 'bg-emerald-500/10 text-emerald-700 border-emerald-200',
    rejected: 'bg-red-500/10 text-red-700 border-red-200',
  };

  return (
    <Card className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md hover:border-[#09203F]/20 transition-all">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{approval.title}</h3>
            <p className="text-sm text-gray-500">{approval.description}</p>
          </div>
          <Badge variant="outline" className={statusColors[approval.status]}>
            {approval.status}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 mt-4">
          <div>
            <p className="text-xs text-gray-500 mb-1">Requester</p>
            <p className="text-sm font-medium text-gray-900">{approval.requester}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Department</p>
            <p className="text-sm font-medium text-gray-900">{approval.department}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Type</p>
            <Badge variant="outline" className={typeColors[approval.type]}>
              {approval.type}
            </Badge>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Priority</p>
            <Badge variant="outline" className={priorityColors[approval.priority]}>
              {approval.priority}
            </Badge>
          </div>
        </div>

        {approval.amount && (
          <div className="pt-4 border-t border-gray-200 mt-4">
            <p className="text-sm text-[#09203F] font-semibold">{approval.amount}</p>
          </div>
        )}

        {approval.status === 'pending' && (
          <div className="flex gap-3 pt-4 border-t border-gray-200 mt-4">
            <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white">
              <ThumbsUp className="w-4 h-4 mr-2" />
              Approve
            </Button>
            <Button
              variant="outline"
              className="flex-1 bg-red-500/10 text-red-700 border-red-200 hover:bg-red-500/20"
            >
              <ThumbsDown className="w-4 h-4 mr-2" />
              Reject
            </Button>
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-gray-200 mt-4 text-xs text-gray-500">
          <span>Submitted {approval.submitted}</span>
          <span>{approval.status}</span>
        </div>
      </div>
    </Card>
  );
};

export default function ApprovalsPage() {
  const [activeTab, setActiveTab] = useState('pending');

  const pendingCount = useMemo(() => {
    return mockApprovals.filter((a) => a.status === 'pending').length;
  }, []);

  const approvedCount = useMemo(() => {
    return mockApprovals.filter((a) => a.status === 'approved').length;
  }, []);

  const rejectedCount = useMemo(() => {
    return mockApprovals.filter((a) => a.status === 'rejected').length;
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Approvals</h1>
        <p className="text-gray-500">
          Review and manage approval requests across your organization.
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-white border-b border-gray-200 w-full justify-start rounded-none p-0 h-auto">
          <TabsTrigger
            value="pending"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#09203F] data-[state=active]:bg-transparent flex items-center gap-2"
          >
            Pending
            <Badge className="bg-[#09203F] text-white rounded-full ml-1">
              {pendingCount}
            </Badge>
          </TabsTrigger>
          <TabsTrigger
            value="approved"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#09203F] data-[state=active]:bg-transparent"
          >
            Approved
          </TabsTrigger>
          <TabsTrigger
            value="rejected"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#09203F] data-[state=active]:bg-transparent"
          >
            Rejected
          </TabsTrigger>
          <TabsTrigger
            value="all"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#09203F] data-[state=active]:bg-transparent"
          >
            All
          </TabsTrigger>
        </TabsList>

        {/* Pending Tab */}
        <TabsContent value="pending" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {mockApprovals
              .filter((a) => a.status === 'pending')
              .map((approval) => (
                <ApprovalCard key={approval.id} approval={approval} />
              ))}
          </div>

          {mockApprovals.filter((a) => a.status === 'pending').length === 0 && (
            <div className="text-center py-12">
              <FileCheck className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No pending approvals</p>
            </div>
          )}
        </TabsContent>

        {/* Approved Tab */}
        <TabsContent value="approved" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {mockApprovals
              .filter((a) => a.status === 'approved')
              .map((approval) => (
                <ApprovalCard key={approval.id} approval={approval} />
              ))}
          </div>

          {mockApprovals.filter((a) => a.status === 'approved').length === 0 && (
            <div className="text-center py-12">
              <ThumbsUp className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No approved items</p>
            </div>
          )}
        </TabsContent>

        {/* Rejected Tab */}
        <TabsContent value="rejected" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {mockApprovals
              .filter((a) => a.status === 'rejected')
              .map((approval) => (
                <ApprovalCard key={approval.id} approval={approval} />
              ))}
          </div>

          {mockApprovals.filter((a) => a.status === 'rejected').length === 0 && (
            <div className="text-center py-12">
              <ThumbsDown className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No rejected items</p>
            </div>
          )}
        </TabsContent>

        {/* All Tab */}
        <TabsContent value="all" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {mockApprovals.map((approval) => (
              <ApprovalCard key={approval.id} approval={approval} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
