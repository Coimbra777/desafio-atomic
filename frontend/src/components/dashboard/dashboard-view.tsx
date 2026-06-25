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
import type { DashboardSummary, DashboardSummaryFilters } from '@/types/dashboard';
import { TASK_STATUS_LABELS } from '@/types/task';

import { SummaryCard } from './summary-card';

const statusColors = ['#ad5d3d', '#28594d', '#7b867f', '#1b1f1d'];

type FilterState = {
  startDate: string;
  endDate: string;
};

const initialFilters: FilterState = {
  startDate: '',
  endDate: '',
};

function formatDateLabel(value: string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
  }).format(new Date(`${value}T00:00:00`));
}

export function DashboardView(): JSX.Element {
  const { token } = useAuth();
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [appliedFilters, setAppliedFilters] =
    useState<DashboardSummaryFilters>({});

  useEffect(() => {
    if (!token) {
      return;
    }

    const authToken = token;

    async function loadSummary(): Promise<void> {
      setLoading(true);
      setError(null);

      try {
        const payload = await getDashboardSummary(authToken, appliedFilters);
        setSummary(payload);
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : 'Nao foi possivel carregar o dashboard.',
        );
      } finally {
        setLoading(false);
      }
    }

    void loadSummary();
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
          item.assigneeName.length > 16
            ? `${item.assigneeName.slice(0, 16)}...`
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
    setFilters((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function applyFilters(): void {
    setAppliedFilters({
      startDate: filters.startDate || undefined,
      endDate: filters.endDate || undefined,
    });
  }

  function clearFilters(): void {
    setFilters(initialFilters);
    setAppliedFilters({});
  }

  return (
    <section className="grid gap-6">
      <div className="panel-surface flex flex-col gap-5 rounded-[2rem] px-5 py-5 lg:flex-row lg:items-end lg:justify-between lg:px-6">
        <div>
          <p className="font-display text-xs uppercase tracking-[0.3em] text-pine">
            Dashboard analitico
          </p>
          <h1 className="mt-2 font-display text-3xl text-ink sm:text-4xl">
            Panorama simples do fluxo
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-ink/70">
            Veja distribuicao dos cards por status, tarefas por responsavel, total de atrasos e conclusoes por dia com dados reais do backend.
          </p>
        </div>

        <div className="soft-board grid gap-4 rounded-[1.5rem] px-4 py-4 sm:grid-cols-3">
          <label className="grid gap-2 text-sm text-ink">
            <span className="font-display text-xs uppercase tracking-[0.2em] text-ink/60">
              Data inicial
            </span>
            <input
              className="rounded-[1rem] border border-ink/10 bg-white px-4 py-3 outline-none transition focus:border-pine"
              onChange={(event) => updateFilter('startDate', event.target.value)}
              type="date"
              value={filters.startDate}
            />
          </label>

          <label className="grid gap-2 text-sm text-ink">
            <span className="font-display text-xs uppercase tracking-[0.2em] text-ink/60">
              Data final
            </span>
            <input
              className="rounded-[1rem] border border-ink/10 bg-white px-4 py-3 outline-none transition focus:border-pine"
              onChange={(event) => updateFilter('endDate', event.target.value)}
              type="date"
              value={filters.endDate}
            />
          </label>

          <div className="flex flex-wrap items-end gap-3">
            <button
              className="rounded-[1rem] bg-pine px-5 py-3 text-sm font-display uppercase tracking-[0.18em] text-white transition hover:bg-pine/90"
              onClick={applyFilters}
              type="button"
            >
              Aplicar
            </button>
            <button
              className="rounded-[1rem] border border-ink/10 bg-white px-5 py-3 text-sm font-display uppercase tracking-[0.18em] text-ink transition hover:bg-sand/35"
              onClick={clearFilters}
              type="button"
            >
              Limpar
            </button>
          </div>
        </div>
      </div>

      {error ? (
        <div className="rounded-[1.5rem] border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {loading || !summary ? (
        <div className="panel-surface rounded-[2rem] p-8 text-sm text-ink/65">
          Carregando resumo do dashboard...
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryCard
              eyebrow="Total"
              title="Tasks no periodo"
              toneClassName="text-ink/70"
              value={summary.totals.totalTasks}
            />
            <SummaryCard
              eyebrow="Concluidas"
              title="Cards em done"
              toneClassName="text-pine"
              value={summary.totals.completedTasks}
            />
            <SummaryCard
              eyebrow="Atrasadas"
              title="Tasks vencidas e nao concluidas"
              toneClassName="text-ember"
              value={summary.totals.overdueTasks}
            />
            <SummaryCard
              eyebrow="Periodo"
              title="Filtro aplicado"
              toneClassName="text-ink/70"
              value={
                summary.filters.startDate || summary.filters.endDate
                  ? `${summary.filters.startDate ?? '...'} ate ${summary.filters.endDate ?? '...'}`
                  : 'Todos'
              }
            />
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.05fr,0.95fr]">
            <div className="panel-surface rounded-[1.75rem] px-5 py-5">
              <div className="mb-4">
                <p className="font-display text-xs uppercase tracking-[0.25em] text-ember">
                  Cards por status
                </p>
                <h2 className="mt-2 text-xl font-semibold text-ink">
                  Distribuicao atual do quadro
                </h2>
              </div>

              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={statusChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#d8d1c4" />
                    <XAxis dataKey="name" stroke="#615c54" />
                    <YAxis allowDecimals={false} stroke="#615c54" />
                    <Tooltip />
                    <Bar dataKey="total" radius={[12, 12, 0, 0]}>
                      {statusChartData.map((entry, index) => (
                        <Cell
                          key={`${entry.name}-${statusColors[index] ?? 'default'}`}
                          fill={statusColors[index] ?? '#28594d'}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="panel-surface rounded-[1.75rem] px-5 py-5">
              <div className="mb-4">
                <p className="font-display text-xs uppercase tracking-[0.25em] text-pine">
                  Tarefas por responsavel
                </p>
                <h2 className="mt-2 text-xl font-semibold text-ink">
                  Distribuicao de ownership
                </h2>
              </div>

              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={assigneeChartData} layout="vertical" margin={{ left: 12 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#d8d1c4" />
                    <XAxis allowDecimals={false} type="number" stroke="#615c54" />
                    <YAxis dataKey="name" type="category" width={96} stroke="#615c54" />
                    <Tooltip />
                    <Bar dataKey="total" fill="#28594d" radius={[0, 12, 12, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.05fr,0.95fr]">
            <div className="panel-surface rounded-[1.75rem] px-5 py-5">
              <div className="mb-4">
                <p className="font-display text-xs uppercase tracking-[0.25em] text-ink/70">
                  Conclusoes por dia
                </p>
                <h2 className="mt-2 text-xl font-semibold text-ink">
                  Ritmo de entregas
                </h2>
              </div>

              <div className="h-72">
                {completionsChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={completionsChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#d8d1c4" />
                      <XAxis dataKey="date" stroke="#615c54" />
                      <YAxis allowDecimals={false} stroke="#615c54" />
                      <Tooltip />
                      <Line
                        dataKey="total"
                        stroke="#ad5d3d"
                        strokeWidth={3}
                        dot={{ fill: '#ad5d3d', r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center rounded-[1.5rem] border border-dashed border-ink/10 bg-white/60 px-4 text-center text-sm text-ink/45">
                    Ainda nao ha movimentacoes para done no periodo selecionado.
                  </div>
                )}
              </div>
            </div>

            <div className="panel-surface rounded-[1.75rem] px-5 py-5">
              <div className="mb-4">
                <p className="font-display text-xs uppercase tracking-[0.25em] text-ember">
                  Tasks atrasadas
                </p>
                <h2 className="mt-2 text-xl font-semibold text-ink">
                  Acumulado que merece atencao
                </h2>
              </div>

              <div className="rounded-[1.4rem] bg-[#f8d8cf] px-6 py-8">
                <p className="text-sm text-ink/60">
                  Total de cards com prazo vencido e ainda fora de concluido.
                </p>
                <p className="mt-4 font-display text-6xl text-ember">
                  {summary.totals.overdueTasks}
                </p>
                <p className="mt-4 text-sm leading-6 text-ink/70">
                  Este total considera a base filtrada pelo periodo informado no topo da pagina e ignora tasks ja concluidas.
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
