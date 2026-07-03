'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/toast';
import { api } from '@/lib/client/api';
import { Briefcase, Plus, TrendingUp, AlertCircle, ArrowRight, ArrowLeft, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type Stage = 'LEAD' | 'OPPORTUNITY' | 'SALE';

interface Deal {
  id: string;
  title: string;
  value: number;
  stage: Stage;
  notes: string | null;
  expectedCloseDate: string | null;
  contact: { id: string; name: string } | null;
  assignee: { id: string; name: string; avatar: string | null } | null;
}

const STAGES: Stage[] = ['LEAD', 'OPPORTUNITY', 'SALE'];
const STAGE_META: Record<Stage, { title: string; accent: string; border: string }> = {
  LEAD: { title: 'Lead', accent: 'bg-blue-500', border: 'border border-blue-100' },
  OPPORTUNITY: { title: 'Opportunity', accent: 'bg-amber-500', border: 'border border-amber-100' },
  SALE: { title: 'Sale', accent: 'bg-emerald-500', border: 'border border-emerald-100' },
};

const initials = (name?: string | null) =>
  (name ?? '?')
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

interface DealForm {
  id?: string;
  title: string;
  contactName: string;
  value: string;
  stage: Stage;
  expectedCloseDate: string;
  notes: string;
}

const emptyForm: DealForm = { title: '', contactName: '', value: '', stage: 'LEAD', expectedCloseDate: '', notes: '' };

export default function CRMPage() {
  const toast = useToast();
  const [deals, setDeals] = useState<Deal[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<DealForm>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [busyDealId, setBusyDealId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoadError(null);
      const res = await api<{ deals: Deal[] }>('/api/crm/deals?pageSize=100');
      setDeals(res.deals);
    } catch (e) {
      setLoadError((e as Error).message);
      setDeals([]);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const byStage = useMemo(() => {
    const groups: Record<Stage, Deal[]> = { LEAD: [], OPPORTUNITY: [], SALE: [] };
    for (const d of deals ?? []) groups[d.stage]?.push(d);
    return groups;
  }, [deals]);

  const totals = useMemo(() => {
    const t: Record<Stage, number> = { LEAD: 0, OPPORTUNITY: 0, SALE: 0 };
    for (const s of STAGES) t[s] = byStage[s].reduce((sum, d) => sum + d.value, 0);
    return t;
  }, [byStage]);

  const openCreate = () => {
    setForm(emptyForm);
    setFormError(null);
    setModalOpen(true);
  };

  const openEdit = (deal: Deal) => {
    setForm({
      id: deal.id,
      title: deal.title,
      contactName: deal.contact?.name ?? '',
      value: String(deal.value),
      stage: deal.stage,
      expectedCloseDate: deal.expectedCloseDate ? deal.expectedCloseDate.slice(0, 10) : '',
      notes: deal.notes ?? '',
    });
    setFormError(null);
    setModalOpen(true);
  };

  const submit = async () => {
    if (!form.title.trim()) {
      setFormError('Deal title is required');
      return;
    }
    if (!form.id && !form.contactName.trim()) {
      setFormError('Contact name is required');
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      if (form.id) {
        await api(`/api/crm/deals/${form.id}`, {
          method: 'PATCH',
          body: JSON.stringify({
            title: form.title.trim(),
            value: form.value ? Number(form.value) : 0,
            stage: form.stage,
            expectedCloseDate: form.expectedCloseDate || null,
            notes: form.notes.trim() || null,
          }),
        });
        toast.success('Deal updated');
      } else {
        await api('/api/crm/deals', {
          method: 'POST',
          body: JSON.stringify({
            title: form.title.trim(),
            contactName: form.contactName.trim(),
            value: form.value ? Number(form.value) : 0,
            stage: form.stage,
            expectedCloseDate: form.expectedCloseDate || undefined,
            notes: form.notes.trim() || undefined,
          }),
        });
        toast.success('Deal created');
      }
      setModalOpen(false);
      void load();
    } catch (e) {
      setFormError((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const moveStage = async (deal: Deal, direction: 1 | -1) => {
    const idx = STAGES.indexOf(deal.stage) + direction;
    if (idx < 0 || idx >= STAGES.length) return;
    const target = STAGES[idx];
    setBusyDealId(deal.id);
    try {
      await api(`/api/crm/deals/${deal.id}`, { method: 'PATCH', body: JSON.stringify({ stage: target }) });
      toast.success(`Moved "${deal.title}" to ${STAGE_META[target].title}`);
      void load();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusyDealId(null);
    }
  };

  const remove = async (deal: Deal) => {
    if (!window.confirm(`Delete deal "${deal.title}"?`)) return;
    setBusyDealId(deal.id);
    try {
      await api(`/api/crm/deals/${deal.id}`, { method: 'DELETE' });
      toast.success('Deal deleted');
      void load();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusyDealId(null);
    }
  };

  const DealCard = ({ deal }: { deal: Deal }) => (
    <Card className="bg-white border border-stone-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
      <div className={cn('h-1 bg-gradient-to-r', deal.stage === 'LEAD' && 'from-blue-500 to-blue-600', deal.stage === 'OPPORTUNITY' && 'from-amber-500 to-amber-600', deal.stage === 'SALE' && 'from-emerald-500 to-emerald-600')} />
      <CardContent className="p-4 space-y-3">
        <div className="cursor-pointer" onClick={() => openEdit(deal)}>
          <h3 className="font-semibold text-stone-900 text-sm">{deal.title}</h3>
          <p className="text-xs text-stone-500 mt-1">{deal.contact?.name ?? 'No contact'}</p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-stone-500">Deal Value</span>
            <span className="font-semibold text-sm text-[#09203F]">${deal.value.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-stone-500">Close Date</span>
            <span className="text-xs text-stone-700">
              {deal.expectedCloseDate
                ? new Date(deal.expectedCloseDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                : '—'}
            </span>
          </div>
        </div>

        <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-6 h-6 rounded-full bg-[#09203F]/10 flex items-center justify-center text-xs font-medium text-[#09203F] flex-shrink-0">
              {initials(deal.assignee?.name)}
            </div>
            <span className="text-xs text-stone-600 truncate">{deal.assignee?.name ?? 'Unassigned'}</span>
          </div>
          <div className="flex items-center gap-0.5 flex-shrink-0">
            <button
              title="Move back"
              disabled={deal.stage === 'LEAD' || busyDealId === deal.id}
              onClick={() => void moveStage(deal, -1)}
              className="p-1.5 rounded text-stone-400 hover:text-[#09203F] hover:bg-stone-100 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
            <button
              title="Move forward"
              disabled={deal.stage === 'SALE' || busyDealId === deal.id}
              onClick={() => void moveStage(deal, 1)}
              className="p-1.5 rounded text-stone-400 hover:text-[#09203F] hover:bg-stone-100 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              title="Delete deal"
              disabled={busyDealId === deal.id}
              onClick={() => void remove(deal)}
              className="p-1.5 rounded text-stone-400 hover:text-red-600 hover:bg-red-50 disabled:opacity-30"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const totalPipelineValue = totals.LEAD + totals.OPPORTUNITY + totals.SALE;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-semibold text-stone-900 mb-2">CRM</h1>
          <p className="text-stone-500">Manage your sales pipeline and customer relationships</p>
        </div>
        <Button onClick={openCreate} className="bg-[#0A2245] hover:bg-[#0E2C55] shadow-luxe text-white">
          <Plus className="w-4 h-4 mr-2" />
          Add Deal
        </Button>
      </div>

      {loadError && (
        <Card className="border-red-200 bg-red-50 p-6 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-800">Could not load deals</p>
            <p className="text-xs text-red-600 mt-0.5">{loadError}</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => void load()}>
            Retry
          </Button>
        </Card>
      )}

      {/* Pipeline Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white border border-stone-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-stone-500 mb-1">Total Pipeline</p>
                <p className="text-2xl font-bold text-[#09203F]">${totalPipelineValue.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        {STAGES.map((s) => (
          <Card key={s} className="bg-white border border-stone-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-stone-500 mb-1">{STAGE_META[s].title}s</p>
                  <p
                    className={cn(
                      'text-2xl font-bold',
                      s === 'LEAD' && 'text-blue-600',
                      s === 'OPPORTUNITY' && 'text-amber-600',
                      s === 'SALE' && 'text-emerald-600'
                    )}
                  >
                    ${totals[s].toLocaleString()}
                  </p>
                </div>
                <div className={cn('w-2 h-8 rounded-full', STAGE_META[s].accent)} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Kanban Board */}
      {deals === null && !loadError ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-20 rounded-lg" />
              <Skeleton className="h-36 rounded-lg" />
              <Skeleton className="h-36 rounded-lg" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {STAGES.map((stage) => (
            <div key={stage} className="flex flex-col gap-4">
              <div className={cn('rounded-lg p-4 bg-gradient-to-br from-white to-stone-50', STAGE_META[stage].border)}>
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-lg font-semibold text-stone-900 flex items-center gap-2">
                    <div className={cn('w-2 h-2 rounded-full', STAGE_META[stage].accent)} />
                    {STAGE_META[stage].title}
                  </h2>
                  <Badge className="bg-stone-200 text-stone-700">{byStage[stage].length}</Badge>
                </div>
                <div className="text-sm text-stone-600">
                  Total: <span className="font-semibold text-[#09203F]">${totals[stage].toLocaleString()}</span>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                {byStage[stage].length > 0 ? (
                  byStage[stage].map((deal) => <DealCard key={deal.id} deal={deal} />)
                ) : (
                  <div className="text-center py-8 text-stone-400">
                    <Briefcase className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No deals in this stage</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Deal Modal */}
      <Modal
        open={modalOpen}
        onOpenChange={(open) => {
          setModalOpen(open);
          if (!open) setFormError(null);
        }}
        title={form.id ? 'Edit Deal' : 'Add New Deal'}
        description={form.id ? undefined : 'Create a new sales opportunity'}
        size="md"
      >
        <div className="space-y-4">
          {formError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <span className="text-sm font-medium text-red-800">{formError}</span>
            </div>
          )}

          <Input
            label="Deal Title *"
            placeholder="e.g., Diamond Engagement Ring"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />

          {!form.id && (
            <Input
              label="Contact Name *"
              placeholder="e.g., Sarah Chen"
              value={form.contactName}
              onChange={(e) => setForm({ ...form, contactName: e.target.value })}
            />
          )}

          <Input
            label="Deal Value ($)"
            type="number"
            min="0"
            placeholder="0.00"
            value={form.value}
            onChange={(e) => setForm({ ...form, value: e.target.value })}
          />

          <Select
            label="Stage"
            value={form.stage}
            onChange={(e) => setForm({ ...form, stage: e.target.value as Stage })}
            options={STAGES.map((s) => ({ value: s, label: STAGE_META[s].title }))}
          />

          <Input
            label="Expected Close Date"
            type="date"
            value={form.expectedCloseDate}
            onChange={(e) => setForm({ ...form, expectedCloseDate: e.target.value })}
          />

          <div>
            <label className="text-sm font-medium text-stone-700 block mb-2">Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="w-full px-3 py-2 border border-stone-300 rounded-lg min-h-20 resize-none focus:outline-none focus:ring-2 focus:ring-[#09203F]/20"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button onClick={submit} loading={saving} className="flex-1 bg-[#0A2245] hover:bg-[#0E2C55] shadow-luxe text-white">
              {form.id ? 'Save Changes' : 'Create Deal'}
            </Button>
            <Button variant="outline" onClick={() => setModalOpen(false)} disabled={saving} className="flex-1">
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
