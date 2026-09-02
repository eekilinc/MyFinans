import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  X,
  FileCode,
  ExternalLink,
  CheckCircle2,
  Lock
} from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'general' | 'features' | 'changelog' | 'privacy' | 'license'>('general');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full sm:max-w-xl rounded-t-3xl sm:rounded-3xl bg-slate-900 border-t sm:border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[85vh] pb-safe">
        {/* Mobile drag handle */}
        <div className="sm:hidden w-12 h-1 bg-slate-700 rounded-full mx-auto mt-2.5 mb-1" />
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img
              src="/icon.png"
              alt="MyFinans Logo"
              className="w-9 h-9 rounded-2xl shadow-md border border-purple-500/30 object-cover"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <div>
              <h3 className="text-base font-black text-white">MyFinans v12.1</h3>
              <p className="text-[11px] text-slate-400">{t('app_subtitle')}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="px-5 pt-3 pb-2 border-b border-slate-800/80 flex items-center gap-1 overflow-x-auto">
          {(['general', 'features', 'changelog', 'privacy', 'license'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === tab
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              {tab === 'general'
                ? t('about_general')
                : tab === 'features'
                ? t('about_features')
                : tab === 'changelog'
                ? t('about_changelog')
                : tab === 'privacy'
                ? t('privacy_policy_title')
                : t('about_license')}
            </button>
          ))}
        </div>

        {/* Tab Content Body */}
        <div className="p-5 space-y-4 overflow-y-auto text-xs sm:text-sm text-slate-300">
          {activeTab === 'general' && (
            <div className="space-y-3.5">
              <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/20">
                <p className="font-semibold text-purple-200 leading-relaxed">
                  {t('app_desc')}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
                  <span className="font-semibold text-slate-400">Geliştirici & Kaynak</span>
                  <a
                    href="https://github.com/eekilinc/MyFinans"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 font-bold text-purple-400 hover:text-purple-300"
                  >
                    <span>github.com/eekilinc/MyFinans</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
                  <span className="font-semibold text-slate-400">Android Hedefi</span>
                  <span className="font-bold text-white">Android 7.0+ (API 24 - 36)</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
                  <span className="font-semibold text-slate-400">Mimari & Teknoloji</span>
                  <span className="font-bold text-white">React 19, Vite, Tailwind CSS, Capacitor</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'features' && (
            <div className="space-y-2.5">
              {[
                { title: 'Kredi Kartı Ekstre Döngüsü', desc: 'Hesap kesim gününe göre sonraki aya otomatik devreden akıllı ekstre takvimi.' },
                { title: 'Taksitli Harcama Motoru', desc: 'Aylık taksit tutarı, kalan taksit sayısı ve dinamik ödeme planı.' },
                { title: 'Çevrimdışı Öncelikli (Offline-First)', desc: 'İnternet veya harici sunucu olmadan cihaz hafızasında eksiksiz çalışma.' },
                { title: 'Excel / CSV Türkçe Raporlama', desc: 'UTF-8 BOM uyumlu Excel tabloları ve Android üzerinden anlık PDF çıktısı.' },
                { title: 'Kategori ve Firma Analitiği', desc: 'Görsel harcama dağılım grafikleri, harcama sıralaması ve detaylı filtreler.' },
                { title: 'Biyometrik ve PIN Güvenliği', desc: '4 haneli PIN ve Android parmak izi / yüz tanıma koruması.' },
                { title: 'Android Ana Ekran Widget & Bildirimler', desc: 'Son ödeme günlerinde ve gecikmelerde akıllı hatırlatıcılar.' }
              ].map((f, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/50 flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block">{f.title}</strong>
                    <span className="text-xs text-slate-400">{f.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'changelog' && (
            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-purple-950/30 border border-purple-500/30 space-y-1">
                <span className="text-xs font-black text-purple-300">v12.1 (Mobil & UI Güncellemesi)</span>
                <p className="text-xs text-slate-300 whitespace-pre-line leading-relaxed">
                  • Mobil Alt Gezinme Çubuğu (Bottom Dock) eklendi; tek parmakla Harcamalar, Firmalar, Ekle, Analiz ve Ayarlar erişimi sağlandı.
                  {"\n"}• Garantili "Şimdi Ayarla" ve Ayarlar görünürlüğü getirildi.
                  {"\n"}• Yepyeni modern uygulama logosu, ikon seti ve Android launcher simgeleri entegre edildi.
                  {"\n"}• Mobil alt sayfa (Bottom-Sheet) modallar tasarlandı.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-700/50 space-y-1">
                <span className="text-xs font-black text-slate-300">v12.0</span>
                <p className="text-xs text-slate-300 whitespace-pre-line leading-relaxed">
                  • Modüler bileşen mimarisi ve performans optimizasyonları yapıldı.
                  {"\n"}• Kategori harcama dağılımı görsel barları ve dinamik kategori filtresi eklendi.
                  {"\n"}• Excel ve CSV Türkçe karakter uyumlu UTF-8 BOM dışa aktarma entegre edildi.
                  {"\n"}• Tek tıkla harcama kopyalama (duplicate) ve hızlı işlem oluşturma özelliği eklendi.
                  {"\n"}• Android 16/17 (API 36) derleme desteği ve otomatik GitHub Release iş akışı kuruldu.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-700/50 space-y-1">
                <span className="text-xs font-black text-slate-300">v11.1</span>
                <p className="text-xs text-slate-400 whitespace-pre-line">
                  • Aylık Bütçe Limiti & Aşım Göstergesi
                  {"\n"}• Android WebView Native PDF Yazdırma Köprüsü
                  {"\n"}• Sekmeli Hakkında ve Yardım Paneli
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-700/50 space-y-1">
                <span className="text-xs font-black text-slate-300">v11.0</span>
                <p className="text-xs text-slate-400 whitespace-pre-line">
                  • Biyometrik Parmak İzi & FaceID Girişi
                  {"\n"}• Hibrit Bulut Veri Senkronizasyonu (/api/sync)
                  {"\n"}• Android Ana Ekran Widget Desteği
                </p>
              </div>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="space-y-3 p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/20">
              <div className="flex items-center gap-2 text-emerald-400">
                <Lock className="w-5 h-5" />
                <h4 className="text-sm font-bold">{t('privacy_policy_title')}</h4>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {t('privacy_policy_content')}
              </p>
              <div className="pt-2 border-t border-emerald-900/40 text-[11px] text-slate-400 space-y-1">
                <p>• Verileriniz üçüncü şahıslara veya analitik ağlarına aktarılmaz.</p>
                <p>• Reklam, izleme kodu veya telemetri içermez.</p>
                <p>• Cihazınızdaki veriler üzerinde %100 kontrol sahibisiniz.</p>
              </div>
            </div>
          )}

          {activeTab === 'license' && (
            <div className="space-y-3 p-4 rounded-2xl bg-slate-800/40 border border-slate-700/50">
              <div className="flex items-center gap-2 text-white">
                <FileCode className="w-5 h-5 text-purple-400" />
                <h4 className="text-sm font-bold">MIT License</h4>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {t('app_license_desc')}
              </p>
              <div className="p-3 rounded-xl bg-slate-950/60 font-mono text-[11px] text-slate-400 leading-normal">
                Copyright (c) 2025-2026 MyFinans Contributors
                <br /><br />
                Permission is hereby granted, free of charge, to any person obtaining a copy
                of this software and associated documentation files...
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
