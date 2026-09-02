import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, X, Calendar, Building2 } from 'lucide-react';
import { getCategoryConfig } from '../../services/categories';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (query: string) => any[];
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose, onSearch }) => {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);

  useEffect(() => {
    if (query.trim().length >= 2) {
      const found = onSearch(query.trim());
      setResults(found);
    } else {
      setResults([]);
    }
  }, [query, onSearch]);

  if (!isOpen) return null;

  const formatCurrency = (val: number) => {
    return `₺${val.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-2 sm:p-4 pt-10 sm:pt-24 bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-xl rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-800 flex items-center gap-3">
          <Search className="w-5 h-5 text-purple-400 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={t('search_placeholder')}
            autoFocus
            className="w-full bg-transparent text-sm font-bold text-white placeholder-slate-500 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-lg text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors ml-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results Body */}
        <div className="p-4 space-y-2.5 overflow-y-auto">
          {query.trim().length < 2 ? (
            <div className="py-12 text-center text-slate-400 text-xs font-medium">
              {t('search_min_chars')}
            </div>
          ) : results.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs font-medium">
              "{query}" için {t('search_no_results')}
            </div>
          ) : (
            <>
              <div className="text-[11px] font-bold text-slate-400 px-1 pb-1">
                {results.length} {t('search_results')} bulundu
              </div>
              {results.map((tx: any, idx: number) => {
                const categoryConfig = getCategoryConfig(tx.category);
                return (
                  <div
                    key={tx.id || idx}
                    className="p-3.5 rounded-2xl bg-slate-800/50 hover:bg-slate-800/80 border border-slate-700/60 transition-colors flex items-center justify-between gap-3"
                  >
                    <div className="space-y-1 min-w-0">
                      <span className="text-xs font-bold text-white block truncate">
                        {tx.description}
                      </span>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 flex-wrap">
                        <span className="flex items-center gap-1 text-slate-400">
                          <Calendar className="w-3 h-3" />
                          {tx.date}
                        </span>
                        {tx.group_name && (
                          <span className="px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-300 font-semibold border border-purple-500/20">
                            {tx.group_name}
                          </span>
                        )}
                        {tx.company_name && (
                          <span className="flex items-center gap-1 text-slate-300 font-medium">
                            <Building2 className="w-3 h-3 text-slate-400" />
                            {tx.company_name}
                          </span>
                        )}
                        <span
                          className="px-2 py-0.5 rounded-md font-semibold text-[10px]"
                          style={{
                            backgroundColor: `${categoryConfig.color}15`,
                            color: categoryConfig.color
                          }}
                        >
                          {t(categoryConfig.labelKey)}
                        </span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-sm font-black text-white block">
                        {formatCurrency(tx.amount)}
                      </span>
                      {tx.is_installment && (
                        <span className="text-[10px] text-indigo-400 font-semibold block">
                          {tx.installment_count} Taksit
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
