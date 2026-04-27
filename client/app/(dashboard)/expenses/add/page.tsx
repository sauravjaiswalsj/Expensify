"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { expenseApi } from "@/lib/api";
import { useExpenseData } from "@/lib/expense-data-context";
import {
  CURRENCIES,
  EXPENSE_CATEGORIES,
  PAYMENT_TYPES,
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

type FormErrors = Partial<Record<keyof FormState, string>>;

const TAGS = ["#MONTHLY_REVIEW", "#TEAM_SPEND"];
const DRAFT_STORAGE_KEY = "add-expense-draft";

function today() {
  return new Date().toISOString().split("T")[0];
}

function getInitialForm(): FormState {
  return {
    amount: "",
    currency: "INR",
    category: "",
    description: "",
    paymentType: "",
    date: today(),
  };
}

export default function AddExpensePage() {
  const router = useRouter();
  const { refresh: refreshExpenses } = useExpenseData();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<FormState>(getInitialForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [apiMessage, setApiMessage] = useState("");
  const [apiMessageTone, setApiMessageTone] = useState<"error" | "success" | "info">("info");
  const [loading, setLoading] = useState(false);
  const [tags, setTags] = useState<string[]>(TAGS);
  const [receiptName, setReceiptName] = useState("");
  const [tagInput, setTagInput] = useState("");

  useEffect(() => {
    try {
      const savedDraft = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (!savedDraft) return;
      const parsed = JSON.parse(savedDraft) as Partial<FormState> & { tags?: string[] };
      setForm((current) => ({
        ...current,
        amount: parsed.amount ?? current.amount,
        currency: parsed.currency ?? current.currency,
        category: parsed.category ?? current.category,
        description: parsed.description ?? current.description,
        paymentType: parsed.paymentType ?? current.paymentType,
        date: parsed.date ?? current.date,
      }));
      if (Array.isArray(parsed.tags) && parsed.tags.length > 0) {
        setTags(parsed.tags);
      }
    } catch {
      // ignore bad draft payloads
    }
  }, []);

  function update<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function setBanner(message: string, tone: "error" | "success" | "info") {
    setApiMessage(message);
    setApiMessageTone(tone);
  }

  function validate() {
    const nextErrors: FormErrors = {};
    const amount = parseFloat(form.amount);

    if (!form.amount || Number.isNaN(amount) || amount <= 0) {
      nextErrors.amount = "Enter an amount greater than 0.";
    }
    if (!form.category) {
      nextErrors.category = "Choose a category.";
    }
    if (!form.paymentType) {
      nextErrors.paymentType = "Choose a payment method.";
    }
    if (!form.date) {
      nextErrors.date = "Pick the expense date.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setApiMessage("");

    if (!validate()) return;
    setLoading(true);

    try {
      await expenseApi.add({
        amount: parseFloat(form.amount),
        currency: form.currency,
        category: form.category,
        description: form.description.trim(),
        paymentType: form.paymentType,
        date: form.date ? new Date(`${form.date}T12:00:00`).toISOString() : undefined,
      });

      localStorage.removeItem(DRAFT_STORAGE_KEY);
      setForm(getInitialForm());
      setReceiptName("");
      setTagInput("");
      setBanner("Expense recorded successfully.", "success");
      router.push("/dashboard");
      void refreshExpenses();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to add expense";
      if (msg.includes("401")) {
        setBanner("Your session has expired. Please sign in again.", "error");
      } else if (msg.includes("400")) {
        setBanner("The expense payload is invalid. Check the required fields and amount.", "error");
      } else {
        setBanner(msg, "error");
      }
    } finally {
      setLoading(false);
    }
  }

  function handleSaveDraft() {
    try {
      localStorage.setItem(
        DRAFT_STORAGE_KEY,
        JSON.stringify({
          ...form,
          tags,
          savedAt: new Date().toISOString(),
        })
      );
      setBanner("Draft saved locally on this device.", "info");
    } catch {
      setBanner("Unable to save the draft on this device.", "error");
    }
  }

  function handleAddTag() {
    const trimmed = tagInput.trim();
    if (!trimmed) return;
    const normalized = trimmed.startsWith("#") ? trimmed : `#${trimmed}`;
    if (!tags.includes(normalized)) {
      setTags((current) => [...current, normalized]);
    }
    setTagInput("");
  }

  const selectedCurrency = CURRENCIES.find((currency) => currency.code === form.currency);
  const bannerStyles =
    apiMessageTone === "error"
      ? {
          backgroundColor: "color-mix(in srgb, var(--accent-red) 12%, var(--bg-secondary))",
          borderColor: "color-mix(in srgb, var(--accent-red) 22%, var(--border-primary))",
          color: "var(--text-primary)",
        }
      : apiMessageTone === "success"
        ? {
            backgroundColor: "color-mix(in srgb, var(--accent-green) 12%, var(--bg-secondary))",
            borderColor: "color-mix(in srgb, var(--accent-green) 22%, var(--border-primary))",
            color: "var(--text-primary)",
          }
        : {
            backgroundColor: "color-mix(in srgb, var(--accent-cyan) 10%, var(--bg-secondary))",
            borderColor: "color-mix(in srgb, var(--accent-cyan) 20%, var(--border-primary))",
            color: "var(--text-primary)",
          };

  return (
    <div className="animate-fade-in-up space-y-6 pb-12">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em]">
        <Link href="/dashboard" style={{ color: "var(--text-muted)" }}>
          Dashboard
        </Link>
        <span style={{ color: "var(--text-muted)" }}>•</span>
        <span style={{ color: "var(--accent-cyan)" }}>Add expense</span>
      </div>

      <section
        className="surface-panel overflow-hidden p-0"
        style={{
          background:
            "linear-gradient(140deg, color-mix(in srgb, var(--bg-secondary) 96%, transparent), color-mix(in srgb, var(--bg-surface) 88%, transparent))",
        }}
      >
        <div className="grid gap-6 lg:grid-cols-[1.45fr_0.9fr]">
          <div className="p-6 sm:p-8">
            <div className="space-y-4">
              <div
                className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em]"
                style={{
                  borderColor: "color-mix(in srgb, var(--accent-cyan) 28%, var(--border-primary))",
                  color: "var(--accent-cyan)",
                  backgroundColor: "color-mix(in srgb, var(--accent-cyan) 10%, transparent)",
                }}
              >
                Expense capture
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl" style={{ color: "var(--text-primary)" }}>
                  Record a new expense
                </h1>
                <p className="mt-2 max-w-2xl text-sm sm:text-base" style={{ color: "var(--text-secondary)" }}>
                  Log the essentials quickly, keep the data clean, and push it straight into your dashboard without
                  breaking the flow.
                </p>
              </div>
            </div>
          </div>

          <div
            className="flex flex-col justify-between gap-4 border-t p-6 sm:p-8 lg:border-l lg:border-t-0"
            style={{ borderColor: "var(--border-primary)" }}
          >
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em]" style={{ color: "var(--text-muted)" }}>
                Posting rules
              </p>
              <div className="mt-4 space-y-3">
                {[
                  "Amount must be greater than zero.",
                  "Category and payment method are required.",
                  "The authenticated user is now attached server-side when posting.",
                ].map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl border px-4 py-3 text-sm"
                    style={{
                      borderColor: "var(--border-primary)",
                      backgroundColor: "color-mix(in srgb, var(--bg-surface) 76%, transparent)",
                      color: "var(--text-secondary)",
                    }}
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              <button type="button" onClick={handleSaveDraft} className="btn-secondary">
                Save draft
              </button>
              <button type="submit" form="add-expense-form" className="btn-primary px-6" disabled={loading}>
                {loading ? "Posting..." : "Post expense"}
              </button>
            </div>
          </div>
        </div>
      </section>

      {apiMessage && (
        <div className="rounded-2xl border p-4 text-sm" style={bannerStyles}>
          {apiMessage}
        </div>
      )}

      <form id="add-expense-form" onSubmit={handleSubmit} className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <div className="space-y-6">
          <section className="surface-panel p-6 sm:p-7">
            <div className="mb-6">
              <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
                Transaction details
              </h2>
              <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
                Fill in the core fields for the expense you want to track.
              </p>
            </div>

            <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
              <div>
                <label className="label">Amount</label>
                <div className="relative">
                  <span
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-semibold"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {selectedCurrency?.symbol}
                  </span>
                  <input
                    className="input-field h-16 pl-11 text-2xl font-bold"
                    type="number"
                    placeholder="0.00"
                    min="0.01"
                    step="0.01"
                    value={form.amount}
                    onChange={(e) => update("amount", e.target.value)}
                  />
                </div>
                {errors.amount && <p className="error-msg">{errors.amount}</p>}
              </div>

              <div>
                <label className="label">Currency</label>
                <select
                  className="input-field h-16 text-base font-medium"
                  value={form.currency}
                  onChange={(e) => update("currency", e.target.value as Currency)}
                >
                  {CURRENCIES.map((currency) => (
                    <option
                      key={currency.code}
                      value={currency.code}
                      style={{ backgroundColor: "var(--bg-secondary)", color: "var(--text-primary)" }}
                    >
                      {currency.code} - {currency.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <div>
                <label className="label">Category</label>
                <select className="input-field" value={form.category} onChange={(e) => update("category", e.target.value)}>
                  <option value="" style={{ backgroundColor: "var(--bg-secondary)", color: "var(--text-muted)" }}>
                    Select category
                  </option>
                  {EXPENSE_CATEGORIES.map((category) => (
                    <option
                      key={category}
                      value={category}
                      style={{ backgroundColor: "var(--bg-secondary)", color: "var(--text-primary)" }}
                    >
                      {category}
                    </option>
                  ))}
                </select>
                {errors.category && <p className="error-msg">{errors.category}</p>}
              </div>

              <div>
                <label className="label">Payment method</label>
                <select
                  className="input-field"
                  value={form.paymentType}
                  onChange={(e) => update("paymentType", e.target.value)}
                >
                  <option value="" style={{ backgroundColor: "var(--bg-secondary)", color: "var(--text-muted)" }}>
                    Select method
                  </option>
                  {PAYMENT_TYPES.map((paymentType) => (
                    <option
                      key={paymentType}
                      value={paymentType}
                      style={{ backgroundColor: "var(--bg-secondary)", color: "var(--text-primary)" }}
                    >
                      {paymentType}
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
                {errors.date && <p className="error-msg">{errors.date}</p>}
              </div>
            </div>

            <div className="mt-4">
              <label className="label">Description</label>
              <textarea
                className="input-field min-h-[140px] resize-none"
                placeholder="Add useful context for this transaction..."
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
              />
            </div>
          </section>

          <section className="surface-panel p-6 sm:p-7">
            <div className="mb-5">
              <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
                Labels and attachments
              </h2>
              <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
                Optional metadata for receipts, reviews, and internal context.
              </p>
            </div>

            <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
              <div>
                <label className="label">Tags</label>
                <div className="mb-3 flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold"
                      style={{
                        backgroundColor: "color-mix(in srgb, var(--accent-cyan) 12%, transparent)",
                        color: "var(--accent-cyan)",
                      }}
                    >
                      {tag}
                      <button type="button" onClick={() => setTags((current) => current.filter((item) => item !== tag))}>
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    className="input-field h-10 text-sm"
                    placeholder="new-tag"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                  />
                  <button type="button" className="btn-secondary whitespace-nowrap px-4 py-2" onClick={handleAddTag}>
                    Add tag
                  </button>
                </div>
              </div>

              <div>
                <label className="label">Attach receipt</label>
                <button
                  type="button"
                  className="flex min-h-[162px] w-full flex-col items-center justify-center rounded-2xl border border-dashed px-6 text-center transition"
                  style={{
                    borderColor: "var(--border-secondary)",
                    backgroundColor: "color-mix(in srgb, var(--bg-surface) 72%, transparent)",
                  }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <svg className="mb-3 h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: "var(--accent-teal)" }}>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.6}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                    Click to upload
                  </p>
                  <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>
                    PDF, PNG, JPG up to 10MB
                  </p>
                  {receiptName && (
                    <p className="mt-3 text-xs font-semibold" style={{ color: "var(--accent-cyan)" }}>
                      Selected: {receiptName}
                    </p>
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    setReceiptName(file?.name ?? "");
                  }}
                />
              </div>
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="surface-panel p-6">
            <div className="mb-4">
              <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
                Live summary
              </h2>
              <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
                Quick preview before you post.
              </p>
            </div>

            <div className="space-y-4">
              <div
                className="rounded-2xl border p-4"
                style={{
                  borderColor: "var(--border-primary)",
                  backgroundColor: "color-mix(in srgb, var(--bg-surface) 76%, transparent)",
                }}
              >
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em]" style={{ color: "var(--text-muted)" }}>
                  Amount
                </p>
                <p className="mt-2 text-3xl font-bold" style={{ color: "var(--text-primary)" }}>
                  {form.amount ? `${selectedCurrency?.symbol ?? ""}${form.amount}` : `${selectedCurrency?.symbol ?? ""}0.00`}
                </p>
              </div>

              {[
                { label: "Category", value: form.category || "Not selected" },
                { label: "Payment method", value: form.paymentType || "Not selected" },
                { label: "Date", value: form.date || "Not selected" },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between gap-3 text-sm">
                  <span style={{ color: "var(--text-muted)" }}>{item.label}</span>
                  <span className="font-semibold text-right" style={{ color: "var(--text-primary)" }}>
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section className="surface-panel p-6">
            <div className="mb-4 flex items-start gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl"
                style={{ backgroundColor: "color-mix(in srgb, var(--accent-cyan) 15%, transparent)" }}
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" style={{ color: "var(--accent-cyan)" }}>
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
                  Workflow notes
                </h2>
                <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
                  Clean captures make the dashboard and analytics a lot more useful later.
                </p>
              </div>
            </div>

            <div className="space-y-3 text-sm" style={{ color: "var(--text-secondary)" }}>
              <div
                className="rounded-2xl border p-4"
                style={{
                  borderColor: "var(--border-primary)",
                  backgroundColor: "color-mix(in srgb, var(--bg-surface) 74%, transparent)",
                }}
              >
                Use specific descriptions for easier recall during monthly reviews.
              </div>
              <div
                className="rounded-2xl border p-4"
                style={{
                  borderColor: "var(--border-primary)",
                  backgroundColor: "color-mix(in srgb, var(--bg-surface) 74%, transparent)",
                }}
              >
                Receipt uploads are visual only right now, but the page keeps the affordance ready.
              </div>
            </div>
          </section>
        </div>
      </form>
    </div>
  );
}
