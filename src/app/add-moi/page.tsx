"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useReceipt } from "../../context/ReceiptContext";
import SearchableDropdown from "../../components/SearchableDropdown";
import { tamilNames } from "../../../data/tamilNames";
import { maduraiAddresses } from "../../../data/maduraiAddresses";
import { tamilNaduCities } from "../../../data/tamilNaduCities";

const AMOUNT_SUGGESTIONS = [101, 201, 301, 401, 501, 1001, 2001, 5001];

// Helper to transliterate the last word in a string via Google Input Tools
async function transliterateLastWord(val: string): Promise<string> {
  const words = val.split(" ");
  const lastWordIdx = words.length - 1;
  const lastWord = words[lastWordIdx];
  if (lastWord && !/[\u0B80-\u0BFF]/.test(lastWord)) {
    try {
      const res = await fetch(
        `https://inputtools.google.com/request?text=${encodeURIComponent(lastWord)}&itc=ta-t-i0-und&num=1&cp=0&cs=1&ie=utf-8&oe=utf-8&app=test`
      );
      const data = await res.json();
      if (data?.[0] === "SUCCESS" && data[1]?.[0]?.[1]?.[0]) {
        words[lastWordIdx] = data[1][0][1][0];
        return words.join(" ");
      }
    } catch (err) {
      console.error(err);
    }
  }
  return val;
}

export default function AddMoiPage() {
  const router = useRouter();
  const { setReceipt } = useReceipt();

  const [form, setForm] = useState({
    name1: "",
    name2: "",
    job: "",
    address: "",
    city: "",
    amount: "",
    description: "",
  });

  const [validationError, setValidationError] = useState("");

  const handleChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSuggest = (val: number) => {
    setForm(prev => ({ ...prev, amount: val.toString() }));
  };

  // Shared transliteration handler for plain inputs
  const createTranslitHandlers = (fieldName: string) => ({
    onBlur: async (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const val = e.target.value;
      if (!val) return;
      const result = await transliterateLastWord(val);
      if (result !== val) handleChange(fieldName, result);
    },
    onKeyDown: async (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const target = e.target as HTMLInputElement;
      const val = target.value;
      if (e.key === " ") {
        const words = val.split(" ");
        const lastWord = words[words.length - 1];
        if (lastWord && !/[\u0B80-\u0BFF]/.test(lastWord)) {
          e.preventDefault();
          const result = await transliterateLastWord(val);
          handleChange(fieldName, result + " ");
        }
      } else if (e.key === "Enter") {
        e.preventDefault();
        const result = await transliterateLastWord(val);
        handleChange(fieldName, result);
        setTimeout(() => {
          const formElement = target.form;
          if (formElement) {
            const idx = Array.prototype.indexOf.call(formElement, target);
            if (idx > -1 && idx + 1 < formElement.elements.length) {
              (formElement.elements[idx + 1] as HTMLElement)?.focus();
            }
          }
        }, 50);
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name1.trim()) return setValidationError("Name 1 is required");
    if (!form.name2.trim()) return setValidationError("Name 2 is required");
    if (!form.job.trim()) return setValidationError("Job is required");
    if (!form.address.trim()) return setValidationError("Address is required");
    if (!form.city.trim()) return setValidationError("City is required");
    if (!form.amount.trim()) return setValidationError("Amount is required");

    const amountNum = Number(form.amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      return setValidationError("Amount must be a number greater than 0");
    }

    setValidationError("");
    setReceipt({
      name1: form.name1,
      name2: form.name2,
      job: form.job,
      address: form.address,
      city: form.city,
      amount: amountNum,
      description: form.description,
    });

    router.push("/receipt");
  };

  return (
    <div className="container py-4 py-md-5 page-enter" style={{ position: "relative", zIndex: 1 }}>
      <div className="mx-auto" style={{ maxWidth: "680px" }}>
        {/* Card */}
        <div className="glass-card">
          {/* Header */}
          <div className="premium-header">
            <h2>
              <span className="header-icon">📝</span>
              மொய் பதிவு
            </h2>
            <p className="header-subtitle">Add Moi Details — Customary Gift Entry</p>
          </div>

          {/* Body */}
          <div style={{ padding: "1.75rem 1.75rem 2rem" }}>
            {validationError && (
              <div className="alert alert-danger mb-4 d-flex align-items-center gap-2" role="alert">
                <span>⚠️</span> {validationError}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Name 1 */}
              <div className="field-group field-animate" style={{ animationDelay: "0.05s" }}>
                <label htmlFor="name1" className="form-label">
                  <span className="label-icon">👤</span> பெயர் 1 (Name 1)
                </label>
                <SearchableDropdown
                  id="name1"
                  options={tamilNames}
                  value={form.name1}
                  onChange={(val) => handleChange("name1", val)}
                  placeholder="பெயர் தட்டச்சு செய்யவும்..."
                />
              </div>

              {/* Name 2 */}
              <div className="field-group field-animate" style={{ animationDelay: "0.1s" }}>
                <label htmlFor="name2" className="form-label">
                  <span className="label-icon">👤</span> பெயர் 2 (Name 2)
                </label>
                <SearchableDropdown
                  id="name2"
                  options={tamilNames}
                  value={form.name2}
                  onChange={(val) => handleChange("name2", val)}
                  placeholder="பெயர் தட்டச்சு செய்யவும்..."
                />
              </div>

              {/* Two columns: Job + City */}
              <div className="row">
                <div className="col-12 col-md-6">
                  <div className="field-group field-animate" style={{ animationDelay: "0.15s" }}>
                    <label htmlFor="job" className="form-label">
                      <span className="label-icon">💼</span> தொழில் (Job)
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="job"
                      placeholder="தொழில் உள்ளிடவும்..."
                      value={form.job}
                      onChange={(e) => handleChange("job", e.target.value)}
                      {...createTranslitHandlers("job")}
                    />
                  </div>
                </div>
                <div className="col-12 col-md-6">
                  <div className="field-group field-animate" style={{ animationDelay: "0.2s" }}>
                    <label htmlFor="city" className="form-label">
                      <span className="label-icon">🏙️</span> நகரம் (City)
                    </label>
                    <SearchableDropdown
                      id="city"
                      options={tamilNaduCities}
                      value={form.city}
                      onChange={(val) => handleChange("city", val)}
                      placeholder="நகரம் தேர்ந்தெடுக்கவும்..."
                    />
                  </div>
                </div>
              </div>

              {/* Address */}
              <div className="field-group field-animate" style={{ animationDelay: "0.25s" }}>
                <label htmlFor="address" className="form-label">
                  <span className="label-icon">📍</span> முகவரி (Address)
                </label>
                <SearchableDropdown
                  id="address"
                  options={maduraiAddresses}
                  value={form.address}
                  onChange={(val) => handleChange("address", val)}
                  placeholder="முகவரி தட்டச்சு செய்யவும்..."
                />
              </div>

              {/* Amount */}
              <div className="field-group field-animate" style={{ animationDelay: "0.3s" }}>
                <label htmlFor="amount" className="form-label">
                  <span className="label-icon">💰</span> தொகை (Amount)
                </label>
                <input
                  type="number"
                  className="form-control"
                  id="amount"
                  placeholder="₹ தொகை உள்ளிடவும்..."
                  value={form.amount}
                  onChange={(e) => handleChange("amount", e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      const target = e.target as HTMLInputElement;
                      setTimeout(() => {
                        const formElement = target.form;
                        if (formElement) {
                          const idx = Array.prototype.indexOf.call(formElement, target);
                          if (idx > -1 && idx + 1 < formElement.elements.length) {
                            (formElement.elements[idx + 1] as HTMLElement)?.focus();
                          }
                        }
                      }, 50);
                    }
                  }}
                  min="1"
                />
                {/* Amount chips */}
                <div className="mt-2 d-flex flex-wrap gap-2">
                  {AMOUNT_SUGGESTIONS.map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      className={`amount-chip ${form.amount === amt.toString() ? "selected" : ""}`}
                      onClick={() => handleSuggest(amt)}
                    >
                      ₹{amt.toLocaleString("en-IN")}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className="field-group field-animate" style={{ animationDelay: "0.35s" }}>
                <label htmlFor="description" className="form-label">
                  <span className="label-icon">📝</span> விளக்கம் (Description)
                </label>
                <textarea
                  className="form-control"
                  id="description"
                  rows={3}
                  placeholder="விளக்கம் உள்ளிடவும்..."
                  value={form.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  onBlur={async (e) => {
                    const val = e.target.value;
                    if (!val) return;
                    const result = await transliterateLastWord(val);
                    if (result !== val) handleChange("description", result);
                  }}
                  onKeyDown={async (e) => {
                    const target = e.target as HTMLTextAreaElement;
                    const val = target.value;
                    if (e.key === " ") {
                      const words = val.split(" ");
                      const lastWord = words[words.length - 1];
                      if (lastWord && !/[\u0B80-\u0BFF]/.test(lastWord)) {
                        e.preventDefault();
                        const result = await transliterateLastWord(val);
                        handleChange("description", result + " ");
                      }
                    } else if (e.key === "Enter") {
                      e.preventDefault();
                      const result = await transliterateLastWord(val);
                      handleChange("description", result);
                      setTimeout(() => {
                        const formElement = target.form;
                        if (formElement) {
                          const idx = Array.prototype.indexOf.call(formElement, target);
                          if (idx > -1 && idx + 1 < formElement.elements.length) {
                            (formElement.elements[idx + 1] as HTMLElement)?.focus();
                          }
                        }
                      }, 50);
                    }
                  }}
                />
              </div>

              {/* Submit */}
              <div className="mt-4 field-animate" style={{ animationDelay: "0.4s" }}>
                <button type="submit" className="btn-premium">
                  <span>🧾</span> ரசீது உருவாக்கு — Generate Receipt
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Footer hint */}
        <p className="text-center mt-3" style={{ color: "var(--text-muted)", fontSize: "0.78rem" }}>
          Tanglish → Tamil: Space key transliterates • Enter key moves to next field
        </p>
      </div>
    </div>
  );
}
