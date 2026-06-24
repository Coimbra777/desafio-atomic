export default function DashboardPage(): JSX.Element {
  return (
    <section className="grid gap-4">
      <div>
        <p className="font-display text-xs uppercase tracking-[0.3em] text-pine">
          Area protegida
        </p>
        <h1 className="font-display text-3xl text-ink">Dashboard</h1>
      </div>
      <div className="panel-surface rounded-xl2 p-6">
        <p className="text-lg text-ink">
          O dashboard real ainda nao foi implementado. Esta pagina confirma a
          protecao de rota no frontend.
        </p>
        <p className="mt-3 text-sm text-ink/70">
          O proximo passo sera conectar graficos e indicadores ao backend.
        </p>
      </div>
    </section>
  );
}

