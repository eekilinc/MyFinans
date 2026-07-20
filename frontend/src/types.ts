export interface Transaction {
  id: string;
  group_id: string;
  description: string;
  amount: number; // Total initial amount
  date: string; // YYYY-MM-DD
  is_installment: boolean;
  installment_count: number;
  installment_no: number; // Current installment sequence (1-indexed)
  monthly_amount: number; // Amount corresponding to this month
  is_paid: boolean; // Payment status for selected month
  company_id?: string;
  company_name?: string;
  category?: string;
  is_recurring?: boolean;
  recurring_day?: number;
}

export type GroupType = 'credit_card' | 'loan' | 'debt' | 'other';

export interface ExpenseGroup {
  id: string;
  name: string;
  type: GroupType;
  due_day: number;
  statement_day?: number;
  bank_id?: string;
  bank_name?: string;
  created_at?: string;
  total_amount: number; // Computed total sum for selected month
  paid_amount: number; // Sum of paid transactions in this group
  transactions: Transaction[]; // Active transactions for selected month
}

export interface Bank {
  id: string;
  name: string;
  created_at?: string;
}

export interface Company {
  id: string;
  name: string;
  created_at?: string;
}

export interface CompanyStats {
  id: string;
  name: string;
  created_at?: string;
  tx_count: number;
  total_amount: number;
}

export interface MonthlySummary {
  selected_year: number;
  selected_month: number;
  total_amount: number;
  paid_amount: number;
  unpaid_amount: number;
  groups: ExpenseGroup[];
}

export interface HistoryItem {
  year: number;
  month: number;
  total_amount: number;
  paid_amount: number;
  unpaid_amount: number;
}
