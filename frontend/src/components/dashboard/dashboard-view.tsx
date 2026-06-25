'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { getDashboardSummary } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import type { DashboardSummary, DashboardSummaryFilters } from '@/types/dashboard';
import { TASK_STATUS_LABELS } from '@/types/task';

import { SummaryCard } from './summary-card';

const statusColors = ['#f59e0b', '#28594d', '#8b5cf6', '#10b981'];

type FilterState = {
  startDate: string;
  endDate: string;
};

const initialFilters: FilterState = { startDate: '', endDate: '' };

function formatDateLabel(value: string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
  }).format(new Date(`${value}T00:00:00`));
}

const inputClass =
  'w-full rounded-lg border border-ink/12 bg-white px-3.5 py-2.5 text-sm text-ink outline-none transition focus:border-pine focus:ring-2 focus:ring-pine/15';

const chartGridProps = { strokeDasharray: '3 3', stroke: '#e5e7eb' };
const chartAxisProps = { stroke: '#9ca3af', fontSize: 12 };

export function DashboardView(): JSX.Element {
  const { token } = useAuth();
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [appliedFilters, setAppliedFilters] =
    useState<DashboardSummaryFilters>({});

  useEffect(() => {
    if (!token) return;

    let cancelled = false;
    const authToken = token;

    setLoading(true);
    setError(null);

    getDashboardSummary(authToken, appliedFilters)
      .then((payload) => {
        if (!cancelled) {
          setSummary(payload);
          setLoading(false);
        }
      })
      .catch((loadError: unknown) => {
        if (!cancelled) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : 'Não foi possível carregar o dashboard.',
          );
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [appliedFilters, token]);

  const statusChartData = useMemo(
    () =>
      (summary?.byStatus ?? []).map((item) => ({
        name: TASK_STATUS_LABELS[item.status],
        total: item.count,
      })),
    [summary],
  );

  const assigneeChartData = useMemo(
    () =>
      (summary?.byAssignee ?? []).map((item) => ({
        name:
          item.assigneeName.length > 18
            ? `${item.assigneeName.slice(0, 18)}…`
            : item.assigneeName,
        total: item.count,
      })),
    [summary],
  );

  const completionsChartData = useMemo(
    () =>
      (summary?.completionsByDay ?? []).map((item) => ({
        date: formatDateLabel(item.date),
        total: item.count,
      })),
    [summary],
  );

  function updateFilter(field: keyof FilterState, value: string): void {
    setFilters((current) => ({ ...current, [field]: value }));
  }

  function applyFilters(): void {
    if (filters.startDate && filters.endDate && filters.startDate > filters.endDate) {
      setError('A data inicial não pode ser maior que a data final.');
      return;
    }
    setError(null);
    setAppliedFilters({
      startDate: filters.startDate || undefined,
      endDate: filters.endDate || undefined,
    });
  }

  function clearFilters(): void {
    setFilters(initialFilters);
    setAppliedFilters({});
  }

  const hasFilters = Boolean(appliedFilters.startDate ?? appliedFilters.endDate);

  return (
    <div className="grid gap-6">
      {/* ── Page header + filters ─────────────────────────────────────── */}
      <div className="flex flex-col gap-5 rounded-2xl border border-ink/8 bg-white p-5 shadow-panel sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-ink">Dashboard</h1>
          <p className="mt-0.5 text-sm text-ink/50">
            Visão geral das tarefas e métricas do time.
          </p>
        </div>

        <div className="flex flex-wrap items-end gap-3">
          <label className="grid gap-1.5">
            <span className="text-xs font-medium text-ink/50">Data inicial</span>
            <input
              className={inputClass}
              onChange={(event) => updateFilter('startDate', event.target.value)}
              style={{ width: '8.5rem' }}
              type="date"
              value={filters.startDate}
            />
          </label>

          <label className="grid gap-1.5">
            <span className="text-xs font-medium text-ink/50">Data final</span>
            <input
              className={inputClass}
              onChange={(event) => updateFilter('endDate', event.target.value)}
              style={{ width: '8.5rem' }}
              type="date"
              value={filters.endDate}
            />
          </label>

          <Button variant="primary" size="md" onClick={applyFilters} type="button">
            Aplicar
          </Button>

          {hasFilters ? (
            <Button variant="ghost" size="md" onClick={clearFilters} type="button">
              Limpar
            </Button>
          ) : null}
        </div>
      </div>

      {/* ── Error ─────────────────────────────────────────────────────── */}
      {error ? <Alert>{error}</Alert> : null}

      {/* ── Loading ───────────────────────────────────────────────────── */}
      {loading || !summary ? (
        <div className="flex h-48 items-center justify-center rounded-2xl border border-ink/8 bg-white text-sm text-ink/50 shadow-panel">
          Carregando resumo do dashboard...
        </div>
      ) : (
        <>
          {/* ── Summary cards ─────────────────────────────────────────── */}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryCard
              eyebrow="Total"
              title="Tasks no período"
              toneClassName="text-ink/50"
              value={summary.totals.totalTasks}
            />
            <SummaryCard
              eyebrow="Concluídas"
              title="Chegaram ao status Done"
              toneClassName="text-emerald-600"
              value={summary.totals.completedTasks}
            />
            <SummaryCard
              eyebrow="Atrasadas"
              title="Prazo vencido e não concluídas"
              toneClassName="text-ember"
              value={summary.totals.overdueTasks}
            />
            <SummaryCard
              eyebrow="Período"
              title="Filtro aplicado"
              toneClassName="text-pine"
              value={
                summary.filters.startDate ?? summary.filters.endDate
                  ? `${summary.filters.startDate ?? '…'} até ${summary.filters.endDate ?? '…'}`
                  : 'Todos os tempos'
              }
            />
          </div>

          {/* ── Charts row 1 ──────────────────────────────────────────── */}
          <div className="grid gap-5 xl:grid-cols-2">
            {/* Status chart */}
            <div className="rounded-2xl border border-ink/8 bg-white p-5 shadow-panel">
              <p className="text-xs font-semibold uppercase tracking-widest text-ember">
                Distribuição por status
              </p>
              <h2 className="mt-1 text-base font-semibold text-ink">
                Tasks por etapa do fluxo
              </h2>
              <div className="mt-5 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={statusChartData} barSize={36}>
                    <CartesianGrid {...chartGridProps} />
                    <XAxis dataKey="name" {...chartAxisProps} />
                    <YAxis allowDecimals={false} {...chartAxisProps} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: '0.625rem',
                        border: '1px solid rgba(27,31,29,0.10)',
                        fontSize: '0.8125rem',
                      }}
                    />
                    <Bar dataKey="total" radius={[6, 6, 0, 0]}>
                      {statusChartData.map((entry, index) => (
                        <Cell
                          key={`${entry.name}-${index}`}
                          fill={statusColors[index] ?? '#28594d'}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Assignee chart */}
            <div className="rounded-2xl border border-ink/8 bg-white p-5 shadow-panel">
              <p className="text-xs font-semibold uppercase tracking-widest text-pine">
                Distribuição por responsável
              </p>
              <h2 className="mt-1 text-base font-semibold text-ink">
                Ownership das tarefas
              </h2>
              <div className="mt-5 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={assigneeChartData}
                    layout="vertical"
                    margin={{ left: 8, right: 16 }}
                  >
                    <CartesianGrid {...chartGridProps} />
                    <XAxis allowDecimals={false} type="number" {...chartAxisProps} />
                    <YAxis
                      dataKey="name"
                      type="category"
                      width={100}
                      {...chartAxisProps}
                      tick={{ fontSize: 11 }}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: '0.625rem',
                        border: '1px solid rgba(27,31,29,0.10)',
                        fontSize: '0.8125rem',
                      }}
                    />
                    <Bar dataKey="total" fill="#28594d" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* ── Charts row 2 ──────────────────────────────────────────── */}
          <div className="grid gap-5 xl:grid-cols-[1.4fr_0.6fr]">
            {/* Completions line chart */}
            <div className="rounded-2xl border border-ink/8 bg-white p-5 shadow-panel">
              <p className="text-xs font-semibold uppercase tracking-widest text-ink/50">
                Ritmo de entregas
              </p>
              <h2 className="mt-1 text-base font-semibold text-ink">
                Conclusões por dia
              </h2>
              <div className="mt-5 h-56">
                {completionsChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={completionsChartData}>
                      <CartesianGrid {...chartGridProps} />
                      <XAxis dataKey="date" {...chartAxisProps} />
                      <YAxis allowDecimals={false} {...chartAxisProps} />
                      <Tooltip
                        contentStyle={{
                          borderRadius: '0.625rem',
                          border: '1px solid rgba(27,31,29,0.10)',
                          fontSize: '0.8125rem',
                        }}
                      />
                      <Line
                        dataKey="total"
                        stroke="#ad5d3d"
                        strokeWidth={2.5}
                        dot={{ fill: '#ad5d3d', r: 4, strokeWidth: 2, stroke: '#fff' }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-ink/10 text-center text-sm text-ink/35">
                    Nenhuma task concluída no período.
                  </div>
                )}
              </div>
            </div>

            {/* Overdue highlight */}
            <div className="flex flex-col rounded-2xl border border-ember/20 bg-ember/5 p-5 shadow-panel">
              <p className="text-xs font-semibold uppercase tracking-widest text-ember">
                Atenção
              </p>
              <h2 className="mt-1 text-base font-semibold text-ink">
                Tasks atrasadas
              </h2>
              <div className="mt-6 flex flex-1 flex-col items-center justify-center text-center">
                <p className="font-display text-7xl font-bold tabular-nums text-ember">
                  {summary.totals.overdueTasks}
                </p>
                <p className="mt-3 max-w-[12rem] text-sm text-ink/55">
                  cards com prazo vencido ainda não concluídos.
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
