import React from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, CheckCircle2, CreditCard, Landmark, Wallet } from 'lucide-react';
import type { ExpenseGroup } from '../types';

interface UpcomingTimelineProps {
  groups: ExpenseGroup[];
  currentDate: Date;
  onTogglePaid: (txId: string) => void;
}

export const UpcomingTimeline: React.FC<UpcomingTimelineProps> = ({
  groups,
  currentDate,
  onTogglePaid
}) => {
  const { t } = useTranslation();

  const today = new Date();
  const isCurrentMonth =
    currentDate.getFullYear() === today.getFullYear() &&
    currentDate.getMonth() === today.getMonth();

  if (!isCurrentMonth) return null;

  const currentDay = today.getDate();

  // Find all groups with unpaid transactions
  const upcomingItems = groups
    .filter(g => g.total_amount - g.paid_amount > 0)
    .map(g => {
      const unpaidAmount = g.total_amount - g.paid_amount;
      const dueDay = g.due_day;
      const diffDays = dueDay - currentDay;

      let statusType: 'today' | 'upcoming' | 'overdue' | 'future' = 'future';
      if (diffDays === 0) statusType = 'today';
      else if (diffDays < 0) statusType = 'overdue';
      else if (diffDays <= 7) statusType = 'upcoming';

      return {
        group: g,
        unpaidAmount,
        dueDay,
        diffDays,
        statusType
      };
    })
    // Sort: overdue first, then today, then upcoming, then future
    .sort((a, b) => {
      const order = { overdue: 0, today: 1, upcoming: 2, future: 3 };
      return order[a.statusType] - order[b.statusType] || a.dueDay - b.dueDay;
    });

  if (upcomingItems.length === 0) return null;

  const formatCurrency = (val: number) => {
    return `₺${val.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const getGroupIcon = (type: string) => {
    switch (type) {
      case 'credit_card':
        return <CreditCard className="w-4 h-4" />;
      case 'loan':
        return <Landmark className="w-4 h-4" />;
      default:
        return <Wallet className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-200">{t('upcoming_payments')}</h3>
        </div>
        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-500/30">
          {upcomingItems.length} Ödeme
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {upcomingItems.map(({ group, unpaidAmount, dueDay, diffDays, statusType }) => (
          <div
            key={group.id}
            className={`p-4 rounded-2xl border transition-all duration-200 flex flex-col justify-between gap-3 ${
              statusType === 'today'
                ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-500/50 shadow-sm'
                : statusType === 'overdue'
                ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-500/50 shadow-sm'
                : statusType === 'upcoming'
                ? 'bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-500/40 shadow-sm'
                : 'bg-white dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 shadow-sm'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div
                  className={`p-2 rounded-xl ${
                    statusType === 'today'
                      ? 'bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400'
                      : statusType === 'overdue'
                      ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400'
                      : 'bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400'
                  }`}
                >
                  {getGroupIcon(group.type)}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-[140px]">
                    {group.name}
                  </h4>
                  {group.bank_name && (
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                      {group.bank_name}
                    </span>
                  )}
                </div>
              </div>

              <div className="text-right">
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full inline-block ${
                    statusType === 'today'
                      ? 'bg-rose-600 text-white animate-pulse'
                      : statusType === 'overdue'
                      ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-500/40'
                      : statusType === 'upcoming'
                      ? 'bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-500/30'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {statusType === 'today'
                    ? t('due_today')
                    : statusType === 'overdue'
                    ? t('overdue_by_days', { days: Math.abs(diffDays) })
                    : statusType === 'upcoming'
                    ? t('due_in_days', { days: diffDays })
                    : `${dueDay}. gün`}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800/60">
              <div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">Kalan Tutar</span>
                <p className="text-base font-black text-slate-900 dark:text-white">{formatCurrency(unpaidAmount)}</p>
              </div>

              {group.transactions.length === 1 && (
                <button
                  onClick={() => onTogglePaid(group.transactions[0].id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-emerald-50 dark:bg-slate-800 dark:hover:bg-emerald-600/30 border border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-500/50 text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-emerald-700 dark:hover:text-emerald-300 transition-all active:scale-95"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Öde</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
