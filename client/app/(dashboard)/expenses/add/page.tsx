"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
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

export default function AddExpensePage() {
  const router = useRouter();
  const { username } = useAuth();

  const [form, setForm] = useState<FormState>({
    amount: "",
    currency: "INR",
    category: "",
    description: "",
    paymentType: "",
    date: today(),
  });

  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [apiError, setApiError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

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
        currency: "INR",
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
    <div>
      {/* Header */}
      <div className="mb-8 flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors"
        >
          <svg className="w-4 h-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Add Expense</h1>
          <p className="text-sm text-slate-500 mt-0.5">Record a new transaction</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-2">
          <div className="card p-6">
            {apiError && (
              <div className="mb-5 px-4 py-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm">
                {apiError}
              </div>
            )}
            {success && (
              <div className="mb-5 px-4 py-3 rounded-lg bg-green-50 border border-green-100 text-green-700 text-sm flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Expense recorded successfully!
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Amount + Currency */}
              <div>
                <label className="label">Amount</label>
                <div className="flex gap-2">
                  <select
                    className="input-field w-32 flex-shrink-0"
                    value={form.currency}
                    onChange={(e) => update("currency", e.target.value as Currency)}
                  >
                    {CURRENCIES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.symbol} {c.code}
                      </option>
                    ))}
                  </select>
                  <div className="flex-1 relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">
                      {selectedCurrency?.symbol}
                    </span>
                    <input
                      className="input-field pl-8"
                      type="number"
                      placeholder="0.00"
                      min="0.01"
                      step="0.01"
                      value={form.amount}
                      onChange={(e) => update("amount", e.target.value)}
                    />
                  </div>
                </div>
                {errors.amount && <p className="error-msg">{errors.amount}</p>}
              </div>

              {/* Category */}
              <div>
                <label className="label">Category</label>
                <select
                  className="input-field"
                  value={form.category}
                  onChange={(e) => update("category", e.target.value)}
                >
                  <option value="">Select a category</option>
                  {EXPENSE_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                {errors.category && <p className="error-msg">{errors.category}</p>}
              </div>

              {/* Payment Type */}
              <div>
                <label className="label">Payment method</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {PAYMENT_TYPES.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => update("paymentType", type)}
                      className={`py-2 px-3 rounded-lg text-xs font-medium border transition-all ${
                        form.paymentType === type
                          ? "bg-brand-600 border-brand-600 text-white"
                          : "bg-white border-slate-200 text-slate-600 hover:border-brand-400 hover:text-brand-600"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
                {errors.paymentType && (
                  <p className="error-msg">{errors.paymentType}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="label">
                  Description{" "}
                  <span className="text-slate-400 font-normal">(optional)</span>
                </label>
                <textarea
                  className="input-field resize-none h-20"
                  placeholder="e.g. Lunch at Cafe Coffee Day"
                  value={form.description}
                  onChange={(e) => update("description", e.target.value)}
                />
              </div>

              {/* Date */}
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

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => router.back()}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? "Saving…" : "Save expense"}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Preview Card */}
        <div className="lg:col-span-1">
          <div className="card p-5 sticky top-8">
            <h3 className="text-sm font-semibold text-slate-700 mb-4">Preview</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-500">Amount</span>
                <span className="text-base font-bold text-slate-900">
                  {selectedCurrency?.symbol}
                  {form.amount ? parseFloat(form.amount).toFixed(2) : "0.00"}{" "}
                  <span className="text-xs font-normal text-slate-400">
                    {form.currency}
                  </span>
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-500">Category</span>
                <span className="text-xs font-medium text-slate-700">
                  {form.category || "—"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-500">Payment</span>
                <span className="text-xs font-medium text-slate-700">
                  {form.paymentType || "—"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-500">Date</span>
                <span className="text-xs font-medium text-slate-700">
                  {form.date
                    ? new Date(form.date).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })
                    : "—"}
                </span>
              </div>
              {form.description && (
                <div className="pt-2 border-t border-slate-100">
                  <span className="text-xs text-slate-500 block mb-1">Note</span>
                  <p className="text-xs text-slate-700">{form.description}</p>
                </div>
              )}
            </div>
          </div>

          {/* Tips */}
          <div className="mt-4 p-4 rounded-xl bg-brand-50 border border-brand-100">
            <p className="text-xs font-semibold text-brand-700 mb-2">Tips</p>
            <ul className="space-y-1.5">
              <li className="flex items-start gap-1.5 text-xs text-brand-600">
                <span className="mt-0.5">•</span>
                Track expenses daily for accurate insights
              </li>
              <li className="flex items-start gap-1.5 text-xs text-brand-600">
                <span className="mt-0.5">•</span>
                Use descriptive notes to remember context
              </li>
              <li className="flex items-start gap-1.5 text-xs text-brand-600">
                <span className="mt-0.5">•</span>
                Choose the right category for better analytics
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
