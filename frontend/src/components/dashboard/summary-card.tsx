'use client';

type SummaryCardProps = {
  eyebrow: string;
  title: string;
  value: number | string;
  toneClassName: string;
  subtitle?: string;
};

export function SummaryCard({
  eyebrow,
  title,
  value,
  toneClassName,
  subtitle,
}: SummaryCardProps): JSX.Element {
  return (
    <div className="flex flex-col rounded-2xl border border-ink/8 bg-white p-5 shadow-panel">
      <p className={`text-xs font-semibold uppercase tracking-widest ${toneClassName}`}>
        {eyebrow}
      </p>
      <p className="mt-3 text-4xl font-bold tracking-tight text-ink">{value}</p>
      <p className="mt-1.5 text-sm font-medium text-ink/55">{title}</p>
      {subtitle ? (
        <p className="mt-1 text-xs text-ink/35">{subtitle}</p>
      ) : null}
    </div>
  );
}
