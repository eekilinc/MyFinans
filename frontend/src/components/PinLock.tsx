import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Lock, Fingerprint } from 'lucide-react';
import { NativeBiometric } from 'capacitor-native-biometric';
import { Capacitor } from '@capacitor/core';

const PIN_KEY = 'myfinans_pin_hash';
const BIO_KEY = 'myfinans_biometric_enabled';

function hashPin(pin: string): string {
  return btoa(pin.split('').reverse().join('') + '_myfinans_2025');
}

export function isPinEnabled(): boolean {
  return !!localStorage.getItem(PIN_KEY);
}

export function isBiometricEnabled(): boolean {
  return localStorage.getItem(BIO_KEY) === 'true';
}

export function enableBiometric(enable: boolean): void {
  localStorage.setItem(BIO_KEY, enable ? 'true' : 'false');
}

export function verifyPin(pin: string): boolean {
  const stored = localStorage.getItem(PIN_KEY);
  if (!stored) return true;
  return stored === hashPin(pin);
}

export function savePin(pin: string): void {
  localStorage.setItem(PIN_KEY, hashPin(pin));
}

export function removePin(): void {
  localStorage.removeItem(PIN_KEY);
  localStorage.removeItem(BIO_KEY);
}

interface PinLockProps {
  onUnlock: () => void;
}

export default function PinLock({ onUnlock }: PinLockProps) {
  const { t } = useTranslation();
  const [pin, setPin] = useState('');
  const [shake, setShake] = useState(false);
  const [error, setError] = useState('');
  const [hasBiometric, setHasBiometric] = useState(false);

  useEffect(() => {
    // Check if biometric is available and enabled
    const checkBio = async () => {
      if (!Capacitor.isNativePlatform()) return;
      try {
        const result = await NativeBiometric.isAvailable();
        if (result.isAvailable) {
          setHasBiometric(true);
          if (isBiometricEnabled()) {
            triggerBiometric();
          }
        }
      } catch (e) {
        console.error('Biometric availability check failed:', e);
      }
    };
    checkBio();
  }, []);

  const triggerBiometric = async () => {
    if (!Capacitor.isNativePlatform()) return;
    try {
      const result = await NativeBiometric.isAvailable();
      if (result.isAvailable) {
        await NativeBiometric.verifyIdentity({
          reason: t('bio_reason') || "Lütfen giriş yapmak için kimliğinizi doğrulayın",
          title: t('bio_title') || "Biyometrik Doğrulama",
          subtitle: t('bio_subtitle') || "Güvenli Giriş",
          description: t('bio_description') || "MyFinans uygulamasını açmak için parmak izi veya yüz tanımayı kullanın."
        });
        onUnlock();
      }
    } catch (e: any) {
      console.error('Biometric authentication failed:', e);
    }
  };

  const handleDigit = (d: string) => {
    if (pin.length >= 4) return;
    const newPin = pin + d;
    setPin(newPin);
    setError('');
    if (newPin.length === 4) {
      setTimeout(() => {
        if (verifyPin(newPin)) {
          onUnlock();
        } else {
          setShake(true);
          setError(t('pin_wrong'));
          setPin('');
          setTimeout(() => setShake(false), 500);
        }
      }, 100);
    }
  };

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1));
    setError('');
  };

  const digits = ['1','2','3','4','5','6','7','8','9','bio','0','del'];

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-950 px-8">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-20%] w-[60%] h-[50%] rounded-full bg-purple-900/30 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-20%] w-[60%] h-[50%] rounded-full bg-cyan-900/20 blur-[120px]" />
      </div>
      <div className="relative flex flex-col items-center gap-8 w-full max-w-xs">
        <div className="flex flex-col items-center gap-3">
          <div className="p-4 rounded-2xl bg-purple-600/20 border border-purple-500/30 shadow-xl">
            <Lock className="w-8 h-8 text-purple-400" />
          </div>
          <h1 className="text-xl font-extrabold text-white tracking-tight">MyFinans</h1>
          <p className="text-sm text-gray-400 font-medium">{t('pin_enter')}</p>
        </div>
        <div className="flex gap-5" style={{ animation: shake ? 'pinShake 0.4s ease' : undefined }}>
          {[0, 1, 2, 3].map(i => (
            <div key={i} className={`w-4 h-4 rounded-full transition-all duration-200 ${pin.length > i ? 'bg-purple-500 shadow-lg shadow-purple-500/60 scale-110' : 'bg-white/15 border border-white/25'}`} />
          ))}
        </div>
        {error && <p className="text-sm font-bold text-red-400 -mt-4 text-center">{error}</p>}
        <div className="grid grid-cols-3 gap-3 w-full">
          {digits.map((d, idx) => (
            <button key={idx} type="button"
              onClick={() => { 
                if (d === 'del') handleDelete(); 
                else if (d === 'bio') triggerBiometric();
                else handleDigit(d); 
              }}
              disabled={d === 'bio' && !hasBiometric}
              className={`h-16 rounded-2xl font-bold text-xl transition-all active:scale-95 select-none flex items-center justify-center ${d === 'bio' && !hasBiometric ? 'opacity-0 pointer-events-none' : d === 'del' ? 'bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 cursor-pointer' : d === 'bio' ? 'bg-purple-600/20 border border-purple-500/30 text-purple-400 hover:bg-purple-600/30 cursor-pointer' : 'bg-white/8 border border-white/10 text-white hover:bg-white/15 active:bg-purple-600/30 cursor-pointer'}`}
            >
              {d === 'del' ? '⌫' : d === 'bio' ? <Fingerprint className="w-6 h-6" /> : d}
            </button>
          ))}
        </div>
      </div>
      <style>{`@keyframes pinShake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-8px)} 40%{transform:translateX(8px)} 60%{transform:translateX(-8px)} 80%{transform:translateX(8px)} }`}</style>
    </div>
  );
}
