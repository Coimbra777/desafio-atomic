export default function KanbanPage(): JSX.Element {
  return (
    <section className="grid gap-4">
      <div>
        <p className="font-display text-xs uppercase tracking-[0.3em] text-ember">
          Area protegida
        </p>
        <h1 className="font-display text-3xl text-ink">Kanban</h1>
      </div>
      <div className="panel-surface rounded-xl2 p-6">
        <p className="text-lg text-ink">
          A base autenticada do frontend esta pronta. O quadro Kanban real entra
          na proxima etapa.
        </p>
        <p className="mt-3 text-sm text-ink/70">
          Esta pagina ja exige autenticacao e serve como placeholder protegido.
        </p>
      </div>
    </section>
  );
}

