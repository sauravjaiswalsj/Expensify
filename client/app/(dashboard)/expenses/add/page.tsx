"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { expenseApi } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import {
  EXPENSE_CATEGORIES,
  PAYMENT_TYPES,
  CURRENCIES,
  type Currency,
} from "@/types";

interface FormState {
  amount: string;
  currency: Currency;
  category: string;
  description: string;
  paymentType: string;
  date: string;
}

function today() {
  return new Date().toISOString().split("T")[0];
}

const TAGS = ["#Q2_REPORT", "#CLIENT_MEETING"];

export default function AddExpensePage() {
  const router = useRouter();
  const { username } = useAuth();

  const [form, setForm] = useState<FormState>({
    amount: "",
    currency: "USD",
    category: "",
    description: "",
    paymentType: "",
    date: today(),
  });

  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [apiError, setApiError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tags, setTags] = useState<string[]>(TAGS);

  function update<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  }

  function validate(): boolean {
    const newErrors: Partial<Record<keyof FormState, string>> = {};
    const amt = parseFloat(form.amount);

    if (!form.amount || isNaN(amt) || amt <= 0) {
      newErrors.amount = "Amount must be greater than 0";
    }
    if (!form.category) newErrors.category = "Please select a category";
    if (!form.paymentType) newErrors.paymentType = "Please select a payment type";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setApiError("");
    setSuccess(false);
    if (!validate()) return;
    setLoading(true);

    try {
      await expenseApi.add({
        username: username ?? undefined,
        amount: parseFloat(form.amount),
        currency: form.currency,
        category: form.category,
        description: form.description,
        paymentType: form.paymentType,
        date: form.date ? new Date(form.date).toISOString() : undefined,
      });
      setSuccess(true);
      setForm({
        amount: "",
        currency: "USD",
        category: "",
        description: "",
        paymentType: "",
        date: today(),
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to add expense";
      if (msg.includes("401")) {
        setApiError("Your session has expired. Please sign in again.");
      } else if (msg.includes("400")) {
        setApiError("Invalid expense data. Check the amount is greater than 0.");
      } else {
        setApiError(msg);
      }
    } finally {
      setLoading(false);
    }
  }

  const selectedCurrency = CURRENCIES.find((c) => c.code === form.currency);

  return (
    <div className="animate-fade-in-up">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-6">
        <Link href="/dashboard" className="text-xs font-semibold tracking-wider uppercase transition-colors"
          style={{ color: "var(--text-muted)" }}>
          Dashboard
        </Link>
        <span className="text-xs" style={{ color: "var(--text-muted)" }}>›</span>
        <span className="text-xs font-semibold tracking-wider uppercase" style={{ color: "var(--accent-cyan)" }}>
          Add Expense
        </span>
      </div>

      {/* Main form card */}
      <div className="card p-6 lg:p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
              Create New Expense
            </h1>
            <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
              AI will automatically categorize your receipt upon upload.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="px-4 py-2.5 text-sm font-semibold tracking-wider uppercase transition-colors"
              style={{ color: "var(--text-muted)" }}
              onClick={() => router.back()}
              disabled={loading}
            >
              Save as Draft
            </button>
            <button
              type="button"
              onClick={(e) => handleSubmit(e as unknown as FormEvent)}
              className="btn-primary px-6"
              disabled={loading}
            >
              {loading ? "Posting..." : "Post Expense"}
            </button>
          </div>
        </div>

        {/* Alerts */}
        {apiError && (
          <div className="mb-6 px-4 py-3 rounded-lg text-sm" style={{
            backgroundColor: "rgba(239, 68, 68, 0.1)",
            border: "1px solid rgba(239, 68, 68, 0.2)",
            color: "#fca5a5",
          }}>
            {apiError}
          </div>
        )}
        {success && (
          <div className="mb-6 px-4 py-3 rounded-lg text-sm flex items-center gap-2" style={{
            backgroundColor: "rgba(34, 197, 94, 0.1)",
            border: "1px solid rgba(34, 197, 94, 0.2)",
            color: "#4ade80",
          }}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Expense recorded successfully!
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Amount + Currency Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <label className="label">Amount</label>
              <div className="relative">
                <span
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-semibold"
                  style={{ color: "var(--text-muted)" }}
                >
                  {selectedCurrency?.symbol}
                </span>
                <input
                  className="input-field pl-10 text-2xl font-bold h-14"
                  type="number"
                  placeholder="0.00"
                  min="0.01"
                  step="0.01"
                  value={form.amount}
                  onChange={(e) => update("amount", e.target.value)}
                  style={{ fontSize: "1.5rem" }}
                />
              </div>
              {errors.amount && <p className="error-msg">{errors.amount}</p>}
            </div>
            <div>
              <label className="label">Currency</label>
              <select
                className="input-field h-14 text-base font-medium"
                value={form.currency}
                onChange={(e) => update("currency", e.target.value as Currency)}
              >
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code} style={{
                    backgroundColor: "var(--bg-secondary)",
                    color: "var(--text-primary)",
                  }}>
                    {c.code} - {c.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Category, Payment Method, Date row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="label">Category</label>
              <select
                className="input-field"
                value={form.category}
                onChange={(e) => update("category", e.target.value)}
              >
                <option value="" style={{ backgroundColor: "var(--bg-secondary)", color: "var(--text-muted)" }}>
                  Select category
                </option>
                {EXPENSE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat} style={{
                    backgroundColor: "var(--bg-secondary)",
                    color: "var(--text-primary)",
                  }}>
                    {cat}
                  </option>
                ))}
              </select>
              {errors.category && <p className="error-msg">{errors.category}</p>}
            </div>
            <div>
              <label className="label">Payment Method</label>
              <select
                className="input-field"
                value={form.paymentType}
                onChange={(e) => update("paymentType", e.target.value)}
              >
                <option value="" style={{ backgroundColor: "var(--bg-secondary)", color: "var(--text-muted)" }}>
                  Select method
                </option>
                {PAYMENT_TYPES.map((type) => (
                  <option key={type} value={type} style={{
                    backgroundColor: "var(--bg-secondary)",
                    color: "var(--text-primary)",
                  }}>
                    {type}
                  </option>
                ))}
              </select>
              {errors.paymentType && <p className="error-msg">{errors.paymentType}</p>}
            </div>
            <div>
              <label className="label">Date</label>
              <input
                className="input-field"
                type="date"
                value={form.date}
                onChange={(e) => update("date", e.target.value)}
                max={today()}
              />
            </div>
          </div>

          {/* Description + Receipt Upload */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <label className="label">Description</label>
              <textarea
                className="input-field resize-none h-32"
                placeholder="Add context for this expense..."
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
              />
            </div>
            <div>
              <label className="label">Attach Receipt</label>
              <div className="upload-zone h-32">
                <svg className="w-8 h-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"
                  style={{ color: "var(--accent-teal)" }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
                </svg>
                <p className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
                  Click to upload or drag & drop
                </p>
                <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                  Supports PDF, PNG, JPG (Max 10MB)
                </p>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap items-center gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="tag-pill"
                style={{
                  backgroundColor: "rgba(34, 211, 238, 0.12)",
                  color: "var(--accent-cyan)",
                }}
              >
                {tag}
                <button
                  type="button"
                  className="ml-1.5 opacity-60 hover:opacity-100"
                  onClick={() => setTags(tags.filter((t) => t !== tag))}
                >
                  ×
                </button>
              </span>
            ))}
            <button
              type="button"
              className="tag-pill transition-colors"
              style={{
                backgroundColor: "var(--bg-elevated)",
                border: "1px solid var(--border-primary)",
                color: "var(--text-muted)",
              }}
            >
              + Add Tag
            </button>
          </div>
        </form>

        {/* AI Intelligence Banner */}
        <div className="ai-banner mt-8">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: "rgba(34, 211, 238, 0.15)" }}>
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" style={{ color: "var(--accent-cyan)" }}>
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          </div>
          <div>
            <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
              AI Intelligence Active
            </p>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              Upload a receipt and we&apos;ll automatically fill the amount, date, and category fields for you.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        {/* Compliance Check */}
        <div className="rounded-xl p-5 flex items-start gap-3"
          style={{
            backgroundColor: "var(--bg-secondary)",
            borderLeft: "3px solid var(--accent-teal)",
          }}>
          <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: "rgba(20, 184, 166, 0.15)" }}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"
              style={{ color: "var(--accent-teal)" }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <div>
            <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>Compliance Check</p>
            <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
              This expense follows the Travel & Reimbursement policy for Q2 2024.
            </p>
          </div>
        </div>

        {/* Saving Tip */}
        <div className="rounded-xl p-5 flex items-start gap-3"
          style={{
            backgroundColor: "var(--bg-secondary)",
            borderLeft: "3px solid var(--accent-amber)",
          }}>
          <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: "rgba(245, 158, 11, 0.15)" }}>
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"
              style={{ color: "var(--accent-amber)" }}>
              <path d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7z"/>
            </svg>
          </div>
          <div>
            <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>Saving Tip</p>
            <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
              Similar transactions from &apos;Office Supplies&apos; are typically 12% lower at other vendors.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
