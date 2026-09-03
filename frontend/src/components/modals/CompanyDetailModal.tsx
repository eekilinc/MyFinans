import React from 'react';
import { useTranslation } from 'react-i18next';
import { X, Building2, Calendar, Layers } from 'lucide-react';
import type { CompanyStats } from '../../types';

interface CompanyDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  company: CompanyStats | null;
  transactions: any[];
}

export const CompanyDetailModal: React.FC<CompanyDetailModalProps> = ({
  isOpen,
  onClose,
  company,
  transactions
}) => {
  const { t } = useTranslation();

  if (!isOpen || !company) return null;

  const formatCurrency = (val: number) => {
    return `₺${val.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl bg-white dark:bg-slate-900 border-t sm:border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[85vh] pb-safe transition-colors">
        {/* Mobile drag handle */}
        <div className="sm:hidden w-12 h-1 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mt-2.5 mb-1" />
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="p-2.5 rounded-2xl bg-purple-50 dark:bg-purple-600/20 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-500/30 shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-base font-black text-slate-900 dark:text-white truncate">{company.name}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                {t('company_tx_summary', { count: transactions.length, total: formatCurrency(company.total_amount || 0) })}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List of Transactions */}
        <div className="p-5 space-y-2.5 overflow-y-auto">
          {transactions.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs font-medium">
              {t('no_company_transactions')}
            </div>
          ) : (
            transactions.map((tx: any, idx: number) => (
              <div
                key={tx.id || idx}
                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between gap-3"
              >
                <div className="space-y-1 min-w-0">
                  <span className="text-xs font-bold text-slate-900 dark:text-white block truncate">
                    {tx.description}
                  </span>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 flex-wrap">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {tx.date}
                    </span>
                    {tx.group_name && (
                      <span className="px-2 py-0.5 rounded-md bg-slate-200/80 dark:bg-slate-700/50 text-slate-700 dark:text-slate-300 font-semibold">
                        {tx.group_name}
                      </span>
                    )}
                    {tx.is_installment && (
                      <span className="flex items-center gap-1 text-purple-600 dark:text-purple-400 font-semibold">
                        <Layers className="w-3 h-3" />
                        {t('installments_count', { count: tx.installment_count })}
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-sm font-black text-slate-900 dark:text-white block">
                    {formatCurrency(tx.amount)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
