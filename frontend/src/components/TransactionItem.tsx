import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  CheckCircle2,
  Circle,
  Repeat,
  Copy,
  Edit2,
  Trash2,
  Building2,
  Layers
} from 'lucide-react';
import type { Transaction } from '../types';
import { getCategoryConfig } from '../services/categories';

interface TransactionItemProps {
  tx: Transaction;
  onTogglePaid: (id: string) => void;
  onEdit: (tx: Transaction) => void;
  onDuplicate: (tx: Transaction) => void;
  onDelete: (id: string) => void;
}

export const TransactionItem: React.FC<TransactionItemProps> = ({
  tx,
  onTogglePaid,
  onEdit,
  onDuplicate,
  onDelete
}) => {
  const { t } = useTranslation();
  const categoryConfig = getCategoryConfig(tx.category);

  const formatCurrency = (val: number) => {
    return `₺${val.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const remainingInstallments = tx.is_installment
    ? tx.installment_count - tx.installment_no
    : 0;

  return (
    <div
      className={`group relative p-3.5 sm:p-4 rounded-2xl border transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
        tx.is_paid
          ? 'bg-slate-100/80 dark:bg-slate-900/40 border-slate-200/80 dark:border-slate-800/60 opacity-80'
          : 'bg-white dark:bg-slate-800/70 hover:bg-slate-50 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700/70 shadow-sm'
      }`}
    >
      {/* Left side: Paid Toggle, Description, Badges */}
      <div className="flex items-start sm:items-center gap-3 min-w-0">
        <button
          onClick={() => onTogglePaid(tx.id)}
          className={`mt-0.5 sm:mt-0 p-1 rounded-xl transition-transform active:scale-90 ${
            tx.is_paid
              ? 'text-emerald-600 dark:text-emerald-400 hover:text-emerald-500'
              : 'text-slate-400 dark:text-slate-500 hover:text-purple-600 dark:hover:text-slate-300'
          }`}
          title={tx.is_paid ? t('paid') : t('unpaid')}
        >
          {tx.is_paid ? (
            <CheckCircle2 className="w-5 h-5 fill-emerald-500/20" />
          ) : (
            <Circle className="w-5 h-5" />
          )}
        </button>

        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`text-sm font-bold truncate max-w-[220px] sm:max-w-xs ${
                tx.is_paid
                  ? 'line-through text-slate-400 dark:text-slate-500'
                  : 'text-slate-900 dark:text-slate-100'
              }`}
            >
              {tx.description}
            </span>

            {/* Recurring badge */}
            {tx.is_recurring && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800/50">
                <Repeat className="w-2.5 h-2.5" />
                <span>{t('recurring_active')}</span>
              </span>
            )}

            {/* Installment Badge */}
            {tx.is_installment && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/50">
                <Layers className="w-2.5 h-2.5" />
                <span>
                  {t('installment_status', {
                    no: tx.installment_no,
                    total: tx.installment_count
                  })}
                </span>
              </span>
            )}
          </div>

          {/* Subtitle info: Company, Category, Date, Remaining installments */}
          <div className="flex items-center gap-2 flex-wrap text-xs text-slate-500 dark:text-slate-400">
            {tx.company_name && (
              <span className="inline-flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                <Building2 className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                {tx.company_name}
              </span>
            )}

            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-semibold border"
              style={{
                backgroundColor: `${categoryConfig.color}15`,
                color: categoryConfig.color,
                borderColor: `${categoryConfig.color}30`
              }}
            >
              {t(categoryConfig.labelKey)}
            </span>

            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">{tx.date}</span>

            {tx.is_installment && remainingInstallments > 0 && (
              <span className="text-[11px] text-purple-600 dark:text-purple-400 font-bold">
                ({t('installments_left', { count: remainingInstallments })})
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Right side: Amount & Action buttons */}
      <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200 dark:border-slate-800">
        <div className="text-left sm:text-right">
          <span
            className={`text-base sm:text-lg font-black block leading-tight ${
              tx.is_paid ? 'text-slate-400 dark:text-slate-500' : 'text-slate-900 dark:text-white'
            }`}
          >
            {formatCurrency(tx.monthly_amount)}
          </span>
          {tx.is_installment && (
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              Toplam: {formatCurrency(tx.amount)}
            </span>
          )}
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => onDuplicate(tx)}
            className="p-1.5 rounded-lg hover:bg-cyan-50 dark:hover:bg-slate-700/60 text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-300 transition-colors"
            title={t('duplicate_transaction')}
          >
            <Copy className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => onEdit(tx)}
            className="p-1.5 rounded-lg hover:bg-purple-50 dark:hover:bg-slate-700/60 text-slate-400 hover:text-purple-600 dark:hover:text-purple-300 transition-colors"
            title={t('edit_transaction')}
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => onDelete(tx.id)}
            className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
            title={t('delete')}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
