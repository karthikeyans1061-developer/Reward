"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  Banknote,
  CalendarDays,
  CircleDollarSign,
  Pencil,
  RotateCcw,
  Save,
  X,
} from "lucide-react";
import FinanceShell from "@/components/FinanceShell";
import type { ExpenseCategory, ExpenseRecord } from "@/features/dashboard/types";

interface ExpenseFormState {
  date: string;
  category: ExpenseCategory;
  amount: string;
}

const categories: ExpenseCategory[] = ["Rent", "Home", "Take", "Petrol", "Other"];
const currency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});

function localDateInputValue(): string {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
}

function emptyForm(): ExpenseFormState {
  return { date: localDateInputValue(), category: "Other", amount: "" };
}

function sortRecords(records: ExpenseRecord[]): ExpenseRecord[] {
  return [...records].sort((left, right) => right.date.localeCompare(left.date));
}

function displayDate(date: string): string {
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function ExpensesWorkspace() {
  const currentYear = String(new Date().getFullYear());
  const [records, setRecords] = useState<ExpenseRecord[]>([]);
  const [year, setYear] = useState(currentYear);
  const [dateFilter, setDateFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<ExpenseCategory | "all">("all");
  const [form, setForm] = useState<ExpenseFormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let isCurrent = true;

    fetch("/api/expenses", { cache: "no-store" })
      .then(async (response) => {
        const result = await response.json() as { expenses?: ExpenseRecord[]; error?: string };
        if (!response.ok) throw new Error(result.error ?? "Unable to load expense records.");
        if (isCurrent) setRecords(sortRecords(result.expenses ?? []));
      })
      .catch((loadError: unknown) => {
        if (isCurrent) setError(loadError instanceof Error ? loadError.message : "Unable to load expense records.");
      })
      .finally(() => {
        if (isCurrent) setLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, []);

  const availableYears = Array.from(new Set([
    currentYear,
    ...records.map(({ date }) => date.slice(0, 4)),
  ])).sort((left, right) => right.localeCompare(left));

  const filteredRecords = records.filter((record) => (
    (year === "all" || record.date.startsWith(year))
    && (!dateFilter || record.date === dateFilter)
    && (categoryFilter === "all" || record.category === categoryFilter)
  ));
  const filteredTotal = filteredRecords.reduce((total, record) => total + record.amount, 0);
  const yearsInScope = year === "all"
    ? Math.max(new Set(filteredRecords.map(({ date }) => date.slice(0, 4))).size, 1)
    : 1;
  const averageMonthly = filteredTotal / (yearsInScope * 12);
  const periodLabel = year === "all" ? "All years" : year;

  function resetForm() {
    setForm(emptyForm());
    setEditingId(null);
    setError("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");

    try {
      const response = await fetch("/api/expenses", {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          amount: Number(form.amount),
          ...(editingId ? { id: editingId } : {}),
        }),
      });
      const result = await response.json() as { expense?: ExpenseRecord; error?: string };
      if (!response.ok || !result.expense) {
        throw new Error(result.error ?? "Unable to save this expense record.");
      }

      setRecords((current) => sortRecords(editingId
        ? current.map((record) => record.id === editingId ? result.expense! : record)
        : [...current, result.expense!]));
      setYear(form.date.slice(0, 4));
      setNotice(editingId ? "Expense record updated." : "Expense record added.");
      resetForm();
    } catch (saveError: unknown) {
      setError(saveError instanceof Error ? saveError.message : "Unable to save this expense record.");
    } finally {
      setSaving(false);
    }
  }

  function startEditing(record: ExpenseRecord) {
    setEditingId(record.id);
    setForm({ date: record.date, category: record.category, amount: String(record.amount) });
    setError("");
    setNotice("");
  }

  return (
    <FinanceShell activeSection="Expenses" periodLabel={periodLabel}>
      <div className="dashboard-content income-content">
        <section className="dashboard-heading income-heading" aria-labelledby="expenses-title">
          <div>
            <p className="eyebrow">Money out</p>
            <h1 id="expenses-title">Expenses</h1>
            <p>Record and review your spending.</p>
          </div>
          <span className="dashboard-kicker">
            <span className="status-dot" aria-hidden="true" />
            {periodLabel} selected
          </span>
        </section>

        <section className="income-summary" aria-label="Expense summary">
          <article className="income-stat">
            <div className="income-stat-label"><CircleDollarSign size={16} />Filtered total</div>
            <strong>{currency.format(filteredTotal)}</strong>
            <span>{filteredRecords.length} matching {filteredRecords.length === 1 ? "record" : "records"}</span>
          </article>
          <article className="income-stat">
            <div className="income-stat-label"><CalendarDays size={16} />Selected year</div>
            <strong>{periodLabel}</strong>
            <span>Year filter for the table</span>
          </article>
          <article className="income-stat">
            <div className="income-stat-label"><Banknote size={16} />Average monthly expense</div>
            <strong>{currency.format(averageMonthly)}</strong>
            <span>Filtered total across {yearsInScope * 12} months</span>
          </article>
        </section>

        {(error || notice) && (
          <div className={`income-feedback ${error ? "is-error" : "is-success"}`} role={error ? "alert" : "status"}>
            {error || notice}
          </div>
        )}

        <div className="income-layout">
          <section className="panel income-form-panel" aria-labelledby="expense-form-title">
            <div className="panel-header">
              <div>
                <h2 className="panel-title" id="expense-form-title">{editingId ? "Edit expense" : "Add expense"}</h2>
                <p className="panel-subtitle">Enter the details of an expense record</p>
              </div>
            </div>
            <form className="income-form" onSubmit={handleSubmit}>
              <div className="income-field">
                <label className="form-label" htmlFor="expense-date">Date</label>
                <input
                  className="form-control"
                  id="expense-date"
                  type="date"
                  required
                  value={form.date}
                  onChange={(event) => setForm({ ...form, date: event.target.value })}
                />
              </div>
              <div className="income-field">
                <label className="form-label" htmlFor="expense-category">Category</label>
                <select
                  className="form-select"
                  id="expense-category"
                  required
                  value={form.category}
                  onChange={(event) => setForm({ ...form, category: event.target.value as ExpenseCategory })}
                >
                  {categories.map((category) => <option value={category} key={category}>{category}</option>)}
                </select>
              </div>
              <div className="income-field">
                <label className="form-label" htmlFor="expense-amount">Amount</label>
                <div className="income-amount-input">
                  <span aria-hidden="true">₹</span>
                  <input
                    className="form-control"
                    id="expense-amount"
                    type="number"
                    min="0.01"
                    step="0.01"
                    required
                    inputMode="decimal"
                    placeholder="0.00"
                    value={form.amount}
                    onChange={(event) => setForm({ ...form, amount: event.target.value })}
                  />
                </div>
              </div>
              <div className="income-form-actions">
                <button className="btn income-save-button" type="submit" disabled={saving}>
                  <Save size={15} aria-hidden="true" />
                  {saving ? "Saving..." : editingId ? "Save changes" : "Add expense"}
                </button>
                {editingId && (
                  <button className="btn income-cancel-button" type="button" onClick={resetForm}>
                    <X size={15} aria-hidden="true" />Cancel
                  </button>
                )}
              </div>
            </form>
          </section>

          <section className="panel income-table-panel" aria-labelledby="expense-records-title">
            <div className="panel-header income-table-header">
              <div>
                <h2 className="panel-title" id="expense-records-title">Expense records</h2>
                <p className="panel-subtitle">{filteredRecords.length} shown for {periodLabel}</p>
              </div>
              <span className="income-total-pill">{currency.format(filteredTotal)}</span>
            </div>

            <div className="income-filters" aria-label="Filter expense records">
              <div className="income-filter-field">
                <label htmlFor="expense-filter-year">Year</label>
                <select id="expense-filter-year" className="form-select form-select-sm" value={year} onChange={(event) => setYear(event.target.value)}>
                  <option value="all">All years</option>
                  {availableYears.map((availableYear) => <option key={availableYear} value={availableYear}>{availableYear}</option>)}
                </select>
              </div>
              <div className="income-filter-field">
                <label htmlFor="expense-filter-date">Date</label>
                <input id="expense-filter-date" className="form-control form-control-sm" type="date" value={dateFilter} onChange={(event) => setDateFilter(event.target.value)} />
              </div>
              <div className="income-filter-field">
                <label htmlFor="expense-filter-category">Category</label>
                <select id="expense-filter-category" className="form-select form-select-sm" value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value as ExpenseCategory | "all")}>
                  <option value="all">All categories</option>
                  {categories.map((category) => <option value={category} key={category}>{category}</option>)}
                </select>
              </div>
              <button
                className="income-clear-filters"
                type="button"
                title="Clear filters"
                aria-label="Clear filters"
                onClick={() => { setYear("all"); setDateFilter(""); setCategoryFilter("all"); }}
              >
                <RotateCcw size={15} />
              </button>
            </div>

            <div className="table-responsive income-table-wrap">
              <table className="table income-table align-middle mb-0">
                <thead>
                  <tr>
                    <th scope="col">Date</th>
                    <th scope="col">Category</th>
                    <th scope="col" className="text-end">Amount</th>
                    <th scope="col"><span className="visually-hidden">Actions</span></th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td className="income-table-empty" colSpan={4}>Loading expense records...</td></tr>
                  ) : filteredRecords.length === 0 ? (
                    <tr><td className="income-table-empty" colSpan={4}>{records.length ? "No records match these filters." : "No expense records yet."}</td></tr>
                  ) : filteredRecords.map((record) => (
                    <tr key={record.id}>
                      <td className="income-date-cell">{displayDate(record.date)}</td>
                      <td><span className="income-category-tag is-other">{record.category}</span></td>
                      <td className="income-amount-cell">{currency.format(record.amount)}</td>
                      <td className="income-action-cell">
                        <button
                          className="income-edit-button"
                          type="button"
                          title={`Edit ${record.category} expense`}
                          aria-label={`Edit ${record.category} expense from ${displayDate(record.date)}`}
                          onClick={() => startEditing(record)}
                        >
                          <Pencil size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </FinanceShell>
  );
}