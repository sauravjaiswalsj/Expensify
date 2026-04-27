"use client";

import { useMemo } from "react";
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

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const CATEGORY_COLORS = [
  "var(--accent-blue)",
  "var(--accent-green)",
  "var(--accent-teal)",
  "var(--accent-violet)",
  "var(--accent-amber)",
  "var(--accent-pink)",
  "var(--accent-coral)",
  "var(--accent-cyan)",
];

type SplitEntry = {
  label: string;
  amount: number;
  percentage: number;
};

function buildSplitData(
  source: Expense[],
  labelSelector: (expense: Expense) => string | undefined,
  maxItems = 6
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
  if (remaining > 0) visible.push({ label: "Other", amount: remaining });

  const total = visible.reduce((sum, item) => sum + item.amount, 0);
  return visible.map((item) => ({
    ...item,
    percentage: total > 0 ? (item.amount / total) * 100 : 0,
  }));
}

/* ─── component ─────────────────────────────────────────────────── */

export default function AnalyticsPage() {
  const { expenses, loading, error, refresh: loadExpenses } = useExpenseData();

  /* ── derived data ── */

  const displayCurrency = useMemo(() => {
    const currencies = Array.from(new Set(expenses.map((e) => e.currency).filter(Boolean))) as Currency[];
    return currencies.length === 1 ? currencies[0] : ("INR" as Currency);
  }, [expenses]);

  const totalSpend = useMemo(
    () => expenses.reduce((sum, e) => sum + (e.amount || 0), 0),
    [expenses]
  );

  const avgTransaction = useMemo(
    () => (expenses.length > 0 ? totalSpend / expenses.length : 0),
    [totalSpend, expenses.length]
  );

  const highestSingle = useMemo(
    () => expenses.reduce((max, e) => Math.max(max, e.amount || 0), 0),
    [expenses]
  );

  // Monthly trend
  const monthlyTrend = useMemo(() => {
    const monthly = new Map<number, number>();
    expenses.forEach((expense) => {
      const date = parseExpenseDate(expense);
      if (!date) return;
      monthly.set(date.getMonth(), (monthly.get(date.getMonth()) ?? 0) + (expense.amount || 0));
    });
    return Array.from({ length: 12 }, (_, i) => ({
      label: MONTH_LABELS[i],
      amount: monthly.get(i) ?? 0,
    }));
  }, [expenses]);

  const maxMonthly = useMemo(
    () => monthlyTrend.reduce((max, p) => Math.max(max, p.amount), 0),
    [monthlyTrend]
  );

  // Day of week distribution
  const dayDistribution = useMemo(() => {
    const days = new Map<number, number>();
    expenses.forEach((expense) => {
      const date = parseExpenseDate(expense);
      if (!date) return;
      const day = (date.getDay() + 6) % 7; // Mon=0 ... Sun=6
      days.set(day, (days.get(day) ?? 0) + (expense.amount || 0));
    });
    return Array.from({ length: 7 }, (_, i) => ({
      label: DAY_LABELS[i],
      amount: days.get(i) ?? 0,
    }));
  }, [expenses]);

  const maxDay = useMemo(
    () => dayDistribution.reduce((max, p) => Math.max(max, p.amount), 0),
    [dayDistribution]
  );

  // Category split
  const categorySplit = useMemo(
    () => buildSplitData(expenses, (e) => e.category, 6),
    [expenses]
  );

  // Payment method split
  const paymentSplit = useMemo(
    () => buildSplitData(expenses, (e) => e.paymentType, 6),
    [expenses]
  );

  // Top expenses
  const topExpenses = useMemo(
    () => [...expenses].sort((a, b) => (b.amount || 0) - (a.amount || 0)).slice(0, 5),
    [expenses]
  );

  // Monthly comparison (this month vs last month)
  const monthComparison = useMemo(() => {
    const now = new Date();
    const thisMonth = now.getMonth();
    const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;

    const thisMonthTotal = expenses
      .filter((e) => {
        const d = parseExpenseDate(e);
        return d && d.getMonth() === thisMonth;
      })
      .reduce((sum, e) => sum + (e.amount || 0), 0);

    const lastMonthTotal = expenses
      .filter((e) => {
        const d = parseExpenseDate(e);
        return d && d.getMonth() === lastMonth;
      })
      .reduce((sum, e) => sum + (e.amount || 0), 0);

    const change = lastMonthTotal > 0
      ? ((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100
      : 0;

    return { thisMonthTotal, lastMonthTotal, change };
  }, [expenses]);

  // Currency distribution
  const currencyDist = useMemo(() => {
    const dist = new Map<string, number>();
    expenses.forEach((e) => {
      const key = e.currency || "Unknown";
      dist.set(key, (dist.get(key) ?? 0) + 1);
    });
    return Array.from(dist.entries())
      .map(([label, count]) => ({ label, count, pct: expenses.length > 0 ? (count / expenses.length) * 100 : 0 }))
      .sort((a, b) => b.count - a.count);
  }, [expenses]);

  /* ── render ── */

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 rounded-full animate-spin"
            style={{ borderColor: "var(--accent-cyan)", borderTopColor: "transparent" }} />
          <span className="text-sm" style={{ color: "var(--text-muted)" }}>Loading analytics...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 gap-4">
        <div>
          <h1 className="section-heading">
            Analytics
          </h1>
          <p className="section-subtitle">
            Deep insights into your spending patterns and financial health.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void loadExpenses()}
          className="btn-secondary flex items-center gap-2 self-start"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh Data
        </button>
      </div>

      {error && (
        <div className="mb-6 rounded-xl p-4 text-sm" style={{
          backgroundColor: "rgba(239, 68, 68, 0.1)",
          border: "1px solid rgba(239, 68, 68, 0.2)",
          color: "#fca5a5",
        }}>
          {error}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          {
            label: "Total Spent",
            value: formatCurrency(totalSpend, displayCurrency),
            sub: `${expenses.length} transactions`,
            color: "var(--accent-blue)",
            icon: (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ),
          },
          {
            label: "Average Transaction",
            value: formatCurrency(avgTransaction, displayCurrency),
            sub: "Per expense",
            color: "var(--accent-green)",
            icon: (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            ),
          },
          {
            label: "Highest Expense",
            value: formatCurrency(highestSingle, displayCurrency),
            sub: "Single transaction",
            color: "var(--accent-coral)",
            icon: (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            ),
          },
          {
            label: "Month-over-Month",
            value: `${monthComparison.change >= 0 ? "+" : ""}${monthComparison.change.toFixed(1)}%`,
            sub: `${formatCurrency(monthComparison.thisMonthTotal, displayCurrency)} this month`,
            color: monthComparison.change <= 0 ? "var(--accent-green)" : "var(--accent-coral)",
            icon: monthComparison.change <= 0 ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            ),
          },
        ].map((kpi, i) => (
          <div key={kpi.label} className={`stat-card animate-fade-in-up delay-${i * 75}`}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-[11px] font-semibold tracking-wider uppercase" style={{ color: "var(--text-muted)" }}>
                {kpi.label}
              </p>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `color-mix(in srgb, ${kpi.color} 15%, transparent)`, color: kpi.color }}>
                {kpi.icon}
              </div>
            </div>
            <p className="text-2xl font-bold mb-1" style={{ color: "var(--text-primary)" }}>{kpi.value}</p>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>{kpi.sub}</p>
          </div>
        ))}
      </div>

      {/* Monthly Spending & Day Distribution */}
      <div className="grid gap-4 lg:grid-cols-3 mb-8">
        {/* Monthly Spending Bar Chart */}
        <div className="chart-card lg:col-span-2 animate-fade-in-up delay-150">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>Monthly Spending</h2>
              <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>Expense distribution across months</p>
            </div>
          </div>

          {expenses.length === 0 ? (
            <div className="h-48 flex items-center justify-center">
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>No data available</p>
            </div>
          ) : (
            <div className="flex items-end gap-2 h-52">
              {monthlyTrend.map((point, i) => {
                const height = maxMonthly > 0 ? Math.max((point.amount / maxMonthly) * 100, 2) : 2;
                const hasData = point.amount > 0;
                return (
                  <div key={point.label} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full flex items-end justify-center h-44">
                      <div
                        className="w-full max-w-7 rounded-t-md hover:opacity-80 cursor-pointer transition-[height]"
                        style={{
                          height: `${height}%`,
                          backgroundColor: hasData ? CATEGORY_COLORS[i % CATEGORY_COLORS.length] : "var(--bg-hover)",
                          opacity: hasData ? 1 : 0.3,
                        }}
                        title={hasData ? formatCurrency(point.amount, displayCurrency) : "No data"}
                      />
                    </div>
                    <span className="text-[10px] font-medium" style={{ color: hasData ? "var(--text-secondary)" : "var(--text-muted)" }}>
                      {point.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Day of Week Distribution */}
        <div className="chart-card animate-fade-in-up delay-225">
          <h2 className="text-lg font-bold mb-1" style={{ color: "var(--text-primary)" }}>Spending by Day</h2>
          <p className="text-xs mb-6" style={{ color: "var(--text-muted)" }}>When you spend the most</p>

          <div className="space-y-3">
            {dayDistribution.map((day, i) => {
              const width = maxDay > 0 ? Math.max((day.amount / maxDay) * 100, 2) : 2;
              return (
                <div key={day.label} className="flex items-center gap-3">
                  <span className="text-xs font-medium w-8" style={{ color: "var(--text-secondary)" }}>{day.label}</span>
                  <div className="flex-1 progress-track" style={{ height: "8px" }}>
                    <div className="progress-fill" style={{
                      width: `${width}%`,
                      backgroundColor: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
                    }} />
                  </div>
                  <span className="text-xs font-medium w-20 text-right" style={{ color: "var(--text-primary)" }}>
                    {formatCurrency(day.amount, displayCurrency)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Category & Payment Breakdown */}
      <div className="grid gap-4 lg:grid-cols-2 mb-8">
        {/* Category Breakdown */}
        <div className="chart-card animate-fade-in-up delay-300">
          <h2 className="text-lg font-bold mb-1" style={{ color: "var(--text-primary)" }}>Category Breakdown</h2>
          <p className="text-xs mb-6" style={{ color: "var(--text-muted)" }}>Where your money goes</p>

          {categorySplit.length === 0 ? (
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>No data</p>
          ) : (
            <>
              {/* Donut-style visualization */}
              <div className="flex items-center gap-6 mb-6">
                <div className="relative w-32 h-32 flex-shrink-0">
                  <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                    {(() => {
                      let offset = 0;
                      return categorySplit.map((item, i) => {
                        const dash = item.percentage;
                        const gap = 100 - dash;
                        const el = (
                          <circle
                            key={item.label}
                            cx="18" cy="18" r="14"
                            fill="none"
                            stroke={CATEGORY_COLORS[i % CATEGORY_COLORS.length]}
                            strokeWidth="4"
                            strokeDasharray={`${dash} ${gap}`}
                            strokeDashoffset={`${-offset}`}
                            strokeLinecap="round"
                            className="transition-[stroke-dashoffset] duration-700"
                          />
                        );
                        offset += dash;
                        return el;
                      });
                    })()}
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
                      {categorySplit.length}
                    </span>
                    <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>Categories</span>
                  </div>
                </div>
                <div className="flex-1 space-y-2">
                  {categorySplit.map((item, i) => (
                    <div key={item.label} className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }} />
                      <span className="text-xs flex-1 truncate" style={{ color: "var(--text-secondary)" }}>{item.label}</span>
                      <span className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>{item.percentage.toFixed(0)}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bar breakdown */}
              <div className="space-y-3">
                {categorySplit.map((item, i) => (
                  <div key={`bar-${item.label}`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>{item.label}</span>
                      <span className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>
                        {formatCurrency(item.amount, displayCurrency)}
                      </span>
                    </div>
                    <div className="progress-track" style={{ height: "6px" }}>
                      <div className="progress-fill" style={{
                        width: `${item.percentage}%`,
                        backgroundColor: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Payment Method Breakdown */}
        <div className="chart-card animate-fade-in-up delay-375">
          <h2 className="text-lg font-bold mb-1" style={{ color: "var(--text-primary)" }}>Payment Methods</h2>
          <p className="text-xs mb-6" style={{ color: "var(--text-muted)" }}>How you pay for things</p>

          {paymentSplit.length === 0 ? (
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>No data</p>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3 mb-6">
                {paymentSplit.slice(0, 4).map((item, i) => (
                  <div key={item.label} className="p-4 rounded-xl"
                    style={{ backgroundColor: "var(--bg-elevated)", border: "1px solid var(--border-primary)" }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                      style={{ backgroundColor: `color-mix(in srgb, ${CATEGORY_COLORS[i % CATEGORY_COLORS.length]} 15%, transparent)` }}>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"
                        style={{ color: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }}>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                          d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                    </div>
                    <p className="text-sm font-semibold truncate" style={{ color: "var(--text-primary)" }}>{item.label}</p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{item.percentage.toFixed(0)}% of spending</p>
                    <p className="text-sm font-bold mt-1" style={{ color: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }}>
                      {formatCurrency(item.amount, displayCurrency)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="space-y-3">
                {paymentSplit.map((item, i) => (
                  <div key={`pbar-${item.label}`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>{item.label}</span>
                      <span className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>{item.percentage.toFixed(0)}%</span>
                    </div>
                    <div className="progress-track" style={{ height: "6px" }}>
                      <div className="progress-fill" style={{
                        width: `${item.percentage}%`,
                        backgroundColor: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Top Expenses & Currency Distribution */}
      <div className="grid gap-4 lg:grid-cols-3 mb-8">
        {/* Top Expenses */}
        <div className="chart-card lg:col-span-2 animate-fade-in-up delay-375">
          <h2 className="text-lg font-bold mb-1" style={{ color: "var(--text-primary)" }}>Top Expenses</h2>
          <p className="text-xs mb-4" style={{ color: "var(--text-muted)" }}>Your largest individual transactions</p>

          {topExpenses.length === 0 ? (
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>No expenses yet.</p>
          ) : (
            <div className="space-y-3">
              {topExpenses.map((expense, i) => {
                const date = parseExpenseDate(expense);
                const barWidth = highestSingle > 0 ? ((expense.amount || 0) / highestSingle) * 100 : 0;
                return (
                  <div key={expense._id ?? `${i}-${expense.amount}`} className="flex items-center gap-4">
                    <span className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                      style={{
                        backgroundColor: `color-mix(in srgb, ${CATEGORY_COLORS[i % CATEGORY_COLORS.length]} 15%, transparent)`,
                        color: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
                      }}>
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>
                          {expense.category || "Uncategorized"}
                        </span>
                        <span className="text-sm font-bold ml-2" style={{ color: "var(--text-primary)" }}>
                          {formatCurrency(expense.amount || 0, expense.currency || displayCurrency)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex-1 mr-3">
                          <div className="progress-track" style={{ height: "4px" }}>
                            <div className="progress-fill" style={{
                              width: `${barWidth}%`,
                              backgroundColor: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
                            }} />
                          </div>
                        </div>
                        <span className="text-[10px] flex-shrink-0" style={{ color: "var(--text-muted)" }}>
                          {date?.toLocaleDateString("en-US", { month: "short", day: "numeric" }) ?? "—"}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Currency Distribution */}
        <div className="chart-card animate-fade-in-up delay-450">
          <h2 className="text-lg font-bold mb-1" style={{ color: "var(--text-primary)" }}>Currencies Used</h2>
          <p className="text-xs mb-6" style={{ color: "var(--text-muted)" }}>Transaction distribution by currency</p>

          {currencyDist.length === 0 ? (
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>No data</p>
          ) : (
            <div className="space-y-4">
              {currencyDist.map((item, i) => (
                <div key={item.label} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold"
                    style={{
                      backgroundColor: `color-mix(in srgb, ${CATEGORY_COLORS[i % CATEGORY_COLORS.length]} 15%, transparent)`,
                      color: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
                    }}>
                    {item.label.slice(0, 3)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{item.label}</span>
                      <span className="text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>
                        {item.count} txn{item.count !== 1 ? "s" : ""}
                      </span>
                    </div>
                    <div className="progress-track" style={{ height: "6px" }}>
                      <div className="progress-fill" style={{
                        width: `${item.pct}%`,
                        backgroundColor: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
                      }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Insights Banner */}
      <div className="ai-banner animate-fade-in-up delay-450">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: "rgba(34, 211, 238, 0.15)" }}>
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" style={{ color: "var(--accent-cyan)" }}>
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>AI Spending Insights</p>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            {expenses.length > 0
              ? `You've made ${expenses.length} transactions totaling ${formatCurrency(totalSpend, displayCurrency)}. Your highest spending category is "${categorySplit[0]?.label ?? "N/A"}" at ${categorySplit[0]?.percentage.toFixed(0) ?? 0}%.`
              : "Start adding expenses to unlock AI-powered spending insights and recommendations."}
          </p>
        </div>
      </div>
    </div>
  );
}
