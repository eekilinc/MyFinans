import React from 'react';
import { useTranslation } from 'react-i18next';
import { CreditCard, Building2, BarChart3, Settings, Plus } from 'lucide-react';

interface MobileBottomNavProps {
  activeTab: 'expenses' | 'companies' | 'stats';
  onSelectTab: (tab: 'expenses' | 'companies' | 'stats') => void;
  onOpenAddTx: () => void;
  onOpenSettings: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onSelectTab,
  onOpenAddTx,
  onOpenSettings
}) => {
  const { t } = useTranslation();

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 sm:hidden bg-slate-900/95 dark:bg-slate-950/95 backdrop-blur-2xl border-t border-slate-800/90 shadow-[0_-8px_25px_rgba(0,0,0,0.5)] pb-safe transition-colors">
      <div className="flex items-center justify-around h-16 px-2">
        {/* Harcamalar Tab */}
        <button
          onClick={() => onSelectTab('expenses')}
          className={`flex flex-col items-center justify-center w-16 py-1 transition-all active:scale-95 ${
            activeTab === 'expenses'
              ? 'text-purple-400 font-extrabold'
              : 'text-slate-400 hover:text-slate-200 font-medium'
          }`}
        >
          <div className={`p-1 rounded-xl transition-colors ${activeTab === 'expenses' ? 'bg-purple-950/70 border border-purple-800/50' : ''}`}>
            <CreditCard className="w-5 h-5" />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight truncate">
            {t('expenses_tab') || 'Harcamalar'}
          </span>
        </button>

        {/* Firmalar Tab */}
        <button
          onClick={() => onSelectTab('companies')}
          className={`flex flex-col items-center justify-center w-16 py-1 transition-all active:scale-95 ${
            activeTab === 'companies'
              ? 'text-purple-400 font-extrabold'
              : 'text-slate-400 hover:text-slate-200 font-medium'
          }`}
        >
          <div className={`p-1 rounded-xl transition-colors ${activeTab === 'companies' ? 'bg-purple-950/70 border border-purple-800/50' : ''}`}>
            <Building2 className="w-5 h-5" />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight truncate">
            {t('companies_tab') || 'Firmalar'}
          </span>
        </button>

        {/* Central Quick Add Action Button */}
        <div className="relative -mt-6 flex flex-col items-center">
          <button
            onClick={onOpenAddTx}
            className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white flex items-center justify-center shadow-lg shadow-purple-600/40 border-2 border-slate-900 active:scale-90 transition-all"
            title={t('add_transaction') || 'Harcama Ekle'}
            aria-label="Yeni Harcama Ekle"
          >
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </button>
          <span className="text-[9px] font-bold text-purple-300/80 mt-1">Ekle</span>
        </div>

        {/* Analiz / İstatistik Tab */}
        <button
          onClick={() => onSelectTab('stats')}
          className={`flex flex-col items-center justify-center w-16 py-1 transition-all active:scale-95 ${
            activeTab === 'stats'
              ? 'text-purple-400 font-extrabold'
              : 'text-slate-400 hover:text-slate-200 font-medium'
          }`}
        >
          <div className={`p-1 rounded-xl transition-colors ${activeTab === 'stats' ? 'bg-purple-950/70 border border-purple-800/50' : ''}`}>
            <BarChart3 className="w-5 h-5" />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight truncate">
            {t('stats_tab') || 'Analiz'}
          </span>
        </button>

        {/* Ayarlar (Settings) Button - Always prominently visible */}
        <button
          onClick={onOpenSettings}
          className="flex flex-col items-center justify-center w-16 py-1 transition-all active:scale-95 text-slate-300 hover:text-white font-medium"
          aria-label={t('settings') || 'Ayarlar'}
        >
          <div className="p-1 rounded-xl hover:bg-slate-800/80 text-slate-300 hover:text-purple-300 transition-colors">
            <Settings className="w-5 h-5" />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight text-slate-300 truncate">
            {t('settings') || 'Ayarlar'}
          </span>
        </button>
      </div>
    </div>
  );
};
