import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X, FolderPlus, CreditCard, Landmark, Wallet } from 'lucide-react';
import type { ExpenseGroup, Bank, GroupType } from '../../types';

interface GroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (groupData: {
    id?: string;
    name: string;
    type: GroupType;
    due_day: number;
    statement_day?: number;
    bank_id?: string;
  }) => Promise<void>;
  banks: Bank[];
  onAddBank: (name: string) => Promise<Bank | void>;
  editingGroup: ExpenseGroup | null;
}

export const GroupModal: React.FC<GroupModalProps> = ({
  isOpen,
  onClose,
  onSave,
  banks,
  onAddBank,
  editingGroup
}) => {
  const { t } = useTranslation();

  const [name, setName] = useState('');
  const [type, setType] = useState<GroupType>('credit_card');
  const [dueDay, setDueDay] = useState(15);
  const [statementDay, setStatementDay] = useState(9);
  const [bankId, setBankId] = useState('');
  const [newBankName, setNewBankName] = useState('');
  const [isCreatingBank, setIsCreatingBank] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (editingGroup) {
      setName(editingGroup.name);
      setType(editingGroup.type);
      setDueDay(editingGroup.due_day);
      setStatementDay(editingGroup.statement_day || 9);
      setBankId(editingGroup.bank_id || '');
    } else {
      setName('');
      setType('credit_card');
      setDueDay(15);
      setStatementDay(9);
      setBankId('');
    }
  }, [editingGroup, isOpen]);

  if (!isOpen) return null;

  const handleQuickAddBank = async () => {
    if (!newBankName.trim()) return;
    const res = await onAddBank(newBankName.trim());
    if (res && res.id) {
      setBankId(res.id);
    }
    setNewBankName('');
    setIsCreatingBank(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    try {
      await onSave({
        id: editingGroup?.id,
        name: name.trim(),
        type,
        due_day: dueDay,
        statement_day: type === 'credit_card' ? statementDay : undefined,
        bank_id: bankId || undefined
      });
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl bg-slate-900 border-t sm:border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[88vh] pb-safe">
        {/* Mobile drag handle */}
        <div className="sm:hidden w-12 h-1 bg-slate-700 rounded-full mx-auto mt-2.5 mb-1" />
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-purple-600/20 text-purple-400 border border-purple-500/30">
              <FolderPlus className="w-5 h-5" />
            </div>
            <h3 className="text-base font-black text-white">
              {editingGroup ? t('edit_group') : t('add_group')}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Group Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">{t('group_name')} *</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Örn: Garanti Bonus, Konut Kredisi, Ev Kirası..."
              required
              className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-800 border border-slate-700 text-xs font-semibold text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Group Type Buttons */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">{t('group_type')}</label>
            <div className="grid grid-cols-2 gap-2">
              {(['credit_card', 'loan', 'debt', 'other'] as const).map(tKey => (
                <button
                  key={tKey}
                  type="button"
                  onClick={() => setType(tKey)}
                  className={`flex items-center gap-2 p-2.5 rounded-2xl border text-xs font-bold transition-all ${
                    type === tKey
                      ? 'bg-purple-600/30 border-purple-500 text-white shadow-md shadow-purple-600/20'
                      : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-white'
                  }`}
                >
                  {tKey === 'credit_card' ? (
                    <CreditCard className="w-4 h-4 text-purple-400" />
                  ) : tKey === 'loan' ? (
                    <Landmark className="w-4 h-4 text-indigo-400" />
                  ) : (
                    <Wallet className="w-4 h-4 text-cyan-400" />
                  )}
                  <span>{t(tKey)}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Bank Picker */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300">{t('banks')}</label>
              <button
                type="button"
                onClick={() => setIsCreatingBank(!isCreatingBank)}
                className="text-[11px] font-bold text-purple-400 hover:text-purple-300"
              >
                {isCreatingBank ? 'Listeden Seç' : '+ Yeni Banka'}
              </button>
            </div>

            {isCreatingBank ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newBankName}
                  onChange={e => setNewBankName(e.target.value)}
                  placeholder="Banka Adı..."
                  className="flex-1 px-3.5 py-2 rounded-2xl bg-slate-800 border border-slate-700 text-xs font-semibold text-white focus:outline-none focus:border-purple-500"
                />
                <button
                  type="button"
                  onClick={handleQuickAddBank}
                  className="px-3 py-2 bg-purple-600 text-white rounded-2xl text-xs font-bold"
                >
                  Ekle
                </button>
              </div>
            ) : (
              <select
                value={bankId}
                onChange={e => setBankId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-800 border border-slate-700 text-xs font-semibold text-white focus:outline-none focus:border-purple-500"
              >
                <option value="">{t('select_bank')}</option>
                {banks.map(b => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Due Day & Statement Day */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">{t('due_day')} *</label>
              <input
                type="number"
                min="1"
                max="31"
                value={dueDay}
                onChange={e => setDueDay(parseInt(e.target.value, 10))}
                required
                className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-800 border border-slate-700 text-xs font-bold text-white text-center focus:outline-none focus:border-purple-500"
              />
            </div>

            {type === 'credit_card' && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">{t('statement_day')}</label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={statementDay}
                  onChange={e => setStatementDay(parseInt(e.target.value, 10))}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-800 border border-slate-700 text-xs font-bold text-white text-center focus:outline-none focus:border-purple-500"
                />
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 transition-colors"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-xs font-bold text-white shadow-lg shadow-purple-600/30 transition-all active:scale-95 disabled:opacity-50"
            >
              {submitting ? 'Kaydediliyor...' : t('save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
