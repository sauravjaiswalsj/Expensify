"use client";

import { useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { useExpenseData } from "@/lib/expense-data-context";
import { useAuth } from "@/lib/auth-context";
import { useTheme } from "@/lib/theme-context";
import { CURRENCIES, type Expense, type Currency } from "@/types";

function parseExpenseDate(expense: Expense): Date | null {
  const raw = expense.date || expense.createdAt || expense.updatedAt;
  if (!raw) return null;
  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function formatCurrency(amount: number, currency: Currency): string {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    const symbol = CURRENCIES.find((c) => c.code === currency)?.symbol ?? currency;
    return `${symbol}${amount.toFixed(2)}`;
  }
}

type SplitEntry = {
  label: string;
  amount: number;
  percentage: number;
};

function buildSplitData(
  source: Expense[],
  labelSelector: (expense: Expense) => string | undefined,
  maxItems = 5
): SplitEntry[] {
  const totals = new Map<string, number>();
  source.forEach((expense) => {
    const key = labelSelector(expense)?.trim() || "Unspecified";
    totals.set(key, (totals.get(key) ?? 0) + (expense.amount || 0));
  });

  const sorted = Array.from(totals.entries())
    .map(([label, amount]) => ({ label, amount }))
    .sort((a, b) => b.amount - a.amount);

  const visible = sorted.slice(0, maxItems);
  const remaining = sorted.slice(maxItems).reduce((sum, item) => sum + item.amount, 0);
  if (remaining > 0) {
    visible.push({ label: "Other", amount: remaining });
  }

  const total = visible.reduce((sum, item) => sum + item.amount, 0);
  return visible.map((item) => ({
    ...item,
    percentage: total > 0 ? (item.amount / total) * 100 : 0,
  }));
}

const MONTH_LABELS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
const SPLIT_COLORS = [
  "var(--accent-blue)",
  "var(--accent-emerald)",
  "var(--accent-violet)",
  "var(--accent-amber)",
  "var(--accent-pink)",
  "var(--text-muted)",
];

function getTransactionIcon(category: string): ReactNode {
  const lower = category.toLowerCase();
  if (lower.includes("software") || lower.includes("saas") || lower.includes("utilities")) {
    return (
      <div
        className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl"
        style={{ backgroundColor: "color-mix(in srgb, var(--accent-blue) 14%, transparent)" }}
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: "var(--accent-blue)" }}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.6}
            d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
      </div>
    );
  }
  if (lower.includes("marketing") || lower.includes("sales")) {
    return (
      <div
        className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl"
        style={{ backgroundColor: "color-mix(in srgb, var(--accent-violet) 14%, transparent)" }}
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: "var(--accent-violet)" }}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
        </svg>
      </div>
    );
  }
  if (lower.includes("travel") || lower.includes("transport")) {
    return (
      <div
        className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl"
        style={{ backgroundColor: "color-mix(in srgb, var(--accent-green) 14%, transparent)" }}
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: "var(--accent-green)" }}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
        </svg>
      </div>
    );
  }
  return (
    <div
      className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl"
      style={{ backgroundColor: "color-mix(in srgb, var(--accent-amber) 14%, transparent)" }}
    >
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: "var(--accent-amber)" }}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.6}
          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
        />
      </svg>
    </div>
  );
}

type SummaryCardProps = {
  title: string;
  value: string;
  description: string;
  icon: ReactNode;
  accent: string;
};

function SummaryCard({ title, value, description, icon, accent }: SummaryCardProps) {
  return (
    <div
      className="surface-panel relative overflow-hidden p-5"
      style={{
        background:
          "linear-gradient(180deg, color-mix(in srgb, var(--bg-secondary) 96%, transparent), color-mix(in srgb, var(--bg-surface) 92%, transparent))",
      }}
    >
      <div
        className="absolute inset-x-0 top-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }}
      />
      <div
        className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl"
        style={{ backgroundColor: `color-mix(in srgb, ${accent} 16%, transparent)`, color: accent }}
      >
        {icon}
      </div>
      <div className="space-y-1">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em]" style={{ color: "var(--text-muted)" }}>
          {title}
        </p>
        <p className="text-3xl font-bold leading-none" style={{ color: "var(--text-primary)" }}>
          {value}
        </p>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          {description}
        </p>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { expenses: rawExpenses, loading, error, refresh: loadExpenses } = useExpenseData();
  const { username } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const [period, setPeriod] = useState<"7D" | "30D" | "90D" | "ALL" | "CUSTOM">("30D");
  const [customStartDate, setCustomStartDate] = useState(() => {
    const start = new Date();
    start.setDate(start.getDate() - 30);
    return start.toISOString().split("T")[0];
  });
  const [customEndDate, setCustomEndDate] = useState(() => new Date().toISOString().split("T")[0]);

  const expenses = useMemo(() => {
    if (period === "ALL") return rawExpenses;
    let startDate = new Date(0);
    let endDate = new Date();

    if (period === "CUSTOM") {
      startDate = customStartDate ? new Date(`${customStartDate}T00:00:00`) : new Date(0);
      endDate = customEndDate ? new Date(`${customEndDate}T23:59:59`) : new Date();
    } else {
      let days = 30;
      if (period === "7D") days = 7;
      if (period === "90D") days = 90;
      startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    }

    return rawExpenses.filter((e) => {
      const d = parseExpenseDate(e);
      return d && d >= startDate && d <= endDate;
    });
  }, [rawExpenses, period, customStartDate, customEndDate]);

  const totalSpend = useMemo(() => expenses.reduce((sum, e) => sum + (e.amount || 0), 0), [expenses]);

  const displayCurrency = useMemo(() => {
    const currencies = Array.from(new Set(expenses.map((e) => e.currency).filter(Boolean))) as Currency[];
    return currencies.length === 1 ? currencies[0] : ("INR" as Currency);
  }, [expenses]);

  const monthlyTrend = useMemo(() => {
    const monthly = new Map<number, number>();
    expenses.forEach((expense) => {
      const date = parseExpenseDate(expense);
      if (!date) return;
      const month = date.getMonth();
      monthly.set(month, (monthly.get(month) ?? 0) + (expense.amount || 0));
    });

    return Array.from(monthly.entries())
      .sort(([a], [b]) => a - b)
      .map(([month, amount]) => ({
        label: MONTH_LABELS[month],
        amount,
        month,
      }));
  }, [expenses]);

  const maxTrendValue = useMemo(() => monthlyTrend.reduce((max, p) => Math.max(max, p.amount), 0), [monthlyTrend]);

  const categorySplit = useMemo(() => buildSplitData(expenses, (e) => e.category, 4), [expenses]);
  const paymentSplit = useMemo(() => buildSplitData(expenses, (e) => e.paymentType, 4), [expenses]);

  const sortedExpenses = useMemo(
    () =>
      [...expenses].sort((a, b) => {
        const dateA = parseExpenseDate(a)?.getTime() ?? 0;
        const dateB = parseExpenseDate(b)?.getTime() ?? 0;
        return dateB - dateA;
      }),
    [expenses]
  );

  const numTransactions = expenses.length;
  const numCategories = Array.from(new Set(expenses.map((e) => e.category).filter(Boolean))).length;
  const averageSpend = useMemo(() => (numTransactions > 0 ? totalSpend / numTransactions : 0), [totalSpend, numTransactions]);

  const periodLabel = useMemo(() => {
    if (period === "7D") return "Last 7 days";
    if (period === "30D") return "Last 30 days";
    if (period === "90D") return "Last 90 days";
    if (period === "ALL") return "All time";
    if (!customStartDate || !customEndDate) return "Custom range";
    return `${customStartDate} to ${customEndDate}`;
  }, [period, customStartDate, customEndDate]);

  const latestExpenseDate = sortedExpenses[0] ? parseExpenseDate(sortedExpenses[0]) : null;
  const displayName = username || "there";

  return (
    <div className="animate-fade-in-up space-y-6 pb-12">
      <section
        className="surface-panel overflow-hidden p-0"
        style={{
          background:
            "linear-gradient(135deg, color-mix(in srgb, var(--bg-secondary) 96%, transparent), color-mix(in srgb, var(--bg-surface) 88%, transparent))",
        }}
      >
        <div className="grid gap-6 lg:grid-cols-[1.55fr_1fr]">
          <div className="p-6 sm:p-8">
            <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-3">
                <div
                  className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em]"
                  style={{
                    borderColor: "color-mix(in srgb, var(--accent-cyan) 28%, var(--border-primary))",
                    color: "var(--accent-cyan)",
                    backgroundColor: "color-mix(in srgb, var(--accent-cyan) 10%, transparent)",
                  }}
                >
                  Finance overview
                </div>
                <div>
                  <h1 className="text-3xl font-bold tracking-tight sm:text-4xl" style={{ color: "var(--text-primary)" }}>
                    Good day, <span style={{ color: "var(--accent-cyan)" }}>{displayName}</span>
                  </h1>
                  <p className="mt-2 max-w-xl text-sm sm:text-base" style={{ color: "var(--text-secondary)" }}>
                    A sharper look at your spending patterns, category mix, and recent activity for {periodLabel.toLowerCase()}.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={toggleTheme}
                className="inline-flex h-11 items-center gap-3 rounded-xl border px-4 text-sm font-semibold transition"
                style={{
                  borderColor: "var(--border-primary)",
                  backgroundColor: "color-mix(in srgb, var(--bg-elevated) 82%, transparent)",
                  color: "var(--text-primary)",
                }}
                title={`Switch to ${isDark ? "light" : "dark"} mode`}
              >
                <span
                  className="flex h-7 w-7 items-center justify-center rounded-lg"
                  style={{
                    backgroundColor: isDark
                      ? "color-mix(in srgb, var(--accent-amber) 15%, transparent)"
                      : "color-mix(in srgb, var(--accent-violet) 14%, transparent)",
                    color: isDark ? "var(--accent-amber)" : "var(--accent-violet)",
                  }}
                >
                  {isDark ? (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.8}
                        d="M12 3v2.25M18.364 5.636l-1.591 1.591M21 12h-2.25M18.364 18.364l-1.591-1.591M12 18.75V21M7.227 16.773l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
                      />
                    </svg>
                  ) : (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.8}
                        d="M21 12.79A9 9 0 1111.21 3c0 .46.03.92.08 1.36a7 7 0 009.71 8.43c.02.01.02 0 0 0z"
                      />
                    </svg>
                  )}
                </span>
                <span>{theme === "dark" ? "Dark mode" : "Light mode"}</span>
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div
                className="rounded-2xl border p-4"
                style={{
                  borderColor: "var(--border-primary)",
                  backgroundColor: "color-mix(in srgb, var(--bg-surface) 72%, transparent)",
                }}
              >
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em]" style={{ color: "var(--text-muted)" }}>
                  Active period
                </p>
                <p className="mt-2 text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
                  {periodLabel}
                </p>
              </div>
              <div
                className="rounded-2xl border p-4"
                style={{
                  borderColor: "var(--border-primary)",
                  backgroundColor: "color-mix(in srgb, var(--bg-surface) 72%, transparent)",
                }}
              >
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em]" style={{ color: "var(--text-muted)" }}>
                  Most recent activity
                </p>
                <p className="mt-2 text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
                  {latestExpenseDate
                    ? latestExpenseDate.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "No entries yet"}
                </p>
              </div>
              <div
                className="rounded-2xl border p-4"
                style={{
                  borderColor: "var(--border-primary)",
                  backgroundColor: "color-mix(in srgb, var(--bg-surface) 72%, transparent)",
                }}
              >
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em]" style={{ color: "var(--text-muted)" }}>
                  Expense cadence
                </p>
                <p className="mt-2 text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
                  {numTransactions > 0 ? `${numTransactions} tracked` : "Start logging"}
                </p>
              </div>
            </div>
          </div>

          <div
            className="flex flex-col justify-between gap-5 border-t p-6 sm:p-8 lg:border-l lg:border-t-0"
            style={{ borderColor: "var(--border-primary)" }}
          >
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em]" style={{ color: "var(--text-muted)" }}>
                Period controls
              </p>
              <p className="mt-2 text-sm" style={{ color: "var(--text-secondary)" }}>
                Filter your dashboard metrics without leaving the page.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {(["7D", "30D", "90D", "ALL", "CUSTOM"] as const).map((p) => {
                const isActive = period === p;
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPeriod(p)}
                    className="rounded-xl px-4 py-2 text-xs font-semibold tracking-[0.12em] transition"
                    style={{
                      background: isActive
                        ? "var(--hero-gradient)"
                        : "color-mix(in srgb, var(--bg-elevated) 78%, transparent)",
                      border: `1px solid ${isActive ? "transparent" : "var(--border-primary)"}`,
                      color: isActive ? "#ffffff" : "var(--text-secondary)",
                    }}
                  >
                    {p}
                  </button>
                );
              })}
            </div>

            {period === "CUSTOM" && (
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="label">Start date</label>
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="input-field py-2"
                    max={customEndDate || undefined}
                  />
                </div>
                <div>
                  <label className="label">End date</label>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="input-field py-2"
                    min={customStartDate || undefined}
                    max={new Date().toISOString().split("T")[0]}
                  />
                </div>
              </div>
            )}

            <div
              className="rounded-2xl border p-4"
              style={{
                borderColor: "var(--border-primary)",
                backgroundColor: "color-mix(in srgb, var(--bg-surface) 80%, transparent)",
              }}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.16em]" style={{ color: "var(--text-muted)" }}>
                Snapshot
              </p>
              <p className="mt-2 text-sm" style={{ color: "var(--text-secondary)" }}>
                {numTransactions > 0
                  ? `${formatCurrency(totalSpend, displayCurrency)} across ${numTransactions} transactions in ${numCategories || 0} categories.`
                  : "No expense data yet for the selected period."}
              </p>
            </div>
          </div>
        </div>
      </section>

      {error && (
        <div
          className="rounded-2xl border p-4 text-sm"
          style={{
            backgroundColor: "color-mix(in srgb, var(--accent-red) 10%, var(--bg-secondary))",
            borderColor: "color-mix(in srgb, var(--accent-red) 20%, var(--border-primary))",
            color: "var(--text-primary)",
          }}
        >
          <p>{error}</p>
          <button
            onClick={() => void loadExpenses()}
            className="mt-3 rounded-xl px-3 py-2 text-xs font-semibold transition"
            style={{
              backgroundColor: "color-mix(in srgb, var(--bg-secondary) 90%, transparent)",
              border: "1px solid var(--border-primary)",
              color: "var(--text-primary)",
            }}
          >
            Retry loading expenses
          </button>
        </div>
      )}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          title="Total spend"
          value={loading ? "..." : formatCurrency(totalSpend, displayCurrency)}
          description={periodLabel}
          accent="var(--accent-blue)"
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.7}
                d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
              />
            </svg>
          }
        />
        <SummaryCard
          title="Average spend"
          value={loading ? "..." : formatCurrency(averageSpend, displayCurrency)}
          description="Per transaction"
          accent="var(--accent-green)"
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <SummaryCard
          title="Categories"
          value={loading ? "..." : `${numCategories}`}
          description="Distinct categories tracked"
          accent="var(--accent-violet)"
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.7}
                d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
              />
            </svg>
          }
        />
        <SummaryCard
          title="Transactions"
          value={loading ? "..." : `${numTransactions}`}
          description="Entries in this period"
          accent="var(--accent-amber)"
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          }
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="surface-panel p-6">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
                Quick actions
              </h2>
              <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
                Move through the most common finance workflows.
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Link
              href="/expenses/add"
              className="rounded-2xl border p-4 transition"
              style={{
                borderColor: "var(--border-primary)",
                backgroundColor: "color-mix(in srgb, var(--bg-surface) 78%, transparent)",
              }}
            >
              <div className="flex items-start gap-4">
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-2xl"
                  style={{ background: "var(--hero-gradient)", color: "#ffffff" }}
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v12m6-6H6" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                    Add expense
                  </p>
                  <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
                    Record a new transaction with category and payment details.
                  </p>
                </div>
              </div>
            </Link>

            <Link
              href="/analytics"
              className="rounded-2xl border p-4 transition"
              style={{
                borderColor: "var(--border-primary)",
                backgroundColor: "color-mix(in srgb, var(--bg-surface) 78%, transparent)",
              }}
            >
              <div className="flex items-start gap-4">
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-2xl"
                  style={{
                    backgroundColor: "color-mix(in srgb, var(--accent-violet) 15%, transparent)",
                    color: "var(--accent-violet)",
                  }}
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 17l6-6 4 4 8-8M14 7h7v7" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                    Open analytics
                  </p>
                  <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
                    Jump into longer-range patterns and distribution views.
                  </p>
                </div>
              </div>
            </Link>
          </div>
        </div>

        <div className="surface-panel p-6">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
                Spending mix
              </h2>
              <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
                Which areas are driving the most spend in this period.
              </p>
            </div>
          </div>

          {!loading && categorySplit.length === 0 ? (
            <div className="flex h-[180px] items-center justify-center rounded-2xl border" style={{ borderColor: "var(--border-primary)" }}>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                No category data to show.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {categorySplit.map((item, index) => (
                <div key={`${item.label}-${index}`} className="space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                        {item.label}
                      </p>
                      <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                        {formatCurrency(item.amount, displayCurrency)}
                      </p>
                    </div>
                    <span className="text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>
                      {item.percentage.toFixed(0)}%
                    </span>
                  </div>
                  <div
                    className="h-2.5 overflow-hidden rounded-full"
                    style={{ backgroundColor: "color-mix(in srgb, var(--bg-elevated) 88%, transparent)" }}
                  >
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${item.percentage}%`,
                        backgroundColor: SPLIT_COLORS[index % SPLIT_COLORS.length],
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.35fr_0.65fr]">
        <div className="surface-panel p-6">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
                Monthly trend
              </h2>
              <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
                Total spend per month for the selected period.
              </p>
            </div>
            <div
              className="rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em]"
              style={{
                borderColor: "var(--border-primary)",
                color: "var(--text-secondary)",
                backgroundColor: "color-mix(in srgb, var(--bg-surface) 78%, transparent)",
              }}
            >
              {periodLabel}
            </div>
          </div>

          {!loading && monthlyTrend.length === 0 ? (
            <div className="flex h-[260px] items-center justify-center rounded-2xl border" style={{ borderColor: "var(--border-primary)" }}>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                No data available for the selected period.
              </p>
            </div>
          ) : (
            <div className="grid h-[260px] grid-cols-[repeat(auto-fit,minmax(44px,1fr))] items-end gap-3">
              {monthlyTrend.map((point, index) => {
                const height = maxTrendValue > 0 ? Math.max((point.amount / maxTrendValue) * 100, 8) : 0;
                return (
                  <div key={`${point.label}-${index}`} className="flex h-full flex-col justify-end gap-3">
                    <div className="flex-1 rounded-2xl border px-2 py-3" style={{ borderColor: "var(--border-primary)" }}>
                      <div className="flex h-full items-end justify-center">
                        <div
                          className="w-full max-w-[34px] rounded-2xl transition-all"
                          style={{
                            height: `${height}%`,
                            minHeight: height > 0 ? "18px" : "0px",
                            background:
                              "linear-gradient(180deg, color-mix(in srgb, var(--accent-cyan) 85%, white), color-mix(in srgb, var(--accent-blue) 88%, transparent))",
                          }}
                          title={`${point.label}: ${formatCurrency(point.amount, displayCurrency)}`}
                        />
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-[11px] font-semibold tracking-[0.14em]" style={{ color: "var(--text-primary)" }}>
                        {point.label}
                      </p>
                      <p className="mt-1 text-[11px]" style={{ color: "var(--text-muted)" }}>
                        {formatCurrency(point.amount, displayCurrency)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="surface-panel p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
              Payment method split
            </h2>
            <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
              Distribution by payment type.
            </p>
          </div>

          {!loading && paymentSplit.length === 0 ? (
            <div className="flex h-[260px] items-center justify-center rounded-2xl border" style={{ borderColor: "var(--border-primary)" }}>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                No payment method data to show.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {paymentSplit.map((item, index) => (
                <div
                  key={`pm-${index}`}
                  className="rounded-2xl border p-4"
                  style={{
                    borderColor: "var(--border-primary)",
                    backgroundColor: "color-mix(in srgb, var(--bg-surface) 76%, transparent)",
                  }}
                >
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <span
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: SPLIT_COLORS[index % SPLIT_COLORS.length] }}
                      />
                      <span className="truncate text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                        {item.label}
                      </span>
                    </div>
                    <span className="text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>
                      {item.percentage.toFixed(0)}%
                    </span>
                  </div>
                  <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                    {formatCurrency(item.amount, displayCurrency)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="surface-panel p-0 overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b px-6 py-5" style={{ borderColor: "var(--border-primary)" }}>
          <div>
            <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
              Recent expenses
            </h2>
            <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
              Your latest recorded transactions, sorted by newest first.
            </p>
          </div>
          <button
            onClick={() => void loadExpenses()}
            disabled={loading}
            className="rounded-xl border px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] transition"
            style={{
              borderColor: "var(--border-primary)",
              backgroundColor: "color-mix(in srgb, var(--bg-surface) 78%, transparent)",
              color: "var(--text-secondary)",
            }}
          >
            Refresh
          </button>
        </div>

        {!loading && sortedExpenses.length === 0 ? (
          <div className="p-10 text-center text-sm" style={{ color: "var(--text-muted)" }}>
            No recent expenses found.
          </div>
        ) : (
          <div>
            {sortedExpenses.slice(0, 10).map((expense) => {
              const date = parseExpenseDate(expense);
              return (
                <div
                  key={expense._id ?? `${expense.amount}-${expense.createdAt}`}
                  className="flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between"
                  style={{ borderTop: "1px solid var(--border-primary)" }}
                >
                  <div className="flex min-w-0 items-center gap-4">
                    {getTransactionIcon(expense.category)}
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold sm:text-base" style={{ color: "var(--text-primary)" }}>
                        {expense.category || "Uncategorized"}
                      </p>
                      <p className="mt-1 truncate text-sm" style={{ color: "var(--text-muted)" }}>
                        {date
                          ? date.toLocaleDateString("en-US", {
                              month: "short",
                              day: "2-digit",
                              year: "numeric",
                            })
                          : ""}
                        {expense.description ? ` • ${expense.description}` : ""}
                      </p>
                    </div>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-sm font-bold sm:text-base" style={{ color: "var(--text-primary)" }}>
                      {formatCurrency(expense.amount || 0, expense.currency || "INR")}
                    </p>
                    <p className="mt-1 text-xs uppercase tracking-[0.12em]" style={{ color: "var(--text-muted)" }}>
                      {expense.paymentType || "Payment type unspecified"}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
