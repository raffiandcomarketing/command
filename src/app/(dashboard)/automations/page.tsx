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
import { Zap, Plus, Play, Power, AlertCircle, Trash2, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Automation {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  triggerType: string;
  actions: Array<{ type: string; config: Record<string, unknown> }>;
  cooldownMinutes: number | null;
  lastTriggeredAt: string | null;
  executionCount: number;
  department: { id: string; name: string } | null;
  createdBy: { id: string; name: string } | null;
  _count: { automationExecutions: number };
}

const ACTION_TYPES = [
  { value: 'SEND_NOTIFICATION', label: 'Send notification' },
  { value: 'CREATE_TASK', label: 'Create task' },
  { value: 'CREATE_APPROVAL', label: 'Create approval request' },
];

export default function AutomationsPage() {
  const { data: session } = useSession();
  const toast = useToast();

  const [automations, setAutomations] = useState<Automation[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', actionType: 'SEND_NOTIFICATION', actionTitle: '', cooldown: '' });
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const elevated = ['ADMIN', 'EXECUTIVE', 'MANAGER'].includes(session?.user?.role ?? '');

  const load = useCallback(async () => {
    try {
      setLoadError(null);
      const res = await api<{ automations: Automation[] }>('/api/automations');
      setAutomations(res.automations);
    } catch (e) {
      setLoadError((e as Error).message);
      setAutomations([]);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const run = async (a: Automation) => {
    setBusyId(a.id);
    try {
      await api(`/api/automations/${a.id}/execute`, { method: 'POST', body: JSON.stringify({}) });
      toast.success(`Automation "${a.name}" executed`);
      void load();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusyId(null);
    }
  };

  const toggle = async (a: Automation) => {
    setBusyId(a.id);
    try {
      await api(`/api/automations/${a.id}`, { method: 'PATCH', body: JSON.stringify({ isActive: !a.isActive }) });
      toast.success(`${a.name} ${a.isActive ? 'deactivated' : 'activated'}`);
      void load();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (a: Automation) => {
    if (!window.confirm(`Delete automation "${a.name}"?`)) return;
    setBusyId(a.id);
    try {
      await api(`/api/automations/${a.id}`, { method: 'DELETE' });
      toast.success('Automation deleted');
      void load();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusyId(null);
    }
  };

  const submit = async () => {
    if (!form.name.trim()) {
      setFormError('Name is required');
      return;
    }
    if (!form.actionTitle.trim()) {
      setFormError('Action title/message is required');
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      await api('/api/automations', {
        method: 'POST',
        body: JSON.stringify({
          name: form.name.trim(),
          description: form.description.trim() || undefined,
          triggerType: 'MANUAL',
          actions: [
            {
              type: form.actionType,
              config:
                form.actionType === 'SEND_NOTIFICATION'
                  ? { title: form.name.trim(), message: form.actionTitle.trim() }
                  : { title: form.actionTitle.trim() },
            },
          ],
          cooldownMinutes: form.cooldown ? Number(form.cooldown) : undefined,
        }),
      });
      toast.success('Automation created');
      setModalOpen(false);
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Automations</h1>
          <p className="text-gray-500">Rule-based actions with a full execution log.</p>
        </div>
        {elevated && (
          <Button
            onClick={() => {
              setForm({ name: '', description: '', actionType: 'SEND_NOTIFICATION', actionTitle: '', cooldown: '' });
              setFormError(null);
              setModalOpen(true);
            }}
            className="bg-[#09203F] hover:bg-[#0a2651] text-white font-medium"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Rule
          </Button>
        )}
      </div>

      <div className="flex items-start gap-3 text-sm text-gray-600 bg-blue-50 border border-blue-100 rounded-lg p-4">
        <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
        <p>
          Rules execute on demand today and every run is logged with duration and results. Scheduled (cron) and
          event-driven triggers switch on with the background worker (go-live roadmap Sprint 8) — rules you define now
          will run automatically then.
        </p>
      </div>

      {loadError && (
        <Card className="border-red-200 bg-red-50 p-6 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-800">Could not load automations</p>
            <p className="text-xs text-red-600 mt-0.5">{loadError}</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => void load()}>
            Retry
          </Button>
        </Card>
      )}

      {automations === null && !loadError && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      )}

      {automations !== null && automations.length === 0 && !loadError && (
        <div className="text-center py-16">
          <Zap className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-2">No automation rules yet.</p>
          {elevated && (
            <Button variant="outline" onClick={() => setModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create your first rule
            </Button>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {(automations ?? []).map((a) => (
          <Card key={a.id} className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="p-6 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-lg font-semibold text-gray-900">{a.name}</h3>
                    <Badge
                      variant="outline"
                      className={
                        a.isActive
                          ? 'bg-emerald-500/10 text-emerald-700 border-emerald-200'
                          : 'bg-gray-500/10 text-gray-500 border-gray-200'
                      }
                    >
                      {a.isActive ? 'active' : 'inactive'}
                    </Badge>
                    <Badge variant="outline" className="bg-gray-100 text-gray-600 border-gray-200">
                      {a.triggerType.toLowerCase()} trigger
                    </Badge>
                  </div>
                  {a.description && <p className="text-sm text-gray-500 mt-1">{a.description}</p>}
                  <p className="text-xs text-gray-400 mt-1">
                    {a.department?.name ?? 'Company-wide'} · {a.executionCount} execution{a.executionCount === 1 ? '' : 's'}
                    {a.lastTriggeredAt && ` · last run ${new Date(a.lastTriggeredAt).toLocaleString()}`}
                    {a.cooldownMinutes ? ` · ${a.cooldownMinutes}m cooldown` : ''}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {(a.actions ?? []).map((act, i) => (
                  <Badge key={i} variant="outline" className="bg-amber-500/10 text-amber-700 border-amber-200">
                    {String(act.type).replace(/_/g, ' ').toLowerCase()}
                  </Badge>
                ))}
              </div>

              {elevated && (
                <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                  <Button
                    size="sm"
                    disabled={!a.isActive || busyId === a.id}
                    loading={busyId === a.id}
                    onClick={() => void run(a)}
                    className="bg-[#09203F] hover:bg-[#0a2651] text-white"
                  >
                    <Play className="w-4 h-4 mr-1.5" />
                    Run now
                  </Button>
                  <Button size="sm" variant="outline" disabled={busyId === a.id} onClick={() => void toggle(a)}>
                    <Power className="w-4 h-4 mr-1.5" />
                    {a.isActive ? 'Deactivate' : 'Activate'}
                  </Button>
                  <Button size="sm" variant="ghost" disabled={busyId === a.id} onClick={() => void remove(a)}>
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              )}
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
        title="Create Automation Rule"
        size="lg"
      >
        <div className="space-y-4">
          {formError && <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800">{formError}</div>}

          <Input label="Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g., Overdue repair follow-up" />
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg min-h-16 resize-none focus:outline-none focus:ring-2 focus:ring-[#09203F]/20"
            />
          </div>
          <Select
            label="Action"
            value={form.actionType}
            onChange={(e) => setForm({ ...form, actionType: e.target.value })}
            options={ACTION_TYPES}
          />
          <Input
            label={form.actionType === 'SEND_NOTIFICATION' ? 'Notification message *' : 'Title *'}
            value={form.actionTitle}
            onChange={(e) => setForm({ ...form, actionTitle: e.target.value })}
            placeholder={form.actionType === 'SEND_NOTIFICATION' ? 'Message to send' : 'Title for the created item'}
          />
          <Input
            label="Cooldown (minutes, optional)"
            type="number"
            min="0"
            value={form.cooldown}
            onChange={(e) => setForm({ ...form, cooldown: e.target.value })}
            placeholder="Minimum time between runs"
          />

          <div className="flex gap-3 pt-2">
            <Button onClick={submit} loading={saving} className="flex-1 bg-[#09203F] hover:bg-[#0a2651] text-white">
              Create Rule
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
