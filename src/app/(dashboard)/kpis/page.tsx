'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/toast';
import { api } from '@/lib/client/api';
import { TrendingUp, TrendingDown, Download, RefreshCcw, AlertCircle, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Snapshot {
  id: string;
  value: number;
  period: string;
  recordedAt: string;
}

interface Kpi {
  id: string;
  name: string;
  description: string | null;
  unit: string;
  targetValue: number;
  warningThreshold: number;
  criticalThreshold: number;
  direction: 'HIGHER_IS_BETTER' | 'LOWER_IS_BETTER';
  dataSource: string;
  department: { id: string; name: string } | null;
  snapshots: Snapshot[];
}

function kpiStatus(kpi: Kpi, value: number | null): 'healthy' | 'warning' | 'critical' | 'unknown' {
  if (value === null) return 'unknown';
  if (kpi.direction === 'HIGHER_IS_BETTER') {
    if (value >= kpi.warningThreshold) return 'healthy';
    if (value >= kpi.criticalThreshold) return 'warning';
    return 'critical';
  }
  if (value <= kpi.warningThreshold) return 'healthy';
  if (value <= kpi.criticalThreshold) return 'warning';
  return 'critical';
}

export default function KpisPage() {
  const { data: session } = useSession();
  const toast = useToast();
  const [kpis, setKpis] = useState<Kpi[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedDept, setSelectedDept] = useState('All');
  const [computing, setComputing] = useState(false);

  const elevated = ['ADMIN', 'EXECUTIVE', 'MANAGER'].includes(session?.user?.role ?? '');

  const load = useCallback(async () => {
    try {
      setLoadError(null);
      const res = await api<{ kpis: Kpi[] }>('/api/kpis');
      setKpis(res.kpis);
    } catch (e) {
      setLoadError((e as Error).message);
      setKpis([]);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const departments = useMemo(() => {
    const names = (kpis ?? []).map((k) => k.department?.name ?? 'Company-wide');
    return ['All', ...Array.from(new Set(names))];
  }, [kpis]);

  const filtered = (kpis ?? []).filter(
    (k) => selectedDept === 'All' || (k.department?.name ?? 'Company-wide') === selectedDept
  );

  const compute = async () => {
    setComputing(true);
    try {
      const res = await api<{ computed: number; skipped: number }>('/api/kpis/compute', { method: 'POST' });
      toast.success(`Recomputed ${res.computed} KPI${res.computed === 1 ? '' : 's'} from live data`);
      void load();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setComputing(false);
    }
  };

  const exportCsv = () => {
    if (!kpis || kpis.length === 0) {
      toast.info('Nothing to export yet');
      return;
    }
    const rows = [
      ['Name', 'Department', 'Unit', 'Latest value', 'Recorded at', 'Target', 'Status', 'Data source'],
      ...kpis.map((k) => {
        const latest = k.snapshots[0];
        return [
          k.name,
          k.department?.name ?? 'Company-wide',
          k.unit,
          latest ? String(latest.value) : '',
          latest ? latest.recordedAt : '',
          String(k.targetValue),
          kpiStatus(k, latest ? latest.value : null),
          k.dataSource,
        ];
      }),
    ];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kpis-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('KPI report downloaded');
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">KPIs</h1>
          <p className="text-gray-500">Performance indicators computed from live business data.</p>
        </div>
        <div className="flex gap-2">
          {elevated && (
            <Button variant="outline" onClick={() => void compute()} loading={computing} className="bg-white">
              <RefreshCcw className="w-4 h-4 mr-2" />
              Recompute Now
            </Button>
          )}
          <Button onClick={exportCsv} className="bg-[#09203F] hover:bg-[#0a2651] text-white">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Department filter */}
      <div className="flex flex-wrap gap-2">
        {departments.map((dept) => (
          <Button
            key={dept}
            size="sm"
            variant="outline"
            onClick={() => setSelectedDept(dept)}
            className={cn(
              selectedDept === dept
                ? 'bg-[#09203F] text-white border-[#09203F] hover:bg-[#0a2651]'
                : 'bg-white border-gray-200 text-gray-700 hover:border-[#09203F]/50'
            )}
          >
            {dept}
          </Button>
        ))}
      </div>

      {loadError && (
        <Card className="border-red-200 bg-red-50 p-6 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-800">Could not load KPIs</p>
            <p className="text-xs text-red-600 mt-0.5">{loadError}</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => void load()}>
            Retry
          </Button>
        </Card>
      )}

      {kpis === null && !loadError && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-xl" />
          ))}
        </div>
      )}

      {kpis !== null && filtered.length === 0 && !loadError && (
        <div className="text-center py-16">
          <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-2">No KPI values yet</p>
          {elevated ? (
            <Button variant="outline" onClick={() => void compute()} loading={computing}>
              <RefreshCcw className="w-4 h-4 mr-2" />
              Compute from live data
            </Button>
          ) : (
            <p className="text-gray-400 text-sm">Ask a manager to run the first KPI computation.</p>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((kpi) => {
          const latest = kpi.snapshots[0] ?? null;
          const previous = kpi.snapshots[1] ?? null;
          const value = latest?.value ?? null;
          const status = kpiStatus(kpi, value);
          const pct =
            value === null || kpi.targetValue === 0 ? 0 : Math.min(100, Math.max(0, (value / kpi.targetValue) * 100));
          const trendPct =
            latest && previous && previous.value !== 0
              ? Math.round(((latest.value - previous.value) / Math.abs(previous.value)) * 100)
              : null;

          return (
            <Card key={kpi.id} className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md hover:border-[#09203F]/20 transition-all">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{kpi.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">{kpi.department?.name ?? 'Company-wide'}</p>
                  </div>
                  <Badge
                    variant="outline"
                    className={cn(
                      'text-xs font-medium',
                      status === 'healthy' && 'bg-emerald-500/10 text-emerald-700 border-emerald-200',
                      status === 'warning' && 'bg-yellow-500/10 text-yellow-700 border-yellow-200',
                      status === 'critical' && 'bg-red-500/10 text-red-700 border-red-200',
                      status === 'unknown' && 'bg-gray-500/10 text-gray-600 border-gray-200'
                    )}
                  >
                    {status === 'unknown' ? 'no data' : status}
                  </Badge>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="w-full bg-gray-200 h-3 rounded-full overflow-hidden">
                      <div
                        className={cn(
                          'h-full transition-all',
                          status === 'critical' ? 'bg-red-500' : status === 'warning' ? 'bg-amber-500' : 'bg-[#09203F]'
                        )}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-2">
                      <span>0</span>
                      <span>{value !== null ? value.toLocaleString() : '—'}</span>
                      <span>{kpi.targetValue.toLocaleString()} (target)</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Current</p>
                      <p className="text-lg font-bold text-gray-900">
                        {value !== null ? value.toLocaleString() : '—'}
                        <span className="text-xs text-gray-400 ml-1">{kpi.unit}</span>
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Target</p>
                      <p className="text-lg font-bold text-gray-900">
                        {kpi.targetValue.toLocaleString()}
                        <span className="text-xs text-gray-400 ml-1">{kpi.unit}</span>
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Trend</p>
                      <div className="flex items-center gap-1">
                        {trendPct !== null && trendPct > 0 && <TrendingUp className="w-4 h-4 text-emerald-600" />}
                        {trendPct !== null && trendPct < 0 && <TrendingDown className="w-4 h-4 text-red-600" />}
                        <span
                          className={cn(
                            'text-sm font-bold',
                            trendPct === null && 'text-gray-400',
                            trendPct !== null && trendPct > 0 && 'text-emerald-600',
                            trendPct !== null && trendPct < 0 && 'text-red-600',
                            trendPct === 0 && 'text-gray-500'
                          )}
                        >
                          {trendPct === null ? '—' : trendPct === 0 ? '0%' : `${trendPct > 0 ? '+' : ''}${trendPct}%`}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200 flex items-center justify-between">
                    <p className="text-xs text-gray-500">
                      {latest ? `Last computed ${new Date(latest.recordedAt).toLocaleString()}` : 'Not yet computed'}
                    </p>
                    <p className="text-[10px] uppercase tracking-wide text-gray-400">{kpi.dataSource}</p>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
