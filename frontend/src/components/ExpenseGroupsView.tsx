import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FolderPlus, ChevronsUpDown } from 'lucide-react';
import type { ExpenseGroup, Transaction, GroupType } from '../types';
import { ExpenseGroupCard } from './ExpenseGroupCard';

interface ExpenseGroupsViewProps {
  groups: ExpenseGroup[];
  expandedGroups: Record<string, boolean>;
  onToggleGroupExpand: (groupId: string) => void;
  onExpandAll: (expand: boolean) => void;
  onOpenAddGroup: () => void;
  onAddTransaction: (groupId: string) => void;
  onEditGroup: (group: ExpenseGroup) => void;
  onDeleteGroup: (groupId: string) => void;
  onTogglePaid: (txId: string) => void;
  onEditTransaction: (tx: Transaction) => void;
  onDuplicateTransaction: (tx: Transaction) => void;
  onDeleteTransaction: (txId: string) => void;
  categoryFilter: string | null;
}

export const ExpenseGroupsView: React.FC<ExpenseGroupsViewProps> = ({
  groups,
  expandedGroups,
  onToggleGroupExpand,
  onExpandAll,
  onOpenAddGroup,
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
  const [typeFilter, setTypeFilter] = useState<GroupType | 'all'>('all');

  const filteredGroups = groups.filter(g => {
    if (typeFilter !== 'all' && g.type !== typeFilter) return false;
    return true;
  });

  const allExpanded = groups.length > 0 && groups.every(g => expandedGroups[g.id]);

  if (groups.length === 0) {
    return (
      <div className="p-8 sm:p-12 rounded-3xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 text-center space-y-4 shadow-sm">
        <div className="w-16 h-16 rounded-3xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 flex items-center justify-center mx-auto shadow-inner">
          <FolderPlus className="w-8 h-8" />
        </div>
        <div className="max-w-md mx-auto">
          <h3 className="text-lg font-black text-slate-900 dark:text-white">Ödeme Grubu Ekleyin</h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">{t('no_groups')}</p>
        </div>
        <button
          onClick={onOpenAddGroup}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-sm font-bold text-white shadow-lg shadow-purple-600/30 transition-all active:scale-95"
        >
          <FolderPlus className="w-4 h-4" />
          <span>{t('add_group')}</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Top Filter and Accordion Control Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Type Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {(['all', 'credit_card', 'loan', 'debt', 'other'] as const).map(type => (
            <button
              key={type}
              onClick={() => setTypeFilter(type)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                typeFilter === type
                  ? 'bg-purple-600 text-white shadow-sm shadow-purple-600/30'
                  : 'bg-white dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-800'
              }`}
            >
              {type === 'all' ? t('all') : t(type)}
            </button>
          ))}
        </div>

        {/* Expand / Collapse All */}
        <button
          onClick={() => onExpandAll(!allExpanded)}
          className="self-end sm:self-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-800 text-xs font-semibold transition-colors"
        >
          <ChevronsUpDown className="w-3.5 h-3.5" />
          <span>{allExpanded ? 'Tümünü Daralt' : 'Tümünü Genişlet'}</span>
        </button>
      </div>

      {/* Expense Group Cards List */}
      <div className="space-y-4">
        {filteredGroups.map(group => (
          <ExpenseGroupCard
            key={group.id}
            group={group}
            isExpanded={!!expandedGroups[group.id]}
            onToggleExpand={() => onToggleGroupExpand(group.id)}
            onAddTransaction={onAddTransaction}
            onEditGroup={onEditGroup}
            onDeleteGroup={onDeleteGroup}
            onTogglePaid={onTogglePaid}
            onEditTransaction={onEditTransaction}
            onDuplicateTransaction={onDuplicateTransaction}
            onDeleteTransaction={onDeleteTransaction}
            categoryFilter={categoryFilter}
          />
        ))}
      </div>
    </div>
  );
};
