"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

export interface ReceiptData {
  name1: string;
  name2: string;
  job: string;
  address: string;
  city: string;
  amount: number;
  description: string;
}

interface ReceiptContextProps {
  receipt: ReceiptData | null;
  setReceipt: (data: ReceiptData) => void;
}

const ReceiptContext = createContext<ReceiptContextProps | undefined>(undefined);

export function ReceiptProvider({ children }: { children: ReactNode }) {
  const [receipt, setReceipt] = useState<ReceiptData | null>(null);

  return (
    <ReceiptContext.Provider value={{ receipt, setReceipt }}>
      {children}
    </ReceiptContext.Provider>
  );
}

export function useReceipt() {
  const context = useContext(ReceiptContext);
  if (!context) {
    throw new Error("useReceipt must be used within a ReceiptProvider");
  }
  return context;
}
