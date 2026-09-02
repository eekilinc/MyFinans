import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BarChart3, TrendingUp, CheckCircle2, Clock } from 'lucide-react';
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
      <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800/90 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-purple-400" />
            <h2 className="text-lg font-black text-white">{t('chart_monthly_title')}</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {selectedYear} yılı boyunca gerçekleşen toplam ve ödenen harcama geçmişi.
          </p>
        </div>

        {/* Year Selector Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {availableYears.map(yr => (
            <button
              key={yr}
              onClick={() => setSelectedYear(yr)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedYear === yr
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                  : 'bg-slate-800/70 text-slate-400 hover:text-slate-200 border border-slate-700/50'
              }`}
            >
              {yr}
            </button>
          ))}
        </div>
      </div>

      {/* 3 Metric Summary Cards for Selected Year */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            {t('yearly_total')}
          </span>
          <span className="text-xl font-black text-white mt-1 block">
            {formatCurrency(yearTotal)}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/70 border border-emerald-500/20">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            {t('yearly_paid')}
          </span>
          <span className="text-xl font-black text-emerald-400 mt-1 block">
            {formatCurrency(yearPaid)}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/70 border border-rose-500/20">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            {t('unpaid_summary')}
          </span>
          <span className="text-xl font-black text-rose-400 mt-1 block">
            {formatCurrency(yearUnpaid)}
          </span>
        </div>
      </div>

      {/* Monthly Trend Visual Bars */}
      <div className="p-5 rounded-3xl bg-slate-900/70 border border-slate-800/80 shadow-lg space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-purple-400" />
          <span>Aylık Karşılaştırma Grafiği</span>
        </h3>

        <div className="space-y-3 pt-2">
          {activeYearItems.map(item => {
            const barPercentage = (item.total_amount / maxMonthlyAmount) * 100;
            const paidRatio =
              item.total_amount > 0 ? (item.paid_amount / item.total_amount) * 100 : 0;

            return (
              <div key={item.month} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-200">
                    {t(`month_${item.month - 1}`)}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-400">
                      Ödenen: <strong className="text-emerald-400">{formatCurrency(item.paid_amount)}</strong>
                    </span>
                    <span className="font-black text-white">
                      {formatCurrency(item.total_amount)}
                    </span>
                  </div>
                </div>

                <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden flex p-0.5 border border-slate-700/40">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-purple-500 via-indigo-500 to-emerald-400 transition-all duration-500"
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
      <div className="rounded-3xl bg-slate-900/80 border border-slate-800/90 shadow-xl overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-800/80 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">{t('history_table')}</h3>
          <span className="text-xs text-slate-400 font-medium">
            {activeYearItems.length} Ay Kayıtlı
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-950/60 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800/60">
              <tr>
                <th className="py-3 px-4">{t('month')}</th>
                <th className="py-3 px-4">{t('total')}</th>
                <th className="py-3 px-4">{t('paid_summary')}</th>
                <th className="py-3 px-4">{t('unpaid_summary')}</th>
                <th className="py-3 px-4 text-right">{t('status')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40 font-medium">
              {activeYearItems.map(item => {
                const isAllPaid = item.unpaid_amount <= 0 && item.total_amount > 0;
                return (
                  <tr key={item.month} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-white">
                      {t(`month_${item.month - 1}`)} {item.year}
                    </td>
                    <td className="py-3.5 px-4 text-white font-semibold">
                      {formatCurrency(item.total_amount)}
                    </td>
                    <td className="py-3.5 px-4 text-emerald-400 font-semibold">
                      {formatCurrency(item.paid_amount)}
                    </td>
                    <td className="py-3.5 px-4 text-rose-400 font-semibold">
                      {formatCurrency(item.unpaid_amount)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {isAllPaid ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-950/60 text-emerald-300 border border-emerald-800/50">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>{t('paid')}</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300">
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
    </div>
  );
};
