'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, RefreshCw, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Integration {
  id: string;
  type: string;
  name: string;
  isConnected: boolean;
  syncStatus: string;
  lastSyncAt?: Date | null;
  config: Record<string, any>;
}

const integrationTypes = [
  { id: 'stripe', name: 'Stripe', icon: '💳', color: 'from-purple-600 to-purple-700' },
  { id: 'shopify', name: 'Shopify', icon: '🛍️', color: 'from-green-600 to-green-700' },
  { id: 'salesforce', name: 'Salesforce', icon: '☁️', color: 'from-blue-600 to-blue-700' },
  { id: 'hubspot', name: 'HubSpot', icon: '📊', color: 'from-orange-600 to-orange-700' },
  { id: 'slack', name: 'Slack', icon: '💬', color: 'from-pink-600 to-pink-700' },
  { id: 'zendesk', name: 'Zendesk', icon: '🎫', color: 'from-yellow-600 to-yellow-700' },
];

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [showConfig, setShowConfig] = useState<string | null>(null);
  const [configData, setConfigData] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const fetchIntegrations = async () => {
    try {
      const response = await fetch('/api/integrations');
      const data = await response.json();
      setIntegrations(data.integrations || []);
    } catch (error) {
      console.error('Failed to fetch integrations:', error);
      setIntegrations([
        {
          id: '1',
          type: 'stripe',
          name: 'Stripe',
          isConnected: true,
          syncStatus: 'SUCCESS',
          lastSyncAt: new Date(),
          config: {},
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (type: string) => {
    const integration = integrations.find((i) => i.type === type);
    if (integration) {
      setShowConfig(integration.id);
    } else {
      const newIntegration = {
        type,
        name: integrationTypes.find((t) => t.id === type)?.name || type,
        config: configData,
      };

      try {
        const response = await fetch('/api/integrations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newIntegration),
        });

        if (response.ok) {
          setConfigData({});
          fetchIntegrations();
        }
      } catch (error) {
        console.error('Failed to create integration:', error);
      }
    }
  };

  const handleDisconnect = async (id: string) => {
    if (!confirm('Are you sure you want to disconnect this integration?')) {
      return;
    }

    try {
      await fetch(`/api/integrations/${id}`, { method: 'DELETE' });
      fetchIntegrations();
    } catch (error) {
      console.error('Failed to disconnect integration:', error);
    }
  };

  const handleSync = async (id: string) => {
    try {
      await fetch(`/api/integrations/${id}/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      fetchIntegrations();
    } catch (error) {
      console.error('Failed to sync integration:', error);
    }
  };

  if (loading) {
    return <div className="p-8 text-gray-600">Loading integrations...</div>;
  }

  const connectedTypes = new Set(integrations.map((i) => i.type));
  const availableIntegrations = integrationTypes.filter(
    (t) => !connectedTypes.has(t.id)
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Integrations
        </h1>

        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Connected Services
        </h2>
        <div className="grid grid-cols-1 gap-4">
          {integrations.map((integration) => (
            <Card
              key={integration.id}
              className="bg-white border border-gray-200 rounded-xl p-6"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="text-3xl">
                      {integrationTypes.find((t) => t.id === integration.type)
                        ?.icon || '🔌'}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {integration.name}
                      </h3>
                      <Badge className="bg-emerald-600 text-white mt-1">
                        Connected
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      {integration.syncStatus === 'SUCCESS' ? (
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                      ) : integration.syncStatus === 'SYNCING' ? (
                        <Clock className="w-4 h-4 text-amber-500 animate-spin" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-red-600" />
                      )}
                      <span className="text-gray-600">
                        Status:{' '}
                        <span
                          className={
                            integration.syncStatus === 'SUCCESS'
                              ? 'text-emerald-600'
                              : 'text-amber-600'
                          }
                        >
                          {integration.syncStatus}
                        </span>
                      </span>
                    </div>

                    {integration.lastSyncAt && (
                      <div className="text-gray-600">
                        Last sync:{' '}
                        <span className="text-[#09203F] font-semibold">
                          {new Date(integration.lastSyncAt).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleSync(integration.id)}
                    className="p-2 hover:bg-gray-100 rounded transition-colors"
                    title="Sync now"
                  >
                    <RefreshCw className="w-5 h-5 text-[#09203F]" />
                  </button>
                  <button
                    onClick={() => handleDisconnect(integration.id)}
                    className="p-2 hover:bg-gray-100 rounded transition-colors"
                    title="Disconnect"
                  >
                    <Trash2 className="w-5 h-5 text-red-600" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {availableIntegrations.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Available Services
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableIntegrations.map((integration) => (
              <Card
                key={integration.id}
                className="bg-white border border-gray-200 rounded-xl p-6 hover:border-[#09203F]/20 transition-colors cursor-pointer"
              >
                <div className="text-center">
                  <div className="text-5xl mb-3">{integration.icon}</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    {integration.name}
                  </h3>
                  <Button
                    onClick={() => handleConnect(integration.id)}
                    className="w-full bg-[#09203F] hover:bg-[#0a2651] text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Connect
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {showConfig && (
        <Card className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Integration Configuration
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                API Key
              </label>
              <input
                type="password"
                placeholder="Enter your API key"
                onChange={(e) =>
                  setConfigData({ ...configData, apiKey: e.target.value })
                }
                className="w-full px-4 py-2 bg-white border border-gray-200 rounded text-gray-900 focus:outline-none focus:border-[#09203F]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Webhook URL (optional)
              </label>
              <input
                type="text"
                placeholder="https://your-domain.com/webhook"
                onChange={(e) =>
                  setConfigData({ ...configData, webhookUrl: e.target.value })
                }
                className="w-full px-4 py-2 bg-white border border-gray-200 rounded text-gray-900 focus:outline-none focus:border-[#09203F]"
              />
            </div>
            <div className="flex gap-2">
              <Button className="bg-[#09203F] hover:bg-[#0a2651] text-white">
                Save Configuration
              </Button>
              <Button
                onClick={() => setShowConfig(null)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-900"
              >
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
