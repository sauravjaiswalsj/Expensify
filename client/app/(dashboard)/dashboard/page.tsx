"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { ApiError, expenseApi } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { CURRENCIES, type Expense, type Currency } from "@/types";

const QUICK_ACTIONS = [
  {
    href: "/expenses/add",
    label: "Add Expense",
    description: "Record a new transaction",
    color: "bg-brand-500",
    icon: (
      <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
    ),
  },
];

type DashboardStat = {
  label: string;
  value: string;
  sub: string;
  icon: ReactNode;
  bg: string;
};

type PeriodKey = "7d" | "30d" | "90d" | "custom";

type SplitEntry = {
  label: string;
  amount: number;
  percentage: number;
};

const PERIOD_OPTIONS: { key: PeriodKey; label: string; days?: number }[] = [
  { key: "7d", label: "7D", days: 7 },
  { key: "30d", label: "30D", days: 30 },
  { key: "90d", label: "90D", days: 90 },
  { key: "custom", label: "Custom" },
];

function parseExpenseDate(expense: Expense): Date | null {
  const raw = expense.date || expense.createdAt || expense.updatedAt;
  if (!raw) return null;
  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function formatCurrency(amount: number, currency: Currency): string {
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    const symbol = CURRENCIES.find((c) => c.code === currency)?.symbol ?? currency;
    return `${symbol}${amount.toFixed(2)}`;
  }
}

function getApiErrorMessage(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.status === 401) return "Your session has expired. Please sign in again.";
    if (err.status === 403) return "You are not allowed to view these expenses.";
    return err.message || "Failed to load expenses.";
  }
  return err instanceof Error ? err.message : "Failed to load expenses.";
}

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

function toInputDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseInputDate(value: string): Date | null {
  if (!value) return null;
  const d = new Date(`${value}T00:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

function getPresetRange(days: number): { start: Date; end: Date } {
  const end = endOfDay(new Date());
  const start = startOfDay(new Date());
  start.setDate(start.getDate() - (days - 1));
  return { start, end };
}

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

export default function DashboardPage() {
  const { username } = useAuth();
  const initialRange = useMemo(() => getPresetRange(30), []);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<PeriodKey>("30d");
  const [customStart, setCustomStart] = useState<string>(toInputDate(initialRange.start));
  const [customEnd, setCustomEnd] = useState<string>(toInputDate(initialRange.end));

  const loadExpenses = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await expenseApi.getAll();
      setExpenses(Array.isArray(response?.methodBody) ? response.methodBody : []);
    } catch (err: unknown) {
      if (err instanceof ApiError && err.status === 404) {
        setExpenses([]);
      } else {
        setError(getApiErrorMessage(err));
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadExpenses();
  }, [loadExpenses]);

  const rangeInfo = useMemo(() => {
    if (period !== "custom") {
      const selected = PERIOD_OPTIONS.find((option) => option.key === period);
      const days = selected?.days ?? 30;
      const range = getPresetRange(days);
      return {
        start: range.start,
        end: range.end,
        valid: true,
        label: `Last ${days} days`,
        message: "",
      };
    }

    const start = parseInputDate(customStart);
    const end = parseInputDate(customEnd);
    if (!start || !end) {
      return {
        start: null,
        end: null,
        valid: false,
        label: "Custom",
        message: "Select both start and end dates.",
      };
    }

    const normalizedStart = startOfDay(start);
    const normalizedEnd = endOfDay(end);
    if (normalizedStart > normalizedEnd) {
      return {
        start: null,
        end: null,
        valid: false,
        label: "Custom",
        message: "Start date must be before or equal to end date.",
      };
    }

    return {
      start: normalizedStart,
      end: normalizedEnd,
      valid: true,
      label: `${customStart} to ${customEnd}`,
      message: "",
    };
  }, [period, customStart, customEnd]);

  const filteredExpenses = useMemo(() => {
    if (!rangeInfo.valid || !rangeInfo.start || !rangeInfo.end) return [];
    return expenses.filter((expense) => {
      const date = parseExpenseDate(expense);
      if (!date) return false;
      return date >= rangeInfo.start && date <= rangeInfo.end;
    });
  }, [expenses, rangeInfo]);

  const sortedExpenses = useMemo(() => {
    return [...filteredExpenses].sort((a, b) => {
      const dateA = parseExpenseDate(a)?.getTime() ?? 0;
      const dateB = parseExpenseDate(b)?.getTime() ?? 0;
      return dateB - dateA;
    });
  }, [filteredExpenses]);

  const currenciesInRange = useMemo(() => {
    return Array.from(new Set(filteredExpenses.map((expense) => expense.currency).filter(Boolean))) as Currency[];
  }, [filteredExpenses]);

  const displayCurrency = currenciesInRange.length === 1 ? currenciesInRange[0] : null;

  const stats = useMemo<DashboardStat[]>(() => {
    const totalAmount = filteredExpenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);
    const averageAmount = filteredExpenses.length > 0 ? totalAmount / filteredExpenses.length : 0;
    const categoryCount = new Set(filteredExpenses.map((expense) => expense.category).filter(Boolean)).size;

    const totalLabel = displayCurrency
      ? formatCurrency(totalAmount, displayCurrency)
      : totalAmount.toFixed(2);
    const averageLabel = displayCurrency
      ? formatCurrency(averageAmount, displayCurrency)
      : averageAmount.toFixed(2);

    return [
      {
        label: "Total Spend",
        value: totalLabel,
        sub: displayCurrency ? rangeInfo.label : `${rangeInfo.label} (mixed currencies)`,
        icon: (
          <svg className="w-5 h-5 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        ),
        bg: "bg-brand-50",
      },
      {
        label: "Average Spend",
        value: averageLabel,
        sub: "Per transaction",
        icon: (
          <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        ),
        bg: "bg-emerald-50",
      },
      {
        label: "Categories",
        value: String(categoryCount),
        sub: "Tracked",
        icon: (
          <svg className="w-5 h-5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
        ),
        bg: "bg-violet-50",
      },
      {
        label: "Transactions",
        value: String(filteredExpenses.length),
        sub: rangeInfo.label,
        icon: (
          <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        ),
        bg: "bg-amber-50",
      },
    ];
  }, [displayCurrency, filteredExpenses, rangeInfo.label]);

  const monthlyTrend = useMemo(() => {
    const monthly = new Map<string, { label: string; amount: number; sortValue: number }>();

    filteredExpenses.forEach((expense) => {
      const date = parseExpenseDate(expense);
      if (!date) return;
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      const sortValue = date.getFullYear() * 100 + date.getMonth();
      const label = date.toLocaleDateString("en-IN", { month: "short", year: "2-digit" });
      const existing = monthly.get(key);
      if (existing) {
        existing.amount += expense.amount || 0;
      } else {
        monthly.set(key, { label, amount: expense.amount || 0, sortValue });
      }
    });

    return Array.from(monthly.values())
      .sort((a, b) => a.sortValue - b.sortValue)
      .slice(-12);
  }, [filteredExpenses]);

  const maxTrendValue = useMemo(() => {
    return monthlyTrend.reduce((max, point) => Math.max(max, point.amount), 0);
  }, [monthlyTrend]);

  const categorySplit = useMemo(() => buildSplitData(filteredExpenses, (expense) => expense.category), [filteredExpenses]);
  const paymentSplit = useMemo(() => buildSplitData(filteredExpenses, (expense) => expense.paymentType), [filteredExpenses]);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">
          Good day, <span className="text-brand-600">{username}</span> 👋
        </h1>
        <p className="text-slate-500 mt-1 text-sm">Here&apos;s an overview of your finances</p>
      </div>

      <div className="card p-5 mb-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Period</h2>
            <p className="text-xs text-slate-500 mt-1">Filter stats and charts by date range</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {PERIOD_OPTIONS.map((option) => (
              <button
                key={option.key}
                type="button"
                onClick={() => setPeriod(option.key)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                  period === option.key
                    ? "bg-brand-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {period === "custom" && (
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:max-w-xl">
            <div>
              <label htmlFor="custom-start-date" className="text-xs font-medium text-slate-600">Start date</label>
              <input
                id="custom-start-date"
                type="date"
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-400"
                value={customStart}
                onChange={(event) => setCustomStart(event.target.value)}
              />
            </div>
            <div>
              <label htmlFor="custom-end-date" className="text-xs font-medium text-slate-600">End date</label>
              <input
                id="custom-end-date"
                type="date"
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-400"
                value={customEnd}
                onChange={(event) => setCustomEnd(event.target.value)}
              />
            </div>
          </div>
        )}

        {!rangeInfo.valid && (
          <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
            {rangeInfo.message}
          </p>
        )}
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <p>{error}</p>
          <button
            onClick={() => void loadExpenses()}
            className="mt-2 inline-flex items-center rounded-lg border border-red-300 px-3 py-1.5 text-xs font-medium hover:bg-red-100"
          >
            Retry
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 mb-8 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="card p-5">
            <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${stat.bg}`}>
              {stat.icon}
            </div>
            <p className="text-2xl font-bold text-slate-900">{loading ? "..." : stat.value}</p>
            <p className="mt-0.5 text-sm font-medium text-slate-700">{stat.label}</p>
            <p className="mt-0.5 text-xs text-slate-400">{stat.sub}</p>
          </div>
        ))}
      </div>

      <div className="mb-8">
        <h2 className="mb-3 text-base font-semibold text-slate-900">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          {QUICK_ACTIONS.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="group flex items-center gap-3 rounded-xl border border-slate-100 bg-white px-5 py-3 shadow-sm transition-all hover:border-brand-200 hover:shadow-md"
            >
              <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${action.color}`}>
                {action.icon}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900 group-hover:text-brand-700">{action.label}</p>
                <p className="text-xs text-slate-400">{action.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="mb-8 grid gap-4 lg:grid-cols-3">
        <div className="card p-5 lg:col-span-2">
          <h2 className="text-sm font-semibold text-slate-900">Monthly Trend</h2>
          <p className="mt-1 text-xs text-slate-500">Total spend per month ({rangeInfo.label})</p>

          {loading && <p className="mt-6 text-sm text-slate-500">Loading chart...</p>}
          {!loading && monthlyTrend.length === 0 && (
            <p className="mt-6 text-sm text-slate-500">No data available for the selected period.</p>
          )}

          {!loading && monthlyTrend.length > 0 && (
            <div className="mt-5">
              <div className="flex h-40 items-end gap-2">
                {monthlyTrend.map((point) => {
                  const height = maxTrendValue > 0 ? Math.max((point.amount / maxTrendValue) * 100, 4) : 0;
                  return (
                    <div key={point.label} className="flex min-w-0 flex-1 flex-col items-center gap-1">
                      <div
                        className="w-full rounded-t-md bg-brand-500/80 transition-colors hover:bg-brand-500"
                        style={{ height: `${height}%` }}
                        title={displayCurrency ? formatCurrency(point.amount, displayCurrency) : point.amount.toFixed(2)}
                      />
                      <span className="w-full truncate text-center text-[10px] text-slate-500">{point.label}</span>
                    </div>
                  );
                })}
              </div>
              {!displayCurrency && (
                <p className="mt-3 text-[11px] text-slate-500">Mixed currencies detected. Values are unconverted totals.</p>
              )}
            </div>
          )}
        </div>

        <div className="card p-5">
          <h2 className="text-sm font-semibold text-slate-900">Category Split</h2>
          <p className="mt-1 text-xs text-slate-500">Top categories in selected period</p>

          {!loading && categorySplit.length === 0 && (
            <p className="mt-6 text-sm text-slate-500">No category data to show.</p>
          )}

          <div className="mt-4 space-y-3">
            {categorySplit.map((item, index) => (
              <div key={`${item.label}-${index}`}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-700">{item.label}</span>
                  <span className="text-slate-500">{item.percentage.toFixed(1)}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-violet-500"
                    style={{ width: `${item.percentage}%` }}
                    title={displayCurrency ? formatCurrency(item.amount, displayCurrency) : item.amount.toFixed(2)}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-5 lg:col-span-3">
          <h2 className="text-sm font-semibold text-slate-900">Payment Method Split</h2>
          <p className="mt-1 text-xs text-slate-500">Distribution by payment type</p>

          {!loading && paymentSplit.length === 0 && (
            <p className="mt-6 text-sm text-slate-500">No payment method data to show.</p>
          )}

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {paymentSplit.map((item, index) => (
              <div key={`${item.label}-${index}`} className="rounded-lg border border-slate-100 p-3">
                <div className="mb-2 flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-700">{item.label}</span>
                  <span className="text-slate-500">{item.percentage.toFixed(1)}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-emerald-500"
                    style={{ width: `${item.percentage}%` }}
                    title={displayCurrency ? formatCurrency(item.amount, displayCurrency) : item.amount.toFixed(2)}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card p-6 mb-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-900">Recent Expenses</h2>
          <button
            onClick={() => void loadExpenses()}
            className="text-xs font-medium text-brand-600 hover:text-brand-700"
            disabled={loading}
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {!loading && sortedExpenses.length === 0 && (
          <div className="rounded-xl border border-slate-200 border-dashed p-5 text-sm text-slate-500">
            No expenses found for the selected period.
          </div>
        )}

        {sortedExpenses.length > 0 && (
          <div className="space-y-3">
            {sortedExpenses.slice(0, 8).map((expense) => {
              const date = parseExpenseDate(expense);
              return (
                <div
                  key={expense._id ?? `${expense.category}-${expense.amount}-${expense.createdAt ?? ""}`}
                  className="flex flex-col gap-2 rounded-xl border border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{expense.category || "Uncategorized"}</p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {expense.description || "No description"} · {expense.paymentType || "Unknown payment type"}
                    </p>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-sm font-semibold text-slate-900">
                      {formatCurrency(expense.amount || 0, expense.currency || "INR")}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-400">
                      {date
                        ? date.toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })
                        : "Date not available"}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
