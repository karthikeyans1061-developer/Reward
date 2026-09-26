import {
  ArrowLeftRight,
  Banknote,
  CreditCard,
  Gem,
  Lightbulb,
  PiggyBank,
} from "lucide-react";
import FinanceShell from "@/components/FinanceShell";
import type { LucideIcon } from "lucide-react";
import type {
  DashboardMetric,
  DashboardSnapshot,
  DashboardTransaction,
} from "./types";

const currency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const metricIcons: Record<DashboardMetric["id"], LucideIcon> = {
  income: Banknote,
  savings: PiggyBank,
  debt: CreditCard,
  accessories: Gem,
};

function MetricCard({ metric }: { metric: DashboardMetric }) {
  const Icon = metricIcons[metric.id];

  return (
    <article className="metric-card">
      <div className="metric-card-top">
        <span className="metric-label">{metric.label}</span>
        <span className={`metric-icon metric-icon--${metric.id}`} aria-hidden="true">
          <Icon size={17} strokeWidth={1.9} />
        </span>
      </div>
      <strong className="metric-amount">{currency.format(metric.amount)}</strong>
      <div className="metric-foot">
        <span>{metric.recordCount === 0 ? "No records yet" : `${metric.recordCount} ${metric.recordCount === 1 ? "record" : "records"}`}</span>
      </div>
    </article>
  );
}

function CashFlowChart({ dashboard }: { dashboard: DashboardSnapshot }) {
  const maxAmount = Math.max(...dashboard.cashFlow.flatMap(({ income, expenses }) => [income, expenses]));

  return dashboard.hasCashFlowData ? (
    <div
      className="cashflow-chart"
      role="img"
      aria-label={`Income and expenses by month: ${dashboard.cashFlow
        .map(({ month, income, expenses }) => `${month}, income ${currency.format(income)}, expenses ${currency.format(expenses)}`)
        .join("; ")}`}
    >
      {dashboard.cashFlow.map((month) => (
        <div className="cashflow-month" key={month.key}>
          <div className="cashflow-bars">
            <span
              className="cashflow-bar cashflow-bar--income"
              style={{ height: `${(month.income / maxAmount) * 100}%` }}
            />
            <span
              className="cashflow-bar cashflow-bar--expenses"
              style={{ height: `${(month.expenses / maxAmount) * 100}%` }}
            />
          </div>
          <span className="cashflow-month-label">{month.month}</span>
        </div>
      ))}
    </div>
  ) : (
    <div className="chart-empty">No cash-flow records yet</div>
  );
}

function SavingsGoal({ dashboard }: { dashboard: DashboardSnapshot }) {
  const goal = dashboard.savingsGoal;
  if (!goal) {
    return (
      <section className="panel" aria-labelledby="savings-goal-heading">
        <div className="panel-header">
          <div>
            <h2 className="panel-title" id="savings-goal-heading">Savings goal</h2>
            <p className="panel-subtitle">Your savings target</p>
          </div>
          <PiggyBank size={18} color="var(--green)" aria-hidden="true" />
        </div>
        <div className="empty-state">No savings goals yet</div>
      </section>
    );
  }

  const { name, currentAmount, targetAmount, targetDate } = goal;
  const progress = Math.min(Math.round((currentAmount / targetAmount) * 100), 100);

  return (
    <section className="panel" aria-labelledby="savings-goal-heading">
      <div className="panel-header">
        <div>
          <h2 className="panel-title" id="savings-goal-heading">Savings goal</h2>
          <p className="panel-subtitle">One step at a time</p>
        </div>
        <PiggyBank size={18} color="var(--green)" aria-hidden="true" />
      </div>
      <div className="goal-content">
        <div className="goal-topline">
          <div>
            <h3 className="goal-name">{name}</h3>
            {targetDate && <p className="goal-deadline">Target: {targetDate}</p>}
          </div>
          <span className="goal-percent">{progress}%</span>
        </div>
        <div
          className="goal-track"
          role="progressbar"
          aria-label={`${name} progress`}
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div className="goal-fill" style={{ width: `${progress}%` }} />
        </div>
        <div className="goal-amounts">
          <strong>{currency.format(currentAmount)}</strong>
          <span>of {currency.format(targetAmount)}</span>
        </div>
        <div className="goal-note">
          <Lightbulb size={15} aria-hidden="true" />
          <span>{currency.format(Math.max(targetAmount - currentAmount, 0))} to go to reach your goal.</span>
        </div>
      </div>
    </section>
  );
}

function RecentActivity({ transactions }: { transactions: DashboardTransaction[] }) {
  return (
    <section className="panel activity-panel" aria-labelledby="activity-heading">
      <div className="panel-header">
        <div>
          <h2 className="panel-title" id="activity-heading">Recent activity</h2>
          <p className="panel-subtitle">Your latest recorded transactions</p>
        </div>
      </div>
      <div className="activity-list">
        {transactions.length > 0 ? transactions.map((transaction) => {
          const isIncome = transaction.direction === "income";

          return (
            <div className="activity-row" key={transaction.id}>
              <div className="activity-description">
                <span className={`activity-icon activity-icon--${transaction.direction}`} aria-hidden="true">
                  {isIncome
                    ? <Banknote size={16} strokeWidth={1.9} />
                    : <ArrowLeftRight size={16} strokeWidth={1.9} />}
                </span>
                <span className="min-w-0">
                  <span className="activity-name d-block">{transaction.description}</span>
                  <span className="activity-category">{transaction.category}</span>
                </span>
              </div>
              <time className="activity-date">{transaction.date}</time>
              <span className={`activity-amount ${isIncome ? "is-income" : "is-expense"}`}>
                {isIncome ? "+" : "-"}{currency.format(transaction.amount)}
              </span>
            </div>
          );
        }) : <div className="empty-state">No transactions recorded</div>}
      </div>
    </section>
  );
}

export default function DashboardScreen({ dashboard }: { dashboard: DashboardSnapshot }) {
  return (
    <FinanceShell activeSection="Dashboard" periodLabel={dashboard.periodLabel}>
      <div className="dashboard-content">
          <section className="dashboard-heading" aria-labelledby="dashboard-title">
            <div>
              <p className="eyebrow">Personal overview</p>
              <h1 id="dashboard-title">Dashboard</h1>
              <p>Your money picture, at a glance.</p>
            </div>
            <span className="dashboard-kicker">
              <span className="status-dot" aria-hidden="true" />
              Single-user workspace
            </span>
          </section>

          <section aria-labelledby="balances-heading">
            <div className="section-heading">
              <div>
                <h2 id="balances-heading">Your balances</h2>
                <p>Across all recorded entries</p>
              </div>
            </div>
            <div className="metric-grid">
              {dashboard.metrics.map((metric) => <MetricCard key={metric.id} metric={metric} />)}
            </div>
          </section>

          <div className="dashboard-lower-grid">
            <section className="panel" aria-labelledby="cashflow-heading">
              <div className="panel-header">
                <div>
                  <h2 className="panel-title" id="cashflow-heading">Cash flow</h2>
                  <p className="panel-subtitle">Income and expenses over the last six months</p>
                </div>
                <div className="chart-legend" aria-hidden="true">
                  <span className="legend-item"><span className="legend-swatch legend-swatch--income" />Income</span>
                  <span className="legend-item"><span className="legend-swatch legend-swatch--expenses" />Expenses</span>
                </div>
              </div>
              <CashFlowChart dashboard={dashboard} />
            </section>
            <SavingsGoal dashboard={dashboard} />
          </div>

          <RecentActivity transactions={dashboard.transactions} />
      </div>
    </FinanceShell>
  );
}