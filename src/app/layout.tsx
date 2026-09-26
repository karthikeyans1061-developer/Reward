import type { Metadata } from "next";
import "bootstrap/dist/css/bootstrap.min.css";
import "./globals.css";
import { ReceiptProvider } from "../context/ReceiptContext";

export const metadata: Metadata = {
  title: "Ledger | Personal Finance",
  description: "A clear overview of your personal finances.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ReceiptProvider>
          {children}
        </ReceiptProvider>
      </body>
    </html>
  );
}
