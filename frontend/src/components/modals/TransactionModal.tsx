import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Layers, Repeat, DollarSign } from 'lucide-react';
import type { ExpenseGroup, Company, Transaction } from '../../types';
import { CATEGORIES } from '../../services/categories';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (txData: {
    id?: string;
    group_id: string;
    description: string;
    amount: number;
    date: string;
    is_installment: boolean;
    installment_count: number;
    company_id?: string;
    category?: string;
    is_recurring?: boolean;
    recurring_day?: number;
  }) => Promise<void>;
  groups: ExpenseGroup[];
  companies: Company[];
  onAddCompany: (name: string) => Promise<Company | void>;
  editingTx: Transaction | null;
  defaultGroupId?: string;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  groups,
  companies,
  onAddCompany,
  editingTx,
  defaultGroupId
}) => {
  const { t } = useTranslation();

  const [groupId, setGroupId] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [amountType, setAmountType] = useState<'total' | 'monthly'>('total');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isInstallment, setIsInstallment] = useState(false);
  const [installmentCount, setInstallmentCount] = useState(2);
  const [companyId, setCompanyId] = useState('');
  const [newCompanyName, setNewCompanyName] = useState('');
  const [isCreatingCompany, setIsCreatingCompany] = useState(false);
  const [category, setCategory] = useState('other');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringDay, setRecurringDay] = useState(15);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (editingTx) {
      setGroupId(editingTx.group_id);
      setDescription(editingTx.description);
      setAmount(editingTx.amount.toString());
      setAmountType('total');
      setDate(editingTx.date);
      setIsInstallment(!!editingTx.is_installment);
      setInstallmentCount(editingTx.installment_count || 2);
      setCompanyId(editingTx.company_id || '');
      setCategory(editingTx.category || 'other');
      setIsRecurring(!!editingTx.is_recurring);
      setRecurringDay(editingTx.recurring_day || 15);
    } else {
      setGroupId(defaultGroupId || (groups.length > 0 ? groups[0].id : ''));
      setDescription('');
      setAmount('');
      setAmountType('total');
      setDate(new Date().toISOString().split('T')[0]);
      setIsInstallment(false);
      setInstallmentCount(2);
      setCompanyId('');
      setCategory('other');
      setIsRecurring(false);
      setRecurringDay(15);
    }
  }, [editingTx, defaultGroupId, groups, isOpen]);

  if (!isOpen) return null;

  const handleQuickAddCompany = async () => {
    if (!newCompanyName.trim()) return;
    const res = await onAddCompany(newCompanyName.trim());
    if (res && res.id) {
      setCompanyId(res.id);
    }
    setNewCompanyName('');
    setIsCreatingCompany(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupId || !description.trim() || !amount) return;

    const parsedRaw = parseFloat(amount.replace(',', '.'));
    if (isNaN(parsedRaw) || parsedRaw <= 0) return;

    // Calculate total amount based on mode
    let finalAmount = parsedRaw;
    if (isInstallment && installmentCount > 0) {
      if (amountType === 'monthly') {
        finalAmount = parsedRaw * installmentCount;
      }
    }

    setSubmitting(true);
    try {
      await onSave({
        id: editingTx?.id,
        group_id: groupId,
        description: description.trim(),
        amount: finalAmount,
        date,
        is_installment: isInstallment,
        installment_count: isInstallment ? installmentCount : 1,
        company_id: companyId || undefined,
        category,
        is_recurring: isRecurring,
        recurring_day: isRecurring ? recurringDay : undefined
      });
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  const parsedAmount = parseFloat(amount.replace(',', '.')) || 0;
  const calculatedMonthly =
    isInstallment && installmentCount > 0
      ? amountType === 'total'
        ? parsedAmount / installmentCount
        : parsedAmount
      : parsedAmount;
  const calculatedTotal =
    isInstallment && installmentCount > 0
      ? amountType === 'total'
        ? parsedAmount
        : parsedAmount * installmentCount
      : parsedAmount;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl bg-white dark:bg-slate-900 border-t sm:border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[88vh] pb-safe transition-colors">
        {/* Mobile drag handle */}
        <div className="sm:hidden w-12 h-1 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mt-2.5 mb-1" />
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-purple-50 dark:bg-purple-600/20 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-500/30">
              <DollarSign className="w-5 h-5" />
            </div>
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              {editingTx ? t('edit_transaction') : t('add_transaction')}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto">
          {/* Target Group */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">{t('select_group')} *</label>
            <select
              value={groupId}
              onChange={e => setGroupId(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
            >
              <option value="" disabled>
                {t('select_group')}
              </option>
              {groups.map(g => (
                <option key={g.id} value={g.id}>
                  {g.name} ({t(g.type)})
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">{t('description')} *</label>
            <input
              type="text"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Örn: Market Alışverişi, Netflix, Telefon..."
              required
              className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Amount & Entry Type Toggle */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">{t('amount')} (₺) *</label>
              {isInstallment && (
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700 text-[11px] font-bold">
                  <button
                    type="button"
                    onClick={() => setAmountType('total')}
                    className={`px-2 py-0.5 rounded-lg transition-colors ${
                      amountType === 'total' ? 'bg-purple-600 text-white' : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {t('total_amount_label')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setAmountType('monthly')}
                    className={`px-2 py-0.5 rounded-lg transition-colors ${
                      amountType === 'monthly' ? 'bg-purple-600 text-white' : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {t('monthly_installment_label')}
                  </button>
                </div>
              )}
            </div>
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="0.00"
              required
              className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-black text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Date & Category in 2 Cols */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">{t('date')} *</label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">{t('category')}</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
              >
                {CATEGORIES.map(c => (
                  <option key={c.id} value={c.id}>
                    {t(c.labelKey)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Company Picker */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">{t('companies')}</label>
              <button
                type="button"
                onClick={() => setIsCreatingCompany(!isCreatingCompany)}
                className="text-[11px] font-bold text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300"
              >
                {isCreatingCompany ? t('select_from_list') : `+ ${t('new_company')}`}
              </button>
            </div>

            {isCreatingCompany ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newCompanyName}
                  onChange={e => setNewCompanyName(e.target.value)}
                  placeholder={t('company_name_placeholder')}
                  className="flex-1 px-3.5 py-2 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
                />
                <button
                  type="button"
                  onClick={handleQuickAddCompany}
                  className="px-3 py-2 bg-purple-600 text-white rounded-2xl text-xs font-bold"
                >
                  {t('add')}
                </button>
              </div>
            ) : (
              <select
                value={companyId}
                onChange={e => setCompanyId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
              >
                <option value="">{t('select_company')}</option>
                {companies.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Installment Switcher */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span className="text-xs font-bold text-slate-900 dark:text-white">{t('is_installment')}</span>
              </div>
              <input
                type="checkbox"
                checked={isInstallment}
                onChange={e => {
                  setIsInstallment(e.target.checked);
                  if (e.target.checked) setIsRecurring(false);
                }}
                className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600"
              />
            </div>

            {isInstallment && (
              <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-700/60">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <span>{t('installment_count')}</span>
                  <span className="font-bold text-purple-600 dark:text-purple-400">{t('installments_count', { count: installmentCount })}</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="36"
                  value={installmentCount}
                  onChange={e => setInstallmentCount(parseInt(e.target.value, 10))}
                  className="w-full accent-purple-600"
                />
                <p className="text-[11px] text-purple-700 dark:text-purple-300/80 bg-purple-50 dark:bg-purple-950/40 p-2 rounded-xl border border-purple-200 dark:border-purple-800/40">
                  {t('installment_summary_helper', {
                    monthly: `₺${calculatedMonthly.toFixed(2)}`,
                    total: `₺${calculatedTotal.toFixed(2)}`
                  })}
                </p>
              </div>
            )}
          </div>

          {/* Recurring Switcher */}
          {!isInstallment && (
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Repeat className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                  <span className="text-xs font-bold text-slate-900 dark:text-white">{t('is_recurring')}</span>
                </div>
                <input
                  type="checkbox"
                  checked={isRecurring}
                  onChange={e => setIsRecurring(e.target.checked)}
                  className="w-4 h-4 rounded text-cyan-600 focus:ring-cyan-500 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600"
                />
              </div>

              {isRecurring && (
                <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700/60 text-xs">
                  <span className="text-slate-700 dark:text-slate-300 font-semibold">{t('recurring_day_question')}</span>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={recurringDay}
                    onChange={e => setRecurringDay(parseInt(e.target.value, 10))}
                    className="w-16 px-2 py-1 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center font-bold text-slate-900 dark:text-white"
                  />
                </div>
              )}
            </div>
          )}

          {/* Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors"
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
