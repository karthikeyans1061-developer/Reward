"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useReceipt } from "../../context/ReceiptContext";

export default function ReceiptPage() {
  const router = useRouter();
  const { receipt } = useReceipt();

  if (!receipt) {
    return (
      <div className="container py-5 text-center page-enter" style={{ position: "relative", zIndex: 1 }}>
        <div className="glass-card mx-auto p-5" style={{ maxWidth: "450px" }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📄</div>
          <h3 style={{ color: "var(--text-primary)", fontWeight: 700, marginBottom: "0.5rem" }}>
            No Receipt Found
          </h3>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "1.5rem" }}>
            ரசீது தகவல் இல்லை. முதலில் படிவத்தை சமர்ப்பிக்கவும்.
          </p>
          <button className="btn-premium" style={{ width: "auto", display: "inline-flex" }} onClick={() => router.push("/add-moi")}>
            <span>📝</span> Go to Form
          </button>
        </div>
      </div>
    );
  }

  const currentDate = new Date().toLocaleDateString("ta-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const currentTime = new Date().toLocaleTimeString("ta-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const receiptFields = [
    { label: "பெயர் 1 (Name 1)", value: receipt.name1, icon: "👤" },
    { label: "பெயர் 2 (Name 2)", value: receipt.name2, icon: "👤" },
    { label: "தொழில் (Job)", value: receipt.job, icon: "💼" },
    { label: "முகவரி (Address)", value: receipt.address, icon: "📍" },
    { label: "நகரம் (City)", value: receipt.city, icon: "🏙️" },
  ];

  return (
    <div className="container py-4 py-md-5 page-enter" style={{ position: "relative", zIndex: 1 }}>
      <div className="mx-auto" style={{ maxWidth: "520px" }}>
        {/* Receipt Card */}
        <div className="receipt-card">
          {/* Header */}
          <div className="receipt-header">
            <div style={{ fontSize: "2.2rem", marginBottom: "0.3rem" }}>🧾</div>
            <h1 style={{
              fontSize: "1.5rem",
              fontWeight: 800,
              color: "#fff",
              letterSpacing: "-0.02em",
              marginBottom: "0.15rem",
            }}>
              மொய் ரசீது
            </h1>
            <p style={{
              fontSize: "0.8rem",
              color: "rgba(255,255,255,0.7)",
              fontWeight: 400,
              margin: 0,
            }}>
              MOI RECEIPT — Tamil Nadu Customary Gift
            </p>
          </div>

          {/* Date & Time Badge */}
          <div style={{ padding: "1.5rem 1.75rem 0" }}>
            <div className="d-flex justify-content-between align-items-center" style={{ marginBottom: "1rem" }}>
              <span className="section-badge">📅 {currentDate}</span>
              <span className="section-badge">🕐 {currentTime}</span>
            </div>
          </div>

          {/* Amount Center */}
          <div style={{ padding: "0.5rem 1.75rem 0.75rem", textAlign: "center" }}>
            <p style={{ color: "var(--text-muted)", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.3rem" }}>
              Total Amount
            </p>
            <div className="receipt-amount">
              ₹{receipt.amount.toLocaleString("en-IN")}.00
            </div>
          </div>

          <div style={{ padding: "0 1.75rem" }}>
            <div className="premium-divider" />
          </div>

          {/* Fields */}
          <div style={{ padding: "0.75rem 1.75rem 1rem" }}>
            {receiptFields.map((field, idx) => (
              <div className="receipt-row" key={idx}>
                <span className="receipt-label">
                  {field.icon} {field.label}
                </span>
                <span className="receipt-value">{field.value}</span>
              </div>
            ))}
          </div>

          {/* Description */}
          {receipt.description && (
            <>
              <div style={{ padding: "0 1.75rem" }}>
                <div className="premium-divider" />
              </div>
              <div style={{ padding: "0.75rem 1.75rem 1rem" }}>
                <p style={{
                  color: "var(--text-secondary)",
                  fontSize: "0.72rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  fontWeight: 600,
                  marginBottom: "0.4rem",
                }}>
                  📝 விளக்கம் (Description)
                </p>
                <p style={{
                  color: "var(--text-primary)",
                  fontSize: "0.9rem",
                  lineHeight: 1.6,
                  whiteSpace: "pre-line",
                  margin: 0,
                }}>
                  {receipt.description}
                </p>
              </div>
            </>
          )}

          {/* Footer */}
          <div style={{
            padding: "1.25rem 1.75rem",
            borderTop: "1px solid var(--glass-border)",
            textAlign: "center",
            background: "rgba(255,255,255,0.02)",
          }}>
            <p style={{ fontWeight: 700, fontSize: "0.85rem", color: "var(--text-primary)", margin: 0, marginBottom: "0.2rem" }}>
              நன்றி! 🙏
            </p>
            <p style={{ color: "var(--text-muted)", fontSize: "0.72rem", margin: 0 }}>
              This is a computer generated receipt.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="d-flex justify-content-center gap-3 mt-4 d-print-none">
          <button className="btn-glass px-4" onClick={() => router.push("/add-moi")}>
            ← Back
          </button>
          <button className="btn-premium" style={{ width: "auto" }} onClick={() => window.print()}>
            <span>🖨️</span> Print Receipt
          </button>
        </div>
      </div>
    </div>
  );
}
