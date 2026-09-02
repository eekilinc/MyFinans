import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Building2,
  Search,
  Plus,
  ArrowUpDown,
  Edit2,
  Trash2,
  ExternalLink
} from 'lucide-react';
import type { CompanyStats } from '../types';

interface CompanyStatsViewProps {
  companyStats: CompanyStats[];
  onSelectCompany: (company: CompanyStats) => void;
  onAddCompany: (name: string) => Promise<void>;
  onEditCompany: (id: string, name: string) => Promise<void>;
  onDeleteCompany: (id: string) => Promise<void>;
}

export const CompanyStatsView: React.FC<CompanyStatsViewProps> = ({
  companyStats,
  onSelectCompany,
  onAddCompany,
  onEditCompany,
  onDeleteCompany
}) => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'spent' | 'count' | 'alpha'>('spent');
  const [newCompanyName, setNewCompanyName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompanyName.trim()) return;
    await onAddCompany(newCompanyName.trim());
    setNewCompanyName('');
  };

  const handleStartEdit = (company: CompanyStats, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(company.id);
    setEditingName(company.name);
  };

  const handleSaveEdit = async (id: string, e: React.MouseEvent | React.FormEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!editingName.trim()) return;
    await onEditCompany(id, editingName.trim());
    setEditingId(null);
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(t('delete_company_confirm'))) {
      await onDeleteCompany(id);
    }
  };

  const filteredStats = companyStats
    .filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'spent') return (b.total_amount || 0) - (a.total_amount || 0);
      if (sortBy === 'count') return (b.tx_count || 0) - (a.tx_count || 0);
      return a.name.localeCompare(b.name, 'tr');
    });

  const totalAllSpending = companyStats.reduce((sum, c) => sum + (c.total_amount || 0), 0);

  const formatCurrency = (val: number) => {
    return `₺${val.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="space-y-5">
      {/* Top Banner & Fast Add */}
      <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800/90 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-purple-400" />
            <h2 className="text-lg font-black text-white">{t('companies_tab')}</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Toplam {companyStats.length} kayıtlı firma üzerinden toplam {formatCurrency(totalAllSpending)} harcama.
          </p>
        </div>

        {/* Quick Add Company Form */}
        <form onSubmit={handleAdd} className="flex items-center gap-2">
          <input
            type="text"
            value={newCompanyName}
            onChange={e => setNewCompanyName(e.target.value)}
            placeholder={t('company_name')}
            className="px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs font-semibold text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
          />
          <button
            type="submit"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white shadow-md shadow-purple-600/20 transition-all active:scale-95 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>{t('add_company')}</span>
          </button>
        </form>
      </div>

      {/* Search & Sort Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={t('search_company')}
            className="w-full pl-9 pr-4 py-2 rounded-2xl bg-slate-900/70 border border-slate-800 text-xs font-semibold text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
          />
        </div>

        {/* Sort Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-[11px] font-bold text-slate-400 mr-1 flex items-center gap-1">
            <ArrowUpDown className="w-3 h-3" /> {t('sort_by')}:
          </span>
          {(['spent', 'count', 'alpha'] as const).map(mode => (
            <button
              key={mode}
              onClick={() => setSortBy(mode)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                sortBy === mode
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                  : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {mode === 'spent' ? t('sort_spent') : mode === 'count' ? t('sort_count') : t('sort_alpha')}
            </button>
          ))}
        </div>
      </div>

      {/* Companies Grid */}
      {filteredStats.length === 0 ? (
        <div className="p-8 text-center rounded-3xl bg-slate-900/40 border border-slate-800 text-slate-400 text-xs font-medium">
          {t('no_companies')}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredStats.map(company => (
            <div
              key={company.id}
              onClick={() => onSelectCompany(company)}
              className="group relative p-4 rounded-3xl bg-slate-900/80 hover:bg-slate-850 border border-slate-800 hover:border-purple-500/50 shadow-lg hover:shadow-purple-950/20 cursor-pointer transition-all duration-200 flex flex-col justify-between gap-3"
            >
              <div className="flex items-start justify-between gap-2">
                {editingId === company.id ? (
                  <form
                    onSubmit={e => handleSaveEdit(company.id, e)}
                    onClick={e => e.stopPropagation()}
                    className="flex items-center gap-2 w-full"
                  >
                    <input
                      type="text"
                      value={editingName}
                      onChange={e => setEditingName(e.target.value)}
                      className="px-2.5 py-1 rounded-xl bg-slate-800 border border-purple-500 text-xs font-bold text-white w-full focus:outline-none"
                      autoFocus
                    />
                    <button
                      type="submit"
                      className="px-2.5 py-1 bg-purple-600 text-white rounded-xl text-xs font-bold"
                    >
                      {t('save')}
                    </button>
                  </form>
                ) : (
                  <div className="flex items-center gap-2.5">
                    <div className="p-2.5 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-white group-hover:text-purple-300 transition-colors">
                        {company.name}
                      </h4>
                      <span className="text-[11px] text-slate-400 font-medium">
                        {company.tx_count} {t('tx_count')}
                      </span>
                    </div>
                  </div>
                )}

                {editingId !== company.id && (
                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                    <button
                      onClick={e => handleStartEdit(company, e)}
                      className="p-1.5 rounded-lg hover:bg-slate-700/60 text-slate-400 hover:text-white transition-colors"
                      title={t('edit_transaction')}
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={e => handleDelete(company.id, e)}
                      className="p-1.5 rounded-lg hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 transition-colors"
                      title={t('delete')}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">
                    {t('total_spent')}
                  </span>
                  <p className="text-base font-black text-white">
                    {formatCurrency(company.total_amount || 0)}
                  </p>
                </div>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-purple-400 group-hover:translate-x-0.5 transition-transform">
                  <span>Detaylar</span>
                  <ExternalLink className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
