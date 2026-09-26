export type DashboardMetricId = "income" | "savings" | "debt" | "accessories";
export type TransactionDirection = "income" | "expense";
export type IncomeCategory = "Salary" | "Other Income";
export type ExpenseCategory = "Rent" | "Home" | "Take" | "Petrol" | "Other";

export interface DashboardMetric {
  id: DashboardMetricId;
  label: string;
  amount: number;
  recordCount: number;
}

export interface CashFlowMonth {
  key: string;
  month: string;
  income: number;
  expenses: number;
}

export interface SavingsGoal {
  name: string;
  currentAmount: number;
  targetAmount: number;
  targetDate?: string;
}

export interface DashboardTransaction {
  id: string;
  description: string;
  category: string;
  date: string;
  amount: number;
  direction: TransactionDirection;
}

interface IncomeRecordBase {
  id: string;
  date: string;
  amount: number;
}

export interface SalaryIncomeRecord extends IncomeRecordBase {
  category: "Salary";
  organisationName: string;
}

export interface OtherIncomeRecord extends IncomeRecordBase {
  category: "Other Income";
  source: string;
  description: string;
}

export type IncomeRecord = SalaryIncomeRecord | OtherIncomeRecord;

export interface ExpenseRecord {
  id: string;
  date: string;
  amount: number;
  category: ExpenseCategory;
}

export interface SavingsRecord {
  id: string;
  name: string;
  balance: number;
  targetAmount?: number;
  targetDate?: string;
}

export interface DebtRecord {
  id: string;
  name: string;
  balance: number;
}

export interface AccessoryRecord {
  id: string;
  name: string;
  value: number;
}

export interface FinanceData {
  income: IncomeRecord[];
  expenses: ExpenseRecord[];
  savings: SavingsRecord[];
  debts: DebtRecord[];
  accessories: AccessoryRecord[];
}

export interface DashboardSnapshot {
  periodLabel: string;
  metrics: DashboardMetric[];
  cashFlow: CashFlowMonth[];
  hasCashFlowData: boolean;
  savingsGoal: SavingsGoal | null;
  transactions: DashboardTransaction[];
}