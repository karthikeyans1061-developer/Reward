import { readFinanceData } from "@/features/finance/localJsonRepository";
import type { DashboardSnapshot, FinanceData } from "./types";

export interface DashboardRepository {
  getSnapshot(): Promise<DashboardSnapshot>;
}

function sum(values: number[]): number {
  return values.reduce((total, value) => total + value, 0);
}

function createDashboardSnapshot(data: FinanceData, now: Date): DashboardSnapshot {
  const incomeTransactions = data.income.map((record) => ({
    id: record.id,
    description: record.category === "Salary" ? record.organisationName : record.description,
    category: record.category,
    date: record.date,
    amount: record.amount,
    direction: "income" as const,
  }));
  const expenseTransactions = data.expenses.map((record) => ({
    id: record.id,
    description: record.category,
    category: record.category,
    date: record.date,
    amount: record.amount,
    direction: "expense" as const,
  }));
  const transactions = [...incomeTransactions, ...expenseTransactions];
  const months = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - 5 + index, 1);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

    return {
      key,
      month: new Intl.DateTimeFormat("en", { month: "short" }).format(date),
      income: 0,
      expenses: 0,
    };
  });
  const monthByKey = new Map(months.map((month) => [month.key, month]));

  for (const transaction of transactions) {
    const month = monthByKey.get(transaction.date.slice(0, 7));
    if (!month) continue;
    if (transaction.direction === "income") month.income += transaction.amount;
    else month.expenses += transaction.amount;
  }

  const savingsGoalRecord = data.savings.find(({ targetAmount }) => targetAmount && targetAmount > 0);
  const periodLabel = new Intl.DateTimeFormat("en", {
    month: "long",
    year: "numeric",
  }).format(now);

  return {
    periodLabel,
    metrics: [
      {
        id: "income",
        label: "Total Income",
        amount: sum(incomeTransactions.map(({ amount }) => amount)),
        recordCount: incomeTransactions.length,
      },
      {
        id: "savings",
        label: "Total Savings",
        amount: sum(data.savings.map(({ balance }) => balance)),
        recordCount: data.savings.length,
      },
      {
        id: "debt",
        label: "Total Debt",
        amount: sum(data.debts.map(({ balance }) => balance)),
        recordCount: data.debts.length,
      },
      {
        id: "accessories",
        label: "Total Accessories",
        amount: sum(data.accessories.map(({ value }) => value)),
        recordCount: data.accessories.length,
      },
    ],
    cashFlow: months,
    hasCashFlowData: months.some(({ income, expenses }) => income > 0 || expenses > 0),
    savingsGoal: savingsGoalRecord
      ? {
          name: savingsGoalRecord.name,
          currentAmount: savingsGoalRecord.balance,
          targetAmount: savingsGoalRecord.targetAmount!,
          targetDate: savingsGoalRecord.targetDate,
        }
      : null,
    transactions: [...transactions]
      .sort((left, right) => right.date.localeCompare(left.date))
      .slice(0, 5),
  };
}

export class LocalJsonFinanceRepository implements DashboardRepository {
  async getSnapshot(): Promise<DashboardSnapshot> {
    return createDashboardSnapshot(await readFinanceData(), new Date());
  }
}

const dashboardRepository: DashboardRepository = new LocalJsonFinanceRepository();

export function getDashboardSnapshot(): Promise<DashboardSnapshot> {
  return dashboardRepository.getSnapshot();
}