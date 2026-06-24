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
    <main className="mx-auto flex min-h-screen max-w-6xl items-center px-6 py-12">
      <div className="grid w-full gap-10 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="hidden rounded-[2rem] border border-white/40 bg-white/30 p-10 backdrop-blur lg:block">
          <p className="font-display text-xs uppercase tracking-[0.35em] text-pine">
            TaskFlow MVP
          </p>
          <h1 className="mt-4 max-w-xl font-display text-5xl leading-tight text-ink">
            Um frontend direto, protegido e pronto para conectar o resto do fluxo.
          </h1>
          <p className="mt-6 max-w-lg text-lg text-ink/72">
            Esta etapa entrega autenticacao, persistencia simples do token e
            acesso protegido para as areas de Kanban e dashboard.
          </p>
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            <div className="panel-surface rounded-xl2 p-5">
              <p className="font-display text-xs uppercase tracking-[0.24em] text-ember">
                Backend real
              </p>
              <p className="mt-2 text-sm text-ink/75">
                Login e cadastro falam com os endpoints JWT ja implementados no
                NestJS.
              </p>
            </div>
            <div className="panel-surface rounded-xl2 p-5">
              <p className="font-display text-xs uppercase tracking-[0.24em] text-pine">
                Protecao simples
              </p>
              <p className="mt-2 text-sm text-ink/75">
                O token fica salvo localmente e as rotas protegidas validam
                `auth/me` ao abrir.
              </p>
            </div>
          </div>
        </section>

        <section className="panel-surface rounded-[2rem] p-8 sm:p-10">
          <p className="font-display text-xs uppercase tracking-[0.35em] text-ember">
            {eyebrow}
          </p>
          <h2 className="mt-4 font-display text-4xl text-ink">{title}</h2>
          <p className="mt-3 max-w-md text-base text-ink/70">{description}</p>
          <div className="mt-8">{children}</div>
          <div className="mt-6 border-t border-ink/10 pt-5">{footer}</div>
        </section>
      </div>
    </main>
  );
}

