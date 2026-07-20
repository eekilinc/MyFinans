import type { Bank, Company, CompanyStats, ExpenseGroup, Transaction, MonthlySummary, HistoryItem } from '../types';

// Helper to generate UUIDs client-side
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// LocalStorage Keys
const KEYS = {
  BANKS: 'myfinans_banks',
  COMPANIES: 'myfinans_companies',
  GROUPS: 'myfinans_expense_groups',
  TRANSACTIONS: 'myfinans_transactions',
  PAYMENTS: 'myfinans_transaction_payments'
};

// Local storage raw interfaces
interface EGRaw {
  id: string;
  name: string;
  type: string;
  due_day: number;
  statement_day?: number | null;
  bank_id?: string | null;
  created_at: string;
}

interface TXRaw {
  id: string;
  group_id: string;
  description: string;
  amount: number;
  date: string;
  is_installment: number; // 0 or 1
  installment_count: number;
  created_at: string;
  company_id?: string | null;
  category?: string | null;
  is_recurring?: number; // 0 or 1
  recurring_day?: number | null;
}

interface PaymentRaw {
  id: string;
  transaction_id: string;
  year: number;
  month: number;
  is_paid: number; // 0 or 1
  created_at: string;
}

// Read/Write raw tables helper
function readTable<T>(key: string, defaultValue: T[] = []): T[] {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch (e) {
    console.error(`Error reading storage key ${key}`, e);
    return defaultValue;
  }
}

function writeTable<T>(key: string, data: T[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Error writing storage key ${key}`, e);
  }
}

// Calculate billing period
function getBillingPeriod(dateStr: string, group: EGRaw) {
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = date.getMonth() + 1; // 1-12
  const day = date.getDate();

  if (group.type === 'credit_card' && group.statement_day) {
    const cutoff = group.statement_day;
    if (day > cutoff) {
      let billingMonth = month + 1;
      let billingYear = year;
      if (billingMonth > 12) {
        billingMonth = 1;
        billingYear += 1;
      }
      return { year: billingYear, month: billingMonth };
    }
  }
  return { year, month };
}

// DB Service Export
export const localDatabase = {
  // BANKS
  async getBanks(): Promise<Bank[]> {
    return readTable<Bank>(KEYS.BANKS);
  },

  async addBank(name: string): Promise<Bank> {
    const list = readTable<Bank>(KEYS.BANKS);
    const newBank: Bank = {
      id: generateUUID(),
      name,
      created_at: new Date().toISOString()
    };
    list.unshift(newBank);
    writeTable(KEYS.BANKS, list);
    return newBank;
  },

  async deleteBank(id: string): Promise<void> {
    let list = readTable<Bank>(KEYS.BANKS);
    list = list.filter(b => b.id !== id);
    writeTable(KEYS.BANKS, list);

    // Also set bank_id = null in expense groups referencing this bank
    let groups = readTable<EGRaw>(KEYS.GROUPS);
    groups = groups.map(g => g.bank_id === id ? { ...g, bank_id: null } : g);
    writeTable(KEYS.GROUPS, groups);
  },

  async updateBank(id: string, name: string): Promise<Bank> {
    const list = readTable<Bank>(KEYS.BANKS);
    const index = list.findIndex(b => b.id === id);
    if (index === -1) throw new Error('Bank not found');
    list[index].name = name;
    writeTable(KEYS.BANKS, list);
    return list[index];
  },

  // COMPANIES
  async getCompanies(): Promise<Company[]> {
    return readTable<Company>(KEYS.COMPANIES);
  },

  async addCompany(name: string): Promise<Company> {
    const list = readTable<Company>(KEYS.COMPANIES);
    const newCompany: Company = {
      id: generateUUID(),
      name,
      created_at: new Date().toISOString()
    };
    list.unshift(newCompany);
    writeTable(KEYS.COMPANIES, list);
    return newCompany;
  },

  async deleteCompany(id: string): Promise<void> {
    let list = readTable<Company>(KEYS.COMPANIES);
    list = list.filter(c => c.id !== id);
    writeTable(KEYS.COMPANIES, list);

    // Set company_id = null in transactions referencing this company
    let txs = readTable<TXRaw>(KEYS.TRANSACTIONS);
    txs = txs.map(t => t.company_id === id ? { ...t, company_id: null } : t);
    writeTable(KEYS.TRANSACTIONS, txs);
  },

  async updateCompany(id: string, name: string): Promise<Company> {
    const list = readTable<Company>(KEYS.COMPANIES);
    const index = list.findIndex(c => c.id === id);
    if (index === -1) throw new Error('Company not found');
    list[index].name = name;
    writeTable(KEYS.COMPANIES, list);
    return list[index];
  },

  async getCompanyStats(): Promise<CompanyStats[]> {
    const companies = readTable<Company>(KEYS.COMPANIES);
    const txs = readTable<TXRaw>(KEYS.TRANSACTIONS);
    
    return companies.map(c => {
      const companyTxs = txs.filter(t => t.company_id === c.id);
      const totalAmount = companyTxs.reduce((sum, t) => sum + t.amount, 0);
      return {
        id: c.id,
        name: c.name,
        created_at: c.created_at,
        tx_count: companyTxs.length,
        total_amount: Math.round(totalAmount * 100) / 100
      };
    }).sort((a, b) => b.total_amount - a.total_amount || a.name.localeCompare(b.name));
  },

  async getCompanyTransactions(companyId: string): Promise<any[]> {
    const txs = readTable<TXRaw>(KEYS.TRANSACTIONS);
    const groups = readTable<EGRaw>(KEYS.GROUPS);
    const groupsMap = new Map(groups.map(g => [g.id, g.name]));

    return txs
      .filter(t => t.company_id === companyId)
      .map(t => ({
        ...t,
        is_installment: t.is_installment === 1,
        group_name: groupsMap.get(t.group_id) || 'Genel'
      }))
      .sort((a, b) => b.date.localeCompare(a.date));
  },

  // GROUPS
  async saveGroup(group: { id?: string; name: string; type: string; due_day: number; statement_day?: number | null; bank_id?: string | null }): Promise<any> {
    const list = readTable<EGRaw>(KEYS.GROUPS);
    const banks = readTable<Bank>(KEYS.BANKS);
    const bankMap = new Map(banks.map(b => [b.id, b.name]));

    let targetGroup: EGRaw;
    if (group.id) {
      // Update
      const index = list.findIndex(g => g.id === group.id);
      if (index === -1) throw new Error('Group not found');
      targetGroup = {
        ...list[index],
        name: group.name,
        type: group.type,
        due_day: group.due_day,
        statement_day: group.type === 'credit_card' ? group.statement_day : null,
        bank_id: group.bank_id || null
      };
      list[index] = targetGroup;
    } else {
      // Create
      targetGroup = {
        id: generateUUID(),
        name: group.name,
        type: group.type,
        due_day: group.due_day,
        statement_day: group.type === 'credit_card' ? group.statement_day : null,
        bank_id: group.bank_id || null,
        created_at: new Date().toISOString()
      };
      list.unshift(targetGroup);
    }

    writeTable(KEYS.GROUPS, list);
    return {
      ...targetGroup,
      bank_name: targetGroup.bank_id ? bankMap.get(targetGroup.bank_id) : undefined
    };
  },

  async deleteGroup(id: string): Promise<void> {
    let list = readTable<EGRaw>(KEYS.GROUPS);
    list = list.filter(g => g.id !== id);
    writeTable(KEYS.GROUPS, list);

    // Delete transactions under this group
    let txs = readTable<TXRaw>(KEYS.TRANSACTIONS);
    const deletedTxs = txs.filter(t => t.group_id === id);
    txs = txs.filter(t => t.group_id !== id);
    writeTable(KEYS.TRANSACTIONS, txs);

    // Delete payments linked to deleted transactions
    if (deletedTxs.length > 0) {
      const deletedIds = new Set(deletedTxs.map(t => t.id));
      let payments = readTable<PaymentRaw>(KEYS.PAYMENTS);
      payments = payments.filter(p => !deletedIds.has(p.transaction_id));
      writeTable(KEYS.PAYMENTS, payments);
    }
  },

  // TRANSACTIONS
  async saveTransaction(tx: { 
    id?: string; 
    group_id: string; 
    description: string; 
    amount: number; 
    date: string; 
    is_installment: boolean; 
    installment_count: number; 
    company_id?: string | null;
    category?: string | null;
    is_recurring?: boolean;
    recurring_day?: number | null;
  }): Promise<any> {
    const list = readTable<TXRaw>(KEYS.TRANSACTIONS);
    const companies = readTable<Company>(KEYS.COMPANIES);
    const compMap = new Map(companies.map(c => [c.id, c.name]));

    let targetTx: TXRaw;
    if (tx.id) {
      const index = list.findIndex(t => t.id === tx.id);
      if (index === -1) throw new Error('Transaction not found');
      targetTx = {
        ...list[index],
        group_id: tx.group_id,
        description: tx.description,
        amount: tx.amount,
        date: tx.date,
        is_installment: tx.is_installment ? 1 : 0,
        installment_count: tx.is_installment ? tx.installment_count : 1,
        company_id: tx.company_id || null,
        category: tx.category || null,
        is_recurring: tx.is_recurring ? 1 : 0,
        recurring_day: tx.recurring_day || null
      };
      list[index] = targetTx;
    } else {
      targetTx = {
        id: generateUUID(),
        group_id: tx.group_id,
        description: tx.description,
        amount: tx.amount,
        date: tx.date,
        is_installment: tx.is_installment ? 1 : 0,
        installment_count: tx.is_installment ? tx.installment_count : 1,
        created_at: new Date().toISOString(),
        company_id: tx.company_id || null,
        category: tx.category || null,
        is_recurring: tx.is_recurring ? 1 : 0,
        recurring_day: tx.recurring_day || null
      };
      list.unshift(targetTx);
    }

    writeTable(KEYS.TRANSACTIONS, list);
    return {
      ...targetTx,
      company_name: targetTx.company_id ? compMap.get(targetTx.company_id) : undefined
    };
  },


  async deleteTransaction(id: string): Promise<void> {
    let list = readTable<TXRaw>(KEYS.TRANSACTIONS);
    list = list.filter(t => t.id !== id);
    writeTable(KEYS.TRANSACTIONS, list);

    // Delete linked payments
    let payments = readTable<PaymentRaw>(KEYS.PAYMENTS);
    payments = payments.filter(p => p.transaction_id !== id);
    writeTable(KEYS.PAYMENTS, payments);
  },

  async toggleTransactionPaid(id: string, year: number, month: number): Promise<{ is_paid: boolean }> {
    let list = readTable<PaymentRaw>(KEYS.PAYMENTS);
    const existingIndex = list.findIndex(p => p.transaction_id === id && p.year === year && p.month === month);

    if (existingIndex !== -1) {
      list.splice(existingIndex, 1);
      writeTable(KEYS.PAYMENTS, list);
      return { is_paid: false };
    } else {
      list.push({
        id: generateUUID(),
        transaction_id: id,
        year,
        month,
        is_paid: 1,
        created_at: new Date().toISOString()
      });
      writeTable(KEYS.PAYMENTS, list);
      return { is_paid: true };
    }
  },

  // MONTHLY SUMMARY
  async getMonthlySummary(targetYear: number, targetMonth: number): Promise<MonthlySummary> {
    const groups = readTable<EGRaw>(KEYS.GROUPS);
    const banks = readTable<Bank>(KEYS.BANKS);
    const bankMap = new Map(banks.map(b => [b.id, b.name]));

    const allTransactions = readTable<TXRaw>(KEYS.TRANSACTIONS);
    const companies = readTable<Company>(KEYS.COMPANIES);
    const compMap = new Map(companies.map(c => [c.id, c.name]));

    const payments = readTable<PaymentRaw>(KEYS.PAYMENTS);
    const paidTxIds = new Set(
      payments
        .filter(p => p.year === targetYear && p.month === targetMonth && p.is_paid === 1)
        .map(p => p.transaction_id)
    );

    let totalMonthAmount = 0;
    let totalMonthPaid = 0;
    const groupsSummary: ExpenseGroup[] = [];

    // Map raw groups to full ExpenseGroup structures
    for (const group of groups) {
      const groupTransactions = allTransactions.filter(t => t.group_id === group.id);
      const activeTransactions: Transaction[] = [];
      let groupTotal = 0;
      let groupPaid = 0;

      for (const t of groupTransactions) {
        const isPaid = paidTxIds.has(t.id);
        const billingPeriod = getBillingPeriod(t.date, group);

        if (t.is_installment === 0) {
          if (billingPeriod.year === targetYear && billingPeriod.month === targetMonth) {
            groupTotal += t.amount;
            if (isPaid) groupPaid += t.amount;

            activeTransactions.push({
              id: t.id,
              group_id: t.group_id,
              description: t.description,
              amount: t.amount,
              date: t.date,
              is_installment: false,
              installment_count: 1,
              installment_no: 1,
              monthly_amount: t.amount,
              is_paid: isPaid,
              company_id: t.company_id || undefined,
              company_name: t.company_id ? compMap.get(t.company_id) : undefined,
              category: t.category || undefined,
              is_recurring: t.is_recurring === 1,
              recurring_day: t.recurring_day || undefined
            });
          }
        } else {
          const diff = (targetYear - billingPeriod.year) * 12 + (targetMonth - billingPeriod.month);
          if (diff >= 0 && diff < t.installment_count) {
            const monthlyAmount = Math.round((t.amount / t.installment_count) * 100) / 100;
            groupTotal += monthlyAmount;
            if (isPaid) groupPaid += monthlyAmount;

            activeTransactions.push({
              id: t.id,
              group_id: t.group_id,
              description: t.description,
              amount: t.amount,
              date: t.date,
              is_installment: true,
              installment_count: t.installment_count,
              installment_no: diff + 1,
              monthly_amount: monthlyAmount,
              is_paid: isPaid,
              company_id: t.company_id || undefined,
              company_name: t.company_id ? compMap.get(t.company_id) : undefined,
              category: t.category || undefined,
              is_recurring: t.is_recurring === 1,
              recurring_day: t.recurring_day || undefined
            });
          }
        }
      }

      totalMonthAmount += groupTotal;
      totalMonthPaid += groupPaid;

      groupsSummary.push({
        id: group.id,
        name: group.name,
        type: group.type as any,
        due_day: group.due_day,
        statement_day: group.statement_day || undefined,
        bank_id: group.bank_id || undefined,
        bank_name: group.bank_id ? bankMap.get(group.bank_id) : undefined,
        created_at: group.created_at,
        total_amount: Math.round(groupTotal * 100) / 100,
        paid_amount: Math.round(groupPaid * 100) / 100,
        transactions: activeTransactions
      });
    }

    return {
      selected_year: targetYear,
      selected_month: targetMonth,
      total_amount: Math.round(totalMonthAmount * 100) / 100,
      paid_amount: Math.round(totalMonthPaid * 100) / 100,
      unpaid_amount: Math.round((totalMonthAmount - totalMonthPaid) * 100) / 100,
      groups: groupsSummary
    };
  },

  // ROLLING HISTORY
  async getHistory(): Promise<HistoryItem[]> {
    const now = new Date();
    const groups = readTable<EGRaw>(KEYS.GROUPS);
    const groupsMap = new Map(groups.map(g => [g.id, g]));
    const allTransactions = readTable<TXRaw>(KEYS.TRANSACTIONS);
    const allPayments = readTable<PaymentRaw>(KEYS.PAYMENTS);

    const monthsList: { year: number; month: number }[] = [];
    for (let i = 9; i >= -2; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      monthsList.push({
        year: d.getFullYear(),
        month: d.getMonth() + 1
      });
    }

    const history: HistoryItem[] = [];

    for (const m of monthsList) {
      const targetYear = m.year;
      const targetMonth = m.month;

      const monthlyPayments = allPayments.filter(p => p.year === targetYear && p.month === targetMonth && p.is_paid === 1);
      const paidTxIds = new Set(monthlyPayments.map(p => p.transaction_id));

      let monthTotal = 0;
      let monthPaid = 0;

      for (const t of allTransactions) {
        const group = groupsMap.get(t.group_id);
        if (!group) continue;

        const billingPeriod = getBillingPeriod(t.date, group);

        if (t.is_installment === 0) {
          if (billingPeriod.year === targetYear && billingPeriod.month === targetMonth) {
            monthTotal += t.amount;
            if (paidTxIds.has(t.id)) {
              monthPaid += t.amount;
            }
          }
        } else {
          const diff = (targetYear - billingPeriod.year) * 12 + (targetMonth - billingPeriod.month);
          if (diff >= 0 && diff < t.installment_count) {
            const monthlyAmount = Math.round((t.amount / t.installment_count) * 100) / 100;
            monthTotal += monthlyAmount;
            if (paidTxIds.has(t.id)) {
              monthPaid += monthlyAmount;
            }
          }
        }
      }

      history.push({
        year: targetYear,
        month: targetMonth,
        total_amount: Math.round(monthTotal * 100) / 100,
        paid_amount: Math.round(monthPaid * 100) / 100,
        unpaid_amount: Math.round((monthTotal - monthPaid) * 100) / 100
      });
    }

    return history;
  },

  // BACKUP EXPORT & IMPORT
  exportBackup(): any {
    const banks = readTable<Bank>(KEYS.BANKS);
    const companies = readTable<Company>(KEYS.COMPANIES);
    const expenseGroups = readTable<EGRaw>(KEYS.GROUPS);
    const transactions = readTable<TXRaw>(KEYS.TRANSACTIONS);
    const transactionPayments = readTable<PaymentRaw>(KEYS.PAYMENTS);

    return {
      version: '9.0',
      exported_at: new Date().toISOString(),
      data: {
        banks,
        companies,
        expense_groups: expenseGroups,
        transactions,
        transaction_payments: transactionPayments
      }
    };
  },

  importBackup(backupData: any): void {
    if (!backupData || typeof backupData !== 'object') throw new Error('Invalid backup data');
    const { banks, companies, expense_groups, transactions, transaction_payments } = backupData;

    writeTable(KEYS.BANKS, Array.isArray(banks) ? banks : []);
    writeTable(KEYS.COMPANIES, Array.isArray(companies) ? companies : []);
    writeTable(KEYS.GROUPS, Array.isArray(expense_groups) ? expense_groups : []);
    writeTable(KEYS.TRANSACTIONS, Array.isArray(transactions) ? transactions : []);
    writeTable(KEYS.PAYMENTS, Array.isArray(transaction_payments) ? transaction_payments : []);
  },

  // CSV EXPORT HELPER — tüm gruplar ve işlemler düz liste olarak
  getGroupsWithTransactions(): any[] {
    const groups = readTable<EGRaw>(KEYS.GROUPS);
    const transactions = readTable<TXRaw>(KEYS.TRANSACTIONS);
    const payments = readTable<PaymentRaw>(KEYS.PAYMENTS);
    const companies = readTable<{ id: string; name: string }>(KEYS.COMPANIES);

    return groups.map(group => {
      const groupTxs = transactions.filter(tx => tx.group_id === group.id);
      const txWithDetails = groupTxs.flatMap(tx => {
        const installmentCount = tx.is_installment ? tx.installment_count : 1;
        const results = [];
        for (let i = 1; i <= installmentCount; i++) {
          const payment = payments.find(p =>
            p.transaction_id === tx.id && (!tx.is_installment || (p as any).installment_no === i)
          );
          const company = companies.find(c => c.id === tx.company_id);
          results.push({
            ...tx,
            installment_no: i,
            is_paid: payment?.is_paid === 1,
            company_name: company?.name || '',
            monthly_amount: tx.is_installment ? tx.amount / tx.installment_count : tx.amount
          });
        }
        return results;
      });
      return { ...group, transactions: txWithDetails };
    });
  },

  // GLOBAL SEARCH — tüm işlemlerde arama
  searchTransactions(query: string): any[] {
    if (!query || query.trim().length < 2) return [];
    const q = query.trim().toLowerCase();
    const groups = readTable<EGRaw>(KEYS.GROUPS);
    const transactions = readTable<TXRaw>(KEYS.TRANSACTIONS);
    const payments = readTable<PaymentRaw>(KEYS.PAYMENTS);
    const companies = readTable<{ id: string; name: string }>(KEYS.COMPANIES);

    const results: any[] = [];
    transactions.forEach(tx => {
      const company = companies.find(c => c.id === tx.company_id);
      const group = groups.find(g => g.id === tx.group_id);
      const companyName = company?.name || '';
      const groupName = group?.name || '';
      const amountStr = String(tx.amount);

      if (
        tx.description.toLowerCase().includes(q) ||
        companyName.toLowerCase().includes(q) ||
        groupName.toLowerCase().includes(q) ||
        amountStr.includes(q)
      ) {
        const payment = payments.find(p => p.transaction_id === tx.id);
        results.push({
          ...tx,
          company_name: companyName,
          group_name: groupName,
          is_paid: payment?.is_paid === 1,
          monthly_amount: tx.is_installment ? tx.amount / tx.installment_count : tx.amount
        });
      }
    });

    return results.sort((a, b) => b.date.localeCompare(a.date)).slice(0, 50);
  },

  async checkAndCreateRecurringTransactions(): Promise<void> {
    const list = readTable<TXRaw>(KEYS.TRANSACTIONS);
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1; // 1-12

    let createdNew = false;
    const newList = [...list];

    // Find all active recurring transactions
    const recurringTxs = list.filter(t => t.is_recurring === 1);

    for (const tx of recurringTxs) {
      const origDate = new Date(tx.date);
      const origYear = origDate.getFullYear();
      const origMonth = origDate.getMonth() + 1;

      let y = origYear;
      let m = origMonth;

      while (y < currentYear || (y === currentYear && m <= currentMonth)) {
        // Skip current month if it is not yet the billing day, or let it generate anyway?
        // Let's generate it as soon as the month is reached so it can be tracked.
        const exists = list.some(t => {
          if (t.group_id !== tx.group_id || t.description !== tx.description || t.amount !== tx.amount) return false;
          const d = new Date(t.date);
          return d.getFullYear() === y && (d.getMonth() + 1) === m;
        });

        if (!exists) {
          const day = tx.recurring_day || origDate.getDate();
          const monthStr = String(m).padStart(2, '0');
          const dayStr = String(day).padStart(2, '0');
          const newDateStr = `${y}-${monthStr}-${dayStr}`;

          const newTx: TXRaw = {
            id: generateUUID(),
            group_id: tx.group_id,
            description: tx.description,
            amount: tx.amount,
            date: newDateStr,
            is_installment: 0,
            installment_count: 1,
            created_at: new Date().toISOString(),
            company_id: tx.company_id || null,
            category: tx.category || null,
            is_recurring: 1,
            recurring_day: tx.recurring_day || day
          };
          newList.push(newTx);
          createdNew = true;
        }

        m++;
        if (m > 12) {
          m = 1;
          y++;
        }
      }
    }

    if (createdNew) {
      writeTable(KEYS.TRANSACTIONS, newList);
    }
  }
};


