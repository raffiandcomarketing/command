'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Play, Copy, GripVertical, X } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface WorkflowStep {
  id: string;
  type: string;
  config: Record<string, any>;
}

interface Workflow {
  id: string;
  name: string;
  description: string;
  status: string;
  triggerType: string;
  definition: { steps: WorkflowStep[] };
}

const stepTypes = [
  { id: 'condition', label: 'Condition', icon: '⚡' },
  { id: 'action', label: 'Action', icon: '🎯' },
  { id: 'notification', label: 'Notification', icon: '🔔' },
  { id: 'delay', label: 'Delay', icon: '⏱️' },
  { id: 'approval', label: 'Approval', icon: '✅' },
];

export default function WorkflowsPage() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    triggerType: 'MANUAL',
    steps: [] as WorkflowStep[],
  });

  useEffect(() => {
    fetchWorkflows();
  }, []);

  const fetchWorkflows = async () => {
    try {
      const response = await fetch('/api/workflows');
      const data = await response.json();
      setWorkflows(data.workflows || []);
    } catch (error) {
      setWorkflows([
        {
          id: '1',
          name: 'Task Approval',
          description: 'Approve urgent tasks',
          status: 'ACTIVE',
          triggerType: 'EVENT',
          definition: { steps: [] },
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = editingId ? 'PATCH' : 'POST';
      const url = editingId ? `/api/workflows/${editingId}` : '/api/workflows';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          status: 'DRAFT',
          definition: { steps: formData.steps },
        }),
      });

      if (response.ok) {
        setFormData({ name: '', description: '', triggerType: 'MANUAL', steps: [], });
        setEditingId(null);
        setShowForm(false);
        fetchWorkflows();
      }
    } catch (error) {
      console.error('Failed to save workflow:', error);
    }
  };

  const handleEdit = (workflow: Workflow) => {
    setFormData({
      name: workflow.name,
      description: workflow.description,
      triggerType: workflow.triggerType,
      steps: workflow.definition.steps,
    });
    setEditingId(workflow.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this workflow?')) return;
    try {
      await fetch(`/api/workflows/${id}`, { method: 'DELETE' });
      fetchWorkflows();
    } catch (error) {
      console.error('Failed to delete workflow:', error);
    }
  };

  const addStep = (type: string) => {
    const newStep: WorkflowStep = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      config: {},
    };
    setFormData((prev) => ({
      ...prev,
      steps: [...prev.steps, newStep],
    }));
  };

  const removeStep = (stepId: string) => {
    setFormData((prev) => ({
      ...prev,
      steps: prev.steps.filter((s) => s.id !== stepId),
    }));
  };

  if (loading) {
    return <div className="p-8 text-gray-600">Loading workflows...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Workflows</h1>
        <Button
          onClick={() => {
            setFormData({ name: '', description: '', triggerType: 'MANUAL', steps: [], });
            setEditingId(null);
            setShowForm(!showForm);
          }}
          className="bg-[#09203F] hover:bg-[#0a2651] text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Workflow
        </Button>
      </div>

      {showForm && (
        <Card className="bg-white border border-gray-200 rounded-xl p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Workflow Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 bg-white border border-gray-200 rounded text-gray-900 focus:outline-none focus:border-[#09203F]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Trigger Type
                </label>
                <select
                  value={formData.triggerType}
                  onChange={(e) => setFormData({ ...formData, triggerType: e.target.value })}
                  className="w-full px-4 py-2 bg-white border border-gray-200 rounded text-gray-900 focus:outline-none focus:border-[#09203F]"
                >
                  <option value="MANUAL">Manual</option>
                  <option value="EVENT">Event-based</option>
                  <option value="SCHEDULED">Scheduled</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 bg-white border border-gray-200 rounded text-gray-900 focus:outline-none focus:border-[#09203F]"
                rows={2}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Workflow Steps
              </label>
              <div className="space-y-3">
                {formData.steps.map((step, index) => (
                  <div key={step.id} className="flex items-start gap-3 p-3 bg-gray-50 border border-gray-200 rounded">
                    <GripVertical className="w-5 h-5 text-gray-500 mt-1 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">Step {index + 1}:</span>{' '}
                        {stepTypes.find((t) => t.id === step.type)?.label}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeStep(step.id)}
                      className="p-1 hover:bg-white rounded transition-colors"
                    >
                      <X className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="mt-4">
                <p className="text-xs text-gray-600 mb-2">Add Step:</p>
                <div className="grid grid-cols-5 gap-2">
                  {stepTypes.map((type) => (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => addStep(type.id)}
                      className="p-2 bg-white border border-gray-200 rounded hover:border-[#09203F] transition-colors text-center"
                    >
                      <div className="text-lg mb-1">{type.icon}</div>
                      <div className="text-xs text-gray-700">{type.label}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button type="submit" className="bg-[#09203F] hover:bg-[#0a2651] text-white">
                {editingId ? 'Update' : 'Create'} Workflow
              </Button>
              <Button
                type="button"
                onClick={() => setShowForm(false)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-900"
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="grid gap-4">
        {workflows.map((workflow) => (
          <Card key={workflow.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:border-[#09203F]/20 transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {workflow.name}
                  </h3>
                  <Badge
                    className={
                      workflow.status === 'ACTIVE'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-gray-300 text-gray-900'
                    }
                  >
                    {workflow.status}
                  </Badge>
                </div>
                <p className="text-gray-600 text-sm mb-3">
                  {workflow.description}
                </p>
                <div className="flex gap-4 text-sm">
                  <span className="text-gray-600">
                    Trigger:{' '}
                    <span className="text-[#09203F] font-semibold">
                      {workflow.triggerType}
                    </span>
                  </span>
                  <span className="text-gray-600">
                    Steps:{' '}
                    <span className="text-[#09203F] font-semibold">
                      {workflow.definition.steps.length}
                    </span>
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="p-2 hover:bg-gray-100 rounded transition-colors" title="Execute workflow">
                  <Play className="w-5 h-5 text-emerald-600" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded transition-colors" title="Duplicate workflow">
                  <Copy className="w-5 h-5 text-[#09203F]" />
                </button>
                <button onClick={() => handleEdit(workflow)} className="p-2 hover:bg-gray-100 rounded transition-colors">
                  <Edit2 className="w-5 h-5 text-[#09203F]" />
                </button>
                <button onClick={() => handleDelete(workflow.id)} className="p-2 hover:bg-gray-100 rounded transition-colors">
                  <Trash2 className="w-5 h-5 text-red-600" />
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
