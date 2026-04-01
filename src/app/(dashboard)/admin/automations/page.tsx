'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Toggle2, X } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface AutomationCondition {
  id: string;
  field: string;
  operator: string;
  value: string;
}

interface AutomationAction {
  id: string;
  type: string;
  config: Record<string, any>;
}

interface Automation {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  trigger: { type: string };
  conditions: AutomationCondition[];
  actions: AutomationAction[];
}

const operators = ['equals', 'contains', 'greater_than', 'less_than', 'starts_with'];
const actionTypes = ['send_notification', 'create_task', 'update_field', 'send_email'];

export default function AutomationsPage() {
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    trigger: { type: 'EVENT' },
    conditions: [] as AutomationCondition[],
    actions: [] as AutomationAction[],
  });

  useEffect(() => {
    fetchAutomations();
  }, []);

  const fetchAutomations = async () => {
    try {
      const response = await fetch('/api/automations');
      const data = await response.json();
      setAutomations(data.automations || []);
    } catch (error) {
      console.error('Failed to fetch automations:', error);
      setAutomations([
        {
          id: '1',
          name: 'High Priority Alert',
          description: 'Alert when high priority tasks are created',
          isActive: true,
          trigger: { type: 'EVENT' },
          conditions: [],
          actions: [],
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
      const url = editingId
        ? `/api/automations/${editingId}`
        : '/api/automations';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setFormData({
          name: '',
          description: '',
          trigger: { type: 'EVENT' },
          conditions: [],
          actions: [],
        });
        setEditingId(null);
        setShowForm(false);
        fetchAutomations();
      }
    } catch (error) {
      console.error('Failed to save automation:', error);
    }
  };

  const handleEdit = (automation: Automation) => {
    setFormData({
      name: automation.name,
      description: automation.description,
      trigger: automation.trigger,
      conditions: automation.conditions,
      actions: automation.actions,
    });
    setEditingId(automation.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this automation?')) return;

    try {
      await fetch(`/api/automations/${id}`, { method: 'DELETE' });
      fetchAutomations();
    } catch (error) {
      console.error('Failed to delete automation:', error);
    }
  };

  const handleToggleActive = async (automation: Automation) => {
    try {
      await fetch(`/api/automations/${automation.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !automation.isActive }),
      });
      fetchAutomations();
    } catch (error) {
      console.error('Failed to toggle automation:', error);
    }
  };

  const addCondition = () => {
    const newCondition: AutomationCondition = {
      id: Math.random().toString(36).substr(2, 9),
      field: '',
      operator: 'equals',
      value: '',
    };
    setFormData((prev) => ({
      ...prev,
      conditions: [...prev.conditions, newCondition],
    }));
  };

  const removeCondition = (conditionId: string) => {
    setFormData((prev) => ({
      ...prev,
      conditions: prev.conditions.filter((c) => c.id !== conditionId),
    }));
  };

  const addAction = () => {
    const newAction: AutomationAction = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'send_notification',
      config: {},
    };
    setFormData((prev) => ({
      ...prev,
      actions: [...prev.actions, newAction],
    }));
  };

  const removeAction = (actionId: string) => {
    setFormData((prev) => ({
      ...prev,
      actions: prev.actions.filter((a) => a.id !== actionId),
    }));
  };

  if (loading) {
    return <div className="p-8 text-gray-600">Loading automations...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Automations</h1>
        <Button
          onClick={() => {
            setFormData({
              name: '',
              description: '',
              trigger: { type: 'EVENT' },
              conditions: [],
              actions: [],
            });
            setEditingId(null);
            setShowForm(!showForm);
          }}
          className="bg-[#09203F] hover:bg-[#0a2651] text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Automation
        </Button>
      </div>

      {showForm && (
        <Card className="bg-white border border-gray-200 rounded-xl p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-white border border-gray-200 rounded text-gray-900 focus:outline-none focus:border-[#09203F]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Trigger Type
                </label>
                <select
                  value={formData.trigger.type}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      trigger: { type: e.target.value },
                    })
                  }
                  className="w-full px-4 py-2 bg-white border border-gray-200 rounded text-gray-900 focus:outline-none focus:border-[#09203F]"
                >
                  <option value="EVENT">Event-based</option>
                  <option value="WEBHOOK">Webhook</option>
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
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full px-4 py-2 bg-white border border-gray-200 rounded text-gray-900 focus:outline-none focus:border-[#09203F]"
                rows={2}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-gray-700">
                  Conditions
                </label>
                <button
                  type="button"
                  onClick={addCondition}
                  className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded text-[#09203F] transition-colors"
                >
                  + Add Condition
                </button>
              </div>
              <div className="space-y-3">
                {formData.conditions.map((condition) => (
                  <div
                    key={condition.id}
                    className="flex gap-2 p-3 bg-gray-50 border border-gray-200 rounded"
                  >
                    <input
                      type="text"
                      placeholder="Field"
                      value={condition.field}
                      onChange={(e) => {
                        const updated = formData.conditions.map((c) =>
                          c.id === condition.id
                            ? { ...c, field: e.target.value }
                            : c
                        );
                        setFormData((prev) => ({
                          ...prev,
                          conditions: updated,
                        }));
                      }}
                      className="flex-1 px-3 py-1 bg-white border border-gray-200 rounded text-gray-900 text-sm focus:outline-none"
                    />
                    <select
                      value={condition.operator}
                      onChange={(e) => {
                        const updated = formData.conditions.map((c) =>
                          c.id === condition.id
                            ? { ...c, operator: e.target.value }
                            : c
                        );
                        setFormData((prev) => ({
                          ...prev,
                          conditions: updated,
                        }));
                      }}
                      className="px-3 py-1 bg-white border border-gray-200 rounded text-gray-900 text-sm focus:outline-none"
                    >
                      {operators.map((op) => (
                        <option key={op} value={op}>
                          {op}
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      placeholder="Value"
                      value={condition.value}
                      onChange={(e) => {
                        const updated = formData.conditions.map((c) =>
                          c.id === condition.id
                            ? { ...c, value: e.target.value }
                            : c
                        );
                        setFormData((prev) => ({
                          ...prev,
                          conditions: updated,
                        }));
                      }}
                      className="flex-1 px-3 py-1 bg-white border border-gray-200 rounded text-gray-900 text-sm focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => removeCondition(condition.id)}
                      className="p-1 hover:bg-gray-200 rounded transition-colors"
                    >
                      <X className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-gray-700">
                  Actions
                </label>
                <button
                  type="button"
                  onClick={addAction}
                  className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded text-[#09203F] transition-colors"
                >
                  + Add Action
                </button>
              </div>
              <div className="space-y-3">
                {formData.actions.map((action) => (
                  <div
                    key={action.id}
                    className="flex gap-2 p-3 bg-gray-50 border border-gray-200 rounded"
                  >
                    <select
                      value={action.type}
                      onChange={(e) => {
                        const updated = formData.actions.map((a) =>
                          a.id === action.id
                            ? { ...a, type: e.target.value }
                            : a
                        );
                        setFormData((prev) => ({
                          ...prev,
                          actions: updated,
                        }));
                      }}
                      className="flex-1 px-3 py-1 bg-white border border-gray-200 rounded text-gray-900 text-sm focus:outline-none"
                    >
                      {actionTypes.map((at) => (
                        <option key={at} value={at}>
                          {at}
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      placeholder="Configuration"
                      className="flex-1 px-3 py-1 bg-white border border-gray-200 rounded text-gray-900 text-sm focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => removeAction(action.id)}
                      className="p-1 hover:bg-gray-200 rounded transition-colors"
                    >
                      <X className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                type="submit"
                className="bg-[#09203F] hover:bg-[#0a2651] text-white"
              >
                {editingId ? 'Update' : 'Create'} Automation
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
        {automations.map((automation) => (
          <Card
            key={automation.id}
            className="bg-white border border-gray-200 rounded-xl p-6 hover:border-[#09203F]/20 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {automation.name}
                  </h3>
                  <Badge
                    className={
                      automation.isActive
                        ? 'bg-emerald-600 text-white'
                        : 'bg-gray-300 text-gray-900'
                    }
                  >
                    {automation.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <p className="text-gray-600 text-sm mb-3">
                  {automation.description}
                </p>
                <div className="flex gap-4 text-sm">
                  <span className="text-gray-600">
                    Trigger: <span className="text-[#09203F] font-semibold">{automation.trigger.type}</span>
                  </span>
                  <span className="text-gray-600">
                    Conditions:{' '}
                    <span className="text-[#09203F] font-semibold">{automation.conditions.length}</span>
                  </span>
                  <span className="text-gray-600">
                    Actions:{' '}
                    <span className="text-[#09203F] font-semibold">{automation.actions.length}</span>
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleToggleActive(automation)}
                  className="p-2 hover:bg-gray-100 rounded transition-colors"
                >
                  <Toggle2
                    className={`w-5 h-5 ${
                      automation.isActive
                        ? 'text-emerald-600'
                        : 'text-gray-400'
                    }`}
                  />
                </button>
                <button
                  onClick={() => handleEdit(automation)}
                  className="p-2 hover:bg-gray-100 rounded transition-colors"
                >
                  <Edit2 className="w-5 h-5 text-[#09203F]" />
                </button>
                <button
                  onClick={() => handleDelete(automation.id)}
                  className="p-2 hover:bg-gray-100 rounded transition-colors"
                >
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
