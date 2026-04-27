"use client";

import { useMemo, type ReactNode } from "react";
import Link from "next/link";
import { useExpenseData } from "@/lib/expense-data-context";
import { CURRENCIES, type Expense, type Currency } from "@/types";

/* ─── helpers ───────────────────────────────────────────────────── */

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

const CATEGORY_COLORS = [
  "var(--accent-blue)",
  "var(--accent-green)",
  "var(--accent-teal)",
  "#1e293b",
  "var(--accent-violet)",
  "var(--accent-amber)",
];

const MONTH_LABELS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

function getCategoryBadgeClass(category: string): string {
  const lower = category.toLowerCase();
  if (lower.includes("software") || lower.includes("saas") || lower.includes("utilities"))
    return "badge badge-software";
  if (lower.includes("marketing") || lower.includes("sales") || lower.includes("entertainment"))
    return "badge badge-marketing";
  if (lower.includes("travel") || lower.includes("transport")) return "badge badge-travel";
  if (lower.includes("food") || lower.includes("dining")) return "badge badge-food";
  if (lower.includes("health") || lower.includes("medical")) return "badge badge-health";
  return "badge badge-other";
}

function getTransactionIcon(category: string): ReactNode {
  const lower = category.toLowerCase();
  if (lower.includes("software") || lower.includes("saas") || lower.includes("utilities")) {
    return (
      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: "rgba(59, 130, 246, 0.15)" }}>
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: "#60a5fa" }}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
        </svg>
      </div>
    );
  }
  if (lower.includes("marketing") || lower.includes("sales")) {
    return (
      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: "rgba(139, 92, 246, 0.15)" }}>
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: "#a78bfa" }}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"/>
        </svg>
      </div>
    );
  }
  if (lower.includes("travel") || lower.includes("transport")) {
    return (
      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: "rgba(34, 197, 94, 0.15)" }}>
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: "#4ade80" }}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
        </svg>
      </div>
    );
  }
  return (
    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
      style={{ backgroundColor: "rgba(245, 158, 11, 0.15)" }}>
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: "#fbbf24" }}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
      </svg>
    </div>
  );
}

/* ─── component ─────────────────────────────────────────────────── */

export default function DashboardPage() {
  const { expenses, loading, error, refresh: loadExpenses } = useExpenseData();

  /* ── derived data ── */

  const totalSpend = useMemo(
    () => expenses.reduce((sum, e) => sum + (e.amount || 0), 0),
    [expenses]
  );

  const displayCurrency = useMemo(() => {
    const currencies = Array.from(new Set(expenses.map((e) => e.currency).filter(Boolean))) as Currency[];
    return currencies.length === 1 ? currencies[0] : ("USD" as Currency);
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

  const maxTrendValue = useMemo(
    () => monthlyTrend.reduce((max, p) => Math.max(max, p.amount), 0),
    [monthlyTrend]
  );

  const categorySplit = useMemo(
    () => buildSplitData(expenses, (e) => e.category, 4),
    [expenses]
  );

  const paymentSplit = useMemo(
    () => buildSplitData(expenses, (e) => e.paymentType, 4),
    [expenses]
  );

  const sortedExpenses = useMemo(
    () =>
      [...expenses].sort((a, b) => {
        const dateA = parseExpenseDate(a)?.getTime() ?? 0;
        const dateB = parseExpenseDate(b)?.getTime() ?? 0;
        return dateB - dateA;
      }),
    [expenses]
  );

  const monthlySpend = useMemo(() => {
    const now = new Date();
    const thisMonth = now.getMonth();
    return expenses
      .filter((e) => {
        const d = parseExpenseDate(e);
        return d && d.getMonth() === thisMonth;
      })
      .reduce((sum, e) => sum + (e.amount || 0), 0);
  }, [expenses]);

  const pendingCount = useMemo(() => Math.min(expenses.length, 12), [expenses]);

  /* ── render ── */

  return (
    <div className="animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: "var(--text-primary)" }}>
            Financial Overview
          </h1>
          <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
            Real-time intelligence for your business expenditures.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium hover:opacity-80 transition-opacity"
            style={{
              backgroundColor: "var(--bg-elevated)",
              border: "1px solid var(--border-primary)",
              color: "var(--text-secondary)",
            }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
            Last 30 Days
          </button>
          <Link href="/expenses/add"
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold hover:opacity-80 transition-opacity"
            style={{
              backgroundColor: "var(--accent-coral)",
              color: "white",
            }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
            </svg>
            Export Report
          </Link>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="mb-6 rounded-xl p-4 text-sm" style={{
          backgroundColor: "rgba(239, 68, 68, 0.1)",
          border: "1px solid rgba(239, 68, 68, 0.2)",
          color: "#fca5a5",
        }}>
          <p>{error}</p>
          <button
            onClick={() => void loadExpenses()}
            className="mt-2 inline-flex items-center rounded-lg px-3 py-1.5 text-xs font-medium hover:opacity-80 transition-opacity"
            style={{ border: "1px solid rgba(239, 68, 68, 0.3)", color: "#fca5a5" }}
          >
            Retry
          </button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Total Spend */}
        <div className="stat-card animate-fade-in-up">
          <p className="text-[11px] font-semibold tracking-wider uppercase mb-3" style={{ color: "var(--text-muted)" }}>
            Total Spend
          </p>
          <p className="text-2xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>
            {loading ? "..." : formatCurrency(totalSpend, displayCurrency)}
          </p>
          <div className="flex items-center gap-1.5">
            <span className="flex items-center gap-0.5 text-xs font-semibold" style={{ color: "var(--accent-green)" }}>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
              </svg>
              +12.5%
            </span>
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>vs last month</span>
          </div>
          {/* Decorative icon */}
          <div className="absolute top-4 right-4 opacity-10">
            <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: "var(--text-primary)" }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
            </svg>
          </div>
        </div>

        {/* Monthly Spend */}
        <div className="stat-card animate-fade-in-up delay-75">
          <p className="text-[11px] font-semibold tracking-wider uppercase mb-3" style={{ color: "var(--text-muted)" }}>
            Monthly Spend
          </p>
          <p className="text-2xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>
            {loading ? "..." : formatCurrency(monthlySpend, displayCurrency)}
          </p>
          <div className="flex items-center gap-1.5">
            <span className="flex items-center gap-0.5 text-xs font-semibold" style={{ color: "var(--accent-coral)" }}>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"/>
              </svg>
              -4.2%
            </span>
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>vs target</span>
          </div>
          <div className="absolute top-4 right-4 opacity-10">
            <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: "var(--text-primary)" }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
        </div>

        {/* AI Efficiency */}
        <div className="stat-card animate-fade-in-up delay-150">
          <p className="text-[11px] font-semibold tracking-wider uppercase mb-3" style={{ color: "var(--text-muted)" }}>
            AI Efficiency
          </p>
          <div className="flex items-center gap-2 mb-3">
            <p className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>94.8%</p>
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" style={{ color: "var(--accent-cyan)" }}>
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: "94.8%", backgroundColor: "var(--accent-cyan)" }} />
          </div>
          <div className="absolute top-4 right-4 opacity-10">
            <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24" style={{ color: "var(--accent-cyan)" }}>
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          </div>
        </div>

        {/* Pending Syncs */}
        <div className="stat-card animate-fade-in-up delay-225">
          <p className="text-[11px] font-semibold tracking-wider uppercase mb-3" style={{ color: "var(--text-muted)" }}>
            Pending Syncs
          </p>
          <p className="text-2xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>
            {loading ? "..." : `${pendingCount} Items`}
          </p>
          <Link
            href="/expenses/add"
            className="text-xs font-semibold flex items-center gap-1 hover:opacity-80 transition-opacity"
            style={{ color: "var(--accent-cyan)" }}
          >
            Ready for review
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
            </svg>
          </Link>
          <div className="absolute top-4 right-4 opacity-10">
            <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: "var(--text-primary)" }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
          </div>
        </div>
      </div>

      {/* Monthly Trend & Category Split */}
      <div className="grid gap-4 lg:grid-cols-3 mb-8">
        {/* Monthly Trend Chart */}
        <div className="card p-6 lg:col-span-2 animate-fade-in-up delay-150">
          <div className="flex items-center justify-between mb-1">
            <div>
              <h2 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>Monthly Trend</h2>
              <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>Revenue vs Expenditure Analysis</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "var(--chart-revenue)" }} />
                <span className="text-xs" style={{ color: "var(--text-secondary)" }}>Revenue</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "var(--chart-spending)" }} />
                <span className="text-xs" style={{ color: "var(--text-secondary)" }}>Spending</span>
              </div>
            </div>
          </div>

          {loading && (
            <div className="mt-8 flex items-center justify-center h-48">
              <span className="text-sm" style={{ color: "var(--text-muted)" }}>Loading chart...</span>
            </div>
          )}

          {!loading && monthlyTrend.length === 0 && (
            <div className="mt-8 flex items-center justify-center h-48">
              <span className="text-sm" style={{ color: "var(--text-muted)" }}>No data available for chart.</span>
            </div>
          )}

          {!loading && monthlyTrend.length > 0 && (
            <div className="mt-6">
              <div className="flex items-end gap-3 h-52">
                {monthlyTrend.map((point, i) => {
                  const height = maxTrendValue > 0 ? Math.max((point.amount / maxTrendValue) * 100, 6) : 0;
                  const revenueHeight = height * 0.7;
                  return (
                    <div key={point.label} className="flex-1 flex flex-col items-center gap-1"
                      style={{ animationDelay: `${i * 50}ms` }}>
                      <div className="w-full flex items-end justify-center gap-0.5 h-44">
                        {/* Revenue bar */}
                        <div
                          className="flex-1 max-w-3 rounded-t hover:opacity-80 transition-opacity"
                          style={{
                            height: `${revenueHeight}%`,
                            backgroundColor: "var(--chart-revenue)",
                            animationDelay: `${i * 80}ms`,
                          }}
                          title={`Revenue: ${formatCurrency(point.amount * 0.7, displayCurrency)}`}
                        />
                        {/* Spending bar */}
                        <div
                          className="flex-1 max-w-3 rounded-t hover:opacity-80 transition-opacity"
                          style={{
                            height: `${height}%`,
                            backgroundColor: "var(--chart-spending)",
                            animationDelay: `${i * 80 + 40}ms`,
                          }}
                          title={`Spending: ${formatCurrency(point.amount, displayCurrency)}`}
                        />
                      </div>
                      <span className="text-[10px] font-medium mt-1" style={{ color: "var(--text-muted)" }}>
                        {point.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Category Split + Payment Method */}
        <div className="card p-6 animate-fade-in-up delay-225">
          <h2 className="text-lg font-bold mb-1" style={{ color: "var(--text-primary)" }}>Category Split</h2>

          {!loading && categorySplit.length === 0 && (
            <p className="mt-4 text-sm" style={{ color: "var(--text-muted)" }}>No category data.</p>
          )}

          <div className="mt-4 space-y-4">
            {categorySplit.map((item, index) => (
              <div key={`${item.label}-${index}`}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>{item.label}</span>
                  <span className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>{item.percentage.toFixed(0)}%</span>
                </div>
                <div className="progress-track" style={{ height: "6px" }}>
                  <div
                    className="progress-fill"
                    style={{
                      width: `${item.percentage}%`,
                      backgroundColor: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Payment Method */}
          <div className="mt-8 pt-6" style={{ borderTop: "1px solid var(--border-primary)" }}>
            <div className="flex items-center justify-between mb-4">
              <p className="text-[11px] font-semibold tracking-wider uppercase" style={{ color: "var(--text-muted)" }}>
                Payment Method
              </p>
              <button className="text-xs font-semibold hover:opacity-80 transition-opacity" style={{ color: "var(--accent-cyan)" }}>View All</button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {paymentSplit.slice(0, 2).map((item, index) => (
                <div
                  key={`pay-${item.label}-${index}`}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-white/5 transition-opacity"
                  style={{
                    backgroundColor: "var(--bg-elevated)",
                    border: "1px solid var(--border-primary)",
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{
                      backgroundColor: index === 0
                        ? "rgba(59, 130, 246, 0.15)"
                        : "rgba(34, 211, 238, 0.15)",
                    }}
                  >
                    {index === 0 ? (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"
                        style={{ color: "#60a5fa" }}>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                          d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"
                        style={{ color: "#22d3ee" }}>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                      </svg>
                    )}
                  </div>
                  <span className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
                    {item.label} ({item.percentage.toFixed(0)}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="card p-6 animate-fade-in-up delay-300">
        <div className="flex items-center justify-between mb-1">
          <div>
            <h2 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Recent Transactions</h2>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
              Showing the latest {Math.min(sortedExpenses.length, 5)} transactions for this period.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => void loadExpenses()}
              className="text-xs font-semibold transition-colors"
              style={{ color: "var(--accent-cyan)" }}
              disabled={loading}
            >
              {loading ? "Refreshing..." : "View All Activity"}
            </button>
            <Link href="/expenses/add" className="fab w-10 h-10">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
              </svg>
            </Link>
          </div>
        </div>

        {!loading && sortedExpenses.length === 0 && (
          <div className="mt-6 rounded-xl p-6 text-center" style={{
            border: "2px dashed var(--border-secondary)",
            color: "var(--text-muted)",
          }}>
            <svg className="w-10 h-10 mx-auto mb-3 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
            </svg>
            <p className="text-sm font-medium">No transactions found</p>
            <p className="text-xs mt-1">Start by adding your first expense.</p>
          </div>
        )}

        {sortedExpenses.length > 0 && (
          <div className="mt-4">
            {/* Table header */}
            <div className="grid grid-cols-12 gap-4 px-4 py-3 mb-1">
              <span className="col-span-4 table-header">Transaction</span>
              <span className="col-span-2 table-header">Category</span>
              <span className="col-span-2 table-header">Date</span>
              <span className="col-span-2 table-header text-right">Amount</span>
              <span className="col-span-2 table-header text-right">Status</span>
            </div>

            {/* Table rows */}
            <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--border-primary)" }}>
              {sortedExpenses.slice(0, 5).map((expense) => {
                const date = parseExpenseDate(expense);
                const isCompleted = Math.random() > 0.3; // Demo status
                return (
                  <div
                    key={expense._id ?? `${expense.category}-${expense.amount}-${expense.createdAt ?? ""}`}
                    className="table-row grid grid-cols-12 gap-4"
                  >
                    {/* Transaction */}
                    <div className="col-span-4 flex items-center gap-3">
                      {getTransactionIcon(expense.category)}
                      <div className="min-w-0">
                        <p className="text-sm font-semibold truncate" style={{ color: "var(--text-primary)" }}>
                          {expense.category || "Uncategorized"}
                        </p>
                        <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>
                          {expense.description || "No description"}
                        </p>
                      </div>
                    </div>

                    {/* Category badge */}
                    <div className="col-span-2 flex items-center">
                      <span className={getCategoryBadgeClass(expense.category)}>
                        {(expense.category || "Other").split(" ")[0].toUpperCase().slice(0, 10)}
                      </span>
                    </div>

                    {/* Date */}
                    <div className="col-span-2 flex items-center">
                      <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
                        {date
                          ? date.toLocaleDateString("en-US", {
                              month: "short",
                              day: "2-digit",
                              year: "numeric",
                            })
                          : "—"}
                      </span>
                    </div>

                    {/* Amount */}
                    <div className="col-span-2 flex items-center justify-end">
                      <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                        {formatCurrency(expense.amount || 0, expense.currency || "USD")}
                      </span>
                    </div>

                    {/* Status */}
                    <div className="col-span-2 flex items-center justify-end gap-1.5">
                      <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{
                          backgroundColor: isCompleted
                            ? "var(--accent-green)"
                            : "var(--accent-amber)",
                        }}
                      />
                      <span
                        className="text-xs font-semibold uppercase tracking-wide"
                        style={{
                          color: isCompleted
                            ? "var(--accent-green)"
                            : "var(--accent-amber)",
                        }}
                      >
                        {isCompleted ? "Completed" : "Pending"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
