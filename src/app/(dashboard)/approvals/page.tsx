'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
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
import { formatDate } from '@/lib/utils';
import { FileCheck, ThumbsUp, ThumbsDown, Clock, Plus, AlertCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Approval {
  id: string;
  title: string;
  description: string | null;
  type: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'ESCALATED' | 'CANCELLED';
  priority: string;
  dueDate: string | null;
  decidedAt: string | null;
  comments: string | null;
  createdAt: string;
  requester: { id: string; name: string } | null;
  approver: { id: string; name: string } | null;
  department: { id: string; name: string } | null;
}

const typeColors: Record<string, string> = {
  PURCHASE: 'bg-emerald-500/10 text-emerald-700 border-emerald-200',
  EXPENSE: 'bg-blue-500/10 text-blue-700 border-blue-200',
  LEAVE: 'bg-purple-500/10 text-purple-700 border-purple-200',
  WORKFLOW: 'bg-yellow-500/10 text-yellow-700 border-yellow-200',
  DOCUMENT: 'bg-pink-500/10 text-pink-700 border-pink-200',
  ACCESS: 'bg-orange-500/10 text-orange-700 border-orange-200',
  GENERAL: 'bg-gray-500/10 text-gray-700 border-gray-200',
};

const priorityColors: Record<string, string> = {
  LOW: 'bg-blue-500/10 text-blue-700 border-blue-200',
  MEDIUM: 'bg-yellow-500/10 text-yellow-700 border-yellow-200',
  HIGH: 'bg-red-500/10 text-red-700 border-red-200',
  URGENT: 'bg-red-600/10 text-red-700 border-red-200',
  CRITICAL: 'bg-red-700/10 text-red-800 border-red-200',
};

const APPROVAL_TYPES = ['GENERAL', 'PURCHASE', 'EXPENSE', 'LEAVE', 'WORKFLOW', 'DOCUMENT', 'ACCESS'];
const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT', 'CRITICAL'];

type TabKey = 'pending' | 'approved' | 'rejected' | 'mine';

function ApprovalsPageInner() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const toast = useToast();

  const [tab, setTab] = useState<TabKey>('pending');
  const [approvals, setApprovals] = useState<Approval[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const [decision, setDecision] = useState<{ approval: Approval; kind: 'APPROVED' | 'REJECTED' } | null>(null);
  const [decisionComment, setDecisionComment] = useState('');
  const [decisionError, setDecisionError] = useState<string | null>(null);

  const [newOpen, setNewOpen] = useState(searchParams.get('new') === '1');
  const [users, setUsers] = useState<Array<{ id: string; name: string }>>([]);
  const [form, setForm] = useState({ title: '', description: '', type: 'GENERAL', priority: 'MEDIUM', approverId: '', dueDate: '' });
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const myId = session?.user?.id;
  const elevated = ['ADMIN', 'EXECUTIVE', 'MANAGER'].includes(session?.user?.role ?? '');

  const load = useCallback(async () => {
    try {
      setLoadError(null);
      const params = new URLSearchParams({ pageSize: '50' });
      if (tab === 'pending') params.set('status', 'PENDING');
      if (tab === 'approved') params.set('status', 'APPROVED');
      if (tab === 'rejected') params.set('status', 'REJECTED');
      if (tab === 'mine') params.set('mine', 'requested');
      const res = await api<{ approvals: Approval[] }>(`/api/approvals?${params}`);
      setApprovals(res.approvals);
    } catch (e) {
      setLoadError((e as Error).message);
      setApprovals([]);
    }
  }, [tab]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    api<{ users: Array<{ id: string; name: string }> }>('/api/users/options')
      .then((r) => setUsers(r.users))
      .catch(() => undefined);
  }, []);

  const submitDecision = async () => {
    if (!decision) return;
    if (decision.kind === 'REJECTED' && !decisionComment.trim()) {
      setDecisionError('Please provide a reason when rejecting');
      return;
    }
    setBusyId(decision.approval.id);
    setDecisionError(null);
    try {
      await api(`/api/approvals/${decision.approval.id}`, {
        method: 'POST',
        body: JSON.stringify({ decision: decision.kind, comments: decisionComment.trim() || undefined }),
      });
      toast.success(`${decision.kind === 'APPROVED' ? 'Approved' : 'Rejected'} "${decision.approval.title}"`);
      setDecision(null);
      setDecisionComment('');
      void load();
    } catch (e) {
      setDecisionError((e as Error).message);
    } finally {
      setBusyId(null);
    }
  };

  const cancelRequest = async (approval: Approval) => {
    if (!window.confirm(`Cancel your request "${approval.title}"?`)) return;
    setBusyId(approval.id);
    try {
      await api(`/api/approvals/${approval.id}`, { method: 'PATCH', body: JSON.stringify({ status: 'CANCELLED' }) });
      toast.success('Request cancelled');
      void load();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusyId(null);
    }
  };

  const submitNew = async () => {
    if (!form.title.trim()) {
      setFormError('Title is required');
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      await api('/api/approvals', {
        method: 'POST',
        body: JSON.stringify({
          title: form.title.trim(),
          description: form.description.trim() || undefined,
          type: form.type,
          priority: form.priority,
          approverId: form.approverId || undefined,
          dueDate: form.dueDate || undefined,
        }),
      });
      toast.success('Approval requested');
      setNewOpen(false);
      setForm({ title: '', description: '', type: 'GENERAL', priority: 'MEDIUM', approverId: '', dueDate: '' });
      setTab('mine');
    } catch (e) {
      setFormError((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const canDecide = (a: Approval) =>
    a.status === 'PENDING' && a.requester?.id !== myId && (elevated || a.approver?.id === myId);

  const tabs: Array<{ key: TabKey; label: string; icon: React.ReactNode }> = [
    { key: 'pending', label: 'Pending', icon: <Clock className="w-4 h-4" /> },
    { key: 'approved', label: 'Approved', icon: <ThumbsUp className="w-4 h-4" /> },
    { key: 'rejected', label: 'Rejected', icon: <ThumbsDown className="w-4 h-4" /> },
    { key: 'mine', label: 'My Requests', icon: <FileCheck className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Approvals</h1>
          <p className="text-gray-500">Review and act on approval requests across the business.</p>
        </div>
        <Button onClick={() => setNewOpen(true)} className="bg-[#09203F] hover:bg-[#0a2651] text-white font-medium">
          <Plus className="w-4 h-4 mr-2" />
          Request Approval
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 bg-white rounded-t-lg overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => {
              setApprovals(null);
              setTab(t.key);
            }}
            className={cn(
              'flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 -mb-px whitespace-nowrap transition-colors',
              tab === t.key ? 'border-[#09203F] text-[#09203F]' : 'border-transparent text-gray-500 hover:text-gray-800'
            )}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {loadError && (
        <Card className="border-red-200 bg-red-50 p-6 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-800">Could not load approvals</p>
            <p className="text-xs text-red-600 mt-0.5">{loadError}</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => void load()}>
            Retry
          </Button>
        </Card>
      )}

      {approvals === null && !loadError && (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      )}

      {approvals !== null && approvals.length === 0 && !loadError && (
        <div className="text-center py-16">
          <FileCheck className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-1">
            {tab === 'pending' && 'No pending approvals — you’re all caught up.'}
            {tab === 'approved' && 'No approved requests yet.'}
            {tab === 'rejected' && 'No rejected requests.'}
            {tab === 'mine' && 'You haven’t requested any approvals yet.'}
          </p>
          {tab === 'mine' && (
            <Button onClick={() => setNewOpen(true)} variant="outline" className="mt-3">
              <Plus className="w-4 h-4 mr-2" />
              Request one
            </Button>
          )}
        </div>
      )}

      <div className="space-y-4">
        {(approvals ?? []).map((a) => (
          <Card key={a.id} className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{a.title}</h3>
                    <Badge variant="outline" className={typeColors[a.type] ?? typeColors.GENERAL}>
                      {a.type.toLowerCase()}
                    </Badge>
                    <Badge variant="outline" className={priorityColors[a.priority] ?? ''}>
                      {a.priority.toLowerCase()}
                    </Badge>
                    {a.status !== 'PENDING' && (
                      <Badge
                        variant="outline"
                        className={cn(
                          a.status === 'APPROVED' && 'bg-emerald-500/10 text-emerald-700 border-emerald-200',
                          a.status === 'REJECTED' && 'bg-red-500/10 text-red-700 border-red-200',
                          (a.status === 'CANCELLED' || a.status === 'ESCALATED') && 'bg-gray-500/10 text-gray-600 border-gray-200'
                        )}
                      >
                        {a.status.toLowerCase()}
                      </Badge>
                    )}
                  </div>
                  {a.description && <p className="text-sm text-gray-500 mb-3">{a.description}</p>}
                  <div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap">
                    <span>
                      Requested by <span className="font-medium text-gray-700">{a.requester?.name ?? 'Unknown'}</span>
                    </span>
                    {a.department && <span>· {a.department.name}</span>}
                    <span>· {formatDate(a.createdAt)}</span>
                    {a.dueDate && <span>· due {formatDate(a.dueDate)}</span>}
                    {a.approver && a.status === 'PENDING' && (
                      <span>
                        · awaiting <span className="font-medium text-gray-700">{a.approver.name}</span>
                      </span>
                    )}
                    {a.approver && a.status !== 'PENDING' && a.decidedAt && (
                      <span>
                        · decided by <span className="font-medium text-gray-700">{a.approver.name}</span> on {formatDate(a.decidedAt)}
                      </span>
                    )}
                  </div>
                  {a.comments && (
                    <p className="mt-3 text-sm text-gray-600 bg-gray-50 border border-gray-100 rounded-lg px-3 py-2">
                      “{a.comments}”
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-2 flex-shrink-0">
                  {canDecide(a) && (
                    <>
                      <Button
                        size="sm"
                        disabled={busyId === a.id}
                        onClick={() => {
                          setDecision({ approval: a, kind: 'APPROVED' });
                          setDecisionComment('');
                          setDecisionError(null);
                        }}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                      >
                        <ThumbsUp className="w-4 h-4 mr-1.5" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={busyId === a.id}
                        onClick={() => {
                          setDecision({ approval: a, kind: 'REJECTED' });
                          setDecisionComment('');
                          setDecisionError(null);
                        }}
                        className="border-red-200 text-red-600 hover:bg-red-50"
                      >
                        <ThumbsDown className="w-4 h-4 mr-1.5" />
                        Reject
                      </Button>
                    </>
                  )}
                  {a.status === 'PENDING' && a.requester?.id === myId && (
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={busyId === a.id}
                      onClick={() => void cancelRequest(a)}
                      className="text-gray-500"
                    >
                      <XCircle className="w-4 h-4 mr-1.5" />
                      Cancel
                    </Button>
                  )}
                  {a.status === 'PENDING' && a.requester?.id === myId && (
                    <p className="text-[11px] text-gray-400 text-center max-w-[130px]">You cannot decide your own request</p>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Decision modal */}
      <Modal
        open={decision !== null}
        onOpenChange={(open) => {
          if (!open) setDecision(null);
        }}
        title={decision?.kind === 'APPROVED' ? 'Approve request' : 'Reject request'}
        description={decision?.approval.title}
        size="md"
      >
        <div className="space-y-4">
          {decisionError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800">{decisionError}</div>
          )}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">
              {decision?.kind === 'APPROVED' ? 'Comment (optional)' : 'Reason *'}
            </label>
            <textarea
              value={decisionComment}
              onChange={(e) => setDecisionComment(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg min-h-24 resize-none focus:outline-none focus:ring-2 focus:ring-[#09203F]/20"
              placeholder={decision?.kind === 'APPROVED' ? 'Add context for the requester…' : 'Explain why this is rejected…'}
            />
          </div>
          <div className="flex gap-3">
            <Button
              onClick={submitDecision}
              loading={busyId === decision?.approval.id}
              className={cn(
                'flex-1 text-white',
                decision?.kind === 'APPROVED' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'
              )}
            >
              {decision?.kind === 'APPROVED' ? 'Confirm Approval' : 'Confirm Rejection'}
            </Button>
            <Button variant="outline" onClick={() => setDecision(null)} className="flex-1">
              Back
            </Button>
          </div>
        </div>
      </Modal>

      {/* New request modal */}
      <Modal
        open={newOpen}
        onOpenChange={(open) => {
          setNewOpen(open);
          if (!open) setFormError(null);
        }}
        title="Request Approval"
        description="Submit a request for review"
        size="lg"
      >
        <div className="space-y-4">
          {formError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800">{formError}</div>
          )}
          <Input label="Title *" placeholder="e.g., Q3 window display budget" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg min-h-20 resize-none focus:outline-none focus:ring-2 focus:ring-[#09203F]/20"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select label="Type" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} options={APPROVAL_TYPES.map((t) => ({ value: t, label: t.toLowerCase() }))} />
            <Select label="Priority" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} options={PRIORITIES.map((p) => ({ value: p, label: p.toLowerCase() }))} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Approver"
              value={form.approverId}
              onChange={(e) => setForm({ ...form, approverId: e.target.value })}
              options={[{ value: '', label: 'Any manager' }, ...users.filter((u) => u.id !== myId).map((u) => ({ value: u.id, label: u.name }))]}
            />
            <Input label="Due Date" type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
          </div>
          <div className="flex gap-3 pt-2">
            <Button onClick={submitNew} loading={saving} className="flex-1 bg-[#09203F] hover:bg-[#0a2651] text-white">
              Submit Request
            </Button>
            <Button variant="outline" onClick={() => setNewOpen(false)} disabled={saving} className="flex-1">
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}


export default function ApprovalsPage() {
  // useSearchParams requires a Suspense boundary for static prerendering.
  return (
    <Suspense fallback={null}>
      <ApprovalsPageInner />
    </Suspense>
  );
}
