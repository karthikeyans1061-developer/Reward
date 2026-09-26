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
import type { IncomeCategory, IncomeRecord } from "@/features/dashboard/types";

interface IncomeFormState {
  date: string;
  category: IncomeCategory;
  organisationName: string;
  source: string;
  description: string;
  amount: string;
}

const currency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});

function localDateInputValue(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function emptyForm(): IncomeFormState {
  return {
    date: localDateInputValue(),
    category: "Salary",
    organisationName: "Aparajitha",
    source: "",
    description: "",
    amount: "",
  };
}

function sortRecords(records: IncomeRecord[]): IncomeRecord[] {
  return [...records].sort((left, right) => right.date.localeCompare(left.date));
}

function displayDate(date: string): string {
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function IncomeWorkspace() {
  const currentYear = String(new Date().getFullYear());
  const [records, setRecords] = useState<IncomeRecord[]>([]);
  const [year, setYear] = useState(currentYear);
  const [dateFilter, setDateFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<IncomeCategory | "all">("all");
  const [form, setForm] = useState<IncomeFormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let isCurrent = true;

    fetch("/api/income", { cache: "no-store" })
      .then(async (response) => {
        const result = await response.json() as { income?: IncomeRecord[]; error?: string };
        if (!response.ok) throw new Error(result.error ?? "Unable to load income records.");
        if (isCurrent) setRecords(sortRecords(result.income ?? []));
      })
      .catch((loadError: unknown) => {
        if (isCurrent) setError(loadError instanceof Error ? loadError.message : "Unable to load income records.");
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

    const common = {
      date: form.date,
      category: form.category,
      amount: Number(form.amount),
    };
    const payload = form.category === "Salary"
      ? { ...common, organisationName: form.organisationName }
      : { ...common, source: form.source, description: form.description };

    try {
      const response = await fetch("/api/income", {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingId ? { ...payload, id: editingId } : payload),
      });
      const result = await response.json() as { income?: IncomeRecord; error?: string };
      if (!response.ok || !result.income) {
        throw new Error(result.error ?? "Unable to save this income record.");
      }

      setRecords((current) => sortRecords(editingId
        ? current.map((record) => record.id === editingId ? result.income! : record)
        : [...current, result.income!]));
      setYear(form.date.slice(0, 4));
      setNotice(editingId ? "Income record updated." : "Income record added.");
      resetForm();
    } catch (saveError: unknown) {
      setError(saveError instanceof Error ? saveError.message : "Unable to save this income record.");
    } finally {
      setSaving(false);
    }
  }

  function startEditing(record: IncomeRecord) {
    setEditingId(record.id);
    setForm({
      date: record.date,
      category: record.category,
      organisationName: record.category === "Salary" ? record.organisationName : "Aparajitha",
      source: record.category === "Other Income" ? record.source : "",
      description: record.category === "Other Income" ? record.description : "",
      amount: String(record.amount),
    });
    setError("");
    setNotice("");
  }

  return (
    <FinanceShell activeSection="Income" periodLabel={periodLabel}>
      <div className="dashboard-content income-content">
        <section className="dashboard-heading income-heading" aria-labelledby="income-title">
          <div>
            <p className="eyebrow">Money in</p>
            <h1 id="income-title">Income</h1>
            <p>Record and review your earnings.</p>
          </div>
          <span className="dashboard-kicker">
            <span className="status-dot" aria-hidden="true" />
            {periodLabel} selected
          </span>
        </section>

        <section className="income-summary" aria-label="Income summary">
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
            <div className="income-stat-label"><Banknote size={16} />Average monthly income</div>
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
          <section className="panel income-form-panel" aria-labelledby="income-form-title">
            <div className="panel-header">
              <div>
                <h2 className="panel-title" id="income-form-title">{editingId ? "Edit income" : "Add income"}</h2>
                <p className="panel-subtitle">Enter the details of an income record</p>
              </div>
            </div>
            <form className="income-form" onSubmit={handleSubmit}>
              <div className="income-field">
                <label className="form-label" htmlFor="income-date">Date</label>
                <input
                  className="form-control"
                  id="income-date"
                  type="date"
                  required
                  value={form.date}
                  onChange={(event) => setForm({ ...form, date: event.target.value })}
                />
              </div>
              <div className="income-field">
                <label className="form-label" htmlFor="income-category">Category</label>
                <select
                  className="form-select"
                  id="income-category"
                  value={form.category}
                  onChange={(event) => setForm({ ...form, category: event.target.value as IncomeCategory })}
                >
                  <option value="Salary">Salary</option>
                  <option value="Other Income">Other Income</option>
                </select>
              </div>

              {form.category === "Salary" ? (
                <div className="income-field">
                  <label className="form-label" htmlFor="organisation-name">Organisation name</label>
                  <input
                    className="form-control"
                    id="organisation-name"
                    type="text"
                    required
                    maxLength={100}
                    value={form.organisationName}
                    onChange={(event) => setForm({ ...form, organisationName: event.target.value })}
                  />
                </div>
              ) : (
                <>
                  <div className="income-field">
                    <label className="form-label" htmlFor="income-source">Source</label>
                    <input
                      className="form-control"
                      id="income-source"
                      type="text"
                      placeholder="Freelance, interest, rent..."
                      required
                      maxLength={100}
                      value={form.source}
                      onChange={(event) => setForm({ ...form, source: event.target.value })}
                    />
                  </div>
                  <div className="income-field">
                    <label className="form-label" htmlFor="income-description">Description</label>
                    <input
                      className="form-control"
                      id="income-description"
                      type="text"
                      placeholder="What was this income for?"
                      required
                      maxLength={160}
                      value={form.description}
                      onChange={(event) => setForm({ ...form, description: event.target.value })}
                    />
                  </div>
                </>
              )}

              <div className="income-field">
                <label className="form-label" htmlFor="income-amount">{form.category === "Salary" ? "Salary amount" : "Amount"}</label>
                <div className="income-amount-input">
                  <span aria-hidden="true">₹</span>
                  <input
                    className="form-control"
                    id="income-amount"
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
                  {saving ? "Saving..." : editingId ? "Save changes" : "Add income"}
                </button>
                {editingId && (
                  <button className="btn income-cancel-button" type="button" onClick={resetForm}>
                    <X size={15} aria-hidden="true" />Cancel
                  </button>
                )}
              </div>
            </form>
          </section>

          <section className="panel income-table-panel" aria-labelledby="income-records-title">
            <div className="panel-header income-table-header">
              <div>
                <h2 className="panel-title" id="income-records-title">Income records</h2>
                <p className="panel-subtitle">{filteredRecords.length} shown for {periodLabel}</p>
              </div>
              <span className="income-total-pill">{currency.format(filteredTotal)}</span>
            </div>

            <div className="income-filters" aria-label="Filter income records">
              <div className="income-filter-field">
                <label htmlFor="filter-year">Year</label>
                <select id="filter-year" className="form-select form-select-sm" value={year} onChange={(event) => setYear(event.target.value)}>
                  <option value="all">All years</option>
                  {availableYears.map((availableYear) => <option key={availableYear} value={availableYear}>{availableYear}</option>)}
                </select>
              </div>
              <div className="income-filter-field">
                <label htmlFor="filter-date">Date</label>
                <input id="filter-date" className="form-control form-control-sm" type="date" value={dateFilter} onChange={(event) => setDateFilter(event.target.value)} />
              </div>
              <div className="income-filter-field">
                <label htmlFor="filter-category">Category</label>
                <select id="filter-category" className="form-select form-select-sm" value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value as IncomeCategory | "all")}>
                  <option value="all">All categories</option>
                  <option value="Salary">Salary</option>
                  <option value="Other Income">Other Income</option>
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
                    <th scope="col">Details</th>
                    <th scope="col" className="text-end">Amount</th>
                    <th scope="col"><span className="visually-hidden">Actions</span></th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td className="income-table-empty" colSpan={5}>Loading income records...</td></tr>
                  ) : filteredRecords.length === 0 ? (
                    <tr><td className="income-table-empty" colSpan={5}>{records.length ? "No records match these filters." : "No income records yet."}</td></tr>
                  ) : filteredRecords.map((record) => (
                    <tr key={record.id}>
                      <td className="income-date-cell">{displayDate(record.date)}</td>
                      <td><span className={`income-category-tag${record.category === "Salary" ? " is-salary" : " is-other"}`}>{record.category}</span></td>
                      <td>
                        <span className="income-detail-title">{record.category === "Salary" ? record.organisationName : record.source}</span>
                        {record.category === "Other Income" && <span className="income-detail-note">{record.description}</span>}
                      </td>
                      <td className="income-amount-cell">{currency.format(record.amount)}</td>
                      <td className="income-action-cell">
                        <button
                          className="income-edit-button"
                          type="button"
                          title={`Edit ${record.category} record`}
                          aria-label={`Edit ${record.category} record from ${displayDate(record.date)}`}
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