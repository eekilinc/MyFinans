import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  X,
  Settings,
  Moon,
  Sun,
  Globe,
  Lock,
  Fingerprint,
  Cloud,
  Download,
  Upload,
  FileSpreadsheet,
  AlertTriangle,
  Trash2,
  Palette,
  Check,
  FileCode,
  Archive
} from 'lucide-react';
import {
  isPinEnabled,
  savePin,
  removePin,
  isBiometricEnabled,
  enableBiometric
} from '../PinLock';
import { useTheme, ACCENT_COLORS, type AccentColor } from '../../context/ThemeContext';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  budgetLimit: number;
  onSaveBudgetLimit: (limit: number) => void;
  apiUrl: string;
  onSaveApiUrl: (url: string) => void;
  onSync: (action: 'merge' | 'push' | 'pull') => Promise<void>;
  onExportSettings: () => void;
  onImportSettings: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onExportFullBackup: () => void;
  onImportFullBackup: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onExportCSV: () => void;
  onClearAllData: () => Promise<void>;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  budgetLimit,
  onSaveBudgetLimit,
  apiUrl,
  onSaveApiUrl,
  onSync,
  onExportSettings,
  onImportSettings,
  onExportFullBackup,
  onImportFullBackup,
  onExportCSV,
  onClearAllData
}) => {
  const { t, i18n } = useTranslation();
  const { theme, toggleTheme, accent, setAccent } = useTheme();

  const [tempBudget, setTempBudget] = useState(budgetLimit.toString());
  const [tempApiUrl, setTempApiUrl] = useState(apiUrl);
  const [pinEnabled, setPinEnabled] = useState(isPinEnabled());
  const [bioEnabled, setBioEnabled] = useState(isBiometricEnabled());
  const [pinInput, setPinInput] = useState('');
  const [pinConfirmInput, setPinConfirmInput] = useState('');
  const [showPinSetup, setShowPinSetup] = useState(false);
  const [pinError, setPinError] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );

  if (!isOpen) return null;

  const handleSaveBudget = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(tempBudget.replace(',', '.')) || 0;
    onSaveBudgetLimit(val);
  };

  const handleSaveUrl = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveApiUrl(tempApiUrl.trim());
  };

  const handleSetPin = () => {
    if (pinInput.length !== 4) {
      setPinError('PIN 4 haneli olmalıdır');
      return;
    }
    if (pinInput !== pinConfirmInput) {
      setPinError('PIN şifreleri birbiriyle eşleşmiyor');
      return;
    }
    savePin(pinInput);
    setPinEnabled(true);
    setShowPinSetup(false);
    setPinInput('');
    setPinConfirmInput('');
    setPinError('');
  };

  const handleRemovePin = () => {
    removePin();
    setPinEnabled(false);
    setShowPinSetup(false);
    setBioEnabled(false);
  };

  const handleToggleBio = (enable: boolean) => {
    enableBiometric(enable);
    setBioEnabled(enable);
  };

  const handleSyncAction = async (action: 'merge' | 'push' | 'pull') => {
    setSyncing(true);
    setSyncMessage(null);
    try {
      await onSync(action);
      setSyncMessage({ type: 'success', text: 'Senkronizasyon başarıyla tamamlandı!' });
    } catch (_err) {
      setSyncMessage({ type: 'error', text: 'Senkronizasyon hatası: Sunucuya ulaşılamadı.' });
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full sm:max-w-xl rounded-t-3xl sm:rounded-3xl bg-white dark:bg-slate-900 border-t sm:border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[88vh] pb-safe transition-colors">
        {/* Mobile drag handle */}
        <div className="sm:hidden w-12 h-1 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mt-2.5 mb-1" />

        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-purple-50 dark:bg-purple-600/20 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-500/30">
              <Settings className="w-5 h-5" />
            </div>
            <h3 className="text-base font-black text-slate-900 dark:text-white">{t('settings')}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Settings Content */}
        <div className="p-5 space-y-5 overflow-y-auto">
          {/* Section 1: Appearance & Color Themes */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-3">
            <div className="flex items-center gap-2">
              <Palette className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                {t('appearance')} & Renk Teması
              </h4>
            </div>

            {/* Dark / Light Toggle */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 shadow-sm">
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  Arayüz Modu
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  {theme === 'dark' ? 'Koyu Mod Aktif' : 'Açık Mod Aktif'}
                </span>
              </div>
              <button
                type="button"
                onClick={toggleTheme}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-xs font-bold text-slate-800 dark:text-slate-200 transition-colors"
              >
                {theme === 'dark' ? (
                  <>
                    <Sun className="w-4 h-4 text-amber-400" />
                    <span>Açık Moda Geç</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-4 h-4 text-indigo-600" />
                    <span>Koyu Moda Geç</span>
                  </>
                )}
              </button>
            </div>

            {/* 5 Color Palette Swatches */}
            <div className="space-y-2 pt-1">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Vurgu Rengi
              </span>
              <div className="grid grid-cols-5 gap-2">
                {ACCENT_COLORS.map(c => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setAccent(c.id as AccentColor)}
                    className={`h-11 rounded-xl flex flex-col items-center justify-center transition-all ${
                      accent === c.id
                        ? 'ring-2 ring-offset-2 ring-slate-900 dark:ring-offset-slate-900 scale-105 shadow-md'
                        : 'opacity-80 hover:opacity-100 hover:scale-102'
                    }`}
                    style={{ backgroundColor: c.colorHex }}
                    title={c.nameTr}
                  >
                    {accent === c.id && <Check className="w-4 h-4 text-white stroke-[3]" />}
                  </button>
                ))}
              </div>
              <div className="flex justify-between text-[10px] text-slate-500 dark:text-slate-400 px-1 pt-0.5">
                <span>Mor</span>
                <span>Zümrüt</span>
                <span>Mavi</span>
                <span>Gül</span>
                <span>Titanyum</span>
              </div>
            </div>

            {/* Language Selection */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 shadow-sm">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                <span className="text-xs font-bold text-slate-900 dark:text-white">Uygulama Dili</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => i18n.changeLanguage('tr')}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
                    i18n.language.startsWith('tr')
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  Türkçe
                </button>
                <button
                  type="button"
                  onClick={() => i18n.changeLanguage('en')}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
                    !i18n.language.startsWith('tr')
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  English
                </button>
              </div>
            </div>
          </div>

          {/* Section 2: Budget Limit */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-3">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              {t('budget_limit')}
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">{t('budget_limit_desc')}</p>
            <form onSubmit={handleSaveBudget} className="flex items-center gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500 dark:text-slate-400">
                  ₺
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={tempBudget}
                  onChange={e => setTempBudget(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-8 pr-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
              >
                {t('save')}
              </button>
            </form>
          </div>

          {/* Section 3: Security & PIN Lock */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span className="text-xs font-bold text-slate-900 dark:text-white">{t('security_lock')}</span>
              </div>
              {pinEnabled ? (
                <button
                  type="button"
                  onClick={handleRemovePin}
                  className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline"
                >
                  {t('disable_pin')}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowPinSetup(true)}
                  className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-colors"
                >
                  {t('setup_pin')}
                </button>
              )}
            </div>

            {showPinSetup && !pinEnabled && (
              <div className="p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2.5 animate-in fade-in">
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="password"
                    maxLength={4}
                    value={pinInput}
                    onChange={e => setPinInput(e.target.value.replace(/\D/g, ''))}
                    placeholder="4 Haneli PIN"
                    className="px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-xs font-bold text-center text-slate-900 dark:text-white tracking-widest focus:outline-none focus:border-purple-500"
                  />
                  <input
                    type="password"
                    maxLength={4}
                    value={pinConfirmInput}
                    onChange={e => setPinConfirmInput(e.target.value.replace(/\D/g, ''))}
                    placeholder="Tekrar Girin"
                    className="px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-xs font-bold text-center text-slate-900 dark:text-white tracking-widest focus:outline-none focus:border-purple-500"
                  />
                </div>
                {pinError && <p className="text-[11px] text-rose-500 font-bold">{pinError}</p>}
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowPinSetup(false)}
                    className="px-3 py-1 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold"
                  >
                    İptal
                  </button>
                  <button
                    type="button"
                    onClick={handleSetPin}
                    className="px-3 py-1 bg-purple-600 text-white rounded-lg text-xs font-bold"
                  >
                    Kaydet
                  </button>
                </div>
              </div>
            )}

            {pinEnabled && (
              <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700/60">
                <div className="flex items-center gap-2">
                  <Fingerprint className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    {t('biometric_auth')}
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={bioEnabled}
                  onChange={e => handleToggleBio(e.target.checked)}
                  className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-600"
                />
              </div>
            )}
          </div>

          {/* Section 4: Cloud Sync */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-3">
            <div className="flex items-center gap-2">
              <Cloud className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span className="text-xs font-bold text-slate-900 dark:text-white">{t('cloud_sync')}</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">{t('sync_desc')}</p>

            <form onSubmit={handleSaveUrl} className="flex items-center gap-2">
              <input
                type="text"
                value={tempApiUrl}
                onChange={e => setTempApiUrl(e.target.value)}
                placeholder="http://localhost:5001"
                className="flex-1 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-white rounded-xl text-xs font-bold transition-colors"
              >
                {t('save')}
              </button>
            </form>

            <div className="grid grid-cols-3 gap-2 pt-1">
              <button
                type="button"
                disabled={syncing}
                onClick={() => handleSyncAction('merge')}
                className="p-2 rounded-xl bg-purple-50 dark:bg-purple-600/20 hover:bg-purple-100 dark:hover:bg-purple-600/30 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-500/30 text-[11px] font-bold disabled:opacity-50 transition-colors"
              >
                {t('sync_merge')}
              </button>
              <button
                type="button"
                disabled={syncing}
                onClick={() => handleSyncAction('push')}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-700/40 hover:bg-slate-200 dark:hover:bg-slate-700/70 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600/40 text-[11px] font-bold disabled:opacity-50 transition-colors"
              >
                {t('sync_push')}
              </button>
              <button
                type="button"
                disabled={syncing}
                onClick={() => handleSyncAction('pull')}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-700/40 hover:bg-slate-200 dark:hover:bg-slate-700/70 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600/40 text-[11px] font-bold disabled:opacity-50 transition-colors"
              >
                {t('sync_pull')}
              </button>
            </div>

            {syncMessage && (
              <p
                className={`text-[11px] font-bold ${
                  syncMessage.type === 'success' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {syncMessage.text}
              </p>
            )}
          </div>

          {/* Section 5: Settings & Data Import/Export (NEW & ENHANCED) */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-4">
            <div className="flex items-center gap-2">
              <Archive className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Yedekleme, İçe ve Dışa Aktarma
              </h4>
            </div>

            {/* Sub-card 1: SADECE AYARLAR İÇE / DIŞA AKTAR */}
            <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <FileCode className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    Uygulama Ayarları
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">Bütçe, Tema, Renk, Dil</span>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={onExportSettings}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 border border-indigo-200 dark:border-indigo-800/50 text-xs font-bold text-indigo-700 dark:text-indigo-300 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Ayarları Dışa Aktar</span>
                </button>

                <label className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 border border-indigo-200 dark:border-indigo-800/50 text-xs font-bold text-indigo-700 dark:text-indigo-300 cursor-pointer transition-colors">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Ayarları İçe Aktar</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={onImportSettings}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Sub-card 2: TAM YEDEKLEME (VERİLER + AYARLAR) */}
            <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Archive className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    Tam Yedekleme
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">Tüm Harcamalar + Ayarlar</span>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={onExportFullBackup}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/50 border border-purple-200 dark:border-purple-800/50 text-xs font-bold text-purple-700 dark:text-purple-300 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Tam Yedek İndir</span>
                </button>

                <label className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/50 border border-purple-200 dark:border-purple-800/50 text-xs font-bold text-purple-700 dark:text-purple-300 cursor-pointer transition-colors">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Tam Yedek Yükle</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={onImportFullBackup}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Sub-card 3: EXCEL / CSV DIŞA AKTAR */}
            <button
              type="button"
              onClick={onExportCSV}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 border border-emerald-200 dark:border-emerald-800/50 text-xs font-bold text-emerald-700 dark:text-emerald-400 transition-colors shadow-sm"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Cari Ay Harcamalarını Excel / CSV Olarak İndir</span>
            </button>
          </div>

          {/* Section 6: Danger Zone */}
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 space-y-2.5">
            <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
              <AlertTriangle className="w-4 h-4" />
              <h4 className="text-xs font-bold uppercase tracking-wider">{t('danger_zone')}</h4>
            </div>
            <p className="text-[11px] text-rose-700/80 dark:text-rose-300/80">
              Bu cihazdaki tüm harcama, grup ve firma kayıtlarını kalıcı olarak siler.
            </p>
            <button
              type="button"
              onClick={onClearAllData}
              className="flex items-center justify-center gap-1.5 w-full py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-xs font-bold text-white shadow-sm transition-colors active:scale-95"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{t('clear_all_data')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
