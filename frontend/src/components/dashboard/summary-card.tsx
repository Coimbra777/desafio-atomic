'use client';

type SummaryCardProps = {
  eyebrow: string;
  title: string;
  value: number | string;
  toneClassName: string;
};

export function SummaryCard({
  eyebrow,
  title,
  value,
  toneClassName,
}: SummaryCardProps): JSX.Element {
  return (
    <div className="panel-surface rounded-[1.75rem] px-5 py-5">
      <p className={`font-display text-xs uppercase tracking-[0.28em] ${toneClassName}`}>
        {eyebrow}
      </p>
      <p className="mt-3 text-sm text-ink/60">{title}</p>
      <p className="mt-4 font-display text-4xl text-ink">{value}</p>
    </div>
  );
}
