import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  X,
  Palette,
  Sun,
  Moon,
  Check,
  Globe,
  Lock,
  Fingerprint,
  Cloud,
  Archive,
  Download,
  Upload,
  FileSpreadsheet,
  FileCode,
  Trash2,
  AlertTriangle,
  Settings,
  Target,
  Info,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  Heart,
  KeyRound
} from 'lucide-react';
import { useTheme, ACCENT_COLORS, type AccentColor } from '../../context/ThemeContext';
import { savePin, removePin, isPinEnabled, isBiometricEnabled, enableBiometric } from '../PinLock';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  budgetLimit: number;
  onSaveBudgetLimit: (limit: number) => void | Promise<void>;
  apiUrl: string;
  onSaveApiUrl: (url: string) => void | Promise<void>;
  onSync: (action: 'merge' | 'push' | 'pull') => Promise<void>;
  onExportCSV: () => void;
  onClearAllData: () => Promise<void>;
  onExportSettings: () => void;
  onImportSettings: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onExportFullBackup: () => void;
  onImportFullBackup: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

type SettingsTab = 'appearance' | 'budget' | 'security' | 'backup' | 'sync' | 'about';

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  budgetLimit,
  onSaveBudgetLimit,
  apiUrl,
  onSaveApiUrl,
  onSync,
  onExportCSV,
  onClearAllData,
  onExportSettings,
  onImportSettings,
  onExportFullBackup,
  onImportFullBackup
}) => {
  const { t, i18n } = useTranslation();
  const { theme, toggleTheme, accent, setAccent } = useTheme();

  const [activeTab, setActiveTab] = useState<SettingsTab>('appearance');
  const [tempBudget, setTempBudget] = useState(budgetLimit.toString());
  const [tempApiUrl, setTempApiUrl] = useState(apiUrl);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // PIN & Biometric states synchronized with PinLock
  const [pinEnabled, setPinEnabled] = useState(() => isPinEnabled());
  const [bioEnabled, setBioEnabled] = useState(() => isBiometricEnabled());
  const [showPinSetup, setShowPinSetup] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinConfirmInput, setPinConfirmInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [securityNotice, setSecurityNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSaveBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(tempBudget.replace(',', '.'));
    if (!isNaN(val) && val >= 0) {
      await onSaveBudgetLimit(val);
      alert('Bütçe limiti kaydedildi.');
    }
  };

  const handleSaveUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSaveApiUrl(tempApiUrl.trim());
    alert('Sunucu adresi kaydedildi.');
  };

  const handleSetPin = () => {
    setPinError('');
    if (pinInput.length !== 4) {
      setPinError('PIN 4 basamaklı olmalıdır.');
      return;
    }
    if (pinInput !== pinConfirmInput) {
      setPinError('PIN kodları birbiriyle eşleşmiyor.');
      return;
    }
    savePin(pinInput);
    setPinEnabled(true);
    setShowPinSetup(false);
    setPinInput('');
    setPinConfirmInput('');
    setSecurityNotice('PIN kilidi başarıyla etkinleştirildi.');
    setTimeout(() => setSecurityNotice(null), 3000);
  };

  const handleRemovePin = () => {
    if (window.confirm('PIN kilidini ve biyometrik girişi kaldırmak istediğinize emin misiniz?')) {
      removePin();
      setPinEnabled(false);
      setBioEnabled(false);
      setSecurityNotice('Güvenlik kilidi devre dışı bırakıldı.');
      setTimeout(() => setSecurityNotice(null), 3000);
    }
  };

  const handleToggleBio = (checked: boolean) => {
    if (checked && !pinEnabled) {
      setPinError('Biyometrik kilidi kullanabilmek için önce bir PIN belirlemelisiniz.');
      setShowPinSetup(true);
      return;
    }
    enableBiometric(checked);
    setBioEnabled(checked);
    setSecurityNotice(checked ? 'Biyometrik giriş etkinleştirildi.' : 'Biyometrik giriş kapatıldı.');
    setTimeout(() => setSecurityNotice(null), 3000);
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

  const tabs: { id: SettingsTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'appearance', label: 'Görünüm', icon: Palette },
    { id: 'budget', label: 'Bütçe', icon: Target },
    { id: 'security', label: 'Güvenlik', icon: Lock },
    { id: 'backup', label: 'Yedekleme', icon: Archive },
    { id: 'sync', label: 'Senkron', icon: Cloud },
    { id: 'about', label: 'Hakkında', icon: Info }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full sm:max-w-xl rounded-t-3xl sm:rounded-3xl bg-white dark:bg-slate-900 border-t sm:border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[88vh] pb-safe transition-colors">
        {/* Mobile drag handle */}
        <div className="sm:hidden w-12 h-1 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mt-2.5 mb-1" />

        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/80 shadow-sm">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">{t('settings')}</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                Tercihler, bütçe, güvenlik ve uygulama bilgileri
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2-Row 3-Column Tab Grid: ZERO Horizontal Scroll */}
        <div className="p-2.5 bg-slate-50/90 dark:bg-slate-950/70 border-b border-slate-200 dark:border-slate-800">
          <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
            {tabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-bold transition-all active:scale-95 ${
                    isActive
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-600/25 ring-1 ring-purple-400/40'
                      : 'bg-white dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/60'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Scrollable Settings Content by Active Tab */}
        <div className="p-5 space-y-4 overflow-y-auto">
          {/* TAB 1: GÖRÜNÜM & RENKLER */}
          {activeTab === 'appearance' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Dark / Light Toggle */}
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/70 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white block">Arayüz Modu</span>
                  <span className="text-[11px] text-slate-600 dark:text-slate-300 font-medium">
                    {theme === 'dark' ? 'Koyu Tema Aktif' : 'Açık Tema Aktif'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-xs font-bold text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-600 transition-all shadow-sm active:scale-95"
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

              {/* 5 Accent Colors */}
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/70 shadow-sm space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">Vurgu Rengi Paleti</span>
                  <span className="text-[11px] text-slate-600 dark:text-slate-300 font-medium">
                    Uygulama buton ve grafik renkleri
                  </span>
                </div>
                <div className="grid grid-cols-5 gap-2.5 pt-1">
                  {ACCENT_COLORS.map(c => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setAccent(c.id as AccentColor)}
                      className={`h-11 rounded-xl flex flex-col items-center justify-center transition-all ${
                        accent === c.id
                          ? 'ring-2 ring-offset-2 ring-purple-600 dark:ring-offset-slate-900 scale-105 shadow-md'
                          : 'opacity-80 hover:opacity-100 hover:scale-102'
                      }`}
                      style={{ backgroundColor: c.colorHex }}
                      title={c.nameTr}
                    >
                      {accent === c.id && <Check className="w-4 h-4 text-white stroke-[3]" />}
                    </button>
                  ))}
                </div>
                <div className="flex justify-between text-[10px] font-bold text-slate-600 dark:text-slate-300 px-1 pt-0.5">
                  <span>Mor</span>
                  <span>Zümrüt</span>
                  <span>Mavi</span>
                  <span>Gül</span>
                  <span>Titanyum</span>
                </div>
              </div>

              {/* Language Selection */}
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/70 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Globe className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">Uygulama Dili</span>
                    <span className="text-[11px] text-slate-600 dark:text-slate-300 font-medium">Language</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => i18n.changeLanguage('tr')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
                      i18n.language.startsWith('tr')
                        ? 'bg-purple-600 text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200'
                    }`}
                  >
                    Türkçe
                  </button>
                  <button
                    type="button"
                    onClick={() => i18n.changeLanguage('en')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
                      !i18n.language.startsWith('tr')
                        ? 'bg-purple-600 text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200'
                    }`}
                  >
                    English
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: BÜTÇE LİMİTİ */}
          {activeTab === 'budget' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/70 shadow-sm space-y-3">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    {t('budget_limit') || 'Aylık Bütçe Limiti (₺)'}
                  </h4>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                  Aylık harcama hedefinizi belirleyin. Harcamalarınız bütçenizin %80 ve %100 sınırına ulaştığında
                  gösterge panelinde renkli uyarılar verilir.
                </p>
                <form onSubmit={handleSaveBudget} className="flex items-center gap-2 pt-1">
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
                      className="w-full pl-8 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-purple-500 shadow-inner"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-purple-600/20 active:scale-95"
                  >
                    {t('save') || 'Kaydet'}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* TAB 3: GÜVENLİK (PIN + BİYOMETRİK TAM GÖRÜNÜR) */}
          {activeTab === 'security' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Status Alert Notification */}
              {securityNotice && (
                <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-xs font-bold text-emerald-700 dark:text-emerald-300 animate-in fade-in">
                  ✓ {securityNotice}
                </div>
              )}

              {/* Card 1: PIN Kilidi */}
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/70 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60">
                      <Lock className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          {t('security_lock') || 'Güvenlik & PIN Kilidi'}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            pinEnabled
                              ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          {pinEnabled ? 'Aktif' : 'Kapalı'}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-600 dark:text-slate-300 font-medium">
                        Uygulama açılışında 4 haneli PIN kodu ister
                      </span>
                    </div>
                  </div>

                  {pinEnabled ? (
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setShowPinSetup(true)}
                        className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors"
                      >
                        {t('change_pin') || 'Değiştir'}
                      </button>
                      <button
                        type="button"
                        onClick={handleRemovePin}
                        className="px-2.5 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 text-xs font-bold text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/50 transition-colors"
                      >
                        {t('disable_pin') || 'Kaldır'}
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowPinSetup(true)}
                      className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-purple-600/20 active:scale-95"
                    >
                      {t('setup_pin') || 'PIN Belirle'}
                    </button>
                  )}
                </div>

                {/* PIN Setup Input Form */}
                {showPinSetup && (
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-purple-300 dark:border-purple-800/80 space-y-2.5 animate-in fade-in">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-purple-700 dark:text-purple-300">
                      <KeyRound className="w-3.5 h-3.5" />
                      <span>{pinEnabled ? 'Yeni PIN Kodunu Girin' : '4 Haneli PIN Belirleyin'}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="password"
                        inputMode="numeric"
                        maxLength={4}
                        value={pinInput}
                        onChange={e => setPinInput(e.target.value.replace(/\D/g, ''))}
                        placeholder="4 Haneli PIN"
                        className="px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-xs font-bold text-center text-slate-900 dark:text-white tracking-widest focus:outline-none focus:border-purple-500 shadow-inner"
                      />
                      <input
                        type="password"
                        inputMode="numeric"
                        maxLength={4}
                        value={pinConfirmInput}
                        onChange={e => setPinConfirmInput(e.target.value.replace(/\D/g, ''))}
                        placeholder="Tekrar Girin"
                        className="px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-xs font-bold text-center text-slate-900 dark:text-white tracking-widest focus:outline-none focus:border-purple-500 shadow-inner"
                      />
                    </div>
                    {pinError && <p className="text-[11px] text-rose-500 font-bold">{pinError}</p>}
                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setShowPinSetup(false);
                          setPinError('');
                        }}
                        className="px-3 py-1.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold"
                      >
                        İptal
                      </button>
                      <button
                        type="button"
                        onClick={handleSetPin}
                        className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-600/20"
                      >
                        {t('save') || 'Kaydet'}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Card 2: Biyometrik Kimlik Doğrulama (Always Visible) */}
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/70 shadow-sm space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
                      <Fingerprint className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          {t('biometric_auth') || 'Biyometrik Kimlik Doğrulama'}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            bioEnabled
                              ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          {bioEnabled ? 'Etkin' : 'Devre Dışı'}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-600 dark:text-slate-300 font-medium">
                        Parmak izi veya yüz tanıma (Face ID) ile tek dokunuşla hızlı giriş
                      </span>
                    </div>
                  </div>

                  {/* Accessible Toggle Switch */}
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={bioEnabled}
                      onChange={e => handleToggleBio(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>

                {!pinEnabled && (
                  <p className="text-[11px] text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 p-2.5 rounded-xl border border-amber-200 dark:border-amber-800/50 font-medium">
                    ℹ️ Biyometrik kimlik doğrulamanın çalışabilmesi için önce bir yedek PIN şifresi belirlemeniz önerilir.
                  </p>
                )}
              </div>

              {/* Card 3: Donanımsal Güvenlik Bilgisi */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0 mt-0.5" />
                <p className="text-[11px] text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                  Biyometrik verileriniz cihazınızın donanımsal güvenli alanında (Android KeyStore / BiometricPrompt)
                  işlenir. Hiçbir parola veya parmak izi sunucuya iletilmez.
                </p>
              </div>
            </div>
          )}

          {/* TAB 4: YEDEKLEME & AKTARIM */}
          {activeTab === 'backup' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Sadece Ayarlar Aktarımı */}
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/70 shadow-sm space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileCode className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white block">
                        Uygulama Ayarları
                      </span>
                      <span className="text-[11px] text-slate-600 dark:text-slate-300 font-medium">
                        Bütçe, Tema, Renk ve Dil tercihleri
                      </span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={onExportSettings}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200 dark:border-indigo-800/60 text-xs font-bold text-indigo-700 dark:text-indigo-300 transition-all shadow-sm active:scale-95"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Ayarları İndir</span>
                  </button>

                  <label className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200 dark:border-indigo-800/60 text-xs font-bold text-indigo-700 dark:text-indigo-300 cursor-pointer transition-all shadow-sm active:scale-95">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Ayarları Yükle</span>
                    <input
                      type="file"
                      accept=".json"
                      onChange={onImportSettings}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Tam Yedekleme */}
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/70 shadow-sm space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Archive className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    <div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white block">
                        Tam Sistem Yedekleme
                      </span>
                      <span className="text-[11px] text-slate-600 dark:text-slate-300 font-medium">
                        Tüm harcamalar, gruplar, firmalar ve ayarlar
                      </span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={onExportFullBackup}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-purple-50 dark:bg-purple-950/50 hover:bg-purple-100 dark:hover:bg-purple-900/60 border border-purple-200 dark:border-purple-800/60 text-xs font-bold text-purple-700 dark:text-purple-300 transition-all shadow-sm active:scale-95"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Tam Yedek İndir</span>
                  </button>

                  <label className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-purple-50 dark:bg-purple-950/50 hover:bg-purple-100 dark:hover:bg-purple-900/60 border border-purple-200 dark:border-purple-800/60 text-xs font-bold text-purple-700 dark:text-purple-300 cursor-pointer transition-all shadow-sm active:scale-95">
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

              {/* Excel / CSV Dışa Aktar */}
              <button
                type="button"
                onClick={onExportCSV}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 border border-emerald-200 dark:border-emerald-800/60 text-xs font-bold text-emerald-700 dark:text-emerald-300 transition-all shadow-sm active:scale-95"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Cari Ay Harcamalarını Excel / CSV Olarak İndir</span>
              </button>

              {/* Danger Zone */}
              <div className="p-4 rounded-2xl bg-rose-50/80 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 space-y-2.5 mt-6">
                <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
                  <AlertTriangle className="w-4 h-4" />
                  <h4 className="text-xs font-bold uppercase tracking-wider">{t('danger_zone') || 'Tehlikeli Bölge'}</h4>
                </div>
                <p className="text-xs text-rose-700/90 dark:text-rose-300/90 font-medium">
                  Bu cihazdaki tüm harcama, grup ve firma kayıtlarını kalıcı olarak siler.
                </p>
                <button
                  type="button"
                  onClick={onClearAllData}
                  className="flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-xs font-bold text-white shadow-sm transition-all active:scale-95"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{t('clear_all_data') || 'Tüm Verileri Temizle'}</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 5: SENKRONİZASYON */}
          {activeTab === 'sync' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/70 shadow-sm space-y-3">
                <div className="flex items-center gap-2">
                  <Cloud className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    {t('cloud_sync') || 'Bulut Senkronizasyonu'}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                  {t('sync_desc') || 'Verilerinizi uzak PostgreSQL sunucunuzla senkronize edin.'}
                </p>

                <form onSubmit={handleSaveUrl} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={tempApiUrl}
                    onChange={e => setTempApiUrl(e.target.value)}
                    placeholder="http://localhost:5001"
                    className="flex-1 px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-purple-500 shadow-inner"
                  />
                  <button
                    type="submit"
                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-white rounded-xl text-xs font-bold transition-colors border border-slate-200 dark:border-slate-600"
                  >
                    {t('save') || 'Kaydet'}
                  </button>
                </form>

                <div className="grid grid-cols-3 gap-2 pt-1">
                  <button
                    type="button"
                    disabled={syncing}
                    onClick={() => handleSyncAction('merge')}
                    className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/50 hover:bg-purple-100 dark:hover:bg-purple-900/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60 text-xs font-bold disabled:opacity-50 transition-all active:scale-95"
                  >
                    {t('sync_merge') || 'Birleştir'}
                  </button>
                  <button
                    type="button"
                    disabled={syncing}
                    onClick={() => handleSyncAction('push')}
                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-bold disabled:opacity-50 transition-all active:scale-95"
                  >
                    {t('sync_push') || 'Sunucuya Yükle'}
                  </button>
                  <button
                    type="button"
                    disabled={syncing}
                    onClick={() => handleSyncAction('pull')}
                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-bold disabled:opacity-50 transition-all active:scale-95"
                  >
                    {t('sync_pull') || 'Sunucudan Çek'}
                  </button>
                </div>

                {syncMessage && (
                  <p
                    className={`text-xs font-bold p-2.5 rounded-xl border ${
                      syncMessage.type === 'success'
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60'
                        : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/60'
                    }`}
                  >
                    {syncMessage.text}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* TAB 6: HAKKINDA (ABOUT SECTION) */}
          {activeTab === 'about' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* App Identity Banner */}
              <div className="p-5 rounded-3xl bg-gradient-to-br from-purple-500/10 via-slate-50 to-indigo-500/10 dark:from-purple-950/40 dark:via-slate-900 dark:to-indigo-950/40 border border-purple-200 dark:border-purple-800/50 text-center space-y-2.5 shadow-sm">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 p-0.5 shadow-lg shadow-purple-600/30">
                  <div className="w-full h-full rounded-2xl bg-slate-950 flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-purple-400" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">MyFinans</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                    Kişisel Bütçe, Kredi Kartı ve Taksit Takip Sistemi
                  </p>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60">
                    Sürüm v12.4.0
                  </span>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    Derleme 19
                  </span>
                </div>
              </div>

              {/* Core Features & Highlights */}
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/70 shadow-sm space-y-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Öne Çıkan Özellikler
                  </h4>
                </div>
                <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-2 font-medium">
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-500 font-bold">✓</span>
                    <span><strong>%100 Çevrimdışı ve Gizlilik Odaklı:</strong> Verileriniz yalnızca cihazınızda (IndexedDB / SQLite) saklanır.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-500 font-bold">✓</span>
                    <span><strong>Hesap Kesim ve Taksit Motoru:</strong> Kart hesap kesim döngülerinize göre taksitlerinizi otomatik takvimler.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-cyan-500 font-bold">✓</span>
                    <span><strong>Dinamik Açık & Koyu Temalar:</strong> 5 farklı renk aksanı ile modern finans deneyimi.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-500 font-bold">✓</span>
                    <span><strong>Excel / CSV & Tam Yedekleme:</strong> Tek dokunuşla tüm verilerinizi dışa aktarın ve geri yükleyin.</span>
                  </li>
                </ul>
              </div>

              {/* Developer & Community Links */}
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/70 shadow-sm space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300 font-medium">
                  <span>Geliştirici</span>
                  <span className="font-bold text-slate-900 dark:text-white">Ekrem Eşref KILINÇ (@eekilinc)</span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300 font-medium">
                  <span>Lisans</span>
                  <span className="font-bold text-slate-900 dark:text-white">MIT Açık Kaynak Lisansı</span>
                </div>
                <div className="pt-2 border-t border-slate-200 dark:border-slate-700/60 grid grid-cols-2 gap-2">
                  <a
                    href="https://github.com/eekilinc/MyFinans"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors"
                  >
                    <span>GitHub Deposu</span>
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </a>
                  <a
                    href="https://github.com/eekilinc/MyFinans/releases"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/50 dark:hover:bg-purple-900/60 text-xs font-bold text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60 transition-colors"
                  >
                    <span>Sürümler & İndir</span>
                    <ExternalLink className="w-3 h-3 text-purple-400" />
                  </a>
                </div>
              </div>

              {/* Bottom Copyright */}
              <div className="text-center py-2 text-[11px] text-slate-500 dark:text-slate-400 font-medium flex items-center justify-center gap-1">
                <span>© 2026 MyFinans • Sevgiyle Geliştirildi</span>
                <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
