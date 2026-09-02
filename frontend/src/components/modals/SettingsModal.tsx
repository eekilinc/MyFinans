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
  Trash2
} from 'lucide-react';
import {
  isPinEnabled,
  savePin,
  removePin,
  isBiometricEnabled,
  enableBiometric
} from '../PinLock';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  budgetLimit: number;
  onSaveBudgetLimit: (limit: number) => void;
  apiUrl: string;
  onSaveApiUrl: (url: string) => void;
  onSync: (action: 'merge' | 'push' | 'pull') => Promise<void>;
  onExportJSON: () => void;
  onImportJSON: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onExportCSV: () => void;
  onClearAllData: () => Promise<void>;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  theme,
  onToggleTheme,
  budgetLimit,
  onSaveBudgetLimit,
  apiUrl,
  onSaveApiUrl,
  onSync,
  onExportJSON,
  onImportJSON,
  onExportCSV,
  onClearAllData
}) => {
  const { t, i18n } = useTranslation();

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
      setPinError(t('pin_mismatch'));
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
    setBioEnabled(false);
  };

  const handleToggleBio = (checked: boolean) => {
    enableBiometric(checked);
    setBioEnabled(checked);
  };

  const handleSyncAction = async (action: 'merge' | 'push' | 'pull') => {
    setSyncing(true);
    setSyncMessage(null);
    try {
      await onSync(action);
      setSyncMessage({ type: 'success', text: t('sync_success') });
    } catch (e: any) {
      setSyncMessage({
        type: 'error',
        text: t('sync_failed') + (e?.message ? ` (${e.message})` : '')
      });
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-xl rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-purple-600/20 text-purple-400 border border-purple-500/30">
              <Settings className="w-5 h-5" />
            </div>
            <h3 className="text-base font-black text-white">{t('settings')}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Settings Content */}
        <div className="p-5 space-y-5 overflow-y-auto">
          {/* Section 1: Appearance & Language */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {t('appearance')} & {t('language')}
            </h4>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={onToggleTheme}
                className="flex items-center justify-between p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60 text-xs font-bold text-white hover:bg-slate-800 transition-colors"
              >
                <div className="flex items-center gap-2">
                  {theme === 'dark' ? (
                    <Sun className="w-4 h-4 text-amber-400" />
                  ) : (
                    <Moon className="w-4 h-4 text-purple-400" />
                  )}
                  <span>{theme === 'dark' ? t('theme_light') : t('theme_dark')}</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => i18n.changeLanguage(i18n.language.startsWith('tr') ? 'en' : 'tr')}
                className="flex items-center justify-between p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60 text-xs font-bold text-white hover:bg-slate-800 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-cyan-400" />
                  <span>{i18n.language.startsWith('tr') ? 'English' : 'Türkçe'}</span>
                </div>
              </button>
            </div>
          </div>

          {/* Section 2: Monthly Budget Limit */}
          <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60 space-y-2.5">
            <label className="text-xs font-bold text-slate-300 block">{t('budget_limit')}</label>
            <form onSubmit={handleSaveBudget} className="flex items-center gap-2">
              <input
                type="number"
                step="100"
                value={tempBudget}
                onChange={e => setTempBudget(e.target.value)}
                placeholder="Örn: 25000"
                className="flex-1 px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold text-white focus:outline-none focus:border-purple-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-600/20 transition-all active:scale-95"
              >
                {t('save')}
              </button>
            </form>
          </div>

          {/* Section 3: PIN & Biometric Security */}
          <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-purple-400" />
                <span className="text-xs font-bold text-white">{t('pin_lock')}</span>
              </div>
              {pinEnabled ? (
                <button
                  type="button"
                  onClick={handleRemovePin}
                  className="text-xs font-bold text-rose-400 hover:text-rose-300"
                >
                  {t('pin_remove')}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowPinSetup(!showPinSetup)}
                  className="text-xs font-bold text-purple-400 hover:text-purple-300"
                >
                  {showPinSetup ? t('cancel') : t('pin_set')}
                </button>
              )}
            </div>

            {showPinSetup && !pinEnabled && (
              <div className="pt-2 border-t border-slate-700/60 space-y-2.5">
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="password"
                    maxLength={4}
                    value={pinInput}
                    onChange={e => setPinInput(e.target.value.replace(/\D/g, ''))}
                    placeholder="4 Haneli PIN"
                    className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-center font-bold text-white text-xs"
                  />
                  <input
                    type="password"
                    maxLength={4}
                    value={pinConfirmInput}
                    onChange={e => setPinConfirmInput(e.target.value.replace(/\D/g, ''))}
                    placeholder="PIN Onayla"
                    className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-center font-bold text-white text-xs"
                  />
                </div>
                {pinError && <p className="text-[11px] text-rose-400 font-bold">{pinError}</p>}
                <button
                  type="button"
                  onClick={handleSetPin}
                  className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold"
                >
                  {t('save')}
                </button>
              </div>
            )}

            {pinEnabled && (
              <div className="flex items-center justify-between pt-2 border-t border-slate-700/60">
                <div className="flex items-center gap-2">
                  <Fingerprint className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-semibold text-slate-300">
                    {t('biometric_login')}
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={bioEnabled}
                  onChange={e => handleToggleBio(e.target.checked)}
                  className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 bg-slate-800 border-slate-600"
                />
              </div>
            )}
          </div>

          {/* Section 4: Cloud Synchronization */}
          <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60 space-y-3">
            <div className="flex items-center gap-2">
              <Cloud className="w-4 h-4 text-purple-400" />
              <span className="text-xs font-bold text-white">{t('cloud_sync')}</span>
            </div>
            <p className="text-[11px] text-slate-400">{t('sync_desc')}</p>

            <form onSubmit={handleSaveUrl} className="flex items-center gap-2">
              <input
                type="text"
                value={tempApiUrl}
                onChange={e => setTempApiUrl(e.target.value)}
                placeholder="http://localhost:5001"
                className="flex-1 px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-semibold text-white focus:outline-none focus:border-purple-500"
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-xs font-bold"
              >
                {t('save')}
              </button>
            </form>

            <div className="grid grid-cols-3 gap-2 pt-1">
              <button
                type="button"
                disabled={syncing}
                onClick={() => handleSyncAction('merge')}
                className="p-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-[11px] font-bold disabled:opacity-50"
              >
                {t('sync_merge')}
              </button>
              <button
                type="button"
                disabled={syncing}
                onClick={() => handleSyncAction('push')}
                className="p-2 rounded-xl bg-slate-700/40 hover:bg-slate-700/70 text-slate-300 border border-slate-600/40 text-[11px] font-bold disabled:opacity-50"
              >
                {t('sync_push')}
              </button>
              <button
                type="button"
                disabled={syncing}
                onClick={() => handleSyncAction('pull')}
                className="p-2 rounded-xl bg-slate-700/40 hover:bg-slate-700/70 text-slate-300 border border-slate-600/40 text-[11px] font-bold disabled:opacity-50"
              >
                {t('sync_pull')}
              </button>
            </div>

            {syncMessage && (
              <p
                className={`text-[11px] font-bold ${
                  syncMessage.type === 'success' ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {syncMessage.text}
              </p>
            )}
          </div>

          {/* Section 5: Data Backup & Reports */}
          <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60 space-y-2.5">
            <h4 className="text-xs font-bold text-white">Yedekleme ve Dışa Aktarma</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={onExportJSON}
                className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-xs font-bold text-slate-200 transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-purple-400" />
                <span>JSON Yedek</span>
              </button>

              <label className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-xs font-bold text-slate-200 cursor-pointer transition-colors">
                <Upload className="w-3.5 h-3.5 text-indigo-400" />
                <span>JSON Yükle</span>
                <input type="file" accept=".json" onChange={onImportJSON} className="hidden" />
              </label>

              <button
                type="button"
                onClick={onExportCSV}
                className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-xs font-bold text-emerald-400 transition-colors"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Excel / CSV</span>
              </button>
            </div>
          </div>

          {/* Section 6: Danger Zone */}
          <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-500/20 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-rose-400">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-xs font-bold">{t('danger_zone')}</span>
              </div>
              <button
                type="button"
                onClick={async () => {
                  if (window.confirm(t('clear_data_confirm'))) {
                    await onClearAllData();
                    onClose();
                  }
                }}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{t('clear_all_data')}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
