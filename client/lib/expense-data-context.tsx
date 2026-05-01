"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { ApiError, expenseApi } from "@/lib/api";
import type { Expense, ExpenseSummary, ApiResponse } from "@/types";

interface ExpenseDataContextValue {
  expenses: Expense[];
  summary: ExpenseSummary | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

const ExpenseDataContext = createContext<ExpenseDataContextValue | null>(null);

function parseExpenseDate(expense: Expense): Date | null {
  const raw = expense.date || expense.createdAt || expense.updatedAt;
  if (!raw) return null;
  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function buildSummary(expenses: Expense[]): ExpenseSummary {
  const currentMonth = new Date();
  currentMonth.setDate(1);
  currentMonth.setHours(0, 0, 0, 0);

  const totalSpend = expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);
  const monthlySpend = expenses
    .filter((expense) => {
      const date = parseExpenseDate(expense);
      if (!date) return false;
      return date.getFullYear() === currentMonth.getFullYear() && date.getMonth() === currentMonth.getMonth();
    })
    .reduce((sum, expense) => sum + (expense.amount || 0), 0);
  const categoryCount = new Set(
    expenses
      .map((expense) => expense.category?.trim().toLowerCase())
      .filter((category): category is string => Boolean(category))
  ).size;

  return {
    totalSpend,
    monthlySpend,
    categoryCount,
    transactionCount: expenses.length,
  };
}

export function ExpenseDataProvider({ children }: { children: ReactNode }) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [summary, setSummary] = useState<ExpenseSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fetched, setFetched] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const expensesResponse: ApiResponse<Expense[]> = await expenseApi.getAll();
      const nextExpenses = expensesResponse.data ?? expensesResponse.methodBody ?? [];
      const normalizedExpenses = Array.isArray(nextExpenses) ? nextExpenses : [];
      setExpenses(normalizedExpenses);
      setSummary(buildSummary(normalizedExpenses));
    } catch (err: unknown) {
      if (err instanceof ApiError && err.status === 404) {
        setExpenses([]);
        setSummary(null);
      } else {
        setError(
          err instanceof ApiError
            ? err.message
            : err instanceof Error
              ? err.message
              : "Failed to load expenses."
        );
      }
    } finally {
      setLoading(false);
      setFetched(true);
    }
  }, []);

  useEffect(() => {
    if (!fetched) {
      void refresh();
    }
  }, [fetched, refresh]);

  return (
    <ExpenseDataContext.Provider value={{ expenses, summary, loading, error, refresh }}>
      {children}
    </ExpenseDataContext.Provider>
  );
}

export function useExpenseData() {
  const ctx = useContext(ExpenseDataContext);
  if (!ctx) throw new Error("useExpenseData must be used within ExpenseDataProvider");
  return ctx;
}
