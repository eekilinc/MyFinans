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
        {/* Total Monthly Expense */}
        <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-gradient-to-br dark:from-slate-900/90 dark:via-purple-950/20 dark:to-slate-900/90 border border-slate-200 dark:border-purple-500/20 p-5 shadow-sm dark:shadow-xl dark:shadow-purple-950/10 transition-colors">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {t('total_monthly_expense')}
            </span>
            <div className="p-2 rounded-2xl bg-purple-50 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-500/30">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {formatCurrency(totalAmount)}
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
            <span>Ödeme İlerlemesi</span>
            <span className="font-bold text-purple-600 dark:text-purple-400">%{paidRatio.toFixed(0)}</span>
          </div>
          <div className="mt-1.5 w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(paidRatio, 100)}%` }}
            />
          </div>
        </div>

        {/* Paid Amount */}
        <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-gradient-to-br dark:from-slate-900/90 dark:via-emerald-950/20 dark:to-slate-900/90 border border-slate-200 dark:border-emerald-500/20 p-5 shadow-sm dark:shadow-xl dark:shadow-emerald-950/10 transition-colors">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {t('paid_summary')}
            </span>
            <div className="p-2 rounded-2xl bg-emerald-50 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
              {formatCurrency(paidAmount)}
            </span>
          </div>
          <div className="mt-3 text-xs text-slate-500 dark:text-slate-400 font-medium">
            Kapanan ve ödenmiş harcamalar
          </div>
        </div>

        {/* Unpaid / Remaining Amount */}
        <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-gradient-to-br dark:from-slate-900/90 dark:via-rose-950/20 dark:to-slate-900/90 border border-slate-200 dark:border-rose-500/20 p-5 shadow-sm dark:shadow-xl dark:shadow-rose-950/10 transition-colors">
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {t('unpaid_summary')}
            </span>
            <div className="p-2 rounded-2xl bg-rose-50 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-black text-rose-600 dark:text-rose-400 tracking-tight">
              {formatCurrency(unpaidAmount)}
            </span>
          </div>
          <div className="mt-3 text-xs text-slate-500 dark:text-slate-400 font-medium">
            Ödenmeyi bekleyen aktif tutar
          </div>
        </div>
      </div>

      {/* Budget Limit Banner / Gauge */}
      {budgetLimit > 0 ? (
        <div
          className={`p-4 sm:p-5 rounded-3xl border transition-all duration-300 ${
            isOverBudget
              ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-500/40 text-rose-800 dark:text-rose-200'
              : isNearBudget
              ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-500/40 text-amber-800 dark:text-amber-200'
              : 'bg-white dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-300 shadow-sm'
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className={`p-2.5 rounded-2xl ${
                  isOverBudget
                    ? 'bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400'
                    : isNearBudget
                    ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400'
                    : 'bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400'
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
                    className={`text-xs font-extrabold px-2 py-0.5 rounded-full ${
                      isOverBudget
                        ? 'bg-rose-600 text-white'
                        : isNearBudget
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300'
                    }`}
                  >
                    %{budgetRatio.toFixed(0)}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
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
              className="self-start sm:self-auto text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors"
            >
              Limiti Güncelle
            </button>
          </div>

          <div className="mt-3.5 w-full h-2.5 bg-slate-100 dark:bg-slate-800/90 rounded-full overflow-hidden p-0.5 border border-slate-200 dark:border-slate-700/40">
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
        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/70 shadow-sm flex items-center justify-between gap-3 transition-colors">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-2xl bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-500/20">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-slate-200">Aylık Bütçe Hedefi Belirleyin</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
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
