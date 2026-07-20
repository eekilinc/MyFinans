import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  CreditCard, 
  Landmark, 
  Coins, 
  Layers, 
  Plus, 
  Trash2, 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Bell, 
  Edit3, 
  Globe, 
  Sparkles,
  Info,
  X,
  Sun,
  Moon,
  CheckCircle,
  Circle,
  Settings
} from 'lucide-react';
import type { ExpenseGroup, Transaction, Bank, Company, CompanyStats, HistoryItem, GroupType } from './types';

import { localDatabase } from './services/localDatabase';

let API_URL = localStorage.getItem('myfinans_api_url') || import.meta.env.VITE_API_URL || 'http://localhost:5001';

export default function App() {
  const { t, i18n } = useTranslation();
  
  // Theme State
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('theme') as 'dark' | 'light') || 'dark';
  });

  // Date State (Defaults to current month/year)
  const [currentDate, setCurrentDate] = useState(new Date());
  const targetYear = currentDate.getFullYear();
  const targetMonth = currentDate.getMonth() + 1; // 1-12

  // App Data State
  const [summaryData, setSummaryData] = useState<{
    selected_year: number;
    selected_month: number;
    total_amount: number;
    paid_amount: number;
    unpaid_amount: number;
    groups: ExpenseGroup[];
  } | null>(null);
  
  const [historyData, setHistoryData] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Expanded groups tracking
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  // Modals state
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState<ExpenseGroup | null>(null);
  const [groupName, setGroupName] = useState('');
  const [groupType, setGroupType] = useState<GroupType>('credit_card');
  const [groupDueDay, setGroupDueDay] = useState(15);
  const [groupStatementDay, setGroupStatementDay] = useState(9);

  const [showTxModal, setShowTxModal] = useState(false);
  const [txGroupId, setTxGroupId] = useState('');
  const [txDescription, setTxDescription] = useState('');
  const [txAmount, setTxAmount] = useState('');
  const [txDate, setTxDate] = useState(new Date().toISOString().split('T')[0]);
  const [txIsInstallment, setTxIsInstallment] = useState(false);
  const [txInstallmentCount, setTxInstallmentCount] = useState(2);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [txAmountType, setTxAmountType] = useState<'total' | 'monthly'>('total');
  const [companies, setCompanies] = useState<Company[]>([]);
  const [companyStats, setCompanyStats] = useState<CompanyStats[]>([]);
  const [selectedCompanyTransactions, setSelectedCompanyTransactions] = useState<any[]>([]);
  const [showCompanyDetailModal, setShowCompanyDetailModal] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<CompanyStats | null>(null);
  const [companySearchQuery, setCompanySearchQuery] = useState('');
  const [companySortBy, setCompanySortBy] = useState<'spent' | 'count' | 'alpha'>('spent');
  const [txCompanyId, setTxCompanyId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'expenses' | 'companies'>('expenses');
  const [newCompanyName, setNewCompanyName] = useState('');
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [settingsApiUrl, setSettingsApiUrl] = useState(() => localStorage.getItem('myfinans_api_url') || '');

  const [banks, setBanks] = useState<Bank[]>([]);
  const [selectedBankId, setSelectedBankId] = useState<string>('all');
  const [groupBankId, setGroupBankId] = useState<string>('');
  const [showBankManager, setShowBankManager] = useState(false);
  const [newBankName, setNewBankName] = useState('');
  const [appMode, setAppMode] = useState<'offline' | 'online'>(() => {
    return (localStorage.getItem('myfinans_app_mode') as 'offline' | 'online') || 'offline';
  });

  // Sync Theme class on document element
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.add('light');
      root.classList.remove('dark');
    } else {
      root.classList.add('dark');
      root.classList.remove('light');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const fetchBanks = async () => {
    try {
      if (appMode === 'offline') {
        const data = await localDatabase.getBanks();
        setBanks(data);
      } else {
        const res = await fetch(`${API_URL}/api/banks`);
        if (res.ok) {
          const data = await res.json();
          setBanks(data);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCompanies = async () => {
    try {
      if (appMode === 'offline') {
        const data = await localDatabase.getCompanies();
        setCompanies(data);
      } else {
        const res = await fetch(`${API_URL}/api/companies`);
        if (res.ok) {
          const data = await res.json();
          setCompanies(data);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCompanyStats = async () => {
    try {
      if (appMode === 'offline') {
        const data = await localDatabase.getCompanyStats();
        setCompanyStats(data);
      } else {
        const res = await fetch(`${API_URL}/api/companies/stats`);
        if (res.ok) {
          const data = await res.json();
          setCompanyStats(data);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCompanyTransactions = async (companyId: string) => {
    try {
      if (appMode === 'offline') {
        const data = await localDatabase.getCompanyTransactions(companyId);
        setSelectedCompanyTransactions(data);
      } else {
        const res = await fetch(`${API_URL}/api/companies/${companyId}/transactions`);
        if (res.ok) {
          const data = await res.json();
          setSelectedCompanyTransactions(data);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      if (appMode === 'offline') {
        const summary = await localDatabase.getMonthlySummary(targetYear, targetMonth);
        setSummaryData(summary);
        setError(null);

        const history = await localDatabase.getHistory();
        setHistoryData(history);

        const stats = await localDatabase.getCompanyStats();
        setCompanyStats(stats);
      } else {
        const res = await fetch(`${API_URL}/api/monthly-summary?year=${targetYear}&month=${targetMonth}`);
        if (!res.ok) throw new Error('API fetch failed');
        const data = await res.json();
        setSummaryData(data);
        setError(null);

        // Fetch rolling history
        const histRes = await fetch(`${API_URL}/api/history`);
        if (histRes.ok) {
          const histData = await histRes.json();
          setHistoryData(histData);
        }

        // Fetch company stats
        fetchCompanyStats();
      }
    } catch (err: any) {
      console.error(err);
      if (appMode === 'online') {
        setError('Could not connect to MyFinans Server. Please check if backend is running.');
      } else {
        setError('Offline Database Error');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [targetYear, targetMonth]);

  useEffect(() => {
    fetchBanks();
    fetchCompanies();
  }, []);

  // Language Switch
  const toggleLanguage = () => {
    const nextLng = i18n.language === 'tr' ? 'en' : 'tr';
    i18n.changeLanguage(nextLng);
  };

  // Theme Switch
  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  // Backup & Restore handlers
  const handleExportBackup = async () => {
    try {
      if (appMode === 'offline') {
        const backup = localDatabase.exportBackup();
        const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `myfinans_backup_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        const response = await fetch(`${API_URL}/api/backup/export`);
        if (response.ok) {
          const backup = await response.json();
          const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `myfinans_backup_${new Date().toISOString().split('T')[0]}.json`;
          a.click();
          URL.revokeObjectURL(url);
        }
      }
    } catch (err) {
      console.error('Error exporting backup:', err);
    }
  };

  const handleImportBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const payload = JSON.parse(event.target?.result as string);
        if (!payload.data) {
          alert(t('import_error'));
          return;
        }

        if (!window.confirm(t('confirm_delete_transaction') + " (" + t('import_data') + ")")) return;

        if (appMode === 'offline') {
          localDatabase.importBackup(payload.data);
          alert(t('import_success'));
          fetchData();
          fetchCompanies();
          fetchCompanyStats();
          fetchBanks();
          setShowSettingsModal(false);
        } else {
          const response = await fetch(`${API_URL}/api/backup/import`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ data: payload.data })
          });

          if (response.ok) {
            alert(t('import_success'));
            fetchData();
            fetchCompanies();
            fetchCompanyStats();
            fetchBanks();
            setShowSettingsModal(false);
          } else {
            alert(t('import_error'));
          }
        }
      } catch (err) {
        console.error('Error importing backup:', err);
        alert(t('import_error'));
      }
    };
    reader.readAsText(file);
  };

  const handleSaveApiUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (settingsApiUrl.trim()) {
      localStorage.setItem('myfinans_api_url', settingsApiUrl.trim());
    } else {
      localStorage.removeItem('myfinans_api_url');
    }
    window.location.reload();
  };

  // Month navigation helpers
  const nextMonth = () => {
    setCurrentDate(new Date(targetYear, targetMonth, 1));
  };

  const prevMonth = () => {
    setCurrentDate(new Date(targetYear, targetMonth - 2, 1));
  };

  const navigateToMonth = (year: number, month: number) => {
    setCurrentDate(new Date(year, month - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getBankTotals = (bankId: string) => {
    let total = 0;
    let paid = 0;
    summaryData?.groups.forEach(g => {
      if (g.bank_id === bankId) {
        total += g.total_amount;
        paid += g.paid_amount;
      }
    });
    return { total, paid, unpaid: total - paid };
  };

  // Group Handlers
  const handleOpenAddGroup = () => {
    setEditingGroup(null);
    setGroupName('');
    setGroupType('credit_card');
    setGroupDueDay(15);
    setGroupStatementDay(9);
    setGroupBankId('');
    setShowGroupModal(true);
  };

  const handleOpenEditGroup = (group: ExpenseGroup, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingGroup(group);
    setGroupName(group.name);
    setGroupType(group.type);
    setGroupDueDay(group.due_day);
    setGroupStatementDay(group.statement_day || 9);
    setGroupBankId(group.bank_id || '');
    setShowGroupModal(true);
  };

  const handleSaveGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim()) return;

    try {
      if (appMode === 'offline') {
        await localDatabase.saveGroup({
          id: editingGroup?.id,
          name: groupName,
          type: groupType,
          due_day: groupDueDay,
          statement_day: groupType === 'credit_card' ? groupStatementDay : null,
          bank_id: groupBankId || null
        });
        setShowGroupModal(false);
        fetchData();
      } else {
        const url = editingGroup 
          ? `${API_URL}/api/groups/${editingGroup.id}`
          : `${API_URL}/api/groups`;
        
        const method = editingGroup ? 'PUT' : 'POST';

        const response = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: groupName,
            type: groupType,
            due_day: groupDueDay,
            statement_day: groupType === 'credit_card' ? groupStatementDay : null,
            bank_id: groupBankId || null
          })
        });

        if (response.ok) {
          setShowGroupModal(false);
          fetchData();
        }
      }
    } catch (err) {
      console.error('Error saving group:', err);
    }
  };

  const handleDeleteGroup = async (groupId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm(t('confirm_delete_group'))) return;

    try {
      if (appMode === 'offline') {
        await localDatabase.deleteGroup(groupId);
        fetchData();
      } else {
        const res = await fetch(`${API_URL}/api/groups/${groupId}`, {
          method: 'DELETE'
        });
        if (res.ok) {
          fetchData();
        }
      }
    } catch (err) {
      console.error('Error deleting group:', err);
    }
  };

  // Bank Management Handlers
  const handleAddBank = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBankName.trim()) return;

    try {
      if (appMode === 'offline') {
        await localDatabase.addBank(newBankName);
        setNewBankName('');
        fetchBanks();
        fetchData();
      } else {
        const res = await fetch(`${API_URL}/api/banks`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: newBankName })
        });
        if (res.ok) {
          setNewBankName('');
          fetchBanks();
          fetchData();
        }
      }
    } catch (err) {
      console.error('Error adding bank:', err);
    }
  };

  const handleDeleteBank = async (bankId: string) => {
    if (!window.confirm(t('delete_bank_confirm'))) return;

    try {
      if (appMode === 'offline') {
        await localDatabase.deleteBank(bankId);
        fetchBanks();
        fetchData();
        if (selectedBankId === bankId) {
          setSelectedBankId('all');
        }
      } else {
        const res = await fetch(`${API_URL}/api/banks/${bankId}`, {
          method: 'DELETE'
        });
        if (res.ok) {
          fetchBanks();
          fetchData();
          if (selectedBankId === bankId) {
            setSelectedBankId('all');
          }
        }
      }
    } catch (err) {
      console.error('Error deleting bank:', err);
    }
  };

  // Company Management Handlers
  const handleAddCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompanyName.trim()) return;

    try {
      if (appMode === 'offline') {
        await localDatabase.addCompany(newCompanyName);
        setNewCompanyName('');
        fetchCompanies();
        fetchCompanyStats();
        fetchData();
      } else {
        const res = await fetch(`${API_URL}/api/companies`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: newCompanyName })
        });
        if (res.ok) {
          setNewCompanyName('');
          fetchCompanies();
          fetchCompanyStats();
          fetchData();
        }
      }
    } catch (err) {
      console.error('Error adding company:', err);
    }
  };

  const handleDeleteCompany = async (companyId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm(t('delete_company_confirm'))) return;

    try {
      if (appMode === 'offline') {
        await localDatabase.deleteCompany(companyId);
        fetchCompanies();
        fetchCompanyStats();
        fetchData();
        if (selectedCompany && selectedCompany.id === companyId) {
          setSelectedCompany(null);
          setShowCompanyDetailModal(false);
        }
      } else {
        const res = await fetch(`${API_URL}/api/companies/${companyId}`, {
          method: 'DELETE'
        });
        if (res.ok) {
          fetchCompanies();
          fetchCompanyStats();
          fetchData();
          if (selectedCompany && selectedCompany.id === companyId) {
            setSelectedCompany(null);
            setShowCompanyDetailModal(false);
          }
        }
      }
    } catch (err) {
      console.error('Error deleting company:', err);
    }
  };

  // Transaction Handlers
  const handleOpenAddTx = (groupId = '', tx: Transaction | null = null) => {
    setEditingTx(tx);
    setTxAmountType('total');
    if (tx) {
      setTxGroupId(tx.group_id);
      setTxDescription(tx.description);
      setTxAmount(String(tx.amount));
      setTxDate(tx.date);
      setTxIsInstallment(tx.is_installment);
      setTxInstallmentCount(tx.installment_count);
      setTxCompanyId(tx.company_id || '');
    } else {
      setTxGroupId(groupId || (summaryData?.groups[0]?.id || ''));
      setTxDescription('');
      setTxAmount('');
      setTxDate(currentDate.toISOString().split('T')[0]);
      setTxIsInstallment(false);
      setTxInstallmentCount(2);
      setTxCompanyId('');
    }
    setShowTxModal(true);
  };

  const handleSaveTx = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!txGroupId || !txDescription.trim() || !txAmount || !txDate) return;

    const parsedAmt = parseFloat(txAmount);
    const finalAmount = txIsInstallment && txAmountType === 'monthly'
      ? parsedAmt * txInstallmentCount
      : parsedAmt;

    try {
      if (appMode === 'offline') {
        await localDatabase.saveTransaction({
          id: editingTx?.id,
          group_id: txGroupId,
          description: txDescription,
          amount: finalAmount,
          date: txDate,
          is_installment: txIsInstallment,
          installment_count: txIsInstallment ? txInstallmentCount : 1,
          company_id: txCompanyId || null
        });

        setShowTxModal(false);
        setEditingTx(null);
        fetchData();
        fetchCompanyStats();
        if (showCompanyDetailModal && selectedCompany) {
          fetchCompanyTransactions(selectedCompany.id);
        }
        // Expand the group where the transaction was added/edited
        setExpandedGroups(prev => ({ ...prev, [txGroupId]: true }));
      } else {
        const url = editingTx 
          ? `${API_URL}/api/transactions/${editingTx.id}`
          : `${API_URL}/api/transactions`;
        const method = editingTx ? 'PUT' : 'POST';

        const response = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            group_id: txGroupId,
            description: txDescription,
            amount: finalAmount,
            date: txDate,
            is_installment: txIsInstallment,
            installment_count: txIsInstallment ? txInstallmentCount : 1,
            company_id: txCompanyId || null
          })
        });

        if (response.ok) {
          setShowTxModal(false);
          setEditingTx(null);
          fetchData();
          fetchCompanyStats();
          if (showCompanyDetailModal && selectedCompany) {
            fetchCompanyTransactions(selectedCompany.id);
          }
          // Expand the group where the transaction was added/edited
          setExpandedGroups(prev => ({ ...prev, [txGroupId]: true }));
        }
      }
    } catch (err) {
      console.error('Error saving transaction:', err);
    }
  };

  const handleDeleteTx = async (txId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm(t('confirm_delete_transaction'))) return;

    try {
      if (appMode === 'offline') {
        await localDatabase.deleteTransaction(txId);
        fetchData();
        fetchCompanyStats();
      } else {
        const res = await fetch(`${API_URL}/api/transactions/${txId}`, {
          method: 'DELETE'
        });
        if (res.ok) {
          fetchData();
          fetchCompanyStats();
        }
      }
    } catch (err) {
      console.error('Error deleting transaction:', err);
    }
  };

  const handleTogglePaid = async (txId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      if (appMode === 'offline') {
        await localDatabase.toggleTransactionPaid(txId, targetYear, targetMonth);
        fetchData();
      } else {
        const res = await fetch(`${API_URL}/api/transactions/${txId}/toggle-paid`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            year: targetYear,
            month: targetMonth
          })
        });
        if (res.ok) {
          fetchData();
        }
      }
    } catch (err) {
      console.error('Error toggling payment:', err);
    }
  };

  const toggleGroupExpand = (groupId: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };

  // Get Type Icon helper
  const getGroupIcon = (type: GroupType) => {
    switch (type) {
      case 'credit_card': return <CreditCard className="w-5 h-5 text-purple-500 dark:text-purple-400" />;
      case 'loan': return <Landmark className="w-5 h-5 text-cyan-500 dark:text-cyan-400" />;
      case 'debt': return <Coins className="w-5 h-5 text-amber-500 dark:text-amber-400" />;
      default: return <Layers className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />;
    }
  };

  // Notification / Alarm logic
  const getDuesAlerts = () => {
    if (!summaryData) return [];
    
    const today = new Date();
    const currentLocalDay = today.getDate();
    const currentLocalMonth = today.getMonth() + 1;
    const currentLocalYear = today.getFullYear();

    const alerts: Array<{
      groupName: string;
      amount: number;
      dueDay: number;
      status: 'today' | 'upcoming' | 'overdue';
      daysLeft: number;
    }> = [];

    summaryData.groups.forEach(g => {
      // Alert only if there is unpaid amount
      const unpaidAmount = g.total_amount - g.paid_amount;
      if (unpaidAmount <= 0) return;

      const isTargetThisMonth = targetYear === currentLocalYear && targetMonth === currentLocalMonth;
      
      if (isTargetThisMonth) {
        if (g.due_day === currentLocalDay) {
          alerts.push({
            groupName: g.name,
            amount: unpaidAmount,
            dueDay: g.due_day,
            status: 'today',
            daysLeft: 0
          });
        } else if (g.due_day > currentLocalDay && g.due_day - currentLocalDay <= 5) {
          alerts.push({
            groupName: g.name,
            amount: unpaidAmount,
            dueDay: g.due_day,
            status: 'upcoming',
            daysLeft: g.due_day - currentLocalDay
          });
        } else if (g.due_day < currentLocalDay) {
          alerts.push({
            groupName: g.name,
            amount: unpaidAmount,
            dueDay: g.due_day,
            status: 'overdue',
            daysLeft: currentLocalDay - g.due_day
          });
        }
      }
    });

    return alerts;
  };

  const activeAlerts = getDuesAlerts();

  return (
    <div className="min-h-screen pb-20 relative overflow-hidden transition-colors duration-300">
      
      {/* Background Decorative Ambient Blurs */}
      <div className="absolute top-[-10%] left-[-20%] w-[60%] h-[50%] rounded-full bg-purple-500/10 dark:bg-purple-900/20 blur-[120px] animate-pulse-slow pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-20%] w-[60%] h-[50%] rounded-full bg-cyan-500/10 dark:bg-cyan-950/30 blur-[120px] animate-pulse-slow pointer-events-none"></div>

      {/* Main Container */}
      <div className="max-w-md mx-auto px-4 pt-6">
        
        {/* Header Section */}
        <header className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2 min-w-0">
            <img 
              src="/logo.png" 
              className="w-10 h-10 rounded-xl shadow-[0_0_15px_rgba(168,85,247,0.15)] border border-purple-500/20 object-cover shrink-0 animate-float" 
              alt="MyFinans Logo" 
            />
            <div className="min-w-0">
              <h1 className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-purple-600 via-pink-500 to-cyan-500 dark:from-purple-400 dark:via-pink-400 dark:to-cyan-400 bg-clip-text text-transparent text-glow-purple truncate">
                MyFinans
              </h1>
              <span className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 tracking-wider block truncate">
                {t('app_subtitle')}
              </span>
            </div>
          </div>
          
          <div className="flex gap-1.5 shrink-0">
            {/* Manage Banks */}
            <button 
              onClick={() => setShowBankManager(true)}
              className="p-2 rounded-xl bg-slate-200/50 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-slate-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 active:scale-95 transition-all cursor-pointer flex items-center justify-center"
              title={t('manage_banks')}
            >
              <Landmark className="w-4 h-4" />
            </button>

            {/* Theme Toggle */}
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-slate-200/50 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-slate-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 active:scale-95 transition-all cursor-pointer"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Language Switch */}
            <button 
              onClick={toggleLanguage}
              className="px-2 py-1.5 rounded-xl bg-slate-200/50 dark:bg-white/5 border border-slate-300 dark:border-white/10 hover:bg-slate-300/50 dark:hover:bg-white/10 active:scale-95 transition-all text-[10px] font-bold text-slate-700 dark:text-gray-400 dark:hover:text-white flex items-center gap-1 cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5" />
              {i18n.language.toUpperCase()}
            </button>

            {/* Settings */}
            <button 
              onClick={() => setShowSettingsModal(true)}
              className="p-2 rounded-xl bg-slate-200/50 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-slate-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 active:scale-95 transition-all cursor-pointer flex items-center justify-center"
              title={t('settings')}
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Month Navigator */}
        <div className="flex justify-between items-center mb-4 px-1">
          <button 
            onClick={prevMonth}
            className="p-2.5 rounded-xl bg-slate-200/50 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white active:scale-95 transition-all cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <h2 className="text-lg font-bold text-slate-800 dark:text-gray-200">
            {t(`month_${targetMonth - 1}`)} {targetYear}
          </h2>

          <button 
            onClick={nextMonth}
            className="p-2.5 rounded-xl bg-slate-200/50 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white active:scale-95 transition-all cursor-pointer"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 p-1 bg-slate-200/50 dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-2xl mb-4">
          <button
            onClick={() => setActiveTab('expenses')}
            className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'expenses'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20'
                : 'text-slate-600 dark:text-gray-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-300/30 dark:hover:bg-white/5'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            {t('expenses_tab')}
          </button>
          <button
            onClick={() => { setActiveTab('companies'); fetchCompanyStats(); }}
            className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'companies'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20'
                : 'text-slate-600 dark:text-gray-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-300/30 dark:hover:bg-white/5'
            }`}
          >
            <Coins className="w-4 h-4" />
            {t('companies_tab')}
          </button>
        </div>

        {/* Connection Error Message */}
        {error && (
          <div className="p-4 mb-6 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-700 dark:text-red-300 text-sm flex gap-3 items-start animate-pulse">
            <Info className="w-5 h-5 shrink-0 mt-0.5 text-red-500" />
            <div>
              <p className="font-semibold">Connection Error</p>
              <p className="text-xs opacity-80 mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Dashboard Top Banner */}
        {activeTab === 'expenses' && summaryData && !error && (
          <>
            <div className="glass-card rounded-3xl p-5 mb-4 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl pointer-events-none"></div>
            
            <p className="text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider mb-1">
              {t('total_monthly_expense')}
            </p>
            <h3 className="text-3xl font-black text-slate-800 dark:text-gray-100 mb-5 tracking-tight">
              {summaryData.total_amount.toLocaleString(i18n.language === 'tr' ? 'tr-TR' : 'en-US', {
                style: 'currency',
                currency: i18n.language === 'tr' ? 'TRY' : 'USD'
              })}
            </h3>

            {/* Paid / Unpaid split stats */}
            <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-200 dark:border-white/5">
              <div className="p-3 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
                <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 tracking-wider">
                  {t('paid_summary')}
                </span>
                <span className="block text-base font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">
                  {summaryData.paid_amount.toLocaleString(i18n.language === 'tr' ? 'tr-TR' : 'en-US', {
                    style: 'currency',
                    currency: i18n.language === 'tr' ? 'TRY' : 'USD'
                  })}
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-amber-500/5 border border-amber-500/10">
                <span className="text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400 tracking-wider">
                  {t('unpaid_summary')}
                </span>
                <span className="block text-base font-extrabold text-amber-600 dark:text-amber-400 mt-0.5">
                  {summaryData.unpaid_amount.toLocaleString(i18n.language === 'tr' ? 'tr-TR' : 'en-US', {
                    style: 'currency',
                    currency: i18n.language === 'tr' ? 'TRY' : 'USD'
                  })}
                </span>
              </div>
            </div>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-2 gap-3 mt-4">
              <button 
                onClick={handleOpenAddGroup}
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-slate-200/50 dark:bg-white/5 border border-slate-300 dark:border-white/10 hover:bg-slate-300/50 dark:hover:bg-white/10 active:scale-98 transition-all font-semibold text-xs text-slate-700 dark:text-gray-200 cursor-pointer"
              >
                <Plus className="w-4 h-4 text-purple-500 dark:text-purple-400" />
                {t('add_group')}
              </button>
              
              <button 
                onClick={() => handleOpenAddTx('')}
                disabled={summaryData.groups.length === 0}
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-purple-600 hover:bg-purple-500 active:scale-98 transition-all font-semibold text-xs text-white shadow-lg shadow-purple-600/20 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4" />
                {t('add_transaction')}
              </button>
            </div>
          </div>

        {/* Horizontal Bank Filter Scroll Bar */}
        {summaryData && !error && (
          <div className="mb-4">
            <div className="flex items-center justify-between px-1 mb-2">
              <span className="text-xs font-bold text-slate-500 dark:text-gray-400 tracking-wider uppercase">
                {t('banks')}
              </span>
            </div>
            
            <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-none snap-x snap-mandatory">
              {/* Tümü Badge */}
              <button
                onClick={() => setSelectedBankId('all')}
                className={`px-4 py-3 rounded-2xl border text-xs font-bold transition-all shrink-0 snap-start flex flex-col items-start min-w-[80px] cursor-pointer ${
                  selectedBankId === 'all'
                    ? 'bg-purple-600 border-purple-600 text-white shadow-lg shadow-purple-600/20'
                    : 'bg-slate-200/50 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-slate-700 dark:text-gray-300 hover:bg-slate-300/50 dark:hover:bg-white/10'
                }`}
              >
                <span>{t('all')}</span>
                <span className={`text-[10px] mt-0.5 opacity-85 font-black ${selectedBankId === 'all' ? 'text-white' : 'text-slate-500 dark:text-gray-400'}`}>
                  {summaryData.total_amount.toLocaleString(i18n.language === 'tr' ? 'tr-TR' : 'en-US', {
                    style: 'currency',
                    currency: i18n.language === 'tr' ? 'TRY' : 'USD',
                    maximumFractionDigits: 0
                  })}
                </span>
              </button>

              {/* Individual Bank Badges */}
              {banks.map(bank => {
                const totals = getBankTotals(bank.id);
                return (
                  <button
                    key={bank.id}
                    onClick={() => setSelectedBankId(bank.id)}
                    className={`px-4 py-3 rounded-2xl border text-xs font-bold transition-all shrink-0 snap-start flex flex-col items-start min-w-[120px] cursor-pointer ${
                      selectedBankId === bank.id
                        ? 'bg-purple-600 border-purple-600 text-white shadow-lg shadow-purple-600/20'
                        : 'bg-slate-200/50 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-slate-700 dark:text-gray-300 hover:bg-slate-300/50 dark:hover:bg-white/10'
                    }`}
                  >
                    <span>{bank.name}</span>
                    <span className={`text-[10px] mt-0.5 opacity-85 font-black ${selectedBankId === bank.id ? 'text-white' : 'text-slate-500 dark:text-gray-400'}`}>
                      {totals.total.toLocaleString(i18n.language === 'tr' ? 'tr-TR' : 'en-US', {
                        style: 'currency',
                        currency: i18n.language === 'tr' ? 'TRY' : 'USD',
                        maximumFractionDigits: 0
                      })}
                    </span>
                  </button>
                );
              })}

              {/* Bağımsız Badge */}
              {(() => {
                const independentTotals = (() => {
                  let total = 0;
                  summaryData?.groups.forEach(g => {
                    if (!g.bank_id) total += g.total_amount;
                  });
                  return total;
                })();

                return (
                  <button
                    onClick={() => setSelectedBankId('independent')}
                    className={`px-4 py-3 rounded-2xl border text-xs font-bold transition-all shrink-0 snap-start flex flex-col items-start min-w-[100px] cursor-pointer ${
                      selectedBankId === 'independent'
                        ? 'bg-purple-600 border-purple-600 text-white shadow-lg shadow-purple-600/20'
                        : 'bg-slate-200/50 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-slate-700 dark:text-gray-300 hover:bg-slate-300/50 dark:hover:bg-white/10'
                    }`}
                  >
                    <span>{t('independent_groups')}</span>
                    <span className={`text-[10px] mt-0.5 opacity-85 font-black ${selectedBankId === 'independent' ? 'text-white' : 'text-slate-500 dark:text-gray-400'}`}>
                      {independentTotals.toLocaleString(i18n.language === 'tr' ? 'tr-TR' : 'en-US', {
                        style: 'currency',
                        currency: i18n.language === 'tr' ? 'TRY' : 'USD',
                        maximumFractionDigits: 0
                      })}
                    </span>
                  </button>
                );
              })()}
            </div>
          </div>
        )}

        {/* Notifications panel (Payment days) */}
        {activeAlerts.length > 0 && !error && (
          <div className="mb-6 space-y-2.5">
            <div className="flex items-center gap-1.5 px-1 mb-1">
              <Bell className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span className="text-xs font-bold text-slate-500 dark:text-gray-400 tracking-wider uppercase">
                {t('upcoming_payments')}
              </span>
            </div>
            {activeAlerts.map((alert, idx) => (
              <div 
                key={idx} 
                className={`p-3.5 rounded-2xl border flex items-center justify-between shadow-md transition-all ${
                  alert.status === 'today' 
                    ? 'bg-amber-500/10 border-amber-500/35 text-amber-800 dark:text-amber-300' 
                    : alert.status === 'overdue'
                    ? 'bg-red-500/10 border-red-500/35 text-red-800 dark:text-red-300'
                    : 'bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-gray-300'
                }`}
              >
                <div className="flex flex-col">
                  <span className="font-bold text-sm text-slate-800 dark:text-white">{alert.groupName}</span>
                  <span className="text-xs mt-0.5 opacity-80">
                    {alert.status === 'today' && t('due_today')}
                    {alert.status === 'upcoming' && t('due_in_days', { days: alert.daysLeft })}
                    {alert.status === 'overdue' && t('overdue_by_days', { days: alert.daysLeft })}
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-extrabold text-sm block">
                    {alert.amount.toLocaleString(i18n.language === 'tr' ? 'tr-TR' : 'en-US', {
                      style: 'currency',
                      currency: i18n.language === 'tr' ? 'TRY' : 'USD'
                    })}
                  </span>
                  <span className="text-[10px] opacity-60 font-semibold uppercase">
                    {t('due_day')}: {alert.dueDay}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* List of groups */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="w-8 h-8 rounded-full border-2 border-purple-500/20 border-t-purple-600 animate-spin"></div>
          </div>
        )}

        {!loading && summaryData && (
          <div className="space-y-3 mb-8">
              {(() => {
                const filteredGroups = summaryData.groups.filter(g => {
                  if (selectedBankId === 'all') return true;
                  if (selectedBankId === 'independent') return !g.bank_id;
                  return g.bank_id === selectedBankId;
                });

                if (filteredGroups.length === 0) {
                  return (
                    <div className="glass-card rounded-3xl p-8 text-center text-slate-500 dark:text-gray-400">
                      <Info className="w-8 h-8 text-slate-400 dark:text-gray-300 mx-auto mb-3" />
                      <p className="text-sm font-medium leading-relaxed">{t('no_transactions')}</p>
                    </div>
                  );
                }

                return filteredGroups.map(group => {
                  const isExpanded = !!expandedGroups[group.id];
                  const unpaidGroupAmount = group.total_amount - group.paid_amount;
                  return (
                    <div 
                      key={group.id}
                      className={`glass-card rounded-2xl overflow-hidden transition-all duration-300 border ${
                        isExpanded ? 'ring-1 ring-purple-500/30' : ''
                      }`}
                    >
                      {/* Group Header Card */}
                      <div 
                        onClick={() => toggleGroupExpand(group.id)}
                        className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-500/[0.02] dark:hover:bg-white/[0.02] active:bg-slate-500/[0.04] dark:active:bg-white/[0.04] transition-all select-none"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 rounded-xl bg-slate-200/50 dark:bg-white/5 border border-slate-300 dark:border-white/10 shrink-0">
                            {getGroupIcon(group.type)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-bold text-sm text-slate-800 dark:text-white tracking-wide">{group.name}</h4>
                              {group.bank_name && (
                                <span className="px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                                  {group.bank_name}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-500 dark:text-gray-400 font-semibold">
                              <Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-gray-300" />
                              <span>
                                {group.type === 'credit_card' && group.statement_day 
                                  ? t('billing_cycle', { statement: group.statement_day, due: group.due_day })
                                  : `${t('due_day')}: ${group.due_day}${t('due_day_suffix')}`}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <span className="font-extrabold text-sm block text-slate-800 dark:text-gray-100">
                              {group.total_amount.toLocaleString(i18n.language === 'tr' ? 'tr-TR' : 'en-US', {
                                style: 'currency',
                                currency: i18n.language === 'tr' ? 'TRY' : 'USD'
                              })}
                            </span>
                            {unpaidGroupAmount > 0 ? (
                              <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold block mt-0.5">
                                {t('unpaid_summary')}: {unpaidGroupAmount.toLocaleString(i18n.language === 'tr' ? 'tr-TR' : 'en-US', {
                                  style: 'currency',
                                  currency: i18n.language === 'tr' ? 'TRY' : 'USD'
                                })}
                              </span>
                            ) : (
                              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold block mt-0.5">
                                {t('paid')}
                              </span>
                            )}
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <button
                              onClick={(e) => handleOpenEditGroup(group, e)}
                              className="p-1 rounded bg-slate-200/50 dark:bg-white/5 border border-slate-300 dark:border-white/10 hover:bg-slate-300/50 dark:hover:bg-white/10 text-slate-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-all cursor-pointer"
                            >
                              <Edit3 className="w-3 h-3" />
                            </button>
                            <button
                              onClick={(e) => handleDeleteGroup(group.id, e)}
                              className="p-1 rounded bg-slate-200/50 dark:bg-white/5 border border-slate-300 dark:border-white/10 hover:bg-slate-300/50 dark:hover:bg-white/10 text-slate-500 dark:text-gray-400 hover:text-red-500 transition-all cursor-pointer"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Expanded Transaction Details */}
                      {isExpanded && (
                        <div className="border-t border-slate-200 dark:border-white/5 bg-slate-500/[0.01] dark:bg-white/[0.01] p-4 transition-all">
                          <div className="flex justify-between items-center mb-4">
                            <span className="text-[10px] font-black uppercase text-slate-500 dark:text-gray-400 tracking-wider">
                              {t('total_monthly_expense')}
                            </span>
                            <button
                              onClick={() => handleOpenAddTx(group.id)}
                              className="flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 font-bold text-[10px] text-white transition-all cursor-pointer"
                            >
                              <Plus className="w-3 h-3" />
                              {t('add_transaction')}
                            </button>
                          </div>

                          {group.transactions.length === 0 ? (
                            <p className="text-xs text-slate-500 dark:text-gray-400 text-center py-6">
                              {t('no_transactions')}
                            </p>
                          ) : (
                            <div className="space-y-2">
                              {group.transactions.map(tx => (
                                <div 
                                  key={tx.id}
                                  className="flex items-center justify-between p-3 rounded-xl bg-slate-200/20 dark:bg-white/5 border border-slate-300/30 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10 transition-all"
                                >
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    <button 
                                      onClick={() => handleTogglePaid(tx.id)}
                                      className="text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 transition-all cursor-pointer shrink-0"
                                    >
                                      {tx.is_paid ? (
                                        <CheckCircle className="w-4.5 h-4.5 text-emerald-500" />
                                      ) : (
                                        <Circle className="w-4.5 h-4.5 text-slate-300 dark:text-white/10" />
                                      )}
                                    </button>
                                    
                                    <div className="min-w-0">
                                      <div className="flex items-center gap-1.5 flex-wrap">
                                        <span className={`font-bold text-xs text-slate-800 dark:text-gray-200 truncate leading-snug ${tx.is_paid ? 'line-through opacity-50' : ''}`}>
                                          {tx.description}
                                        </span>
                                        {tx.company_name && (
                                          <span className="px-1.5 py-0.5 rounded text-[8px] font-black bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 shrink-0">
                                            {tx.company_name}
                                          </span>
                                        )}
                                      </div>
                                      <div className="flex items-center gap-1.5 mt-0.5 text-[9px] text-slate-400 dark:text-gray-300 font-semibold">
                                        <span>{tx.date}</span>
                                        {tx.is_installment && (
                                          <>
                                            <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-white/20"></span>
                                            <span className="text-purple-600 dark:text-purple-400">
                                              {t('installment_status', { no: tx.installment_no, total: tx.installment_count })}
                                            </span>
                                          </>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div className="flex items-center gap-3">
                                    <div className="text-right">
                                      <span className={`font-bold text-slate-700 dark:text-gray-200 ${tx.is_paid ? 'line-through opacity-50' : ''}`}>
                                        {tx.monthly_amount.toLocaleString(i18n.language === 'tr' ? 'tr-TR' : 'en-US', {
                                          style: 'currency',
                                          currency: i18n.language === 'tr' ? 'TRY' : 'USD'
                                        })}
                                      </span>
                                      {tx.is_installment && (
                                        <span className="block text-[9px] text-slate-400 dark:text-gray-300 font-semibold">
                                          {t('total_monthly_expense')}: {tx.amount}
                                        </span>
                                      )}
                                    </div>
                                    <button
                                      onClick={(e) => { e.stopPropagation(); handleOpenAddTx(group.id, tx); }}
                                      className="p-1.5 rounded-lg opacity-30 hover:opacity-100 hover:bg-slate-200 dark:hover:bg-white/5 text-slate-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-all cursor-pointer"
                                    >
                                      <Edit3 className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={(e) => handleDeleteTx(tx.id, e)}
                                      className="p-1.5 rounded-lg opacity-30 hover:opacity-100 hover:bg-slate-200 dark:hover:bg-white/5 text-slate-500 dark:text-gray-400 hover:text-red-500 transition-all cursor-pointer"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                });
              })()}
          </div>
        )}

        {/* --- GENERAL MONTHLY HISTORY TABLE / LIST --- */}
        {!error && historyData.length > 0 && (
          <div className="glass-card rounded-3xl p-5 shadow-xl mt-6">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-500 dark:text-gray-400 mb-4 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-purple-500 dark:text-purple-400" />
              {t('history_title')}
            </h3>
            
            <div className="space-y-2.5">
              {/* Header row */}
              <div className="grid grid-cols-3 text-[10px] font-bold text-slate-400 dark:text-gray-300 uppercase tracking-wider px-2">
                <span>{t('month')}</span>
                <span className="text-right">{t('total')}</span>
                <span className="text-right">{t('status')}</span>
              </div>

              <div className="divide-y divide-slate-200 dark:divide-white/5">
                {historyData.map((h, idx) => {
                  const isCurrentMonth = h.year === targetYear && h.month === targetMonth;
                  const monthName = t(`month_${h.month - 1}`);
                  
                  return (
                    <div 
                      key={idx}
                      onClick={() => navigateToMonth(h.year, h.month)}
                      className={`grid grid-cols-3 py-3 px-2 text-xs font-semibold items-center rounded-xl cursor-pointer hover:bg-slate-200/50 dark:hover:bg-white/5 active:scale-99 transition-all ${
                        isCurrentMonth ? 'bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400' : 'text-slate-700 dark:text-gray-300'
                      }`}
                    >
                      <span className="font-bold">{monthName} '{String(h.year).slice(-2)}</span>
                      <span className="text-right font-extrabold">
                        {h.total_amount.toLocaleString(i18n.language === 'tr' ? 'tr-TR' : 'en-US', {
                          style: 'currency',
                          currency: i18n.language === 'tr' ? 'TRY' : 'USD',
                          maximumFractionDigits: 0
                        })}
                      </span>
                      <span className="text-right">
                        {h.total_amount === 0 ? (
                          <span className="text-[10px] text-slate-400 dark:text-gray-300 font-bold">-</span>
                        ) : h.unpaid_amount === 0 ? (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 uppercase">
                            {t('paid')}
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 uppercase">
                            {t('unpaid_summary')}: {Math.round(h.unpaid_amount)}
                          </span>
                        )}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </>
    )}

        {/* --- COMPANIES VIEW TAB --- */}
        {activeTab === 'companies' && (() => {
          const filteredAndSortedCompanies = companyStats
            .filter(c => c.name.toLowerCase().includes(companySearchQuery.toLowerCase()))
            .sort((a, b) => {
              if (companySortBy === 'spent') {
                return b.total_amount - a.total_amount;
              }
              if (companySortBy === 'count') {
                return b.tx_count - a.tx_count;
              }
              return a.name.localeCompare(b.name, i18n.language === 'tr' ? 'tr-TR' : 'en-US');
            });

          return (
            <div className="space-y-6 animate-fade-in">
              {/* Add Company Form */}
              <div className="glass-card rounded-3xl p-5 shadow-xl">
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-800 dark:text-white mb-3">
                  {t('add_company')}
                </h3>
                <form onSubmit={handleAddCompany} className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder={t('company_name')}
                    value={newCompanyName}
                    onChange={e => setNewCompanyName(e.target.value)}
                    required
                    className="flex-1 bg-slate-200/50 dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 dark:text-white focus:outline-none focus:border-purple-500 transition-all font-medium"
                  />
                  <button 
                    type="submit"
                    className="py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 font-bold text-xs text-white shadow-lg shadow-purple-600/25 transition-all cursor-pointer flex items-center gap-1 shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    {t('add_company')}
                  </button>
                </form>
              </div>

              {/* Search & Sort Panel */}
              <div className="glass-card rounded-3xl p-4 shadow-xl space-y-3">
                <input
                  type="text"
                  placeholder={t('search_company')}
                  value={companySearchQuery}
                  onChange={e => setCompanySearchQuery(e.target.value)}
                  className="w-full bg-slate-200/50 dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-xl px-3.5 py-2 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-purple-500 transition-all font-medium"
                />

                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-black uppercase text-slate-400 dark:text-gray-400 tracking-wider">
                    {t('sort_by')}
                  </span>
                  <div className="flex gap-1.5 p-0.5 bg-slate-200/30 dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setCompanySortBy('spent')}
                      className={`px-2.5 py-1 rounded-lg text-[9px] font-black transition-all uppercase cursor-pointer ${
                        companySortBy === 'spent'
                          ? 'bg-purple-600 text-white shadow-sm'
                          : 'text-slate-500 dark:text-gray-400 hover:text-slate-800 dark:hover:text-white'
                      }`}
                    >
                      {t('sort_spent')}
                    </button>
                    <button
                      type="button"
                      onClick={() => setCompanySortBy('count')}
                      className={`px-2.5 py-1 rounded-lg text-[9px] font-black transition-all uppercase cursor-pointer ${
                        companySortBy === 'count'
                          ? 'bg-purple-600 text-white shadow-sm'
                          : 'text-slate-500 dark:text-gray-400 hover:text-slate-800 dark:hover:text-white'
                      }`}
                    >
                      {t('sort_count')}
                    </button>
                    <button
                      type="button"
                      onClick={() => setCompanySortBy('alpha')}
                      className={`px-2.5 py-1 rounded-lg text-[9px] font-black transition-all uppercase cursor-pointer ${
                        companySortBy === 'alpha'
                          ? 'bg-purple-600 text-white shadow-sm'
                          : 'text-slate-500 dark:text-gray-400 hover:text-slate-800 dark:hover:text-white'
                      }`}
                    >
                      {t('sort_alpha')}
                    </button>
                  </div>
                </div>
              </div>

              {/* Companies List */}
              <div className="space-y-3.5 mb-10">
                {filteredAndSortedCompanies.length === 0 ? (
                  <div className="glass-card rounded-3xl p-8 text-center text-slate-500 dark:text-gray-400">
                    <Info className="w-8 h-8 text-slate-400 dark:text-gray-300 mx-auto mb-3" />
                    <p className="text-sm font-medium leading-relaxed">{t('no_companies')}</p>
                  </div>
                ) : (
                  filteredAndSortedCompanies.map(c => (
                    <div 
                      key={c.id}
                      onClick={() => {
                        setSelectedCompany(c);
                        fetchCompanyTransactions(c.id);
                        setShowCompanyDetailModal(true);
                      }}
                      className="glass-card rounded-2xl border border-slate-300/30 dark:border-white/5 p-4 flex items-center justify-between cursor-pointer hover:border-purple-500/30 hover:bg-purple-500/[0.01] active:scale-99 transition-all select-none"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-slate-200/50 dark:bg-white/5 border border-slate-300 dark:border-white/10 shrink-0">
                          <Coins className="w-5 h-5 text-slate-400 dark:text-gray-300" />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-slate-800 dark:text-white tracking-wide">{c.name}</h4>
                          <span className="text-[10px] font-bold text-slate-400 dark:text-gray-400 mt-1 block">
                            {c.tx_count} {t('tx_count')}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="font-extrabold text-sm block text-slate-800 dark:text-gray-100">
                            {c.total_amount.toLocaleString(i18n.language === 'tr' ? 'tr-TR' : 'en-US', {
                              style: 'currency',
                              currency: i18n.language === 'tr' ? 'TRY' : 'USD'
                            })}
                          </span>
                          <span className="text-[10px] text-slate-400 dark:text-gray-500 block mt-0.5">
                            {t('total_spent')}
                          </span>
                        </div>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteCompany(c.id, e);
                          }}
                          className="p-2 rounded-lg bg-slate-200/50 dark:bg-white/5 border border-slate-300 dark:border-white/10 hover:bg-slate-300/50 dark:hover:bg-white/10 text-slate-500 dark:text-gray-400 hover:text-red-500 transition-all cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })()}

      </div>

      {/* --- COMPANY DETAIL MODAL --- */}
      {showCompanyDetailModal && selectedCompany && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md transition-all">
          <div className="glass-card w-full max-w-md rounded-3xl p-6 shadow-2xl relative border border-slate-300 dark:border-white/10 max-h-[85vh] flex flex-col bg-[var(--bg-modal)] animate-fade-in">
            <button 
              onClick={() => { setShowCompanyDetailModal(false); setSelectedCompany(null); setSelectedCompanyTransactions([]); }}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-white/10 text-slate-400 hover:text-slate-800 dark:hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-black text-slate-800 dark:text-white mb-4 flex items-center gap-2 pr-6">
              <Coins className="w-5 h-5 text-purple-500 dark:text-purple-400 shrink-0" />
              <span className="truncate">{selectedCompany.name} {t('company_details')}</span>
            </h3>

            <div className="grid grid-cols-2 gap-3 mb-5">
              <div className="p-3.5 rounded-2xl bg-purple-500/5 border border-purple-500/10 text-center">
                <span className="text-[10px] font-bold text-slate-400 dark:text-gray-400 uppercase tracking-wider block">
                  {t('total_spent')}
                </span>
                <span className="block text-base font-extrabold text-purple-600 dark:text-purple-400 mt-1">
                  {selectedCompany.total_amount.toLocaleString(i18n.language === 'tr' ? 'tr-TR' : 'en-US', {
                    style: 'currency',
                    currency: i18n.language === 'tr' ? 'TRY' : 'USD'
                  })}
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-cyan-500/5 border border-cyan-500/10 text-center">
                <span className="text-[10px] font-bold text-slate-400 dark:text-gray-400 uppercase tracking-wider block">
                  {t('tx_count')}
                </span>
                <span className="block text-base font-extrabold text-cyan-600 dark:text-cyan-400 mt-1">
                  {selectedCompany.tx_count}
                </span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-1 scrollbar-thin space-y-2.5">
              <h4 className="text-[10px] font-black uppercase text-slate-400 dark:text-gray-400 tracking-wider mb-2">
                {t('company_transactions')}
              </h4>

              {selectedCompanyTransactions.length === 0 ? (
                <p className="text-xs text-slate-500 dark:text-gray-400 py-6 text-center italic">
                  {t('no_transactions')}
                </p>
              ) : (
                <div className="space-y-2">
                  {selectedCompanyTransactions.map(tx => (
                    <div 
                      key={tx.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-200/20 dark:bg-white/5 border border-slate-300/30 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10 transition-all"
                    >
                      <div className="min-w-0 flex-1 mr-3">
                        <span className="font-bold text-xs block text-slate-800 dark:text-gray-200 truncate leading-snug">
                          {tx.description}
                        </span>
                        <div className="flex items-center gap-1.5 mt-1 text-[9px] text-slate-400 dark:text-gray-450 font-semibold flex-wrap">
                          <span>{tx.date}</span>
                          <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-white/20"></span>
                          <span className="text-purple-600 dark:text-purple-400">{tx.group_name}</span>
                          {tx.is_installment === 1 && (
                            <>
                              <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-white/20"></span>
                              <span>Taksitli ({tx.installment_count})</span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <div className="text-right font-extrabold text-xs text-slate-700 dark:text-gray-200">
                          {tx.amount.toLocaleString(i18n.language === 'tr' ? 'tr-TR' : 'en-US', {
                            style: 'currency',
                            currency: i18n.language === 'tr' ? 'TRY' : 'USD'
                          })}
                        </div>
                        <button
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            handleOpenAddTx(tx.group_id, tx); 
                          }}
                          className="p-1.5 rounded-lg opacity-30 hover:opacity-100 hover:bg-slate-200 dark:hover:bg-white/5 text-slate-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-all cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            await handleDeleteTx(tx.id, e);
                            fetchCompanyTransactions(selectedCompany.id);
                          }}
                          className="p-1.5 rounded-lg opacity-30 hover:opacity-100 hover:bg-slate-200 dark:hover:bg-white/5 text-slate-500 dark:text-gray-400 hover:text-red-500 transition-all cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- SETTINGS MODAL --- */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md transition-all">
          <div className="glass-card w-full max-w-sm rounded-3xl p-6 shadow-2xl relative border border-slate-300 dark:border-white/10 bg-[var(--bg-modal)] animate-fade-in">
            <button 
              onClick={() => setShowSettingsModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-white/10 text-slate-400 hover:text-slate-800 dark:hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-black text-slate-800 dark:text-white mb-5 flex items-center gap-2 pr-6">
              <Settings className="w-5 h-5 text-purple-500 dark:text-purple-400 shrink-0" />
              <span>{t('settings')}</span>
            </h3>

            <div className="space-y-6">
              {/* Export Backup Section */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 dark:text-gray-400 tracking-wider block">
                  {t('export_data')}
                </label>
                <button
                  type="button"
                  onClick={handleExportBackup}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-purple-600 hover:bg-purple-500 active:scale-98 transition-all font-bold text-xs text-white shadow-lg shadow-purple-600/20 cursor-pointer"
                >
                  {t('export_data')}
                </button>
              </div>

              {/* Import Backup Section */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 dark:text-gray-400 tracking-wider block">
                  {t('import_data')}
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportBackup}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-slate-200/50 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-slate-700 dark:text-gray-300 hover:bg-slate-300/50 dark:hover:bg-white/10 transition-all font-bold text-xs">
                    {t('import_data')}
                  </div>
                </div>
              </div>

              {/* App Mode Switcher */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 dark:text-gray-400 tracking-wider block">
                  {t('app_mode')}
                </label>
                <div className="flex gap-2 p-1 bg-slate-200/50 dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-2xl">
                  <button
                    type="button"
                    onClick={() => {
                      localStorage.setItem('myfinans_app_mode', 'offline');
                      setAppMode('offline');
                      window.location.reload();
                    }}
                    className={`flex-1 py-2 rounded-xl font-bold text-[10px] transition-all cursor-pointer uppercase ${
                      appMode === 'offline'
                        ? 'bg-purple-600 text-white shadow-md'
                        : 'text-slate-500 dark:text-gray-400 hover:text-slate-800 dark:hover:text-white'
                    }`}
                  >
                    {t('offline_mode')}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      localStorage.setItem('myfinans_app_mode', 'online');
                      setAppMode('online');
                      window.location.reload();
                    }}
                    className={`flex-1 py-2 rounded-xl font-bold text-[10px] transition-all cursor-pointer uppercase ${
                      appMode === 'online'
                        ? 'bg-purple-600 text-white shadow-md'
                        : 'text-slate-500 dark:text-gray-400 hover:text-slate-800 dark:hover:text-white'
                    }`}
                  >
                    {t('online_mode')}
                  </button>
                </div>
              </div>

              {/* API URL Config Section */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 dark:text-gray-400 tracking-wider block">
                  {t('api_url')}
                </label>
                <form onSubmit={handleSaveApiUrl} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="http://192.168.1.100:8080"
                    value={settingsApiUrl}
                    onChange={e => setSettingsApiUrl(e.target.value)}
                    className="flex-1 bg-slate-200/50 dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-purple-500 transition-all font-medium"
                  />
                  <button
                    type="submit"
                    className="py-2 px-3.5 rounded-xl bg-purple-600 hover:bg-purple-500 font-bold text-xs text-white shadow-md transition-all cursor-pointer shrink-0"
                  >
                    {t('save')}
                  </button>
                </form>
              </div>

              {/* About App Section */}
              <div className="pt-4 border-t border-slate-300/30 dark:border-white/5 space-y-1.5 text-center">
                <h4 className="text-xs font-extrabold text-slate-800 dark:text-white">
                  {t('app_about')}
                </h4>
                <p className="text-[10px] text-slate-400 dark:text-gray-400 leading-relaxed font-semibold">
                  {t('app_desc')}
                </p>
                <a 
                  href="https://github.com/myfinans/myfinans-app" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="inline-block text-[10px] text-purple-500 hover:underline font-bold mt-1"
                >
                  github.com/myfinans/myfinans-app
                </a>
                <div className="mt-2">
                  <span className="inline-block text-[9px] font-extrabold text-purple-600 dark:text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded-full">
                    v9.5 - Offline Local Mode
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- ADD / EDIT GROUP MODAL --- */}
      {showGroupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md transition-all">
          <div className="glass-card rounded-3xl w-full max-w-sm p-6 shadow-2xl relative bg-[var(--bg-modal)]">
            <button 
              onClick={() => setShowGroupModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-white/10 text-slate-400 hover:text-slate-800 dark:hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-black text-slate-800 dark:text-white mb-5 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-500 dark:text-purple-400" />
              {editingGroup ? t('group_name') : t('add_group')}
            </h3>

            <form onSubmit={handleSaveGroup} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                  {t('group_name')}
                </label>
                <input 
                  type="text" 
                  value={groupName}
                  onChange={e => setGroupName(e.target.value)}
                  placeholder="örn. Axess Kredi Kartı"
                  required
                  className="w-full bg-slate-200/50 dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 dark:text-white focus:outline-none focus:border-purple-500 transition-all font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                  {t('group_type')}
                </label>
                <select 
                  value={groupType}
                  onChange={e => setGroupType(e.target.value as GroupType)}
                  className="w-full bg-slate-200/50 dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 dark:text-white focus:outline-none focus:border-purple-500 transition-all font-medium [&>option]:bg-white dark:[&>option]:bg-[#121217] [&>option]:text-slate-800 dark:[&>option]:text-white"
                >
                  <option value="credit_card">{t('credit_card')}</option>
                  <option value="loan">{t('loan')}</option>
                  <option value="debt">{t('debt')}</option>
                  <option value="other">{t('other')}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                  {t('select_bank')}
                </label>
                <select
                  value={groupBankId}
                  onChange={e => setGroupBankId(e.target.value)}
                  className="w-full bg-slate-200/50 dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 dark:text-white focus:outline-none focus:border-purple-500 transition-all font-medium [&>option]:bg-white dark:[&>option]:bg-[#121217] [&>option]:text-slate-800 dark:[&>option]:text-white"
                >
                  <option value="">{t('independent_groups')}</option>
                  {banks.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              {groupType === 'credit_card' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                    {t('statement_day')} (1 - 31)
                  </label>
                  <input 
                    type="number" 
                    min="1" 
                    max="31"
                    value={groupStatementDay}
                    onChange={e => setGroupStatementDay(parseInt(e.target.value, 10))}
                    required
                    className="w-full bg-slate-200/50 dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 dark:text-white focus:outline-none focus:border-purple-500 transition-all font-medium"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                  {t('due_day')} (1 - 31)
                </label>
                <input 
                  type="number" 
                  min="1" 
                  max="31"
                  value={groupDueDay}
                  onChange={e => setGroupDueDay(parseInt(e.target.value, 10))}
                  required
                  className="w-full bg-slate-200/50 dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 dark:text-white focus:outline-none focus:border-purple-500 transition-all font-medium"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  type="button"
                  onClick={() => setShowGroupModal(false)}
                  className="flex-1 py-3 rounded-xl bg-slate-200/50 dark:bg-white/5 border border-slate-300 dark:border-white/10 hover:bg-slate-300/50 dark:hover:bg-white/10 font-bold text-xs text-slate-600 dark:text-gray-300 transition-all cursor-pointer"
                >
                  {t('cancel')}
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-purple-600 hover:bg-purple-50 font-bold text-xs text-white shadow-lg shadow-purple-600/25 transition-all cursor-pointer"
                >
                  {t('save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- ADD TRANSACTION MODAL --- */}
      {showTxModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md transition-all">
          <div className="glass-card rounded-3xl w-full max-w-sm p-6 shadow-2xl relative bg-[var(--bg-modal)]">
            <button 
              onClick={() => setShowTxModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-white/10 text-slate-400 hover:text-slate-800 dark:hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-black text-slate-800 dark:text-white mb-5 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-500 dark:text-purple-400" />
              {editingTx ? t('edit_transaction') : t('add_transaction')}
            </h3>

            <form onSubmit={handleSaveTx} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                  {t('select_group')}
                </label>
                <select 
                  value={txGroupId}
                  onChange={e => setTxGroupId(e.target.value)}
                  className="w-full bg-slate-200/50 dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 dark:text-white focus:outline-none focus:border-purple-500 transition-all font-medium [&>option]:bg-white dark:[&>option]:bg-[#121217] [&>option]:text-slate-800 dark:[&>option]:text-white"
                >
                  {summaryData?.groups.map(g => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                  {t('description')}
                </label>
                <input 
                  type="text" 
                  value={txDescription}
                  onChange={e => setTxDescription(e.target.value)}
                  placeholder="örn. Market, İnternet Faturası"
                  required
                  className="w-full bg-slate-200/50 dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 dark:text-white focus:outline-none focus:border-purple-500 transition-all font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                    {t('amount')}
                  </label>
                  <input 
                    type="number" 
                    step="0.01"
                    min="0.01"
                    value={txAmount}
                    onChange={e => setTxAmount(e.target.value)}
                    placeholder="0.00"
                    required
                    className="w-full bg-slate-200/50 dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 dark:text-white focus:outline-none focus:border-purple-500 transition-all font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                    {t('date')}
                  </label>
                  <input 
                    type="date" 
                    value={txDate}
                    onChange={e => setTxDate(e.target.value)}
                    required
                    className="w-full bg-slate-200/50 dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 dark:text-white focus:outline-none focus:border-purple-500 transition-all font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                  {t('select_company')}
                </label>
                <select
                  value={txCompanyId}
                  onChange={e => setTxCompanyId(e.target.value)}
                  className="w-full bg-slate-200/50 dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 dark:text-white focus:outline-none focus:border-purple-500 transition-all font-medium appearance-none cursor-pointer"
                >
                  <option value="" className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white">
                    {t('general_company')}
                  </option>
                  {companies.map(c => (
                    <option key={c.id} value={c.id} className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white">
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Installment Toggle */}
              <div className="pt-2">
                <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-slate-700 dark:text-gray-200">{t('is_installment')}</span>
                    <p className="text-[10px] text-slate-400 dark:text-gray-400">Gideri aylara bölerek kaydet</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      checked={txIsInstallment}
                      onChange={e => setTxIsInstallment(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-300 dark:bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </div>
              </div>

              {/* Installment Count & Amount Entry Type Inputs (Conditional) */}
              {txIsInstallment && (
                <div className="space-y-4 animate-fade-in">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                      {t('amount_entry_type')}
                    </label>
                    <div className="flex gap-2 p-1 bg-slate-200/50 dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-xl">
                      <button
                        type="button"
                        onClick={() => setTxAmountType('total')}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          txAmountType === 'total'
                            ? 'bg-purple-600 text-white shadow'
                            : 'text-slate-600 dark:text-gray-300 hover:bg-slate-300/30 dark:hover:bg-white/5'
                        }`}
                      >
                        {t('total_amount_label')}
                      </button>
                      <button
                        type="button"
                        onClick={() => setTxAmountType('monthly')}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          txAmountType === 'monthly'
                            ? 'bg-purple-600 text-white shadow'
                            : 'text-slate-600 dark:text-gray-300 hover:bg-slate-300/30 dark:hover:bg-white/5'
                        }`}
                      >
                        {t('monthly_installment_label')}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                      {t('installment_count')}
                    </label>
                    <input 
                      type="number" 
                      min="2" 
                      max="120"
                      value={txInstallmentCount}
                      onChange={e => setTxInstallmentCount(parseInt(e.target.value, 10))}
                      required
                      className="w-full bg-slate-200/50 dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 dark:text-white focus:outline-none focus:border-purple-500 transition-all font-medium"
                    />
                  </div>

                  {(() => {
                    const amt = parseFloat(txAmount);
                    if (isNaN(amt) || amt <= 0) return null;
                    const count = txInstallmentCount || 2;
                    
                    const monthlyVal = txAmountType === 'monthly' ? amt : amt / count;
                    const totalVal = txAmountType === 'monthly' ? amt * count : amt;

                    const formattedMonthly = monthlyVal.toLocaleString(i18n.language === 'tr' ? 'tr-TR' : 'en-US', {
                      style: 'currency',
                      currency: i18n.language === 'tr' ? 'TRY' : 'USD'
                    });
                    const formattedTotal = totalVal.toLocaleString(i18n.language === 'tr' ? 'tr-TR' : 'en-US', {
                      style: 'currency',
                      currency: i18n.language === 'tr' ? 'TRY' : 'USD'
                    });

                    return (
                      <div className="p-3.5 rounded-2xl bg-purple-500/5 border border-purple-500/10 text-xs font-semibold text-purple-600 dark:text-purple-400 mt-2">
                        {t('installment_summary_helper', { monthly: formattedMonthly, total: formattedTotal })}
                      </div>
                    );
                  })()}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button 
                  type="button"
                  onClick={() => setShowTxModal(false)}
                  className="flex-1 py-3 rounded-xl bg-slate-200/50 dark:bg-white/5 border border-slate-300 dark:border-white/10 hover:bg-slate-300/50 dark:hover:bg-white/10 font-bold text-xs text-slate-600 dark:text-gray-300 transition-all cursor-pointer"
                >
                  {t('cancel')}
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-purple-600 hover:bg-purple-50 font-bold text-xs text-white shadow-lg shadow-purple-600/25 transition-all cursor-pointer"
                >
                  {t('save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- BANK MANAGER MODAL --- */}
      {showBankManager && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card w-full max-w-md rounded-3xl p-6 shadow-2xl relative border border-slate-300 dark:border-white/10 max-h-[90vh] flex flex-col bg-[var(--bg-modal)]">
            <button 
              onClick={() => setShowBankManager(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-white/10 text-slate-400 hover:text-slate-800 dark:hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-black text-slate-800 dark:text-white mb-4 flex items-center gap-2">
              <Landmark className="w-4 h-4 text-purple-500 dark:text-purple-400" />
              {t('manage_banks')}
            </h3>

            {/* Add Bank Form */}
            <form onSubmit={handleAddBank} className="flex gap-2 mb-6">
              <input 
                type="text" 
                placeholder={t('bank_name')}
                value={newBankName}
                onChange={e => setNewBankName(e.target.value)}
                required
                className="flex-1 bg-slate-200/50 dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 dark:text-white focus:outline-none focus:border-purple-500 transition-all font-medium"
              />
              <button 
                type="submit"
                className="py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 font-bold text-xs text-white shadow-lg shadow-purple-600/25 transition-all cursor-pointer flex items-center gap-1 shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                {t('add_bank')}
              </button>
            </form>

            {/* Bank List (Scrollable) */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {banks.length === 0 ? (
                <p className="text-xs text-slate-500 dark:text-gray-400 text-center py-4">{t('no_banks')}</p>
              ) : (
                banks.map(bank => (
                  <div 
                    key={bank.id} 
                    className="flex justify-between items-center p-3 rounded-xl bg-slate-200/30 dark:bg-white/5 border border-slate-300/50 dark:border-white/5"
                  >
                    <span className="text-sm font-bold text-slate-800 dark:text-gray-200">{bank.name}</span>
                    <button 
                      onClick={() => handleDeleteBank(bank.id)}
                      className="p-1.5 rounded-lg opacity-60 hover:opacity-100 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-400 hover:text-red-500 transition-all cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-white/5 mt-4">
              <button 
                onClick={() => setShowBankManager(false)}
                className="w-full py-3 rounded-xl bg-slate-200/50 dark:bg-white/5 border border-slate-300 dark:border-white/10 hover:bg-slate-300/50 dark:hover:bg-white/10 font-bold text-xs text-slate-600 dark:text-gray-300 transition-all cursor-pointer text-center"
              >
                {t('cancel')}
              </button>
            </div>
          </div>
        </div>
      )}
      
    </div>
  );
}
