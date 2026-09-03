import React from 'react';
import { useTranslation } from 'react-i18next';
import { PieChart, Filter } from 'lucide-react';
import type { ExpenseGroup } from '../types';
import { getCategoryConfig } from '../services/categories';

interface CategoryBreakdownProps {
  groups: ExpenseGroup[];
  selectedCategory: string | null;
  onSelectCategory: (cat: string | null) => void;
}

export const CategoryBreakdown: React.FC<CategoryBreakdownProps> = ({
  groups,
  selectedCategory,
  onSelectCategory
}) => {
  const { t } = useTranslation();

  // Aggregate monthly amounts by category
  const categoryTotals: Record<string, { amount: number; count: number }> = {};
  let totalSpending = 0;

  groups.forEach(group => {
    group.transactions.forEach(tx => {
      const cat = tx.category || 'other';
      const amt = tx.monthly_amount || 0;
      if (!categoryTotals[cat]) {
        categoryTotals[cat] = { amount: 0, count: 0 };
      }
      categoryTotals[cat].amount += amt;
      categoryTotals[cat].count += 1;
      totalSpending += amt;
    });
  });

  if (totalSpending === 0) return null;

  // Build sorted list of active categories
  const activeCategories = Object.entries(categoryTotals)
    .map(([catId, data]) => {
      const config = getCategoryConfig(catId);
      const percentage = (data.amount / totalSpending) * 100;
      return {
        id: catId,
        config,
        amount: data.amount,
        count: data.count,
        percentage
      };
    })
    .sort((a, b) => b.amount - a.amount);

  const formatCurrency = (val: number) => {
    return `₺${val.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="p-5 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <PieChart className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-200">{t('category_breakdown')}</h3>
        </div>
        {selectedCategory && (
          <button
            onClick={() => onSelectCategory(null)}
            className="flex items-center gap-1 text-xs font-semibold text-purple-700 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 bg-purple-50 dark:bg-purple-500/10 px-2.5 py-1 rounded-xl border border-purple-200 dark:border-purple-500/20"
          >
            <Filter className="w-3 h-3" />
            <span>{t('remove_filter')}</span>
          </button>
        )}
      </div>

      {/* Multi-segment stacked progress bar */}
      <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex p-0.5 border border-slate-200 dark:border-slate-700/40">
        {activeCategories.map(item => (
          <div
            key={item.id}
            style={{
              width: `${item.percentage}%`,
              backgroundColor: item.config.color
            }}
            className="h-full first:rounded-l-full last:rounded-r-full transition-all duration-300 hover:opacity-80 cursor-pointer"
            title={`${t(item.config.labelKey)}: ${formatCurrency(item.amount)} (%${item.percentage.toFixed(1)})`}
            onClick={() => onSelectCategory(selectedCategory === item.id ? null : item.id)}
          />
        ))}
      </div>

      {/* Category pills grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 pt-1">
        {activeCategories.map(item => {
          const isSelected = selectedCategory === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectCategory(isSelected ? null : item.id)}
              className={`flex items-center justify-between p-2.5 rounded-2xl border text-left transition-all active:scale-95 ${
                isSelected
                  ? 'bg-purple-50 dark:bg-purple-600/30 border-purple-400 dark:border-purple-500 shadow-sm'
                  : 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/40 dark:hover:bg-slate-800/80 border-slate-200 dark:border-slate-700/50'
              }`}
            >
              <div className="flex items-center gap-2 overflow-hidden">
                <div
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: item.config.color }}
                />
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                  {t(item.config.labelKey)}
                </span>
              </div>
              <div className="text-right shrink-0">
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  {formatCurrency(item.amount)}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                  %{item.percentage.toFixed(0)}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
