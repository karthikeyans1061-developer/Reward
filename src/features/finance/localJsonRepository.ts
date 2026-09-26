import { readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import type { FinanceData } from "@/features/dashboard/types";

const financeFilePath = path.join(process.cwd(), "data", "finance.json");

function createEmptyFinanceData(): FinanceData {
  return {
    income: [],
    expenses: [],
    savings: [],
    debts: [],
    accessories: [],
  };
}

export async function readFinanceData(): Promise<FinanceData> {
  try {
    const content = await readFile(financeFilePath, "utf8");
    const parsed = JSON.parse(content) as Partial<FinanceData>;

    return {
      income: parsed.income ?? [],
      expenses: parsed.expenses ?? [],
      savings: parsed.savings ?? [],
      debts: parsed.debts ?? [],
      accessories: parsed.accessories ?? [],
    };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return createEmptyFinanceData();
    }
    throw error;
  }
}

export async function writeFinanceData(data: FinanceData): Promise<void> {
  const temporaryPath = `${financeFilePath}.${process.pid}.tmp`;
  await writeFile(temporaryPath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
  await rename(temporaryPath, financeFilePath);
}