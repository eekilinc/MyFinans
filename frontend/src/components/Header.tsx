import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Settings,
  Search,
  Plus,
  HelpCircle,
  FileSpreadsheet,
  Printer,
  Cloud,
  HardDrive,
  FolderPlus
} from 'lucide-react';

interface HeaderProps {
  currentDate: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onResetMonth: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  activeTab: 'expenses' | 'companies' | 'stats';
  onSelectTab: (tab: 'expenses' | 'companies' | 'stats') => void;
  onOpenSearch: () => void;
  onOpenAddTx: () => void;
  onOpenAddGroup: () => void;
  onOpenSettings: () => void;
  onOpenAbout: () => void;
  onExportCSV: () => void;
  onPrintReport: () => void;
  isOnlineMode: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentDate,
  onPrevMonth,
  onNextMonth,
  onResetMonth,
  theme,
  onToggleTheme,
  activeTab,
  onSelectTab,
  onOpenSearch,
  onOpenAddTx,
  onOpenAddGroup,
  onOpenSettings,
  onOpenAbout,
  onExportCSV,
  onPrintReport,
  isOnlineMode
}) => {
  const { t, i18n } = useTranslation();
  const currentMonthIndex = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  const monthName = t(`month_${currentMonthIndex}`);

  const toggleLanguage = () => {
    const nextLang = i18n.language.startsWith('tr') ? 'en' : 'tr';
    i18n.changeLanguage(nextLang);
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-slate-900/90 dark:bg-slate-950/90 border-b border-slate-800 shadow-sm transition-colors pt-safe">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        {/* ================= MOBILE VIEW (sm:hidden) ================= */}
        <div className="sm:hidden py-2.5 space-y-2">
          {/* Mobile Top Bar: Logo & Actions */}
          <div className="flex items-center justify-between">
            {/* Logo & Name */}
            <div className="flex items-center gap-2">
              <img
                src="/icon.png"
                alt="MyFinans Logo"
                className="w-8 h-8 rounded-xl shadow-md border border-purple-500/30 object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <div className="leading-tight">
                <div className="flex items-center gap-1.5">
                  <h1 className="text-base font-black bg-gradient-to-r from-purple-400 via-indigo-300 to-cyan-400 bg-clip-text text-transparent">
                    MyFinans
                  </h1>
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-purple-950/80 text-purple-300 border border-purple-800/40">
                    v12.1
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-slate-400">
                  {isOnlineMode ? (
                    <span className="inline-flex items-center gap-0.5 text-emerald-400 font-semibold">
                      <Cloud className="w-2.5 h-2.5" /> Bulut
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-0.5 text-slate-400 font-semibold">
                      <HardDrive className="w-2.5 h-2.5" /> Çevrimdışı
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Mobile Header Quick Actions */}
            <div className="flex items-center gap-1.5">
              {/* Search */}
              <button
                onClick={onOpenSearch}
                className="p-2 rounded-xl bg-slate-800/80 border border-slate-700/60 text-slate-300 hover:text-white active:scale-95 transition-all"
                title={t('search_all')}
              >
                <Search className="w-4 h-4" />
              </button>

              {/* Theme Toggle */}
              <button
                onClick={onToggleTheme}
                className="p-2 rounded-xl bg-slate-800/80 border border-slate-700/60 text-slate-300 hover:text-yellow-400 active:scale-95 transition-all"
                title="Tema"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>

              {/* Language Switch */}
              <button
                onClick={toggleLanguage}
                className="px-2 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/60 text-xs font-bold text-slate-300 hover:text-white active:scale-95 transition-all"
                title="Dil"
              >
                {i18n.language.startsWith('tr') ? 'TR' : 'EN'}
              </button>

              {/* Settings Button - Prominently Visible on Mobile Header */}
              <button
                onClick={onOpenSettings}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-purple-950/80 hover:bg-purple-900 border border-purple-700/60 text-purple-200 active:scale-95 shadow-sm transition-all"
                title={t('settings')}
                aria-label="Ayarlar"
              >
                <Settings className="w-4 h-4 text-purple-300" />
                <span className="text-xs font-bold">{t('settings')}</span>
              </button>
            </div>
          </div>

          {/* Mobile Second Bar: Month/Year Navigator & Add Group */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex-1 flex items-center justify-between bg-slate-800/70 border border-slate-700/60 rounded-xl p-1 shadow-inner">
              <button
                onClick={onPrevMonth}
                className="p-1 rounded-lg hover:bg-slate-700 text-slate-300 hover:text-white transition-all active:scale-90"
                title="Önceki Ay"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={onResetMonth}
                className="px-2 py-0.5 text-xs font-bold text-slate-100 hover:text-purple-300 transition-colors"
                title="Bugüne Dön"
              >
                {monthName} {currentYear}
              </button>
              <button
                onClick={onNextMonth}
                className="p-1 rounded-lg hover:bg-slate-700 text-slate-300 hover:text-white transition-all active:scale-90"
                title="Sonraki Ay"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Add Group button on mobile */}
            <button
              onClick={onOpenAddGroup}
              className="flex items-center gap-1 px-2.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700/70 text-xs font-bold text-slate-200 active:scale-95 transition-all shadow-sm shrink-0"
              title={t('add_group')}
            >
              <FolderPlus className="w-3.5 h-3.5 text-purple-400" />
              <span>Grup</span>
            </button>
          </div>
        </div>

        {/* ================= DESKTOP VIEW (hidden sm:block) ================= */}
        <div className="hidden sm:block">
          <div className="flex items-center justify-between h-16 gap-3">
            {/* Logo & Online Badge */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2.5">
                <img
                  src="/icon.png"
                  alt="MyFinans Logo"
                  className="w-10 h-10 rounded-2xl shadow-lg shadow-purple-500/20 border border-purple-500/30 object-cover"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <div>
                  <h1 className="text-xl font-black bg-gradient-to-r from-purple-400 via-indigo-300 to-cyan-400 bg-clip-text text-transparent leading-none">
                    MyFinans
                  </h1>
                  <div className="flex items-center gap-1.5 mt-1">
                    {isOnlineMode ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950/70 text-emerald-400 border border-emerald-800/50">
                        <Cloud className="w-2.5 h-2.5" /> Bulut
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800/90 text-slate-300 border border-slate-700/60">
                        <HardDrive className="w-2.5 h-2.5" /> Çevrimdışı
                      </span>
                    )}
                    <span className="text-[10px] font-semibold text-purple-400/90">v12.1</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Month selector for header */}
            <div className="flex items-center bg-slate-800/70 border border-slate-700/60 rounded-2xl p-1 shadow-inner">
              <button
                onClick={onPrevMonth}
                className="p-1.5 rounded-xl hover:bg-slate-700/60 text-slate-300 hover:text-white transition-all active:scale-95"
                title="Önceki Ay"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={onResetMonth}
                className="px-3 py-1 text-sm font-bold text-slate-100 hover:text-purple-400 transition-colors whitespace-nowrap"
                title="Bugüne Dön"
              >
                {monthName} {currentYear}
              </button>
              <button
                onClick={onNextMonth}
                className="p-1.5 rounded-xl hover:bg-slate-700/60 text-slate-300 hover:text-white transition-all active:scale-95"
                title="Sonraki Ay"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Desktop Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenSearch}
                className="p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-700/70 border border-slate-700/50 text-slate-300 hover:text-white transition-all shadow-sm active:scale-95"
                title={t('search_all')}
              >
                <Search className="w-4 h-4" />
              </button>

              <button
                onClick={onExportCSV}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800/60 hover:bg-emerald-950/40 border border-slate-700/50 hover:border-emerald-700/50 text-xs font-semibold text-slate-300 hover:text-emerald-400 transition-all shadow-sm active:scale-95"
                title="Excel / CSV Dışa Aktar"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                <span>CSV</span>
              </button>

              <button
                onClick={onPrintReport}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800/60 hover:bg-purple-950/40 border border-slate-700/50 hover:border-purple-700/50 text-xs font-semibold text-slate-300 hover:text-purple-400 transition-all shadow-sm active:scale-95"
                title="PDF / Rapor Yazdır"
              >
                <Printer className="w-4 h-4 text-purple-400" />
                <span>PDF</span>
              </button>

              <button
                onClick={onToggleTheme}
                className="p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-700/70 border border-slate-700/50 text-slate-300 hover:text-yellow-400 transition-all shadow-sm active:scale-95"
                title="Tema Değiştir"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>

              <button
                onClick={toggleLanguage}
                className="px-2.5 py-2 rounded-xl bg-slate-800/60 hover:bg-slate-700/70 border border-slate-700/50 text-xs font-bold text-slate-300 hover:text-white transition-all shadow-sm active:scale-95"
                title="Dil Değiştir"
              >
                {i18n.language.startsWith('tr') ? 'TR' : 'EN'}
              </button>

              <button
                onClick={onOpenSettings}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-950/60 hover:bg-purple-900/60 border border-purple-700/50 text-xs font-bold text-purple-200 hover:text-white transition-all shadow-sm active:scale-95"
                title={t('settings')}
              >
                <Settings className="w-4 h-4 text-purple-400" />
                <span>{t('settings')}</span>
              </button>

              <button
                onClick={onOpenAbout}
                className="p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-700/70 border border-slate-700/50 text-slate-300 hover:text-white transition-all shadow-sm active:scale-95"
                title={t('app_about')}
              >
                <HelpCircle className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Desktop Navigation Tabs & Quick Add */}
          <div className="flex items-center justify-between pb-3 pt-1 gap-2">
            {/* Tabs */}
            <div className="flex items-center gap-1.5 bg-slate-800/50 p-1 rounded-2xl border border-slate-700/40">
              <button
                onClick={() => onSelectTab('expenses')}
                className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  activeTab === 'expenses'
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/40'
                }`}
              >
                {t('expenses_tab')}
              </button>
              <button
                onClick={() => onSelectTab('companies')}
                className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  activeTab === 'companies'
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/40'
                }`}
              >
                {t('companies_tab')}
              </button>
              <button
                onClick={() => onSelectTab('stats')}
                className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  activeTab === 'stats'
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/40'
                }`}
              >
                {t('stats_tab')}
              </button>
            </div>

            {/* Quick Add buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenAddGroup}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700/70 text-xs sm:text-sm font-bold text-slate-200 hover:text-white transition-all shadow-sm active:scale-95"
              >
                <Plus className="w-3.5 h-3.5 text-purple-400" />
                <span>{t('add_group')}</span>
              </button>
              <button
                onClick={onOpenAddTx}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-xs sm:text-sm font-bold text-white shadow-md shadow-purple-600/20 transition-all active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{t('add_transaction')}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
