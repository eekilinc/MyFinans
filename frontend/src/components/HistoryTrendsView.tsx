import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BarChart3, TrendingUp, CheckCircle2, Clock, Wallet, Calendar } from 'lucide-react';
import type { HistoryItem } from '../types';

interface HistoryTrendsViewProps {
  historyData: HistoryItem[];
}

export const HistoryTrendsView: React.FC<HistoryTrendsViewProps> = ({ historyData }) => {
  const { t } = useTranslation();

  // Group history by year
  const yearsMap: Record<number, HistoryItem[]> = {};
  historyData.forEach(item => {
    if (!yearsMap[item.year]) yearsMap[item.year] = [];
    yearsMap[item.year].push(item);
  });

  const availableYears = Object.keys(yearsMap)
    .map(Number)
    .sort((a, b) => b - a);

  const [selectedYear, setSelectedYear] = useState<number>(
    availableYears.length > 0 ? availableYears[0] : new Date().getFullYear()
  );

  const activeYearItems = (yearsMap[selectedYear] || []).sort((a, b) => b.month - a.month);

  const yearTotal = activeYearItems.reduce((sum, i) => sum + (i.total_amount || 0), 0);
  const yearPaid = activeYearItems.reduce((sum, i) => sum + (i.paid_amount || 0), 0);
  const yearUnpaid = activeYearItems.reduce((sum, i) => sum + (i.unpaid_amount || 0), 0);
  const maxMonthlyAmount = Math.max(...activeYearItems.map(i => i.total_amount || 0), 1);

  const formatCurrency = (val: number) => {
    return `₺${val.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="space-y-5">
      {/* Year Selector & Overview Banner */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/90 shadow-sm dark:shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <h2 className="text-lg font-black text-slate-900 dark:text-white">{t('chart_monthly_title')}</h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {t('history_trends_subtitle', { year: selectedYear })}
          </p>
        </div>

        {/* Year Selector Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {availableYears.map(yr => (
            <button
              key={yr}
              onClick={() => setSelectedYear(yr)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 active:scale-95 ${
                selectedYear === yr
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                  : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/70 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700/60'
              }`}
            >
              {yr}
            </button>
          ))}
        </div>
      </div>

      {/* 3 Metric Summary Cards for Selected Year */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        {/* Total Spending */}
        <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-xl p-5 transition-all">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-t-3xl" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
              {t('yearly_total')}
            </span>
            <div className="p-2.5 rounded-2xl bg-purple-100 dark:bg-purple-950/80 text-purple-600 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {formatCurrency(yearTotal)}
            </span>
          </div>
        </div>

        {/* Paid Amount */}
        <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-xl p-5 transition-all">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-t-3xl" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
              {t('yearly_paid')}
            </span>
            <div className="p-2.5 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
              {formatCurrency(yearPaid)}
            </span>
          </div>
        </div>

        {/* Remaining Amount */}
        <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-xl p-5 transition-all">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-rose-500 to-amber-500 rounded-t-3xl" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
              {t('unpaid_summary')}
            </span>
            <div className="p-2.5 rounded-2xl bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-black text-rose-600 dark:text-rose-400 tracking-tight">
              {formatCurrency(yearUnpaid)}
            </span>
          </div>
        </div>
      </div>

      {activeYearItems.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs font-semibold shadow-sm">
          <Calendar className="w-8 h-8 text-purple-500 mx-auto mb-2 opacity-60" />
          <p>{t('no_history_year')}</p>
        </div>
      ) : (
        <>
          {/* Monthly Trend Visual Bars */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-xl space-y-4 transition-colors">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span>{t('monthly_comparison_chart')}</span>
            </h3>

            <div className="space-y-3.5 pt-1">
              {activeYearItems.map(item => {
                const barPercentage = (item.total_amount / maxMonthlyAmount) * 100;
                const paidRatio =
                  item.total_amount > 0 ? (item.paid_amount / item.total_amount) * 100 : 0;

                return (
                  <div key={item.month} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {t(`month_${item.month - 1}`)}
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="text-slate-500 dark:text-slate-400">
                          {t('paid')}: <strong className="text-emerald-600 dark:text-emerald-400 font-bold">{formatCurrency(item.paid_amount)}</strong>
                        </span>
                        <span className="font-black text-slate-900 dark:text-white">
                          {formatCurrency(item.total_amount)}
                        </span>
                      </div>
                    </div>

                    <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex p-0.5 border border-slate-200 dark:border-slate-700/60">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-purple-500 via-indigo-500 to-emerald-500 transition-all duration-500"
                        style={{ width: `${Math.max(barPercentage, 2)}%` }}
                        title={`Ödenme Oranı: %${paidRatio.toFixed(0)}`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Detailed Monthly History Table */}
          <div className="rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-xl overflow-hidden transition-colors">
            <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">{t('history_table')}</h3>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                {t('months_recorded', { count: activeYearItems.length })}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50/80 dark:bg-slate-950/60 text-slate-500 dark:text-slate-400 uppercase text-[10px] font-bold border-b border-slate-200 dark:border-slate-800/80">
                  <tr>
                    <th className="py-3 px-4">{t('month')}</th>
                    <th className="py-3 px-4">{t('total')}</th>
                    <th className="py-3 px-4">{t('paid_summary')}</th>
                    <th className="py-3 px-4">{t('unpaid_summary')}</th>
                    <th className="py-3 px-4 text-right">{t('status')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                  {activeYearItems.map(item => {
                    const isAllPaid = item.unpaid_amount <= 0 && item.total_amount > 0;
                    return (
                      <tr key={item.month} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                          {t(`month_${item.month - 1}`)} {item.year}
                        </td>
                        <td className="py-3.5 px-4 text-slate-900 dark:text-white font-black">
                          {formatCurrency(item.total_amount)}
                        </td>
                        <td className="py-3.5 px-4 text-emerald-600 dark:text-emerald-400 font-bold">
                          {formatCurrency(item.paid_amount)}
                        </td>
                        <td className="py-3.5 px-4 text-rose-600 dark:text-rose-400 font-bold">
                          {formatCurrency(item.unpaid_amount)}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          {isAllPaid ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>{t('paid')}</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/50">
                              <Clock className="w-3 h-3" />
                              <span>{t('unpaid')}</span>
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
