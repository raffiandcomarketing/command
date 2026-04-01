'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Avatar } from '@/components/ui/avatar';
import {
  Briefcase,
  Plus,
  DollarSign,
  Calendar,
  User,
  TrendingUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Mock deal data
const mockDeals = {
  lead: [
    {
      id: '1',
      title: 'Diamond Engagement Ring',
      contactName: 'Sarah Chen',
      value: 12500,
      expectedCloseDate: '2026-04-30',
      assignee: { name: 'Alex Johnson', avatar: 'AJ' },
    },
    {
      id: '2',
      title: 'Custom Wedding Set',
      contactName: 'Michael Park',
      value: 8200,
      expectedCloseDate: '2026-05-15',
      assignee: { name: 'Emma Wilson', avatar: 'EW' },
    },
    {
      id: '3',
      title: 'Anniversary Necklace',
      contactName: 'Lisa Wong',
      value: 3800,
      expectedCloseDate: '2026-04-20',
      assignee: { name: 'James Davis', avatar: 'JD' },
    },
    {
      id: '4',
      title: 'Luxury Watch Collection',
      contactName: 'David Kim',
      value: 45000,
      expectedCloseDate: '2026-06-10',
      assignee: { name: 'Sarah Mitchell', avatar: 'SM' },
    },
    {
      id: '5',
      title: 'Pearl Earring Set',
      contactName: 'Emma Johnson',
      value: 2100,
      expectedCloseDate: '2026-04-25',
      assignee: { name: 'Alex Johnson', avatar: 'AJ' },
    },
  ],
  opportunity: [
    {
      id: '6',
      title: 'Estate Jewellery Purchase',
      contactName: 'Robert Williams',
      value: 28000,
      expectedCloseDate: '2026-05-05',
      assignee: { name: 'Emma Wilson', avatar: 'EW' },
    },
    {
      id: '7',
      title: 'Corporate Gift Order',
      contactName: 'Jennifer Lee',
      value: 15500,
      expectedCloseDate: '2026-05-20',
      assignee: { name: 'James Davis', avatar: 'JD' },
    },
    {
      id: '8',
      title: 'Bridal Party Set',
      contactName: 'Amanda Torres',
      value: 6800,
      expectedCloseDate: '2026-06-01',
      assignee: { name: 'Sarah Mitchell', avatar: 'SM' },
    },
  ],
  sale: [
    {
      id: '9',
      title: 'Platinum Wedding Bands',
      contactName: 'James Morrison',
      value: 9200,
      expectedCloseDate: '2026-03-25',
      assignee: { name: 'Alex Johnson', avatar: 'AJ' },
    },
    {
      id: '10',
      title: 'Vintage Diamond Brooch',
      contactName: 'Catherine White',
      value: 18500,
      expectedCloseDate: '2026-03-30',
      assignee: { name: 'Emma Wilson', avatar: 'EW' },
    },
  ],
};

interface Deal {
  id: string;
  title: string;
  contactName: string;
  value: number;
  expectedCloseDate: string;
  assignee: { name: string; avatar: string };
}

interface NewDeal {
  title: string;
  contactName: string;
  value: string;
  stage: 'lead' | 'opportunity' | 'sale';
  expectedCloseDate: string;
}

const DealCard = ({ deal }: { deal: Deal }) => (
  <Card className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
    <div className="h-1 bg-gradient-to-r from-blue-500 to-blue-600" />
    <CardContent className="p-4 space-y-3">
      <div>
        <h3 className="font-semibold text-gray-900 text-sm">{deal.title}</h3>
        <p className="text-xs text-gray-500 mt-1">{deal.contactName}</p>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">Deal Value</span>
          <span className="font-semibold text-sm text-[#09203F]">
            ${deal.value.toLocaleString()}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">Close Date</span>
          <span className="text-xs text-gray-700">
            {new Date(deal.expectedCloseDate).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            })}
          </span>
        </div>
      </div>

      <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-[#09203F]/10 flex items-center justify-center text-xs font-medium text-[#09203F]">
            {deal.assignee.avatar}
          </div>
          <span className="text-xs text-gray-600">{deal.assignee.name}</span>
        </div>
      </div>
    </CardContent>
  </Card>
);

const KanbanColumn = ({
  title,
  deals,
  accentColor,
  borderColor,
}: {
  title: string;
  deals: Deal[];
  accentColor: string;
  borderColor: string;
}) => {
  const totalValue = deals.reduce((sum, deal) => sum + deal.value, 0);

  return (
    <div className="flex flex-col gap-4">
      <div className={cn('rounded-lg p-4 bg-gradient-to-br from-white to-gray-50', borderColor)}>
        <div className="flex items-center justify-between mb-2">
          <h2 className={cn('text-lg font-semibold text-gray-900 flex items-center gap-2')}>
            <div className={cn('w-2 h-2 rounded-full', accentColor)} />
            {title}
          </h2>
          <Badge className="bg-gray-200 text-gray-700">{deals.length}</Badge>
        </div>
        <div className="text-sm text-gray-600">
          Total: <span className="font-semibold text-[#09203F]">${totalValue.toLocaleString()}</span>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {deals.length > 0 ? (
          deals.map((deal) => <DealCard key={deal.id} deal={deal} />)
        ) : (
          <div className="text-center py-8 text-gray-400">
            <Briefcase className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No deals in this stage</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default function CRMPage() {
  const [isAddDealOpen, setIsAddDealOpen] = useState(false);
  const [newDeal, setNewDeal] = useState<NewDeal>({
    title: '',
    contactName: '',
    value: '',
    stage: 'lead',
    expectedCloseDate: '',
  });

  const handleAddDeal = () => {
    // For now, just show a success feedback
    console.log('New deal:', newDeal);
    setIsAddDealOpen(false);
    setNewDeal({
      title: '',
      contactName: '',
      value: '',
      stage: 'lead',
      expectedCloseDate: '',
    });
  };

  const totalLeadValue = mockDeals.lead.reduce((sum, deal) => sum + deal.value, 0);
  const totalOpportunityValue = mockDeals.opportunity.reduce((sum, deal) => sum + deal.value, 0);
  const totalSaleValue = mockDeals.sale.reduce((sum, deal) => sum + deal.value, 0);
  const totalPipelineValue = totalLeadValue + totalOpportunityValue + totalSaleValue;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">CRM</h1>
          <p className="text-gray-500">
            Manage your sales pipeline and customer relationships
          </p>
        </div>
        <Button
          onClick={() => setIsAddDealOpen(true)}
          className="bg-[#09203F] hover:bg-[#09203F]/90 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Deal
        </Button>
      </div>

      {/* Pipeline Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white border border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Pipeline</p>
                <p className="text-2xl font-bold text-[#09203F]">
                  ${totalPipelineValue.toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Leads</p>
                <p className="text-2xl font-bold text-blue-600">
                  ${totalLeadValue.toLocaleString()}
                </p>
              </div>
              <div className="w-2 h-8 rounded-full bg-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Opportunities</p>
                <p className="text-2xl font-bold text-amber-600">
                  ${totalOpportunityValue.toLocaleString()}
                </p>
              </div>
              <div className="w-2 h-8 rounded-full bg-amber-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Sales</p>
                <p className="text-2xl font-bold text-emerald-600">
                  ${totalSaleValue.toLocaleString()}
                </p>
              </div>
              <div className="w-2 h-8 rounded-full bg-emerald-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <KanbanColumn
          title="Lead"
          deals={mockDeals.lead}
          accentColor="bg-blue-500"
          borderColor="border border-blue-100"
        />
        <KanbanColumn
          title="Opportunity"
          deals={mockDeals.opportunity}
          accentColor="bg-amber-500"
          borderColor="border border-amber-100"
        />
        <KanbanColumn
          title="Sale"
          deals={mockDeals.sale}
          accentColor="bg-emerald-500"
          borderColor="border border-emerald-100"
        />
      </div>

      {/* Add Deal Modal */}
      <Modal
        open={isAddDealOpen}
        onOpenChange={setIsAddDealOpen}
        title="Add New Deal"
        description="Create a new sales opportunity"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">
              Deal Title
            </label>
            <Input
              placeholder="e.g., Diamond Engagement Ring"
              value={newDeal.title}
              onChange={(e) =>
                setNewDeal({ ...newDeal, title: e.target.value })
              }
              className="w-full"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">
              Contact Name
            </label>
            <Input
              placeholder="e.g., Sarah Chen"
              value={newDeal.contactName}
              onChange={(e) =>
                setNewDeal({ ...newDeal, contactName: e.target.value })
              }
              className="w-full"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">
              Deal Value ($)
            </label>
            <Input
              type="number"
              placeholder="0.00"
              value={newDeal.value}
              onChange={(e) =>
                setNewDeal({ ...newDeal, value: e.target.value })
              }
              className="w-full"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">
              Stage
            </label>
            <select
              value={newDeal.stage}
              onChange={(e) =>
                setNewDeal({
                  ...newDeal,
                  stage: e.target.value as 'lead' | 'opportunity' | 'sale',
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#09203F]/20"
            >
              <option value="lead">Lead</option>
              <option value="opportunity">Opportunity</option>
              <option value="sale">Sale</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">
              Expected Close Date
            </label>
            <Input
              type="date"
              value={newDeal.expectedCloseDate}
              onChange={(e) =>
                setNewDeal({ ...newDeal, expectedCloseDate: e.target.value })
              }
              className="w-full"
            />
          </div>

          <div className="flex gap-3 pt-6">
            <Button
              onClick={handleAddDeal}
              className="flex-1 bg-[#09203F] hover:bg-[#09203F]/90 text-white"
            >
              Create Deal
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsAddDealOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
