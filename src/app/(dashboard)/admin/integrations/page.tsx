'use client';

import { useCallback, useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/toast';
import { api } from '@/lib/client/api';
import { Plug, Plus, Power, RefreshCcw, AlertCircle, Trash2, Info } from 'lucide-react';

interface Integration {
  id: string;
  name: string;
  slug: string;
  type: string;
  provider: string;
  isActive: boolean;
  lastSyncAt: string | null;
  status: 'configured' | 'inactive';
  syncAvailable: boolean;
  department: { id: string; name: string } | null;
}

const TYPES = ['POS', 'ECOMMERCE', 'EMAIL', 'SMS', 'CALENDAR', 'ERP', 'HR', 'FINANCE', 'SHIPPING', 'ANALYTICS', 'CUSTOM'];

/** Roadmap Wave-1/2 providers surfaced as suggestions (assessment §10). */
const SUGGESTED = [
  { provider: 'Lightspeed', type: 'POS', note: 'POS + serialised inventory (Wave 1)' },
  { provider: 'Google Workspace', type: 'CALENDAR', note: 'SSO + calendar (Wave 1)' },
  { provider: 'Klaviyo', type: 'EMAIL', note: 'Email/SMS marketing (Wave 1)' },
  { provider: 'Shopify', type: 'ECOMMERCE', note: 'Omnichannel (Wave 2)' },
  { provider: 'Twilio', type: 'SMS', note: 'Client comms (Wave 2)' },
];

export default function IntegrationsPage() {
  const toast = useToast();
  const [integrations, setIntegrations] = useState<Integration[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ name: '', provider: '', type: 'CUSTOM' });
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoadError(null);
      const res = await api<{ integrations: Integration[] }>('/api/integrations');
      setIntegrations(res.integrations);
    } catch (e) {
      setLoadError((e as Error).message);
      setIntegrations([]);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const toggle = async (i: Integration) => {
    setBusyId(i.id);
    try {
      await api(`/api/integrations/${i.id}`, { method: 'PATCH', body: JSON.stringify({ isActive: !i.isActive }) });
      toast.success(`${i.name} ${i.isActive ? 'deactivated' : 'activated'}`);
      void load();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusyId(null);
    }
  };

  const trySync = async (i: Integration) => {
    setBusyId(i.id);
    try {
      await api(`/api/integrations/${i.id}/sync`, { method: 'POST' });
      void load();
    } catch (e) {
      // Expected today: adapters land in roadmap Sprint 9 - surface honestly.
      toast.info((e as Error).message);
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (i: Integration) => {
    if (!window.confirm(`Remove integration "${i.name}"?`)) return;
    setBusyId(i.id);
    try {
      await api(`/api/integrations/${i.id}`, { method: 'DELETE' });
      toast.success('Integration removed');
      void load();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusyId(null);
    }
  };

  const submit = async () => {
    if (!form.name.trim() || !form.provider.trim()) {
      setFormError('Name and provider are required');
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      await api('/api/integrations', {
        method: 'POST',
        body: JSON.stringify({ name: form.name.trim(), provider: form.provider.trim(), type: form.type }),
      });
      toast.success('Integration configured');
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
          <h1 className="text-4xl font-semibold text-stone-900 mb-2">Integrations</h1>
          <p className="text-stone-500">Configure connections to external systems.</p>
        </div>
        <Button
          onClick={() => {
            setForm({ name: '', provider: '', type: 'CUSTOM' });
            setFormError(null);
            setModalOpen(true);
          }}
          className="bg-[#0A2245] hover:bg-[#0E2C55] shadow-luxe text-white font-medium"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Integration
        </Button>
      </div>

      <div className="flex items-start gap-3 text-sm text-stone-600 bg-blue-50 border border-blue-100 rounded-lg p-4">
        <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
        <p>
          Integrations are stored as configuration today; statuses shown here are real. Live data sync (Lightspeed,
          Klaviyo, Google Workspace SSO) ships in integration Wave&nbsp;1 — go-live roadmap Sprint&nbsp;9. No fake
          &ldquo;connected&rdquo; badges.
        </p>
      </div>

      {loadError && (
        <Card className="border-red-200 bg-red-50 p-6 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-800">Could not load integrations</p>
            <p className="text-xs text-red-600 mt-0.5">{loadError}</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => void load()}>
            Retry
          </Button>
        </Card>
      )}

      {integrations === null && !loadError && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      )}

      {integrations !== null && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {integrations.map((i) => (
            <Card key={i.id} className="bg-white border border-stone-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#09203F]/5 flex items-center justify-center">
                      <Plug className="w-5 h-5 text-[#09203F]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-stone-900">{i.name}</h3>
                      <p className="text-xs text-stone-500">
                        {i.provider} · {i.type.toLowerCase()}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={
                      i.status === 'configured'
                        ? 'bg-blue-500/10 text-blue-700 border-blue-200'
                        : 'bg-stone-500/10 text-stone-500 border-stone-200'
                    }
                  >
                    {i.status}
                  </Badge>
                </div>

                <p className="text-xs text-stone-400">
                  {i.lastSyncAt ? `Last sync ${new Date(i.lastSyncAt).toLocaleString()}` : 'Never synced — adapter pending (Sprint 9)'}
                </p>

                <div className="flex items-center gap-2 pt-2 border-t border-stone-100">
                  <Button size="sm" variant="outline" disabled={busyId === i.id} onClick={() => void trySync(i)}>
                    <RefreshCcw className="w-4 h-4 mr-1.5" />
                    Sync
                  </Button>
                  <Button size="sm" variant="outline" disabled={busyId === i.id} onClick={() => void toggle(i)}>
                    <Power className="w-4 h-4 mr-1.5" />
                    {i.isActive ? 'Deactivate' : 'Activate'}
                  </Button>
                  <Button size="sm" variant="ghost" disabled={busyId === i.id} onClick={() => void remove(i)}>
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}

          {/* Suggested roadmap providers */}
          {SUGGESTED.filter((s) => !integrations.some((i) => i.provider.toLowerCase() === s.provider.toLowerCase())).map((s) => (
            <Card key={s.provider} className="bg-stone-50/60 border border-dashed border-stone-300 rounded-xl">
              <div className="p-6 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white border border-stone-200 flex items-center justify-center">
                    <Plug className="w-5 h-5 text-stone-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-stone-700">{s.provider}</h3>
                    <p className="text-xs text-stone-500">{s.note}</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setForm({ name: s.provider, provider: s.provider, type: s.type });
                    setFormError(null);
                    setModalOpen(true);
                  }}
                >
                  <Plus className="w-4 h-4 mr-1.5" />
                  Configure
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={modalOpen}
        onOpenChange={(open) => {
          setModalOpen(open);
          if (!open) setFormError(null);
        }}
        title="Add Integration"
        description="Stores the configuration record; live sync arrives with the adapter (Sprint 9)"
        size="md"
      >
        <div className="space-y-4">
          {formError && <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800">{formError}</div>}
          <Input label="Display Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g., Lightspeed POS" />
          <Input label="Provider *" value={form.provider} onChange={(e) => setForm({ ...form, provider: e.target.value })} placeholder="e.g., Lightspeed" />
          <Select label="Type" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} options={TYPES.map((t) => ({ value: t, label: t.toLowerCase() }))} />
          <div className="flex gap-3 pt-2">
            <Button onClick={submit} loading={saving} className="flex-1 bg-[#0A2245] hover:bg-[#0E2C55] shadow-luxe text-white">
              Save
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
