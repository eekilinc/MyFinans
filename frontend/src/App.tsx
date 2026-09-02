import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Capacitor, registerPlugin } from '@capacitor/core';
import type {
  ExpenseGroup,
  Transaction,
  Bank,
  Company,
  CompanyStats,
  HistoryItem,
  GroupType,
  ToastMessage
} from './types';

import { localDatabase } from './services/localDatabase';
import { notificationService } from './services/notificationService';
import { exportMonthlyTransactionsToCSV } from './services/csvExport';

import PinLock, { isPinEnabled } from './components/PinLock';
import { Toast } from './components/Toast';
import { Header } from './components/Header';
import { MobileBottomNav } from './components/MobileBottomNav';
import { useTheme } from './context/ThemeContext';
import { DashboardSummary } from './components/DashboardSummary';
import { UpcomingTimeline } from './components/UpcomingTimeline';
import { CategoryBreakdown } from './components/CategoryBreakdown';
import { ExpenseGroupsView } from './components/ExpenseGroupsView';
import { CompanyStatsView } from './components/CompanyStatsView';
import { HistoryTrendsView } from './components/HistoryTrendsView';

import { TransactionModal } from './components/modals/TransactionModal';
import { GroupModal } from './components/modals/GroupModal';
import { CompanyDetailModal } from './components/modals/CompanyDetailModal';
import { SearchModal } from './components/modals/SearchModal';
import { SettingsModal } from './components/modals/SettingsModal';
import { AboutModal } from './components/modals/AboutModal';

interface MyFinansPrintPlugin {
  printPage(): Promise<void>;
}

const MyFinansPrint = registerPlugin<MyFinansPrintPlugin>('MyFinansPrint');

export default function App() {
  const { t, i18n } = useTranslation();

  // Security Lock
  const [isUnlocked, setIsUnlocked] = useState(() => !isPinEnabled());

  // Theme & Language
  const { theme, setTheme, accent, setAccent } = useTheme();

  // Date Navigation State (Selected Year & Month)
  const [currentDate, setCurrentDate] = useState(new Date());
  const targetYear = currentDate.getFullYear();
  const targetMonth = currentDate.getMonth() + 1; // 1-12

  // Tab & Filter States
  const [activeTab, setActiveTab] = useState<'expenses' | 'companies' | 'stats'>('expenses');
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);

  // Financial Data State
  const [summaryData, setSummaryData] = useState<{
    total_amount: number;
    paid_amount: number;
    unpaid_amount: number;
    groups: ExpenseGroup[];
  }>({
    total_amount: 0,
    paid_amount: 0,
    unpaid_amount: 0,
    groups: []
  });

  const [historyData, setHistoryData] = useState<HistoryItem[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [companyStats, setCompanyStats] = useState<CompanyStats[]>([]);
  const [banks, setBanks] = useState<Bank[]>([]);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  // Settings / Preferences
  const [budgetLimit, setBudgetLimit] = useState<number>(() => {
    const saved = localStorage.getItem('myfinans_budget_limit');
    return saved ? parseFloat(saved) : 0;
  });

  const [apiUrl, setApiUrl] = useState<string>(() => {
    return localStorage.getItem('myfinans_api_url') || import.meta.env.VITE_API_URL || '';
  });

  // Toast Notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Modal States
  const [showTxModal, setShowTxModal] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [defaultGroupId, setDefaultGroupId] = useState<string | undefined>();

  const [showGroupModal, setShowGroupModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState<ExpenseGroup | null>(null);

  const [showCompanyDetailModal, setShowCompanyDetailModal] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<CompanyStats | null>(null);
  const [selectedCompanyTransactions, setSelectedCompanyTransactions] = useState<any[]>([]);

  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);


  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  }, []);

  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Data Loading
  const fetchBanks = useCallback(async () => {
    try {
      if (!apiUrl) {
        const data = await localDatabase.getBanks();
        setBanks(data);
      } else {
        const res = await fetch(`${apiUrl}/api/banks`);
        if (res.ok) setBanks(await res.json());
      }
    } catch (_e) {
      const data = await localDatabase.getBanks();
      setBanks(data);
    }
  }, [apiUrl]);

  const fetchCompanies = useCallback(async () => {
    try {
      if (!apiUrl) {
        const data = await localDatabase.getCompanies();
        setCompanies(data);
      } else {
        const res = await fetch(`${apiUrl}/api/companies`);
        if (res.ok) setCompanies(await res.json());
      }
    } catch (_e) {
      const data = await localDatabase.getCompanies();
      setCompanies(data);
    }
  }, [apiUrl]);

  const fetchCompanyStats = useCallback(async () => {
    try {
      if (!apiUrl) {
        const data = await localDatabase.getCompanyStats();
        setCompanyStats(data);
      } else {
        const res = await fetch(`${apiUrl}/api/companies/stats`);
        if (res.ok) setCompanyStats(await res.json());
      }
    } catch (_e) {
      const data = await localDatabase.getCompanyStats();
      setCompanyStats(data);
    }
  }, [apiUrl]);

  const fetchData = useCallback(async () => {
    try {
      if (!apiUrl) {
        const summary = await localDatabase.getMonthlySummary(targetYear, targetMonth);
        setSummaryData({
          total_amount: summary.total_amount,
          paid_amount: summary.paid_amount,
          unpaid_amount: summary.unpaid_amount,
          groups: summary.groups
        });
        const history = await localDatabase.getHistory();
        setHistoryData(history);
        await fetchCompanyStats();

        // Schedule local notifications for active groups
        notificationService.scheduleNotificationsForGroups(summary.groups);
      } else {
        const res = await fetch(`${apiUrl}/api/monthly-summary?year=${targetYear}&month=${targetMonth}`);
        if (!res.ok) throw new Error('API fetch failed');
        const summary = await res.json();
        setSummaryData({
          total_amount: summary.total_amount,
          paid_amount: summary.paid_amount,
          unpaid_amount: summary.unpaid_amount,
          groups: summary.groups
        });
        const histRes = await fetch(`${apiUrl}/api/history`);
        if (histRes.ok) setHistoryData(await histRes.json());
        await fetchCompanyStats();
        notificationService.scheduleNotificationsForGroups(summary.groups);
      }
    } catch (_error) {
      // Fallback to local DB
      const summary = await localDatabase.getMonthlySummary(targetYear, targetMonth);
      setSummaryData({
        total_amount: summary.total_amount,
        paid_amount: summary.paid_amount,
        unpaid_amount: summary.unpaid_amount,
        groups: summary.groups
      });
      const history = await localDatabase.getHistory();
      setHistoryData(history);
      await fetchCompanyStats();
      notificationService.scheduleNotificationsForGroups(summary.groups);
    }
  }, [apiUrl, targetYear, targetMonth, fetchCompanyStats]);

  // Initial Load & Recurring Transactions Check
  useEffect(() => {
    const initApp = async () => {
      await localDatabase.checkAndCreateRecurringTransactions();
      await fetchData();
      await fetchBanks();
      await fetchCompanies();
    };
    initApp();
  }, [fetchData, fetchBanks, fetchCompanies]);

  // Expand all groups by default when summary groups change
  useEffect(() => {
    if (summaryData.groups.length > 0) {
      setExpandedGroups(prev => {
        const next = { ...prev };
        summaryData.groups.forEach(g => {
          if (next[g.id] === undefined) next[g.id] = true;
        });
        return next;
      });
    }
  }, [summaryData.groups]);

  // Month navigation handlers
  const handlePrevMonth = () => {
    setCurrentDate(prev => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() - 1);
      return d;
    });
  };

  const handleNextMonth = () => {
    setCurrentDate(prev => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() + 1);
      return d;
    });
  };

  const handleResetMonth = () => {
    setCurrentDate(new Date());
  };

  // Group Handlers
  const handleSaveGroup = async (groupData: {
    id?: string;
    name: string;
    type: GroupType;
    due_day: number;
    statement_day?: number;
    bank_id?: string;
  }) => {
    if (groupData.id) {
      // Update
      if (!apiUrl) {
        await localDatabase.updateGroup(groupData.id, groupData);
      } else {
        await fetch(`${apiUrl}/api/groups/${groupData.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(groupData)
        });
      }
      showToast('Grup güncellendi!');
    } else {
      // Create
      if (!apiUrl) {
        await localDatabase.createGroup(groupData);
      } else {
        await fetch(`${apiUrl}/api/groups`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(groupData)
        });
      }
      showToast('Grup oluşturuldu!');
    }
    await fetchData();
  };

  const handleDeleteGroup = async (groupId: string) => {
    if (!window.confirm(t('confirm_delete_group'))) return;
    if (!apiUrl) {
      await localDatabase.deleteGroup(groupId);
    } else {
      await fetch(`${apiUrl}/api/groups/${groupId}`, { method: 'DELETE' });
    }
    showToast('Grup ve bağlı işlemler silindi.');
    await fetchData();
  };

  // Transaction Handlers
  const handleSaveTransaction = async (txData: {
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
  }) => {
    if (txData.id) {
      if (!apiUrl) {
        await localDatabase.updateTransaction(txData.id, txData);
      } else {
        await fetch(`${apiUrl}/api/transactions/${txData.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(txData)
        });
      }
      showToast('İşlem güncellendi!');
    } else {
      if (!apiUrl) {
        await localDatabase.createTransaction(txData);
      } else {
        await fetch(`${apiUrl}/api/transactions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(txData)
        });
      }
      showToast('İşlem eklendi!');
    }
    await fetchData();
    await fetchCompanies();
    await fetchCompanyStats();
  };

  const handleDeleteTransaction = async (txId: string) => {
    if (!window.confirm(t('confirm_delete_transaction'))) return;
    if (!apiUrl) {
      await localDatabase.deleteTransaction(txId);
    } else {
      await fetch(`${apiUrl}/api/transactions/${txId}`, { method: 'DELETE' });
    }
    showToast('İşlem silindi.');
    await fetchData();
    await fetchCompanyStats();
  };

  const handleTogglePaid = async (txId: string) => {
    if (!apiUrl) {
      await localDatabase.togglePaid(txId, targetYear, targetMonth);
    } else {
      await fetch(`${apiUrl}/api/transactions/${txId}/toggle-paid`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ year: targetYear, month: targetMonth })
      });
    }
    await fetchData();
  };

  const handleDuplicateTransaction = async (tx: Transaction) => {
    const newTx = {
      group_id: tx.group_id,
      description: `${tx.description} (Kopya)`,
      amount: tx.amount,
      date: new Date().toISOString().split('T')[0],
      is_installment: tx.is_installment,
      installment_count: tx.installment_count,
      company_id: tx.company_id,
      category: tx.category,
      is_recurring: tx.is_recurring,
      recurring_day: tx.recurring_day
    };
    if (!apiUrl) {
      await localDatabase.createTransaction(newTx);
    } else {
      await fetch(`${apiUrl}/api/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTx)
      });
    }
    showToast(t('transaction_duplicated'));
    await fetchData();
  };

  // Company & Bank Quick Helpers
  const handleAddCompany = async (name: string) => {
    if (!apiUrl) {
      const c = await localDatabase.createCompany(name);
      await fetchCompanies();
      return c;
    } else {
      const res = await fetch(`${apiUrl}/api/companies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      });
      if (res.ok) {
        const c = await res.json();
        await fetchCompanies();
        return c;
      }
    }
  };

  const handleEditCompany = async (id: string, name: string) => {
    if (!apiUrl) {
      await localDatabase.updateCompany(id, name);
    } else {
      await fetch(`${apiUrl}/api/companies/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      });
    }
    showToast('Firma güncellendi.');
    await fetchCompanies();
    await fetchCompanyStats();
    await fetchData();
  };

  const handleDeleteCompany = async (id: string) => {
    if (!apiUrl) {
      await localDatabase.deleteCompany(id);
    } else {
      await fetch(`${apiUrl}/api/companies/${id}`, { method: 'DELETE' });
    }
    showToast('Firma silindi.');
    await fetchCompanies();
    await fetchCompanyStats();
    await fetchData();
  };

  const handleAddBank = async (name: string) => {
    if (!apiUrl) {
      const b = await localDatabase.createBank(name);
      await fetchBanks();
      return b;
    } else {
      const res = await fetch(`${apiUrl}/api/banks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      });
      if (res.ok) {
        const b = await res.json();
        await fetchBanks();
        return b;
      }
    }
  };

  const handleSelectCompany = async (company: CompanyStats) => {
    setSelectedCompany(company);
    if (!apiUrl) {
      const txs = await localDatabase.getCompanyTransactions(company.id);
      setSelectedCompanyTransactions(txs);
    } else {
      const res = await fetch(`${apiUrl}/api/companies/${company.id}/transactions`);
      if (res.ok) {
        setSelectedCompanyTransactions(await res.json());
      }
    }
    setShowCompanyDetailModal(true);
  };

  // Search Engine
  const handleGlobalSearch = (query: string) => {
    return localDatabase.searchTransactions(query);
  };

  // Sync Engine
  const handleSync = async (action: 'merge' | 'push' | 'pull') => {
    if (!apiUrl) throw new Error('API URL tanımlanmamış');
    const localBackup = localDatabase.exportBackup();
    const res = await fetch(`${apiUrl}/api/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, client_data: localBackup })
    });
    if (!res.ok) throw new Error(`Senkronizasyon hatası: ${res.statusText}`);
    const resData = await res.json();
    if (resData && resData.data) {
      localDatabase.importBackup(resData.data);
    }
    await fetchData();
    await fetchBanks();
    await fetchCompanies();
  };

  // Export / Import Settings & Full Backup
  const handleExportSettings = () => {
    const settingsPayload = {
      app: 'MyFinans',
      type: 'myfinans_settings',
      version: '12.1',
      exported_at: new Date().toISOString(),
      settings: {
        budget_limit: budgetLimit,
        theme,
        accent,
        api_url: apiUrl,
        language: i18n.language
      }
    };
    const blob = new Blob([JSON.stringify(settingsPayload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `MyFinans_Ayarlar_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('Ayarlar dosyası başarıyla indirildi.');
  };

  const handleImportSettings = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async event => {
      try {
        const payload = JSON.parse(event.target?.result as string);
        const settings = payload.settings || payload;
        if (settings) {
          if (typeof settings.budget_limit === 'number') {
            handleSaveBudgetLimit(settings.budget_limit);
          }
          if (settings.theme && (settings.theme === 'dark' || settings.theme === 'light')) {
            setTheme(settings.theme);
          }
          if (settings.accent) {
            setAccent(settings.accent);
          }
          if (typeof settings.api_url === 'string') {
            handleSaveApiUrl(settings.api_url);
          }
          if (settings.language) {
            i18n.changeLanguage(settings.language);
          }
          showToast('Ayarlar başarıyla içe aktarıldı ve uygulandı!');
        } else {
          showToast('Geçersiz ayar dosyası formatı.', 'error');
        }
      } catch (_err) {
        showToast('Ayarlar dosyası okunamadı.', 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleExportFullBackup = () => {
    const dataBackup = localDatabase.exportBackup();
    const fullPayload = {
      app: 'MyFinans',
      type: 'myfinans_full_backup',
      version: '12.1',
      exported_at: new Date().toISOString(),
      settings: {
        budget_limit: budgetLimit,
        theme,
        accent,
        api_url: apiUrl,
        language: i18n.language
      },
      data: dataBackup.data || dataBackup
    };
    const blob = new Blob([JSON.stringify(fullPayload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `MyFinans_Tam_Yedek_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('Tam yedek dosyası başarıyla indirildi.');
  };

  const handleImportFullBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async event => {
      try {
        const payload = JSON.parse(event.target?.result as string);
        if (payload) {
          if (payload.settings) {
            const s = payload.settings;
            if (typeof s.budget_limit === 'number') handleSaveBudgetLimit(s.budget_limit);
            if (s.theme) setTheme(s.theme);
            if (s.accent) setAccent(s.accent);
            if (typeof s.api_url === 'string') handleSaveApiUrl(s.api_url);
            if (s.language) i18n.changeLanguage(s.language);
          }
          const dataToRestore = payload.data || payload;
          localDatabase.importBackup(dataToRestore);
          await fetchData();
          await fetchCompanies();
          await fetchCompanyStats();
          await fetchBanks();
          showToast('Tüm veriler ve ayarlar başarıyla geri yüklendi!');
        }
      } catch (_err) {
        showToast('Yedek dosyası okunamadı veya bozuk.', 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleExportCSV = () => {
    exportMonthlyTransactionsToCSV(
      targetYear,
      targetMonth,
      summaryData.groups,
      t(`month_${targetMonth - 1}`)
    );
    showToast(t('export_csv_success'));
  };

  const handlePrintReport = async () => {
    if (Capacitor.isNativePlatform()) {
      try {
        await MyFinansPrint.printPage();
      } catch (_e) {
        window.print();
      }
    } else {
      window.print();
    }
  };

  const handleSaveBudgetLimit = (limit: number) => {
    setBudgetLimit(limit);
    localStorage.setItem('myfinans_budget_limit', limit.toString());
    showToast('Bütçe limiti kaydedildi.');
  };

  const handleSaveApiUrl = (url: string) => {
    setApiUrl(url);
    localStorage.setItem('myfinans_api_url', url);
    showToast('Sunucu adresi güncellendi.');
  };

  const handleClearAllData = async () => {
    localDatabase.clearAll();
    await fetchData();
    await fetchBanks();
    await fetchCompanies();
    await fetchCompanyStats();
    showToast(t('data_cleared'), 'info');
  };

  // If locked with PIN/Biometric, render lock screen
  if (!isUnlocked) {
    return <PinLock onUnlock={() => setIsUnlocked(true)} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-purple-500 selection:text-white pb-28 sm:pb-12 transition-colors duration-200">
      {/* Toast Notifications */}
      <Toast toasts={toasts} onDismiss={dismissToast} />

      {/* App Header */}
      <Header
        currentDate={currentDate}
        onPrevMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
        onResetMonth={handleResetMonth}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenSearch={() => setShowSearchModal(true)}
        onOpenAddTx={() => {
          setEditingTx(null);
          setDefaultGroupId(undefined);
          setShowTxModal(true);
        }}
        onOpenAddGroup={() => {
          setEditingGroup(null);
          setShowGroupModal(true);
        }}
        onOpenSettings={() => setShowSettingsModal(true)}
        onExportCSV={handleExportCSV}
        onPrintReport={handlePrintReport}
        isOnlineMode={!!apiUrl}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Expenses Tab */}
        {activeTab === 'expenses' && (
          <div className="space-y-6">
            {/* Dashboard 3 Metric Cards & Budget Progress */}
            <DashboardSummary
              totalAmount={summaryData.total_amount}
              paidAmount={summaryData.paid_amount}
              unpaidAmount={summaryData.unpaid_amount}
              budgetLimit={budgetLimit}
              onOpenSettings={() => setShowSettingsModal(true)}
            />

            {/* Upcoming and Overdue Timeline */}
            <UpcomingTimeline
              groups={summaryData.groups}
              currentDate={currentDate}
              onTogglePaid={handleTogglePaid}
            />

            {/* Category Breakdown & Distribution */}
            <CategoryBreakdown
              groups={summaryData.groups}
              selectedCategory={categoryFilter}
              onSelectCategory={setCategoryFilter}
            />

            {/* Expense Groups & Transactions Accordion View */}
            <ExpenseGroupsView
              groups={summaryData.groups}
              expandedGroups={expandedGroups}
              onToggleGroupExpand={groupId =>
                setExpandedGroups(prev => ({ ...prev, [groupId]: !prev[groupId] }))
              }
              onExpandAll={expand => {
                const next: Record<string, boolean> = {};
                summaryData.groups.forEach(g => {
                  next[g.id] = expand;
                });
                setExpandedGroups(next);
              }}
              onOpenAddGroup={() => {
                setEditingGroup(null);
                setShowGroupModal(true);
              }}
              onAddTransaction={groupId => {
                setEditingTx(null);
                setDefaultGroupId(groupId);
                setShowTxModal(true);
              }}
              onEditGroup={g => {
                setEditingGroup(g);
                setShowGroupModal(true);
              }}
              onDeleteGroup={handleDeleteGroup}
              onTogglePaid={handleTogglePaid}
              onEditTransaction={tx => {
                setEditingTx(tx);
                setShowTxModal(true);
              }}
              onDuplicateTransaction={handleDuplicateTransaction}
              onDeleteTransaction={handleDeleteTransaction}
              categoryFilter={categoryFilter}
            />
          </div>
        )}

        {/* Companies Tab */}
        {activeTab === 'companies' && (
          <CompanyStatsView
            companyStats={companyStats}
            onSelectCompany={handleSelectCompany}
            onAddCompany={handleAddCompany}
            onEditCompany={handleEditCompany}
            onDeleteCompany={handleDeleteCompany}
          />
        )}

        {/* Analytics & Stats Tab */}
        {activeTab === 'stats' && <HistoryTrendsView historyData={historyData} />}
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <MobileBottomNav
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenAddTx={() => {
          setEditingTx(null);
          setDefaultGroupId(undefined);
          setShowTxModal(true);
        }}
        onOpenSettings={() => setShowSettingsModal(true)}
      />

      {/* Modals */}
      <TransactionModal
        isOpen={showTxModal}
        onClose={() => setShowTxModal(false)}
        onSave={handleSaveTransaction}
        groups={summaryData.groups}
        companies={companies}
        onAddCompany={handleAddCompany}
        editingTx={editingTx}
        defaultGroupId={defaultGroupId}
      />

      <GroupModal
        isOpen={showGroupModal}
        onClose={() => setShowGroupModal(false)}
        onSave={handleSaveGroup}
        banks={banks}
        onAddBank={handleAddBank}
        editingGroup={editingGroup}
      />

      <CompanyDetailModal
        isOpen={showCompanyDetailModal}
        onClose={() => setShowCompanyDetailModal(false)}
        company={selectedCompany}
        transactions={selectedCompanyTransactions}
      />

      <SearchModal
        isOpen={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        onSearch={handleGlobalSearch}
      />

      <SettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        budgetLimit={budgetLimit}
        onSaveBudgetLimit={handleSaveBudgetLimit}
        apiUrl={apiUrl}
        onSaveApiUrl={handleSaveApiUrl}
        onSync={handleSync}
        onExportSettings={handleExportSettings}
        onImportSettings={handleImportSettings}
        onExportFullBackup={handleExportFullBackup}
        onImportFullBackup={handleImportFullBackup}
        onExportCSV={handleExportCSV}
        onClearAllData={handleClearAllData}
      />

      <AboutModal isOpen={showAboutModal} onClose={() => setShowAboutModal(false)} />
    </div>
  );
}
