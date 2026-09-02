import React from 'react';
import { useTranslation } from 'react-i18next';
import { TrendingUp, CheckCircle, Clock, AlertTriangle, ShieldCheck, Target } from 'lucide-react';

interface DashboardSummaryProps {
  totalAmount: number;
  paidAmount: number;
  unpaidAmount: number;
  budgetLimit: number;
  onOpenSettings: () => void;
}

export const DashboardSummary: React.FC<DashboardSummaryProps> = ({
  totalAmount,
  paidAmount,
  unpaidAmount,
  budgetLimit,
  onOpenSettings
}) => {
  const { t } = useTranslation();

  const paidRatio = totalAmount > 0 ? (paidAmount / totalAmount) * 100 : 0;
  const budgetRatio = budgetLimit > 0 ? (totalAmount / budgetLimit) * 100 : 0;
  const isOverBudget = budgetLimit > 0 && totalAmount > budgetLimit;
  const isNearBudget = budgetLimit > 0 && totalAmount >= budgetLimit * 0.8 && !isOverBudget;

  const formatCurrency = (val: number) => {
    return `₺${val.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="space-y-4">
      {/* 3 Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Monthly Expense Card */}
        <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/90 p-5 shadow-sm dark:shadow-2xl transition-all duration-200">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-purple-500 via-indigo-500 to-purple-600 rounded-t-3xl" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
              {t('total_monthly_expense')}
            </span>
            <div className="p-2.5 rounded-2xl bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/70 shadow-sm">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {formatCurrency(totalAmount)}
            </span>
          </div>
          <div className="mt-3.5 flex items-center justify-between text-xs text-slate-600 dark:text-slate-300 font-medium">
            <span>Ödeme İlerlemesi</span>
            <span className="font-extrabold text-purple-600 dark:text-purple-400">%{paidRatio.toFixed(0)}</span>
          </div>
          <div className="mt-1.5 w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700/60 p-0.5">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(paidRatio, 100)}%` }}
            />
          </div>
        </div>

        {/* Paid Amount Card */}
        <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/90 p-5 shadow-sm dark:shadow-2xl transition-all duration-200">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-t-3xl" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
              {t('paid_summary')}
            </span>
            <div className="p-2.5 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/70 shadow-sm">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
              {formatCurrency(paidAmount)}
            </span>
          </div>
          <div className="mt-3.5 text-xs text-slate-600 dark:text-slate-300 font-medium flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
            <span>Kapanan ve ödenmiş harcamalar</span>
          </div>
        </div>

        {/* Unpaid / Remaining Amount Card */}
        <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/90 p-5 shadow-sm dark:shadow-2xl transition-all duration-200">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-rose-500 to-amber-500 rounded-t-3xl" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
              {t('unpaid_summary')}
            </span>
            <div className="p-2.5 rounded-2xl bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/70 shadow-sm">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-black text-rose-600 dark:text-rose-400 tracking-tight">
              {formatCurrency(unpaidAmount)}
            </span>
          </div>
          <div className="mt-3.5 text-xs text-slate-600 dark:text-slate-300 font-medium flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
            <span>Ödenmeyi bekleyen aktif tutar</span>
          </div>
        </div>
      </div>

      {/* Budget Limit Banner / Gauge */}
      {budgetLimit > 0 ? (
        <div
          className={`p-4 sm:p-5 rounded-3xl border transition-all duration-300 ${
            isOverBudget
              ? 'bg-rose-50/90 dark:bg-slate-900 border-rose-300 dark:border-rose-500/60 text-rose-900 dark:text-rose-200 shadow-sm dark:shadow-xl'
              : isNearBudget
              ? 'bg-amber-50/90 dark:bg-slate-900 border-amber-300 dark:border-amber-500/60 text-amber-900 dark:text-amber-200 shadow-sm dark:shadow-xl'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 shadow-sm dark:shadow-xl'
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className={`p-2.5 rounded-2xl ${
                  isOverBudget
                    ? 'bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                    : isNearBudget
                    ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                    : 'bg-purple-100 dark:bg-purple-950/80 text-purple-600 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                }`}
              >
                {isOverBudget ? (
                  <AlertTriangle className="w-5 h-5 animate-pulse" />
                ) : (
                  <ShieldCheck className="w-5 h-5" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    {t('budget_usage')} ({formatCurrency(totalAmount)} / {formatCurrency(budgetLimit)})
                  </h4>
                  <span
                    className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full ${
                      isOverBudget
                        ? 'bg-rose-600 text-white shadow-sm'
                        : isNearBudget
                        ? 'bg-amber-500 text-slate-950 shadow-sm'
                        : 'bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60'
                    }`}
                  >
                    %{budgetRatio.toFixed(0)}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 font-medium">
                  {isOverBudget
                    ? t('budget_warning')
                    : isNearBudget
                    ? t('budget_near')
                    : t('budget_safe')}
                </p>
              </div>
            </div>

            <button
              onClick={onOpenSettings}
              className="self-start sm:self-auto text-xs font-bold px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 shadow-sm transition-colors active:scale-95"
            >
              Limiti Güncelle
            </button>
          </div>

          <div className="mt-3.5 w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-200 dark:border-slate-700/60">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isOverBudget
                  ? 'bg-gradient-to-r from-amber-500 to-rose-600'
                  : isNearBudget
                  ? 'bg-gradient-to-r from-emerald-500 to-amber-500'
                  : 'bg-gradient-to-r from-purple-500 to-emerald-500'
              }`}
              style={{ width: `${Math.min(budgetRatio, 100)}%` }}
            />
          </div>
        </div>
      ) : (
        <div className="p-4.5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-xl flex items-center justify-between gap-3 transition-colors">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-purple-100 dark:bg-purple-950/80 text-purple-600 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">Aylık Bütçe Hedefi Belirleyin</p>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 font-medium">
                Aylık harcama sınırınızı belirleyerek bütçenizi aşmadan tasarruf edin.
              </p>
            </div>
          </div>
          <button
            onClick={onOpenSettings}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 rounded-xl shadow-md shadow-purple-600/30 border border-purple-400/30 transition-all whitespace-nowrap active:scale-95"
          >
            <Target className="w-3.5 h-3.5" />
            <span>Şimdi Ayarla</span>
          </button>
        </div>
      )}
    </div>
  );
};
