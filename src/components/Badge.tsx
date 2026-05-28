import { ReactNode } from 'react';

const tones = {
  Pending: 'bg-amber-50 text-amber-700 ring-amber-200',
  Processing: 'bg-blue-50 text-blue-700 ring-blue-200',
  Delivered: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  Cancelled: 'bg-rose-50 text-rose-700 ring-rose-200',
  active: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  inactive: 'bg-slate-100 text-slate-600 ring-slate-200',
  low: 'bg-rose-50 text-rose-700 ring-rose-200',
  good: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
} as Record<string, string>;

type BadgeProps = {
  children: ReactNode;
  tone?: string;
};

export default function Badge({ children, tone }: BadgeProps) {
  const key = tone || String(children);
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${tones[key] || 'bg-slate-100 text-slate-700 ring-slate-200'}`}>
      {children}
    </span>
  );
}
