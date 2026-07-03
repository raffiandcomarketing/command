'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/toast';
import { api } from '@/lib/client/api';
import { GitBranch, Plus, Play, Power, AlertCircle, Trash2, X, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Workflow {
  id: string;
  name: string;
  description: string | null;
  triggerType: string;
  steps: Array<{ name: string; type: string; config: Record<string, unknown> }>;
  isActive: boolean;
  isTemplate: boolean;
  department: { id: string; name: string } | null;
  _count: { workflowInstances: number };
}

type StepType = 'TASK' | 'APPROVAL' | 'NOTIFICATION';

interface StepDraft {
  name: string;
  type: StepType;
}

const stepBadge: Record<string, string> = {
  TASK: 'bg-blue-500/10 text-blue-700 border-blue-200',
  APPROVAL: 'bg-purple-500/10 text-purple-700 border-purple-200',
  NOTIFICATION: 'bg-emerald-500/10 text-emerald-700 border-emerald-200',
  WEBHOOK: 'bg-stone-500/10 text-stone-600 border-stone-200',
  CONDITION: 'bg-stone-500/10 text-stone-600 border-stone-200',
  DELAY: 'bg-stone-500/10 text-stone-600 border-stone-200',
  INTEGRATION: 'bg-stone-500/10 text-stone-600 border-stone-200',
};

export default function WorkflowsPage() {
  const { data: session } = useSession();
  const toast = useToast();

  const [tab, setTab] = useState<'workflows' | 'templates'>('workflows');
  const [workflows, setWorkflows] = useState<Workflow[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });
  const [steps, setSteps] = useState<StepDraft[]>([{ name: '', type: 'TASK' }]);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const elevated = ['ADMIN', 'EXECUTIVE', 'MANAGER'].includes(session?.user?.role ?? '');

  const load = useCallback(async () => {
    try {
      setLoadError(null);
      const res = await api<{ workflows: Workflow[] }>(`/api/workflows?templates=${tab === 'templates'}`);
      setWorkflows(res.workflows);
    } catch (e) {
      setLoadError((e as Error).message);
      setWorkflows([]);
    }
  }, [tab]);

  useEffect(() => {
    void load();
  }, [load]);

  const run = async (wf: Workflow) => {
    setBusyId(wf.id);
    try {
      const res = await api<{ instance: { status: string; workflowSteps: Array<{ status: string }> } }>(
        `/api/workflows/${wf.id}/execute`,
        { method: 'POST', body: JSON.stringify({}) }
      );
      const done = res.instance.workflowSteps.filter((s) => s.status === 'COMPLETED').length;
      const skipped = res.instance.workflowSteps.filter((s) => s.status === 'SKIPPED').length;
      toast.success(
        `Workflow "${wf.name}" ran: ${done} step${done === 1 ? '' : 's'} executed${skipped ? `, ${skipped} skipped (needs worker tier)` : ''}`
      );
      void load();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusyId(null);
    }
  };

  const toggle = async (wf: Workflow) => {
    setBusyId(wf.id);
    try {
      await api(`/api/workflows/${wf.id}`, { method: 'PATCH', body: JSON.stringify({ isActive: !wf.isActive }) });
      toast.success(`${wf.name} ${wf.isActive ? 'deactivated' : 'activated'}`);
      void load();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (wf: Workflow) => {
    if (!window.confirm(`Delete workflow "${wf.name}"?`)) return;
    setBusyId(wf.id);
    try {
      await api(`/api/workflows/${wf.id}`, { method: 'DELETE' });
      toast.success('Workflow deleted');
      void load();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusyId(null);
    }
  };

  const applyTemplate = (wf: Workflow) => {
    setForm({ name: wf.name.replace(/ Workflow$/, ''), description: wf.description ?? '' });
    setSteps(wf.steps.map((s) => ({ name: s.name, type: (['TASK', 'APPROVAL', 'NOTIFICATION'].includes(s.type) ? s.type : 'TASK') as StepType })));
    setFormError(null);
    setModalOpen(true);
  };

  const submit = async () => {
    if (!form.name.trim()) {
      setFormError('Workflow name is required');
      return;
    }
    const cleanSteps = steps.filter((s) => s.name.trim());
    if (cleanSteps.length === 0) {
      setFormError('Add at least one step with a name');
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      await api('/api/workflows', {
        method: 'POST',
        body: JSON.stringify({
          name: form.name.trim(),
          description: form.description.trim() || undefined,
          triggerType: 'MANUAL',
          steps: cleanSteps.map((s) => ({
            name: s.name.trim(),
            type: s.type,
            config: { title: s.name.trim() },
          })),
        }),
      });
      toast.success('Workflow created');
      setModalOpen(false);
      setTab('workflows');
      void load();
    } catch (e) {
      setFormError((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-semibold text-stone-900 mb-2">Workflows</h1>
          <p className="text-stone-500">Define and run multi-step business processes.</p>
        </div>
        {elevated && (
          <Button
            onClick={() => {
              setForm({ name: '', description: '' });
              setSteps([{ name: '', type: 'TASK' }]);
              setFormError(null);
              setModalOpen(true);
            }}
            className="bg-[#0A2245] hover:bg-[#0E2C55] shadow-luxe text-white font-medium"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Workflow
          </Button>
        )}
      </div>

      <div className="flex items-start gap-3 text-sm text-stone-600 bg-blue-50 border border-blue-100 rounded-lg p-4">
        <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
        <p>
          Running a workflow executes its <strong>task</strong>, <strong>approval</strong>, and{' '}
          <strong>notification</strong> steps immediately and records every run. Scheduled/event triggers and
          webhook/integration steps activate with the background worker (go-live roadmap Sprint 8).
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-stone-200 bg-white rounded-t-lg">
        {(['workflows', 'templates'] as const).map((t) => (
          <button
            key={t}
            onClick={() => {
              setWorkflows(null);
              setTab(t);
            }}
            className={cn(
              'px-5 py-3 text-sm font-medium border-b-2 -mb-px capitalize transition-colors',
              tab === t ? 'border-[#09203F] text-[#09203F]' : 'border-transparent text-stone-500 hover:text-stone-800'
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {loadError && (
        <Card className="border-red-200 bg-red-50 p-6 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-800">Could not load workflows</p>
            <p className="text-xs text-red-600 mt-0.5">{loadError}</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => void load()}>
            Retry
          </Button>
        </Card>
      )}

      {workflows === null && !loadError && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-44 rounded-xl" />
          ))}
        </div>
      )}

      {workflows !== null && workflows.length === 0 && !loadError && (
        <div className="text-center py-16">
          <GitBranch className="w-12 h-12 text-stone-300 mx-auto mb-4" />
          <p className="text-stone-500 mb-2">{tab === 'templates' ? 'No templates yet.' : 'No workflows yet.'}</p>
          {elevated && tab === 'workflows' && (
            <Button variant="outline" onClick={() => setModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create your first workflow
            </Button>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {(workflows ?? []).map((wf) => (
          <Card key={wf.id} className="bg-white border border-stone-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="p-6 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-lg font-semibold text-stone-900">{wf.name}</h3>
                    {wf.isTemplate ? (
                      <Badge variant="outline" className="bg-purple-500/10 text-purple-700 border-purple-200">
                        template
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className={
                          wf.isActive
                            ? 'bg-emerald-500/10 text-emerald-700 border-emerald-200'
                            : 'bg-stone-500/10 text-stone-500 border-stone-200'
                        }
                      >
                        {wf.isActive ? 'active' : 'inactive'}
                      </Badge>
                    )}
                  </div>
                  {wf.description && <p className="text-sm text-stone-500 mt-1">{wf.description}</p>}
                  <p className="text-xs text-stone-400 mt-1">
                    {wf.department?.name ?? 'Company-wide'} · trigger: {wf.triggerType.toLowerCase()} ·{' '}
                    {wf._count.workflowInstances} run{wf._count.workflowInstances === 1 ? '' : 's'}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {(wf.steps ?? []).map((s, i) => (
                  <Badge key={i} variant="outline" className={stepBadge[s.type] ?? stepBadge.TASK}>
                    {i + 1}. {s.name} ({s.type.toLowerCase()})
                  </Badge>
                ))}
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-stone-100">
                {wf.isTemplate ? (
                  elevated && (
                    <Button size="sm" variant="outline" onClick={() => applyTemplate(wf)}>
                      <Plus className="w-4 h-4 mr-1.5" />
                      Use template
                    </Button>
                  )
                ) : (
                  <>
                    <Button
                      size="sm"
                      disabled={!wf.isActive || busyId === wf.id}
                      loading={busyId === wf.id}
                      onClick={() => void run(wf)}
                      className="bg-[#0A2245] hover:bg-[#0E2C55] shadow-luxe text-white"
                    >
                      <Play className="w-4 h-4 mr-1.5" />
                      Run
                    </Button>
                    {elevated && (
                      <>
                        <Button size="sm" variant="outline" disabled={busyId === wf.id} onClick={() => void toggle(wf)}>
                          <Power className="w-4 h-4 mr-1.5" />
                          {wf.isActive ? 'Deactivate' : 'Activate'}
                        </Button>
                        <Button size="sm" variant="ghost" disabled={busyId === wf.id} onClick={() => void remove(wf)}>
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Create modal */}
      <Modal
        open={modalOpen}
        onOpenChange={(open) => {
          setModalOpen(open);
          if (!open) setFormError(null);
        }}
        title="Create Workflow"
        description="Steps run in order when the workflow is executed"
        size="xl"
      >
        <div className="space-y-4">
          {formError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800">{formError}</div>
          )}

          <Input label="Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g., New client onboarding" />
          <div>
            <label className="text-sm font-medium text-stone-700 block mb-2">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-3 py-2 border border-stone-300 rounded-lg min-h-16 resize-none focus:outline-none focus:ring-2 focus:ring-[#09203F]/20"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-stone-700 block mb-2">Steps *</label>
            <div className="space-y-2">
              {steps.map((s, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <span className="text-xs text-stone-400 w-5 text-right">{i + 1}.</span>
                  <Input
                    placeholder="Step name (e.g., Prepare welcome pack)"
                    value={s.name}
                    onChange={(e) => setSteps(steps.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))}
                  />
                  <Select
                    value={s.type}
                    onChange={(e) => setSteps(steps.map((x, j) => (j === i ? { ...x, type: e.target.value as StepType } : x)))}
                    options={[
                      { value: 'TASK', label: 'Task' },
                      { value: 'APPROVAL', label: 'Approval' },
                      { value: 'NOTIFICATION', label: 'Notification' },
                    ]}
                    className="w-40"
                  />
                  <button
                    onClick={() => setSteps(steps.filter((_, j) => j !== i))}
                    disabled={steps.length === 1}
                    className="p-2 text-stone-400 hover:text-red-600 disabled:opacity-30"
                    title="Remove step"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <Button size="sm" variant="outline" className="mt-3" onClick={() => setSteps([...steps, { name: '', type: 'TASK' }])}>
              <Plus className="w-4 h-4 mr-1.5" />
              Add step
            </Button>
          </div>

          <div className="flex gap-3 pt-2">
            <Button onClick={submit} loading={saving} className="flex-1 bg-[#0A2245] hover:bg-[#0E2C55] shadow-luxe text-white">
              Create Workflow
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
