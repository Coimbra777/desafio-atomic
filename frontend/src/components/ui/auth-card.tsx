type AuthCardProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
  footer: React.ReactNode;
};

export function AuthCard({
  eyebrow,
  title,
  description,
  children,
  footer,
}: AuthCardProps): JSX.Element {
  return (
    <div className="flex min-h-screen items-center justify-center bg-app px-4 py-12">
      <div className="w-full max-w-5xl">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:gap-10">
          {/* ── Left panel (desktop only) ──────────────────────────── */}
          <section className="hidden flex-col justify-between rounded-2xl bg-pine p-10 text-white lg:flex">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20">
                  <span className="text-xs font-bold tracking-tight text-white">TF</span>
                </div>
                <span className="text-sm font-semibold text-white/90">TaskFlow</span>
              </div>

              <h1 className="mt-12 text-4xl font-bold leading-tight tracking-tight text-white">
                Gerencie tarefas com clareza e velocidade.
              </h1>
              <p className="mt-4 text-base leading-relaxed text-white/70">
                Kanban visual, rastreamento de histórico, dashboard analítico e notificações assíncronas — tudo pronto para uso.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl bg-white/10 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-white/60">
                  Backend real
                </p>
                <p className="mt-2 text-sm text-white/80">
                  Autenticação JWT com NestJS, banco PostgreSQL e migrations versionadas.
                </p>
              </div>
              <div className="rounded-xl bg-white/10 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-white/60">
                  Fila assíncrona
                </p>
                <p className="mt-2 text-sm text-white/80">
                  Notificações via BullMQ com worker separado e Redis como broker.
                </p>
              </div>
            </div>
          </section>

          {/* ── Form panel ────────────────────────────────────────────── */}
          <section className="flex flex-col justify-center rounded-2xl bg-white px-8 py-10 shadow-panel">
            <p className="text-xs font-semibold uppercase tracking-widest text-ember">
              {eyebrow}
            </p>
            <h2 className="mt-3 text-2xl font-bold tracking-tight text-ink">{title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink/55">{description}</p>

            <div className="mt-8">{children}</div>

            <div className="mt-6 border-t border-ink/8 pt-5">{footer}</div>
          </section>
        </div>
      </div>
    </div>
  );
}
