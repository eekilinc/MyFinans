import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  CreditCard,
  Landmark,
  Wallet,
  ChevronDown,
  ChevronUp,
  Plus,
  Edit3,
  Trash2,
  Calendar
} from 'lucide-react';
import type { ExpenseGroup, Transaction } from '../types';
import { TransactionItem } from './TransactionItem';

interface ExpenseGroupCardProps {
  group: ExpenseGroup;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onAddTransaction: (groupId: string) => void;
  onEditGroup: (group: ExpenseGroup) => void;
  onDeleteGroup: (groupId: string) => void;
  onTogglePaid: (txId: string) => void;
  onEditTransaction: (tx: Transaction) => void;
  onDuplicateTransaction: (tx: Transaction) => void;
  onDeleteTransaction: (txId: string) => void;
  categoryFilter: string | null;
}

export const ExpenseGroupCard: React.FC<ExpenseGroupCardProps> = ({
  group,
  isExpanded,
  onToggleExpand,
  onAddTransaction,
  onEditGroup,
  onDeleteGroup,
  onTogglePaid,
  onEditTransaction,
  onDuplicateTransaction,
  onDeleteTransaction,
  categoryFilter
}) => {
  const { t } = useTranslation();

  const filteredTransactions = categoryFilter
    ? group.transactions.filter(t => (t.category || 'other') === categoryFilter)
    : group.transactions;

  const totalAmount = group.total_amount || 0;
  const paidAmount = group.paid_amount || 0;
  const unpaidAmount = totalAmount - paidAmount;
  const progressRatio = totalAmount > 0 ? (paidAmount / totalAmount) * 100 : 0;

  const formatCurrency = (val: number) => {
    return `₺${val.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const getGroupIcon = (type: string) => {
    switch (type) {
      case 'credit_card':
        return <CreditCard className="w-5 h-5 text-purple-600 dark:text-purple-400" />;
      case 'loan':
        return <Landmark className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />;
      default:
        return <Wallet className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />;
    }
  };

  return (
    <div className="rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-xl overflow-hidden transition-all duration-200">
      {/* Group Card Header */}
      <div className="p-4 sm:p-5 flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          {/* Title & Meta */}
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-purple-50 dark:bg-slate-800/90 border border-purple-100 dark:border-slate-700/60 shadow-inner">
              {getGroupIcon(group.type)}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-tight">
                  {group.name}
                </h3>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/40">
                  {t(group.type)}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                {group.bank_name && (
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{group.bank_name}</span>
                )}
                {group.statement_day ? (
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                    {t('billing_cycle', {
                      statement: `${group.statement_day}${t('due_day_suffix')}`,
                      due: `${group.due_day}${t('due_day_suffix')}`
                    })}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                    {t('due_day')}: {group.due_day}
                    {t('due_day_suffix')}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Group Action Tools */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => onAddTransaction(group.id)}
              className="p-2 rounded-xl bg-purple-50 hover:bg-purple-100 dark:bg-purple-600/20 dark:hover:bg-purple-600/30 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-500/30 transition-all active:scale-95"
              title={t('add_transaction')}
            >
              <Plus className="w-4 h-4" />
            </button>
            <button
              onClick={() => onEditGroup(group)}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-transparent transition-all active:scale-95"
              title={t('edit_group')}
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDeleteGroup(group.id)}
              className="p-2 rounded-xl bg-slate-100 hover:bg-rose-100 dark:bg-slate-800 dark:hover:bg-rose-950/40 text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 border border-slate-200 dark:border-transparent transition-all active:scale-95"
              title={t('delete')}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Group Financial Metrics & Accordion Trigger */}
        <div className="pt-3 border-t border-slate-200 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-4 flex-wrap">
            <div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold block">Aylık Tutar</span>
              <span className="text-base font-black text-slate-900 dark:text-white">
                {formatCurrency(totalAmount)}
              </span>
            </div>
            <div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold block">Kalan</span>
              <span
                className={`text-base font-black ${
                  unpaidAmount > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
                }`}
              >
                {formatCurrency(unpaidAmount)}
              </span>
            </div>
          </div>

          {/* Progress bar and toggle button */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:block w-32">
              <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-emerald-500 rounded-full"
                  style={{ width: `${Math.min(progressRatio, 100)}%` }}
                />
              </div>
            </div>

            <button
              onClick={onToggleExpand}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/90 dark:hover:bg-slate-700/90 border border-slate-200 dark:border-slate-700/60 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors"
            >
              <span>
                {group.transactions.length} {t('tx_count')}
              </span>
              {isExpanded ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Accordion Transactions Container */}
      {isExpanded && (
        <div className="p-4 sm:p-5 bg-slate-50/70 dark:bg-slate-950/60 border-t border-slate-200 dark:border-slate-800/90 space-y-2.5">
          {filteredTransactions.length === 0 ? (
            <div className="py-6 text-center text-slate-500 dark:text-slate-400 text-xs font-medium">
              {categoryFilter
                ? 'Seçili kategoriye ait işlem bulunamadı.'
                : t('no_transactions')}
            </div>
          ) : (
            filteredTransactions.map(tx => (
              <TransactionItem
                key={tx.id}
                tx={tx}
                onTogglePaid={onTogglePaid}
                onEdit={onEditTransaction}
                onDuplicate={onDuplicateTransaction}
                onDelete={onDeleteTransaction}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
};
