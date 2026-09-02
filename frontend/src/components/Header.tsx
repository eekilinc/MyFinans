import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Search,
  Plus,
  FileSpreadsheet,
  Printer,
  Cloud,
  HardDrive,
  FolderPlus,
  Palette,
  FileDown,
  Check
} from 'lucide-react';
import { useTheme, ACCENT_COLORS, type AccentColor } from '../context/ThemeContext';

interface HeaderProps {
  currentDate: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onResetMonth: () => void;
  activeTab: 'expenses' | 'companies' | 'stats';
  onSelectTab: (tab: 'expenses' | 'companies' | 'stats') => void;
  onOpenSearch: () => void;
  onOpenAddTx: () => void;
  onOpenAddGroup: () => void;
  onExportCSV: () => void;
  onPrintReport: () => void;
  isOnlineMode: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentDate,
  onPrevMonth,
  onNextMonth,
  onResetMonth,
  activeTab,
  onSelectTab,
  onOpenSearch,
  onOpenAddTx,
  onOpenAddGroup,
  onExportCSV,
  onPrintReport,
  isOnlineMode
}) => {
  const { t, i18n } = useTranslation();
  const { theme, toggleTheme, accent, setAccent, accentConfig } = useTheme();

  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  const colorPickerRef = useRef<HTMLDivElement>(null);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  const currentMonthIndex = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  const monthName = t(`month_${currentMonthIndex}`);

  const toggleLanguage = () => {
    const nextLang = i18n.language.startsWith('tr') ? 'en' : 'tr';
    i18n.changeLanguage(nextLang);
  };

  // Close menus on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (colorPickerRef.current && !colorPickerRef.current.contains(e.target as Node)) {
        setShowColorPicker(false);
      }
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target as Node)) {
        setShowExportMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-white/90 dark:bg-slate-950/90 border-b border-slate-200 dark:border-slate-800/80 shadow-sm transition-colors pt-safe">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        {/* ================= MOBILE VIEW (sm:hidden) ================= */}
        <div className="sm:hidden py-2 space-y-2">
          {/* Row 1: Logo & Essential Actions */}
          <div className="flex items-center justify-between">
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
                  <h1 className="text-base font-black text-slate-900 dark:text-white">
                    MyFinans
                  </h1>
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/40">
                    v12.4.0
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400">
                  {isOnlineMode ? (
                    <span className="inline-flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400 font-semibold">
                      <Cloud className="w-2.5 h-2.5" /> Bulut
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-0.5 text-slate-500 dark:text-slate-400 font-semibold">
                      <HardDrive className="w-2.5 h-2.5" /> Çevrimdışı
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Mobile Header Buttons: Search, Theme Toggle, Settings */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={onOpenSearch}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-200 active:scale-95 transition-all"
                title={t('search_all')}
              >
                <Search className="w-4 h-4" />
              </button>

              <button
                onClick={toggleTheme}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-200 active:scale-95 transition-all"
                title="Açık/Koyu Tema"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
              </button>

              <button
                onClick={toggleLanguage}
                className="px-2 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 text-xs font-bold text-slate-700 dark:text-slate-300 active:scale-95 transition-all"
                title="Dil"
              >
                {i18n.language.startsWith('tr') ? 'TR' : 'EN'}
              </button>
            </div>
          </div>

          {/* Row 2: Month Picker & Group Add */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex-1 flex items-center justify-between bg-slate-100 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/60 rounded-xl p-1 shadow-inner">
              <button
                onClick={onPrevMonth}
                className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-all active:scale-90"
                title="Önceki Ay"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={onResetMonth}
                className="px-2 py-0.5 text-xs font-bold text-slate-800 dark:text-slate-100 hover:text-purple-600 dark:hover:text-purple-300 transition-colors"
                title="Bugüne Dön"
              >
                {monthName} {currentYear}
              </button>
              <button
                onClick={onNextMonth}
                className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-all active:scale-90"
                title="Sonraki Ay"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={onOpenAddGroup}
              className="flex items-center gap-1 px-2.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700/70 text-xs font-bold text-slate-700 dark:text-slate-200 active:scale-95 transition-all shadow-sm shrink-0"
              title={t('add_group')}
            >
              <FolderPlus className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              <span>Grup</span>
            </button>
          </div>
        </div>

        {/* ================= DESKTOP VIEW (hidden sm:block) ================= */}
        <div className="hidden sm:block">
          {/* Main Clean Top Bar */}
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Left: Brand Identity */}
            <div className="flex items-center gap-3">
              <img
                src="/icon.png"
                alt="MyFinans Logo"
                className="w-9 h-9 rounded-2xl shadow-md border border-purple-500/30 object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
                    MyFinans
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-purple-50 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/40">
                    v12.4.0
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px]">
                  {isOnlineMode ? (
                    <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                      <Cloud className="w-3 h-3" /> Bulut Aktif
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-slate-500 dark:text-slate-400 font-semibold">
                      <HardDrive className="w-3 h-3" /> Çevrimdışı Mod
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Center: Clean Month Navigator */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-1 shadow-inner">
              <button
                onClick={onPrevMonth}
                className="p-1.5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-all active:scale-95"
                title="Önceki Ay"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={onResetMonth}
                className="px-4 py-1 text-sm font-bold text-slate-800 dark:text-slate-100 hover:text-purple-600 dark:hover:text-purple-400 transition-colors whitespace-nowrap"
                title="Bugüne Dön"
              >
                {monthName} {currentYear}
              </button>
              <button
                onClick={onNextMonth}
                className="p-1.5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-all active:scale-95"
                title="Sonraki Ay"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Right: Consolidated Clean Action Suite */}
            <div className="flex items-center gap-2">
              {/* Quick Search Button */}
              <button
                onClick={onOpenSearch}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/70 hover:bg-slate-200 dark:hover:bg-slate-700/70 border border-slate-200 dark:border-slate-700/60 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-all shadow-sm active:scale-95"
                title={t('search_all')}
              >
                <Search className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                <span>Ara</span>
              </button>

              {/* Theme & Color Swatch Popover */}
              <div className="relative" ref={colorPickerRef}>
                <button
                  onClick={() => setShowColorPicker(!showColorPicker)}
                  className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800/70 hover:bg-slate-200 dark:hover:bg-slate-700/70 border border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 transition-all shadow-sm active:scale-95 flex items-center gap-1.5"
                  title="Tema & Renk Paleti"
                >
                  <Palette className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <span
                    className="w-2.5 h-2.5 rounded-full ring-1 ring-slate-400/40"
                    style={{ backgroundColor: accentConfig.colorHex }}
                  />
                </button>

                {showColorPicker && (
                  <div className="absolute right-0 mt-2 w-64 p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-50 animate-in fade-in zoom-in-95">
                    {/* Dark / Light Mode Switch */}
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        {theme === 'dark' ? 'Koyu Mod' : 'Açık Mod'}
                      </span>
                      <button
                        onClick={toggleTheme}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 transition-colors"
                      >
                        {theme === 'dark' ? (
                          <>
                            <Sun className="w-3.5 h-3.5 text-amber-400" />
                            <span>Açık</span>
                          </>
                        ) : (
                          <>
                            <Moon className="w-3.5 h-3.5 text-indigo-600" />
                            <span>Koyu</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Color Swatches Grid */}
                    <div className="pt-3">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                        Renk Teması
                      </span>
                      <div className="grid grid-cols-5 gap-2">
                        {ACCENT_COLORS.map(c => (
                          <button
                            key={c.id}
                            onClick={() => {
                              setAccent(c.id as AccentColor);
                              setShowColorPicker(false);
                            }}
                            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                              accent === c.id
                                ? 'ring-2 ring-offset-2 ring-slate-900 dark:ring-offset-slate-900 scale-105 shadow-md'
                                : 'hover:scale-105 opacity-80 hover:opacity-100'
                            }`}
                            style={{ backgroundColor: c.colorHex }}
                            title={c.nameTr}
                          >
                            {accent === c.id && <Check className="w-4 h-4 text-white stroke-[3]" />}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Language Switch */}
              <button
                onClick={toggleLanguage}
                className="px-2.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/70 hover:bg-slate-200 dark:hover:bg-slate-700/70 border border-slate-200 dark:border-slate-700/60 text-xs font-bold text-slate-700 dark:text-slate-300 transition-all shadow-sm active:scale-95"
                title="Dil Değiştir"
              >
                {i18n.language.startsWith('tr') ? 'TR' : 'EN'}
              </button>

              {/* Dışa Aktar Dropdown Menu (Consolidating CSV + PDF) */}
              <div className="relative" ref={exportMenuRef}>
                <button
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/70 hover:bg-slate-200 dark:hover:bg-slate-700/70 border border-slate-200 dark:border-slate-700/60 text-xs font-bold text-slate-700 dark:text-slate-300 transition-all shadow-sm active:scale-95"
                  title="Rapor & Dışa Aktarma"
                >
                  <FileDown className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                  <span>Dışa Aktar</span>
                </button>

                {showExportMenu && (
                  <div className="absolute right-0 mt-2 w-48 p-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 animate-in fade-in zoom-in-95 space-y-1">
                    <button
                      onClick={() => {
                        onExportCSV();
                        setShowExportMenu(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
                    >
                      <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>Excel / CSV İndir</span>
                    </button>
                    <button
                      onClick={() => {
                        onPrintReport();
                        setShowExportMenu(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-purple-50 dark:hover:bg-purple-950/40 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
                    >
                      <Printer className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      <span>PDF / Rapor Yazdır</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Desktop Sub-Bar: Clean Navigation Tabs & Primary CTAs */}
          <div className="flex items-center justify-between pb-3 pt-1 gap-2 border-t border-slate-100 dark:border-slate-900">
            {/* Navigation Tabs */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-2xl border border-slate-200 dark:border-slate-800">
              <button
                onClick={() => onSelectTab('expenses')}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'expenses'
                    ? 'bg-purple-600 text-white shadow-sm shadow-purple-600/30'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800'
                }`}
              >
                {t('expenses_tab')}
              </button>
              <button
                onClick={() => onSelectTab('companies')}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'companies'
                    ? 'bg-purple-600 text-white shadow-sm shadow-purple-600/30'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800'
                }`}
              >
                {t('companies_tab')}
              </button>
              <button
                onClick={() => onSelectTab('stats')}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'stats'
                    ? 'bg-purple-600 text-white shadow-sm shadow-purple-600/30'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800'
                }`}
              >
                {t('stats_tab')}
              </button>
            </div>

            {/* Primary Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenAddGroup}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700/70 text-xs font-bold text-slate-700 dark:text-slate-200 transition-all shadow-sm active:scale-95"
              >
                <Plus className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                <span>{t('add_group')}</span>
              </button>
              <button
                onClick={onOpenAddTx}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-xs font-bold text-white shadow-md shadow-purple-600/20 transition-all active:scale-95"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>{t('add_transaction')}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
