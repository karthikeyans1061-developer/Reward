import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { readFinanceData, writeFinanceData } from "@/features/finance/localJsonRepository";
import type {
  IncomeRecord,
  OtherIncomeRecord,
  SalaryIncomeRecord,
} from "@/features/dashboard/types";

export const runtime = "nodejs";

type IncomeInput = Omit<SalaryIncomeRecord, "id"> | Omit<OtherIncomeRecord, "id">;

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function parseIncomeInput(value: unknown): IncomeInput | null {
  if (!isObject(value)) return null;

  const { date, category, amount } = value;
  if (typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
  if (Number.isNaN(Date.parse(`${date}T00:00:00`))) return null;
  if (category !== "Salary" && category !== "Other Income") return null;

  const numericAmount = Number(amount);
  if (!Number.isFinite(numericAmount) || numericAmount <= 0) return null;

  if (category === "Salary") {
    const organisationName = typeof value.organisationName === "string"
      ? value.organisationName.trim()
      : "";
    if (!organisationName) return null;

    return {
      date,
      category: "Salary",
      amount: numericAmount,
      organisationName,
    };
  }

  const source = typeof value.source === "string" ? value.source.trim() : "";
  const description = typeof value.description === "string" ? value.description.trim() : "";
  if (!source || !description) return null;

  return { date, category: "Other Income", amount: numericAmount, source, description };
}

export async function GET() {
  try {
    const data = await readFinanceData();
    const income = [...data.income].sort((left, right) => right.date.localeCompare(left.date));
    return NextResponse.json({ income });
  } catch {
    return NextResponse.json({ error: "Unable to read income records." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const input = parseIncomeInput(body);
  if (!input) {
    return NextResponse.json({ error: "Check the date, category, amount, and required details." }, { status: 400 });
  }

  try {
    const data = await readFinanceData();
    const record = { ...input, id: randomUUID() } as IncomeRecord;
    data.income.push(record);
    await writeFinanceData(data);
    return NextResponse.json({ income: record }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Unable to save the income record." }, { status: 500 });
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
    return NextResponse.json({ error: "An income record ID is required." }, { status: 400 });
  }

  const input = parseIncomeInput(body);
  if (!input) {
    return NextResponse.json({ error: "Check the date, category, amount, and required details." }, { status: 400 });
  }

  try {
    const data = await readFinanceData();
    const recordIndex = data.income.findIndex(({ id }) => id === body.id);
    if (recordIndex < 0) {
      return NextResponse.json({ error: "Income record not found." }, { status: 404 });
    }

    const record = { ...input, id: body.id } as IncomeRecord;
    data.income[recordIndex] = record;
    await writeFinanceData(data);
    return NextResponse.json({ income: record });
  } catch {
    return NextResponse.json({ error: "Unable to update the income record." }, { status: 500 });
  }
}