import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { readFinanceData, writeFinanceData } from "@/features/finance/localJsonRepository";
import type { ExpenseCategory, ExpenseRecord } from "@/features/dashboard/types";

export const runtime = "nodejs";

const expenseCategories: ExpenseCategory[] = ["Rent", "Home", "Take", "Petrol", "Other"];
type ExpenseInput = Omit<ExpenseRecord, "id">;

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function parseExpenseInput(value: unknown): ExpenseInput | null {
  if (!isObject(value)) return null;

  const { date, category, amount } = value;
  if (typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
  if (Number.isNaN(Date.parse(`${date}T00:00:00`))) return null;
  if (typeof category !== "string" || !expenseCategories.includes(category as ExpenseCategory)) return null;

  const numericAmount = Number(amount);
  if (!Number.isFinite(numericAmount) || numericAmount <= 0) return null;

  return { date, category: category as ExpenseCategory, amount: numericAmount };
}

export async function GET() {
  try {
    const data = await readFinanceData();
    const expenses = [...data.expenses].sort((left, right) => right.date.localeCompare(left.date));
    return NextResponse.json({ expenses });
  } catch {
    return NextResponse.json({ error: "Unable to read expense records." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const input = parseExpenseInput(body);
  if (!input) {
    return NextResponse.json({ error: "Check the date, category, and amount." }, { status: 400 });
  }

  try {
    const data = await readFinanceData();
    const record: ExpenseRecord = { ...input, id: randomUUID() };
    data.expenses.push(record);
    await writeFinanceData(data);
    return NextResponse.json({ expense: record }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Unable to save the expense record." }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (!isObject(body) || typeof body.id !== "string") {
    return NextResponse.json({ error: "An expense record ID is required." }, { status: 400 });
  }

  const input = parseExpenseInput(body);
  if (!input) {
    return NextResponse.json({ error: "Check the date, category, and amount." }, { status: 400 });
  }

  try {
    const data = await readFinanceData();
    const recordIndex = data.expenses.findIndex(({ id }) => id === body.id);
    if (recordIndex < 0) {
      return NextResponse.json({ error: "Expense record not found." }, { status: 404 });
    }

    const record: ExpenseRecord = { ...input, id: body.id };
    data.expenses[recordIndex] = record;
    await writeFinanceData(data);
    return NextResponse.json({ expense: record });
  } catch {
    return NextResponse.json({ error: "Unable to update the expense record." }, { status: 500 });
  }
}