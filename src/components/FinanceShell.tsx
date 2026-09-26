import Link from "next/link";
import {
  ArrowLeftRight,
  Banknote,
  CalendarDays,
  ChartNoAxesCombined,
  CreditCard,
  LayoutDashboard,
  Package,
  PiggyBank,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

type FinanceSection = "Dashboard" | "Income" | "Expenses" | "Debt" | "Savings" | "Accessories";

const sections: { label: FinanceSection; icon: LucideIcon; href?: string }[] = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/" },
  { label: "Income", icon: Banknote, href: "/income" },
  { label: "Expenses", icon: ArrowLeftRight, href: "/expenses" },
  { label: "Debt", icon: CreditCard },
  { label: "Savings", icon: PiggyBank },
  { label: "Accessories", icon: Package },
];

export default function FinanceShell({
  activeSection,
  periodLabel,
  children,
}: {
  activeSection: FinanceSection;
  periodLabel: string;
  children: ReactNode;
}) {
  return (
    <div className="dashboard-shell">
      <aside className="dashboard-sidebar" aria-label="Main navigation">
        <Link className="brand-lockup" href="/" aria-label="Ledger dashboard">
          <span className="brand-mark" aria-hidden="true">L</span>
          <span>
            <span className="brand-name">Ledger</span>
            <span className="brand-caption">PERSONAL FINANCE</span>
          </span>
        </Link>

        <p className="nav-section-label">Workspace</p>
        <nav className="dashboard-nav" aria-label="Finance sections">
          {sections.map(({ label, icon: Icon, href }) => href ? (
            <Link
              className={`dashboard-nav-link${activeSection === label ? " is-active" : ""}`}
              href={href}
              aria-current={activeSection === label ? "page" : undefined}
              key={label}
            >
              <Icon size={17} strokeWidth={1.9} aria-hidden="true" />
              <span>{label}</span>
            </Link>
          ) : (
            <span className="dashboard-nav-disabled" aria-disabled="true" key={label}>
              <Icon size={17} strokeWidth={1.9} aria-hidden="true" />
              <span>{label}</span>
              <span className="nav-coming-soon">Soon</span>
            </span>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="local-data-status">
            <span className="status-dot" aria-hidden="true" />
            <span>Private local data</span>
          </div>
        </div>
      </aside>

      <main className="dashboard-main">
        <header className="dashboard-topbar">
          <div className="topbar-location">
            <ChartNoAxesCombined size={16} aria-hidden="true" />
            <span>Workspace</span>
            <span aria-hidden="true">/</span>
            <strong>{activeSection}</strong>
          </div>
          <div className="period-label">
            <CalendarDays size={14} aria-hidden="true" />
            <span>{periodLabel}</span>
          </div>
        </header>
        {children}
      </main>
    </div>
  );
}